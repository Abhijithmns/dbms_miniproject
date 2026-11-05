/** Demo feed data used by the getit interface until the API is connected. */

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  series: string;
  comments: number;
  upvotes: number;
  downvotes: number;
  href: string;
};

export type Series = { slug: string; name: string; description: string };

export const SERIES: Series[] = [
  { slug: "dbms", name: "dbms", description: "Questions, notes, and discoveries for people who like understanding how things work." },
  { slug: "campus-life", name: "campus-life", description: "The useful, funny, and slightly chaotic parts of campus life." },
  { slug: "programming-help", name: "programming-help", description: "Ask a question, share a fix, or help someone get unstuck." },
];

export const POSTS: Post[] = [
  {
    slug: "best-way-to-learn-sql",
    title: "What is the best way to learn SQL without memorising everything?",
    excerpt: "I understand SELECT and JOIN, but I still freeze when I have to write a query from scratch. What helped you?",
    date: "2026-10-26",
    tags: ["sql", "learning", "advice"],
    series: "dbms",
    comments: 28,
    upvotes: 184,
    downvotes: 7,
    href: "/post",
  },
  {
    slug: "quiet-place-to-study",
    title: "The quietest place to study on campus?",
    excerpt: "The library is full during exam week. Looking for somewhere with sockets, decent light, and no loud group calls.",
    date: "2026-10-25",
    tags: ["campus", "recommendations"],
    series: "campus-life",
    comments: 41,
    upvotes: 231,
    downvotes: 3,
    href: "/post",
  },
  {
    slug: "redis-vs-mysql",
    title: "When would you use Redis instead of MySQL?",
    excerpt: "I keep seeing Redis used beside a relational database. What is a practical example where the split actually helps?",
    date: "2026-10-24",
    tags: ["redis", "mysql", "architecture"],
    series: "dbms",
    comments: 19,
    upvotes: 146,
    downvotes: 4,
    href: "/post",
  },
  {
    slug: "debugging-null-values",
    title: "I finally understood why NULL is not zero",
    excerpt: "A tiny query, three rows, and the moment SQL's three-valued logic stopped feeling arbitrary.",
    date: "2026-10-23",
    tags: ["sql", "debugging", "explainers"],
    series: "programming-help",
    comments: 12,
    upvotes: 98,
    downvotes: 2,
    href: "/post",
  },
  {
    slug: "group-project-survival",
    title: "How do you divide work fairly in a group project?",
    excerpt: "Looking for a lightweight way to make responsibilities visible without turning the project into a second job.",
    date: "2026-10-22",
    tags: ["campus", "advice", "projects"],
    series: "campus-life",
    comments: 34,
    upvotes: 175,
    downvotes: 8,
    href: "/post",
  },
  {
    slug: "show-your-side-project",
    title: "Show getit your side project",
    excerpt: "Drop a link and tell us what you learned while building it. Small projects are very welcome.",
    date: "2026-10-21",
    tags: ["projects", "showcase", "community"],
    series: "programming-help",
    comments: 52,
    upvotes: 263,
    downvotes: 5,
    href: "/post",
  },
  {
    slug: "normalisation-clicked",
    title: "What made database normalisation finally click for you?",
    excerpt: "I can repeat the definitions, but I want an intuition that survives the exam and a real project.",
    date: "2026-10-20",
    tags: ["databases", "learning", "questions"],
    series: "dbms",
    comments: 23,
    upvotes: 121,
    downvotes: 6,
    href: "/post",
  },
  {
    slug: "free-food-near-campus",
    title: "Best inexpensive food near campus?",
    excerpt: "The canteen queue is becoming a personality trait. Share your reliable places for a quick meal.",
    date: "2026-10-19",
    tags: ["campus", "food", "recommendations"],
    series: "campus-life",
    comments: 67,
    upvotes: 309,
    downvotes: 9,
    href: "/post",
  },
];

export const seriesName = (slug: string) => SERIES.find((s) => s.slug === slug)?.name ?? "";
export const partsOf = (slug: string) => POSTS.filter((p) => p.series === slug);

export function tagCounts(): [string, number][] {
  const counts = new Map<string, number>();
  for (const p of POSTS) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}

export const tagHref = (tag: string) => `/tags?tag=${encodeURIComponent(tag)}`;
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const pad2 = (n: number) => String(n).padStart(2, "0");
