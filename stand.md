# Stand – Talmiro-Website

> Sitzungsprotokoll des Planungs-Chats. Neue Einträge oben, alte nie überschreiben.

## 2026-11-20 (Fr) – Sitzung 3

### Erledigt
- `1e0cf0c`: `kontakt.php` sucht die Konfiguration zuerst in `/var/www/<kunde>/priv/talmiro/` (febas), dann wie bisher. Formular live eingerichtet und getestet (PHP 8.4, `mail()` erlaubt, `log_errors` an, Config in `priv/talmiro`, Testskripte vom Server entfernt).
- Upload mit neuer Struktur: Weiterleitung `/jobs/…` → `/stelle-vergeben/` bzw. `/en/position-filled/` live geprüft, alte `vergeben.html` auf dem Server gelöscht.
- `7f556cc`: Funktionsgruppe „In Ihrem Design“ (Weboberfläche/Verwaltung mit Logo, Farben, Schriften; Stellenseiten im Design der Kunden-Website); Pilot „Einrichtung in Ihrem Design …“; FAQ: Claude-Tarife (Pro/Max, mit echten Daten Team mit Auftragsverarbeitung), neue Frage „Sieht Talmiro aus wie mein Unternehmen?“, „Wo liegen meine Daten?“ ausgeblendet; littlewebman.de in Impressum/Datenschutz verlinkt (neuer Tab). Gepusht.
- febas hat Server-Logs 7 Tage bestätigt.

### Entscheidungen
- Konfiguration des Formulars liegt in `priv/talmiro` (nicht im gemeinsamen `htdocs`); `ratelimit_dir` leer (Temp-Ordner).
- FAQ in Wir-Form; Rechtstexte in Ich-Form.

### Offen
- `7f556cc` bauen und hochladen (falls noch nicht geschehen), live ansehen.
- FAQ „Wo liegen meine Daten?“ nach Klärung Hosting/AVV wieder einblenden.
- Untertitel: wartet auf evtl. neues Video; SVG-Logo: wartet auf evtl. geändertes Logo.
- CRM-Seite: Demo-Stelle auf talmiro.de (B-184); Logo „almiro“ im hellen Admin, „CRM“ → „Talmiro“, danach Screenshots/Video neu; `BLOCKED` mit `jobs/vergeben.html`.
- Rechtliche Prüfung von Impressum/Datenschutz (empfohlen).

## 2026-11-20 (Fr) – Sitzung 2

### Erledigt
- `6764b1f`: Einblicke mit neuen Screenshots, neue Gruppe „Verwaltung“ (Admin hell/dunkel); Preise in Pilot und FAQ (129 €/Monat, Einrichtung 390 €; Pilot: Einrichtung frei, 3 Monate kostenlos, danach 79 €/Monat für 12 Monate, monatlich kündbar; Hinweis § 19 UStG).
- `9d0ad4f`: Impressum und Datenschutz in der verbindlichen Fassung (Ich-Form; Postfach bei febas, kein Drittland, localStorage-Hinweis, Ratenlimit korrekt beschrieben, Art. 22); Checkbox „zur Kenntnis genommen“; Kontakt-E-Mail auf der Fehlerseite.
- Stellenbörse `/jobs/` als Demo (`ea426ad`, `3686f4d`, `057301e`, andere Sitzung).
- `c08a2a4`: `npm run build` fasst `/jobs` nicht mehr an (Vorlagen nur mit `npm run vorlagen`); vergeben-Seiten nach `/stelle-vergeben/` und `/en/position-filled/`; Einblicke-Dialog mit unscharfem Vorschaubild und Vorladen; Preload für zwei Schriften. Alles gepusht.
- Langsame Live-Seite untersucht: Code in Ordnung, Ursache war Nikos Leitung/WLAN (mobil schnell).
- Formular-Voraussetzungen geklärt: PHP 8.4 passt (ab 8.1), `mail()` erlaubt, Konfiguration über dem Webroot.

