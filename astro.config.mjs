import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Nicht in die Sitemap der Website: Stellenseiten (/jobs, /jobs-vorlagen; Stellen stehen in /jobs/sitemap-jobs.xml vom CRM) und die Fehlerziele
// /stelle-vergeben/ und /en/position-filled/ (noindex, auch wenn STELLEN_DEMO = false).
// Statischer Build (output: static). Stylesheets bleiben eigene Dateien,
// damit die Content-Security-Policy ohne 'unsafe-inline' für Skripte auskommt.
export default defineConfig({
  site: 'https://www.talmiro.de',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  // Skripte nie inline einbetten (Content-Security-Policy erlaubt nur eigene Dateien und den einen gehashten Inline-Block)
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/danke') && !page.includes('/fehler') && !page.includes('/404') && !page.includes('/jobs') && !page.includes('/stelle-vergeben') && !page.includes('/position-filled') }),
  ],
});
