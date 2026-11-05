"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CommentsSection } from "@/components/CommentsSection";
import { PostManagement } from "@/components/PostManagement";
import { TagLink } from "@/components/PostRow";
import { POSTS, seriesName } from "@/data/posts";

const bodies: Record<string, string[]> = {
  "best-way-to-learn-sql": ["There is a point where learning SQL stops being about memorising syntax and starts being about asking a better question.", "Describe the result in plain language first: which rows do you need, how are they related, and what should happen when there is no match?"],
  "quiet-place-to-study": ["The library is usually the safest choice, but the best place depends on when you study. Check the smaller reading rooms early and look for a reliable power socket."],
  "redis-vs-mysql": ["Redis is useful when the same small piece of data must be read quickly, while MySQL remains the source of truth for related records and durable relationships.", "A saved-post list, session, or short-lived cache is a good example of the split."],
  "debugging-null-values": ["NULL is not zero and it is not an empty string. It means that a value is unknown or missing, so SQL uses three-valued logic when comparing it."],
  "group-project-survival": ["Give every task one owner and one reviewer. Keep a small shared board with the status, deadline, and a link to the result."],
  "show-your-side-project": ["Share the problem, the smallest useful demo, and one thing you learned. Small projects are easier for other people to understand and respond to."],
  "normalisation-clicked": ["Normalisation clicked when I treated each table as one kind of fact. A row should have one clear owner, and repeated facts should have one place to change."],
  "free-food-near-campus": ["The most useful recommendations include the price, opening time, and what to order. A short, specific answer helps more than a list of names."],
};

export function PostPageContent() { const params = useSearchParams(); const post = POSTS.find((item) => item.slug === params.get("post")) ?? POSTS[0]; return <article className="post-detail"><header className="margin-rule pl-5 sm:pl-8"><Link href={`/series#${post.series}`} className="series-badge">g/{seriesName(post.series)}</Link><h1 className="display mt-4 text-[2rem] font-bold leading-[1.12] sm:text-5xl">{post.title}</h1><p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted">{post.excerpt}</p><div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-sm text-muted"><time dateTime={post.date}>{post.date}</time><span>{post.minutes} min read</span><span>u/getit_demo</span></div><ul className="mt-4 flex flex-wrap gap-1.5">{post.tags.map((tag) => <li key={tag}><TagLink tag={tag}/></li>)}</ul><PostManagement slug={post.slug} initialTitle={post.title} initialBody={post.excerpt}/></header><div className="post-body prose-nb mt-12">{(bodies[post.slug] ?? [post.excerpt]).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><CommentsSection postSlug={post.slug} count={post.comments}/></article>; }
