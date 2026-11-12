package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func (s *server) posts(w http.ResponseWriter, r *http.Request) {
	subFilter := clean(r.URL.Query().Get("subreddit"))
	if subFilter == "" {
		subFilter = clean(r.URL.Query().Get("subgetit"))
	}
	sort := clean(r.URL.Query().Get("sort"))

	baseQuery := `
		SELECT p.post_id, p.title, COALESCE(p.body,''), COALESCE(p.flair,''),
		       s.name, p.subreddit_id, u.username, p.created_at, p.karma,
		       (SELECT COUNT(*) FROM comment c WHERE c.post_id=p.post_id)
		FROM post p
		JOIN subreddit s ON s.subreddit_id=p.subreddit_id
		JOIN app_user u ON u.user_id=p.user_id
	`
	orderClause := " ORDER BY p.created_at DESC"
	if sort == "top" || sort == "best" {
		orderClause = " ORDER BY p.karma DESC, p.created_at DESC"
	} else if sort == "hot" {
		orderClause = " ORDER BY (p.karma + (SELECT COUNT(*) FROM comment c WHERE c.post_id=p.post_id)) DESC, p.created_at DESC"
	} else if sort == "new" {
		orderClause = " ORDER BY p.created_at DESC"
	}

	var rows *sql.Rows
	var err error
	if subFilter != "" {
		subIdVal, _ := strconv.ParseInt(subFilter, 10, 64)
		rows, err = s.db.QueryContext(r.Context(), baseQuery+" WHERE (s.name = ? OR p.subreddit_id = ?)"+orderClause, subFilter, subIdVal)
	} else {
		rows, err = s.db.QueryContext(r.Context(), baseQuery+orderClause)
	}
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()

	userVotes := map[int64]string{}
	userJoins := map[int64]bool{}
	savedSet := map[string]bool{}
	if u, ok := s.currentUser(r); ok {
		if vRows, err := s.db.QueryContext(r.Context(), "SELECT post_id, vote_type FROM votes_on WHERE user_id=?", u.ID); err == nil {
			defer vRows.Close()
			for vRows.Next() {
				var pid int64
				var vt string
				if vRows.Scan(&pid, &vt) == nil {
					if vt == "upvote" {
						userVotes[pid] = "up"
					} else if vt == "downvote" {
						userVotes[pid] = "down"
					}
				}
			}
		}
		if jRows, err := s.db.QueryContext(r.Context(), "SELECT subreddit_id FROM joins WHERE user_id=?", u.ID); err == nil {
			defer jRows.Close()
			for jRows.Next() {
				var sid int64
				if jRows.Scan(&sid) == nil {
					userJoins[sid] = true
				}
			}
		}
		if resp, err := s.redisCommand("SMEMBERS", "getit:saved_posts:"+strconv.FormatInt(u.ID, 10)); err == nil {
			for _, line := range strings.Split(resp, "\r\n") {
				line = strings.TrimSpace(line)
				if line != "" && !strings.HasPrefix(line, "$") && !strings.HasPrefix(line, "*") {
					savedSet[line] = true
				}
			}
		}
	}

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
				"userVote":    userVotes[id],
				"joined":      userJoins[subId],
				"saved":       savedSet[pidStr],
			})
		}
	}
	jsonJSON(w, 200, out)
}
func (s *server) createPost(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	var q struct {
		Title, Body, Flair, Subgetit string
		SubredditID                  int64
	}
	_ = json.NewDecoder(r.Body).Decode(&q)
	title := clean(q.Title)
	if title == "" {
		errorJSON(w, 400, "title cannot be empty")
		return
	}
	subID := q.SubredditID
	if subID == 0 && q.Subgetit != "" {
		_ = s.db.QueryRowContext(r.Context(), "SELECT subreddit_id FROM subreddit WHERE name=?", q.Subgetit).Scan(&subID)
	}
	if subID == 0 {
		_ = s.db.QueryRowContext(r.Context(), "SELECT subreddit_id FROM subreddit ORDER BY subreddit_id ASC LIMIT 1").Scan(&subID)
	}
	res, err := s.db.ExecContext(r.Context(), "INSERT INTO post(title,body,flair,user_id,subreddit_id) VALUES(?,?,?,?,?)", title, q.Body, q.Flair, u.ID, subID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	id, _ := res.LastInsertId()
	jsonJSON(w, 201, map[string]any{"postId": id, "id": id, "slug": strconv.FormatInt(id, 10)})
}
func (s *server) postDetails(w http.ResponseWriter, r *http.Request) {
	id := s.postID(r.Context(), r.PathValue("slug"))
	var pId, karma, count, authorId, subId int64
	var title, body, flair, subName, author string
	var created time.Time
	err := s.db.QueryRowContext(r.Context(), `
		SELECT p.post_id, p.title, COALESCE(p.body,''), COALESCE(p.flair,''),
		       p.user_id, u.username, p.subreddit_id, s.name, p.created_at, p.karma,
		       (SELECT COUNT(*) FROM comment c WHERE c.post_id=p.post_id)
		FROM post p
		JOIN app_user u ON u.user_id=p.user_id
		JOIN subreddit s ON s.subreddit_id=p.subreddit_id
		WHERE p.post_id=?
	`, id).Scan(&pId, &title, &body, &flair, &authorId, &author, &subId, &subName, &created, &karma, &count)
	if err != nil {
		errorJSON(w, 404, "post not found")
		return
	}
	userVote := ""
	saved := false
	joined := false
	if u, ok := s.currentUser(r); ok {
		var vt string
		if s.db.QueryRowContext(r.Context(), "SELECT vote_type FROM votes_on WHERE user_id=? AND post_id=?", u.ID, id).Scan(&vt) == nil {
			if vt == "upvote" {
				userVote = "up"
			} else if vt == "downvote" {
				userVote = "down"
			}
		}
		var jID int64
		if s.db.QueryRowContext(r.Context(), "SELECT subreddit_id FROM joins WHERE user_id=? AND subreddit_id=?", u.ID, subId).Scan(&jID) == nil {
			joined = true
		}
		if resp, err := s.redisCommand("SISMEMBER", "getit:saved_posts:"+strconv.FormatInt(u.ID, 10), strconv.FormatInt(pId, 10)); err == nil && strings.Contains(resp, ":1") {
			saved = true
		}
	}
	jsonJSON(w, 200, map[string]any{
		"id":          pId,
		"postId":      pId,
		"slug":        strconv.FormatInt(pId, 10),
		"title":       title,
		"body":        body,
		"excerpt":     body,
		"flair":       flair,
		"authorId":    authorId,
		"author":      author,
		"subredditId": subId,
		"subgetit":    subName,
		"createdAt":   created,
		"karma":       karma,
		"comments":    count,
		"userVote":    userVote,
		"saved":       saved,
		"joined":      joined,
	})
}
func (s *server) updatePost(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	id := s.postID(r.Context(), r.PathValue("id"))
	var q struct{ Title, Body, Flair string }
	_ = json.NewDecoder(r.Body).Decode(&q)
	result, err := s.db.Exec("UPDATE post SET title=?,body=?,flair=? WHERE post_id=? AND user_id=?", clean(q.Title), q.Body, q.Flair, id, u.ID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		errorJSON(w, 403, "you cannot edit this post")
		return
	}
	jsonJSON(w, 200, map[string]string{"message": "post updated"})
}
func (s *server) deletePost(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	id := s.postID(r.Context(), r.PathValue("id"))
	result, err := s.db.Exec("DELETE FROM post WHERE post_id=? AND user_id=?", id, u.ID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		errorJSON(w, 403, "you cannot delete this post")
		return
	}
	jsonJSON(w, 200, map[string]string{"message": "post deleted"})
}
func (s *server) postID(ctx context.Context, slug string) int64 {
	if n, err := strconv.ParseInt(slug, 10, 64); err == nil {
		return n
	}
	rows, err := s.db.QueryContext(ctx, "SELECT post_id,title FROM post")
	if err != nil {
		return 0
	}
	defer rows.Close()
	for rows.Next() {
		var id int64
		var title string
		if rows.Scan(&id, &title) == nil && slugify(title) == slug {
			return id
		}
	}
	return 0
}

func slugify(value string) string {
	var out strings.Builder
	dash := false
	for _, r := range strings.ToLower(value) {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			out.WriteRune(r)
			dash = false
		} else if !dash && out.Len() > 0 {
			out.WriteByte('-')
			dash = true
		}
	}
	return strings.Trim(out.String(), "-")
}
func (s *server) comments(w http.ResponseWriter, r *http.Request) {
	id := s.postID(r.Context(), r.PathValue("slug"))
	rows, err := s.db.QueryContext(r.Context(), "SELECT c.comment_id,c.post_id,u.username,u.profile_image,c.body,c.karma,c.parent_comment_id,c.created_at FROM comment c JOIN app_user u ON u.user_id=c.user_id WHERE c.post_id=? ORDER BY c.created_at DESC", id)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var cid, pid, karma int64
		var author, body string
		var image sql.NullString
		var parent sql.NullInt64
		var created time.Time
		if rows.Scan(&cid, &pid, &author, &image, &body, &karma, &parent, &created) == nil {
			var parentVal any
			if parent.Valid {
				parentVal = parent.Int64
			}
			out = append(out, map[string]any{"id": cid, "postId": pid, "author": author, "profileImage": image.String, "body": body, "score": karma, "parentCommentId": parentVal, "createdAt": created})
		}
	}
	jsonJSON(w, 200, out)
}
func (s *server) createComment(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	var q struct {
		Body            string
		ParentCommentID *int64
	}
	_ = json.NewDecoder(r.Body).Decode(&q)
	res, err := s.db.ExecContext(r.Context(), "INSERT INTO comment(post_id,user_id,body,parent_comment_id) VALUES(?,?,?,?)", s.postID(r.Context(), r.PathValue("slug")), u.ID, clean(q.Body), q.ParentCommentID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	id, _ := res.LastInsertId()
	jsonJSON(w, 201, map[string]any{"commentId": id})
}
func (s *server) votePost(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	id := s.postID(r.Context(), r.PathValue("slug"))
	if id == 0 {
		errorJSON(w, 404, "post not found")
		return
	}
	var q map[string]string
	_ = json.NewDecoder(r.Body).Decode(&q)
	vote := q["vote"]

	var prevVote string
	_ = s.db.QueryRowContext(r.Context(), "SELECT vote_type FROM votes_on WHERE user_id=? AND post_id=?", u.ID, id).Scan(&prevVote)

	prevDelta := 0
	if prevVote == "upvote" {
		prevDelta = 1
	} else if prevVote == "downvote" {
		prevDelta = -1
	}

	newDelta := 0
	if vote == "up" {
		newDelta = 1
	} else if vote == "down" {
		newDelta = -1
	}

	delta := newDelta - prevDelta
	if vote == "remove" || vote == "" {
		_, _ = s.db.ExecContext(r.Context(), "DELETE FROM votes_on WHERE user_id=? AND post_id=?", u.ID, id)
	} else {
		vt := "upvote"
		if vote == "down" {
			vt = "downvote"
		}
		_, _ = s.db.ExecContext(r.Context(), "INSERT INTO votes_on(user_id,post_id,vote_type) VALUES(?,?,?) ON DUPLICATE KEY UPDATE vote_type=VALUES(vote_type)", u.ID, id, vt)
	}

	if delta != 0 {
		_, _ = s.db.ExecContext(r.Context(), "UPDATE post SET karma=karma+? WHERE post_id=?", delta, id)
	}

	var newKarma int64
	_ = s.db.QueryRowContext(r.Context(), "SELECT karma FROM post WHERE post_id=?", id).Scan(&newKarma)

	userVoteStr := ""
	if newDelta == 1 {
		userVoteStr = "up"
	} else if newDelta == -1 {
		userVoteStr = "down"
	}

	jsonJSON(w, 200, map[string]any{
		"message":  "vote recorded",
		"karma":    newKarma,
		"userVote": userVoteStr,
	})
}
func (s *server) voteComment(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	var q map[string]string
	_ = json.NewDecoder(r.Body).Decode(&q)
	vote := q["vote"]
	id := r.PathValue("id")

	var prevVote string
	_ = s.db.QueryRowContext(r.Context(), "SELECT vote_type FROM comment_votes WHERE comment_id=? AND user_id=?", id, u.ID).Scan(&prevVote)

	prevDelta := 0
	if prevVote == "upvote" {
		prevDelta = 1
	} else if prevVote == "downvote" {
		prevDelta = -1
	}

	newDelta := 0
	if vote == "up" {
		newDelta = 1
	} else if vote == "down" {
		newDelta = -1
	}

	delta := newDelta - prevDelta
	if vote == "remove" || vote == "" {
		_, _ = s.db.ExecContext(r.Context(), "DELETE FROM comment_votes WHERE comment_id=? AND user_id=?", id, u.ID)
	} else {
		vt := "upvote"
		if vote == "down" {
			vt = "downvote"
		}
		_, _ = s.db.ExecContext(r.Context(), "INSERT INTO comment_votes(comment_id,user_id,vote_type) VALUES(?,?,?) ON DUPLICATE KEY UPDATE vote_type=VALUES(vote_type)", id, u.ID, vt)
	}

	if delta != 0 {
		_, _ = s.db.ExecContext(r.Context(), "UPDATE comment SET karma=karma+? WHERE comment_id=?", delta, id)
	}

	var newKarma int64
	_ = s.db.QueryRowContext(r.Context(), "SELECT karma FROM comment WHERE comment_id=?", id).Scan(&newKarma)

	userVoteStr := ""
	if newDelta == 1 {
		userVoteStr = "up"
	} else if newDelta == -1 {
		userVoteStr = "down"
	}

	jsonJSON(w, 200, map[string]any{
		"message":  "vote recorded",
		"karma":    newKarma,
		"userVote": userVoteStr,
	})
}
func (s *server) updateComment(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	var q struct{ Body string }
	_ = json.NewDecoder(r.Body).Decode(&q)
	res, err := s.db.Exec("UPDATE comment SET body=? WHERE comment_id=? AND user_id=?", q.Body, r.PathValue("id"), u.ID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		errorJSON(w, 403, "you cannot edit this comment")
		return
	}
	jsonJSON(w, 200, map[string]string{"message": "comment updated"})
}
func (s *server) deleteComment(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	res, err := s.db.Exec("DELETE FROM comment WHERE comment_id=? AND user_id=?", r.PathValue("id"), u.ID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		errorJSON(w, 403, "you cannot delete this comment")
		return
	}
	jsonJSON(w, 200, map[string]string{"message": "comment deleted"})
}
func (s *server) profile(w http.ResponseWriter, r *http.Request) {
	var id, karma int64
	var name string
	var image sql.NullString
	var joined time.Time
	if err := s.db.QueryRow("SELECT user_id,username,profile_image,karma,joined_at FROM app_user WHERE username=?", r.PathValue("username")).Scan(&id, &name, &image, &karma, &joined); err != nil {
		errorJSON(w, 404, "user not found")
		return
	}
	jsonJSON(w, 200, map[string]any{"userId": id, "username": name, "profileImage": image.String, "karma": karma, "joinedAt": joined})
}
func (s *server) updateProfile(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	if u.Username != r.PathValue("username") {
		errorJSON(w, 403, "you can only update your own profile")
		return
	}
	var q struct {
		ProfileImage string `json:"profileImage"`
	}
	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		errorJSON(w, 400, "invalid request body")
		return
	}
	if len(q.ProfileImage) > 10*1024*1024 {
		errorJSON(w, 400, "image payload too large (max 10MB)")
		return
	}
	if _, err := s.db.Exec("UPDATE app_user SET profile_image=? WHERE user_id=?", q.ProfileImage, u.ID); err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	jsonJSON(w, 200, map[string]any{"message": "profile updated", "profileImage": q.ProfileImage})
}
func (s *server) subgetits(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.QueryContext(r.Context(), `
		SELECT s.subreddit_id, s.name, COALESCE(s.description, ''), s.created_at,
		       (SELECT COUNT(*) FROM joins j WHERE j.subreddit_id = s.subreddit_id) AS member_count,
		       (SELECT COUNT(*) FROM post p WHERE p.subreddit_id = s.subreddit_id) AS post_count
		FROM subreddit s
		ORDER BY s.name
	`)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, memberCount, postCount int64
		var name, desc string
		var created time.Time
		if rows.Scan(&id, &name, &desc, &created, &memberCount, &postCount) == nil {
			out = append(out, map[string]any{
				"id":          id,
				"name":        name,
				"description": desc,
				"createdAt":   created,
				"memberCount": memberCount,
				"postCount":   postCount,
			})
		}
	}
	jsonJSON(w, 200, out)
}

