# Doctorooms Realtime Service — Render (Docker + Bun)
# Build context: mini-services/realtime-service (set via Render dockerContext)
FROM oven/bun:1

WORKDIR /app

# Prisma query engine needs openssl at runtime; ca-certificates for HTTPS calls
RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Dependencies first (cached layer)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# App source (schema required for prisma generate)
COPY prisma ./prisma
COPY index.ts ./

RUN bunx prisma generate

# Render injects PORT (default 10000); index.ts reads process.env.PORT
ENV PORT=10000
EXPOSE 10000

# Non-root user for safety
RUN chown -R bun:bun /app
USER bun

CMD ["bun", "index.ts"]
