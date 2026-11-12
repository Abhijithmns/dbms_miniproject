"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CloseIcon, PlusIcon, ShieldIcon } from "@/components/Icons";
import { toast } from "@/components/Toast";
import { openAuthModal } from "@/components/AuthModal";
import { USER_STORAGE_KEY } from "@/components/UserIdentity";
import { apiRequest } from "@/lib/api";

export function CreateCommunityModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const currentUser = typeof window !== "undefined" ? window.localStorage.getItem(USER_STORAGE_KEY) : null;
    if (!currentUser) {
      openAuthModal("login");
      toast("Please log in to create a community");
      onClose();
      return;
    }

    const cleanName = name
      .toLowerCase()
      .replace(/^r\//, "")
      .replace(/^g\//, "")
      .trim();

    if (cleanName.length < 3 || cleanName.length > 30) {
      setError("Community name must be between 3 and 30 characters");
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(cleanName)) {
      setError("Names can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest<{ id: number; name: string }>(
        "/api/subgetits",
        {
          method: "POST",
          body: JSON.stringify({
            name: cleanName,
            description: description.trim(),
          }),
        }
      );

      toast(`Successfully created r/${res.name}!`);
      onClose();
      setName("");
      setDescription("");
      router.push(`/g/${res.name}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create community");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-community-title"
    >
      <div className="bg-surface border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-paper/50">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#ff4500] text-white flex items-center justify-center text-xs font-bold">
              r/
            </span>
            <h2 id="create-community-title" className="text-base font-bold text-ink">
              Create a Community
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:text-ink hover:bg-line transition-colors"
            aria-label="Close dialog"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="community-name" className="block text-xs font-bold text-ink mb-1">
              Community Name
            </label>
            <p className="text-[11px] text-muted mb-2">
              Names including capitalization cannot be changed.
            </p>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm font-bold text-muted select-none">
                r/
              </span>
              <input
                id="community-name"
                type="text"
                required
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="community_name"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-paper border border-line text-sm text-ink outline-none focus:border-pen font-mono"
              />
            </div>
            <div className="flex justify-between mt-1 text-[11px] text-muted font-mono">
              <span>Only letters, numbers, hyphens, and underscores</span>
              <span>{30 - name.length} remaining</span>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="community-desc" className="block text-xs font-bold text-ink mb-1">
              Description <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="community-desc"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell visitors what this community is about..."
              className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-sm text-ink outline-none focus:border-pen resize-none"
            />
          </div>

          {/* DBMS Information Callout */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-paper/60 border border-line text-xs text-muted">
            <ShieldIcon size={16} className="text-pen shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Creating a community automatically stores a record in the MariaDB{" "}
              <code className="text-ink font-mono font-bold">subreddit</code> table, adds you to{" "}
              <code className="text-ink font-mono font-bold">joins</code>, and assigns your user as its moderator.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-muted hover:text-ink hover:bg-line transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn !py-2 !px-5 !text-xs font-bold !bg-ink !text-paper inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <PlusIcon size={14} />
              {loading ? "Creating…" : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
