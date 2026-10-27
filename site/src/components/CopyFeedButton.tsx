"use client";

import { CopyIcon } from "@/components/Icons";
import { toast } from "@/components/Toast";
import { copyText } from "@/lib/clipboard";

/** Copies the value of the input `target` (the feed address) and says so in a toast. */
export function CopyFeedButton({ target }: { target: string }) {
  return (
    <button
      type="button"
      className="btn-ghost shrink-0"
      data-copy-target={target}
      onClick={() => {
        const field = document.getElementById(target) as HTMLInputElement | null;
        if (field) copyText(field.value, () => toast("Feed address copied"));
      }}
    >
      <CopyIcon /> Copy
    </button>
  );
}
