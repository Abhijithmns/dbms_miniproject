package main

import (
	"bufio"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// A small RESP client keeps the Redis feature dependency-free.
func (s *server) redisCommand(parts ...string) (string, error) {
	conn, err := net.DialTimeout("tcp", s.redisAddr, 2*time.Second)
	if err != nil {
		return "", err
	}
	defer conn.Close()
	request := fmt.Sprintf("*%d\r\n", len(parts))
	for _, part := range parts {
		request += fmt.Sprintf("$%d\r\n%s\r\n", len(part), part)
	}
	if _, err = conn.Write([]byte(request)); err != nil {
		return "", err
	}
	return bufio.NewReader(conn).ReadString('\n')
}

func (s *server) redisHealth(w http.ResponseWriter, _ *http.Request) {
	response, err := s.redisCommand("PING")
	if err != nil || !strings.Contains(response, "PONG") {
		errorJSON(w, 503, "redis unavailable")
		return
	}
	jsonJSON(w, 200, map[string]string{"status": "ok", "database": "redis"})
}

func (s *server) savedPosts(w http.ResponseWriter, r *http.Request) {
	user, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	response, err := s.redisCommand("SMEMBERS", "getit:saved_posts:"+strconv.FormatInt(user.ID, 10))
	if err != nil {
		errorJSON(w, 503, "redis unavailable")
		return
	}
	jsonJSON(w, 200, map[string]string{"redisResponse": response})
}

func (s *server) savePost(w http.ResponseWriter, r *http.Request) {
	user, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	if _, err := strconv.ParseInt(r.PathValue("postId"), 10, 64); err != nil {
		errorJSON(w, 400, "invalid post id")
		return
	}
	_, err := s.redisCommand("SADD", "getit:saved_posts:"+strconv.FormatInt(user.ID, 10), r.PathValue("postId"))
	if err != nil {
		errorJSON(w, 503, "redis unavailable")
		return
	}
	jsonJSON(w, 201, map[string]any{"saved": true, "postId": r.PathValue("postId")})
}

func (s *server) unsavePost(w http.ResponseWriter, r *http.Request) {
	user, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	_, err := s.redisCommand("SREM", "getit:saved_posts:"+strconv.FormatInt(user.ID, 10), r.PathValue("postId"))
	if err != nil {
		errorJSON(w, 503, "redis unavailable")
		return
	}
	jsonJSON(w, 200, map[string]any{"saved": false, "postId": r.PathValue("postId")})
}
