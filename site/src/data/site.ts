/** Site-wide settings for getit. */

export const site = {
  name: "getit",
  url: "https://getit.example",
  tagline: "the community that gets it",
  description:
    "getit is a community platform for sharing questions, stories, advice, and useful discoveries.",
  email: "hello@getit.example",
  feed: "https://getit.example/feed.xml",
};

export type NavLink = { href: string; label: string };

export const NAV: NavLink[] = [
  { href: "/archive", label: "Home" },
  { href: "/series", label: "Subgetits" },
  { href: "/tags", label: "Topics" },
  { href: "/profile", label: "Profile" },
  { href: "/messages", label: "Messages" },
  { href: "/about", label: "About" },
];

export const FOOTER: { title: string; links: NavLink[] }[] = [
  {
    title: "explore",
    links: [
      { href: "/archive", label: "Home feed" },
      { href: "/series", label: "Subgetits" },
      { href: "/tags", label: "Topics" },
      { href: "/search", label: "Search posts" },
    ],
  },
  {
    title: "getit",
    links: [
      { href: "/about", label: "About getit" },
      { href: "/subscribe", label: "Create an account" },
      { href: "/search", label: "Find a conversation" },
    ],
  },
  {
    title: "resources",
    links: [
      { href: "/subscribe", label: "Log in" },
      { href: "https://github.com/", label: "GitHub" },
      { href: `mailto:${site.email}`, label: "Email the team" },
    ],
  },
];
