# Base node image
FROM node:20-alpine AS builder

# Add necessary build tools
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

ARG FONTAWESOME_TOKEN
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

# Copy built assets from builder
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules node_modules/

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "build"]