func (s *server) createSubgetit(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required to create a community")
		return
	}
	var q struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	_ = json.NewDecoder(r.Body).Decode(&q)
	name := strings.ToLower(clean(q.Name))
	name = strings.TrimPrefix(name, "r/")
	name = strings.TrimPrefix(name, "g/")
	name = clean(name)

	if len(name) < 3 || len(name) > 30 {
		errorJSON(w, 400, "community name must be between 3 and 30 characters")
		return
	}

	for _, ch := range name {
		if !((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-') {
			errorJSON(w, 400, "community name can only contain letters, numbers, underscores, and hyphens")
			return
		}
	}

	desc := clean(q.Description)

	res, err := s.db.ExecContext(r.Context(), "INSERT INTO subreddit(name, description) VALUES(?, ?)", name, desc)
	if err != nil {
		if strings.Contains(err.Error(), "Duplicate") || strings.Contains(err.Error(), "1062") {
			errorJSON(w, 409, "a community with that name already exists")
			return
		}
		errorJSON(w, 400, err.Error())
		return
	}

	id, _ := res.LastInsertId()

	// Automatically join creator to new community
	_, _ = s.db.ExecContext(r.Context(), "INSERT INTO joins(user_id, subreddit_id) VALUES(?, ?) ON DUPLICATE KEY UPDATE joined_at=CURRENT_TIMESTAMP", u.ID, id)

	// If user is not yet a moderator of any subreddit, assign them as moderator of this new subreddit
	_, _ = s.db.ExecContext(r.Context(), "UPDATE app_user SET mod_subreddit_id=?, mod_since_at=CURRENT_TIMESTAMP WHERE user_id=? AND mod_subreddit_id IS NULL", id, u.ID)

	jsonJSON(w, 201, map[string]any{
		"id":          id,
		"name":        name,
		"description": desc,
		"joined":      true,
	})
}

