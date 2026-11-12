package main

import (
	"bufio"
	"fmt"
	"io"
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
	_ = conn.SetDeadline(time.Now().Add(2 * time.Second))

	request := fmt.Sprintf("*%d\r\n", len(parts))
	for _, part := range parts {
		request += fmt.Sprintf("$%d\r\n%s\r\n", len(part), part)
	}
	if _, err = conn.Write([]byte(request)); err != nil {
		return "", err
	}

	reader := bufio.NewReader(conn)
	firstLine, err := reader.ReadString('\n')
	if err != nil {
		return "", err
	}
	trimmedFirst := strings.TrimSpace(firstLine)

	if strings.HasPrefix(trimmedFirst, "*") {
		// Array response: *<count>
		count, _ := strconv.Atoi(trimmedFirst[1:])
		var sb strings.Builder
		sb.WriteString(trimmedFirst)
		sb.WriteString("\r\n")
		for i := 0; i < count; i++ {
			lineLen, err := reader.ReadString('\n')
			if err != nil {
				break
			}
			sb.WriteString(lineLen)
			trimmedLineLen := strings.TrimSpace(lineLen)
			if strings.HasPrefix(trimmedLineLen, "$") {
				bLen, _ := strconv.Atoi(trimmedLineLen[1:])
				if bLen >= 0 {
					data := make([]byte, bLen+2) // data + \r\n
					if _, err := io.ReadFull(reader, data); err == nil {
						sb.Write(data)
					}
				}
			}
		}
		return sb.String(), nil
	} else if strings.HasPrefix(trimmedFirst, "$") {
		// Single bulk string: $<len>
		bLen, _ := strconv.Atoi(trimmedFirst[1:])
		if bLen < 0 {
			return trimmedFirst, nil
		}
		data := make([]byte, bLen+2)
		_, _ = io.ReadFull(reader, data)
		return trimmedFirst + "\r\n" + string(data), nil
	}
	return trimmedFirst, nil
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

	postIDs := []any{}
	for _, line := range strings.Split(response, "\r\n") {
		line = strings.TrimSpace(line)
		if line != "" && !strings.HasPrefix(line, "$") && !strings.HasPrefix(line, "*") {
			if id, err := strconv.ParseInt(line, 10, 64); err == nil && id > 0 {
				postIDs = append(postIDs, id)
			}
		}
	}

	if len(postIDs) == 0 {
		jsonJSON(w, 200, []any{})
		return
	}

	placeholders := make([]string, len(postIDs))
	for i := range postIDs {
		placeholders[i] = "?"
	}

	query := fmt.Sprintf(`
		SELECT p.post_id, p.title, COALESCE(p.body,''), COALESCE(p.flair,''),
		       s.name, p.subreddit_id, u.username, p.created_at, p.karma,
		       (SELECT COUNT(*) FROM comment c WHERE c.post_id=p.post_id)
		FROM post p
		JOIN subreddit s ON s.subreddit_id=p.subreddit_id
		JOIN app_user u ON u.user_id=p.user_id
		WHERE p.post_id IN (%s)
		ORDER BY p.created_at DESC
	`, strings.Join(placeholders, ","))

	rows, err := s.db.QueryContext(r.Context(), query, postIDs...)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()

	out := []map[string]any{}
	for rows.Next() {
		var id, subId, karma, count int64
		var title, body, flair, sub, author string
		var created time.Time
		if rows.Scan(&id, &title, &body, &flair, &sub, &subId, &author, &created, &karma, &count) == nil {
			pidStr := strconv.FormatInt(id, 10)
			out = append(out, map[string]any{
				"id":          id,
				"postId":      id,
				"slug":        pidStr,
				"title":       title,
				"body":        body,
				"excerpt":     body,
				"flair":       flair,
				"subgetit":    sub,
				"subredditId": subId,
				"author":      author,
				"createdAt":   created,
				"karma":       karma,
				"comments":    count,
				"saved":       true,
			})
		}
	}
	jsonJSON(w, 200, out)
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
