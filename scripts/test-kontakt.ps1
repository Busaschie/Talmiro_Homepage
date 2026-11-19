# Lokaler Test für public/kontakt.php (php -S, Mail in Datei statt Versand).
# Aufruf im Projektordner:  powershell -File scripts\test-kontakt.ps1 [-Php pfad\php.exe]
param([string]$Php = 'php', [int]$Port = 8099)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$cfgFile = Join-Path $root 'kontakt.config.php'
if (Test-Path $cfgFile) { throw "kontakt.config.php existiert schon ($cfgFile) - nicht überschrieben." }
$tmp = Join-Path ([IO.Path]::GetTempPath()) ('talmiro-test-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory $tmp | Out-Null
$mailFile = Join-Path $tmp 'mail.txt'
$rl = Join-Path $tmp 'rl'
function P($s) { $s.Replace('\', '/') }
@"
<?php return ['to' => 'test@example.org', 'from' => 'kontakt@talmiro.de', 'ratelimit_salt' => 'testsalz',
  'ratelimit_dir' => '$(P $rl)', 'dry_run_file' => '$(P $mailFile)'];
"@ | Set-Content $cfgFile -Encoding ascii

$srv = Start-Process $Php -ArgumentList @('-S', "127.0.0.1:$Port", '-t', (Join-Path $root 'public')) -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2
$fail = 0
function Post($fields, [string]$method = 'POST') {
    $args = @('-s', '-o', 'NUL', '-w', '%{http_code} %{redirect_url}', '-X', $method)
    foreach ($k in $fields.Keys) { $args += @('--data-urlencode', "$k=$($fields[$k])") }
    $args += "http://127.0.0.1:$Port/kontakt.php"
    (& curl.exe @args)
}
function Check($name, $got, $want) {
    if ($got -like "*$want*") { Write-Host "OK    $name -> $got" }
    else { Write-Host "FEHLT $name -> $got (erwartet: $want)"; $script:fail++ }
}
function Ok($t = 10) {
    @{ name = 'Erika Muster'; email = 'erika@example.com'; firma = 'Muster GmbH'; nachricht = 'Bitte um Kontakt.'; datenschutz = '1'
       t = [string]([DateTimeOffset]::UtcNow.ToUnixTimeSeconds() - $t); website = '' }
}
try {
    Check 'Erfolg' (Post (Ok)) '303 http://127.0.0.1:8099/danke/'
    Check 'Mail geschrieben (Reply-To)' ((Get-Content $mailFile -Raw)) 'Reply-To: erika@example.com'
    $n1 = ([regex]::Matches((Get-Content $mailFile -Raw), 'Subject:')).Count
    $f = Ok; $f.nachricht = ''
    Check 'Pflichtfeld fehlt' (Post $f) 'grund=pflicht'
    $f = Ok; $f.datenschutz = ''
    Check 'Datenschutz fehlt' (Post $f) 'grund=pflicht'
    $f = Ok; $f.email = 'keine-mail'
    Check 'E-Mail-Format' (Post $f) 'grund=email'
    $f = Ok; $f.name = "Eva`r`nBcc: boese@example.org"
    Check 'Header-Injection im Namen' (Post $f) 'grund=zeichen'
    $f = Ok; $f.email = "a@example.com`r`nBcc: boese@example.org"
    Check 'Header-Injection in E-Mail' (Post $f) 'grund=zeichen'
    $f = Ok; $f.nachricht = ('x' * 3001)
    Check 'Nachricht zu lang' (Post $f) 'grund=laenge'
    $f = Ok 0
    Check 'Zu schnell (Mindestzeit)' (Post $f) 'grund=zeit'
    $f = Ok; $f.website = 'http://spam.example'
    Check 'Honigtopf (still nach /danke/)' (Post $f) '/danke/'
    $n2 = ([regex]::Matches((Get-Content $mailFile -Raw), 'Subject:')).Count
    Check 'Honigtopf/Fehler: keine weitere Mail' "$n2" "$n1"
    Check 'GET abgelehnt' (Post @{} 'GET') 'grund=methode'
    $f = Ok; $f.Remove('t')
    Check 'Ohne Zeitstempel (kein JS) erlaubt' (Post $f) '/danke/'
    1..3 | ForEach-Object { Post (Ok) | Out-Null }          # insgesamt 5 gültige Anfragen
    Check 'Ratenlimit (6. Anfrage in einer Stunde)' (Post (Ok)) 'grund=limit'
    $n3 = ([regex]::Matches((Get-Content $mailFile -Raw), 'Subject:')).Count
    Check 'Genau 5 Mails verschickt' "$n3" '5'
    $rlFiles = Get-ChildItem $rl -File
    Check 'Ratenlimit-Datei nur Hash' ($rlFiles[0].Name -match '^[0-9a-f]{64}\.rl$') 'True'
} finally {
    Stop-Process -Id $srv.Id -Force -ErrorAction SilentlyContinue
    Remove-Item $cfgFile -Force -ErrorAction SilentlyContinue
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
if ($fail) { Write-Host "$fail Test(s) fehlgeschlagen"; exit 1 } else { Write-Host 'Alle Tests bestanden'; exit 0 }
