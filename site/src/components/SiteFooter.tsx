import Link from "next/link";
import { Year } from "@/components/Year";
import { FOOTER } from "@/data/site";

/** Footer: logo and blurb, three link columns, copyright and colophon. */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="getit-logo-text" aria-label="getit">getit</span>
          </Link>
          <p className="mt-4 max-w-xs text-muted">
            A community for questions, ideas, recommendations, and the occasional excellent comment.
          </p>
        </div>
        {FOOTER.map((col) => (
          <div key={col.title}>
            <h2 className="kicker">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="hover:text-ink">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="hover:text-ink">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-6 font-mono text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            © <Year /> getit. Made for the community.
          </p>
          <p>Set in Martian Mono &amp; Atkinson Hyperlegible.</p>
        </div>
      </div>
    </footer>
  );
}
