# Build stage - no Chromium needed here
FROM node:18-slim AS builder
WORKDIR /app

# Install build dependencies only
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Production stage
FROM node:18-slim
WORKDIR /app

# Install Chromium and required libraries in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Copy built app and install production deps
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --ignore-scripts --omit=dev

# Configure environment
ENV PORT=5000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV TZ=Europe/London
ENV CHROMIUM_PATH=/usr/bin/chromium

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 5000
CMD ["node", "build"]
