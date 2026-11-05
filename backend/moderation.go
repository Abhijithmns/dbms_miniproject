package main

import (
	"encoding/json"
	"net/http"
)

func (s *server) requireModerator(r *http.Request, w http.ResponseWriter) (authUser, bool) {
	user, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, http.StatusUnauthorized, "login required")
		return authUser{}, false
	}
	if user.Role != "moderator" {
		errorJSON(w, http.StatusForbidden, "moderator access required")
		return authUser{}, false
	}
	return user, true
}

func (s *server) moderationUsers(w http.ResponseWriter, r *http.Request) {
	if _, ok := s.requireModerator(r, w); !ok {
		return
	}
	rows, err := s.db.QueryContext(r.Context(), `SELECT user_id, username, karma, joined_at,
       CASE WHEN mod_subreddit_id IS NULL THEN 'user' ELSE 'moderator' END AS role,
       mod_subreddit_id, mod_since_at
       FROM app_user ORDER BY username`)
	if err != nil {
		errorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()
	result := make([]map[string]any, 0)
	for rows.Next() {
		var id, karma int64
		var username, role string
		var joined any
		var subredditID, since any
		if err := rows.Scan(&id, &username, &karma, &joined, &role, &subredditID, &since); err != nil {
			errorJSON(w, 500, err.Error())
			return
		}
		result = append(result, map[string]any{"userId": id, "username": username, "karma": karma, "joinedAt": joined, "role": role, "moderatorSubredditId": subredditID, "moderatorSinceAt": since})
	}
	jsonJSON(w, http.StatusOK, result)
}

func (s *server) changeUserRole(w http.ResponseWriter, r *http.Request) {
	if _, ok := s.requireModerator(r, w); !ok {
		return
	}
	var request struct {
		Role        string `json:"role"`
		SubredditID *int64 `json:"subredditId"`
	}
	if json.NewDecoder(r.Body).Decode(&request) != nil || (request.Role != "user" && request.Role != "moderator") {
		errorJSON(w, 400, "role must be user or moderator")
		return
	}
	if request.Role == "moderator" {
		if request.SubredditID == nil || *request.SubredditID == 0 {
			errorJSON(w, 400, "subredditId is required for moderators")
			return
		}
		_, err := s.db.ExecContext(r.Context(), "UPDATE app_user SET mod_subreddit_id=?, mod_since_at=COALESCE(mod_since_at,CURRENT_TIMESTAMP) WHERE user_id=?", *request.SubredditID, r.PathValue("id"))
		if err != nil {
			errorJSON(w, 400, err.Error())
			return
		}
	} else {
		_, err := s.db.ExecContext(r.Context(), "UPDATE app_user SET mod_subreddit_id=NULL, mod_since_at=NULL WHERE user_id=?", r.PathValue("id"))
		if err != nil {
			errorJSON(w, 400, err.Error())
			return
		}
	}
	jsonJSON(w, 200, map[string]string{"message": "role updated"})
}
