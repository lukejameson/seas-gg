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

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --quiet && \
    npm install @rollup/rollup-linux-x64-gnu

COPY . .
RUN npm run build

FROM node:18-slim
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

RUN npm ci --quiet --only=production

ENV PORT=5000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 5000
CMD ["node", "build"]