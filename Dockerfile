FROM node:lts AS base
WORKDIR /app

COPY package.json package-lock.json* ./

FROM base AS prod-deps
RUN npm install --omit=dev

FROM base AS build-deps
RUN npm install

FROM build-deps AS build
COPY . .
RUN npm run build

FROM base AS app-runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

FROM nginx:alpine AS nginx-runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
