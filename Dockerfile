# Production image for the Next.js app (UI + /api route handlers).
# Multi-stage: install deps -> build (standalone) -> slim non-root runtime.
# Mirrors the Hermes frontend Dockerfile pattern.
FROM node:20-slim AS base
WORKDIR /app

# ---- deps: install with the lockfile only (better layer caching) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- builder: compile the standalone server ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Commit SHA -> baked into the bundle. Reserved for version-skew protection
# (deterministic build id) once we wire it into next.config.ts, same as Hermes.
# Unset in local builds -> Next falls back to its default build id.
ARG APP_BUILD_SHA
ENV APP_BUILD_SHA=$APP_BUILD_SHA
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runtime: minimal, non-root ----
FROM base AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# server.js listens on PORT/HOSTNAME (Next standalone docs). 0.0.0.0 so the
# k8s Service / LB health check can reach it from outside the container.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# node:20-slim ships a non-root `node` user (uid 1000). Use it.
# The standalone server.js + traced node_modules:
COPY --from=builder --chown=node:node /app/.next/standalone ./
# public/ and .next/static are NOT in standalone by default — copy them so
# server.js serves them (Next docs). Long term, /_next/static moves to a CDN
# (R2) per the static-assets plan; until then the app serves them.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
