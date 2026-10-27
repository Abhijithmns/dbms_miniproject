"use client";

import { useEffect, useRef } from "react";

// Fixed UI the button should never sit on top of (toasts, snackbars...).
const AVOID = "[data-toast], #toast, .toast, [data-back-to-top-avoid]";

function isShown(el: Element) {
  const cs = window.getComputedStyle(el);
  return cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05;
}

/** Send focus to the skip link's target (<main>) so keyboard users start at the top. */
function focusTop() {
  const target = document.getElementById("main") ?? document.querySelector("main");
  if (!target) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.classList.add("back-to-top-target");
  target.focus({ preventScroll: true });
}

/**
 * "Back to top" button: fades in after you scroll about one screen down, returns to the top
 * (instantly with reduced motion) and moves keyboard focus to the main content. It lifts itself
 * above toasts, steps aside while an in-page "Back to top" link is on screen, and hides while it
 * would cover an element marked data-back-to-top-hide. Styles: `.back-to-top` in globals.css.
 * To remove it, delete this component and its line in src/app/layout.tsx.
 */
export function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = ref.current!;
    let queued = false;

    function lift() {
      let offset = 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      document.querySelectorAll(AVOID).forEach((el) => {
        if (!isShown(el)) return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 4);
      });
      btn.style.setProperty("--btt-lift", `${offset}px`);
    }
    function inlineLinkInView() {
      return Array.from(document.querySelectorAll("a")).some((a) => {
        if (!/back to top/i.test(a.textContent ?? "")) return false;
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.top < window.innerHeight && r.bottom > 0;
      });
    }
    function coversHideZone() {
      const b = btn.getBoundingClientRect();
      return Array.from(document.querySelectorAll("[data-back-to-top-hide]")).some((el) => {
        // Only while the element is pinned (sticky/fixed); in normal flow it just scrolls past.
        const pos = window.getComputedStyle(el).position;
        if (pos !== "sticky" && pos !== "fixed") return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
      });
    }
    function update() {
      queued = false;
      const show = window.scrollY > window.innerHeight * 0.9 && !inlineLinkInView() && !coversHideZone();
      btn.classList.toggle("is-visible", show);
      lift();
    }
    function schedule() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }
    // Toasts animate in and out; re-check the lift whenever another element transitions.
    const onTransition = (e: Event) => {
      if (e.target !== btn) schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("transitionrun", onTransition, true);
    document.addEventListener("transitionend", onTransition, true);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("transitionrun", onTransition, true);
      document.removeEventListener("transitionend", onTransition, true);
    };
  }, []);

  function onClick() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: 0, behavior: "auto" });
      focusTop();
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Move focus once the smooth scroll has finished (with a fallback for older browsers).
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scrollend", finish);
      focusTop();
    };
    if ("onscrollend" in window) window.addEventListener("scrollend", finish);
    window.setTimeout(finish, 1500);
  }

  return (
    <button
      ref={ref}
      type="button"
      className="back-to-top"
      aria-label="Back to top"
      title="Back to top"
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
