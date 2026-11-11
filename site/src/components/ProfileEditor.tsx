"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  CameraIcon,
  CheckIcon,
  ImageIcon,
  SparklesIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/Icons";
import { toast } from "@/components/Toast";
import { UserAvatar, isImageSource } from "@/components/UserAvatar";
import { USER_STORAGE_KEY, UserIdentity } from "@/components/UserIdentity";
import { openAuthModal } from "@/components/AuthModal";
import { apiRequest } from "@/lib/api";

const PRESET_AVATARS = [
  "🦊", "🐼", "🦉", "🐸", "🐙", "🐝", "🐨", "🦄",
  "🚀", "👾", "💎", "🍕", "🎮", "🐱", "🐶", "🦁",
];

export const PROFILE_UPDATED_EVENT = "getit-profile-updated";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function ProfileEditor() {
  const username = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(USER_STORAGE_KEY),
    () => null
  );

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "presets">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile from database
  useEffect(() => {
    if (!username) return;
    let active = true;
    apiRequest<{ profileImage?: string }>(`/api/profile/${username}`)
      .then((data) => {
        if (active && data.profileImage) {
          setCurrentImage(data.profileImage);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [username]);

  function notifyProfileUpdate(newImage: string) {
    setCurrentImage(newImage);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(PROFILE_UPDATED_EVENT, { detail: { profileImage: newImage } })
      );
    }
  }

  async function persistProfileImage(newImage: string, successMsg = "Profile picture updated!") {
    if (!username) {
      openAuthModal("login");
      toast("Please log in to update your profile");
      return;
    }
    setSaving(true);
    try {
      await apiRequest(`/api/profile/${username}`, {
        method: "PUT",
        body: JSON.stringify({ profileImage: newImage }),
      });
      notifyProfileUpdate(newImage);
      toast(successMsg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile picture";
      toast(msg);
    } finally {
      setSaving(false);
    }
  }

  // Client-side square center-crop and resize to max 320x320 JPEG
  function processAndUploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("Please select a valid image file (PNG, JPG, WebP, GIF)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast("Image file is too large (maximum 8MB)");
      return;
    }

    setSaving(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const targetSize = 320;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("Could not initialize canvas");
          }

          // Center-crop to square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            targetSize,
            targetSize
          );

          // Use WebP if supported, fallback to high-quality JPEG
          const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
          void persistProfileImage(dataUrl, "Custom profile picture uploaded and saved!");
        } catch {
          toast("Error processing image file");
          setSaving(false);
        }
      };
      img.onerror = () => {
        toast("Could not read image file");
        setSaving(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      toast("Error reading file from disk");
      setSaving(false);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
    // Reset file input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      toast("Please enter an image URL");
      return;
    }
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      toast("URL must start with http:// or https://");
      return;
    }
    void persistProfileImage(cleanUrl, "Image URL saved as profile picture!");
    setUrlInput("");
  }

  function handleResetDefault() {
    void persistProfileImage("🦊", "Reset profile avatar to default!");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Left: Current Profile Preview Card */}
      <div className="profile-card flex flex-col items-center p-6 text-center">
        <div className="relative group">
          <UserAvatar
            image={currentImage}
            username={username}
            size={96}
            className="ring-4 ring-line shadow-lg"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-[#d93a00] hover:bg-[#b83100] text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
            title="Upload photo"
            aria-label="Upload photo"
          >
            <CameraIcon size={14} />
          </button>
        </div>

        <p className="mt-4 font-mono font-bold text-base text-ink">
          {username ? `u/${username}` : "Guest User"}
        </p>

        <p className="mt-1 text-xs text-muted">
          {isImageSource(currentImage)
            ? "Custom photo uploaded"
            : currentImage
            ? "Preset avatar chosen"
            : "Default Snoo"}
        </p>

        {currentImage && (
          <button
            type="button"
            onClick={handleResetDefault}
            disabled={saving}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted hover:text-pen transition-colors cursor-pointer"
            title="Reset to default"
          >
            <TrashIcon size={13} />
            <span>Reset avatar</span>
          </button>
        )}

        <div className="mt-5 w-full pt-4 border-t border-line flex justify-center">
          <UserIdentity mobile />
        </div>
      </div>

      {/* Right: Picture Selection & Upload Tools */}
      <div className="sheet p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="kicker">profile customization</p>
            <h2 className="display mt-1 text-2xl font-bold">Profile Picture</h2>
          </div>
          {saving && (
            <span className="text-xs font-mono font-semibold text-[#d93a00] animate-pulse">
              Saving to MariaDB...
            </span>
          )}
        </div>

        <p className="text-sm text-muted mb-6">
          Personalize your account appearance. Your profile picture is saved in MariaDB and displayed next to all your posts, comments, and profile menu.
        </p>

        {/* Tab Controls */}
        <div className="flex border-b border-line mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === "upload"
                ? "border-[#d93a00] text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <UploadIcon size={16} />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === "url"
                ? "border-[#d93a00] text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <ImageIcon size={16} />
            <span>Image URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === "presets"
                ? "border-[#d93a00] text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <SparklesIcon size={15} />
            <span>Presets & Emojis</span>
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === "upload" && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#d93a00] bg-orange-500/10 scale-[1.01]"
                  : "border-line hover:border-ink/40 bg-paper/50 hover:bg-paper"
              }`}
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-surface border border-line flex items-center justify-center text-muted mb-4 shadow-sm">
                <UploadIcon size={24} className="text-[#d93a00]" />
              </div>
              <p className="font-bold text-sm sm:text-base text-ink">
                Click to browse or drag and drop an image
              </p>
              <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto">
                PNG, JPG, WebP, or GIF up to 8MB. Images are automatically cropped into a high-quality circular avatar.
              </p>
              <button
                type="button"
                className="mt-5 reddit-join-btn !h-9 !px-5 text-xs font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Image File
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: External Image URL */}
        {activeTab === "url" && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wide">
                Image Web Address (URL)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted">
                  <ImageIcon size={16} />
                </span>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="input !pl-9 w-full text-sm"
                  required
                />
              </div>
              <p className="text-[0.72rem] text-muted mt-1.5">
                Paste any direct link to an image on the web (Imgur, Unsplash, GitHub avatar, etc.).
              </p>
            </div>

            {urlInput && (
              <div className="p-4 rounded-xl border border-line bg-paper/60 flex items-center gap-4">
                <UserAvatar image={urlInput} size={48} />
                <div className="text-xs">
                  <p className="font-bold text-ink">Preview</p>
                  <p className="text-muted text-[0.7rem] truncate max-w-xs">{urlInput}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !urlInput.trim()}
              className="reddit-join-btn !h-9 !px-6 text-xs font-bold disabled:opacity-50"
            >
              Apply Image URL
            </button>
          </form>
        )}

        {/* Tab 3: Preset Avatars */}
        {activeTab === "presets" && (
          <div>
            <p className="text-xs text-muted mb-4">
              Click any character to instantly set it as your profile picture:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {PRESET_AVATARS.map((avatar) => {
                const isActive = currentImage === avatar;
                return (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => void persistProfileImage(avatar, `Selected ${avatar} avatar!`)}
                    className={`relative p-3 rounded-2xl border text-2xl flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? "border-[#d93a00] bg-orange-500/10 ring-2 ring-[#d93a00] scale-105"
                        : "border-line hover:border-ink/40 bg-paper hover:bg-surface"
                    }`}
                    aria-label={`Select ${avatar} avatar`}
                  >
                    <span>{avatar}</span>
                    {isActive && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d93a00] text-white flex items-center justify-center text-[0.6rem]">
                        <CheckIcon size={10} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
