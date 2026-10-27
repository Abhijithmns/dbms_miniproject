"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PostRow } from "@/components/PostRow";
import { POSTS, plural, tagCounts } from "@/data/posts";

const TAGS = tagCounts();

/**
 * The topic browser: "All" plus one toggle button per topic (most used first). The chosen topic lives in
 * the address, so it can be shared. ?tag= is matched regardless of case; a
 * value that isn't a tag shows every post and a short notice.
 */
function TagBrowserView({ requested }: { requested: string | null }) {
  const wanted = (requested ?? "").trim();
  const current = wanted ? (TAGS.find(([t]) => t.toLowerCase() === wanted.toLowerCase())?.[0] ?? "") : "";
  const unknown = wanted !== "" && !current;
  const list = POSTS.filter((p) => !current || p.tags.includes(current));

  function choose(tag: string) {
    const url = new URL(window.location.href);
    if (tag) url.searchParams.set("tag", tag);
    else url.searchParams.delete("tag");
    // Next.js keeps useSearchParams() in step with replaceState.
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter by tag" data-tag-filter="">
        <button type="button" className="tag no-hash" data-tag="" aria-pressed={!current} onClick={() => choose("")}>
          All<span className="count">{POSTS.length}</span>
        </button>
        {TAGS.map(([t, n]) => (
          <button
            key={t}
            type="button"
            className="tag"
            data-tag={t}
            aria-pressed={t === current}
            onClick={() => choose(t)}
          >
            {t}
            <span className="count">{n}</span>
          </button>
        ))}
      </div>
      <p className="mt-5 rounded-md border border-line bg-surface px-4 py-3 text-sm" data-tag-notice="" hidden={!unknown}>
        {unknown ? `There is no topic called “${wanted.slice(0, 40)}”, so here is every post.` : ""}
      </p>
      <div className="mt-12 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <h2 className="display text-2xl font-bold" data-tag-heading="">
          {current ? `Posts about #${current}` : "All posts"}
        </h2>
        <p className="font-mono text-sm text-muted" aria-live="polite" data-tag-count="">
          {plural(list.length, "post", "posts")}
        </p>
      </div>
      <ol data-tag-results="">
        {list.map((p) => (
          <PostRow key={p.slug} post={p} />
        ))}
      </ol>
    </>
  );
}

function TagBrowserFromUrl() {
  return <TagBrowserView requested={useSearchParams().get("tag")} />;
}

/** The tag browser, reading ?tag= from the address (all posts until the browser has it). */
export function TagBrowser() {
  return (
    <Suspense fallback={<TagBrowserView requested={null} />}>
      <TagBrowserFromUrl />
    </Suspense>
  );
}
