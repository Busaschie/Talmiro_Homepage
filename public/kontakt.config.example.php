<?php
/**
 * Vorlage. Kopieren nach kontakt.config.php und ausfüllen.
 *
 * Ablageort (bevorzugt bei febas): /var/www/<kunde>/priv/talmiro/kontakt.config.php
 *   (kontakt.php liegt dann in /var/www/<kunde>/htdocs/talmiro/; die Datei ist nie über das Web abrufbar).
 * Suchreihenfolge von kontakt.php, die erste gültige Datei gewinnt:
 *   1) zwei Ebenen über dem Ordner von kontakt.php: priv/talmiro/kontakt.config.php
 *   2) eine Ebene über kontakt.php
 *   3) neben kontakt.php (dann sperrt .htaccess den Abruf)
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

    // Optional: Ordner für Ratenlimit-Dateien. Kann leer bleiben: Standard ist der Temp-Ordner des Servers
    // (febas: /var/www/<kunde>/tmp, außerhalb des Webroots). Alternativ z. B. /var/www/<kunde>/priv/talmiro/rl.
    // Nie innerhalb des Webroots, wenn vermeidbar.
    // 'ratelimit_dir' => '/var/www/<kunde>/priv/talmiro/rl',

    // Optional: erlaubte Hosts im Origin-Header
    'allowed_hosts' => ['www.talmiro.de', 'talmiro.de'],

    // NUR FÜR LOKALE TESTS: Mail in diese Datei schreiben statt zu senden. Im Livebetrieb NICHT setzen.
    // 'dry_run_file' => 'C:/temp/talmiro-mail.txt',
];
