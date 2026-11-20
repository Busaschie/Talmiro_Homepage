<?php
declare(strict_types=1);

/**
 * Kontaktformular "Pilotplatz anfragen" (talmiro.de).
 *
 * - Nimmt nur POST an, funktioniert ohne JavaScript.
 * - Prüft Pflichtfelder, E-Mail-Format, Längen, Zeilenumbrüche (Header-Injection),
 *   Honigtopf, Mindestzeit (optional) und begrenzt Anfragen je IP.
 * - Sendet per mail() an den Empfänger aus kontakt.config.php.
 * - Speichert KEINE Anfragen. Von der IP wird nur ein Hash (mit Salz) kurz für das
 *   Ratenlimit gehalten und nach 24 Stunden gelöscht.
 *
 * Konfiguration: kontakt.config.php (Vorlage: kontakt.config.example.php),
 * bevorzugt EINE Ebene ÜBER dem Webroot, sonst neben dieser Datei (dann sperrt .htaccess den Abruf).
 */

const MAX_NAME = 100;
const MAX_FIRMA = 150;
const MAX_NACHRICHT = 3000;
const MAX_EMAIL = 254;
const MIN_SEKUNDEN = 3;          // Mindestzeit zwischen Seitenaufruf und Absenden
const LIMIT_PRO_STUNDE = 5;
const RL_AUFBEWAHRUNG = 86400;   // Ratenlimit-Dateien nach 24 h löschen

function weiter(string $ziel): never
{
    header('Cache-Control: no-store');
    header('Location: ' . $ziel, true, 303);
    exit;
}

function fehler(string $code): never
{
    weiter('/fehler/?grund=' . rawurlencode($code) . '#' . rawurlencode($code));
}

/** Ist der Pfad nach open_basedir (falls gesetzt) überhaupt prüfbar? Vermeidet Warnungen für Pfade außerhalb der erlaubten Ordner. */
function pfad_erlaubt(string $pfad): bool
{
    $basedir = (string)ini_get('open_basedir');
    if ($basedir === '') {
        return true;
    }
    foreach (explode(PATH_SEPARATOR, $basedir) as $erlaubt) {
        $erlaubt = rtrim(trim($erlaubt), '/\\');
        if ($erlaubt !== '' && ($pfad === $erlaubt || strpos($pfad, $erlaubt . '/') === 0 || strpos($pfad, $erlaubt . '\\') === 0)) {
            return true;
        }
    }
    return false;
}

/**
 * Sucht kontakt.config.php, die erste gefundene gültige Datei gewinnt:
 *  1) zwei Ebenen über dem Webroot-Ordner der Seite in priv/talmiro/ (febas: /var/www/<kunde>/priv/talmiro/)
 *  2) eine Ebene über kontakt.php
 *  3) neben kontakt.php
 * Fehlende oder nicht lesbare Pfade werden still übersprungen.
 */
function lade_config(): ?array
{
    $kandidaten = [
        dirname(__DIR__, 2) . '/priv/talmiro/kontakt.config.php',
        dirname(__DIR__) . '/kontakt.config.php',
        __DIR__ . '/kontakt.config.php',
    ];
    foreach ($kandidaten as $pfad) {
        if (pfad_erlaubt($pfad) && @is_file($pfad)) {
            $c = require $pfad;
            if (is_array($c) && !empty($c['to']) && !empty($c['from'])) {
                return $c;
            }
        }
    }
    return null;
}

function feld(string $name): string
{
    $v = $_POST[$name] ?? '';
    return is_string($v) ? trim($v) : '';
}

function hat_steuerzeichen(string $s): bool
{
    // Zeilenumbrüche und andere Steuerzeichen (Header-Injection)
    return preg_match('/[\x00-\x1F\x7F]/', $s) === 1;
}

function laenge(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

/** Zählt Anfragen der letzten Stunde (nur Hash der IP). $eintragen = true: neue Anfrage vermerken. */
function ratenlimit(array $cfg, bool $eintragen): bool
{
    $dir = $cfg['ratelimit_dir'] ?? (sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'talmiro_rl');
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return true; // lieber senden als ein kaputtes Formular
    }

    $jetzt = time();
    foreach (glob($dir . DIRECTORY_SEPARATOR . '*.rl') ?: [] as $datei) {
        if (@filemtime($datei) < $jetzt - RL_AUFBEWAHRUNG) {
            @unlink($datei);
        }
    }

    $salz = (string)($cfg['ratelimit_salt'] ?? 'talmiro');
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    $datei = $dir . DIRECTORY_SEPARATOR . hash_hmac('sha256', $ip, $salz) . '.rl';

    $fh = @fopen($datei, 'c+');
    if ($fh === false) {
        return true;
    }
    flock($fh, LOCK_EX);
    $roh = stream_get_contents($fh);
    $zeiten = array_values(array_filter(
        array_map('intval', $roh === false || $roh === '' ? [] : explode("\n", trim($roh))),
        static fn(int $t): bool => $t > $jetzt - 3600
    ));
    $erlaubt = count($zeiten) < (int)($cfg['limit_per_hour'] ?? LIMIT_PRO_STUNDE);
    if ($erlaubt && $eintragen) {
        $zeiten[] = $jetzt;
    }
    if ($eintragen || count($zeiten) === 0) {
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, implode("\n", $zeiten));
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $erlaubt;
}

