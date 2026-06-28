# Multi-stage production build for Node/Express API
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

# Copy built code from builder
COPY --from=builder /usr/src/app /usr/src/app

EXPOSE 5000

CMD ["node", "server.js"]
