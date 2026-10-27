# Notebook documentation

## Overview

Notebook is a personal developer blog. The demo belongs to **Imke Vos**, a fictional backend engineer in
Rotterdam who writes long posts about databases, build tools and debugging. It has a home page with the
latest posts and featured series, a post layout made for technical writing (highlighted code with copy
buttons, heading links, an outline that follows your reading, a progress bar and series navigation), an
archive by year, a tag browser, instant search, a series page, projects, an about and now page and a
subscribe page. The design is a sheet of graph paper with a red margin line and a yellow highlighter, in
light and dark mode. This is the Next.js version: Next.js 16 (App Router, static export), React 19,
TypeScript and Tailwind CSS v4. This guide covers version 1.0.2.

Live demo: [freeframe.dev/templates/notebook](https://freeframe.dev/templates/notebook)

## Quick start

Requirements: Node.js 24 and pnpm (`corepack enable pnpm`).

```sh
pnpm install
pnpm dev          # http://localhost:3000
```

| Script | What it does |
|--------|--------------|
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Static export to `out/` |
| `pnpm start` | Serve `out/` locally |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |

## Pages

| Route | File | Purpose and notable sections |
|-------|------|------------------------------|
| `/` | `src/app/page.tsx` | Introduction with the "now" line, newest post, five latest posts, series, tags, newsletter |
| `/post` | `src/app/post/page.tsx` | The example post: series box, outline, reading time and progress, code with copy buttons, callouts, heading links, older/newer posts |
| `/archive` | `src/app/archive/page.tsx` | Every post grouped by year, with links to each year |
| `/tags` | `src/app/tags/page.tsx` | Tag buttons with counts and the posts of the chosen tag (`/tags?tag=postgres`) |
| `/series` | `src/app/series/page.tsx` | Each series with its description and parts, in order |
| `/search` | `src/app/search/page.tsx` | Instant search with highlighted matches (`/search?q=vacuum`) |
| `/about` | `src/app/about/page.tsx` | Introduction and portrait, now, uses, contact |
| `/projects` | `src/app/projects/page.tsx` | Project cards with status, language and links, talks |
| `/subscribe` | `src/app/subscribe/page.tsx` | Email sign-up form, RSS address with a copy button, recent emails |
| 404 | `src/app/not-found.tsx` | Search box and links back |

### One example post

The demo has one full post at `/post`, and every post in lists links there (each post's `href` in
`src/data/posts.ts` is `"/post"`). See [Adding a post](#adding-a-post) to give each post its own page.

## Project structure

```text
notebook/
  src/
    app/
      layout.tsx            <html>, fonts, metadata defaults, no-flash theme script, header and footer
      globals.css           colour tokens, fonts, component classes (Tailwind CSS v4)
      page.tsx              home
      post/, archive/, tags/, series/, search/, about/, projects/, subscribe/   one folder per route
      not-found.tsx         404 page
      icon.svg              favicon
    components/
      SiteHeader.tsx        logo, menu, search link, theme switch, mobile menu
      SiteFooter.tsx        footer columns and copyright (Year.tsx)
      ThemeToggle.tsx       light/dark switch
      PostRow.tsx           a post in a list, tag links, series badge, search highlighting
      CodeBlock.tsx         code block with language label and copy button
      Heading.tsx           post heading with id and "#" link
      PostTools.tsx         reading progress, reading time, copy link, outline (table of contents)
      PostNav.tsx           series box and older/newer posts
      TagBrowser.tsx        the tag browser (?tag=)
      SearchPosts.tsx       search (?q=)
      SearchShortcut.tsx    "/" jumps to search
      NewsletterForm.tsx, SubscribeForm.tsx, FormSuccess.tsx, CopyFeedButton.tsx
      Toast.tsx, RevealObserver.tsx, BackToTop.tsx, Icons.tsx
    content/
      reading-a-b-tree-page-by-hand.tsx   the example post's text
    data/
      posts.ts              the post index and series, plus helpers
      projects.ts           projects and talks
      site.ts               site name, URL, email, feed, menu and footer links
    lib/
      highlight.tsx         SQL and shell highlighting for code blocks
      use-form-check.tsx    form validation hook
      clipboard.ts, metadata.ts, theme.ts, asset.ts, style.ts
    fonts/                  self-hosted woff2 files and their licenses
  public/img/               logo, illustrations, portrait, social image
  next.config.ts            static export and base path
  template.json, README.md, DOCS.md, CHANGELOG.md
```

## Customising

### Brand and colours

All colours are CSS custom properties at the top of `src/app/globals.css`, once for light mode (`:root`) and
once for dark mode (`.dark`). Tailwind reads them through `@theme inline`, so classes such as `bg-paper`,
`text-muted`, `border-line`, `text-pen` and `bg-marker` follow the tokens.

| Token | Used for |
|-------|----------|
| `--paper` | Page background |
| `--surface` | Cards ("sheets"), inputs |
| `--ink` / `--muted` | Text and secondary text |
| `--line` | Borders and dashed rules |
| `--grid` | The graph-paper lines behind the page |
| `--pen` / `--pen-soft` | Red pen: margin lines, `// labels`, series badges, active outline entry |
| `--marker` | Highlighter: link underlines, `<mark>`, the current nav item |
| `--shadow` | Hard offset shadow under cards and buttons |
| `--code-bg`, `--code-ink`, `--code-line`, `--tok-*` | Code blocks and the syntax colours |

To make the pen blue instead of red:

```css
:root { --pen: #1f4fb8; --pen-soft: #e2e9f8; }
.dark { --pen: #8fb3ff; --pen-soft: #1c2740; }
```

To remove the graph paper, delete the `background-image` and `background-size` lines from `body` in
`globals.css`. Also update `themeColor` in `src/app/layout.tsx` if you change `--paper`.

### Typography

Three fonts are self-hosted with `next/font/local` in `src/app/layout.tsx` (files and SIL Open Font
Licenses in `src/fonts/`): **Martian Mono** for headings and labels (`--font-martian-mono`, slightly condensed
with `font-stretch: 87.5%` in the `.display`, `.kicker` and `.post-title` classes), **Atkinson Hyperlegible
Next** for text (`--font-atkinson-next`) and **Atkinson Hyperlegible Mono** for code (`--font-atkinson-mono`).
`globals.css` maps them to `--font-display`, `--font-sans` and `--font-mono`. To swap a font, replace the file
and its `localFont()` call, or use `next/font/google` with the same `variable`.

### Content

**The post index.** `src/data/posts.ts` lists every post once, newest first, in `POSTS`, and the series in
`SERIES`. The home page, archive, tag browser, search, series page and each post's series box and
older/newer links are all built from it:

```ts
{
  slug: "my-new-post",
  title: "My new post",
  excerpt: "One sentence about it.",
  date: "2026-11-02",
  tags: ["postgres"],
  series: "",
  part: 0,
  minutes: 6,
  href: "/post",
},
```

| Field | Meaning |
|-------|---------|
| `slug` | Unique id; the post page passes it to `<SeriesNav>` and `<PostNav>` |
| `title`, `excerpt` | Shown in lists and searched |
| `date` | `YYYY-MM-DD`, shown exactly as written (never converted to a time zone) |
| `tags` | Lower-case tag names |
| `series`, `part` | A series slug from `SERIES` and the part number, or `""` and `0` |
| `minutes` | Reading time shown in lists |
| `href` | The post's route |

A series is `{ slug, name, description }`; its parts, part count and total reading time are worked out from
`POSTS` (`partsOf()`, `minutesOf()`). The home page shows the newest post large and the next five as a list;
the tag list counts tags with `tagCounts()`.

`src/data/site.ts` holds the name, URL, email address, feed address, menu (`NAV`) and footer columns
(`FOOTER`). `src/data/projects.ts` holds `PROJECTS` (name, status, language with its dot colour class,
stars, description, links) and `TALKS`. The about page's text, now section and uses list are in
`src/app/about/page.tsx`.

### Writing a post

A post's text is a component in `src/content/`, made of plain elements plus three helpers:

```tsx
<p className="lede">The first paragraph, a little larger.</p>
<Heading level={2}>Setting the table</Heading>
<CodeBlock lang="sql" code={"SELECT id FROM users;"} />
<aside className="callout">A note in red pen.</aside>
<aside className="callout callout-note">A note in highlighter.</aside>
```

`<Heading>` gives the heading an id (from its text) and a `#` link; `<h2>`s and `<h3>`s become the outline.
`<CodeBlock>` adds the language label and the copy button. SQL and shell (`bash`, `sh`) are highlighted by
`src/lib/highlight.tsx` with five classes (`tok-k` keywords, `tok-s` strings, `tok-n` numbers, `tok-c`
comments, `tok-f` functions and commands) coloured by the `--tok-*` tokens; other languages (`text` for
output) are shown as they are. Add keywords to `SQL_KEYWORDS`, or a function for another language.

### Adding a post

1. Write its text in `src/content/<slug>.tsx`.
2. Add it at the top of `POSTS` with `href: "/posts/<slug>"`.
3. Turn `src/app/post/page.tsx` into `src/app/posts/[slug]/page.tsx`: export
   `generateStaticParams()` returning every slug (static export needs them), find the post by
   `params.slug`, and render its content component (for example from a `{ [slug]: Component }` map in
   `src/content/index.ts`). The header, `<SeriesNav slug>`, `<PostNav slug>` and outline work for any post.

### Images and artwork

Everything in `public/img/` is an original SVG: `logo.svg` (also `src/app/icon.svg`), `notebook-page.svg`
(home illustration, 560 × 440), `imke.svg` (portrait, square) and `og-image.svg` (social image source,
1200 × 630). Replace the portrait with a square photo of any size and keep `width`/`height`. `og-image.png`
is the social image that sites actually display; export a new one at 1200 × 630 when you change the SVG.
Files in `public/` are referenced with `asset("/img/…")` so they work under a base path.

### Navigation, header and footer

The menu is `NAV` in `src/data/site.ts`, used by both the desktop and mobile menus in
`src/components/SiteHeader.tsx`, which marks the current route with `aria-current="page"`. Footer columns are
`FOOTER` in the same file, rendered by `SiteFooter.tsx`.

### Dark mode

`ThemeToggle` toggles the `dark` class on `<html>` and stores `"dark"` or `"light"` under `notebook-theme`
(`THEME_KEY` in `src/lib/theme.ts`). The inline `themeScript` in `<head>` applies it before the page paints;
without a stored choice the page follows the system setting. To default to dark, change the script's
condition to `t!=='light'`. To remove dark mode, delete `<ThemeToggle />` and the script.

## Features

### Code blocks and copy buttons

`CodeBlock` renders a `.code-block` frame with the language (`LANGS` maps `sql` → SQL, `bash` → Shell,
`text` → Output; other names are shown as written) and a **Copy** button. Copying uses the Clipboard API
with a fallback (`src/lib/clipboard.ts`); the button reads "Copied" for two seconds and a toast announces
it. The code is focusable (`tabIndex={0}`) so keyboard users can scroll wide lines, and named ("SQL code")
for screen readers. The syntax colours switch with the site theme.

### Heading links, outline and progress

`Heading` links each section with `#`; following the link also copies the section's address. `PostOutline`
(used twice: a sidebar on wide screens, a collapsible "On this page" on phones) reads the post's `<h2>`s and
`<h3>`s from `[data-post-body]` once it has rendered, and highlights the section you are reading, marked
`aria-current="location"`: the last heading above the top quarter of the screen. `ReadingProgress` fills
the bar at the top as you read the text, and `ReadingTime` counts the visible words at 230 a minute.

### Series box and older/newer posts

`SeriesNav` shows the post's series with every part (the current one highlighted and marked
`aria-current="page"`); posts without a series show nothing. `PostNav` links to the next older and newer
posts in `POSTS`; the newest post has only "Older post".

### Archive by year

`/archive` groups `POSTS` by the year of their date, with jump links to each year (`#year-2025`).

### Tag browser

`TagBrowser` shows "All" and one toggle button (`aria-pressed`) per tag, most used first. The chosen tag is
read from `?tag=` with `useSearchParams()` (inside `<Suspense>`, as static export requires) and choosing one
rewrites the address with `history.replaceState`, so the view can be shared. `?tag=` is matched regardless
of case; a value that isn't a tag shows every post and a short notice.

### Search

`SearchPosts` searches as you type: every word must appear in a post's title, summary, tags or series name.
Matches are wrapped in `<mark>` and the count is announced politely. The query is kept in `?q=` (read up to
100 characters), Enter works too, and "Clear the search" returns focus to the box. `SearchShortcut` (in the
layout) makes <kbd>/</kbd> jump to search from any page, or into the box on the search page; it is ignored
while you type in a field.

### Copy the feed address

`CopyFeedButton` on `/subscribe` copies the value of the `#feed-url` input (the `feed` address in
`src/data/site.ts`).

### Scroll reveals, mobile menu and back to top

`RevealObserver` fades in `.reveal` elements as they scroll into view (and everything above them), straight
away with reduced motion. Below 1024 px the menu button opens the mobile menu; Escape closes it and returns
focus, and it closes after navigating. `BackToTop` appears after about one screen, scrolls up (instantly
with reduced motion) and focuses the main content; remove it from `layout.tsx` to drop it.

## Forms

| Form | Component | Validates |
|------|-----------|-----------|
| Newsletter (home) | `NewsletterForm` (`id="nl-email"`) | Email |
| Email subscription | `SubscribeForm` (on `/subscribe`) | Email; name is optional, frequency and series announcements are choices |
| 404 search | `src/app/not-found.tsx` | Nothing: it opens `/search?q=…` |

Both forms use `useFormCheck()` from `src/lib/use-form-check.tsx`: the browser's own constraints with friendly
messages ("Please enter your email address."). A field is checked when it loses focus (once it has a value)
and on every change while it's invalid; each has an error line (`<field id>-error`) linked with
`aria-describedby`, and `aria-invalid` once checked. Submitting focuses the first problem, or resets the form
and shows and focuses the success panel. The success texts tell the reader to look out for a confirmation
email, as most newsletter services send one to confirm a sign-up; change them if yours doesn't.

**Nothing is sent** until you connect the forms, even though the success texts read as if it had been. To send sign-ups to a service such as [Buttondown](https://buttondown.com) or
[Formspree](https://formspree.io), pass an `onValid` callback to `useFormCheck`, for example in
`SubscribeForm.tsx`:

```tsx
const { formProps, field, error, success } = useFormCheck((form) => {
  fetch("https://formspree.io/f/your-form-id", {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  });
});
```

`onValid` runs before the form resets. If you
remove the static export, you can post to a **Route Handler** (e.g. `src/app/api/subscribe/route.ts`
exporting `POST`) or call a **Server Action** instead.

## Saved data (localStorage)

| Key | Value | Validation |
|-----|-------|------------|
| `notebook-theme` | `"dark"` or `"light"` | Any other value is ignored and the system setting is used |

Nothing else is stored. Clear it in the browser's site data, or run `localStorage.removeItem("notebook-theme")`.

## SEO and sharing

- Defaults are in `metadata` in `src/app/layout.tsx`: a title template (`%s — Imke Vos`), description and Open
  Graph image.
- Each page exports `metadata = pageMetadata(title, description)` from `src/lib/metadata.ts`; the post passes
  `type: "article"` and the home page its full title.
- `metadataBase` is `process.env.NEXT_PUBLIC_SITE_URL` (falling back to `site.url` in `src/data/site.ts`). Set
  it when you build so the social image URL is absolute:

```sh
NEXT_PUBLIC_SITE_URL=https://www.example.com pnpm build
```

The 404 page is `noindex`. Consider adding `src/app/sitemap.ts` and `src/app/robots.ts` (both work with static
export) and an RSS feed: a Route Handler such as `src/app/feed.xml/route.ts` with
`export const dynamic = "force-static"`, built from `POSTS`, at the address in `site.feed`.

## Accessibility

- A skip link, landmarks (`header`, labelled `nav`s, `main`, `aside`, `footer`) and one `<h1>` per page.
- Visible focus outlines in the pen colour; the current page is marked with `aria-current="page"`.
- Toggle buttons (`aria-pressed`) for theme and tags, live regions for counts, copy and form messages.
- Focusable, labelled code blocks; heading links named after their section.
- Colours meet WCAG AA in both themes, including the syntax colours.
- Reduced motion turns off reveals and smooth scrolling.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and keep headings in order.

## Building and deploying

`pnpm build` writes a static site to `out/` (`output: "export"` in `next.config.ts`):

- **Vercel:** import the repository; no settings needed.
- **Netlify / Cloudflare Pages:** build command `pnpm build`, publish directory `out`.
- **Any static host:** upload the contents of `out/`.

To serve from a sub-folder, build with `DEMO_BASE_PATH=/notes pnpm build`; `next.config.ts` passes it to
`basePath` and `NEXT_PUBLIC_BASE_PATH`, which `asset()` uses for files in `public/`. `pnpm build:demo` does this
for the freeframe.dev demo (`demo/`, which you can delete).

To use server features (Route Handlers that run on request, Server Actions), remove `output: "export"` and
`images.unoptimized` from `next.config.ts` and deploy to a Node-capable host such as Vercel.

### TypeScript setup

`package.json` installs `@typescript/native` (TypeScript 7, which provides `tsc`) and `typescript` as an alias of
`@typescript/typescript6`, because typescript-eslint and parts of the Next.js toolchain still need the TypeScript 6
API. `eslint.config.mjs` pins `settings.react.version`, because eslint-plugin-react can't detect it under ESLint 10.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| A new post doesn't appear in lists, tags or search | Add it to `POSTS` in `src/data/posts.ts`; check the date is `YYYY-MM-DD` |
| The series box or older/newer links are missing | The slug passed to `<SeriesNav>`/`<PostNav>` must match the post's `slug` |
| Images or fonts 404 under a sub-folder | Build with `DEMO_BASE_PATH`, and reference files in `public/` with `asset()` |
| A heading is missing from the outline | Only `<h2>` and `<h3>` inside `[data-post-body]` are listed; use `<Heading>` |
| A Tailwind class built from data has no effect | Write complete class names in the data (`before:bg-[#dea584]`), not pieces |
| The newsletter form shows its confirmation but nothing arrives | It sends nothing until you connect it; see [Forms](#forms) |
| Copy buttons don't copy on plain `http://` | The Clipboard API needs `https` or `localhost`; the fallback covers most browsers |

## License

MIT, see `LICENSE.txt` in the download. The illustrations, portrait and social image are original artwork
included under the same license. The fonts are under the SIL Open Font License (`src/fonts/*-OFL.txt`).
