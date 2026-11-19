import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Statischer Build (output: static). Stylesheets bleiben eigene Dateien,
// damit die Content-Security-Policy ohne 'unsafe-inline' für Skripte auskommt.
export default defineConfig({
  site: 'https://www.talmiro.de',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/danke') && !page.includes('/fehler') && !page.includes('/404') }),
  ],
});
