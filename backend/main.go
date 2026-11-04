package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type server struct {
	db        *sql.DB
	redisAddr string
}

func main() {
	loadEnv(".env")
	db, err := sql.Open("mysql", env("MYSQL_DSN", "root:@tcp(127.0.0.1:3306)/dbms_miniproject?parseTime=true&charset=utf8mb4"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	s := &server{db: db, redisAddr: env("REDIS_ADDR", "127.0.0.1:6379")}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", s.health)
	mux.HandleFunc("GET /api/auth/me", s.me)
	mux.HandleFunc("POST /api/auth/register", s.register)
	mux.HandleFunc("POST /api/auth/login", s.login)
	mux.HandleFunc("POST /api/auth/logout", s.logout)
	mux.HandleFunc("GET /api/posts", s.posts)
	mux.HandleFunc("POST /api/posts", s.createPost)
	mux.HandleFunc("PUT /api/posts/{id}", s.updatePost)
	mux.HandleFunc("DELETE /api/posts/{id}", s.deletePost)
	mux.HandleFunc("GET /api/posts/{slug}/comments", s.comments)
	mux.HandleFunc("POST /api/posts/{slug}/comments", s.createComment)
	mux.HandleFunc("POST /api/posts/{slug}/vote", s.votePost)
	mux.HandleFunc("POST /api/comments/{id}/vote", s.voteComment)
	mux.HandleFunc("PUT /api/comments/{id}", s.updateComment)
	mux.HandleFunc("DELETE /api/comments/{id}", s.deleteComment)
	mux.HandleFunc("GET /api/profile/{username}", s.profile)
	mux.HandleFunc("PUT /api/profile/{username}", s.updateProfile)
	mux.HandleFunc("GET /api/subgetits", s.subgetits)
	mux.HandleFunc("POST /api/subgetits/{id}/join", s.joinSubgetit)
	mux.HandleFunc("DELETE /api/subgetits/{id}/join", s.leaveSubgetit)
	mux.HandleFunc("GET /api/awards", s.awards)
	mux.HandleFunc("POST /api/comments/{id}/award", s.awardComment)
	mux.HandleFunc("GET /api/messages", s.messages)
	mux.HandleFunc("POST /api/messages", s.sendMessage)
	mux.HandleFunc("POST /api/messages/{id}/read", s.readMessage)
	mux.HandleFunc("GET /api/cache/health", s.redisHealth)
	mux.HandleFunc("GET /api/redis/saved-posts", s.savedPosts)
	mux.HandleFunc("POST /api/redis/saved-posts/{postId}", s.savePost)
	mux.HandleFunc("DELETE /api/redis/saved-posts/{postId}", s.unsavePost)
	log.Printf("getit API listening on %s", env("API_ADDR", ":8080"))
	log.Fatal(http.ListenAndServe(env("API_ADDR", ":8080"), cors(mux)))
}

func (s *server) health(w http.ResponseWriter, r *http.Request) {
	if err := s.db.PingContext(r.Context()); err != nil {
		errorJSON(w, 503, "database unavailable")
		return
	}
	jsonJSON(w, 200, map[string]string{"status": "ok", "database": "mysql"})
}
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", env("WEB_ORIGIN", "http://localhost:3000"))
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		if r.Method == "OPTIONS" {
			w.WriteHeader(204)
			return
		}
		next.ServeHTTP(w, r)
	})
}
func jsonJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
func errorJSON(w http.ResponseWriter, status int, message string) {
	jsonJSON(w, status, map[string]string{"error": message})
}
func contextTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(ctx, 5*time.Second)
}
func clean(value string) string { return strings.TrimSpace(value) }
