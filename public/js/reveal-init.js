// Wird im <head> ohne defer/async geladen, damit die Klassen vor dem ersten Rendern gesetzt sind.
// js          : JavaScript läuft (mobiles Menü mit Button, kompakte Kopfzeile ohne Layoutsprung)
// js-reveal   : Scroll-Einblendung aktiv
// Notfall: Lädt das gebündelte Script (Base.astro bzw. Header.astro) nicht, werden die Klassen nach 3 s wieder entfernt.
var root = document.documentElement;
root.classList.add('js', 'js-reveal');
setTimeout(function () {
  if (!window.__reveal) root.classList.remove('js-reveal');
  if (!window.__menue) root.classList.remove('js');
}, 3000);
