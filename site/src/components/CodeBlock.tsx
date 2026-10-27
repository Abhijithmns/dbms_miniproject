"use client";

import { useEffect, useRef, useState } from "react";
import { CopyIcon } from "@/components/Icons";
import { toast } from "@/components/Toast";
import { copyText } from "@/lib/clipboard";
import { highlightCode } from "@/lib/highlight";

/** Friendly names for code languages; others are shown as written. */
const LANGS: Record<string, string> = {
  sql: "SQL",
  bash: "Shell",
  sh: "Shell",
  text: "Output",
  js: "JavaScript",
  ts: "TypeScript",
  rust: "Rust",
  css: "CSS",
  html: "HTML",
  json: "JSON",
};

/**
 * A code block: a header with the language and a Copy button, then the (highlighted) code. The
 * code is focusable so keyboard users can scroll wide lines. Copying says "Copied" for two seconds
 * and announces it with a toast.
 */
export function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const label = LANGS[lang] ?? lang;
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function copy() {
    copyText((preRef.current?.textContent ?? code).replace(/\n$/, ""), () => {
      setCopied(true);
      toast("Code copied to clipboard");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="code-block">
      <div className="code-head">
        <span>{label}</span>
        <button
          type="button"
          className="code-copy"
          aria-label={`Copy ${label} code`}
          data-copied={copied ? "" : undefined}
          onClick={copy}
        >
          <CopyIcon size={14} width={2} />
          <span data-copy-label="">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre ref={preRef} className={`lang-${lang}`} tabIndex={0} aria-label={`${label} code`}>
        <code>{highlightCode(lang, code)}</code>
      </pre>
    </div>
  );
}
