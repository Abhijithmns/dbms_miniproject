import Link from "next/link";
import { UserIdentity } from "@/components/UserIdentity";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Log in", "Create a getit demo username and join the conversation.");

export default function SubscribePage() {
  return (
    <section className="wrap pt-12 md:pt-16" aria-labelledby="login-title">
      <div className="mx-auto max-w-2xl">
        <div className="margin-rule pl-5 sm:pl-8">
          <p className="kicker">your getit account</p>
          <h1 id="login-title" className="display mt-3 text-4xl font-bold sm:text-5xl">Join the conversation.</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">This demo does not need your email or password. Click below and getit will create a random username and remember it in your browser.</p>
        </div>

        <div className="sheet mt-10 flex flex-col items-start gap-6 p-6 sm:p-8">
          <p className="font-mono text-sm text-muted">status: local demo account</p>
          <UserIdentity mobile />
          <p className="text-sm text-muted">Your username is stored only in local browser storage. Click the username to log out and generate a new identity later.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link href="/" className="sheet p-5 hover:bg-marker"><strong className="display">Home</strong><span className="mt-2 block text-sm text-muted">See the latest posts.</span></Link>
          <Link href="/series" className="sheet p-5 hover:bg-marker"><strong className="display">Subgetits</strong><span className="mt-2 block text-sm text-muted">Find your corner.</span></Link>
          <Link href="/about" className="sheet p-5 hover:bg-marker"><strong className="display">About</strong><span className="mt-2 block text-sm text-muted">Learn how getit works.</span></Link>
        </div>
      </div>
    </section>
  );
}
