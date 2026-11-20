// Nachbereitung nach astro build für die Stellenbörse.  Zwei Modi:
//
//   node scripts/make-vorlagen.mjs              Website-Modus (npm run build): schreibt NICHTS nach homepage/jobs/.
//   node scripts/make-vorlagen.mjs --vorlagen   Vorlagen-Modus (npm run vorlagen): zusätzlich jobs/_vorlagen für das CRM erzeugen.
//
// Ausgangspunkt: dist/jobs-vorlagen/{detail,liste}-{de,en}/index.html (Quelle: src/pages/jobs-vorlagen/, Layout src/layouts/JobsLayout.astro)
//
// Beide Modi:
//   - Dateien mit Hash im Namen (Schriften, Logo, Wasserzeichen) werden unter festem Namen nach dist/stabil/ kopiert.
//   - CSS und Skripte der Stellenseiten werden unter festen Namen gebündelt (dist/css/jobs.css, dist/js/jobs-site.js), damit bereits
//     hochgeladene Stellenseiten nach einem neuen Website-Build nicht auf nicht mehr vorhandene Dateien mit Hash zeigen. Der Website-Upload liefert sie mit.
//   - Die Vorlagen werden geprüft (jeder Platzhalter genau einmal, keine Inline-Skripte oder style-Attribute, absolute Adressen).
//   - robots.txt und .htaccess aus public/ nach dist/ (Zeilen "#@demo " / "#@echt " je nach STELLEN_DEMO in src/config.ts).
//   - dist/jobs-vorlagen wird entfernt. dist/jobs darf nicht existieren: unter /jobs/ liefert die Website nie etwas (Abbruch sonst).
//
// Nur Vorlagen-Modus:
//   jobs/_vorlagen/_vorlage_detail.de.html, _vorlage_detail.en.html   ({{JOB_HEAD}}, {{JOB_BODY}})
//   jobs/_vorlagen/_vorlage_liste.de.html,  _vorlage_liste.en.html    ({{JOB_HEAD}}, {{JOB_LIST}}, {{JOB_COUNT}})
//   Das CRM liest sie über JOBS_TEMPLATE_DIR (..\homepage\jobs\_vorlagen). Unterscheiden sich die neuen Vorlagen von den vorhandenen,
//   wird der alte Ordner vorher als jobs/_vorlagen.bak-<Datum> gesichert. Alle Adressen mit führendem "/" werden absolut (SITE).
//
// Fehlermeldungen brechen den Build ab (Exit 1).
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const VORLAGEN_MODUS = process.argv.includes('--vorlagen');
const SITE = (process.env.JOBS_SITE ?? 'https://www.talmiro.de').replace(/\/+$/, '');
const DIST = 'dist';
const VORLAGEN = 'jobs/_vorlagen';

const QUELLEN = {
  'detail-de': { datei: '_vorlage_detail.de.html', platzhalter: { '{{JOB_HEAD}}': 1, '{{JOB_BODY}}': 1 } },
  'detail-en': { datei: '_vorlage_detail.en.html', platzhalter: { '{{JOB_HEAD}}': 1, '{{JOB_BODY}}': 1 } },
  'liste-de': { datei: '_vorlage_liste.de.html', platzhalter: { '{{JOB_HEAD}}': 1, '{{JOB_LIST}}': 1, '{{JOB_COUNT}}': 1 } },
  'liste-en': { datei: '_vorlage_liste.en.html', platzhalter: { '{{JOB_HEAD}}': 1, '{{JOB_LIST}}': 1, '{{JOB_COUNT}}': 1 } },
};

const fehler = (m) => { console.error(`make-vorlagen: ${m}`); process.exit(1); };
const lesen = (p) => { if (!existsSync(p)) fehler(`Datei fehlt: ${p} (zuerst astro build)`); return readFileSync(p, 'utf8'); };

const RE_CSS = /<link\b[^>]*\brel="stylesheet"[^>]*>/g;
const RE_JS = /<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g;
const hrefVon = (tag) => /\bhref="([^"]+)"/.exec(tag)?.[1];

// ---- 1. Seiten einlesen
const seiten = {};
for (const name of Object.keys(QUELLEN)) seiten[name] = lesen(join(DIST, 'jobs-vorlagen', name, 'index.html'));

