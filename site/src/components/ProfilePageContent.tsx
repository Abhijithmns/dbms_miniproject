"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  BookmarkIcon,
  CompassIcon,
  PlusIcon,
  UserIcon,
} from "@/components/Icons";
import { PostRow } from "@/components/PostRow";
import { ProfileEditor } from "@/components/ProfileEditor";
import { UserAvatar } from "@/components/UserAvatar";
import { USER_STORAGE_KEY } from "@/components/UserIdentity";
import { apiPostToPost, type ApiPost, type Post } from "@/data/posts";
import { apiRequest } from "@/lib/api";

export function ProfilePageContent() {
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<"profile" | "saved" | null>(null);
  const activeTab = selectedTab ?? (searchParams.get("tab") === "saved" ? "saved" : "profile");

  const username = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => window.localStorage.getItem(USER_STORAGE_KEY) || "getit_demo",
    () => "getit_demo"
  );

  const [karma, setKarma] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(6);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Load user profile details
  useEffect(() => {
    if (!username) return;
    let active = true;
    apiRequest<{ id?: number; karma: number; profileImage?: string }>(`/api/profile/${username}`)
      .then((data) => {
        if (!active) return;
        setKarma(data.karma ?? 0);
        setProfileImage(data.profileImage || null);
        if (data.id) setUserId(data.id);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [username]);

  // Load saved posts from Redis when saved tab is selected
  useEffect(() => {
    if (activeTab !== "saved") return;
    let active = true;

    apiRequest<ApiPost[]>("/api/redis/saved-posts")
      .then((items) => {
        if (!active) return;
        if (Array.isArray(items)) {
          setSavedPosts(items.map(apiPostToPost));
        }
      })
      .catch(() => {
        if (!active) return;
        setSavedPosts([]);
      })
      .finally(() => {
        if (active) setLoadingSaved(false);
      });

    return () => {
      active = false;
    };
  }, [activeTab]);

  return (
    <div className="w-full max-w-[1000px] mx-auto px-2 sm:px-4 py-6 md:py-10">
      {/* ---------------- Profile Banner & Header ---------------- */}
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar image={profileImage} username={username} size={64} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-ink">u/{username}</h1>
                <span className="bg-line text-muted text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                  User ID: {userId}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                <span className="font-semibold text-pen">{karma} karma</span>
                <span>•</span>
                <span>getit member</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/post"
              className="btn !py-2 !px-4 !text-xs font-bold inline-flex items-center gap-1.5"
            >
              <PlusIcon size={15} /> Create Post
            </Link>
          </div>
        </div>

        {/* Reddit-style Profile Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-line mt-6 pt-3" role="tablist">
          <button
            type="button"
            onClick={() => setSelectedTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeTab === "profile"
                ? "bg-ink text-paper"
                : "text-muted hover:text-ink hover:bg-paper"
            }`}
          >
            <UserIcon size={15} />
            <span>Profile & Avatar</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("saved")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeTab === "saved"
                ? "bg-ink text-paper"
                : "text-muted hover:text-ink hover:bg-paper"
            }`}
          >
            <BookmarkIcon size={15} />
            <span>Saved Posts</span>
            {savedPosts.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "saved" ? "bg-paper text-ink" : "bg-line text-muted"
              }`}>
                {savedPosts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ---------------- Tab Content ---------------- */}
      {activeTab === "profile" ? (
        <div>
          <ProfileEditor />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Redis NoSQL Architecture Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-line bg-paper/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-ink">NoSQL Redis Set Cache</span>
              <span className="text-muted font-mono">
                Key: <code className="bg-line px-1.5 py-0.5 rounded text-[11px]">getit:saved_posts:{userId}</code>
              </span>
            </div>
            <div className="text-muted text-[11px] font-mono">
              In-memory $O(1)$ fast retrieval
            </div>
          </div>

          {/* Saved Posts Feed */}
          {loadingSaved ? (
            <div className="p-12 text-center text-muted font-mono text-sm">
              Retrieving saved posts from Redis…
            </div>
          ) : savedPosts.length > 0 ? (
            <ul className="space-y-3">
              {savedPosts.map((post) => (
                <PostRow key={post.id || post.slug} post={post} />
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-line bg-surface/50">
              <div className="w-12 h-12 rounded-full bg-paper border border-line text-muted flex items-center justify-center mx-auto mb-3">
                <BookmarkIcon size={22} />
              </div>
              <h3 className="text-base font-bold text-ink">No saved posts yet</h3>
              <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                When you click the three dots <span className="font-bold">···</span> on any post and choose &quot;Save post&quot;, it gets saved to your in-memory Redis cache and listed here.
              </p>
              <Link
                href="/"
                className="btn mt-4 inline-flex items-center gap-2 !py-2 !px-4 !text-xs"
              >
                <CompassIcon size={15} /> Explore Home Feed
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
