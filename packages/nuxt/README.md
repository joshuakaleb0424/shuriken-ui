<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/shuriken-ui/.github/assets/86636408/278e3026-1997-4e01-9457-20772adbce31">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/shuriken-ui/.github/assets/86636408/06f9d8e2-38aa-45b2-b91e-1c891a20e271">
    <img alt="Shuriken UI logo" src="https://github.com/shuriken-ui/.github/assets/86636408/06f9d8e2-38aa-45b2-b91e-1c891a20e271">
  </picture>
</p>

<p align="center">
  <a href="https://shurikenui.com" title="Shuriken UI website"><strong>shurikenui.com</strong></a> |
  by <a href="https://cssninja.io" title="Our official website"><strong>cssninja.io</strong></a>
</p>

---

## Shuriken UI - Nuxt

Shuriken UI is a free and open-source Tailwind CSS UI Kit. It is a collection of components and templates that you can use to build your next Tailwind CSS project.

This repository contains Shuriken UI components (form inputs, buttons, cards, etc.) that you can use to build your project.

## Installation

Install dependencies:

```bash
pnpm install -D @joshuakaleb/nuxt tailwindcss
```

Add the Shuriken UI module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@joshuakaleb/nuxt'],
  css: ['~/assets/css/main.css'],
})
```

Reference Shuriken UI in your `~/assets/css/main.css` file:

```css
@import 'tailwindcss';
@import '@joshuakaleb/nuxt';
```

> See the [theme.css](https://github.com/joshuakaleb0424/shuriken-ui/blob/main/packages/nuxt/runtime/theme.css) file for a complete list of available variables you can customize.
