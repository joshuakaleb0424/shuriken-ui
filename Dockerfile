
FROM bitnami/node:22.14.0 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS install
COPY . /build
WORKDIR /build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM install AS build-docs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run --filter @joshuakaleb/nuxt dev:prepare
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run --filter @joshuakaleb/nuxt-component-meta prepack
RUN --mount=type=cache,id=pnpm,target=/pnpm/store NODE_OPTIONS=--max-old-space-size=8192 pnpm run --filter @joshuakaleb/docs build

FROM base AS docs
ENV NODE_ENV=production
COPY --from=build-docs /build/docs/.output /prod/docs/.output
WORKDIR /prod/docs
EXPOSE 3000
CMD ["node",  ".output/server/index.mjs"]
