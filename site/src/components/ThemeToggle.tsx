"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/Icons";
import { THEME_KEY, themeLabel } from "@/lib/theme";

// The theme lives on <html class="dark">, set before paint by the script in src/app/layout.tsx.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");

/** Light/dark switch. The choice is saved in localStorage (THEME_KEY in src/lib/theme.ts). */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      className="icon-btn"
      data-theme-toggle=""
      aria-label={themeLabel(dark)}
      aria-pressed={dark}
      // The boot script sets these attributes before React loads (see src/lib/theme.ts).
      suppressHydrationWarning
      onClick={toggle}
    >
      <MoonIcon />
      <SunIcon />
    </button>
  );
}
