"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/Icons";
import { toast } from "@/components/Toast";
import { openAuthModal } from "@/components/AuthModal";
import { USER_STORAGE_KEY } from "@/components/UserIdentity";
import { apiRequest } from "@/lib/api";
import type { AwardItem } from "@/data/posts";

interface GiveAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "post" | "comment";
  targetId: number | string;
  targetTitle?: string;
  onAwardGiven?: (award: AwardItem, newKarma?: number) => void;
}

export function GiveAwardModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onAwardGiven,
}: GiveAwardModalProps) {
  const [awards, setAwards] = useState<AwardItem[]>([]);
  const [selectedAward, setSelectedAward] = useState<AwardItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    apiRequest<AwardItem[]>("/api/awards")
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setAwards(items);
          setSelectedAward((prev) => prev ?? items[0]);
        }
      })
      .catch(() => {
        setError("Failed to load available awards.");
      });
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleGiveAward() {
    if (!selectedAward) return;
    setError("");

    const currentUser =
      typeof window !== "undefined"
        ? window.localStorage.getItem(USER_STORAGE_KEY)
        : null;

    if (!currentUser) {
      openAuthModal("login");
      toast("Please log in to give an award");
      onClose();
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        targetType === "post"
          ? `/api/posts/${targetId}/award`
          : `/api/comments/${targetId}/award`;

      const res = await apiRequest<{
        message: string;
        karma?: number;
        awardName?: string;
        iconUrl?: string;
      }>(endpoint, {
        method: "POST",
        body: JSON.stringify({ awardId: selectedAward.awardId }),
      });

      toast(`🎉 Gave ${selectedAward.name} award!`);
      onAwardGiven?.(selectedAward, res.karma);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not give award");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="give-award-title"
    >
      <div className="bg-surface border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-paper/50">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg shadow-sm">
              🏆
            </span>
            <div>
              <h2 id="give-award-title" className="text-base font-bold text-ink">
                Give an Award
              </h2>
              <p className="text-[11px] text-muted truncate max-w-xs sm:max-w-sm">
                Recognize great {targetType} {targetTitle ? `“${targetTitle}”` : ""}
              </p>
            </div>
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

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
              {error}
            </div>
          )}

          <p className="text-xs text-muted">
            Select an award to highlight this {targetType} and reward the author:
          </p>

          {/* Awards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {awards.map((award) => {
              const isSelected = selectedAward?.awardId === award.awardId;
              return (
                <button
                  key={award.awardId}
                  type="button"
                  onClick={() => setSelectedAward(award)}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 shadow-sm ring-2 ring-amber-500/30"
                      : "border-line bg-paper hover:border-pen/40 hover:bg-line/40"
                  }`}
                >
                  <span className="text-3xl mb-1.5 filter drop-shadow">
                    {award.iconUrl || "🏆"}
                  </span>
                  <span className="text-xs font-bold text-ink truncate w-full">
                    {award.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted mt-1">
                    {award.cost ?? 10} karma
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Award Detail Card */}
          {selectedAward && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-paper/70 border border-line">
              <span className="text-2xl shrink-0">{selectedAward.iconUrl || "🏆"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    {selectedAward.name} Award
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-500">
                    {selectedAward.cost ?? 10} Karma
                  </span>
                </div>
                <p className="text-[11px] text-muted line-clamp-2 mt-0.5">
                  {selectedAward.description || "Shows appreciation for high quality content."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-line bg-paper/30">
          <span className="text-[11px] text-muted">
            Awards highlight great content for everyone
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-muted hover:text-ink hover:bg-line transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || !selectedAward}
              onClick={handleGiveAward}
              className="btn !py-2 !px-5 !text-xs font-bold !bg-amber-500 hover:!bg-amber-600 !text-black inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? "Giving…" : `Give ${selectedAward?.name || "Award"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
