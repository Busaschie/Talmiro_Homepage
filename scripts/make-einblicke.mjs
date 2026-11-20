// Bereitet die Screenshots für „Einblicke“ auf (wiederholbar):  npm run einblicke
//
//   Quellen: _entwurf/ui-laptop-hell|dunkel.webp, ui-handy-hell|dunkel.webp, admin-laptop-hell|dunkel.webp
//   Ausgabe: src/assets/einblicke/hell-laptop, dunkel-laptop, hell-handy, dunkel-handy, admin-hell, admin-dunkel (.webp)
//
// Laptop-Bilder werden unverändert übernommen. Bei den Handy-Bildern werden die Systemstatusleiste oben (Uhrzeit, Akku)
// und die Gestenleiste unten abgeschnitten. Die Grenze wird am Bild gesucht: Die Systemleisten sind einfarbig dunkel,
// der App-Inhalt beginnt dort, wo die Zeile (Spalten links der Mitte, ohne Uhrzeit, Symbole und Gestenleiste) deutlich von der Leistenfarbe abweicht.
// Gelingt die Suche nicht, gelten die Erfahrungswerte OBEN_STANDARD und UNTEN_STANDARD.
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';

const QUELLE = '_entwurf';
const AUS = 'src/assets/einblicke';
const OBEN_STANDARD = 132;
const UNTEN_STANDARD = 63;
const SUCHE_OBEN = 220; // Suchbereich in Pixeln vom Rand
const SUCHE_UNTEN = 140;
const SCHWELLE = 8; // Farbabstand (Summe über RGB), ab dem eine Zeile als Inhalt gilt

// Admin-Bilder sind bereits bereinigt und werden nicht beschnitten.
const bilder = [
  { quelle: 'ui-laptop-hell.webp', ziel: 'hell-laptop.webp', handy: false },
  { quelle: 'ui-handy-hell.webp', ziel: 'hell-handy.webp', handy: true },
  { quelle: 'ui-laptop-dunkel.webp', ziel: 'dunkel-laptop.webp', handy: false },
  { quelle: 'ui-handy-dunkel.webp', ziel: 'dunkel-handy.webp', handy: true },
  { quelle: 'admin-laptop-hell.webp', ziel: 'admin-hell.webp', handy: false },
  { quelle: 'admin-laptop-dunkel.webp', ziel: 'admin-dunkel.webp', handy: false },
];

// mittlere Farbe einer Zeile im Bereich x = 22 % .. 32 % (frei von Uhrzeit, Statussymbolen und Gestenleiste)
function zeilen(roh, breite, kanaele) {
  const x0 = Math.floor(breite * 0.22), x1 = Math.floor(breite * 0.32);
  const hoehe = roh.length / (breite * kanaele);
  const out = [];
  for (let y = 0; y < hoehe; y++) {
    const s = [0, 0, 0];
    for (let x = x0; x < x1; x++) for (let k = 0; k < 3; k++) s[k] += roh[(y * breite + x) * kanaele + k];
    out.push(s.map((v) => v / (x1 - x0)));
  }
  return out;
}
const abstand = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

mkdirSync(AUS, { recursive: true });

// 1. Grenzen suchen. Beide Handy-Bilder bekommen denselben Zuschnitt (größerer Wert), damit sie das gleiche Seitenverhältnis haben.
const grenzen = [];
for (const b of bilder.filter((x) => x.handy)) {
  const pfad = `${QUELLE}/${b.quelle}`;
  if (!existsSync(pfad)) throw new Error(`Quelle fehlt: ${pfad}`);
  const { data, info } = await sharp(pfad).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const z = zeilen(data, info.width, info.channels);

  let oben = z.findIndex((c, y) => y > 20 && abstand(c, z[2]) > SCHWELLE);
  if (oben < 0 || oben > SUCHE_OBEN) { console.warn(`  ${b.ziel}: obere Grenze nicht gefunden, nehme ${OBEN_STANDARD}`); oben = OBEN_STANDARD; }
  const letzte = z.length - 1;
  let unten = -1; // Anzahl abzuschneidender Zeilen am unteren Rand
  for (let y = letzte - 20; y > letzte - SUCHE_UNTEN; y--) {
    if (abstand(z[y], z[letzte - 2]) > SCHWELLE) { unten = letzte - y; break; }
  }
  if (unten < 0) { console.warn(`  ${b.ziel}: untere Grenze nicht gefunden, nehme ${UNTEN_STANDARD}`); unten = UNTEN_STANDARD; }
  console.log(`  ${b.ziel}: gefunden oben ${oben} px, unten ${unten} px`);
  grenzen.push({ oben, unten });
}
const OBEN = Math.max(...grenzen.map((g) => g.oben));
const UNTEN = Math.max(...grenzen.map((g) => g.unten));

// 2. Ausgabe
for (const b of bilder) {
  const pfad = `${QUELLE}/${b.quelle}`;
  const m = await sharp(pfad).metadata();
  if (!b.handy) {
    await sharp(pfad).webp({ lossless: true }).toFile(`${AUS}/${b.ziel}`);
    console.log(`${b.ziel}: ${m.width}x${m.height} (unverändert)`);
    continue;
  }
  const hoehe = m.height - OBEN - UNTEN;
  await sharp(pfad).extract({ left: 0, top: OBEN, width: m.width, height: hoehe }).webp({ lossless: true }).toFile(`${AUS}/${b.ziel}`);
  console.log(`${b.ziel}: ${m.width}x${m.height} -> ${m.width}x${hoehe} (oben ${OBEN} px, unten ${UNTEN} px abgeschnitten)`);
}
