"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CommentIcon } from "@/components/Icons";
import type { ReactNode } from "react";
import { seriesName, tagHref, type Post } from "@/data/posts";

/** A topic as a link to the topic browser (the # is drawn by the .tag class). */
export function TagLink({ tag, children }: { tag: string; children?: ReactNode }) {
  return (
    <Link className="tag" href={tagHref(tag)}>
      {children ?? tag}
    </Link>
  );
}

/** The community badge of a post, or nothing. */
export function SeriesBadge({ post }: { post: Post }) {
  if (!post.series) return null;
  return (
    <span className="series-badge">
      g/{seriesName(post.series)}
    </span>
  );
}

/** `text` with every occurrence of the search terms (lower case) wrapped in <mark>. */
export function highlight(text: string, terms: string[] = []): ReactNode {
  if (!terms.length) return text;
  const lower = text.toLowerCase();
  const marks: [number, number][] = [];
  for (const term of terms) {
    let from = 0;
    let at: number;
    while ((at = lower.indexOf(term, from)) !== -1) {
      marks.push([at, at + term.length]);
      from = at + term.length;
    }
  }
  if (!marks.length) return text;
  marks.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const out: ReactNode[] = [];
  let pos = 0;
  for (const [start, end] of marks) {
    if (end <= pos) continue;
    const from = Math.max(start, pos);
    if (from > pos) out.push(text.slice(pos, from));
    out.push(<mark key={from}>{text.slice(from, end)}</mark>);
    pos = end;
  }
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}

/** One post in a list (latest posts, archive, tags, search). `terms` are highlighted (search). */
export function PostRow({ post, terms }: { post: Post; terms?: string[] }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [counts, setCounts] = useState({ up: post.upvotes, down: post.downvotes });

  function setUserVote(next: "up" | "down") {
    if (vote === next) {
      setVote(null);
      setCounts((current) => ({ ...current, [next]: current[next] - 1 }));
      return;
    }
    setCounts((current) => ({
      up: current.up + (next === "up" ? 1 : 0) - (vote === "up" ? 1 : 0),
      down: current.down + (next === "down" ? 1 : 0) - (vote === "down" ? 1 : 0),
    }));
    setVote(next);
  }

  return (
    <li className="post-row">
      <time dateTime={post.date}>{post.date}</time>
      <div className="min-w-0">
        <h3 className="post-title">
          <Link href={`/post?post=${post.slug}`}>{highlight(post.title, terms)}</Link>
        </h3>
        <p className="mt-1 text-muted">{highlight(post.excerpt, terms)}</p>
        <p className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <SeriesBadge post={post} />
          {post.tags.map((t) => (
            <TagLink key={t} tag={t} />
          ))}
        </p>
        <div className="post-actions" aria-label="Post actions">
          <button type="button" className={`vote-btn ${vote === "up" ? "is-up" : ""}`} aria-label="Upvote" aria-pressed={vote === "up"} onClick={() => setUserVote("up")}>
            <ArrowUpIcon /> {counts.up}
          </button>
          <button type="button" className={`vote-btn ${vote === "down" ? "is-down" : ""}`} aria-label="Downvote" aria-pressed={vote === "down"} onClick={() => setUserVote("down")}>
            <ArrowDownIcon /> {counts.down}
          </button>
          <Link href={`/post?post=${post.slug}#comments`} className="comment-btn">
            <CommentIcon /> {post.comments} comments
          </Link>
        </div>
      </div>
      <span className="post-meta">{post.minutes} min read</span>
    </li>
  );
}
