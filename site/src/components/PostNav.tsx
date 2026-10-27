import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import { POSTS, pad2, partsOf, seriesName } from "@/data/posts";
import { cx } from "@/lib/style";

/** The subgetit box of a post and links to its other conversations. */
export function SeriesNav({ slug }: { slug: string }) {
  const post = POSTS.find((p) => p.slug === slug);
  const parts = post?.series ? partsOf(post.series) : [];
  const name = post ? seriesName(post.series) : "";
  return (
    <div data-series-nav="" data-post={slug}>
      {post && post.series && (
        <nav className="sheet p-5 sm:p-6" aria-label={`Subgetit: ${name}`}>
          <p className="kicker">subgetit</p>
          <p className="display mt-2 text-lg font-bold">
            <Link href={`/series#${post.series}`} className="hover:text-pen">
              {name}
            </Link>
          </p>
          <p className="mt-1 font-mono text-sm text-muted">
            {parts.length} posts in this subgetit.
          </p>
          <ol className="mt-4 space-y-2 border-t border-dashed border-line pt-4">
            {parts.map((x) =>
              x.slug === post.slug ? (
                <li key={x.slug}>
                  <Link href={x.href} aria-current="page" className="font-bold">
                    <span className="font-mono text-pen">{pad2(x.part)}</span>{" "}
                    <span className="marker">{x.title}</span>
                  </Link>
                </li>
              ) : (
                <li key={x.slug}>
                  <Link href={x.href} className="hover:text-pen">
                    <span className="font-mono text-pen">{pad2(x.part)}</span> {x.title}
                  </Link>
                </li>
              ),
            )}
          </ol>
        </nav>
      )}
    </div>
  );
}

/** Links to the next older and newer posts (the newest post has only "Older post"). */
export function PostNav({ slug }: { slug: string }) {
  const i = POSTS.findIndex((p) => p.slug === slug);
  const card = (dir: "older" | "newer") => {
    const p = i === -1 ? undefined : POSTS[dir === "older" ? i + 1 : i - 1];
    if (!p) return <div className="hidden sm:block"></div>;
    return (
      <Link
        href={p.href}
        rel={dir === "older" ? "prev" : "next"}
        className={cx(
          "sheet group block p-5 transition-transform hover:-translate-y-0.5",
          dir === "newer" && "sm:text-right",
        )}
      >
        <span
          className={cx("flex items-center gap-1.5 font-mono text-xs text-muted", dir === "newer" && "sm:justify-end")}
        >
          {dir === "older" ? (
            <>
              <ArrowLeftIcon />
              Older post
            </>
          ) : (
            <>
              Newer post
              <ArrowRightIcon />
            </>
          )}
        </span>
        <span className="post-title mt-2 block">{p.title}</span>
      </Link>
    );
  };
  return (
    <div className="mt-14" data-post-nav="" data-post={slug}>
      {i !== -1 && (
        <nav className="grid gap-4 sm:grid-cols-2" aria-label="More posts">
          {card("older")}
          {card("newer")}
        </nav>
      )}
    </div>
  );
}
