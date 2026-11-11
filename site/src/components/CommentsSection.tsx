"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CommentIcon } from "@/components/Icons";
import { AwardsPanel } from "@/components/AwardsPanel";
import { toast } from "@/components/Toast";
import { apiRequest } from "@/lib/api";
import { AUTH_CHANGED_EVENT } from "@/components/AuthForm";
import { openAuthModal } from "@/components/AuthModal";
import { UserAvatar } from "@/components/UserAvatar";

type ApiComment = {
  id: number;
  author: string;
  profileImage?: string;
  body: string;
  score: number;
  parentCommentId?: number;
  createdAt: string;
};
type Comment = ApiComment & { age: string };

function avatar(comment: Comment) {
  return <UserAvatar image={comment.profileImage} username={comment.author} size={32} />;
}

function CommentItem({
  comment,
  postSlug,
  currentUser,
  reload,
  replies = [],
  depth = 0,
  allComments = [],
}: {
  comment: Comment;
  postSlug: string;
  currentUser: string | null;
  reload: () => void;
  replies?: Comment[];
  depth?: number;
  allComments?: Comment[];
}) {
  const [score, setScore] = useState(comment.score);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function voteComment(next: "up" | "down") {
    const remove = vote === next;
    const nextVote = remove ? "remove" : next;
    const prevVote = vote;
    const prevScore = score;
    setVote(remove ? null : next);
    setScore((val) => val + (remove ? (next === "up" ? -1 : 1) : next === "up" ? 1 : -1));

    try {
      const res = await apiRequest<{ karma: number; userVote: string }>(
        `/api/comments/${comment.id}/vote`,
        {
          method: "POST",
          body: JSON.stringify({ vote: nextVote }),
        }
      );
      if (typeof res.karma === "number") {
        setScore(res.karma);
        setVote(res.userVote === "up" ? "up" : res.userVote === "down" ? "down" : null);
      }
    } catch {
      setVote(prevVote);
      setScore(prevScore);
      toast("Please log in to vote on comments");
    }
  }

  async function submitReply(event: React.FormEvent) {
    event.preventDefault();
    if (!reply.trim()) return;
    try {
      await apiRequest(`/api/posts/${postSlug}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: reply.trim(), parentCommentId: comment.id }),
      });
      setReply("");
      setReplying(false);
      reload();
    } catch {
      openAuthModal("login");
      toast("Please log in to reply");
    }
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    await apiRequest(`/api/comments/${comment.id}`, {
      method: "PUT",
      body: JSON.stringify({ body: editBody }),
    })
      .then(() => {
        setEditing(false);
        reload();
      })
      .catch(() => undefined);
  }

  async function deleteComment() {
    await apiRequest(`/api/comments/${comment.id}`, { method: "DELETE" })
      .then(reload)
      .catch(() => undefined);
  }

  return (
    <li className="comment-item">
      <div className="comment-avatar" aria-hidden="true">
        {avatar(comment)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="comment-meta">
          <strong>u/{comment.author}</strong> · {comment.age}
        </p>
        {editing ? (
          <form className="mt-2 flex gap-2" onSubmit={saveEdit}>
            <input
              className="input"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
            />
            <button className="btn">Save</button>
          </form>
        ) : (
          <p className="mt-2 leading-relaxed">{comment.body}</p>
        )}
        <div className="comment-actions">
          <button
            type="button"
            className={`vote-btn ${vote === "up" ? "is-up" : ""}`}
            onClick={() => void voteComment("up")}
          >
            <ArrowUpIcon /> {score}
          </button>
          <button
            type="button"
            className={`vote-btn ${vote === "down" ? "is-down" : ""}`}
            onClick={() => void voteComment("down")}
          >
            <ArrowDownIcon />
          </button>
          <button
            type="button"
            className="comment-btn"
            onClick={() => setReplying(!replying)}
          >
            <CommentIcon /> Reply
          </button>
          <AwardsPanel commentId={comment.id} />
          {currentUser === comment.author && (
            <>
              <button
                type="button"
                className="comment-btn"
                onClick={() => setEditing(!editing)}
              >
                Edit
              </button>
              <button
                type="button"
                className="comment-btn"
                onClick={() => setConfirmDelete(!confirmDelete)}
              >
                Delete
              </button>
            </>
          )}
        </div>
        {confirmDelete && (
          <div className="delete-confirm" role="alert">
            Delete this comment?{" "}
            <button
              type="button"
              className="comment-btn delete-confirm-yes"
              onClick={() => void deleteComment()}
            >
              Delete
            </button>
            <button
              type="button"
              className="comment-btn"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        )}
        {replying && (
          <form className="mt-3 flex flex-col gap-2" onSubmit={submitReply}>
            <textarea
              className="input min-h-20 resize-y w-full text-sm"
              placeholder={`Reply to u/${comment.author}…`}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button className="reddit-join-btn !h-8 !px-4 text-xs font-bold">Reply</button>
              <button
                type="button"
                className="btn-ghost !text-xs !py-1.5"
                onClick={() => { setReplying(false); setReply(""); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {/* Nested replies */}
        {replies.length > 0 && (
          <ol className={`mt-3 space-y-3 border-l-2 border-line pl-4 ${depth >= 4 ? "pl-2" : ""}`}>
            {replies.map((rep) => (
              <CommentItem
                key={rep.id}
                comment={rep}
                postSlug={postSlug}
                currentUser={currentUser}
                reload={reload}
                replies={allComments.filter((c) => c.parentCommentId === rep.id)}
                depth={depth + 1}
                allComments={allComments}
              />
            ))}
          </ol>
        )}
      </div>
    </li>
  );
}

export function CommentsSection({ postSlug, count }: { postSlug: string; count: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(count);

  const load = useCallback(() => {
    void apiRequest<ApiComment[]>(`/api/posts/${postSlug}/comments`)
      .then((items) => {
        const mapped = items.map((item) => ({
          ...item,
          age: new Date(item.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setComments(mapped);
        setDisplayCount(mapped.length);
      })
      .catch(() => undefined);
  }, [postSlug]);

  useEffect(() => {
    load();
    void apiRequest<{ username: string }>("/api/auth/me")
      .then((user) => setCurrentUser(user.username))
      .catch(() => setCurrentUser(null));

    const handleAuth = (e: Event) => {
      const custom = e as CustomEvent<{ username: string } | null>;
      if (custom.detail) {
        setCurrentUser(custom.detail.username);
      } else {
        setCurrentUser(null);
      }
    };
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuth);
  }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;

    if (!currentUser) {
      openAuthModal("login");
      toast("Please log in to leave a comment");
      return;
    }

    try {
      await apiRequest(`/api/posts/${postSlug}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: body.trim() }),
      });
      setBody("");
      load();
    } catch {
      openAuthModal("login");
      toast("Please log in to leave a comment");
    }
  }

  return (
    <section className="mt-8 border-t border-line pt-6" id="comments" aria-labelledby="comments-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="comments-title" className="text-lg font-bold text-ink">
          Comments
        </h2>
        <span className="text-xs text-muted">{displayCount} comments</span>
      </div>

      <form className="mt-4" onSubmit={submit}>
        <textarea
          className="input min-h-24 resize-y w-full text-sm"
          placeholder="What are your thoughts?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {currentUser ? `Commenting as u/${currentUser}` : "Log in to join the discussion"}
          </p>
          <div className="flex gap-2">
            {!currentUser && (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="btn-ghost !text-xs !py-1.5"
              >
                Log In
              </button>
            )}
            <button className="reddit-join-btn !h-8 !px-4 text-xs font-bold">Comment</button>
          </div>
        </div>
      </form>

      <ol className="mt-6 space-y-4">
        {comments
          .filter((comment) => !comment.parentCommentId)
          .map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
              currentUser={currentUser}
              reload={load}
              replies={comments.filter((c) => c.parentCommentId === comment.id)}
              depth={0}
              allComments={comments}
            />
          ))}
      </ol>
    </section>
  );
}
