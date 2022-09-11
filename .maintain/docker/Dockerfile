# Dependencies stage
FROM node:16.16.0-alpine3.16 AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

# Builder stage
FROM node:16.16.0-alpine3.16 AS builder
WORKDIR /app
# Copy from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV production
RUN npm run build
# We'll use production dependencies only by NODE_ENV=production
RUN npm ci --ignore-scripts

# Production image, copy all the files and run
FROM node:16.16.0-alpine3.16 AS runner
LABEL network.debio.image.authors="devops@debio.network"
WORKDIR /app
# Copy from builder stage
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
# Set to a non-root user
USER node
# Set environment variable
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
EXPOSE ${PORT}
CMD [ "node", "dist/main.js"]
