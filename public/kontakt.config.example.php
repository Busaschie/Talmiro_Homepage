<?php
/**
 * Vorlage. Kopieren nach kontakt.config.php und ausfüllen.
 *
 * Ablageort (bevorzugt): EINE Ebene über dem Webroot, damit die Datei nie abrufbar ist.
 * Alternativ neben kontakt.php (dann sperrt .htaccess den Abruf).
 * kontakt.config.php gehört NICHT ins Git-Repository (steht in .gitignore).
 */
return [
    // Empfänger der Anfragen
    'to' => '[EMPFAENGER-ADRESSE]',

    // Absender: Adresse der EIGENEN Domain (wegen SPF/DKIM), z. B. kontakt@talmiro.de
    'from' => '[ABSENDER-ADRESSE@talmiro.de]',

    // Zufälliger geheimer Wert für den IP-Hash des Ratenlimits (z. B. 32 Zeichen)
    'ratelimit_salt' => '[ZUFALLSWERT]',

    // Optional: Anfragen je Stunde und IP (Standard 5)
    // 'limit_per_hour' => 5,

    // Optional: Ordner für Ratenlimit-Dateien (Standard: temp-Ordner des Servers).
    // Nie innerhalb des Webroots, wenn vermeidbar.
    // 'ratelimit_dir' => '/pfad/ausserhalb/webroot/rl',

    // Optional: erlaubte Hosts im Origin-Header
    'allowed_hosts' => ['www.talmiro.de', 'talmiro.de'],

    // NUR FÜR LOKALE TESTS: Mail in diese Datei schreiben statt zu senden. Im Livebetrieb NICHT setzen.
    // 'dry_run_file' => 'C:/temp/talmiro-mail.txt',
];
