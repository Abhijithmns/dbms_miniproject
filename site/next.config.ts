import type { NextConfig } from "next";

// Set DEMO_BASE_PATH to serve the site from a sub-folder (used for the live demo
// on freeframe.dev). Leave it unset for your own site.
const basePath = process.env.DEMO_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath ?? "" },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
