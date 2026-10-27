import { TagBrowser } from "@/components/TagBrowser";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Tags",
  "Browse getit posts by topic: learning, campus life, recommendations, and programming.",
);

export default function TagsPage() {
  return (
    <section className="wrap pt-12 md:pt-16" aria-labelledby="tags-title">
      <div className="margin-rule pl-5 sm:pl-8">
        <p className="kicker">tags</p>
        <h1 id="tags-title" className="display mt-3 text-4xl font-bold sm:text-5xl">
          Browse by topic
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Every project post has a few topics. Pick one to see the posts that share it. The address changes with it, so you can
          link straight to a tag.
        </p>
      </div>
      <TagBrowser />
    </section>
  );
}
