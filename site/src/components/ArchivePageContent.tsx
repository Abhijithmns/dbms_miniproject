"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PostRow } from "@/components/PostRow";
import { apiPostToPost, plural, type ApiPost, type Post } from "@/data/posts";
import { apiRequest } from "@/lib/api";

export function ArchivePageContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<ApiPost[]>("/api/posts")
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data.map(apiPostToPost));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const years = new Map<string, Post[]>();
  for (const p of posts) {
    const yr = (p.date || "").slice(0, 4) || "Recent";
    years.set(yr, [...(years.get(yr) ?? []), p]);
  }
  const groupedYears = Array.from(years).sort(([a], [b]) => b.localeCompare(a));

  return (
    <section className="wrap pt-12 md:pt-16" aria-labelledby="archive-title">
      <div className="margin-rule pl-5 sm:pl-8">
        <p className="kicker">archive</p>
        <h1 id="archive-title" className="display mt-3 text-4xl font-bold sm:text-5xl">
          Community feed, by date
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          <span>{plural(posts.length, "post", "posts")}</span> from the getit community. Looking for something in particular?{" "}
          <Link href="/search" className="link text-ink">
            Search
          </Link>{" "}
          or{" "}
          <Link href="/tags" className="link text-ink">
            browse by tag
          </Link>
          .
        </p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted font-mono">Loading archive from database…</div>
      ) : posts.length === 0 ? (
        <div className="p-10 text-center text-muted">No posts found in database.</div>
      ) : (
        <>
          <nav
            className="mt-10 flex flex-wrap items-center gap-2 font-mono text-sm"
            aria-label="Jump to a year"
          >
            <span className="text-muted">Years:</span>
            {groupedYears.map(([year]) => (
              <a key={year} href={`#year-${year}`} className="btn-ghost !px-2.5 !py-1 text-xs">
                {year}
              </a>
            ))}
          </nav>

          <div className="mt-12 space-y-16">
            {groupedYears.map(([year, yearPosts]) => (
              <section key={year} id={`year-${year}`} aria-labelledby={`heading-${year}`}>
                <div className="flex items-baseline justify-between border-b border-line pb-2">
                  <h2 id={`heading-${year}`} className="display text-2xl font-bold">
                    {year}
                  </h2>
                  <span className="font-mono text-xs text-muted">
                    {plural(yearPosts.length, "post", "posts")}
                  </span>
                </div>
                <ul className="mt-6 divide-y divide-line/60">
                  {yearPosts.map((post) => (
                    <PostRow key={post.id || post.slug} post={post} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
