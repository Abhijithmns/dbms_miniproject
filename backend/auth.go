package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type authUser struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

func (s *server) currentUser(r *http.Request) (authUser, bool) {
	c, err := r.Cookie("getit_session")
	if err != nil {
		return authUser{}, false
	}
	p := strings.Split(c.Value, ".")
	if len(p) != 2 {
		return authUser{}, false
	}
	mac := hmac.New(sha256.New, []byte(env("SESSION_SECRET", "development-secret")))
	_, _ = mac.Write([]byte(p[0]))
	if !hmac.Equal([]byte(hex.EncodeToString(mac.Sum(nil))), []byte(p[1])) {
		return authUser{}, false
	}
	raw, err := base64.RawURLEncoding.DecodeString(p[0])
	if err != nil {
		return authUser{}, false
	}
	var payload struct {
		authUser
		Exp int64 `json:"exp"`
	}
	if json.Unmarshal(raw, &payload) != nil || payload.Exp < time.Now().Unix() {
		return authUser{}, false
	}
	return payload.authUser, true
}
func setSession(w http.ResponseWriter, user authUser) {
	raw, _ := json.Marshal(struct {
		authUser
		Exp int64 `json:"exp"`
	}{user, time.Now().Add(24 * time.Hour).Unix()})
	encoded := base64.RawURLEncoding.EncodeToString(raw)
	mac := hmac.New(sha256.New, []byte(env("SESSION_SECRET", "development-secret")))
	_, _ = mac.Write([]byte(encoded))
	http.SetCookie(w, &http.Cookie{Name: "getit_session", Value: encoded + "." + hex.EncodeToString(mac.Sum(nil)), Path: "/", HttpOnly: true, SameSite: http.SameSiteLaxMode, MaxAge: 86400})
}
func (s *server) me(w http.ResponseWriter, r *http.Request) {
	user, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "not authenticated")
		return
	}
	jsonJSON(w, 200, user)
}
func (s *server) logout(w http.ResponseWriter, _ *http.Request) {
	http.SetCookie(w, &http.Cookie{Name: "getit_session", Value: "", Path: "/", MaxAge: -1, HttpOnly: true})
	jsonJSON(w, 200, map[string]string{"message": "logged out"})
}
func (s *server) register(w http.ResponseWriter, r *http.Request) {
	var req struct{ Username, Email, Password string }
	if json.NewDecoder(r.Body).Decode(&req) != nil || len(clean(req.Username)) < 3 || len(req.Password) < 8 || !strings.Contains(req.Email, "@") {
		errorJSON(w, 400, "username, email, and password are required")
		return
	}
	result, err := s.db.ExecContext(r.Context(), "INSERT INTO app_user(username,email_hash,password_hash,profile_image) VALUES(?,?,SHA2(?,256),?)", clean(req.Username), hashText(strings.ToLower(clean(req.Email))), req.Password, "🦊")
	if err != nil {
		errorJSON(w, 409, "username or email already exists")
		return
	}
	id, _ := result.LastInsertId()
	user := authUser{ID: id, Username: clean(req.Username), Role: "user"}
	setSession(w, user)
	jsonJSON(w, 201, user)
}
func (s *server) login(w http.ResponseWriter, r *http.Request) {
	var req struct{ Username, Password string }
	_ = json.NewDecoder(r.Body).Decode(&req)
	var user authUser
	var stored string
	var moderator *int64
	err := s.db.QueryRowContext(r.Context(), "SELECT user_id,username,password_hash,mod_subreddit_id FROM app_user WHERE username=?", req.Username).Scan(&user.ID, &user.Username, &stored, &moderator)
	if err != nil || stored != hashText(req.Password) {
		errorJSON(w, 401, "invalid username or password")
		return
	}
	user.Role = "user"
	if moderator != nil {
		user.Role = "moderator"
	}
	setSession(w, user)
	jsonJSON(w, 200, user)
}
func hashText(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}
