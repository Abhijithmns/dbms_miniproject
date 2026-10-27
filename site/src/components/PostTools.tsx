"use client";

import { useEffect, useRef, useState } from "react";
import { LinkIcon } from "@/components/Icons";
import { toast } from "@/components/Toast";
import { copyText, pageUrl } from "@/lib/clipboard";
import { cx } from "@/lib/style";

const BODY = "[data-post-body]";

/** Thin bar at the top of the window that fills as you read the post's text ([data-post-body]). */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.querySelector<HTMLElement>(BODY);
    const bar = barRef.current;
    if (!body || !bar) return;
    const update = () => {
      const rect = body.getBoundingClientRect();
      const total = body.offsetHeight - window.innerHeight;
      const done = Math.min(1, Math.max(0, -rect.top / (total > 0 ? total : 1)));
      bar.style.transform = `scaleX(${done})`;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden="true">
      <div ref={barRef} data-progress="" className="h-full origin-left scale-x-0 bg-pen"></div>
    </div>
  );
}

/**
 * Reading time, counted from the visible words of the post at 230 a minute (code counts; SVG,
 * hidden and aria-hidden text doesn't). `minutes` is shown until the page has loaded.
 */
export function ReadingTime({ minutes }: { minutes: number }) {
  const [value, setValue] = useState(minutes);
  useEffect(() => {
    const body = document.querySelector(BODY);
    if (!body) return;
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        n.parentElement?.closest('svg, script, style, template, [hidden], [aria-hidden="true"]')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    let words = 0;
    while (walker.nextNode()) {
      const text = (walker.currentNode.nodeValue ?? "").trim();
      if (text) words += text.split(/\s+/).length;
    }
    // Counted once, after the post has rendered (the server can't count in a browser).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(Math.max(1, Math.round(words / 230)));
  }, []);
  return <p data-reading-time="">{value} min read</p>;
}

/** "Copy link": copies the page's address and says so in a toast. */
export function CopyLinkButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 hover:text-ink"
      data-copy-link=""
      onClick={() => copyText(pageUrl(), () => toast("Link copied to clipboard"))}
    >
      <LinkIcon size={15} /> Copy link
    </button>
  );
}

type OutlineItem = { id: string; text: string; sub: boolean };

/**
 * "On this page": the post's <h2> and <h3> headings (h3s indented). The section you're reading is
 * highlighted and marked aria-current="location": the last heading above the top quarter of the
 * screen. In the collapsible phone version, following a link closes the list.
 */
export function PostOutline({ className }: { className: string }) {
  const [items, setItems] = useState<OutlineItem[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll<HTMLElement>(`${BODY} h2, ${BODY} h3`));
    const text = (h: HTMLElement) => {
      const clone = h.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".anchor").forEach((a) => a.remove());
      return (clone.textContent ?? "").trim();
    };
    // Read once from the rendered post, so the outline always matches its headings.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(headings.map((h) => ({ id: h.id, text: text(h), sub: h.tagName === "H3" })));
    if (!headings.length) return;
    let queued = false;
    const spy = () => {
      queued = false;
      const line = window.innerHeight * 0.25;
      let id = "";
      for (const h of headings) if (h.getBoundingClientRect().top <= line) id = h.id;
      setActive(id);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(spy);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", spy);
    spy();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", spy);
    };
  }, []);

  return (
    <ol className={className} data-toc="">
      {items.map((h) => (
        <li key={h.id}>
          <a
            className={cx("toc-link", h.sub && "is-sub", active === h.id && "is-active")}
            href={`#${h.id}`}
            aria-current={active === h.id ? "location" : undefined}
            onClick={(e) => {
              const details = e.currentTarget.closest("details");
              if (details) details.open = false;
            }}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
