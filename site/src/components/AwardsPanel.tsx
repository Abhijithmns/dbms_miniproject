"use client";

import { useState } from "react";
import { GiveAwardModal } from "@/components/GiveAwardModal";

export function AwardsPanel({ commentId }: { commentId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="comment-btn hover:text-amber-500 transition-colors inline-flex items-center gap-1"
        onClick={() => setOpen(true)}
        title="Give award to comment"
      >
        <span>🏆</span>
        <span>Award</span>
      </button>
      <GiveAwardModal
        isOpen={open}
        onClose={() => setOpen(false)}
        targetType="comment"
        targetId={commentId}
      />
    </>
  );
}
