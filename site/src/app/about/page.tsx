import { MailIcon } from "@/components/Icons";
import { UserIdentity } from "@/components/UserIdentity";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("About", "What getit is, how the community works, and how to join.");

export default function AboutPage() {
  return (
    <>
      <section className="wrap pt-12 md:pt-16" aria-labelledby="about-title">
        <div className="margin-rule pl-5 sm:pl-8">
          <p className="kicker">about getit</p>
          <h1 id="about-title" className="display mt-3 text-4xl font-bold sm:text-5xl">The place for “same.”</h1>
          <div className="mt-6 max-w-2xl space-y-5 text-lg leading-relaxed">
            <p>getit is a community platform for questions, ideas, recommendations, and the little discoveries that are better when shared.</p>
            <p>Find a subgetit, browse the feed, upvote the posts that help, downvote the ones that miss, and add a comment when you have something useful to say.</p>
            <p>When you log in to this demo, getit creates a random username for you automatically. No personal details are needed to explore the interface.</p>
          </div>
        </div>
      </section>

      <section className="wrap mt-20" aria-labelledby="how-title">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["01", "Find", "Browse subgetits and discover conversations by topic."],
            ["02", "React", "Upvote, downvote, or leave a comment on a post."],
            ["03", "Join", "Log in and get a random username for the demo."],
          ].map(([number, title, text]) => (
            <article key={number} className="sheet p-6">
              <p className="font-mono text-sm text-pen">{number}</p>
              <h2 className="display mt-3 text-xl font-bold">{title}</h2>
              <p className="mt-2 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap mt-20" aria-labelledby="account-title">
        <div className="sheet flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 id="account-title" className="display text-2xl font-bold">Ready to getit?</h2>
            <p className="mt-2 text-muted">Log in to generate your demo username. Click it again any time to log out.</p>
          </div>
          <UserIdentity mobile />
        </div>
      </section>

      <section className="wrap mt-20" aria-labelledby="contact-title">
        <div className="grid gap-6 rounded-md border border-dashed border-ink p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <h2 id="contact-title" className="display text-xl font-bold">Say hello</h2>
            <p className="mt-2 text-muted">Questions, feedback, or a post that deserves a feature?</p>
          </div>
          <a href={`mailto:${site.email}`} className="btn"><MailIcon /> {site.email}</a>
        </div>
      </section>
    </>
  );
}
