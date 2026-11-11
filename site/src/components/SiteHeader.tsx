"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type SVGProps } from "react";
import { BellIcon, ChatIcon, PlusIcon, SearchIcon } from "@/components/Icons";
import { UserIdentity, USER_STORAGE_KEY } from "@/components/UserIdentity";
import { openAuthModal } from "@/components/AuthModal";
import { NAV } from "@/data/site";

// React's SVG types have no `hidden`, but the attribute works (and [hidden] is display: none).
const svgHidden = (hidden: boolean) => (hidden ? ({ hidden: true } as SVGProps<SVGSVGElement>) : {});

/** Sticky header: project mark, main menu, search, theme switch, and the mobile menu. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const user = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => window.localStorage.getItem(USER_STORAGE_KEY),
    () => null,
  );

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
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 flex h-14 items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Reddit Logo */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            ref={toggleRef}
            type="button"
            className="icon-btn !w-9 !h-9 lg:hidden rounded-full"
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg
              aria-hidden="true"
              data-menu-icon="close"
              {...svgHidden(!open)}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="reddit-header-logo" aria-hidden="true">
              <span className="reddit-logo-dot" />
            </span>
            <span className="getit-logo-text !text-2xl" aria-label="getit">getit</span>
          </Link>
        </div>

        {/* Center: Reddit-style wide pill search bar */}
        <div className="flex-1 max-w-2xl mx-1 sm:mx-4">
          {pathname.startsWith("/g/") || pathname.startsWith("/r/") ? (
            <Link
              href={`/search?subgetit=${pathname.split("/")[2] || ""}`}
              className="reddit-search-pill"
              data-search-link=""
              aria-label={`Search in r/${pathname.split("/")[2] || ""}`}
            >
              <SearchIcon size={17} />
              <div className="flex items-center gap-1.5 bg-paper border border-line rounded-full px-2 py-0.5 text-xs font-semibold text-ink shrink-0">
                <span className="w-4 h-4 rounded-full bg-[#111418] text-[9px] text-white font-bold grid place-items-center">
                  r/
                </span>
                <span>r/{pathname.split("/")[2]}</span>
                <span className="opacity-50 hover:opacity-100">✕</span>
              </div>
              <span className="flex-1 text-sm text-muted truncate">
                Search in r/{pathname.split("/")[2]}
              </span>
              <kbd className="hidden sm:inline-block">/</kbd>
            </Link>
          ) : (
            <Link
              href="/search"
              className="reddit-search-pill"
              data-search-link=""
              aria-label="Search getit"
            >
              <SearchIcon size={17} />
              <span className="flex-1 text-sm text-muted truncate">Search getit</span>
              <kbd className="hidden sm:inline-block">/</kbd>
            </Link>
          )}
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <Link
                href="/messages"
                className="icon-btn !w-9 !h-9 rounded-full text-muted hover:text-ink hover:bg-line"
                title="Inbox & Messages"
                aria-label="Messages"
              >
                <ChatIcon size={18} />
              </Link>

              <Link
                href="/post"
                className="reddit-create-btn"
                title="Create Post"
              >
                <PlusIcon size={16} />
                <span className="hidden sm:inline">Create</span>
              </Link>

              <button
                type="button"
                className="icon-btn !w-9 !h-9 rounded-full text-muted hover:text-ink hover:bg-line hidden sm:inline-grid"
                title="Notifications"
                aria-label="Notifications"
              >
                <BellIcon size={18} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="bg-[#d93a00] hover:bg-[#b83100] text-white font-bold px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              Log In
            </button>
          )}

          <UserIdentity />
        </div>
      </div>

      <div id="mobile-menu" className="border-t border-line bg-paper lg:hidden" hidden={!open}>
        <nav aria-label="Mobile" className="wrap pb-8 pt-2">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  className="display block border-b border-dashed border-line py-3 text-lg font-semibold"
                  href={item.href}
                  aria-current={current(item.href)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