function sende(array $cfg, string $name, string $email, string $firma, string $nachricht): bool
{
    $betreff = 'Pilotplatz-Anfrage von ' . $name;
    $betreff = function_exists('mb_encode_mimeheader')
        ? mb_encode_mimeheader($betreff, 'UTF-8', 'B', "\r\n")
        : '=?UTF-8?B?' . base64_encode($betreff) . '?=';

    $text = "Neue Anfrage über das Formular auf talmiro.de\r\n\r\n"
        . "Name:  $name\r\n"
        . "E-Mail: $email\r\n"
        . 'Firma: ' . ($firma !== '' ? $firma : '-') . "\r\n\r\n"
        . "Nachricht:\r\n" . str_replace(["\r\n", "\r", "\n"], "\r\n", $nachricht) . "\r\n";

    $absender = (string)$cfg['from'];
    $headers = [
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding' => '8bit',
        'From' => 'Talmiro Website <' . $absender . '>',
        'Reply-To' => $email,
        'X-Mailer' => 'talmiro-kontakt',
    ];

    // Nur zum lokalen Testen: Mail in Datei schreiben statt senden (nicht im Livebetrieb setzen).
    if (!empty($cfg['dry_run_file']) && is_string($cfg['dry_run_file'])) {
        $roh = 'To: ' . $cfg['to'] . "\r\nSubject: $betreff\r\n";
        foreach ($headers as $k => $v) {
            $roh .= "$k: $v\r\n";
        }
        return file_put_contents($cfg['dry_run_file'], $roh . "\r\n" . $text . "\r\n----\r\n", FILE_APPEND) !== false;
    }

    $zusatz = preg_match('/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+$/', $absender) === 1 ? '-f' . $absender : '';
    return mail((string)$cfg['to'], $betreff, $text, $headers, $zusatz);
}

// ---------------------------------------------------------------- Ablauf

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fehler('methode');
}

$cfg = lade_config();
if ($cfg === null) {
    error_log('talmiro kontakt.php: kontakt.config.php fehlt oder ist unvollständig');
    fehler('versand');
}

// Herkunft grob prüfen (Origin, falls vorhanden)
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '' && !empty($cfg['allowed_hosts']) && is_array($cfg['allowed_hosts'])) {
    $host = parse_url($origin, PHP_URL_HOST);
    if (!is_string($host) || !in_array(strtolower($host), array_map('strtolower', $cfg['allowed_hosts']), true)) {
        fehler('methode');
    }
}

// Honigtopf: Bots füllen das versteckte Feld. Wir tun so, als wäre alles gut, senden aber nichts.
if (feld('website') !== '') {
    weiter('/danke/');
}

if (!ratenlimit($cfg, false)) {
    fehler('limit');
}

$name = feld('name');
$email = feld('email');
$firma = feld('firma');
$nachricht = feld('nachricht');
$datenschutz = feld('datenschutz');

if (hat_steuerzeichen($name) || hat_steuerzeichen($email) || hat_steuerzeichen($firma)) {
    fehler('zeichen');
}
if ($name === '' || $email === '' || $nachricht === '' || $datenschutz === '') {
    fehler('pflicht');
}
if (laenge($name) > MAX_NAME || laenge($firma) > MAX_FIRMA || laenge($nachricht) > MAX_NACHRICHT || strlen($email) > MAX_EMAIL) {
    fehler('laenge');
}
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    fehler('email');
}

// Mindestzeit (Zeitstempel setzt form-zeit.js; fehlt er, z. B. ohne JavaScript, wird nicht geprüft)
$t = feld('t');
if ($t !== '' && ctype_digit($t)) {
    $alter = time() - (int)$t;
    if ($alter < MIN_SEKUNDEN) {
        fehler('zeit');
    }
}

// Anfrage zählen (nur jetzt, damit Tippfehler das Limit nicht aufbrauchen)
if (!ratenlimit($cfg, true)) {
    fehler('limit');
}

if (!sende($cfg, $name, $email, $firma, $nachricht)) {
    error_log('talmiro kontakt.php: Versand fehlgeschlagen');
    fehler('versand');
}

weiter('/danke/');
