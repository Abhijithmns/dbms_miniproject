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
import { apiRequest } from "@/lib/api";
import { copyText } from "@/lib/clipboard";
import { openAuthModal } from "@/components/AuthModal";
import { GiveAwardModal } from "@/components/GiveAwardModal";
import type { ReactNode } from "react";
import { seriesName, tagHref, type Post, type AwardItem } from "@/data/posts";

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
  const [vote, setVote] = useState<"up" | "down" | null>(post.userVote ?? null);
  const [score, setScore] = useState(post.karma ?? post.upvotes - post.downvotes);
  const [joined, setJoined] = useState(post.joined ?? false);
  const [saved, setSaved] = useState(post.saved ?? false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [postAwards, setPostAwards] = useState<AwardItem[]>(post.awards || []);
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

  async function setUserVote(next: "up" | "down") {
    const isCancel = vote === next;
    const nextVote = isCancel ? "remove" : next;
    const prevVote = vote;
    const prevScore = score;
    const prevDelta = prevVote === "up" ? 1 : prevVote === "down" ? -1 : 0;
    const newDelta = nextVote === "up" ? 1 : nextVote === "down" ? -1 : 0;
    const delta = newDelta - prevDelta;
    setVote(isCancel ? null : next);
    setScore(prevScore + delta);

    try {
      const postId = post.id || post.slug;
      const res = await apiRequest<{ message: string; karma: number; userVote: string }>(
        `/api/posts/${postId}/vote`,
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
      openAuthModal("login");
      toast("Please log in to vote on posts");
    }
  }

  function handleShare(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const postId = post.id || post.slug;
    const url = `${window.location.origin}/post?post=${postId}`;
    copyText(url, () => toast("Post link copied to clipboard!"));
    setMenuOpen(false);
  }

  async function toggleSave() {
    const next = !saved;
    setSaved(next);
    setMenuOpen(false);
    toast(next ? "Post saved to your profile" : "Post unsaved");
    try {
      const postId = post.id || post.slug;
      await apiRequest(`/api/redis/saved-posts/${postId}`, {
        method: next ? "POST" : "DELETE",
      });
    } catch {}
  }

  async function toggleJoin() {
    const next = !joined;
    setJoined(next);
    const commName = seriesName(post.series) || "getit";
    toast(next ? `Joined g/${commName}` : `Left g/${commName}`);
    try {
      const targetSub = post.subredditId || post.series;
      await apiRequest(`/api/subgetits/${targetSub}/join`, {
        method: next ? "POST" : "DELETE",
      });
    } catch {}
  }

  const community = seriesName(post.series) || "getit";
  const communityInitial = community[0]?.toUpperCase() ?? "G";

  return (
    <li className="reddit-post-card">
      {/* Top Header: Subreddit Avatar + Name + Time + Join Pill + More Menu */}
      <div className="reddit-post-header">
        <div className="flex items-center gap-2 min-w-0">
          <div className="reddit-community-avatar" aria-hidden="true">
            {communityInitial}
          </div>
          <Link
            href={`/g/${post.series || post.subgetit || community}`}
            className="font-bold text-ink hover:underline truncate"
          >
            g/{community}
          </Link>
          <span className="text-muted">•</span>
          <span className="text-muted truncate">{post.date}</span>
          <span className="text-muted hidden sm:inline">• u/{post.author || "getit_demo"}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 relative" ref={menuRef}>
          <button
            type="button"
            className={`reddit-join-btn ${joined ? "is-joined" : ""}`}
            onClick={() => void toggleJoin()}
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
        <Link href={`/post?post=${post.id || post.slug}`} className="hover:text-pen text-ink">
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

      {/* Post Awards */}
      {postAwards.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {postAwards.map((a, idx) => (
            <span
              key={`${a.awardId}-${idx}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/25 text-ink shadow-sm"
              title={`${a.name}: ${a.description || ""}`}
            >
              <span>{a.iconUrl || "🏆"}</span>
              <span className="text-[10px] font-bold">{a.name}</span>
            </span>
          ))}
        </div>
      )}

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
          href={`/post?post=${post.id || post.slug}#comments`}
          className="reddit-pill-btn"
          aria-label={`${post.comments} comments`}
        >
          <CommentIcon size={15} />
          <span>{post.comments}</span>
        </Link>

        {/* Award Pill */}
        <button
          type="button"
          onClick={() => setAwardModalOpen(true)}
          className="reddit-pill-btn hover:text-amber-500 transition-colors"
          title="Give award"
        >
          <AwardIcon size={15} />
          <span className="hidden sm:inline">Award</span>
          {postAwards.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500">
              {postAwards.length}
            </span>
          )}
        </button>

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

      <GiveAwardModal
        isOpen={awardModalOpen}
        onClose={() => setAwardModalOpen(false)}
        targetType="post"
        targetId={post.id || post.slug}
        targetTitle={post.title}
        onAwardGiven={(award, newKarma) => {
          setPostAwards((prev) => [...prev, award]);
          if (typeof newKarma === "number") setScore(newKarma);
        }}
      />
    </li>
  );
}
