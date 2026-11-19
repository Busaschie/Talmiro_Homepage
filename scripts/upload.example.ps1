# VORLAGE – keine Zugangsdaten im Projekt. Kopie als scripts\upload.local.ps1 (steht in .gitignore) anpassen.
# Lädt den INHALT von dist\ per SFTP zu febas hoch. Voraussetzung: npm run build, OpenSSH-Client (sftp.exe).
# Das Passwort wird nicht gespeichert; besser ist ein SSH-Schlüssel.
param(
    [string]$Host_ = '[SFTP-HOST]',
    [string]$User  = '[SFTP-BENUTZER]',
    [string]$Ziel  = '[PFAD]'          # Webroot der Domain, z. B. /htdocs
)
$ErrorActionPreference = 'Stop'
$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'dist'
if (-not (Test-Path (Join-Path $dist 'index.html'))) { throw 'dist\ fehlt: zuerst npm run build.' }
if ($Host_ -like '[[]*' -or $Ziel -like '[[]*') { throw 'Platzhalter ausfüllen (Host, Benutzer, Pfad).' }

$batch = Join-Path ([IO.Path]::GetTempPath()) 'talmiro-sftp.txt'
@"
cd $Ziel
lcd $dist
put -r .
bye
"@ | Set-Content $batch -Encoding ascii
try { sftp -b $batch "$User@$Host_" } finally { Remove-Item $batch -Force -ErrorAction SilentlyContinue }
Write-Host 'Hochgeladen. Danach: .htaccess vorhanden? kontakt.config.php eine Ebene über dem Webroot? Testversand!'
