"use client";

import { useSyncExternalStore } from "react";

export const USER_STORAGE_KEY = "getit-demo-user";
const ADJECTIVES = ["curious", "sleepy", "clever", "cosmic", "quiet", "brave", "pixel", "friendly"];
const NOUNS = ["otter", "owl", "badger", "raccoon", "fox", "penguin", "panda", "koala"];

function randomUsername() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(100 + Math.random() * 900);
  return `${adjective}_${noun}_${number}`;
}

export function UserIdentity({ mobile = false }: { mobile?: boolean }) {
  const username = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => window.localStorage.getItem(USER_STORAGE_KEY),
    () => null,
  );

  function notify() {
    window.dispatchEvent(new StorageEvent("storage", { key: USER_STORAGE_KEY }));
  }

  function login() {
    const next = username ?? randomUsername();
    window.localStorage.setItem(USER_STORAGE_KEY, next);
    notify();
  }

  function logout() {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    notify();
  }

  const visibility = mobile ? "inline-flex" : "hidden sm:inline-flex";

  if (!username) {
    return <button type="button" className={`btn ml-2 ${visibility} !py-2`} onClick={login}>Log in</button>;
  }

  return (
    <button type="button" className={`user-chip ml-2 ${visibility}`} onClick={logout} title="Log out">
      <span className="user-dot" aria-hidden="true" /> u/{username}
    </button>
  );
}
