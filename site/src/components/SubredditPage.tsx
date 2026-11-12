"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookIcon,
  BookmarkIcon,
  CakeIcon,
  ChatIcon,
  ChevronDownIcon,
  CompassIcon,
  GlobeIcon,
  HomeIcon,
  MoreHorizontalIcon,
  PinIcon,
  PlusIcon,
  RssIcon,
  SettingsIcon,
  ShareIcon,
  ShieldIcon,
} from "@/components/Icons";
import { PostRow } from "@/components/PostRow";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";
import { toast } from "@/components/Toast";
import { apiPostToPost, POSTS, SERIES, type ApiPost, type Post, type Series } from "@/data/posts";
import { apiRequest } from "@/lib/api";
import { copyText } from "@/lib/clipboard";

interface SubredditDetails {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  memberCount?: number;
  postCount?: number;
  joined?: boolean;
}

export function SubredditPage({ slug }: { slug: string }) {
  const [subgetit, setSubgetit] = useState<SubredditDetails | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allSubreddits, setAllSubreddits] = useState<Series[]>(SERIES);
  const [sort, setSort] = useState<"best" | "hot" | "new" | "top">("best");
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState(0);
  const [showHighlights, setShowHighlights] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);

  // Fetch Subreddit details
  useEffect(() => {
    let active = true;
    apiRequest<SubredditDetails>(`/api/subgetits/${slug}`)
      .then((data) => {
        if (!active) return;
        setSubgetit(data);
        setJoined(Boolean(data.joined));
        setMembers(data.memberCount ?? 0);
      })
      .catch(() => {
        // Fallback to static series
        if (!active) return;
        const fallback = SERIES.find((s) => s.slug === slug || s.name === slug);
        if (fallback) {
          setSubgetit({
            id: fallback.id ?? 1,
            name: fallback.name,
            description: fallback.description,
            createdAt: "2026-10-27T00:00:00Z",
            memberCount: 2,
            postCount: POSTS.filter((p) => p.series === fallback.slug).length,
            joined: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  // Fetch all subreddits for left sidebar
  useEffect(() => {
    apiRequest<Array<{ id: number; name: string; description: string }>>("/api/subgetits")
      .then((subs) => {
        if (Array.isArray(subs) && subs.length > 0) {
          setAllSubreddits(
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

  // Fetch filtered posts for this subreddit with current sort
  useEffect(() => {
    let active = true;
    apiRequest<ApiPost[]>(`/api/posts?subreddit=${encodeURIComponent(slug)}&sort=${sort}`)
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data)) {
          setPosts(data.map(apiPostToPost));
        }
      })
      .catch(() => {
        if (!active) return;
        // Fallback filter
        const filtered = POSTS.filter(
          (p) => p.series.toLowerCase() === slug.toLowerCase() || p.subgetit?.toLowerCase() === slug.toLowerCase()
        );
        setPosts(filtered);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, sort]);

  async function handleToggleJoin() {
    if (!subgetit) return;
    const next = !joined;
    setJoined(next);
    setMembers((m) => (next ? m + 1 : Math.max(0, m - 1)));
    toast(next ? `Joined g/${subgetit.name}` : `Left g/${subgetit.name}`);

    try {
      await apiRequest(`/api/subgetits/${subgetit.id || subgetit.name}/join`, {
        method: next ? "POST" : "DELETE",
      });
    } catch {}
  }

  function handleShare() {
    copyText(window.location.href, () => {
      toast("Link copied to clipboard!");
    });
    setMenuOpen(false);
  }

  const displayName = subgetit?.name || slug;
  const initial = displayName[0]?.toUpperCase() ?? "G";

  // Pick top posts for Community highlights (top 3)
  const highlightPosts = [...posts]
    .sort((a, b) => (b.karma ?? b.upvotes) - (a.karma ?? a.upvotes))
    .slice(0, 3);

  const formattedDate = subgetit?.createdAt
    ? new Date(subgetit.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Oct 27, 2026";

  return (
    <div className="w-full pb-16">
      {/* ---------------- Subreddit Banner ---------------- */}
      <div className="reddit-community-banner" aria-hidden="true">
        <div className="reddit-community-banner-pattern" />
      </div>

      {/* ---------------- Subreddit Header Bar ---------------- */}
      <div className="reddit-community-header-bar">
        <div className="reddit-community-header-inner">
          {/* Left: Avatar + Title */}
          <div className="flex items-end gap-3 sm:gap-4 min-w-0">
            <div className="reddit-community-avatar-lg" aria-hidden="true">
              <span className="font-display tracking-tight text-white">{`r/`}</span>
            </div>
            <div className="pb-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-extrabold text-ink tracking-tight truncate">
                r/{displayName}
              </h1>
              <p className="text-xs text-muted font-mono truncate hidden sm:block">
                g/{displayName} • {members} {members === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          {/* Right: Actions (+ Create, Join, Menu) */}
          <div className="flex items-center gap-2 pb-1 relative">
            <Link
              href={`/post?create=true&community=${displayName}`}
              className="reddit-create-btn !h-9 !px-4 !rounded-full !font-bold !bg-ink !text-paper hover:!opacity-90 transition-opacity"
            >
              <PlusIcon size={16} />
              <span>Create</span>
            </Link>

            <button
              type="button"
              onClick={handleToggleJoin}
              className={`reddit-join-btn !h-9 !px-5 !rounded-full !text-sm !font-bold ${
                joined ? "is-joined" : ""
              }`}
            >
              {joined ? "Joined" : "Join"}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="reddit-more-btn !w-9 !h-9 border border-line rounded-full"
                aria-label="More community options"
              >
                <MoreHorizontalIcon />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-xl border border-line bg-surface p-1 shadow-xl text-xs">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-line rounded-lg font-medium"
                  >
                    <ShareIcon size={14} /> Copy community link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast(`Muted updates from r/${displayName}`);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-line rounded-lg font-medium text-muted hover:text-ink"
                  >
                    <ShieldIcon size={14} /> Mute r/{displayName}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Main Content Layout ---------------- */}
      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 reddit-layout pt-4 md:pt-6">
        {/* ---------------- Left Sidebar ---------------- */}
        <aside className="reddit-sidebar left-sidebar" aria-label="Community navigation">
          {/* Core Links */}
          <div className="side-card space-y-0.5">
            <Link href="/" className="side-link">
              <HomeIcon size={18} />
              <span>Home</span>
            </Link>
            <Link href="/archive" className="side-link">
              <CompassIcon size={18} />
              <span>Popular</span>
            </Link>
            <Link href="/tags" className="side-link">
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
              {allSubreddits.map((sub) => {
                const isActive = sub.slug.toLowerCase() === slug.toLowerCase();
                const subInitial = sub.name[0]?.toUpperCase() ?? "G";
                return (
                  <li key={sub.slug}>
                    <Link
                      href={`/g/${sub.slug}`}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded transition-colors group ${
                        isActive
                          ? "bg-line text-ink font-bold"
                          : "text-ink hover:bg-line"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="reddit-community-avatar !w-5 !h-5 !text-[0.65rem]">
                          {subInitial}
                        </div>
                        <span className="truncate">r/{sub.name}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-pen" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* ---------------- Center Feed ---------------- */}
        <main className="min-w-0" aria-label={`Posts in r/${displayName}`}>
          {/* Sort bar: Best, Hot, New, Top */}
          <div className="flex items-center justify-between border-b border-line pb-2 mb-4">
            <div className="flex items-center gap-1 sm:gap-2" role="tablist">
              {(["best", "hot", "new", "top"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSort(s)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold capitalize transition-colors ${
                    sort === s
                      ? "bg-line text-ink"
                      : "text-muted hover:text-ink hover:bg-paper"
                  }`}
                >
                  {s} {s === "best" ? "▾" : ""}
                </button>
              ))}
            </div>

            <div className="text-xs text-muted font-mono">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </div>
          </div>

          {/* Community Highlights Section (Matching Reddit screenshot) */}
          {highlightPosts.length > 0 && (
            <section className="mb-6" aria-label="Community highlights">
              <div className="flex items-center justify-between text-xs font-bold text-muted mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <PinIcon size={14} className="text-pen" />
                  <span className="uppercase tracking-wider">Community highlights</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHighlights((h) => !h)}
                  className="p-1 hover:text-ink transition-colors"
                  aria-label="Toggle highlights"
                >
                  <ChevronDownIcon
                    size={14}
                    className={`transform transition-transform ${showHighlights ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {showHighlights && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {highlightPosts.map((hp) => (
                    <Link
                      key={hp.id}
                      href={hp.href}
                      className="reddit-highlight-card group"
                    >
                      <h3 className="font-bold text-xs sm:text-sm text-ink line-clamp-3 group-hover:underline leading-snug">
                        {hp.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-line/60 text-[0.72rem] text-muted font-mono">
                        <span className="w-4 h-4 rounded-full bg-pen text-white text-[9px] grid place-items-center font-bold">
                          {hp.author?.[0]?.toUpperCase() ?? "U"}
                        </span>
                        <span className="truncate">u/{hp.author}</span>
                        <span className="ml-auto font-bold text-ink">
                          {hp.karma ?? hp.upvotes} ▲
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Posts Feed */}
          {loading ? (
            <div className="p-8 text-center text-muted font-mono text-sm">
              Loading r/{displayName} feed…
            </div>
          ) : posts.length > 0 ? (
            <ul className="space-y-3">
              {posts.map((post) => (
                <PostRow key={post.id || post.slug} post={post} />
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-line bg-surface/50">
              <div className="reddit-community-avatar-lg !w-14 !h-14 !text-xl mx-auto mb-3 !mt-0">
                {initial}
              </div>
              <h3 className="text-lg font-bold text-ink">No posts in r/{displayName} yet</h3>
              <p className="mt-1 text-sm text-muted max-w-sm mx-auto">
                Be the first to share something with this community.
              </p>
              <Link
                href={`/post?create=true&community=${displayName}`}
                className="btn mt-4 inline-flex items-center gap-2"
              >
                <PlusIcon size={16} /> Create Post
              </Link>
            </div>
          )}
        </main>

        {/* ---------------- Right Sidebar ("About Community") ---------------- */}
        <aside className="reddit-sidebar right-sidebar" aria-label="About community">
          {/* About Community Card */}
          <div className="side-card space-y-3 !p-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                About Community
              </span>
              <span className="text-xs font-bold text-ink">r/{displayName}</span>
            </div>

            <p className="text-xs text-ink leading-relaxed">
              {subgetit?.description || "A dedicated getit community for discussions, resources, and shared learning."}
            </p>

            <div className="pt-2 border-t border-line space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <CakeIcon size={15} />
                <span>Created {formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <GlobeIcon size={15} />
                <span>Public • Open community</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
              <div className="bg-paper p-2 rounded-lg border border-line">
                <div className="text-base font-extrabold text-ink font-mono">{members}</div>
                <div className="text-[0.68rem] text-muted uppercase font-bold">Members</div>
              </div>
              <div className="bg-paper p-2 rounded-lg border border-line">
                <div className="text-base font-extrabold text-ink font-mono">{posts.length}</div>
                <div className="text-[0.68rem] text-muted uppercase font-bold">Posts</div>
              </div>
            </div>

            <Link
              href={`/post?create=true&community=${displayName}`}
              className="w-full btn !bg-ink !text-paper hover:!opacity-90 flex items-center justify-center gap-2 !py-2 !text-xs !font-bold"
            >
              <PlusIcon size={15} /> Create Post
            </Link>
          </div>

          {/* Community Rules Card */}
          <div className="reddit-rules-card">
            <div className="px-3.5 py-2.5 border-b border-line bg-paper/50">
              <h2 className="text-xs font-bold text-ink uppercase tracking-wider">
                r/{displayName} Rules
              </h2>
            </div>
            <ol className="divide-y divide-line">
              <li className="reddit-rule-row">
                <span className="reddit-rule-num">1</span>
                <div>
                  <div className="font-bold text-ink">Be respectful and civil</div>
                  <div className="text-muted text-[0.72rem] mt-0.5">
                    Treat fellow members with courtesy. Constructive debate is encouraged.
                  </div>
                </div>
              </li>
              <li className="reddit-rule-row">
                <span className="reddit-rule-num">2</span>
                <div>
                  <div className="font-bold text-ink">Stay on topic</div>
                  <div className="text-muted text-[0.72rem] mt-0.5">
                    Posts must relate directly to {displayName} and community discussions.
                  </div>
                </div>
              </li>
              <li className="reddit-rule-row">
                <span className="reddit-rule-num">3</span>
                <div>
                  <div className="font-bold text-ink">No spam or duplicates</div>
                  <div className="text-muted text-[0.72rem] mt-0.5">
                    Search previous threads before posting repeated questions.
                  </div>
                </div>
              </li>
              <li className="reddit-rule-row">
                <span className="reddit-rule-num">4</span>
                <div>
                  <div className="font-bold text-ink">Format code and queries cleanly</div>
                  <div className="text-muted text-[0.72rem] mt-0.5">
                    Use code blocks and provide clear problem descriptions when asking questions.
                  </div>
                </div>
              </li>
              <li className="reddit-rule-row">
                <span className="reddit-rule-num">5</span>
                <div>
                  <div className="font-bold text-ink">DBMS integrity</div>
                  <div className="text-muted text-[0.72rem] mt-0.5">
                    All actions follow relational constraints and audit logs.
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* Moderators Card */}
          <div className="side-card !p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider">
              <ShieldIcon size={14} className="text-pen" />
              <span>Moderators</span>
            </div>
            <div className="text-xs space-y-1 font-mono text-muted">
              <div>u/getit_demo</div>
              <div>u/admin</div>
              <div>u/alice_dml</div>
            </div>
            <Link
              href="/messages?to=moderators"
              className="inline-block text-xs font-semibold text-pen hover:underline pt-1"
            >
              Message the mods
            </Link>
          </div>
        </aside>
      </div>

      <CreateCommunityModal
        isOpen={createCommunityOpen}
        onClose={() => setCreateCommunityOpen(false)}
      />
    </div>
  );
}
