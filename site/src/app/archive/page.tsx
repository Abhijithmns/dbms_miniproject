import Link from "next/link";
import { PostRow } from "@/components/PostRow";
import { POSTS, plural, type Post } from "@/data/posts";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Home", "The getit community feed: questions, advice, recommendations, and useful conversations.");

/** Posts grouped by the year of their date, newest year first. */
function byYear(): [string, Post[]][] {
  const years = new Map<string, Post[]>();
  for (const p of POSTS) years.set(p.date.slice(0, 4), [...(years.get(p.date.slice(0, 4)) ?? []), p]);
  return Array.from(years).sort(([a], [b]) => b.localeCompare(a));
}

export default function ArchivePage() {
  const years = byYear();
  return (
    <section className="wrap pt-12 md:pt-16" aria-labelledby="archive-title">
      <div className="margin-rule pl-5 sm:pl-8">
        <p className="kicker">archive</p>
        <h1 id="archive-title" className="display mt-3 text-4xl font-bold sm:text-5xl">
          Community feed, by date
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          <span data-post-count="">{plural(POSTS.length, "post", "posts")}</span> from the getit community. Looking for something in particular?{" "}
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
      <nav
        className="mt-10 flex flex-wrap items-center gap-2 font-mono text-sm"
        aria-label="Jump to a year"
        data-archive-years=""
      >
        <span className="mr-1 text-muted">Jump to</span>
        {years.map(([y]) => (
          <a key={y} className="tag no-hash" href={`#year-${y}`}>
            {y}
          </a>
        ))}
      </nav>
      <div className="mt-6" data-archive="">
        {years.map(([y, posts]) => (
          <section key={y} className="mt-12 first:mt-0" aria-labelledby={`y${y}`} id={`year-${y}`}>
            <h2
              id={`y${y}`}
              className="display flex items-baseline justify-between gap-3 border-b-2 border-ink pb-3 text-3xl font-bold"
            >
              {y} <span className="font-mono text-sm font-normal text-muted">{plural(posts.length, "post", "posts")}</span>
            </h2>
            <ol>
              {posts.map((p) => (
                <PostRow key={p.slug} post={p} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </section>
  );
}
