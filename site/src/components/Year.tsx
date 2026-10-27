"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** The current year, rendered in the browser so the static export never goes stale. */
export function Year() {
  const year = useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => 2026,
  );
  return <span data-year="">{year}</span>;
}
