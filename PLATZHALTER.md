# Offene Platzhalter und Aufgaben vor dem Livegang

## Rechtlich (bitte prüfen lassen)

**Impressum und Datenschutz sind nur Gliederungen mit Platzhaltern, kein fertiger Rechtstext. Beides muss vor dem Livegang rechtlich geprüft und vollständig ausgefüllt werden.**

| Platzhalter / Stelle | Ort | Was fehlt |
|---|---|---|
| `[USt-IdNr. …]` | Impressum | falls zutreffend |
| `[HINWEIS ZUR VERBRAUCHERSTREITBEILEGUNG …]`, `[HAFTUNGSHINWEISE …]` | Impressum | rechtlich prüfen |
| Verantwortlicher (Name, Anschrift, E-Mail) | Impressum, Datenschutz Abschnitt 1 | eingetragen; in Datenschutz Abschnitt 1 steht die Adresse `info@talmiro.e` (vermutlich Tippfehler, `.de`) |
| Hosting und Server-Logfiles (FEBAS, Rechtsgrundlage, 7 Tage, AVV) | Datenschutz, Abschnitt 2 | eingetragen nach Angaben von Niko; **AVV-Abschluss und 7-Tage-Frist bitte bestätigen** |
| Externe Dienste und Schriftarten | Datenschutz, Abschnitt 5 | eingetragen; stimmt mit dem Build überein (keine externen Anfragen, Schriften lokal) |
| Kontaktformular: Rechtsgrundlage, Speicherdauer im Postfach, Empfänger | Datenschutz, Abschnitt 3 | fehlt im Text, rechtlich prüfen; Hinweis auf IP-Hash (24 h) steht schon drin |
| Zuständige Aufsichtsbehörde | Datenschutz, Abschnitt 6 | fehlt im Text |
| Speicherung der Design-Wahl (`localStorage` `talmiro-theme`, nur hell/dunkel, nichts wird übertragen) | Datenschutz, Abschnitt 4 | ggf. erwähnen; rechtlich prüfen |
| Hinweisbox „Entwurf, nicht rechtsverbindlich“ | Impressum, Datenschutz | vor dem Livegang entfernen, wenn beides geprüft ist |

## Inhalt (Startseite)

| Platzhalter | Ort |
|---|---|
| `[ANGABEN ZU SERVERSTANDORT UND AUFTRAGSVERARBEITUNG – nach rechtlicher Klärung]` | `Kontrolle.astro` (Karte „Datenschutz und Hosting“) |
| `[PREIS PILOT]` | `Pilot.astro` |
| `[TARIF, z. B. Pro oder Max]`, `[EMPFEHLUNG TEAM-TARIF MIT AUFTRAGSVERARBEITUNG – nach Klärung]` | `Faq.astro` („Brauche ich ein Claude-Konto?“) |
| `[ANTWORT NACH KLÄRUNG HOSTING UND AUFTRAGSVERARBEITUNG]` | `Faq.astro` („Wo liegen meine Daten?“) |
| `[PREISMODELL]` | `Faq.astro` („Was kostet Talmiro?“) |
| `[STATUS: Import in Vorbereitung]` | `Faq.astro` („Kann ich meine bestehenden Kontakte übernehmen?“) |
| `[KONTAKT: E-Mail-Adresse für den Fall, dass das Formular nicht funktioniert]` | `src/pages/fehler.astro` (nicht im Entwurf, ergänzt) |

## Betrieb

| Platzhalter | Ort |
|---|---|
| `[PFAD]` (Zielordner bei febas) | `README.md`, `scripts/upload.example.ps1` |
| `[EMPFAENGER-ADRESSE]`, `[ABSENDER-ADRESSE@talmiro.de]`, `[ZUFALLSWERT]` | `kontakt.config.php` (aus `kontakt.config.example.php`, nicht im Repository) |

## Logo

- **Logo als SVG mit transparentem Hintergrund nachliefern.** Bisher ist die Bildmarke ein aus dem JPG ausgeschnittenes WebP
  (`src/assets/logo-mark.webp`) mit grauem Hintergrund und abgerundeten Ecken wie im Entwurf; die Favicons
  (`public/favicon.*`, `apple-touch-icon.png`) und `public/favicon.svg` (enthält nur ein eingebettetes PNG) sind daraus abgeleitet.
  Nach Lieferung: `scripts/make-assets.mjs` anpassen bzw. Dateien ersetzen, OG-Bild (`scripts/og.html`) neu rendern.

## Abweichungen vom Entwurf

- Seiten `/fehler` und `/danke` sind zusätzlich zu den geforderten (Fehlerausgabe des Formulars ohne JavaScript); beide `noindex`.
- Eingabefeld-Rahmen etwas dunkler (`#7B8798` statt `#C9D2DE`) für ausreichenden Kontrast; Handy-Mockup, Raster und Überschriften skalieren unter 360 px.
- Namen und Texte unverändert; Ein Telefonbild ist reine Darstellung (`role="img"`).
