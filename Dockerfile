FROM node:18-slim
WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm ci --quiet && \
    npm install @rollup/rollup-linux-x64-gnu

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Set environment and start command
ENV PORT=5000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 5000
CMD ["node", "build"]