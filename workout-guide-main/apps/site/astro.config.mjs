import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bryllim.github.io',
  base: '/workout-guide',
  integrations: [sitemap()],
  output: 'static',
  trailingSlash: 'always',
});
