FROM node:20-alpine AS builder

WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Copy the entire monorepo
COPY . .

# Prune the workspace for api-core
RUN turbo prune --scope=@pocket-ops/api-core --docker

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
RUN npx turbo run build --filter=@pocket-ops/api-core

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=installer /app .

CMD ["node", "apps/api-core/dist/main.js"]
