import Form from "next/form";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = {
  ...pageMetadata("Page not found", "This page is not in the getit feed."),
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="display text-[5.5rem] font-bold leading-none text-pen sm:text-[9rem]">404</p>
      <h1 className="display mt-4 text-3xl font-bold sm:text-4xl">This page isn’t in the feed.</h1>
      <div className="sheet mt-8 w-full max-w-lg p-4 text-left font-mono text-sm" aria-hidden="true">
        <p>
          <span className="text-pen">$</span> open this-page
        </p>
        <p className="text-muted">error: no such page. It may have moved, or the link has a typo.</p>
      </div>
      {/* Opens /search?q=… (the search page reads ?q=). */}
      <Form action="/search" className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row" role="search">
        <label htmlFor="nf-q" className="sr-only">
          Search project posts
        </label>
        <input id="nf-q" name="q" type="search" className="input flex-1" placeholder="Search posts…" />
        <button type="submit" className="btn !px-6">
          Search
        </button>
      </Form>
      <p className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold">
        <Link href="/" className="link">
          Back to the start
        </Link>
        <Link href="/archive" className="link">
          See the full feed
        </Link>
      </p>
    </section>
  );
}
