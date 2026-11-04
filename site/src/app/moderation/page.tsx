import { ModerationPanel } from "@/components/ModerationPanel";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Moderation", "Manage getit roles.");
export default function ModerationPage() { return <section className="wrap pt-12 md:pt-16"><p className="kicker">moderation</p><h1 className="display mt-3 text-4xl font-bold">Manage roles.</h1><p className="mt-4 max-w-2xl text-muted">Only users with the moderator role can change account roles.</p><ModerationPanel /></section>; }
