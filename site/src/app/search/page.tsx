import { SearchPosts } from "@/components/SearchPosts";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Search",
  "Search getit posts by title, summary, topic, or subgetit.",
);

export default function SearchPage() {
  return (
    <section className="wrap pt-12 md:pt-16" aria-labelledby="search-title">
      <div className="margin-rule pl-5 sm:pl-8">
        <p className="kicker">search</p>
        <h1 id="search-title" className="display mt-3 text-4xl font-bold sm:text-5xl">
          Search the project feed
        </h1>
      </div>
      <SearchPosts />
    </section>
  );
}
