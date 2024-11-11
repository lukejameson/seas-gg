# Base node image
FROM node:23-slim AS builder

# Install git and build essentials
RUN apt-get update && \
    apt-get install -y git python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set build arguments
ARG TIDE_URL
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG SEA_TEMP_URL
ARG PORT=5000

# Set environment variables for build
ENV PORT=5000
ENV HOST=0.0.0.0

# Copy package files first
COPY package*.json ./

RUN npm ci

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:23-slim AS production
WORKDIR /app

# Set runtime environment variables
ENV PORT=5000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Copy built assets from builder
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules node_modules/

# Expose the port the app runs on
EXPOSE 5000

# Start the application with explicit port
CMD ["node", "build"]