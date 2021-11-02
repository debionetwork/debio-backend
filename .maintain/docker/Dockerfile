# Install dependencies only when needed
FROM node:14.17.5-buster-slim AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Rebuild the source code only when needed
FROM node:14.17.5-buster-slim AS builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
ENV DEBIOENV=development
RUN npm run build

# Production image, copy all the files and run
FROM node:14.17.5-buster-slim AS runner
LABEL social.debio.image.authors="debio.dev@blocksphere.id"
# Create user and set ownership and permissions as required
RUN useradd -m -u 1001 -U -s /bin/sh -d /home/debio debio
WORKDIR /app
# Copy from builder stage
COPY --from=builder --chown=debio /app/dist ./dist
COPY --from=builder --chown=debio /app/node_modules ./node_modules
COPY --from=builder --chown=debio /app/package.json ./package.json
# Set to a non-root built-in user
USER debio
# Set environment variable
ENV NODE_ENV=development HOST=0.0.0.0 PORT=3000
EXPOSE ${PORT}
CMD [ "npm", "run", "start:prod"]