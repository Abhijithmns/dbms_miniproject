import { MessageCenter } from "@/components/MessageCenter";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Chats", "Reddit-style chat and direct messages on getit.");

export default function MessagesPage() {
  return (
    <div className="w-full max-w-[1100px] mx-auto px-2 sm:px-4 py-4 md:py-8">
      <MessageCenter />
    </div>
  );
}
