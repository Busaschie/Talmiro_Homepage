// Setzt den Zeitstempel (Sekunden) beim Seitenaufruf ins versteckte Feld.
// kontakt.php prüft damit die Mindestzeit. Ohne JavaScript bleibt das Feld leer, das Formular funktioniert trotzdem.
(function () {
  var f = document.getElementById('f-zeit');
  if (f) f.value = String(Math.floor(Date.now() / 1000));
})();
