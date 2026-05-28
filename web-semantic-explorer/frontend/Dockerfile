# Stage 0, "build-stage", based on Node, to build and compile the frontend
FROM node:20-bullseye-slim AS build-stage

WORKDIR /app

COPY web-semantic-explorer/package.json web-semantic-explorer/pnpm-workspace.yaml* web-semantic-explorer/pnpm-lock.yaml* /app/
COPY web-semantic-explorer/frontend/package.json /app/frontend/

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
RUN pnpm install --frozen-lockfile

COPY ./web-semantic-explorer/frontend /app/frontend
ARG VITE_API_URL

WORKDIR /app/frontend

# -- Development Stage --
FROM build-stage AS development
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]

# -- Builder Stage --
FROM build-stage AS production-builder
RUN pnpm run build

# -- Production Stage --
FROM nginx:1 AS production

COPY --from=production-builder /app/frontend/dist/ /usr/share/nginx/html

COPY ./web-semantic-explorer/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./web-semantic-explorer/frontend/nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
