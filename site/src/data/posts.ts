/** Live feed data model and helpers for the getit platform. */

export type Post = {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  date: string;
  tags: string[];
  series: string;
  subgetit?: string;
  subredditId?: number;
  author?: string;
  comments: number;
  upvotes: number;
  downvotes: number;
  karma?: number;
  userVote?: "up" | "down" | null;
  saved?: boolean;
  joined?: boolean;
  href: string;
};

export type Series = { id?: number; slug: string; name: string; description: string };

export type ApiPost = {
  id: number;
  title: string;
  excerpt?: string;
  body?: string;
  flair?: string;
  subgetit: string;
  subredditId?: number;
  author: string;
  createdAt: string;
  karma: number;
  comments: number;
  userVote?: "up" | "down" | null;
  saved?: boolean;
  joined?: boolean;
};

export function apiPostToPost(p: ApiPost): Post {
  const flairList = p.flair
    ? p.flair.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    id: p.id,
    slug: String(p.id),
    title: p.title,
    excerpt: p.excerpt || p.body || "",
    body: p.body || p.excerpt || "",
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Today",
    tags: flairList.length > 0 ? flairList : ["general"],
    series: p.subgetit,
    subgetit: p.subgetit,
    subredditId: p.subredditId,
    author: p.author || "getit_demo",
    comments: p.comments ?? 0,
    upvotes: p.karma ?? 0,
    downvotes: 0,
    karma: p.karma ?? 0,
    userVote: p.userVote ?? null,
    saved: !!p.saved,
    joined: !!p.joined,
    href: `/post?post=${p.id}`,
  };
}

export const SERIES: Series[] = [
  { id: 1, slug: "dbms_dml_demo", name: "dbms_dml_demo", description: "Database management systems discussion" },
  { id: 2, slug: "campus-life", name: "campus-life", description: "Student life and campus questions" },
  { id: 3, slug: "programming-help", name: "programming-help", description: "Practical programming help" },
  { id: 4, slug: "dbms", name: "dbms", description: "Questions, notes, and discoveries for people who like understanding how things work." },
];

export const POSTS: Post[] = [
  {
    id: 2,
    slug: "2",
    title: "The quietest place to study on campus?",
    excerpt: "The library is full during exam week. Looking for somewhere with sockets, decent light, and no loud group calls.",
    date: "Oct 27",
    tags: ["campus", "recommendations"],
    series: "campus-life",
    subgetit: "campus-life",
    subredditId: 2,
    author: "getit_demo",
    comments: 1,
    upvotes: 0,
    downvotes: 0,
    karma: 0,
    href: "/post?post=2",
  },
  {
    id: 4,
    slug: "4",
    title: "How do you divide work fairly in a group project?",
    excerpt: "Looking for a lightweight way to make responsibilities visible without turning the project into a second job.",
    date: "Oct 27",
    tags: ["advice", "projects"],
    series: "campus-life",
    subgetit: "campus-life",
    subredditId: 2,
    author: "getit_demo",
    comments: 2,
    upvotes: 0,
    downvotes: 0,
    karma: 0,
    href: "/post?post=4",
  },
  {
    id: 6,
    slug: "6",
    title: "Best inexpensive food near campus?",
    excerpt: "The canteen queue is becoming a personality trait. Share your reliable places for a quick meal.",
    date: "Oct 27",
    tags: ["food", "recommendations"],
    series: "campus-life",
    subgetit: "campus-life",
    subredditId: 2,
    author: "getit_demo",
    comments: 0,
    upvotes: 0,
    downvotes: 0,
    karma: 0,
    href: "/post?post=6",
  },
  {
    id: 3,
    slug: "3",
    title: "I finally understood why NULL is not zero",
    excerpt: "A tiny query, three rows, and the moment SQL three-valued logic stopped feeling arbitrary.",
    date: "Oct 27",
    tags: ["explainers", "sql"],
    series: "programming-help",
    subgetit: "programming-help",
    subredditId: 3,
    author: "getit_demo",
    comments: 0,
    upvotes: 0,
    downvotes: 0,
    karma: 0,
    href: "/post?post=3",
  },
  {
    id: 5,
    slug: "5",
    title: "Show getit your side project",
    excerpt: "Drop a link and tell us what you learned while building it. Small projects are very welcome.",
    date: "Oct 27",
    tags: ["showcase", "projects"],
    series: "programming-help",
    subgetit: "programming-help",
    subredditId: 3,
    author: "getit_demo",
    comments: 0,
    upvotes: 0,
    downvotes: 0,
    karma: 0,
    href: "/post?post=5",
  },
  {
    id: 1,
    slug: "1",
    title: "DML Operations in MySQL",
    excerpt: "This post demonstrates INSERT, SELECT, UPDATE and DELETE.",
    date: "Oct 26",
    tags: ["mysql", "databases"],
    series: "dbms_dml_demo",
    subgetit: "dbms_dml_demo",
    subredditId: 1,
    author: "alice_dml",
    comments: 5,
    upvotes: 10,
    downvotes: 0,
    karma: 10,
    href: "/post?post=1",
  },
];

export const seriesName = (slug: string) => SERIES.find((s) => s.slug === slug || s.name === slug)?.name ?? slug;
export const partsOf = (slug: string) => POSTS.filter((p) => p.series === slug);

export function tagCounts(): [string, number][] {
  const counts = new Map<string, number>();
  for (const p of POSTS) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}

export const tagHref = (tag: string) => `/tags?tag=${encodeURIComponent(tag)}`;
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const pad2 = (n: number) => String(n).padStart(2, "0");
