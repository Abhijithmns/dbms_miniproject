"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CommentIcon } from "@/components/Icons";
import { USER_STORAGE_KEY } from "@/components/UserIdentity";

type Comment = { id: number; author: string; body: string; age: string; score: number; replies?: Comment[] };

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 1,
    author: "curious_owl_482",
    body: "The biggest change for me was writing the result in plain English first. The SQL became much less intimidating after that.",
    age: "2h ago",
    score: 42,
    replies: [{ id: 2, author: "pixel_badger_119", body: "This is exactly how I approach joins now.", age: "1h ago", score: 17 }],
  },
  { id: 3, author: "quiet_panda_731", body: "Build a tiny project around the query you want to learn. It gives every clause a reason to exist.", age: "48m ago", score: 29 },
  { id: 4, author: "cosmic_fox_304", body: "Also: read the error message slowly. It is usually more helpful than the tutorial you are searching for.", age: "21m ago", score: 18 },
];

function CommentItem({ comment }: { comment: Comment }) {
  const [score, setScore] = useState(comment.score);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  function changeVote(next: "up" | "down") {
    if (vote === next) {
      setScore((current) => current + (next === "up" ? -1 : 1));
      setVote(null);
      return;
    }
    setScore((current) => current + (next === "up" ? 1 : -1) + (vote === "up" ? -1 : vote === "down" ? 1 : 0));
    setVote(next);
  }

  return (
    <li className="comment-item">
      <div className="comment-avatar" aria-hidden="true">{comment.author[0].toUpperCase()}</div>
      <div className="min-w-0 flex-1">
        <p className="comment-meta"><strong>u/{comment.author}</strong> · {comment.age}</p>
        <p className="mt-2 leading-relaxed">{comment.body}</p>
        <div className="comment-actions">
          <button type="button" className={`vote-btn ${vote === "up" ? "is-up" : ""}`} aria-label="Upvote comment" onClick={() => changeVote("up")}><ArrowUpIcon /> {score}</button>
          <button type="button" className={`vote-btn ${vote === "down" ? "is-down" : ""}`} aria-label="Downvote comment" onClick={() => changeVote("down")}><ArrowDownIcon /></button>
          <button type="button" className="comment-btn"><CommentIcon /> Reply</button>
        </div>
        {comment.replies && <ul className="comment-replies">{comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} />)}</ul>}
      </div>
    </li>
  );
}

export function CommentsSection({ count }: { count: number }) {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [body, setBody] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    const author = window.localStorage.getItem(USER_STORAGE_KEY) ?? "anonymous_getter";
    setComments((current) => [{ id: Date.now(), author, body: text, age: "just now", score: 1 }, ...current]);
    setBody("");
  }

  return (
    <section className="mt-12 border-t-2 border-ink pt-8" id="comments" aria-labelledby="comments-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="comments-title" className="display text-xl font-bold">Comments</h2>
        <span className="post-meta">{count} comments</span>
      </div>
      <form className="mt-5" onSubmit={submit}>
        <label htmlFor="comment-body" className="sr-only">Add a comment</label>
        <textarea id="comment-body" className="input min-h-28 resize-y" placeholder="What do you think?" value={body} onChange={(event) => setBody(event.target.value)} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">Log in to comment with your getit username.</p>
          <div className="flex gap-2"><Link href="/subscribe" className="btn-ghost">Log in</Link><button className="btn" type="submit">Comment</button></div>
        </div>
      </form>
      <ol className="mt-8 space-y-6">{comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)}</ol>
    </section>
  );
}
