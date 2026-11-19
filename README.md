# Talmiro – Website (talmiro.de)

Produktseite von Talmiro. Astro, rein statisch (`output: static`), eigenes CSS, Schriften lokal (kein Google-Fonts-CDN),
kein Tracking, keine Cookies. Das Kontaktformular läuft über `public/kontakt.php` (PHP `mail()`).

## Befehle

```powershell
npm install        # einmalig
npm run dev        # lokale Entwicklung (http://localhost:4321); kontakt.php läuft hier NICHT (siehe Test unten)
npm run build      # statischer Build nach dist/
npm run preview    # dist/ lokal ansehen
npm run assets     # Bildmarke und Favicons neu aus _entwurf/talmiro-logo.jpg erzeugen (nur bei neuem Logo)
npm run video      # Demo-Video neu aufbereiten (braucht ffmpeg), siehe „Hero-Video“
npm run einblicke  # Screenshots für „Einblicke“ aus _entwurf aufbereiten (Handy-Bilder zuschneiden)
```

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/pages/` | `index` (Startseite), `impressum`, `datenschutz`, `danke`, `fehler`, `404` |
| `src/components/` | Header, Hero, Problem, Ablauf, Funktionen, Kontrolle, Pilot, Faq, Footer |
| `src/layouts/Base.astro` | `<head>`: Title, Description, Canonical, Open Graph, Twitter, JSON-LD, Schriften |
| `src/styles/global.css` | alle Styles, Farben als CSS-Variablen |
| `public/` | wird 1:1 nach `dist/` kopiert: `kontakt.php`, `.htaccess`, Favicons, `og-image.png`, `robots.txt`, `form-zeit.js` |
| `scripts/` | `make-assets.mjs` (Logo/Favicons), `og.html` (Quelle des OG-Bilds), `test-kontakt.ps1` (PHP-Test), `upload.example.ps1` (Vorlage) |
| `_entwurf/` | Design-Entwurf und Original-Logo (nicht ausliefern) |
| `PLATZHALTER.md` | offene Platzhalter und To-dos vor dem Livegang |

## Deployment zu febas

1. `npm run build`
2. **Inhalt** von `dist/` (nicht den Ordner selbst) per SFTP/FTP in den Webroot der Domain hochladen: `[PFAD]`.
   Dabei muss auch die **versteckte** Datei `.htaccess` mitgehen (im FTP-Programm „versteckte Dateien anzeigen“ einschalten).
   Eine Vorlage für den Upload steht in `scripts/upload.example.ps1` (ohne Zugangsdaten).
3. PHP-Version im febas-Kundenbereich prüfen: mindestens **PHP 8.1** (getestet mit 8.3), Funktion `mail()` muss erlaubt sein.
4. Konfiguration anlegen: `public/kontakt.config.example.php` nach **`kontakt.config.php`** kopieren, ausfüllen
   (`to`, `from`, `ratelimit_salt`) und **eine Ebene über dem Webroot** ablegen. Liegt sie ausnahmsweise neben `kontakt.php`,
   sperrt die `.htaccess` den Abruf. `from` muss eine Adresse der eigenen Domain sein (SPF).
5. Testversand: Formular auf der Live-Seite ausfüllen und absenden, es muss auf `/danke/` weiterleiten und die Mail ankommen
   (auch Spam-Ordner prüfen; bei Problemen SPF/DKIM der Domain prüfen). Danach `https://www.talmiro.de/kontakt.config.php`
   aufrufen: muss „403 Forbidden“ oder 404 liefern.
6. `.htaccess`-Voraussetzungen: `mod_rewrite`, `mod_headers`, `mod_expires` (die Blöcke sind mit `IfModule` abgesichert, die Weiterleitungen
   und der Schutz der Konfigurationsdatei brauchen `mod_rewrite` bzw. `mod_authz_core`). Nach dem Upload prüfen:
   `http://talmiro.de` → `https://www.talmiro.de`.

## Formular lokal testen (ohne Mailserver)

```powershell
powershell -File scripts\test-kontakt.ps1                # PHP muss im Pfad sein, sonst -Php "C:\...\php.exe"
```

Das Skript startet `php -S`, legt vorübergehend `kontakt.config.php` an (mit `dry_run_file`: Mails landen in einer
Temp-Datei statt im Versand), prüft Erfolg, Pflichtfelder, Header-Injection, Honigtopf, Mindestzeit, Ratenlimit und
räumt auf. Es bricht ab, wenn schon eine `kontakt.config.php` im Projektordner liegt.

`dry_run_file` darf im Livebetrieb **nicht** gesetzt sein.

## Wie das Formular schützt

