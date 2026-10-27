import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";
import { PostRow } from "@/components/PostRow";
import { UserIdentity } from "@/components/UserIdentity";
import { POSTS, SERIES } from "@/data/posts";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(`${site.name} — ${site.tagline}`, site.description, { absolute: true });

export default function HomePage() {
  return (
    <>
      <div className="reddit-topline">
        <div className="wrap flex items-center justify-between gap-4 py-2 text-xs text-muted">
          <span>Home · Best conversations from getit</span>
          <span className="hidden sm:inline">Be curious. Be useful. Getit.</span>
        </div>
      </div>

      <section className="wrap reddit-layout pt-6 md:pt-8">
        <aside className="reddit-sidebar left-sidebar" aria-label="Community navigation">
          <div className="side-card">
            <Link href="/" className="side-link side-link-active">⌂ <span>Home</span></Link>
            <Link href="/archive" className="side-link">▤ <span>Popular</span></Link>
            <Link href="/series" className="side-link">◉ <span>Subgetits</span></Link>
            <Link href="/tags" className="side-link"># <span>Topics</span></Link>
          </div>
          <div className="side-card hidden lg:block">
            <p className="side-heading">YOUR GETIT</p>
            <Link href="/subscribe" className="side-link">＋ <span>Log in</span></Link>
            <Link href="/about" className="side-link">ⓘ <span>About getit</span></Link>
          </div>
        </aside>

        <main className="min-w-0" aria-labelledby="feed-title">
          <div className="reddit-welcome-card">
            <div>
              <p className="kicker">welcome to getit</p>
              <h1 id="feed-title" className="display mt-2 text-3xl font-bold sm:text-4xl">The community that gets it.</h1>
              <p className="mt-3 max-w-2xl text-muted">Ask questions, share discoveries, and find the people who understand exactly what you mean.</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/post" className="btn">Create post <ArrowRightIcon /></Link>
              <UserIdentity mobile />
            </div>
          </div>

          <div className="feed-toolbar mt-5" role="tablist" aria-label="Feed sort">
            <button type="button" className="feed-tab feed-tab-active">Best</button>
            <button type="button" className="feed-tab">Hot</button>
            <button type="button" className="feed-tab">New</button>
            <button type="button" className="feed-tab">Top</button>
          </div>

          <ol className="mt-3 space-y-3" aria-label="getit posts">
            {POSTS.map((post) => <PostRow key={post.slug} post={post} />)}
          </ol>
        </main>

        <aside className="reddit-sidebar right-sidebar" aria-label="getit information">
          <div className="side-card side-card-dark">
            <p className="side-heading">GETIT TODAY</p>
            <p className="mt-3 text-sm leading-relaxed">A place for good questions, honest answers, and links worth saving.</p>
            <Link href="/about" className="btn mt-4 w-full">About getit</Link>
          </div>
          <div className="side-card">
            <div className="flex items-center justify-between">
              <p className="side-heading">POPULAR SUBGETITS</p>
              <Link href="/series" className="text-xs font-bold text-pen">See all</Link>
            </div>
            <ul className="mt-2 divide-y divide-line">
              {SERIES.map((subgetit, index) => (
                <li key={subgetit.slug}>
                  <Link href={`/series#${subgetit.slug}`} className="subgetit-row">
                    <span className="subgetit-number">{index + 1}</span>
                    <span><strong>g/{subgetit.name}</strong><small>{["2.4k", "5.8k", "3.1k"][index]} members</small></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="side-card text-xs text-muted">
            <p className="font-bold text-ink">getit rules</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4">
              <li>Be useful and specific.</li>
              <li>Be kind to people learning.</li>
              <li>Vote for better conversations.</li>
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}
