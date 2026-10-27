"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type SVGProps } from "react";
import { SearchIcon } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserIdentity } from "@/components/UserIdentity";
import { NAV } from "@/data/site";

// React's SVG types have no `hidden`, but the attribute works (and [hidden] is display: none).
const svgHidden = (hidden: boolean) => (hidden ? ({ hidden: true } as SVGProps<SVGSVGElement>) : {});

/** Sticky header: project mark, main menu, search, theme switch, and the mobile menu. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const current = (href: string) => (href === pathname ? ("page" as const) : undefined);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="wrap flex h-16 items-center gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="getit-logo-text" aria-label="getit">getit</span>
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 font-display text-[.82rem] font-medium text-muted [font-stretch:87.5%]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link className="nav-link" href={item.href} aria-current={current(item.href)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/search"
            className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md px-2 text-muted transition-colors hover:bg-line hover:text-ink sm:px-2.5"
            data-search-link=""
            aria-label="Search (press /)"
          >
            <SearchIcon />
            <span className="hidden text-sm font-bold text-ink sm:inline">Search</span>
            <kbd className="hidden sm:inline">/</kbd>
          </Link>
          <ThemeToggle />
          <UserIdentity />
          <button
            ref={toggleRef}
            type="button"
            className="icon-btn lg:hidden"
            data-menu-toggle=""
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg
              aria-hidden="true"
              data-menu-icon="open"
              {...svgHidden(open)}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg
              aria-hidden="true"
              data-menu-icon="close"
              {...svgHidden(!open)}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="border-t border-line bg-paper lg:hidden" hidden={!open}>
        <nav aria-label="Mobile" className="wrap pb-8 pt-2">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  className="display block border-b border-dashed border-line py-4 text-xl font-semibold"
                  href={item.href}
                  aria-current={current(item.href)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/subscribe" className="btn mt-6 w-full" onClick={() => setOpen(false)}>
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
