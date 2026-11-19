# Stand – Talmiro-Website

> Sitzungsprotokoll des Planungs-Chats. Neue Einträge oben, alte nie überschreiben.

## 2026-11-19 (Do) – Sitzung 2

### Erledigt
- `d04033d` (gepusht): Hero-Text oben bündig mit Mockup; Scroll-Reveal und Rauch-Effekt (WebGL2) von littlewebman.de übernommen, Rauch in Talmiro-Farben über dem Inhalt (multiply), INTENSITY 0.10; Hero, FAQ, Kontrolle dunkler (#E9EFF4), Kicker #0B6B6B für Kontrast; Header sticky, halbtransparent mit Blur; Scroll-Spy-Unterstreichung in der Navi; Footer-Link littlewebman mit `_blank`.
- `949fba6` (noch nicht gepusht): mobiles Menü (Hamburger ≤ 640 px, sticky, barrierefrei); Inline-Script nach `public/js/reveal-init.js` ausgelagert, CSP-Hash entfernt (`script-src 'self'`); Rauch auch auf Touch mit reduzierter Auflösung (64/256/10), Pause bei unsichtbarem Tab; README-Kodierung repariert.
- Prüfungen: Build, `php -l`, Lighthouse mobil 99–100 / Desktop 100, CLS 0, axe ohne Verstöße, CSP ohne Konsolenfehler.

### Entscheidungen
- Keine Inline-Skripte und keine Inline-Styles (CSP ohne Hash).
- Rauch dezent, auf Desktop und Touch; aus bei reduzierter Bewegung und ohne WebGL2.
- Kaputte README-Fassung in der Historie von `d04033d` bleibt, keine Historien-Umschreibung.

### Offen
- Test auf echtem Handy (Menü, Wischen/Scrollen mit Rauch), danach `949fba6` pushen.
- Weiterhin: Platzhalter laut PLATZHALTER.md, SVG-Logo, DNS/Upload/Formular-Test bei febas, CRM-Import (B-171).

## 2026-11-19 (Do)

### Erledigt
- Produktname **Talmiro** festgelegt, Domain `talmiro.de` registriert; Logo (JPG) vorhanden.
- Design-Entwurf der Landingpage erstellt (Canvas „Talmiro – Landingpage Entwurf“), Vorlage in `_entwurf/`.
- Astro-Projekt gebaut (`244cd84`): Startseite, Impressum, Datenschutz (Gerüst), Danke, Fehler, 404; lokale Schriften; `kontakt.php` mit Honeypot, Ratenlimit, Prüfungen; `.htaccess` mit Security-Headern; README, PLATZHALTER.md, CLAUDE.md. Repo `Busaschie/Talmiro_Homepage`.

### Entscheidungen
- Statische Seite mit Astro, Hosting bei febas; nur das Formular läuft über PHP, kein fremder Formulardienst, kein Tracking, keine Cookies.
- Ziel der Seite: Pilotkunden gewinnen („Pilotplatz anfragen“), noch kein Verkauf.
- Anrede durchgehend „Sie“; nur vorhandene Funktionen nennen, Geplantes als „in Vorbereitung“; offene Angaben als Platzhalter.
- Befehle im Planungs-Chat: „homepage“ = Stand lesen, „stop“ = Stand schreiben.

### Offen
- Platzhalter laut PLATZHALTER.md (Impressum/Datenschutz rechtlich prüfen, Preis, Tarif-Empfehlung Claude, Hosting/Auftragsverarbeitung, Formular-Empfänger, Zielpfad febas).
- Logo als SVG mit transparentem Hintergrund.
- DNS `talmiro.de` auf febas, Upload, Testversand des Formulars.
- Import aus Fremdsystem im CRM (B-171), damit die FAQ-Antwort zur Datenübernahme stimmt.
