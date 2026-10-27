# CrescentiaLP

Landing page for Crescentia Consultores, built with Astro.

## Stack

- [Astro](https://astro.build) 7 with strict TypeScript.
- The [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter, so `npm run dev` and `npm run preview` run the site on workerd, the Cloudflare Workers runtime.
- Plain CSS in a single global stylesheet. Colors are custom properties in `:root`.
- Dependabot opens a weekly pull request for npm updates.

## Project structure

- `src/pages/index.astro`: the only page. It renders one component per section.
- `src/components/`: one component per section, each with its markup and its client script.
- `src/layouts/Layout.astro`: the document head and the import of the global stylesheet.
- `src/styles/global.css`: every style of the site.
- `public/images/`: images, served as-is under `/images/`.

## Requirements

Node.js 22.23.4 or later, the minimum the Astro CLI accepts. With nvm:

```sh
nvm install 24
nvm use 24
```

## Run locally

```sh
npm install
npm run dev
```

The site is served on http://localhost:4321.

## Scripts

- `npm run dev`: starts the development server, which reloads on file changes.
- `npm run build`: builds the site into `dist/`.
- `npm run preview`: serves the build on port 4321. Stop a preview server running in the background with `npx astro preview stop`.
- `npm run check`: type-checks `.astro` and `.ts` files with `astro check`.
- `npm run generate-types`: runs `wrangler types`, which writes `worker-configuration.d.ts` from the bindings in `wrangler.jsonc`.
