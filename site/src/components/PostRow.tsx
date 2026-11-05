"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  AwardIcon,
  BookmarkIcon,
  CommentIcon,
  MoreHorizontalIcon,
  ShareIcon,
} from "@/components/Icons";
import { toast } from "@/components/Toast";
import { copyText } from "@/lib/clipboard";
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
  const [joined, setJoined] = useState(false);
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

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

  function handleShare(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/post?post=${post.slug}`;
    copyText(url, () => toast("Post link copied to clipboard!"));
    setMenuOpen(false);
  }

  function toggleSave() {
    setSaved((s) => {
      const next = !s;
      toast(next ? "Post saved to your profile" : "Post unsaved");
      return next;
    });
    setMenuOpen(false);
  }

  const community = seriesName(post.series) || "getit";
  const communityInitial = community[0]?.toUpperCase() ?? "G";
  const score = counts.up - counts.down;

  return (
    <li className="reddit-post-card">
      {/* Top Header: Subreddit Avatar + Name + Time + Join Pill + More Menu */}
      <div className="reddit-post-header">
        <div className="flex items-center gap-2 min-w-0">
          <div className="reddit-community-avatar" aria-hidden="true">
            {communityInitial}
          </div>
          <Link
            href={`/series#${post.series}`}
            className="font-bold text-ink hover:underline truncate"
          >
            g/{community}
          </Link>
          <span className="text-muted">•</span>
          <span className="text-muted truncate">{post.date}</span>
          <span className="text-muted hidden sm:inline">• u/getit_demo</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 relative" ref={menuRef}>
          <button
            type="button"
            className={`reddit-join-btn ${joined ? "is-joined" : ""}`}
            onClick={() => {
              setJoined((j) => !j);
              toast(!joined ? `Joined g/${community}` : `Left g/${community}`);
            }}
          >
            {joined ? "Joined" : "Join"}
          </button>

          <button
            type="button"
            className="reddit-more-btn"
            aria-label="More options"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreHorizontalIcon />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-line bg-surface p-1 shadow-lg text-xs">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-line rounded"
                onClick={handleShare}
              >
                <ShareIcon size={14} /> Copy link
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-line rounded"
                onClick={toggleSave}
              >
                <BookmarkIcon size={14} /> {saved ? "Unsave post" : "Save post"}
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-line rounded text-muted"
                onClick={() => {
                  toast("Post reported to moderators");
                  setMenuOpen(false);
                }}
              >
                Report post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Title & Tags */}
      <h3 className="text-base sm:text-lg font-bold mt-2 mb-1 leading-snug">
        <Link href={`/post?post=${post.slug}`} className="hover:text-pen text-ink">
          {highlight(post.title, terms)}
        </Link>
      </h3>

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {post.tags.map((t) => (
          <span key={t} className="reddit-flair">
            #{t}
          </span>
        ))}
      </div>

      {/* Excerpt Body */}
      <p className="text-sm text-muted leading-relaxed line-clamp-3">
        {highlight(post.excerpt, terms)}
      </p>

      {/* Bottom Action Bar: [ ↑ score ↓ ] [ 💬 count ] [ 🏆 Award ] [ ➦ Share ] */}
      <div className="reddit-actions-bar" aria-label="Post actions">
        {/* Combined Vote Pill */}
        <div className="reddit-vote-pill">
          <button
            type="button"
            className={`reddit-vote-arrow ${vote === "up" ? "is-up" : ""}`}
            aria-label="Upvote"
            aria-pressed={vote === "up"}
            onClick={() => setUserVote("up")}
          >
            <ArrowUpIcon size={16} />
          </button>
          <span
            className={`reddit-vote-count ${
              vote === "up" ? "is-up" : vote === "down" ? "is-down" : ""
            }`}
          >
            {score}
          </span>
          <button
            type="button"
            className={`reddit-vote-arrow ${vote === "down" ? "is-down" : ""}`}
            aria-label="Downvote"
            aria-pressed={vote === "down"}
            onClick={() => setUserVote("down")}
          >
            <ArrowDownIcon size={16} />
          </button>
        </div>

        {/* Comment Pill */}
        <Link
          href={`/post?post=${post.slug}#comments`}
          className="reddit-pill-btn"
          aria-label={`${post.comments} comments`}
        >
          <CommentIcon size={15} />
          <span>{post.comments}</span>
        </Link>

        {/* Award Pill */}
        <Link
          href={`/post?post=${post.slug}#comments`}
          className="reddit-pill-btn"
          title="Give award"
        >
          <AwardIcon size={15} />
          <span className="hidden sm:inline">Award</span>
        </Link>

        {/* Share Pill */}
        <button
          type="button"
          className="reddit-pill-btn"
          onClick={handleShare}
          title="Share post"
        >
          <ShareIcon size={15} />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Save Bookmark */}
        <button
          type="button"
          className={`reddit-pill-btn hidden sm:inline-flex ${saved ? "text-pen" : ""}`}
          onClick={toggleSave}
          title={saved ? "Saved" : "Save"}
          aria-label="Bookmark"
        >
          <BookmarkIcon size={15} />
        </button>
      </div>
    </li>
  );
}
