import { Suspense } from "react";
import { ProfilePageContent } from "@/components/ProfilePageContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Profile", "View your getit profile, avatar, and saved posts.");

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="wrap p-8 text-center text-muted font-mono">Loading profile…</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
