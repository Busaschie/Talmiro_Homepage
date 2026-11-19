// Erzeugt Bildmarke (WebP), Favicons aus _entwurf/talmiro-logo.jpg.
// Aufruf: npm run assets   (nur nötig, wenn sich das Logo ändert)
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const SRC = '_entwurf/talmiro-logo.jpg';

// Ausschnitt wie im Entwurf: nur die Bildmarke (ohne Schriftzug)
const mark = { left: 411, top: 130, width: 462, height: 402 };
const markSquare = { left: 441, top: 130, width: 402, height: 402 };

const roundMask = (w, h, r) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);

async function rounded(region, w, h, r) {
  return sharp(SRC)
    .extract(region)
    .resize(w, h, { fit: 'cover' })
    .composite([{ input: roundMask(w, h, r), blend: 'dest-in' }]);
}

// Kopf: 2x-Auflösung von 46x40 px, Radius 8 px
await (await rounded(mark, 184, 160, 32)).webp({ quality: 90 }).toFile('src/assets/logo-mark.webp');

// Favicons (quadratischer Ausschnitt, abgerundet)
const png = async (s) => (await rounded(markSquare, s, s, Math.round(s * 0.18))).png().toBuffer();
const p16 = await png(16), p32 = await png(32), p48 = await png(48), p180 = await png(180);
writeFileSync('public/favicon-32.png', p32);
writeFileSync('public/apple-touch-icon.png', p180);

// favicon.svg: Bildmarke als eingebettetes PNG (bis ein echtes Vektor-Logo vorliegt)
const p64 = await png(64);
writeFileSync('public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${p64.toString('base64')}"/></svg>\n`);

// favicon.ico mit PNG-Einträgen 16/32/48
const imgs = [[16, p16], [32, p32], [48, p48]];
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
let offset = 6 + 16 * imgs.length;
const dirs = imgs.map(([s, b]) => {
  const d = Buffer.alloc(16);
  d[0] = s; d[1] = s; d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6);
  d.writeUInt32LE(b.length, 8); d.writeUInt32LE(offset, 12);
  offset += b.length; return d;
});
writeFileSync('public/favicon.ico', Buffer.concat([head, ...dirs, ...imgs.map(([, b]) => b)]));
console.log('Assets erzeugt.');
