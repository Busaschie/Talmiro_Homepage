# Talmiro – Produktwebsite (talmiro.de)

Statische Website für die Software Talmiro (sprachgesteuertes CRM für Headhunter).
Eigenes Projekt, unabhängig von crm_agenten.

## Repository
- GitHub: https://github.com/Busaschie/Talmiro_Homepage.git (Remote `origin`, Branch `main`).
- Lokaler Ordner `homepage` ist das Arbeitsverzeichnis dieses Repos.
- Nicht ins Repo: `node_modules/`, `dist/`, `kontakt.config.php`, Zugangsdaten, `.env*`
  (über `.gitignore`).
- Pushen nur auf ausdrücklichen Auftrag von Niko.

## Technik
- Astro, statischer Build (`npm run build` → `dist/`), kein CMS, kein Tracking, keine Cookies.
- Schriften lokal (Plus Jakarta Sans, Inter), kein Google-Fonts-CDN.
- Einziges Server-Skript: `public/kontakt.php` (Formular → Mail). Konfiguration in
  `kontakt.config.php`, nie im Repo; Vorlage `kontakt.config.example.php`.
- Hosting: febas (statische Dateien + PHP). Upload von `dist/` per SFTP, Zugangsdaten nie im Projekt.

## Gestaltung
- Vorlage: `_entwurf/talmiro_entwurf.dc.html` (Aufbau und Texte verbindlich).
- Farben: Navy #14305E, Petrol #0F7C7C, Hell #F5F8FA; Schriftzug-Verlauf
  #14305E → #1F5C8A → #1AA3A3 (Footer #FFFFFF → #A9E3E0 → #4CC7C2).
- Barrierefreiheit: Kontrast ≥ 4.5:1, Fokus sichtbar, echte Buttons/Links/Labels,
  Handy ab 360 px ohne waagerechtes Scrollen.

## Texte
- Anrede durchgehend „Sie“, Deutsch, kurze klare Sätze.
- Nur Funktionen nennen, die es in Talmiro wirklich gibt; Geplantes als „in Vorbereitung“.
- Keine erfundenen Zahlen, Kundenstimmen oder Logos. Fehlende Angaben als [PLATZHALTER]
  und in `PLATZHALTER.md` pflegen.
- Datenschutz-/Rechtsaussagen nur nach Klärung; Impressum und Datenschutz vor dem
  Livegang rechtlich prüfen lassen.

## Arbeitsweise
- Bestehenden, funktionierenden Code nicht neu aufbauen, nur ändern, was beauftragt ist.
- Vor jedem Commit: `npm run build` fehlerfrei, `php -l public/kontakt.php`.
- Commits mit klarer Nachricht; nicht pushen und nicht hochladen ohne ausdrücklichen Auftrag.
- Am Ende jedes Auftrags kurzer Bericht: was geändert, was offen, was Niko tun muss.
