// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [react()],
  output: 'static',
  adapter: netlify(),
  server: {
    port: 4322,
    /** Listen on all interfaces so localhost, 127.0.0.1, and LAN preview URLs work. */
    host: true,
  },
  preview: {
    port: 4322,
    host: true,
  },
});
