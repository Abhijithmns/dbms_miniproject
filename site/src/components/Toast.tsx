"use client";

import { useEffect, useRef, useState } from "react";

const EVENT = "getit:toast";

/** Show a short message at the bottom of the screen (e.g. "Link copied to clipboard"). */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
}

/** The toast itself, rendered once in the layout. Announced politely to screen readers. */
export function Toast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<number>(undefined);

  useEffect(() => {
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      setVisible(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setVisible(false), 2600);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div className={visible ? "toast is-visible" : "toast"} data-toast="" role="status" aria-live="polite">
      {message}
    </div>
  );
}
