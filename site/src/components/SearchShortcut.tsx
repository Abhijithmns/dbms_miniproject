"use client";

import { useEffect } from "react";

/**
 * Press "/" on any page to jump to search: into the search box on the search page, otherwise to
 * the page the header's search link ([data-search-link]) points at. Ignored while typing in a
 * field or with a modifier key.
 */
export function SearchShortcut() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && (/^(input|textarea|select)$/i.test(active.tagName) || active.isContentEditable)) return;
      const input = document.querySelector<HTMLInputElement>("[data-search-input]");
      if (input) {
        e.preventDefault();
        input.focus();
        input.select();
        return;
      }
      const link = document.querySelector<HTMLAnchorElement>("[data-search-link]");
      if (link) {
        e.preventDefault();
        link.click();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
