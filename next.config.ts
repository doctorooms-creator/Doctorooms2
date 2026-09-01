import type { NextConfig } from "next";

// Round 10-b: PSuggestion.coId added via prisma db:push — this comment-only
// change nudges `next dev` to self-restart so the regenerated Prisma client
// (with the new field) is re-required by the running server.
const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "*.space-z.ai",
    "127.0.0.1",
    "localhost",
    "21.0.4.19",
  ],
  experimental: {
    // Dev-server memory: Next.js restarts the dev server (and full-reloads
    // every open browser tab) when heap usage crosses ~80% of the V8 heap
    // limit. This app has 800+ routes, so webpack's in-memory caches push
    // past that threshold quickly. Memory optimizations slow heap growth
    // substantially → far fewer surprise auto-reloads for the user.
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
