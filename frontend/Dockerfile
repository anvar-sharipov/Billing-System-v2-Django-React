# Build stage
FROM node:20-bullseye AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Установить переменные окружения для продакшена
ENV VITE_API_URL=https://192.168.25.74/api/
# ENV VITE_WS_URL=wss://192.168.25.74  ← Удалите эту строку

RUN npm run build

# Production stage
FROM nginx:alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./generate-ssl.sh /usr/local/bin/generate-ssl.sh
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/generate-ssl.sh /usr/local/bin/entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]