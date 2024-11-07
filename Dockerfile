# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Build arguments
ARG FONTAWESOME_TOKEN

ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG TIDE_URL

# Install dependencies
RUN npm install

# Remove .npmrc so token isn't in final image
RUN rm -f .npmrc

# Copy and build app
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY .npmrc ./

# Need to pass the arg again for this stage
ARG FONTAWESOME_TOKEN
RUN npm install --omit=dev && rm -f .npmrc


EXPOSE 5000
CMD ["node", "build"]