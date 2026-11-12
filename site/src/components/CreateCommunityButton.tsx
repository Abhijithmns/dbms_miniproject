"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/Icons";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";

export function CreateCommunityButton({
  className = "btn inline-flex items-center gap-1.5",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <PlusIcon size={16} />
        {children || <span>Create a Community</span>}
      </button>
      <CreateCommunityModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
