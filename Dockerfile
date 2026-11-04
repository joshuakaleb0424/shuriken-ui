
FROM node:26.13.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --global pnpm@12.16.1

FROM base AS install
COPY . /build
WORKDIR /build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM install AS build-docs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run --filter @joshuakaleb/shuriken-ui-nuxt dev:prepare
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run --filter @joshuakaleb/shuriken-ui-nuxt-component-meta prepack
RUN --mount=type=cache,id=pnpm,target=/pnpm/store NODE_OPTIONS=--max-old-space-size=8192 pnpm run --filter @joshuakaleb/shuriken-ui-docs build

FROM base AS docs
ENV NODE_ENV=production
COPY --from=build-docs /build/docs/.output /prod/docs/.output
WORKDIR /prod/docs
EXPOSE 3000
CMD ["node",  ".output/server/index.mjs"]
