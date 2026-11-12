"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookIcon,
  BookmarkIcon,
  CardViewIcon,
  ChatIcon,
  ChevronDownIcon,
  CompassIcon,
  HomeIcon,
  PlusIcon,
  RssIcon,
  SettingsIcon,
  StarIcon,
} from "@/components/Icons";
import { PostRow } from "@/components/PostRow";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";
import { apiPostToPost, type ApiPost, type Post, type Series } from "@/data/posts";
import { apiRequest } from "@/lib/api";

export function RedditHomeFeed() {
  const [tab, setTab] = useState<"for-you" | "following" | "hot" | "new" | "top">("for-you");
  const [posts, setPosts] = useState<Post[]>([]);
  const [subreddits, setSubreddits] = useState<Series[]>([]);
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<{ totalUsers: number; totalPosts: number; totalCommunities: number } | null>(null);
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);

  useEffect(() => {
    // Load live platform stats
    apiRequest<{ totalUsers: number; totalPosts: number; totalCommunities: number }>("/api/stats")
      .then(setStats)
      .catch(() => undefined);

    // Load live posts from MariaDB backend
    apiRequest<ApiPost[]>("/api/posts")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const live = data.map(apiPostToPost);
          setPosts(live);
          setRecentPosts(live.slice(0, 5));
        }
      })
      .catch(() => undefined);

    // Load live subreddits from MariaDB backend
    apiRequest<Array<{ id: number; name: string; description: string }>>("/api/subgetits")
      .then((subs) => {
        if (Array.isArray(subs) && subs.length > 0) {
          setSubreddits(
            subs.map((s) => ({
              id: s.id,
              slug: s.name,
              name: s.name,
              description: s.description,
            }))
          );
        }
      })
      .catch(() => undefined);
  }, []);

  function toggleStar(slug: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStarred((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  function clearRecent() {
    setRecentPosts([]);
  }

  // Filter or sort posts depending on selected tab
  const displayPosts = [...posts].sort((a, b) => {
    if (tab === "top") return (b.karma ?? b.upvotes - b.downvotes) - (a.karma ?? a.upvotes - a.downvotes);
    if (tab === "new") return (b.id ?? 0) - (a.id ?? 0);
    if (tab === "hot") return ((b.karma ?? b.upvotes) + b.comments) - ((a.karma ?? a.upvotes) + a.comments);
    return 0; // Default for-you / following order
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 reddit-layout pt-4 md:pt-6">
      {/* ---------------- Left Sidebar ---------------- */}
      <aside className="reddit-sidebar left-sidebar" aria-label="Community navigation">
        {/* Core Links */}
        <div className="side-card space-y-0.5">
          <Link
            href="/"
            className="side-link side-link-active"
          >
            <HomeIcon size={18} />
            <span>Home</span>
          </Link>
          <Link
            href="/archive"
            className="side-link"
          >
            <CompassIcon size={18} />
            <span>Popular</span>
          </Link>
          <Link
            href="/tags"
            className="side-link"
          >
            <BookIcon size={18} />
            <span>Explore</span>
          </Link>
          <button
            type="button"
            onClick={() => setCreateCommunityOpen(true)}
            className="side-link text-pen font-bold w-full text-left"
          >
            <PlusIcon size={18} />
            <span>Start a community</span>
          </button>
        </div>

        {/* Feeds Section */}
        <div className="side-card hidden lg:block space-y-0.5">
          <div className="flex items-center justify-between px-2 py-1 text-[.72rem] font-bold text-muted uppercase tracking-wider">
            <span>FEEDS</span>
            <ChevronDownIcon size={14} />
          </div>
          <Link href="/messages" className="side-link">
            <ChatIcon size={17} />
            <span>Inbox & Messages</span>
          </Link>
          <Link href="/profile?tab=saved" className="side-link">
            <BookmarkIcon size={17} />
            <span>Saved Posts</span>
          </Link>
          <Link href="/moderation" className="side-link">
            <SettingsIcon size={17} />
            <span>Moderation</span>
          </Link>
          <Link href="/archive" className="side-link">
            <RssIcon size={17} />
            <span>All Posts Archive</span>
          </Link>
        </div>

        {/* Communities Section */}
        <div className="side-card hidden lg:block">
          <div className="flex items-center justify-between px-2 py-1 text-[.72rem] font-bold text-muted uppercase tracking-wider">
            <span>COMMUNITIES</span>
            <ChevronDownIcon size={14} />
          </div>

          <Link
            href="/series"
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted hover:text-ink hover:bg-line rounded mt-1 font-semibold"
          >
            <SettingsIcon size={14} />
            <span>Manage Communities</span>
          </Link>

          <ul className="mt-2 space-y-1">
            {subreddits.map((subgetit) => {
              const isFav = starred[subgetit.slug];
              const initial = subgetit.name[0]?.toUpperCase() ?? "G";
              return (
                <li key={subgetit.slug}>
                  <Link
                    href={`/g/${subgetit.slug}`}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded hover:bg-line text-ink transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="reddit-community-avatar !w-5 !h-5 !text-[0.65rem]">
                        {initial}
                      </div>
                      <span className="font-semibold truncate">g/{subgetit.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => toggleStar(subgetit.slug, e)}
                      className={`p-1 rounded hover:bg-paper ${
                        isFav ? "text-pen" : "text-muted opacity-40 group-hover:opacity-100"
                      }`}
                      aria-label="Favorite subgetit"
                    >
                      <StarIcon size={14} />
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* ---------------- Center Feed ---------------- */}
      <main className="min-w-0" aria-labelledby="feed-title">
        {/* Reddit-style Feed Sort Tabs & View Selector */}
        <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto" role="tablist">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-bold border-b-2 transition-all ${
                tab === "for-you"
                  ? "border-pen text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setTab("for-you")}
            >
              For You
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-bold border-b-2 transition-all ${
                tab === "following"
                  ? "border-pen text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setTab("following")}
            >
              Following
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-bold border-b-2 transition-all ${
                tab === "hot"
                  ? "border-pen text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setTab("hot")}
            >
              Hot
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-bold border-b-2 transition-all ${
                tab === "new"
                  ? "border-pen text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setTab("new")}
            >
              New
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-bold border-b-2 transition-all ${
                tab === "top"
                  ? "border-pen text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
              onClick={() => setTab("top")}
            >
              Top
            </button>
          </div>

          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink px-2.5 py-1 rounded-full border border-line bg-surface"
          >
            <CardViewIcon size={14} />
            <span>Card</span>
            <ChevronDownIcon size={12} />
          </button>
        </div>

        {/* Post Feed */}
        <ol className="space-y-3" aria-label="getit posts">
          {displayPosts.map((post) => (
            <PostRow key={post.id || post.slug} post={post} />
          ))}
        </ol>
      </main>

      {/* ---------------- Right Sidebar ---------------- */}
      <aside className="reddit-sidebar right-sidebar" aria-label="getit information">
        {/* RECENT POSTS Card (Matches Reddit's exact right-hand card) */}
        <div className="reddit-recent-posts">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-line bg-paper/50">
            <span className="text-[.72rem] font-bold text-muted uppercase tracking-wider">
              RECENT POSTS
            </span>
            {recentPosts.length > 0 && (
              <button
                type="button"
                className="text-xs font-bold text-pen hover:underline"
                onClick={clearRecent}
              >
                Clear
              </button>
            )}
          </div>

          {recentPosts.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted">No recent posts.</div>
          ) : (
            <div className="divide-y divide-line">
              {recentPosts.map((post) => (
                <Link
                  key={post.id || post.slug}
                  href={`/post?post=${post.id || post.slug}`}
                  className="reddit-recent-item group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[0.7rem] text-muted">
                      <div className="reddit-community-avatar !w-4 !h-4 !text-[0.55rem]">
                        {post.series[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-ink group-hover:underline truncate">
                        g/{post.series}
                      </span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>

                    <p className="mt-1 font-bold text-xs leading-snug line-clamp-2 text-ink group-hover:text-pen transition-colors">
                      {post.title}
                    </p>

                    <div className="mt-1 text-[0.68rem] text-muted">
                      {post.karma ?? post.upvotes} karma • {post.comments} comments
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded bg-paper border border-line shrink-0 flex items-center justify-center text-xs font-mono font-bold text-muted">
                    {post.tags[0] ? `#${post.tags[0].slice(0, 3)}` : "POST"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Community Info Card */}
        <div className="side-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="reddit-header-logo !w-6 !h-6">
              <div className="reddit-logo-dot !w-2.5 !h-2.5" />
            </div>
            <p className="side-heading !p-0">ABOUT GETIT</p>
          </div>
          <p className="text-xs leading-relaxed text-muted mt-2">
            Welcome to getit! The community that gets it. Ask questions, discuss DBMS topics, and
            share discoveries.
          </p>
          <div className="mt-3 pt-3 border-t border-line grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="font-bold text-ink">{stats ? stats.totalUsers : "—"}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Members</p>
            </div>
            <div>
              <p className="font-bold text-ink">{stats ? stats.totalPosts : "—"}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Posts</p>
            </div>
            <div>
              <p className="font-bold text-ink">{stats ? stats.totalCommunities : "—"}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Subgetits</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Link href="/post" className="btn w-full !py-2 !text-xs text-center">
              Create Post
            </Link>
            <button
              type="button"
              onClick={() => setCreateCommunityOpen(true)}
              className="btn btn-outline w-full !py-2 !text-xs inline-flex items-center justify-center gap-1.5"
            >
              <PlusIcon size={14} />
              Create Community
            </button>
          </div>
        </div>

        {/* Community Rules */}
        <div className="side-card text-xs text-muted">
          <p className="font-bold text-ink mb-2">getit rules</p>
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>Be useful and specific.</li>
            <li>Be kind to people learning.</li>
            <li>Vote for better conversations.</li>
            <li>Search before posting duplicate questions.</li>
          </ol>
        </div>
      </aside>

      <CreateCommunityModal
        isOpen={createCommunityOpen}
        onClose={() => setCreateCommunityOpen(false)}
      />
    </div>
  );
}