- Pflichtfelder, E-Mail-Format, Längen (Name 100, Firma 150, Nachricht 3000), keine Steuerzeichen/Zeilenumbrüche in Name, E-Mail, Firma.
- Honigtopf-Feld `website`; ausgefüllt = still verworfen (Weiterleitung auf `/danke/`, keine Mail).
- Mindestzeit 3 Sekunden: `form-zeit.js` schreibt den Aufrufzeitpunkt ins Formular. Ohne JavaScript fehlt das Feld, die Prüfung entfällt, das Formular geht trotzdem.
- Ratenlimit 5 Anfragen je Stunde und IP: Datei `<HMAC der IP>.rl` im temp-Ordner des Servers (oder `ratelimit_dir`), nur Hash, nach 24 h gelöscht.
- Keine Speicherung der Anfragen. Fehler leiten auf `/fehler/?grund=<code>` weiter (Meldung per CSS `:target`, funktioniert ohne JavaScript); Eingaben werden nicht zurückgegeben (Zurück-Taste des Browsers genügt meist).

## Sicherheit und Datenschutz

- `.htaccess`: HTTPS- und www-Weiterleitung, Sperre für `kontakt.config*.php`, `.rl`-Dateien und Dotfiles, Header
  (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy` nur mit eigenen Quellen, HSTS, `X-Frame-Options`).
- Wer externe Skripte, Schriften oder Bilder einbaut, muss die CSP in `.htaccess` anpassen.
- Impressum und Datenschutz sind **Gliederungen mit Platzhaltern**, keine fertigen Rechtstexte (siehe `PLATZHALTER.md`).

## Skripte und CSP

- **Regel: keine Inline-Skripte und keine Inline-Styles** (`style="..."`, `<style>`, `<script>` ohne `src`). Die CSP in `public/.htaccess` erlaubt nur `'self'` für `script-src` und `style-src`; ein Hash ist nicht nötig.
- Astro bündelt Skripte aus Komponenten zu Dateien (`vite.build.assetsInlineLimit: 0` verhindert das Einbetten kleiner Skripte). Ungebündelte Skripte liegen in `public/`: `js/reveal-init.js` (setzt die Klassen `js` und `js-reveal` im `<head>` ohne defer/async, mit 3-s-Notfall-Fallback) und `form-zeit.js`.
- Ausnahme ohne Wirkung: Die JSON-LD-Blöcke (`<script type="application/ld+json">`) sind Daten, kein ausführbarer Code.
- Prüfen nach jedem Build: `dist/**/*.html` darf kein `<script>` ohne `src` (außer JSON-LD) und kein `style=` enthalten.
- Mobiles Menü (bis 1000 px, darüber passt die Navigation in eine Zeile), Scroll-Spy und Kopfzeile: `src/components/Header.astro`. Ohne JavaScript bleibt die Navigation sichtbar.
- Scroll-Einblendung (`[data-reveal]`) und Rauch (`FluidBackground.astro`) kommen von Littlewebman bzw. sind daran angelehnt (Rauch: Pavel Dobryakov, MIT). Der Rauch ist aus bei reduzierter Bewegung und ohne WebGL2, läuft auf Touch-Geräten und schmalen Fenstern mit geringerer Auflösung und pausiert bei unsichtbarem Tab und nach 6 s Ruhe.

## Hell-/Dunkel-Modus

- Alle Farben sind semantische CSS-Variablen in `src/styles/global.css` (`--seite`, `--flaeche`, `--karte`, `--text` …). Hell (warm) steht in `:root`, Dunkel überschreibt sie in `:root[data-theme='dark']`.
  Ohne JavaScript gilt derselbe Dunkel-Block per `@media (prefers-color-scheme: dark)` (`:root:not([data-theme])`). **Beide Dunkel-Blöcke müssen identisch bleiben.**
- `public/js/reveal-init.js` setzt `data-theme` vor dem ersten Rendern (gespeicherte Wahl in `localStorage` `talmiro-theme`, sonst Systemeinstellung; ohne Wahl folgt die Seite Änderungen der Systemeinstellung). Der Umschalter steht in `Header.astro` (Desktop: vor „Pilotplatz anfragen“, mobil neben dem Menü-Button). Kein Cookie, nur `localStorage`, nichts wird übertragen.
- Rauch: hell `multiply`, dunkel `screen` (Variable `--rauch-blend`), Paletten und Intensität je Modus in `FluidBackground.astro`.
- Neue Farben immer als Variable anlegen und in beiden Modi definieren; Kontrast prüfen (Text 4,5:1, Bedienelemente/Fokus 3:1).

## Hero-Video (Handy-Rahmen)

- Quelle: `_entwurf/demo-video.mp4` (bleibt lokal, nicht im Repository). Erzeugt werden in `public/media/`:
  - `hero-vorschau.mp4` und `.webm`: stumme Vorschau, Breite 540 px, höchstens 3 MB (Schleife im Handy-Rahmen),
  - `hero-voll.mp4`: Vollfassung mit Ton (AAC 112 kbit/s), Breite 720 px (höchstens Originalbreite), höchstens 15 MB,
  - `hero-poster.webp`: Standbild.
- Neu erzeugen (braucht ffmpeg, z. B. `winget install Gyan.FFmpeg`): `npm run video -- <datei> [--teaser-start s] [--teaser-dauer s] [--poster s]`.
  Ohne Angaben: Quelle `_entwurf/demo-video.mp4`, Vorschau ab Sekunde 5 für 20 Sekunden, Poster bei Sekunde 20. Alle Fassungen: H.264 (+faststart, `-preset veryfast`); der CRF steigt, bis die Größengrenze eingehalten ist.
- Verhalten (`src/components/Hero.astro`): Die Vorschau spielt stumm in Schleife, nur wenn sie zu mehr als der Hälfte sichtbar ist und der Tab sichtbar ist; nicht bei `prefers-reduced-motion` (dann Poster). Der runde Knopf pausiert/setzt fort. Der Knopf „Mit Ton ansehen“ lädt erst jetzt die Vollfassung, startet sie mit Ton von vorn und zeigt die Steuerelemente des Browsers (Lautstärke, Zeitleiste, Vollbild). Beim Ende geht es zurück zur Vorschau. Die Vollfassung pausiert beim Herausscrollen nicht. Der Handy-Schirm hat das Seitenverhältnis des Videos (626 / 1050, in `global.css` bei `.telefon-schirm.mit-video` und im `width`/`height` von `Hero.astro` anpassen, wenn ein Video mit anderem Format kommt); das Video füllt ihn exakt.
- Ohne JavaScript zeigt die Seite die Vollfassung mit Steuerelementen und Poster; sie wird auch dann erst auf Klick geladen (`preload="none"`).
- Untertitel: Platzhalterdatei `public/media/demo-video.de.vtt`. Der `<track>` wird erst ausgeliefert, wenn in `Hero.astro` `UNTERTITEL = true` steht (nach Eintragen der Texte).
- Auf dem Server: `.htaccess` setzt `media-src 'self'`, MIME-Typen und 1 Tag Cache für `/media/` (feste Dateinamen, damit ein getauschtes Video bald erscheint). Das große Video wird per HTTP-Range gestreamt: Apache beantwortet Range-Anfragen von selbst, dafür ist nichts einzustellen.

## Wasserzeichen im Hero

- `src/assets/logo-2_gross.webp` liegt als dekoratives Hintergrundbild (CSS `.hero::before`, kein Inhalt für Screenreader) links hinter dem Text. Deckkraft über `--wz-deckkraft` (hell 0,05, dunkel 0,08); `.hero` hat `overflow: hidden`, deshalb entsteht kein seitliches Scrollen. Unter 640 px Breite ist es kleiner und höher platziert.

## Einblicke (Screenshots)

- Komponente `src/components/Einblicke.astro`, Raster 2×2: oben „Hell“, unten „Dunkel“, links Laptop, rechts Handy (am Handy untereinander).
- Bilder: `hell-laptop`, `hell-handy`, `dunkel-laptop`, `dunkel-handy` (webp/png/jpg) in `src/assets/einblicke/`. Fehlt ein Bild, bleibt der Platzhalter „Bild folgt“. Astro erzeugt AVIF/WebP in mehreren Größen (`loading="lazy"`); ein Klick öffnet das Bild groß in einem `<dialog>`.
- Neu erzeugen aus `_entwurf/ui-hell_compressed.webp`, `ui-hell-handy_compressed.webp`, `ui-dark_compressed.webp`, `ui-dark-handy_compressed.webp`: `npm run einblicke` (Skript `scripts/make-einblicke.mjs`). Bei den Handy-Bildern werden Systemstatusleiste oben (ca. 132 px) und Gestenleiste unten (ca. 65 px) abgeschnitten; die Grenzen werden am Bild gesucht und beide Bilder bekommen denselben Zuschnitt.
- Alle Laptop-Rahmen haben dasselbe Format (1918 / 961); das Bild sitzt oben (`object-position: top`) und wird nicht verzerrt, ein übrig bleibender Streifen hat die Hintergrundfarbe des Screenshots. Der Handy-Rahmen hat das Format des zugeschnittenen Bildes (1080 / 2203).
- Alt-Texte und Bildunterschriften stehen im Kopf der Komponente. **Nur Testdaten auf den Screenshots.**
