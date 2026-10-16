#!/usr/bin/env node
/**
 * Vercel pre-build step: materialize .z-ai-config from ZAI_* env vars.
 *
 * z-ai-web-dev-sdk (Aturseva/Sevika/Copilot LLM + TTS/ASR) reads its
 * credentials from `<cwd>/.z-ai-config` — a FILE, with no env-var support.
 * The sandbox provides /etc/.z-ai-config; Vercel does not, so this script
 * writes the file into the project root right before `next build`. Next's
 * output file tracing then bundles it into the SDK-using serverless routes
 * (see outputFileTracingIncludes in next.config.ts).
 *
 * If any ZAI_* var is missing, an invalid empty config is written on purpose
 * — the SDK throws "Configuration file not found or invalid" at call time,
 * which the chat/voice routes already degrade gracefully from.
 */
const fs = require('fs') // eslint-disable-line @typescript-eslint/no-require-imports -- plain Node CJS script run by the Vercel build command (not bundled by Next)

const config = {
  baseUrl: process.env.ZAI_BASE_URL || '',
  apiKey: process.env.ZAI_API_KEY || '',
  token: process.env.ZAI_TOKEN || '',
  chatId: process.env.ZAI_CHAT_ID || '',
  userId: process.env.ZAI_USER_ID || '',
}

if (!config.baseUrl || !config.apiKey) {
  console.log('[zai-config] WARN: ZAI_BASE_URL/ZAI_API_KEY not set — writing empty config (LLM calls will degrade gracefully)')
}

fs.writeFileSync('.z-ai-config', JSON.stringify(config))
console.log('[zai-config] wrote .z-ai-config (baseUrl set:', Boolean(config.baseUrl), ')')
