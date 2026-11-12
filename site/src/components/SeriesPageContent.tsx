"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon, PlusIcon } from "@/components/Icons";
import { pad2, type Post, type ApiPost, apiPostToPost } from "@/data/posts";
import { SubgetitActions } from "@/components/SubgetitActions";
import { CreateCommunityButton } from "@/components/CreateCommunityButton";
import { apiRequest } from "@/lib/api";

type LiveSubgetit = {
  id: number;
  name: string;
  description: string;
  memberCount?: number;
  postCount?: number;
};

export function SeriesPageContent() {
  const [subgetits, setSubgetits] = useState<LiveSubgetit[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<LiveSubgetit[]>("/api/subgetits").catch(() => []),
      apiRequest<ApiPost[]>("/api/posts").catch(() => []),
    ]).then(([subs, rawPosts]) => {
      if (Array.isArray(subs)) {
        setSubgetits(subs);
      }
      if (Array.isArray(rawPosts)) {
        setPosts(rawPosts.map(apiPostToPost));
      }
      setLoading(false);
    });
  }, []);

  return (
    <>
      <section className="wrap pt-12 md:pt-16" aria-labelledby="series-title">
        <div className="margin-rule pl-5 sm:pl-8">
          <p className="kicker">subgetits</p>
          <h1 id="series-title" className="display mt-3 text-4xl font-bold sm:text-5xl">
            Subgetits
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Every subgetit has its own rhythm, regulars, and conversations. Drop in, read around, or start a thread.
          </p>
          <div className="mt-6">
            <CreateCommunityButton className="btn inline-flex items-center gap-2">
              Start a Community
            </CreateCommunityButton>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="wrap mt-14">
          <div className="p-8 text-center text-muted font-mono">
            Loading live communities from MariaDB…
          </div>
        </section>
      ) : subgetits.length === 0 ? (
        <section className="wrap mt-14">
          <div className="sheet p-8 text-center text-muted">
            <p className="text-base font-bold text-ink">No subgetits found in database.</p>
            <p className="text-sm mt-1">Create the first one using the button above!</p>
          </div>
        </section>
      ) : (
        subgetits.map((s, i) => {
          const subPosts = posts.filter(
            (p) =>
              p.series?.toLowerCase() === s.name.toLowerCase() ||
              p.subgetit?.toLowerCase() === s.name.toLowerCase() ||
              p.subredditId === s.id
          );

          return (
            <section key={s.name} className="wrap mt-14" id={s.name} aria-labelledby={`${s.name}-title`}>
              <div className="sheet reveal grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
                <div>
                  <p className="font-mono text-sm text-pen">
                    {pad2(i + 1)} / {pad2(subgetits.length)}
                  </p>
                  <h2 id={`${s.name}-title`} className="display mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                    r/{s.name}
                  </h2>
                  <p className="mt-3 text-lg text-muted">{s.description || "Community discussions and topics."}</p>
                  <p className="mt-5 font-mono text-sm text-muted">
                    {subPosts.length} posts {s.memberCount !== undefined ? `· ${s.memberCount} members` : ""}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    <Link href={`/g/${s.name}`} className="btn inline-flex items-center gap-2">
                      Visit r/{s.name} <ArrowRightIcon />
                    </Link>
                    <SubgetitActions name={s.name} subredditId={s.id} />
                  </div>
                </div>

                {subPosts.length > 0 ? (
                  <ol className="divide-y divide-dashed divide-line border-y border-dashed border-line">
                    {subPosts.slice(0, 5).map((p, index) => (
                      <li key={p.id || p.slug} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-4">
                        <span className="font-mono text-lg font-semibold text-pen">{pad2(index + 1)}</span>
                        <div>
                          <h3 className="post-title">
                            <Link href={`/post?post=${p.id || p.slug}`}>{p.title}</Link>
                          </h3>
                          <p className="mt-1 text-muted text-sm line-clamp-2">{p.excerpt}</p>
                          <p className="mt-2 font-mono text-xs text-muted">
                            <time dateTime={p.date}>{p.date}</time> · {p.karma ?? 0} karma · {p.comments} comments
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed border-line rounded-xl text-center">
                    <p className="text-sm font-semibold text-muted">No posts in this subgetit yet.</p>
                    <Link
                      href={`/post?create=true&community=${s.id}`}
                      className="btn mt-3 !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
                    >
                      <PlusIcon size={14} /> Create the first post
                    </Link>
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}

      <section className="wrap mt-14" aria-labelledby="next-series-title">
        <div className="rounded-md border border-dashed border-ink p-6 sm:p-8">
          <h2 id="next-series-title" className="display text-xl font-bold">
            New here?
          </h2>
          <p className="mt-3 max-w-3xl text-muted">
            Start with the home feed, vote on something you get, and leave a comment. Once you log in, you can create
            posts, earn karma, give awards, and start your own community.
          </p>
        </div>
      </section>
    </>
  );
}
