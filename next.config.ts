import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev badge sits on top of the fake Start buttons and docks.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Dottie (Messenger) was retired; Mark (Facebook) took over the chats.
  async redirects() {
    return [{ source: "/messenger", destination: "/facebook", permanent: false }];
  },
  // PostHog goes through our own domain so ad blockers don't drop it.
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // PostHog's API paths end in a slash; don't redirect them away.
  skipTrailingSlashRedirect: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
