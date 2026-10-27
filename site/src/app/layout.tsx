import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { BackToTop } from "@/components/BackToTop";
import { RevealObserver } from "@/components/RevealObserver";
import { SearchShortcut } from "@/components/SearchShortcut";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Toast } from "@/components/Toast";
import { site } from "@/data/site";
import { asset } from "@/lib/asset";
import { themeScript } from "@/lib/theme";
import "./globals.css";

// Fonts are self-hosted (SIL Open Font License, see src/fonts/*-OFL.txt): the same variable Latin
// files Google Fonts serves to browsers, declared with the same weight (and width) ranges, so text
// wraps exactly like the HTML version of this template. Like the HTML version, they load on demand
// (no preload) and fall back straight to the listed system fonts (no size-adjusted fallback face).
const martianMono = localFont({
  src: "../fonts/MartianMono-latin.woff2",
  weight: "400 700",
  // Headings use font-stretch: 87.5%; the width axis needs the range declared.
  declarations: [{ prop: "font-stretch", value: "75% 112.5%" }],
  variable: "--font-martian-mono",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "monospace"],
});
const atkinsonNext = localFont({
  src: [
    { path: "../fonts/AtkinsonHyperlegibleNext-latin.woff2", weight: "400 700", style: "normal" },
    { path: "../fonts/AtkinsonHyperlegibleNext-italic-latin.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-atkinson-next",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});
const atkinsonMono = localFont({
  src: "../fonts/AtkinsonHyperlegibleMono-latin.woff2",
  weight: "400 600",
  variable: "--font-atkinson-mono",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { type: "website", siteName: site.name, images: [asset("/img/og-image.png")] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#101214" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${martianMono.variable} ${atkinsonNext.variable} ${atkinsonMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <Toast />
        <RevealObserver />
        <SearchShortcut />
        <BackToTop />
      </body>
    </html>
  );
}
