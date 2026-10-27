"use client";

import type { ReactNode } from "react";
import { toast } from "@/components/Toast";
import { copyText, pageUrl } from "@/lib/clipboard";

/** The id of a heading: its text in lower case, with anything but letters and digits as "-". */
export const headingId = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "section";

/**
 * A heading in a post (<h2> or <h3>) with an id and a "#" link to its section. Following the
 * link also copies the section's address. The outline (<PostOutline>) lists these headings.
 */
export function Heading({ level, children }: { level: 2 | 3; children: string }) {
  const id = headingId(children);
  const Tag = level === 2 ? "h2" : "h3";
  const anchor: ReactNode = (
    <a
      className="anchor"
      href={`#${id}`}
      aria-label={`Link to the section “${children}”`}
      onClick={() => copyText(pageUrl(`#${id}`), () => toast("Link to this section copied"))}
    >
      #
    </a>
  );
  return (
    <Tag id={id}>
      {children}
      {anchor}
    </Tag>
  );
}
