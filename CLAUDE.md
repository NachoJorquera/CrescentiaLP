# CLAUDE.md

Single-page landing site for Crescentia Consultores: Astro 7, strict TypeScript, deployed as a Cloudflare Worker through `@astrojs/cloudflare`. `README.md` covers setup, Node version and the project layout.

## Commands

- `npm run dev`: dev server on http://localhost:4321, running on workerd (the Workers runtime), not Node.
- `npm run check`: type-checks `.astro` and `.ts` files.
- `npm test`: runs Vitest once. One file: `npx vitest run src/lib/contact.test.ts`. One test: add `-t "<test name>"`.
- `npm run build`: builds into `dist/`, which `wrangler.jsonc` serves as static assets.
- `npm run generate-types`: writes `worker-configuration.d.ts` from the bindings in `wrangler.jsonc`.

No linter or formatter is configured.

## Architecture

`src/pages/index.astro` stacks one component per section from `src/components/`. A component that needs client behavior carries its own `<script>`, which Astro bundles as TypeScript; `is:inline` marks third-party scripts loaded as-is.

All styles live in `src/styles/global.css`, imported once by `src/layouts/Layout.astro`. Components have no `<style>` blocks. Colors are custom properties in `:root`; reference them with `var(--color-*)`.

### Contact form

The one server-side feature spans three layers:

1. `src/components/Contact.astro` renders the form, a Turnstile widget (`interaction-only`) and a hidden honeypot field named `website`. Its script calls `actions.contact(formData)` and resets Turnstile after every attempt.
2. `src/actions/index.ts` is a thin Astro Action (`accept: 'form'`). It validates input with Zod, reads secrets from `astro:env/server`, and maps a failure reason to an `ActionError` code: `turnstile` becomes `FORBIDDEN`, `email` becomes `BAD_GATEWAY`.
3. `src/lib/contact.ts` holds the logic: a filled honeypot returns success without sending anything, then it verifies the Turnstile token and sends the email through the `send_email` binding (Cloudflare Email Service) with `replyTo` set to the visitor.

`src/lib/contact.ts` receives `fetch`, a `sendEmail` function and every secret through `ContactConfig`, and imports no `astro:*` or `cloudflare:*` module. That keeps it testable: Vitest runs in Node with no config, so it resolves neither Astro virtual modules nor `cloudflare:workers`. The action reads the binding with `import { env } from 'cloudflare:workers'` and passes `env.EMAIL.send` in. New server logic follows the same split, a pure module in `src/lib/` behind a thin action.

Locally the binding sends nothing: the dev server logs each message and saves its text under `.wrangler/tmp/email/`. Real delivery needs the domain on Cloudflare with Email Routing and a verified destination address.

### Environment variables

`env.schema` in `astro.config.mjs` declares every variable and its context (client or server, public or secret). Locally they come from `.dev.vars`, a git-ignored copy of `.dev.vars.example`; the example ships Cloudflare's always-pass Turnstile test keys. A new variable goes into both the schema and `.dev.vars.example`. A binding (KV, email, and so on) goes into `wrangler.jsonc` instead; then run `npm run generate-types` so `env` from `cloudflare:workers` knows its type.

The GitHub repository is public, so real keys and inbox addresses live only in `.dev.vars`. Committed files such as `wrangler.jsonc` and `.dev.vars.example` carry placeholders or test values.

## Conventions

- Visitor-facing copy and form field names are Spanish (`nombre`, `apellido`, `mensaje`); code identifiers are English.
- Images go in `public/images/` and are referenced by absolute path (`/images/...`).
