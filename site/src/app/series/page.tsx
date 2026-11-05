import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";
import { SERIES, pad2, partsOf } from "@/data/posts";
import { pageMetadata } from "@/lib/metadata";
import { SubgetitActions } from "@/components/SubgetitActions";

export const metadata = pageMetadata(
  "Series",
  "Browse getit subgetits and find the conversations that match your interests.",
);

export default function SeriesPage() {
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
        </div>
      </section>

      {SERIES.map((s, i) => {
        const parts = partsOf(s.slug);
        return (
          <section key={s.slug} className="wrap mt-14" id={s.slug} aria-labelledby={`${s.slug}-title`}>
            <div className="sheet reveal grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
              <div>
                <p className="font-mono text-sm text-pen">
                  {pad2(i + 1)} / {pad2(SERIES.length)}
                </p>
                <h2 id={`${s.slug}-title`} className="display mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                  {s.name}
                </h2>
                <p className="mt-3 text-lg text-muted">{s.description}</p>
                <p className="mt-5 font-mono text-sm text-muted">
                  {parts.length} posts
                </p>
                <Link href={parts[0].href} className="btn mt-6">
                  Visit subgetit <ArrowRightIcon />
                </Link>
                <SubgetitActions name={s.name} />
              </div>
              <ol className="divide-y divide-dashed divide-line border-y border-dashed border-line">
                {parts.map((p, index) => (
                  <li key={p.slug} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-4">
                    <span className="font-mono text-lg font-semibold text-pen">{pad2(index + 1)}</span>
                    <div>
                      <h3 className="post-title">
                        <Link href={p.href}>{p.title}</Link>
                      </h3>
                      <p className="mt-1 text-muted">{p.excerpt}</p>
                      <p className="mt-2 font-mono text-xs text-muted">
                        <time dateTime={p.date}>{p.date}</time> · {p.upvotes - p.downvotes} karma · {p.comments} comments
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })}

      <section className="wrap mt-14" aria-labelledby="next-series-title">
        <div className="rounded-md border border-dashed border-ink p-6 sm:p-8">
          <h2 id="next-series-title" className="display text-xl font-bold">
            New here?
          </h2>
          <p className="mt-3 max-w-3xl text-muted">
            Start with the home feed, vote on something you get, and leave a comment. Once you log in, getit gives you
            a random username that you can use across the demo.
          </p>
        </div>
      </section>
    </>
  );
}
