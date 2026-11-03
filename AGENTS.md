# Repository Guidance

## Dependency management

- This is a private pnpm workspace/monorepo. The required package manager is pinned in the root `package.json` as `pnpm@10.12.4`.
- Use the repository wrapper for every pnpm command: `./local/pnpm <command>`. It runs pnpm in the `shuriken-ui` Docker Compose service, so do not assume Node.js or pnpm are installed on the host.
- The wrapper uses `local/dev/compose.yaml` and, when present, `local/dev/.env`.
- npm authentication is supplied at runtime through `NPM_TOKEN`; set it in an untracked `local/dev/.env` file (use `local/dev/.env.example` as the template). The repository `.npmrc` reads that environment variable and contains no secret itself.
- Run dependency commands from the repository root.

### Version ownership

- Keep shared framework versions in `pnpm-workspace.yaml`'s default `catalog`: `@tailwindcss/vite`, `tailwindcss`, `vue`, `nuxt`, `reka-ui`, and `typescript`.
- Dependencies written as `"catalog:"` in package manifests inherit their version from that catalog. Upgrade their catalog entry once; do not replace the individual `catalog:` references with duplicate version ranges.
- Package-specific dependencies are declared in:
  - `packages/nuxt/package.json`
  - `packages/nuxt-component-meta/package.json`
  - `docs/package.json`
  - `playgrounds/default/package.json`
  - `playgrounds/tiny/package.json`
- Workspace packages use `workspace:*`; preserve that protocol.
- `pnpm-lock.yaml` is the shared lockfile. Commit it with every dependency change.

### Update workflow

1. Inspect available updates without writing files:

   ```sh
   ./local/pnpm outdated -r
   ```

2. For compatible updates within the existing declared ranges, run:

   ```sh
   ./local/pnpm update -r
   ```

3. For an intentional newer major or latest release, update the shared catalog and any affected direct dependency specifiers deliberately, then regenerate the lockfile:

   ```sh
   ./local/pnpm install
   ```

4. Review every manifest and `pnpm-lock.yaml` change before committing. Do not use a broad latest-version update without assessing Nuxt/Vue/Tailwind compatibility and release notes.

### Validation after dependency changes

```sh
./local/pnpm --filter @joshuakaleb/shuriken-ui-nuxt lint
./local/pnpm --filter @joshuakaleb/shuriken-ui-nuxt test:types
./local/pnpm --filter @joshuakaleb/shuriken-ui-nuxt build

./local/pnpm --filter @joshuakaleb/shuriken-ui-docs lint
./local/pnpm --filter @joshuakaleb/shuriken-ui-docs build

./local/pnpm --filter playground build
./local/pnpm --filter playground-tiny build
```

- There is no root `test` script. The contributor documentation's `pnpm test` instruction is stale; use the scoped checks above.
- Preserve `onlyBuiltDependencies` and `ignoredBuiltDependencies` in `pnpm-workspace.yaml`. In particular, native/build-time packages such as `better-sqlite3`, `sharp`, `@tailwindcss/oxide`, and `unrs-resolver` have explicit build-policy entries.
- The Docker development service itself installs with `pnpm install --frozen-lockfile`; an out-of-date lockfile will break that workflow.
