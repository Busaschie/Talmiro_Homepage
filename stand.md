# Stand – Talmiro-Website

> Sitzungsprotokoll des Planungs-Chats. Neue Einträge oben, alte nie überschreiben.

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
