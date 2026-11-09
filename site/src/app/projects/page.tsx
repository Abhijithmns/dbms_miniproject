import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Community guidelines", "Simple guidelines for making getit a useful community.");

const GUIDELINES = [
  ["Be useful", "Share context, explain your reasoning, and leave people with something they can try."],
  ["Be kind", "Disagree with the idea, not the person. Everyone is learning something here."],
  ["Vote honestly", "Upvote things that help the conversation and downvote things that do not."],
  ["Keep it readable", "Use a clear title, add the important details, and give your comments room to breathe."],
];

export default function ProjectsPage() {
  return (
    <section className="wrap pt-12 md:pt-16" aria-labelledby="guidelines-title">
      <div className="margin-rule pl-5 sm:pl-8">
        <p className="kicker">getit guidelines</p>
        <h1 id="guidelines-title" className="display mt-3 text-4xl font-bold sm:text-5xl">Make the feed better.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">A few simple habits keep conversations useful, welcoming, and worth coming back to.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {GUIDELINES.map(([title, text], index) => (
          <article key={title} className="sheet p-6 sm:p-8">
            <p className="font-mono text-sm text-pen">0{index + 1}</p>
            <h2 className="display mt-3 text-2xl font-bold">{title}</h2>
            <p className="mt-3 text-lg text-muted">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/" className="btn">Go to home</Link>
        <Link href="/login" className="btn-ghost">Log in</Link>
      </div>
    </section>
  );
}
