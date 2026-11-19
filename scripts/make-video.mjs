// Bereitet das Demo-Video auf (wiederholbar). Aufruf:
//   npm run video -- [<Quelldatei>] [--teaser-start s] [--teaser-dauer s] [--poster s]
//
//   Quelle (Standard): _entwurf/demo-video.mp4  (H.264 + AAC, beliebiges Seitenverhältnis)
//   Ausgabe in public/media/:
//     hero-vorschau.mp4 / .webm  stumme Vorschau, Breite 540 px, <= 3 MB (Schleife im Hero)
//     hero-voll.mp4              Vollfassung mit Ton, Breite 720 px, AAC, <= 15 MB (nur bei Klick geladen)
//     hero-poster.webp           Standbild (Standard: Sekunde 20 der Quelle)
//
// Vorschau und Vollfassung: H.264 (main, yuv420p, +faststart, -preset veryfast). Der CRF steigt schrittweise,
// bis die Datei klein genug ist. ffmpeg wird gesucht: Umgebungsvariable FFMPEG, PATH, winget-Paketordner.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// ---- Parameter ---------------------------------------------------------------
const args = process.argv.slice(2);
const wert = (name, std) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return std;
  const w = args[i + 1];
  if (w === undefined || w.startsWith('--')) throw new Error(`--${name} braucht einen Wert`);
  args.splice(i, 2);
  return w;
};
const teaserStart = Number(wert('teaser-start', '5'));
const teaserDauer = Number(wert('teaser-dauer', '20'));
const posterSek = Number(wert('poster', '20'));
for (const [n, v] of [['teaser-start', teaserStart], ['teaser-dauer', teaserDauer], ['poster', posterSek]]) {
  if (!Number.isFinite(v) || v < 0) throw new Error(`--${n} muss eine Zahl >= 0 sein`);
}
const quelle = args[0] ?? '_entwurf/demo-video.mp4';
const aus = 'public/media';
const VORSCHAU_MAX = 3_000_000;
const VOLL_MAX = 15_000_000;

// ---- ffmpeg finden -------------------------------------------------------------
function sucheFfmpeg() {
  if (process.env.FFMPEG && existsSync(process.env.FFMPEG)) return process.env.FFMPEG;
  const test = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  if (test.status === 0) return 'ffmpeg';
  const wg = join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
  if (existsSync(wg)) {
    const rec = (d, tiefe = 0) => {
      if (tiefe > 5) return null;
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isFile() && e.name.toLowerCase() === 'ffmpeg.exe') return p;
        if (e.isDirectory()) { const r = rec(p, tiefe + 1); if (r) return r; }
      }
      return null;
    };
    const f = rec(wg);
    if (f) return f;
  }
  throw new Error('ffmpeg nicht gefunden (Umgebungsvariable FFMPEG setzen oder installieren: winget install Gyan.FFmpeg)');
}

const ffmpeg = sucheFfmpeg();
if (!existsSync(quelle)) throw new Error(`Quelle fehlt: ${quelle}`);
mkdirSync(aus, { recursive: true });

const lauf = (a) => {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...a], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg fehlgeschlagen: ${r.stderr}`);
};
const mb = (n) => `${(n / 1_000_000).toFixed(2)} MB`;

// Erhöht den CRF, bis die Datei <= max Bytes ist.
function kodiere(ziel, max, crfs, bauen) {
  let s = Infinity;
  for (const crf of crfs) {
    lauf(bauen(crf));
    s = statSync(ziel).size;
    console.log(`  ${ziel.split(/[\\/]/).pop()}  crf ${crf}: ${mb(s)}`);
    if (s <= max) return s;
  }
  console.warn(`  Warnung: ${ziel} ist größer als ${mb(max)} (Quelle kürzen oder verkleinern).`);
  return s;
}
const h264 = ['-c:v', 'libx264', '-preset', 'veryfast', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
const crfListe = (von, bis, schritt = 2) => { const l = []; for (let c = von; c <= bis; c += schritt) l.push(c); return l; };

console.log(`Quelle: ${quelle} (${mb(statSync(quelle).size)})`);
console.log(`Vorschau: ab ${teaserStart} s, ${teaserDauer} s lang`);

// a) Vorschau ohne Ton: Breite 540 px (gerade Höhe), MP4 + WebM
const schnitt = ['-ss', String(teaserStart), '-t', String(teaserDauer), '-i', quelle];
const skala540 = ['-vf', 'scale=540:-2'];
let ziel = join(aus, 'hero-vorschau.mp4');
kodiere(ziel, VORSCHAU_MAX, crfListe(20, 40), (crf) => [...schnitt, ...skala540, '-an', ...h264, '-crf', String(crf), ziel]);

ziel = join(aus, 'hero-vorschau.webm');
kodiere(ziel, VORSCHAU_MAX, crfListe(28, 48, 3), (crf) => [
  ...schnitt, ...skala540, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf),
  '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3', '-pix_fmt', 'yuv420p', ziel,
]);

// b) Vollfassung mit Ton: Breite 720 px, AAC 112 kbit/s (Stereo bleibt Stereo)
ziel = join(aus, 'hero-voll.mp4');
kodiere(ziel, VOLL_MAX, crfListe(20, 40), (crf) => [
  '-i', quelle, '-vf', 'scale=720:-2', ...h264, '-crf', String(crf),
  '-c:a', 'aac', '-b:a', '112k', ziel,
]);

// c) Poster (WebP) in der Breite der Vorschau
ziel = join(aus, 'hero-poster.webp');
lauf(['-ss', String(posterSek), '-i', quelle, '-frames:v', '1', '-vf', 'scale=540:-2', '-c:v', 'libwebp', '-quality', '78', ziel]);
console.log(`  hero-poster.webp: ${mb(statSync(ziel).size)}`);

console.log('Fertig:');
for (const d of readdirSync(aus)) console.log(`  ${d}  ${mb(statSync(join(aus, d)).size)}`);
