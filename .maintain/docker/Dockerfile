# Install dependencies only when needed
FROM node:16.14.2-buster-slim AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Rebuild the source code only when needed
FROM node:16.14.2-buster-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force

# Production image, copy all the files and run
FROM node:16.14.2-buster-slim AS runner
LABEL social.debio.image.authors="debio.dev@blocksphere.id"
# Create user and set ownership and permissions as required
RUN useradd -m -u 1001 -U -s /bin/sh -d /home/debio debio
WORKDIR /app
# Copy from builder stage
COPY --from=builder --chown=debio /app/package.json ./package.json
COPY --from=builder --chown=debio /app/node_modules ./node_modules
COPY --from=builder --chown=debio /app/dist ./dist
# Set to a non-root built-in user
USER debio
# Set environment variable
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
EXPOSE ${PORT}
CMD [ "npm", "run", "start:prod"]
