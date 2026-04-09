FROM node:20.9.0-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20.9.0-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libvips42 \
    wget \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

COPY package*.json ./

RUN npm ci --only=production \
    && npm cache clean --force


COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
