# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace root
COPY package.json ./
COPY packages/shared ./packages/shared
COPY apps/api/package.json ./apps/api/package.json

# Install all deps (workspace-aware)
RUN npm install --workspace=apps/api --workspace=packages/shared

# Copy source
COPY apps/api ./apps/api
COPY tsconfig.base.json ./

# Generate Prisma client + build
RUN cd apps/api && npx prisma generate && npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