func (s *server) subgetitDetails(w http.ResponseWriter, r *http.Request) {
	target := clean(r.PathValue("name"))
	var id, memberCount, postCount int64
	var name, desc string
	var created time.Time
	idVal, _ := strconv.ParseInt(target, 10, 64)

	err := s.db.QueryRowContext(r.Context(), `
		SELECT s.subreddit_id, s.name, COALESCE(s.description, ''), s.created_at,
		       (SELECT COUNT(*) FROM joins j WHERE j.subreddit_id = s.subreddit_id) AS member_count,
		       (SELECT COUNT(*) FROM post p WHERE p.subreddit_id = s.subreddit_id) AS post_count
		FROM subreddit s
		WHERE s.name = ? OR s.subreddit_id = ?
		LIMIT 1
	`, target, idVal).Scan(&id, &name, &desc, &created, &memberCount, &postCount)
	if err != nil {
		errorJSON(w, 404, "subreddit not found")
		return
	}

	joined := false
	if u, ok := s.currentUser(r); ok {
		var jID int64
		if s.db.QueryRowContext(r.Context(), "SELECT subreddit_id FROM joins WHERE user_id=? AND subreddit_id=?", u.ID, id).Scan(&jID) == nil {
			joined = true
		}
	}

	jsonJSON(w, 200, map[string]any{
		"id":          id,
		"name":        name,
		"description": desc,
		"createdAt":   created,
		"memberCount": memberCount,
		"postCount":   postCount,
		"joined":      joined,
	})
}

