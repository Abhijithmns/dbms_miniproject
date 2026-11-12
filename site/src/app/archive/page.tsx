import { ArchivePageContent } from "@/components/ArchivePageContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Home", "The getit community feed: questions, advice, recommendations, and useful conversations.");

export default function ArchivePage() {
  return <ArchivePageContent />;
}
