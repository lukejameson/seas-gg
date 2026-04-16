FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY packages/database/package*.json ./packages/database/
COPY apps/sea-temp-scraper/package*.json ./apps/sea-temp-scraper/

RUN npm ci -w @seas/sea-temp-scraper -w @seas/database

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build -w @seas/database && npm run build -w @seas/sea-temp-scraper

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/apps/sea-temp-scraper/dist ./apps/sea-temp-scraper/dist
COPY --from=builder /app/apps/sea-temp-scraper/package.json ./apps/sea-temp-scraper/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN npm prune --omit=dev

USER node

CMD ["node", "apps/sea-temp-scraper/dist/index.js"]
