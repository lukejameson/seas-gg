FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY packages/database/package*.json ./packages/database/
COPY apps/web/package*.json ./apps/web/

RUN npm ci -w @seas/web -w @seas/database

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build -w @seas/database && npm run build -w @seas/web

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/apps/web/build ./apps/web/build
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/svelte.config.js ./apps/web/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN npm prune --omit=dev

USER node

EXPOSE 3000

CMD ["node", "apps/web/build"]
