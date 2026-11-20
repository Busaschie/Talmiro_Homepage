// Stellenseiten (/jobs/, /jobs/en/): Bewerben-Link und Filter der Liste. Wird von den Vorlagen für das CRM geladen (feste Adresse /js/jobs.js).
// Keine Abhängigkeiten, kein Inline-Code (CSP: script-src 'self').
(function () {
  'use strict';

  // Bewerbungsadresse: MUSS der CRM-Einstellung JOBS_APPLY_EMAIL entsprechen. Steht nicht im HTML, damit sie nicht massenhaft abgegriffen wird.
  var BEWERBEN_NAME = 'info';
  var BEWERBEN_DOMAIN = 'talmiro.de';

  var en = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
  var T = en
    ? { bereich: 'Area', ort: 'Location', alle: 'All', keine: 'No positions match your selection.' }
    : { bereich: 'Bereich', ort: 'Ort', alle: 'Alle', keine: 'Keine Stelle passt zu Ihrer Auswahl.' };

  // 1. Bewerben: mailto mit Betreff aus data-subject setzen.
  // Demo (body[data-stellen-demo], gesetzt vom Build bei STELLEN_DEMO = true): keine Bewerbung per E-Mail, der Link führt zum Pilot-Formular der Startseite.
  var demo = document.body && document.body.hasAttribute('data-stellen-demo');
  var links = document.querySelectorAll('a.job-apply-link');
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    if (demo) {
      a.setAttribute('href', 'https://www.talmiro.de/#pilot');
      a.textContent = en ? 'Example page – to the pilot form' : 'Beispielseite – zum Pilot-Formular';
      continue;
    }
    var betreff = a.getAttribute('data-subject') || a.getAttribute('data-title') || '';
    a.setAttribute('href', 'mailto:' + BEWERBEN_NAME + '@' + BEWERBEN_DOMAIN + '?subject=' + encodeURIComponent(betreff));
  }

  // 2. Filter der Liste (nur bei mehr als einer Stelle und mehr als einem Wert)
  var liste = document.querySelector('[data-job-list]');
  if (!liste) return;
  var karten = Array.prototype.slice.call(liste.querySelectorAll('article.job-card'));
  if (karten.length < 2) return;

  function werte(attr, labelAttr) {
    var m = {};
    karten.forEach(function (k) {
      var v = k.getAttribute(attr);
      if (v) m[v] = (labelAttr && k.getAttribute(labelAttr)) || v;
    });
    return m;
  }
  var bereiche = werte('data-bereich', 'data-bereich-label');
  var orte = werte('data-ort', null);
  var nBereiche = Object.keys(bereiche).length;
  var nOrte = Object.keys(orte).length;
  if (nBereiche < 2 && nOrte < 2) return;

  var leer = document.createElement('p');
  leer.className = 'job-filter-leer';
  leer.setAttribute('role', 'status');
  leer.hidden = true;
  leer.textContent = T.keine;
  liste.parentNode.insertBefore(leer, liste.nextSibling);

  var form = document.createElement('div');
  form.className = 'job-filter';
  var selects = {};

  function auswahl(id, beschriftung, daten) {
    var feld = document.createElement('div');
    feld.className = 'job-filter-feld';
    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = beschriftung;
    var sel = document.createElement('select');
    sel.id = id;
    var alle = document.createElement('option');
    alle.value = '';
    alle.textContent = T.alle;
    sel.appendChild(alle);
    Object.keys(daten).sort(function (x, y) { return daten[x].localeCompare(daten[y], en ? 'en' : 'de'); }).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k;
      o.textContent = daten[k];
      sel.appendChild(o);
    });
    sel.addEventListener('change', anwenden);
    feld.appendChild(label);
    feld.appendChild(sel);
    form.appendChild(feld);
    return sel;
  }
  if (nBereiche > 1) selects.bereich = auswahl('job-filter-bereich', T.bereich, bereiche);
  if (nOrte > 1) selects.ort = auswahl('job-filter-ort', T.ort, orte);
  liste.parentNode.insertBefore(form, liste);

  function anwenden() {
    var b = selects.bereich ? selects.bereich.value : '';
    var o = selects.ort ? selects.ort.value : '';
    var sichtbar = 0;
    karten.forEach(function (k) {
      var ok = (!b || k.getAttribute('data-bereich') === b) && (!o || k.getAttribute('data-ort') === o);
      k.hidden = !ok;
      if (ok) sichtbar++;
    });
    leer.hidden = sichtbar !== 0;
  }
})();
