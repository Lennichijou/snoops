import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',

  devToolbar: {
    enabled: false
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  }),

  integrations: [sitemap()],
}
);