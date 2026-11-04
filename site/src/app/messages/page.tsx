import { MessageCenter } from "@/components/MessageCenter";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Messages", "Private messages on getit.");
export default function MessagesPage(){return <section className="wrap pt-12 md:pt-16"><p className="kicker">private messages</p><h1 className="display mt-3 text-4xl font-bold">Inbox.</h1><MessageCenter/></section>}
