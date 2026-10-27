import Link from "next/link";
import { CommentsSection } from "@/components/CommentsSection";
import { MailIcon } from "@/components/Icons";
import { CopyLinkButton, PostOutline, ReadingProgress, ReadingTime } from "@/components/PostTools";
import { PostNav, SeriesNav } from "@/components/PostNav";
import { TagLink } from "@/components/PostRow";
import { ReadingABTreePageByHand } from "@/content/reading-a-b-tree-page-by-hand";
import { POSTS, seriesName } from "@/data/posts";
import { pageMetadata } from "@/lib/metadata";

// The featured project post. The static demo routes all feed entries here until the API is connected.
const post = POSTS.find((p) => p.slug === "best-way-to-learn-sql")!;

export const metadata = pageMetadata(post.title, post.excerpt, { type: "article" });

export default function PostPage() {
  return (
    <>
      <ReadingProgress />
      <article>
        <header className="wrap pt-10 md:pt-16">
          <div className="margin-rule max-w-3xl pl-5 sm:pl-8">
            <p className="flex flex-wrap items-center gap-3">
              <Link href={`/series#${post.series}`} className="series-badge hover:underline">
                g/{seriesName(post.series)}
              </Link>
            </p>
            <h1 className="display mt-4 text-[2rem] font-bold leading-[1.12] sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-xl leading-relaxed text-muted">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-sm text-muted">
              <p>
                <time dateTime={post.date}>{post.date}</time>
              </p>
              <ReadingTime minutes={post.minutes} />
              <CopyLinkButton />
            </div>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t}>
                  <TagLink tag={t} />
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="wrap mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16">
          <div className="min-w-0 max-w-3xl">
            <SeriesNav slug={post.slug} />
            <details className="sheet mt-6 px-4 py-3 lg:hidden">
              <summary className="cursor-pointer font-display text-sm font-semibold [font-stretch:87.5%]">
                On this page
              </summary>
              <PostOutline className="mt-3 border-l-2 border-line" />
            </details>
            <div className="prose-nb mt-10" data-post-body="">
              <ReadingABTreePageByHand />
            </div>

            <PostNav slug={post.slug} />

            <CommentsSection count={post.comments} />
          </div>

          <aside className="hidden lg:block" aria-label="On this page">
            <div className="sticky top-24">
              <p className="kicker">on this page</p>
              <PostOutline className="mt-4 border-l-2 border-line" />
              <div className="mt-8 border-t border-dashed border-line pt-6">
                <Link href="/subscribe" className="inline-flex items-center gap-2 text-sm font-bold hover:text-pen">
                  <MailIcon /> Get new posts by email
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
