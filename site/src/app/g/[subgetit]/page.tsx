import { SubredditPage } from "@/components/SubredditPage";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subgetit: string }>;
}) {
  const { subgetit } = await params;
  return pageMetadata(`r/${subgetit}`, `Discussions and posts in r/${subgetit}`);
}

export default async function SubredditRoute({
  params,
}: {
  params: Promise<{ subgetit: string }>;
}) {
  const { subgetit } = await params;
  return <SubredditPage slug={subgetit} />;
}
