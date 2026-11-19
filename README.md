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
