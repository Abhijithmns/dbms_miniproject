import { Suspense } from "react";
import { PostPageContent } from "@/components/PostPageContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Post", "A getit community post and its comments.");
export default function PostPage() { return <section className="wrap post-page pt-10 md:pt-16"><Suspense fallback={<p className="text-muted">Loading post…</p>}><PostPageContent /></Suspense></section>; }
