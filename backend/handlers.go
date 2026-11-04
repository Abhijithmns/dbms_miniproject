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
	rows, err := s.db.QueryContext(r.Context(), `SELECT p.post_id,p.title,COALESCE(p.body,''),COALESCE(p.flair,''),s.name,u.username,p.created_at,p.karma,(SELECT COUNT(*) FROM comment c WHERE c.post_id=p.post_id) FROM post p JOIN subreddit s ON s.subreddit_id=p.subreddit_id JOIN app_user u ON u.user_id=p.user_id ORDER BY p.created_at DESC`)
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, karma, count int64
		var title, body, flair, sub, author string
		var created time.Time
		if rows.Scan(&id, &title, &body, &flair, &sub, &author, &created, &karma, &count) == nil {
			out = append(out, map[string]any{"id": id, "title": title, "excerpt": body, "flair": flair, "subgetit": sub, "author": author, "createdAt": created, "karma": karma, "comments": count})
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
		Title, Body, Flair string
		SubredditID        int64
	}
	_ = json.NewDecoder(r.Body).Decode(&q)
	res, err := s.db.ExecContext(r.Context(), "INSERT INTO post(title,body,flair,user_id,subreddit_id) VALUES(?,?,?,?,?)", clean(q.Title), q.Body, q.Flair, u.ID, q.SubredditID)
	if err != nil {
		errorJSON(w, 400, err.Error())
		return
	}
	id, _ := res.LastInsertId()
	jsonJSON(w, 201, map[string]any{"postId": id})
}
func (s *server) updatePost(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	var q struct{ Title, Body, Flair string }
	_ = json.NewDecoder(r.Body).Decode(&q)
	result, err := s.db.Exec("UPDATE post SET title=?,body=?,flair=? WHERE post_id=? AND user_id=?", clean(q.Title), q.Body, q.Flair, r.PathValue("id"), u.ID)
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
	result, err := s.db.Exec("DELETE FROM post WHERE post_id=? AND user_id=?", r.PathValue("id"), u.ID)
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
		var author, image, body string
		var parent sql.NullInt64
		var created time.Time
		if rows.Scan(&cid, &pid, &author, &image, &body, &karma, &parent, &created) == nil {
			out = append(out, map[string]any{"id": cid, "postId": pid, "author": author, "profileImage": image, "body": body, "score": karma, "parentCommentId": parent.Int64, "createdAt": created})
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
	vote := r.FormValue("vote")
	var q map[string]string
	_ = json.NewDecoder(r.Body).Decode(&q)
	vote = q["vote"]
	if vote == "remove" {
		_, _ = s.db.Exec("DELETE FROM votes_on WHERE user_id=? AND post_id=?", u.ID, id)
	} else {
		_, _ = s.db.Exec("INSERT INTO votes_on(user_id,post_id,vote_type) VALUES(?,?,?) ON DUPLICATE KEY UPDATE vote_type=VALUES(vote_type)", u.ID, id, map[bool]string{true: "downvote", false: "upvote"}[vote == "down"])
	}
	jsonJSON(w, 200, map[string]string{"message": "vote recorded"})
}
func (s *server) voteComment(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	var q map[string]string
	_ = json.NewDecoder(r.Body).Decode(&q)
	id := r.PathValue("id")
	if q["vote"] == "remove" {
		_, _ = s.db.Exec("DELETE FROM comment_votes WHERE comment_id=? AND user_id=?", id, u.ID)
	} else {
		_, _ = s.db.Exec("INSERT INTO comment_votes(comment_id,user_id,vote_type) VALUES(?,?,?) ON DUPLICATE KEY UPDATE vote_type=VALUES(vote_type)", id, u.ID, map[bool]string{true: "downvote", false: "upvote"}[q["vote"] == "down"])
	}
	jsonJSON(w, 200, map[string]string{"message": "vote recorded"})
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
	var name, image string
	var joined time.Time
	if err := s.db.QueryRow("SELECT user_id,username,profile_image,karma,joined_at FROM app_user WHERE username=?", r.PathValue("username")).Scan(&id, &name, &image, &karma, &joined); err != nil {
		errorJSON(w, 404, "user not found")
		return
	}
	jsonJSON(w, 200, map[string]any{"userId": id, "username": name, "profileImage": image, "karma": karma, "joinedAt": joined})
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
	var q struct{ ProfileImage string }
	_ = json.NewDecoder(r.Body).Decode(&q)
	if _, err := s.db.Exec("UPDATE app_user SET profile_image=? WHERE user_id=?", q.ProfileImage, u.ID); err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	jsonJSON(w, 200, map[string]string{"message": "profile updated"})
}
func (s *server) subgetits(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query("SELECT subreddit_id,name,description,created_at FROM subreddit ORDER BY name")
	if err != nil {
		errorJSON(w, 500, err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var name, desc string
		var created time.Time
		if rows.Scan(&id, &name, &desc, &created) == nil {
			out = append(out, map[string]any{"id": id, "name": name, "description": desc, "createdAt": created})
		}
	}
	jsonJSON(w, 200, out)
}
func (s *server) joinSubgetit(w http.ResponseWriter, r *http.Request) {
	u, ok := s.currentUser(r)
	if !ok {
		errorJSON(w, 401, "login required")
		return
	}
	_, err := s.db.Exec("INSERT INTO joins(user_id,subreddit_id) VALUES(?,?) ON DUPLICATE KEY UPDATE joined_at=CURRENT_TIMESTAMP", u.ID, r.PathValue("id"))
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
	_, _ = s.db.Exec("DELETE FROM joins WHERE user_id=? AND subreddit_id=?", u.ID, r.PathValue("id"))
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
		var content, sn, rn, si, ri string
		var sent time.Time
		var read sql.NullTime
		if rows.Scan(&id, &content, &sent, &read, &sender, &receiver, &sn, &rn, &si, &ri) == nil {
			out = append(out, map[string]any{"messageId": id, "content": content, "sentAt": sent, "readAt": read, "senderId": sender, "receiverId": receiver, "senderUsername": sn, "receiverUsername": rn, "senderProfileImage": si, "receiverProfileImage": ri})
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
		Content    string
		ReceiverID int64
	}
	_ = json.NewDecoder(r.Body).Decode(&q)
	res, err := s.db.Exec("INSERT INTO private_message(content,sender_id,receiver_id) VALUES(?,?,?)", q.Content, u.ID, q.ReceiverID)
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
	_, _ = s.db.Exec("UPDATE private_message SET read_at=CURRENT_TIMESTAMP WHERE message_id=? AND receiver_id=?", r.PathValue("id"), u.ID)
	jsonJSON(w, 200, map[string]string{"message": "marked read"})
}
func contextString(_ string) string { return strings.TrimSpace("") }
