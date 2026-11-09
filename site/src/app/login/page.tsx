import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Log in or Sign up",
  "Sign in to getit to vote on posts, join communities, and start discussions."
);

export default function LoginPage() {
  return (
    <section className="wrap pt-8 md:pt-12 pb-16">
      <div className="mx-auto max-w-lg">
        <AuthForm standalone />

        <div className="mt-8 text-center text-xs text-muted">
          <p>
            DBMS Mini-Project — Powered by MariaDB, Redis, Go, and Next.js.
          </p>
          <div className="mt-3 flex justify-center gap-4">
            <Link href="/" className="hover:text-ink underline">
              Home feed
            </Link>
            <Link href="/about" className="hover:text-ink underline">
              About project
            </Link>
            <Link href="/series" className="hover:text-ink underline">
              Subgetits
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
