import type { Metadata } from "next";
import { RedditHomeFeed } from "@/components/RedditHomeFeed";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  `${site.name} — ${site.tagline}`,
  site.description,
  { absolute: true }
);

export default function HomePage() {
  return (
    <>
      <div className="reddit-topline">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 py-1.5 text-xs text-muted">
          <span>Home · Best conversations from getit</span>
          <span className="hidden sm:inline">Be curious. Be useful. Getit.</span>
        </div>
      </div>

      <RedditHomeFeed />
    </>
  );
}
