// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  adapter: cloudflare(),
  env: {
    schema: {
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public' }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret' }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'public' }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'public' }),
    },
  },
});
