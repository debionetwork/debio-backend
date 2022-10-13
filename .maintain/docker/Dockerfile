FROM node:16.16.0-bullseye-slim@sha256:02ccb6b16a5d3c6c702e55dee1769d2976bf15ba40f566cd6ded61cdf0d78896 AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

FROM node:16.16.0-bullseye-slim@sha256:02ccb6b16a5d3c6c702e55dee1769d2976bf15ba40f566cd6ded61cdf0d78896 as builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV production
RUN npm run build
RUN npm ci --ignore-scripts

FROM node:16.16.0-bullseye-slim@sha256:02ccb6b16a5d3c6c702e55dee1769d2976bf15ba40f566cd6ded61cdf0d78896 as runner
LABEL debio.network.image.authors="dev@debio.network"
WORKDIR /app
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
EXPOSE ${PORT}
CMD [ "node", "dist/main.js"]
