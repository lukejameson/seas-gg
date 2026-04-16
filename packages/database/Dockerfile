FROM node:22-alpine

RUN apk add --no-cache libc6-compat postgresql-client
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/database/package*.json ./packages/database/

# Install dependencies
RUN npm ci

# Copy source
COPY packages/database ./packages/database

# Build
RUN npm run build -w @seas/database

# Copy migrations
COPY packages/database/migrations /migrations
RUN chmod +x /migrations/entrypoint.sh

# Run migrations using idempotent SQL files
WORKDIR /app/packages/database
ENTRYPOINT ["/migrations/entrypoint.sh"]
