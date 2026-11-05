"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  BookmarkIcon,
  ChatIcon,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  ShieldIcon,
  SnooAvatarIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
} from "@/components/Icons";
import { toast } from "@/components/Toast";
import { apiRequest } from "@/lib/api";
import { THEME_KEY } from "@/lib/theme";

export const USER_STORAGE_KEY = "getit-demo-user";

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDarkTheme = () => typeof document !== "undefined" && document.documentElement.classList.contains("dark");

export function UserIdentity({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [apiUser, setApiUser] = useState<{ id: number; username: string; role: string } | null>(null);
  const isDark = useSyncExternalStore(subscribeTheme, isDarkTheme, () => false);
  const karma = 184;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sync with localStorage
  const localUsername = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => window.localStorage.getItem(USER_STORAGE_KEY),
    () => null,
  );

  // Fetch API session user or auto-login demo
  useEffect(() => {
    apiRequest<{ id: number; username: string; role: string }>("/api/auth/me")
      .then((user) => {
        setApiUser(user);
        window.localStorage.setItem(USER_STORAGE_KEY, user.username);
        notify();
      })
      .catch(() => {
        apiRequest<{ id: number; username: string; role: string }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: "getit_demo", password: "demo-password" }),
        })
          .then((user) => {
            setApiUser(user);
            window.localStorage.setItem(USER_STORAGE_KEY, user.username);
            notify();
          })
          .catch(() => setApiUser(null));
      });
  }, []);

  // Click outside listener
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function notify() {
    window.dispatchEvent(new StorageEvent("storage", { key: USER_STORAGE_KEY }));
  }

  async function login(preferredName?: string) {
    const next = preferredName ?? "getit_demo";
    try {
      const user = await apiRequest<{ id: number; username: string; role: string }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ username: next, password: "demo-password" }),
        }
      );
      setApiUser(user);
      window.localStorage.setItem(USER_STORAGE_KEY, user.username);
      notify();
      toast(`Logged in as u/${user.username}`);
    } catch {
      window.localStorage.setItem(USER_STORAGE_KEY, next);
      notify();
      toast(`Logged in as u/${next}`);
    }
    setOpen(false);
  }

  async function logout() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {}
    setApiUser(null);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    notify();
    toast("Logged out");
    setOpen(false);
  }

  function toggleDarkMode() {
    const next = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {}
  }

  const effectiveUsername = apiUser?.username ?? localUsername;
  const role = apiUser?.role ?? (effectiveUsername === "getit_demo" ? "moderator" : "user");

  // Inline mobile fallback (e.g. for profile editor)
  if (mobile) {
    if (!effectiveUsername) {
      return (
        <button
          type="button"
          className="reddit-join-btn !h-8 text-xs"
          onClick={() => login()}
        >
          Log In
        </button>
      );
    }
    return (
      <button
        type="button"
        className="reddit-pill-btn !h-8 text-xs"
        onClick={() => void logout()}
        title="Log out"
      >
        <span className="user-dot" aria-hidden="true" />
        <span>u/{effectiveUsername}</span>
      </button>
    );
  }

  // Reddit-style Profile Avatar Button + Dropdown
  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        className={`relative flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-line focus:outline-none transition-all cursor-pointer ${
          open ? "ring-2 ring-pen" : ""
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User profile menu"
        onClick={() => setOpen((o) => !o)}
      >
        <SnooAvatarIcon size={33} />
        {/* Status indicator dot */}
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${
            effectiveUsername ? "bg-green-500" : "bg-gray-400"
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Profile Dropdown Menu */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-line bg-surface p-2.5 shadow-2xl font-sans text-xs"
          role="menu"
          aria-orientation="vertical"
        >
          {effectiveUsername ? (
            /* Logged In Dropdown */
            <div>
              {/* User Header */}
              <div className="p-2 flex items-center gap-3">
                <div className="relative">
                  <SnooAvatarIcon size={42} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-surface" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-ink truncate">u/{effectiveUsername}</p>
                  <div className="flex items-center gap-1.5 text-muted mt-0.5">
                    <SparklesIcon size={13} className="text-pen" />
                    <span className="font-mono text-[0.72rem] font-bold">{karma} karma</span>
                    {role === "moderator" && (
                      <span className="reddit-flair !text-[0.62rem] !py-0 !px-1.5 font-bold">
                        MOD
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                className="mt-1 block w-full text-center py-1.5 rounded-full bg-paper hover:bg-line text-ink font-bold text-xs transition-colors"
                onClick={() => setOpen(false)}
              >
                View Profile
              </Link>

              {/* Menu Items */}
              <div className="border-t border-line my-2 pt-1 space-y-0.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper text-ink transition-colors font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <UserIcon size={16} className="text-muted" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  href="/post"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper text-ink transition-colors font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <PlusIcon size={16} className="text-muted" />
                  <span>Create a Post</span>
                </Link>

                <Link
                  href="/messages"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper text-ink transition-colors font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <ChatIcon size={16} className="text-muted" />
                  <span>Inbox & Messages</span>
                </Link>

                <Link
                  href="/moderation"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper text-ink transition-colors font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <ShieldIcon size={16} className="text-muted" />
                  <span>Moderation Tools</span>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper text-ink transition-colors font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <BookmarkIcon size={16} className="text-muted" />
                  <span>Saved Posts</span>
                </Link>
              </div>

              {/* Preferences: Dark Mode */}
              <div className="border-t border-line my-2 pt-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-paper text-ink transition-colors font-semibold cursor-pointer"
                  onClick={toggleDarkMode}
                >
                  <span className="flex items-center gap-3">
                    {isDark ? <SunIcon size={16} className="text-muted" /> : <MoonIcon size={16} className="text-muted" />}
                    <span>Dark Mode</span>
                  </span>
                  <span
                    className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                      isDark ? "bg-pen" : "bg-line"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-surface shadow-sm transform transition-transform ${
                        isDark ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              </div>

              {/* Log out */}
              <div className="border-t border-line my-1 pt-1">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-pen transition-colors font-semibold cursor-pointer text-left"
                  onClick={() => void logout()}
                >
                  <LogOutIcon size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Guest / Not Logged In Dropdown */
            <div className="p-1">
              <div className="p-2 text-center">
                <div className="inline-block relative mb-2">
                  <SnooAvatarIcon size={46} />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-gray-400 ring-2 ring-surface" />
                </div>
                <p className="font-bold text-sm text-ink">Welcome to getit!</p>
                <p className="text-[0.72rem] text-muted mt-1 leading-snug">
                  Log in to vote on posts, join subgetits, and leave comments.
                </p>
              </div>

              <button
                type="button"
                className="mt-2 w-full reddit-join-btn !h-9 text-xs"
                onClick={() => login("getit_demo")}
              >
                Quick Demo Log In
              </button>

              <Link
                href="/subscribe"
                className="mt-2 block w-full text-center py-2 rounded-full border border-line hover:bg-paper text-ink font-bold text-xs transition-colors"
                onClick={() => setOpen(false)}
              >
                Log In / Sign Up
              </Link>

              <div className="border-t border-line my-2 pt-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-paper text-ink transition-colors font-semibold cursor-pointer"
                  onClick={toggleDarkMode}
                >
                  <span className="flex items-center gap-3">
                    {isDark ? <SunIcon size={16} className="text-muted" /> : <MoonIcon size={16} className="text-muted" />}
                    <span>Dark Mode</span>
                  </span>
                  <span
                    className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                      isDark ? "bg-pen" : "bg-line"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-surface shadow-sm transform transition-transform ${
                        isDark ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              </div>

              <div className="border-t border-line my-1 pt-1">
                <Link
                  href="/about"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper text-muted hover:text-ink transition-colors font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <span>About getit</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
