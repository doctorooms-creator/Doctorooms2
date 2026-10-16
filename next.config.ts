import type { NextConfig } from "next";

// Round 10-b: PSuggestion.coId added via prisma db:push — this comment-only
// change nudges `next dev` to self-restart so the regenerated Prisma client
// (with the new field) is re-required by the running server.
const nextConfig: NextConfig = {
  // `standalone` output is for self-hosting (Docker/VPS). On Vercel it is
  // unsupported and must be omitted — VERCEL is always set on their platform.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
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
  // z-ai-web-dev-sdk reads its credentials from `<cwd>/.z-ai-config` (file
  // only — no env-var support). In the sandbox that's /etc/.z-ai-config; on
  // Vercel the file does not exist, so the build command writes it into the
  // project root from ZAI_* env vars right before `next build`. Next's output
  // file tracing can't see the dynamic fs.readFile path, so include it
  // explicitly for every SDK-using route — otherwise the file never reaches
  // the serverless bundle and Aturseva/Sevika/Copilot LLM calls all fail.
  outputFileTracingIncludes: {
    "/api/copilot/chat": ["./.z-ai-config"],
    "/api/dashboard/patient/aturseva/chat": ["./.z-ai-config"],
    "/api/dashboard/patient/aturseva/voice/speak": ["./.z-ai-config"],
    "/api/dashboard/patient/aturseva/voice/transcribe": ["./.z-ai-config"],
    "/api/dashboard/patient/sevika/chat": ["./.z-ai-config"],
    "/api/dashboard/patient/sevika/diet": ["./.z-ai-config"],
    "/api/dashboard/patient/sevika/parse-photo": ["./.z-ai-config"],
    "/api/dashboard/patient/sevika/today": ["./.z-ai-config"],
    "/api/dashboard/patient/sevika/weekly-report": ["./.z-ai-config"],
  },
};

export default nextConfig;