// ---- 2. CSS und JS unter festen Namen bündeln
const cssListe = [];
const jsListe = [];
for (const html of Object.values(seiten)) {
  for (const tag of html.match(RE_CSS) ?? []) { const h = hrefVon(tag); if (h && !cssListe.includes(h)) cssListe.push(h); }
  for (const m of html.matchAll(RE_JS)) if (!jsListe.includes(m[1])) jsListe.push(m[1]);
}
if (!cssListe.length) fehler('kein Stylesheet in den Seiten gefunden');
const distDatei = (adresse) => join(DIST, adresse.replace(/^\//, '').split('?')[0]);

// Dateien mit Hash im Namen (/_astro/name.HASH.ext: Schriften, Logo, Wasserzeichen) unter festem Namen nach dist/stabil/ kopieren,
// damit bereits hochgeladene Stellenseiten nach einem neuen Build nicht auf nicht mehr vorhandene Dateien zeigen.
const stabilGemerkt = new Map();
function stabil(name) {
  const m = /^(.+)\.[A-Za-z0-9_-]{8}\.(\w+)$/.exec(name);
  if (!m) return `/_astro/${name}`;
  const ziel = `${m[1]}.${m[2]}`;
  const quelle = distDatei(`/_astro/${name}`);
  if (!existsSync(quelle)) fehler(`Datei fehlt: ${quelle}`);
  const inhalt = readFileSync(quelle);
  const vorher = stabilGemerkt.get(ziel);
  if (vorher && !vorher.equals(inhalt)) fehler(`zwei verschiedene Dateien würden zu dist/stabil/${ziel}`);
  if (!vorher) {
    stabilGemerkt.set(ziel, inhalt);
    mkdirSync(join(DIST, 'stabil'), { recursive: true });
    writeFileSync(join(DIST, 'stabil', ziel), inhalt);
  }
  return `/stabil/${ziel}`;
}
const stabilCss = (css) => css.replace(/url\((['"]?)\/_astro\/([^)'"]+)\1\)/g, (_, q, n) => `url(${q}${stabil(n)}${q})`);
const stabilHtml = (html) => html.replace(/\b(src|href)="\/_astro\/([^"]+\.(?:webp|png|jpe?g|svg|avif|gif|woff2?))"/g, (_, a, n) => `${a}="${stabil(n)}"`);

const kopf = '/* Erzeugt von scripts/make-vorlagen.mjs aus dem Build, nicht von Hand ändern. */\n';
mkdirSync(join(DIST, 'css'), { recursive: true });
writeFileSync(join(DIST, 'css/jobs.css'), kopf + cssListe.map((h) => stabilCss(lesen(distDatei(h)))).join('\n'), 'utf8');
mkdirSync(join(DIST, 'js'), { recursive: true });
writeFileSync(
  join(DIST, 'js/jobs-site.js'),
  kopf + jsListe.map((h) => `;(function () {\n'use strict';\n${lesen(distDatei(h))}\n})();`).join('\n'),
  'utf8',
);

// ---- 3. Seiten umschreiben: feste Namen, absolute Adressen
function umschreiben(html) {
  html = stabilHtml(html);
  let erstes = true;
  html = html.replace(RE_CSS, () => { if (!erstes) return ''; erstes = false; return '<link rel="stylesheet" href="/css/jobs.css">'; });
  let skript = true;
  html = html.replace(RE_JS, () => { if (!skript) return ''; skript = false; return '<script src="/js/jobs-site.js" defer></script>'; });
  // Alle Adressen mit führendem "/" absolut machen
  return html.replace(/\b(href|src)="\/(?!\/)/g, `$1="${SITE}/`);
}

// ---- 4. Prüfen (beide Modi) und Vorlagen schreiben (nur Vorlagen-Modus)
const neu = {};
for (const [name, q] of Object.entries(QUELLEN)) {
  const html = umschreiben(seiten[name]);
  for (const [p, soll] of Object.entries(q.platzhalter)) {
    const anzahl = html.split(p).length - 1;
    if (anzahl !== soll) fehler(`${q.datei}: ${p} kommt ${anzahl}x vor, erwartet ${soll}x`);
  }
  const fremd = [...html.matchAll(/\{\{[^}]*\}\}/g)].map((m) => m[0]).filter((p) => !(p in q.platzhalter));
  if (fremd.length) fehler(`${q.datei}: unerwartete Platzhalter ${fremd.join(', ')}`);
  if (/<script\b(?![^>]*\bsrc=)[^>]*>/.test(html.replace(/\{\{JOB_HEAD\}\}/, ''))) fehler(`${q.datei}: Inline-Skript gefunden (CSP)`);
  if (/\sstyle="/.test(html)) fehler(`${q.datei}: style-Attribut gefunden (CSP)`);
  if (/(href|src)="\/(?!\/)/.test(html)) fehler(`${q.datei}: Adresse ohne Domain übrig`);
  neu[q.datei] = html;
}

const README = `# Vorlagen für die Stellenbörse (vom Build erzeugt)

Diese Dateien erzeugt \`npm run vorlagen\` (Skript \`scripts/make-vorlagen.mjs --vorlagen\`, Quelle \`src/pages/jobs-vorlagen/\`). Nicht von Hand ändern.
Das CRM liest sie über JOBS_TEMPLATE_DIR und ersetzt nur die Platzhalter (Rohtext, nicht escaped):

- \`_vorlage_detail.de.html\`, \`_vorlage_detail.en.html\`: {{JOB_HEAD}} (im head), {{JOB_BODY}}
- \`_vorlage_liste.de.html\`, \`_vorlage_liste.en.html\`: {{JOB_HEAD}} (im head), {{JOB_LIST}}, {{JOB_COUNT}}

Alle Adressen sind absolut (${SITE}/…). CSS: ${SITE}/css/jobs.css, Skripte: ${SITE}/js/jobs-site.js und ${SITE}/js/jobs.js
(Bewerben-Link und Filter; die Bewerbungsadresse steht in public/js/jobs.js und muss JOBS_APPLY_EMAIL im CRM entsprechen).
Die Vorlagen setzen das robots-Meta-Tag selbst; das CRM liefert in {{JOB_HEAD}} kein robots.

CSS-Klassen des CRM-Markups: job, job-company, job-facts, job-text, job-section, job-salary, job-apply, job-apply-link, button, job-apply-noscript,
job-legal, job-card, job-card-company, job-meta, job-tags, job-card-snippet, job-date, job-more, job-none (Stile in src/styles/jobs.css).
`;

if (VORLAGEN_MODUS) {
  const gleich = existsSync(VORLAGEN) && Object.keys(neu).every((d) => existsSync(join(VORLAGEN, d)) && readFileSync(join(VORLAGEN, d), 'utf8') === neu[d]);
  if (!gleich && existsSync(VORLAGEN) && readdirSync(VORLAGEN).length) {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    let ziel = `${VORLAGEN.replace('_vorlagen', '_vorlagen.bak-')}${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if (existsSync(ziel)) ziel += `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
    cpSync(VORLAGEN, ziel, { recursive: true });
    console.log(`Vorhandene Vorlagen gesichert: ${ziel}`);
  }
  mkdirSync(VORLAGEN, { recursive: true });
  for (const [datei, html] of Object.entries(neu)) writeFileSync(join(VORLAGEN, datei), html, 'utf8');
  writeFileSync(join(VORLAGEN, 'README.md'), README, 'utf8');
}

// ---- 5. dist aufräumen: Vorlagen werden nicht hochgeladen, unter /jobs/ liefert die Website nichts
rmSync(join(DIST, 'jobs-vorlagen'), { recursive: true, force: true });
if (existsSync(join(DIST, 'jobs'))) fehler('dist/jobs existiert. Unter /jobs/ liefert die Website nichts (das gehört dem CRM). Quelle suchen: src/pages/jobs/ darf nicht existieren.');

// ---- 6. Demo-Schalter: robots.txt und .htaccess aus public/ nach dist/ (Zeilen mit "#@demo " bzw. "#@echt " je nach STELLEN_DEMO in src/config.ts)
const demo = /export\s+const\s+STELLEN_DEMO\s*=\s*(true|false)\s*;/.exec(lesen('src/config.ts'))?.[1];
if (!demo) fehler('STELLEN_DEMO in src/config.ts nicht gefunden (true oder false)');
const istDemo = demo === 'true';
for (const datei of ['robots.txt', '.htaccess']) {
  const text = lesen(join('public', datei)).split('\n').flatMap((zeile) => {
    const m = /^#@(demo|echt) ?(.*)$/.exec(zeile.replace(/\r$/, ''));
    if (!m) return [zeile];
    return (m[1] === 'demo') === istDemo ? [m[2]] : [];
  }).join('\n');
  writeFileSync(join(DIST, datei), text, 'utf8');
}
console.log(`Stellenbörse: ${istDemo ? 'DEMO (noindex, keine Sitemap-Zeile)' : 'ECHT (indexierbar, Sitemap-Zeile)'}`);
console.log(VORLAGEN_MODUS ? `Vorlagen erzeugt in ${VORLAGEN}: ${Object.keys(neu).join(', ')}` : 'Website-Modus: jobs/ nicht angefasst (Vorlagen mit npm run vorlagen).');
console.log('dist: css/jobs.css, js/jobs-site.js, stabil/ (kein jobs/)');
