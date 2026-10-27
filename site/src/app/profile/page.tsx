import { ProfileEditor } from "@/components/ProfileEditor";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Profile", "Choose your getit username and profile picture.");

export default function ProfilePage() {
  return (
    <section className="wrap pt-12 md:pt-16" aria-labelledby="profile-title">
      <div className="margin-rule pl-5 sm:pl-8">
        <p className="kicker">your getit profile</p>
        <h1 id="profile-title" className="display mt-3 text-4xl font-bold sm:text-5xl">Make it yours.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">Your demo username and avatar make comments and votes feel like yours while you explore getit.</p>
      </div>
      <div className="mt-12"><ProfileEditor /></div>
    </section>
  );
}
