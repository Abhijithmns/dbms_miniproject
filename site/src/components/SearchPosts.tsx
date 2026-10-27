"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useRef, useState, type FormEvent } from "react";
import { SearchIcon } from "@/components/Icons";
import { PostRow, TagLink } from "@/components/PostRow";
import { POSTS, plural, seriesName } from "@/data/posts";
import { asset } from "@/lib/asset";

/** What a post is searched by: title, summary, topics and subgetit name, in lower case. */
const HAYSTACKS = POSTS.map((p) => [p.title, p.excerpt, p.tags.join(" "), seriesName(p.series)].join(" ").toLowerCase());

/**
 * Search as you type. Every word typed must appear in a post's title, summary, topics or subgetit;
 * matches are highlighted. The query is kept in ?q= so a search can be shared. Press "/" on any
 * page to come here (src/components/SearchShortcut.tsx).
 */
function SearchView({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = value.trim();
  const terms = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8), [query]);
  const list = POSTS.filter((_, i) => terms.every((t) => HAYSTACKS[i].includes(t)));

  function update(next: string) {
    setValue(next);
    const url = new URL(window.location.href);
    if (next.trim()) url.searchParams.set("q", next.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <form
        action={asset("/search")}
        method="get"
        role="search"
        className="mt-10 max-w-2xl"
        data-search-form=""
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          update(value);
        }}
      >
        <label htmlFor="search-q" className="label">
          Search posts
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <SearchIcon size={20} />
          </span>
          <input
            ref={inputRef}
            id="search-q"
            name="q"
            type="search"
            className="input !py-3 !pl-11 text-lg"
            placeholder="Try “mysql”, “redis” or “joins”"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="search-help"
            data-search-input=""
            value={value}
            onChange={(e) => update(e.currentTarget.value)}
          />
        </div>
        <p id="search-help" className="mt-2 text-sm text-muted">
          Searches titles, summaries, topics and communities. Press <kbd>/</kbd> on any page to jump here.
        </p>
      </form>
      <div className="mt-12 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-3">
        <h2 className="display text-2xl font-bold">Results</h2>
        <p className="font-mono text-sm text-muted" aria-live="polite" data-search-status="">
          {terms.length
            ? `${plural(list.length, "post matches", "posts match")} “${query}”`
            : plural(list.length, "post", "posts")}
        </p>
      </div>
      <ol data-search-results="">
        {list.map((p) => (
          <PostRow key={p.slug} post={p} terms={terms} />
        ))}
      </ol>
      <div className="py-14 text-center" data-search-empty="" hidden={list.length > 0}>
        <p className="display text-2xl font-bold">Nothing in the project feed matches that.</p>
        <p className="mt-3 text-muted">Check the spelling, try a shorter word, or start from a tag:</p>
        <p className="mt-5 flex flex-wrap justify-center gap-2">
          {["mysql", "redis", "ddl", "queries"].map((t) => (
            <TagLink key={t} tag={t} />
          ))}
        </p>
        <button
          type="button"
          className="btn-ghost mt-8"
          data-search-clear=""
          onClick={() => {
            update("");
            inputRef.current?.focus();
          }}
        >
          Clear the search
        </button>
      </div>
    </>
  );
}

function SearchFromUrl() {
  return <SearchView initial={(useSearchParams().get("q") ?? "").slice(0, 100)} />;
}

/** Search, starting from ?q= (every post until the browser has read it). */
export function SearchPosts() {
  return (
    <Suspense fallback={<SearchView initial="" />}>
      <SearchFromUrl />
    </Suspense>
  );
}
