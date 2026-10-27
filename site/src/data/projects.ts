/** Optional community cards for future getit homepage sections. */

export type CommunityCard = {
  name: string;
  description: string;
  members: string;
};

export const COMMUNITIES: CommunityCard[] = [
  { name: "dbms", description: "Questions and explainers for database learners.", members: "2.4k" },
  { name: "campus-life", description: "The useful and chaotic parts of campus life.", members: "5.8k" },
  { name: "programming-help", description: "Get unstuck and help someone else get unstuck.", members: "3.1k" },
];
