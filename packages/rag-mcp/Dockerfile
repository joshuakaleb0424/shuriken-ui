FROM node:24-alpine AS build

RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json ./
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml ./
COPY docs/package.json ./docs/package.json
COPY packages ./packages
COPY playgrounds ./playgrounds
RUN npx --yes pnpm@10.12.4 install --frozen-lockfile
COPY docs/content ./docs/content
RUN npx --yes pnpm@10.12.4 --filter @joshuakaleb/shuriken-ui-rag-mcp build

FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/packages/rag-mcp/package.json ./package.json
RUN node -e 'const fs = require("node:fs"); const pkg = JSON.parse(fs.readFileSync("package.json")); delete pkg.devDependencies; fs.writeFileSync("package.json", JSON.stringify(pkg));' \
  && npm install --omit=dev --ignore-scripts
COPY --from=build /app/packages/rag-mcp/dist ./dist
COPY --from=build /app/docs/content /app/docs/content
COPY --from=build /app/packages/nuxt/src/runtime/components /app/packages/nuxt/src/runtime/components
COPY --from=build /app/packages/nuxt/src/runtime/composables /app/packages/nuxt/src/runtime/composables
EXPOSE 3000
CMD ["node", "dist/index.js"]
