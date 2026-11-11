"use client";

import { useState } from "react";
import { SnooAvatarIcon } from "@/components/Icons";

export function isImageSource(src?: string | null): boolean {
  if (!src) return false;
  const s = src.trim();
  return (
    s.startsWith("data:image/") ||
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("/") ||
    s.startsWith("blob:")
  );
}

export function UserAvatar({
  image,
  username,
  size = 32,
  className = "",
}: {
  image?: string | null;
  username?: string | null;
  size?: number;
  className?: string;
}) {
  const [loadError, setLoadError] = useState(false);

  const hasImage = isImageSource(image) && !loadError;

  if (hasImage && image) {
    return (
      <div
        className={`relative inline-block overflow-hidden rounded-full bg-line shrink-0 select-none ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={image}
          alt={username ? `u/${username} profile picture` : "User profile picture"}
          className="w-full h-full object-cover rounded-full"
          onError={() => setLoadError(true)}
        />
      </div>
    );
  }

  // Emoji avatar
  if (image && image.trim().length > 0 && !loadError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full bg-paper border border-line shrink-0 select-none ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(14, Math.round(size * 0.55)) }}
        aria-hidden="true"
      >
        <span>{image.trim()}</span>
      </div>
    );
  }

  // Default Reddit Snoo
  return <SnooAvatarIcon size={size} className={className} />;
}
