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
