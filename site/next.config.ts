import type { NextConfig } from "next";

// Set DEMO_BASE_PATH to serve the site from a sub-folder (used for the live demo
// on freeframe.dev). Leave it unset for your own site.
const basePath = process.env.DEMO_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath ?? "" },
};

export default nextConfig;
