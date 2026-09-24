# Etapa 1: compilar la app
FROM node:22-alpine AS build
WORKDIR /app

ENV NG_CLI_ANALYTICS=false
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx ng build

# Etapa 2: servir solo los ficheros estáticos
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/casino/browser /usr/share/nginx/html
EXPOSE 80
