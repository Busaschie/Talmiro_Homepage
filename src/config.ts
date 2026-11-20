// Schalter der Website.
// Menüpunkt "Stellen" in der Navigation (führt zu /jobs/). Erst auf true setzen, wenn die Stellenbörse live ist.
// Auf den Stellenseiten selbst (/jobs/, /jobs/en/) erscheint der Menüpunkt immer.
export const STELLEN_IN_NAVIGATION = false;

// Stellenbörse als Demo (true) oder echt (false). Bei true sind /jobs/ und /jobs/en/ reine Beispielseiten: noindex/nofollow (Meta-Tag der Vorlagen,
// X-Robots-Tag in .htaccess), Disallow in robots.txt ohne Sitemap-Zeile, sichtbarer Hinweis auf jeder Seite, Bewerben führt zum Pilot-Formular statt
// zu einer E-Mail-Adresse. Bei false (echte Stellenbörse) wie bisher. Wirkt nach `npm run build`; Umstellen siehe README „Stellenbörse als Demo“.
export const STELLEN_DEMO = true;

// Absolute Adresse der Website (Stellenseiten liegen unter /jobs/ und brauchen absolute Links), siehe scripts/make-vorlagen.mjs
export const SITE = 'https://www.talmiro.de';
