# Production image for the admin dashboard (Next.js standalone, monorepo build).
# Multi-stage: deps → builder → non-root runtime.
# Node >=24 required (engines in dashboard/package.json).

FROM node:24-slim AS base
WORKDIR /app

# ---- deps: install with lockfile only (better layer caching) ----
FROM base AS deps
# Copy root manifests
COPY package.json package-lock.json ./
# Copy workspace manifests so npm ci resolves workspace deps correctly
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
# Prefer reproducible ci; fall back to install if lockfile drifts (optional-dep /
# npm-version mismatch). CI commits the corrected lock back.
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# ---- builder: compile the standalone server ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure public dir exists so the runtime COPY never fails (Next 16 projects
# may not have a public/ directory yet).
RUN mkdir -p /app/apps/web/public
ENV NEXT_TELEMETRY_DISABLED=1
# Build only the web app. npm workspace flag handles the workspace dep graph.
RUN npm run build -w @repo/web

# ---- runtime: minimal, non-root ----
FROM node:24-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# server.js listens on PORT / HOSTNAME (Next standalone docs).
# 0.0.0.0 so k8s Service / LB health checks can reach the container.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# node:24-slim ships a non-root `node` user (uid 1000). Use it.
# Monorepo standalone layout: apps/web/server.js + node_modules at repo root.
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./

# Static assets and public dir are NOT included in standalone — copy them so
# server.js serves them directly (Next standalone docs).
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public

USER node
EXPOSE 3000
# Monorepo standalone: server.js lands at apps/web/server.js (not repo root).
CMD ["node", "apps/web/server.js"]
