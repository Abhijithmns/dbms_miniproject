"use client";

import { useSyncExternalStore } from "react";
import { USER_STORAGE_KEY, UserIdentity } from "@/components/UserIdentity";

const AVATARS = ["🦊", "🐼", "🦉", "🐸", "🐙", "🐝", "🐨", "🦄"];
const AVATAR_KEY = "getit-demo-avatar";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function notify() {
  window.dispatchEvent(new StorageEvent("storage", { key: AVATAR_KEY }));
}

export function ProfileEditor() {
  const username = useSyncExternalStore(subscribe, () => window.localStorage.getItem(USER_STORAGE_KEY), () => null);
  const avatarIndex = useSyncExternalStore(subscribe, () => window.localStorage.getItem(AVATAR_KEY) ?? "0", () => "0");

  function chooseAvatar(index: number) {
    window.localStorage.setItem(AVATAR_KEY, String(index));
    notify();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <div className="profile-card">
        <div className="profile-avatar">{AVATARS[Number(avatarIndex) % AVATARS.length]}</div>
        <p className="mt-4 text-center font-mono text-sm">{username ? `u/${username}` : "Not logged in"}</p>
        <div className="mt-5 flex justify-center"><UserIdentity mobile /></div>
      </div>
      <div className="sheet p-6 sm:p-8">
        <p className="kicker">profile picture</p>
        <h2 className="display mt-3 text-2xl font-bold">Choose your look</h2>
        <p className="mt-2 text-muted">Pick an avatar for your getit profile. It is saved only in this browser.</p>
        <div className="mt-7 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {AVATARS.map((avatar, index) => (
            <button key={avatar} type="button" className={`avatar-choice ${Number(avatarIndex) === index ? "avatar-choice-active" : ""}`} aria-label={`Choose ${avatar} avatar`} aria-pressed={Number(avatarIndex) === index} onClick={() => chooseAvatar(index)}>
              {avatar}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
