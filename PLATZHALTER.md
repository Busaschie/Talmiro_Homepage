# Offene Platzhalter und Aufgaben vor dem Livegang

## Rechtlich

Impressum und Datenschutzhinweise sind mit der Fassung von Niko vom 20.11.2026 vollständig (Impressum, USt/Kleinunternehmer, Kontaktformular mit Rechtsgrundlage, Speicherdauer und Empfänger, Aufsichtsbehörde, localStorage-Hinweis, Hinweisboxen entfernt). Offen:

- **Impressum und Datenschutz vor dem Livegang rechtlich prüfen lassen (empfohlen).**
- **Bewerbungen per E-Mail** (Stellenbörse) sind im Datenschutztext nicht erwähnt, siehe Abschnitt „Stellenbörse“.

## Inhalt (Startseite)

| Platzhalter | Ort |
|---|---|
| `[STATUS: Import in Vorbereitung]` | `Faq.astro` („Kann ich meine bestehenden Kontakte übernehmen?“) |

## Medien (Platzhalter)

- **Hero-Video:** `public/media/hero-*` stammen aus `_entwurf/demo-video.mp4` (Bildschirmaufnahme, 2:02 min, 626×1050). Vor dem Livegang prüfen: nur Testdaten im Bild (keine echten Namen, Kontakte, Firmen), Ton und Inhalt freigegeben. Neues Video: `npm run video -- <datei>` (siehe README).
- **Untertitel:** `public/media/demo-video.de.vtt` ist ein leerer Platzhalter. Der Text kommt von Niko bzw. aus dem Transkript; danach in `src/components/Hero.astro` `UNTERTITEL = true` setzen. Bis dahin wird der Track nicht ausgeliefert. Status: wartet, evtl. neues Video.
- **Einblicke:** sechs Screenshots (Weboberfläche hell/dunkel × Laptop/Handy, Verwaltung hell/dunkel) liegen unter `src/assets/einblicke/` (Testdaten). Bei neuen Screenshots in `_entwurf` ablegen und `npm run einblicke` ausführen. In den Verwaltungs-Screenshots ist der Vorname „Niko“ (angemeldeter Benutzer) sichtbar; vor dem Livegang entscheiden, ob das so bleiben soll.
- Bildunterschriften und Alt-Texte der Einblicke (Kopf von `Einblicke.astro`) bei neuen Screenshots prüfen.

## Stellenbörse

- **Bewerbungsadresse:** `public/js/jobs.js` (`BEWERBEN_NAME`, `BEWERBEN_DOMAIN`) steht auf info@talmiro.de. Muss `JOBS_APPLY_EMAIL` im CRM entsprechen; bei einer eigenen Bewerbungsadresse beides ändern.
- **Datenschutzerklärung:** Der Text sagt noch nichts zu Bewerbungen per E-Mail (Zweck, Speicherdauer, Empfänger). Erst nach rechtlicher Klärung ergänzen. Die Stellenseiten verlinken auf Datenschutz und Impressum (Einstellungen `JOBS_PRIVACY_URL`, `JOBS_IMPRINT_URL` im CRM).
- **Texte der Stellenseiten:** Überschrift und Einleitung der Liste (DE/EN) in `src/pages/jobs-vorlagen/liste-*.astro`, Texte von `vergeben.html` in `src/pages/jobs/`: von Niko prüfen.
- **Menüpunkt „Stellen“** in der Navigation: aus, bis die Stellenbörse live ist (`STELLEN_IN_NAVIGATION` in `src/config.ts`).

## Betrieb

| Platzhalter | Ort |
|---|---|
| `[PFAD]` (Zielordner bei febas) | `README.md`, `scripts/upload.example.ps1` |
| `[EMPFAENGER-ADRESSE]`, `[ABSENDER-ADRESSE@talmiro.de]`, `[ZUFALLSWERT]` | `kontakt.config.php` (aus `kontakt.config.example.php`, nicht im Repository) |

- **Detailseite, Abschnitt „Ihr Kontakt“:** Name, Rolle und Antwortzeit sind neutral (Ihre Ansprechperson); eine Antwortzeit ist nicht angegeben, weil es keinen freigegebenen Wert gibt. Foto nur, wenn Talmiro ein freigegebenes Bild liefert. Texte in `src/pages/jobs-vorlagen/detail-*.astro`.
- **Detailseite, Hinweistext (p.job-note):** Vorschlag, Wortlaut von Niko bestätigen lassen („Beispieltext: Hier stehen in der echten Stellenbörse die Hinweise Ihrer Personalberatung …“). Der Kohlweg-Text zum Firmennamen ist bewusst nicht übernommen.

## Logo

- **Logo als SVG mit transparentem Hintergrund nachliefern.** Bisher ist die Bildmarke ein aus dem JPG ausgeschnittenes WebP Status: wartet, evtl. geändertes Logo.
  (`src/assets/logo-mark.webp`) mit grauem Hintergrund und abgerundeten Ecken wie im Entwurf; die Favicons
  (`public/favicon.*`, `apple-touch-icon.png`) und `public/favicon.svg` (enthält nur ein eingebettetes PNG) sind daraus abgeleitet.
  Nach Lieferung: `scripts/make-assets.mjs` anpassen bzw. Dateien ersetzen, OG-Bild (`scripts/og.html`) neu rendern.

## Abweichungen vom Entwurf

- Seiten `/fehler` und `/danke` sind zusätzlich zu den geforderten (Fehlerausgabe des Formulars ohne JavaScript); beide `noindex`.
- Eingabefeld-Rahmen etwas dunkler (`#7B8798` statt `#C9D2DE`) für ausreichenden Kontrast; Handy-Mockup, Raster und Überschriften skalieren unter 360 px.
- Namen und Texte unverändert; Ein Telefonbild ist reine Darstellung (`role="img"`).
