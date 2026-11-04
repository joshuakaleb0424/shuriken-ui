FROM node:26.13.0-alpine

RUN npm install --global --allow-scripts=pnpm pnpm@12.16.1

RUN apk add --no-cache python3 make g++

WORKDIR /app

EXPOSE 3000
