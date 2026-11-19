// Wird im <head> ohne defer/async geladen, damit alles vor dem ersten Rendern gesetzt ist (kein Aufblitzen).
// js          : JavaScript läuft (mobiles Menü, Design-Umschalter, kompakte Kopfzeile ohne Layoutsprung)
// js-reveal   : Scroll-Einblendung aktiv
// data-theme  : 'light' oder 'dark' auf <html>. Gespeicherte Wahl (localStorage 'talmiro-theme'), sonst prefers-color-scheme.
// Notfall: Lädt das gebündelte Script (Base.astro bzw. Header.astro) nicht, werden js/js-reveal nach 3 s wieder entfernt.
var root = document.documentElement;
root.classList.add('js', 'js-reveal');

var gespeichert = null;
try { gespeichert = localStorage.getItem('talmiro-theme'); } catch (e) { /* Speicher gesperrt */ }
if (gespeichert !== 'light' && gespeichert !== 'dark') gespeichert = null;
var dunkelMq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
root.setAttribute('data-theme', gespeichert || (dunkelMq && dunkelMq.matches ? 'dark' : 'light'));

// Ohne gespeicherte Wahl der Systemeinstellung folgen (auch bei Änderung im laufenden Betrieb)
if (dunkelMq && !gespeichert) {
  var folge = function (e) {
    var wahl = null;
    try { wahl = localStorage.getItem('talmiro-theme'); } catch (err) { /* ignorieren */ }
    if (wahl !== 'light' && wahl !== 'dark') root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  };
  if (dunkelMq.addEventListener) dunkelMq.addEventListener('change', folge);
  else if (dunkelMq.addListener) dunkelMq.addListener(folge);
}

setTimeout(function () {
  if (!window.__reveal) root.classList.remove('js-reveal');
  if (!window.__menue) root.classList.remove('js');
}, 3000);
