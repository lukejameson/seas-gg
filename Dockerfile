# Base node image
FROM node:20-alpine AS builder
# Add necessary build tools
RUN apk add --no-cache git
# Set working directory
WORKDIR /app

# Set build arguments
ARG FONTAWESOME_TOKEN
ARG TIDE_URL
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG PORT=5000

# Set environment variables for build
ENV PORT=5000
ENV HOST=0.0.0.0

RUN npm config set "@fortawesome:registry" "https://npm.fontawesome.com/" && \
    npm config set "//npm.fontawesome.com/:_authToken" "${FONTAWESOME_TOKEN}"

# Copy package files
COPY package*.json package-lock.json* ./

# Install dependencies
RUN npm install --verbose

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine AS production
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
CMD ["sh", "-c", "PORT=5000 node build"]