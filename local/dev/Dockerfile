FROM node:24-alpine

RUN npm install --global --allow-scripts=pnpm pnpm@10.12.4

RUN apk add --no-cache python3 make g++

WORKDIR /app

EXPOSE 3000
