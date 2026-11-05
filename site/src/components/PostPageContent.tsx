"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CommentsSection } from "@/components/CommentsSection";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  AwardIcon,
  BookmarkIcon,
  CommentIcon,
  MoreHorizontalIcon,
  ShareIcon,
} from "@/components/Icons";
import { PostManagement } from "@/components/PostManagement";
import { toast } from "@/components/Toast";
import { POSTS, seriesName } from "@/data/posts";
import { copyText } from "@/lib/clipboard";

const bodies: Record<string, string[]> = {
  "best-way-to-learn-sql": [
    "There is a point where learning SQL stops being about memorising syntax and starts being about asking a better question.",
    "Describe the result in plain language first: which rows do you need, how are they related, and what should happen when there is no match?",
  ],
  "quiet-place-to-study": [
    "The library is usually the safest choice, but the best place depends on when you study. Check the smaller reading rooms early and look for a reliable power socket.",
  ],
  "redis-vs-mysql": [
    "Redis is useful when the same small piece of data must be read quickly, while MySQL remains the source of truth for related records and durable relationships.",
    "A saved-post list, session, or short-lived cache is a good example of the split.",
  ],
  "debugging-null-values": [
    "NULL is not zero and it is not an empty string. It means that a value is unknown or missing, so SQL uses three-valued logic when comparing it.",
  ],
  "group-project-survival": [
    "Give every task one owner and one reviewer. Keep a small shared board with the status, deadline, and a link to the result.",
  ],
  "show-your-side-project": [
    "Share the problem, the smallest useful demo, and one thing you learned. Small projects are easier for other people to understand and respond to.",
  ],
  "normalisation-clicked": [
    "Normalisation clicked when I treated each table as one kind of fact. A row should have one clear owner, and repeated facts should have one place to change.",
  ],
  "free-food-near-campus": [
    "The most useful recommendations include the price, opening time, and what to order. A short, specific answer helps more than a list of names.",
  ],
};

export function PostPageContent() {
  const params = useSearchParams();
  const post = POSTS.find((item) => item.slug === params.get("post")) ?? POSTS[0];

  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [counts, setCounts] = useState({ up: post.upvotes, down: post.downvotes });
  const [joined, setJoined] = useState(false);
  const [saved, setSaved] = useState(false);

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

  function handleShare() {
    copyText(window.location.href, () => toast("Post link copied to clipboard!"));
  }

  function toggleSave() {
    setSaved((s) => {
      const next = !s;
      toast(next ? "Post saved to your profile" : "Post unsaved");
      return next;
    });
  }

  const community = seriesName(post.series) || "getit";
  const communityInitial = community[0]?.toUpperCase() ?? "G";
  const score = counts.up - counts.down;

  return (
    <article className="max-w-[840px] mx-auto border border-line rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
      {/* Top Header: Subreddit Avatar + Name + Time + Join Pill + Options */}
      <div className="reddit-post-header pb-3 border-b border-line">
        <div className="flex items-center gap-2 min-w-0">
          <div className="reddit-community-avatar !w-7 !h-7 !text-xs font-bold" aria-hidden="true">
            {communityInitial}
          </div>
          <Link
            href={`/series#${post.series}`}
            className="font-bold text-sm text-ink hover:underline truncate"
          >
            g/{community}
          </Link>
          <span className="text-muted">•</span>
          <span className="text-xs text-muted truncate">{post.date}</span>
          <span className="text-xs text-muted hidden sm:inline">• posted by u/getit_demo</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            onClick={handleShare}
          >
            <MoreHorizontalIcon />
          </button>
        </div>
      </div>

      {/* Post Title & Flairs */}
      <h1 className="text-2xl sm:text-3xl font-bold mt-4 leading-snug text-ink">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 mb-4">
        {post.tags.map((tag) => (
          <span key={tag} className="reddit-flair">
            #{tag}
          </span>
        ))}
      </div>

      {/* Post Body Content */}
      <div className="prose-nb py-2 leading-relaxed text-ink/90 text-base sm:text-lg">
        {(bodies[post.slug] ?? [post.excerpt]).map((paragraph) => (
          <p key={paragraph} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Reddit Action Bar: [ ↑ score ↓ ] [ 💬 count ] [ 🏆 Award ] [ ➦ Share ] [ ✎ / 🗑 ] */}
      <div className="reddit-actions-bar py-3 border-y border-line mt-4" aria-label="Post actions">
        {/* Vote Pill */}
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
        <a href="#comments" className="reddit-pill-btn" aria-label={`${post.comments} comments`}>
          <CommentIcon size={15} />
          <span>{post.comments} comments</span>
        </a>

        {/* Award Pill */}
        <button type="button" className="reddit-pill-btn" onClick={handleShare}>
          <AwardIcon size={15} />
          <span>Award</span>
        </button>

        {/* Share Pill */}
        <button type="button" className="reddit-pill-btn" onClick={handleShare}>
          <ShareIcon size={15} />
          <span>Share</span>
        </button>

        {/* Save Bookmark */}
        <button
          type="button"
          className={`reddit-pill-btn ${saved ? "text-pen" : ""}`}
          onClick={toggleSave}
          title={saved ? "Saved" : "Save"}
          aria-label="Bookmark"
        >
          <BookmarkIcon size={15} />
        </button>

        {/* Owner Controls */}
        <PostManagement slug={post.slug} initialTitle={post.title} initialBody={post.excerpt} />
      </div>

      {/* Comments Section */}
      <CommentsSection postSlug={post.slug} count={post.comments} />
    </article>
  );
}