### Entscheidungen
- Kleinunternehmer: keine USt.
- Upload mit WebStorm „Sync with Deployed“; Remote-Ordner `/jobs` ausgeschlossen; „Delete target items…“ bleibt aus, „Confirm deleting“ an.
- `/jobs/` gehört dem CRM; die Website liefert dort nichts mehr.

### Offen
- Nach dem Upload: `/jobs/gibt-es-nicht.html` und `/jobs/en/gibt-es-nicht.html` prüfen (Apache-`<If>`), danach alte `/jobs/vergeben.html` und `/jobs/en/vergeben.html` auf dem Server löschen.
- `kontakt.config.example.php` aus `public/` in den Projektstamm verschieben (Auftrag geschrieben, noch nicht umgesetzt); WebStorm: `dist` nicht mehr ausgeschlossen, Mapping auf `dist`.
- Kundenseiten und Stellenseiten im Design des Kunden: auf der Seite aufnehmen – Niko klärt, welche Seiten und was angepasst wird.
- Formular live: `kontakt.config.php` anlegen, SPF/DKIM prüfen, Testversand.
- Server-Logs 7 Tage bei febas bestätigen; Impressum/Datenschutz rechtlich prüfen lassen (empfohlen).
- CRM: Logo im hellen Admin („almiro“), Oberfläche „CRM“ → „Talmiro“, danach Screenshots/Video neu (Demo-Benutzer statt „Niko“); Sperrliste `BLOCKED` enthält noch `jobs/vergeben.html`.
- Weiterhin: Untertitel `demo-video.de.vtt`, SVG-Logo, CRM-Import (B-171).

## 2026-11-20 (Fr)

### Erledigt
- `7844aa5`: warmer heller Modus, dunkler Modus mit Umschalter, Farben als Variablen.
- `41ecf83`: „So funktioniert es“ hell #0f4747 / dunkel #1a2524; h1/h2 der Startseite mit Logo-Verlauf (nicht in „So funktioniert es“); Datenschutz: Hosting (febas, Server-Logs 7 Tage, AVV) und „Externe Dienste und Schriftarten“ (kein Tracking, Schriften lokal).
- `ea0f301`: Unterlängen bei Verlauf-Überschriften nicht mehr abgeschnitten (Polster + box-decoration-break, Hero line-height 1,1).
- `23f06f5`: fremdes Platzhalter-Video (TikTok) aus der Historie entfernt; Demo-Video mit Ton im Hero (stumme Vorschau in Schleife, „Mit Ton ansehen“ lädt Vollfassung erst bei Klick); Logo-Wasserzeichen im Hero; Abschnitt „Einblicke“.
- `e183368`: neues Demo-Video (626×1050, Handy-Bildschirm auf Videoformat), vier Screenshots in „Einblicke“ (Oberfläche hell/dunkel, Laptop/Handy; Statusleisten der Handy-Bilder abgeschnitten). Laut Niko funktioniert alles.

### Entscheidungen
- Video: Autoplay nur stumm; Ton nur auf Klick, Vollfassung mit `preload="none"`; Untertitel-Track erst ausliefern, wenn Text vorliegt.
- „Einblicke“ zeigt die Weboberfläche in Hell und Dunkel statt Admin/Oberfläche; Screenshots und Video nur mit Testdaten.
- Datenschutzseite in Ich-Form wie geliefert.

### Offen
- Uncommittet: Änderungen von Niko in `src/pages/datenschutz.astro` und `impressum.astro`.
- Push-Stand prüfen (`main` hat kein Upstream eingerichtet); vor dem Push sicherstellen, dass kein fremdes Material im Repo liegt.
- Untertitel (`public/media/demo-video.de.vtt`) mit dem gesprochenen Text füllen.
- Oberfläche zeigt noch „CRM“ statt „Talmiro“ (Änderung in der Software, danach Screenshots/Video neu).
- Performance mobil prüfen (Video + Rauch); Test auf echtem Handy, Firefox/Safari.
- Weiterhin: PLATZHALTER.md (Impressum/Datenschutz rechtlich prüfen, Preis, Tarif-Empfehlung, Formular-Empfänger, Zielpfad febas), SVG-Logo, DNS/Upload/Formular-Test, CRM-Import (B-171).

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
