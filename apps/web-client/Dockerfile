FROM node:20-alpine AS builder

WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy the entire monorepo
COPY . .

# Prune the workspace for web-client
RUN turbo prune --scope=@pocket-ops/web-client --docker

# Installer stage
FROM node:20-alpine AS installer
WORKDIR /app

# Copy pruned lockfile and package.json
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json

# Install dependencies
RUN npm ci

# Copy source code
COPY --from=builder /app/out/full/ .

# Build the project
RUN npx turbo run build --filter=@pocket-ops/web-client

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=installer /app/apps/web-client/next.config.ts ./
COPY --from=installer /app/apps/web-client/public ./apps/web-client/public
COPY --from=installer /app/apps/web-client/.next/standalone ./
COPY --from=installer /app/apps/web-client/.next/static ./apps/web-client/.next/static

EXPOSE 3000

CMD ["node", "apps/web-client/server.js"]
