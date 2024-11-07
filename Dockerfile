# Base node image
FROM node:20-slim AS builder
# Add necessary build tools
RUN apt-get update && apt-get install -y git

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
ENV ORIGIN=https://guernseytides.co.uk
ENV NODE_ENV=production
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_KEY=${SUPABASE_KEY}
ENV TIDE_URL=${TIDE_URL}

RUN npm config set "@fortawesome:registry" "https://npm.fontawesome.com/" && \
    npm config set "//npm.fontawesome.com/:_authToken" "${FONTAWESOME_TOKEN}"

# Copy package files
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-slim AS production
WORKDIR /app

# Set runtime environment variables
ENV PORT=5000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV ORIGIN=https://guernseytides.co.uk
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_KEY=${SUPABASE_KEY}
ENV TIDE_URL=${TIDE_URL}

# Copy built assets from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "build"]