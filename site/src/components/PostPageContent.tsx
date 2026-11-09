"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { openAuthModal } from "@/components/AuthModal";
import { POSTS, SERIES, seriesName, type Post } from "@/data/posts";
import { apiRequest } from "@/lib/api";
import { copyText } from "@/lib/clipboard";

type ApiPostDetail = {
  id: number;
  postId: number;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  flair: string;
  authorId: number;
  author: string;
  subredditId: number;
  subgetit: string;
  createdAt: string;
  karma: number;
  comments: number;
  userVote: string;
  saved: boolean;
  joined: boolean;
};

export function PostPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const postParam = params.get("post");
  const isCreate = !postParam || params.get("create") === "true";

  // Create Post state
  const [createCommunity, setCreateCommunity] = useState<number>(2); // Default to campus-life
  const [createTitle, setCreateTitle] = useState("");
  const [createBody, setCreateBody] = useState("");
  const [createFlair, setCreateFlair] = useState("advice");
  const [submitting, setSubmitting] = useState(false);
  const [communities, setCommunities] = useState(SERIES);

  // Post Detail state
  const fallbackPost = POSTS.find((item) => String(item.id) === postParam || item.slug === postParam) ?? POSTS[0];
  const [post, setPost] = useState<Post>(fallbackPost);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [score, setScore] = useState<number>(fallbackPost.karma ?? 0);
  const [joined, setJoined] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch communities for Create Post
  useEffect(() => {
    apiRequest<Array<{ id: number; name: string; description: string }>>("/api/subgetits")
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setCommunities(
            items.map((i) => ({
              id: i.id,
              slug: i.name,
              name: i.name,
              description: i.description,
            }))
          );
          if (items[0]?.id) {
            setCreateCommunity(items[0].id);
          }
        }
      })
      .catch(() => undefined);
  }, []);

  // Fetch live post details
  useEffect(() => {
    if (!postParam) return;
    apiRequest<ApiPostDetail>(`/api/posts/${postParam}/details`)
      .then((data) => {
        const flairList = data.flair
          ? data.flair.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const loaded: Post = {
          id: data.id,
          slug: String(data.id),
          title: data.title,
          excerpt: data.body || data.excerpt || "",
          body: data.body || "",
          date: data.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently",
          tags: flairList.length > 0 ? flairList : ["general"],
          series: data.subgetit,
          subgetit: data.subgetit,
          subredditId: data.subredditId,
          author: data.author,
          comments: data.comments ?? 0,
          upvotes: data.karma ?? 0,
          downvotes: 0,
          karma: data.karma ?? 0,
          userVote: data.userVote === "up" ? "up" : data.userVote === "down" ? "down" : null,
          saved: data.saved,
          joined: data.joined,
          href: `/post?post=${data.id}`,
        };
        setPost(loaded);
        setScore(loaded.karma ?? 0);
        setVote(loaded.userVote ?? null);
        setJoined(!!loaded.joined);
        setSaved(!!loaded.saved);
      })
      .catch(() => undefined);
  }, [postParam]);

  // Handle post creation
  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!createTitle.trim()) {
      toast("Please enter a title for your post");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiRequest<{ postId: number }>("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          title: createTitle.trim(),
          body: createBody.trim(),
          flair: createFlair.trim(),
          subredditId: createCommunity,
        }),
      });
      toast("Post created successfully!");
      router.push(`/post?post=${res.postId}`);
    } catch (err) {
      openAuthModal("login");
      toast(err instanceof Error ? err.message : "Failed to create post. Please check login.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle voting on post
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
      const postId = post.id || postParam || post.slug;
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

  function handleShare() {
    copyText(window.location.href, () => toast("Post link copied to clipboard!"));
  }

  async function toggleSave() {
    const next = !saved;
    setSaved(next);
    toast(next ? "Post saved to your profile" : "Post unsaved");
    try {
      const postId = post.id || postParam || post.slug;
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

  // ---------------- CREATE POST VIEW ----------------
  if (isCreate) {
    return (
      <div className="max-w-[780px] mx-auto border border-line rounded-xl bg-surface p-4 sm:p-6 shadow-sm">
        <div className="border-b border-line pb-4 mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-ink">Create a post</h1>
          <p className="text-xs text-muted mt-1">
            Share knowledge, ask questions, or start a discussion in the getit community.
          </p>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-4">
          {/* Subreddit / Community Select */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Choose a community
            </label>
            <select
              value={createCommunity}
              onChange={(e) => setCreateCommunity(Number(e.target.value))}
              className="input w-full max-w-sm font-semibold"
            >
              {communities.map((c) => (
                <option key={c.slug} value={c.id ?? 1}>
                  g/{c.name} {c.description ? `— ${c.description}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              maxLength={300}
              placeholder="Title of your post"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="input w-full text-base font-semibold"
            />
          </div>

          {/* Flair Picker */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Post Flair
            </label>
            <div className="flex flex-wrap gap-2">
              {["advice", "recommendations", "explainers", "showcase", "sql", "general"].map(
                (flair) => (
                  <button
                    key={flair}
                    type="button"
                    onClick={() => setCreateFlair(flair)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      createFlair === flair
                        ? "bg-pen text-white border-pen font-bold"
                        : "bg-surface border-line text-muted hover:text-ink"
                    }`}
                  >
                    #{flair}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Body text
            </label>
            <textarea
              rows={6}
              placeholder="Write the details of your post..."
              value={createBody}
              onChange={(e) => setCreateBody(e.target.value)}
              className="input w-full leading-relaxed"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <Link
              href="/"
              className="reddit-pill-btn !h-9 text-xs font-bold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="reddit-join-btn !h-9 !px-6 text-xs font-bold disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------------- VIEW POST DETAIL ----------------
  const community = seriesName(post.series) || "getit";
  const communityInitial = community[0]?.toUpperCase() ?? "G";
  const bodyParagraphs = (post.body || post.excerpt)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

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
          <span className="text-xs text-muted hidden sm:inline">• posted by u/{post.author || "getit_demo"}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
        {bodyParagraphs.length > 0 ? (
          bodyParagraphs.map((paragraph, idx) => (
            <p key={idx} className="mb-4">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="mb-4">{post.excerpt}</p>
        )}
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
            onClick={() => void setUserVote("up")}
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
            onClick={() => void setUserVote("down")}
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
          onClick={() => void toggleSave()}
          title={saved ? "Saved" : "Save"}
          aria-label="Bookmark"
        >
          <BookmarkIcon size={15} />
        </button>

        {/* Owner Controls */}
        <PostManagement
          slug={String(post.id || postParam || post.slug)}
          initialTitle={post.title}
          initialBody={post.body || post.excerpt}
        />
      </div>

      {/* Comments Section */}
      <CommentsSection postSlug={String(post.id || postParam || post.slug)} count={post.comments} />
    </article>
  );
}
