# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# These become part of the built JS bundle (Vite inlines import.meta.env.VITE_* at build time),
# so they must point to URLs reachable from the END USER'S BROWSER, not container-internal hostnames.
# Override at build time with --build-arg if deploying somewhere other than localhost.
ARG VITE_HOME_BASE_URL=http://localhost:4001
ARG VITE_RENT_BASE_URL=http://localhost:4002
ARG VITE_BUY_BASE_URL=http://localhost:4003
ARG VITE_SEARCH_BASE_URL=http://localhost:4004
ARG VITE_AUTH_BASE_URL=http://localhost:5000

ENV VITE_HOME_BASE_URL=$VITE_HOME_BASE_URL \
    VITE_RENT_BASE_URL=$VITE_RENT_BASE_URL \
    VITE_BUY_BASE_URL=$VITE_BUY_BASE_URL \
    VITE_SEARCH_BASE_URL=$VITE_SEARCH_BASE_URL \
    VITE_AUTH_BASE_URL=$VITE_AUTH_BASE_URL

RUN npm run build

# ---------- Production stage ----------
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
