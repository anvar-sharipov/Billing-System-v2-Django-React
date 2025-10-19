# Build stage
FROM node:20-bullseye AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Установить OpenSSL для генерации сертификатов
RUN apk add --no-cache openssl

WORKDIR /app

# Копировать собранное приложение
COPY --from=build /app/dist /usr/share/nginx/html

# Копировать конфигурацию Nginx
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Копировать скрипты
COPY ./generate-ssl.sh /usr/local/bin/generate-ssl.sh
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh

# Сделать скрипты исполняемыми
RUN chmod +x /usr/local/bin/generate-ssl.sh /usr/local/bin/entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]