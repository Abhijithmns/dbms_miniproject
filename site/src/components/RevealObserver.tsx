"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveals: adds `is-visible` to `.reveal` elements as they come into view, and to every
 * one above them, so a fast jump never leaves hidden content behind (see globals.css; they're
 * only hidden while JavaScript runs). With reduced motion everything shows at once.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const items = Array.from(document.querySelectorAll(".reveal:not(.is-visible)"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const top = entry.target.getBoundingClientRect().top;
          for (const el of items) {
            if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top <= top) {
              el.classList.add("is-visible");
              io.unobserve(el);
            }
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
