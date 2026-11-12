import { pageMetadata } from "@/lib/metadata";
import { SeriesPageContent } from "@/components/SeriesPageContent";

export const metadata = pageMetadata(
  "Series",
  "Browse getit subgetits and find the conversations that match your interests.",
);

export default function SeriesPage() {
  return <SeriesPageContent />;
}
