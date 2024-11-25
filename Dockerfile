FROM node:18-slim AS builder
WORKDIR /app

ARG TIDE_URL
ARG SEA_TEMP_URL
ARG POSTGRES_HOST
ARG POSTGRES_PORT
ARG POSTGRES_DATABASE
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_SSL

ENV TIDE_URL=${TIDE_URL}
ENV SEA_TEMP_URL=${SEA_TEMP_URL}
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_DATABASE=${POSTGRES_DATABASE}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_SSL=${POSTGRES_SSL}

# Install system dependencies first
RUN apt-get update && \
    apt-get install -y python3 make g++ \
    wget \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Create a temporary directory for building
WORKDIR /temp_build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --quiet && \
    npm install @rollup/rollup-linux-x64-gnu

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Start fresh for the production image
FROM node:18-slim
WORKDIR /app

# Copy only the built assets and package files
COPY --from=builder /temp_build/build ./build
COPY --from=builder /temp_build/package*.json ./

# Install production dependencies
RUN npm ci --quiet --only=production

# Install system dependencies for production
RUN apt-get update && \
    apt-get install -y \
    wget \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

ENV PORT=5000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 5000
CMD ["node", "build"]