func (s *server) resolveSubID(ctx context.Context, target string) int64 {
	target = clean(target)
	if id, err := strconv.ParseInt(target, 10, 64); err == nil && id > 0 {
		return id
	}
	var id int64
	_ = s.db.QueryRowContext(ctx, "SELECT subreddit_id FROM subreddit WHERE name=?", target).Scan(&id)
	return id
}

func (s *server) joinSubgetit(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	subID := s.resolveSubID(r.Context(), r.PathValue("id"))
	if subID == 0 {
		errorJSON(w, 404, "subreddit not found")
		return
	}
	_, err := s.db.ExecContext(r.Context(), "INSERT INTO joins(user_id,subreddit_id) VALUES(?,?) ON DUPLICATE KEY UPDATE joined_at=CURRENT_TIMESTAMP", u.ID, subID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	jsonJSON(w, 200, map[string]bool{"joined": true})
}

func (s *server) leaveSubgetit(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	subID := s.resolveSubID(r.Context(), r.PathValue("id"))
	if subID == 0 {
		errorJSON(w, 404, "subreddit not found")
		return
	}
	_, _ = s.db.ExecContext(r.Context(), "DELETE FROM joins WHERE user_id=? AND subreddit_id=?", u.ID, subID)
	jsonJSON(w, 200, map[string]bool{"joined": false})
}
func (s *server) awards(w http.ResponseWriter, _ *http.Request) {
	rows, err := s.db.Query("SELECT award_id,name,description,icon_url,cost,post_id,given_at FROM award ORDER BY name")
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, cost int64
		var name, desc, icon string
		var postID sql.NullInt64
		var given time.Time
		if rows.Scan(&id, &name, &desc, &icon, &cost, &postID, &given) == nil {
			out = append(out, map[string]any{"awardId": id, "name": name, "description": desc, "iconUrl": icon, "cost": cost, "postId": postID, "givenAt": given})
		}
	}
	jsonJSON(w, 200, out)
}
func (s *server) awardComment(w http.ResponseWriter, r *http.Request) {
	if _, ok := s.currentUser(r); !ok {
		errorJSON(w, 401, "login required")
		return
	}
	var q struct{ AwardID int64 }
	_ = json.NewDecoder(r.Body).Decode(&q)
	if q.AwardID == 0 {
		errorJSON(w, 400, "awardId is required")
		return
	}
	if _, err := s.db.Exec("INSERT INTO awarded_to(award_id,comment_id) VALUES(?,?)", q.AwardID, r.PathValue("id")); err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	jsonJSON(w, 201, map[string]string{"message": "award given"})
}
func (s *server) messages(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	rows, err := s.db.Query("SELECT m.message_id,m.content,m.sent_at,m.read_at,m.sender_id,m.receiver_id,s.username,r.username,s.profile_image,r.profile_image FROM private_message m JOIN app_user s ON s.user_id=m.sender_id JOIN app_user r ON r.user_id=m.receiver_id WHERE m.sender_id=? OR m.receiver_id=? ORDER BY m.sent_at DESC", u.ID, u.ID)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, sender, receiver int64
		var content, sn, rn string
		var si, ri sql.NullString
		var sent time.Time
		var read sql.NullTime
		if rows.Scan(&id, &content, &sent, &read, &sender, &receiver, &sn, &rn, &si, &ri) == nil {
			out = append(out, map[string]any{"messageId": id, "content": content, "sentAt": sent, "readAt": read, "senderId": sender, "receiverId": receiver, "senderUsername": sn, "receiverUsername": rn, "senderProfileImage": si.String, "receiverProfileImage": ri.String})
		}
	}
	jsonJSON(w, 200, out)
}
func (s *server) sendMessage(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	var q struct {
		Content          string `json:"content"`
		ReceiverID       int64  `json:"receiverId"`
		ReceiverUsername string `json:"receiverUsername"`
	}
	_ = json.NewDecoder(r.Body).Decode(&q)
	content := clean(q.Content)
	if content == "" {
		errorJSON(w, 400, "content cannot be empty")
		return
	}
	receiverID := q.ReceiverID
	if receiverID == 0 && clean(q.ReceiverUsername) != "" {
		_ = s.db.QueryRowContext(r.Context(), "SELECT user_id FROM app_user WHERE username=?", clean(q.ReceiverUsername)).Scan(&receiverID)
	}
	if receiverID == 0 {
		errorJSON(w, 400, "valid recipient required")
		return
	}
	res, err := s.db.ExecContext(r.Context(), "INSERT INTO private_message(content,sender_id,receiver_id) VALUES(?,?,?)", content, u.ID, receiverID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	id, _ := res.LastInsertId()
	jsonJSON(w, 201, map[string]any{"messageId": id})
}
func (s *server) readMessage(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	_, _ = s.db.ExecContext(r.Context(), "UPDATE private_message SET read_at=CURRENT_TIMESTAMP WHERE message_id=? AND receiver_id=?", r.PathValue("id"), u.ID)
	jsonJSON(w, 200, map[string]string{"message": "marked read"})
}

func (s *server) usersList(w http.ResponseWriter, r *http.Request) {
	search := clean(r.URL.Query().Get("q"))
	query := "SELECT user_id, username, karma, COALESCE(profile_image,'') FROM app_user"
	var rows *sql.Rows
	var err error
	if search != "" {
		query += " WHERE username LIKE ? ORDER BY karma DESC, username ASC LIMIT 25"
		rows, err = s.db.QueryContext(r.Context(), query, "%"+search+"%")
	} else {
		query += " ORDER BY karma DESC, username ASC LIMIT 30"
		rows, err = s.db.QueryContext(r.Context(), query)
	}
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, karma int64
		var un, pimg string
		if rows.Scan(&id, &un, &karma, &pimg) == nil {
			out = append(out, map[string]any{
				"id":           id,
				"username":     un,
				"karma":        karma,
				"profileImage": pimg,
			})
		}
	}
	jsonJSON(w, 200, out)
}
func contextString(_ string) string { return strings.TrimSpace("") }
