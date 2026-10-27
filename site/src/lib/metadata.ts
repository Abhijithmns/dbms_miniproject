import type { Metadata } from "next";
import { site } from "@/data/site";
import { asset } from "@/lib/asset";

/**
 * Title, description and Open Graph tags for a page. `title` goes through the layout's
 * template ("Home" becomes "Home — getit"). A page that sets openGraph replaces the
 * layout's, so the shared image is repeated here.
 */
export function pageMetadata(
  title: string,
  description: string,
  { type = "website", absolute = false }: { type?: "website" | "article"; absolute?: boolean } = {},
): Metadata {
  const full = absolute ? title : `${title} — ${site.name}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    openGraph: { type, siteName: site.name, title: full, description, images: [asset("/img/og-image.png")] },
  };
}
