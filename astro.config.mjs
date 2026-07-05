import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
        mode: 'standalone',
    }),
  
  server: {
    host: '0.0.0.0',
    port: 4321,
  },

  devToolbar: {
    enabled: false
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
    },
  },

  integrations: [sitemap()],
}
);