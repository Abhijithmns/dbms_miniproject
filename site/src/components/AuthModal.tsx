"use client";

import { useEffect, useState } from "react";
import { AuthForm } from "@/components/AuthForm";

export const OPEN_AUTH_MODAL_EVENT = "getit-open-auth-modal";

export function openAuthModal(mode: "login" | "register" = "login") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(OPEN_AUTH_MODAL_EVENT, { detail: { mode } })
    );
  }
}

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ mode?: "login" | "register" }>;
      if (custom.detail?.mode) {
        setMode(custom.detail.mode);
      } else {
        setMode("login");
      }
      setOpen(true);
    };

    window.addEventListener(OPEN_AUTH_MODAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_AUTH_MODAL_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="relative w-full max-w-md bg-surface border border-line rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        <AuthForm
          initialMode={mode}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
