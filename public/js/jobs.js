// Stellenseiten (/jobs/, /jobs/en/): Bewerben-Link, Suche, Filter und Vorschau der Liste. Wird von den Vorlagen für das CRM geladen (feste Adresse /js/jobs.js).
// Keine Abhängigkeiten, kein Inline-Code (CSP: script-src 'self'). Dieselbe Datei läuft auf Liste und Detailseite: fehlt ein Element, passiert nichts.
// Ohne JavaScript bleibt die Liste benutzbar: die Kacheln sind Links auf die Detailseiten.
(function () {
  'use strict';

  // Bewerbungsadresse: MUSS der CRM-Einstellung JOBS_APPLY_EMAIL entsprechen. Steht nicht im HTML, damit sie nicht massenhaft abgegriffen wird.
  var BEWERBEN_NAME = 'info';
  var BEWERBEN_DOMAIN = 'talmiro.de';

  var en = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
  var T = en
    ? { bereich: 'Area', ort: 'Location', alle: 'All', keine: 'No positions match your selection.', stellen: 'Open positions', neu: 'New', seite: 'Open page', kopieren: 'Copy link', kopiert: 'Link copied', blick: 'At a glance', fehler: 'The preview could not be loaded.', hinweis: 'Select a position on the left.' }
    : { bereich: 'Bereich', ort: 'Ort', alle: 'Alle', keine: 'Keine Stelle passt zu Ihrer Auswahl.', stellen: 'Offene Stellen', neu: 'Neu', seite: 'Seite öffnen', kopieren: 'Link kopieren', kopiert: 'Link kopiert', blick: 'Auf einen Blick', fehler: 'Die Vorschau konnte nicht geladen werden.', hinweis: 'Wählen Sie links eine Stelle aus.' };

  // 1. Bewerben: mailto mit Betreff aus data-subject setzen (auch in der Vorschau, deshalb als Funktion).
  // Demo (body[data-stellen-demo], gesetzt vom Build bei STELLEN_DEMO = true): keine Bewerbung per E-Mail, der Link führt zum Pilot-Formular der Startseite.
  var demo = document.body && document.body.hasAttribute('data-stellen-demo');
  function bewerbenLinks(wurzel) {
    var links = wurzel.querySelectorAll('a.job-apply-link');
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
  }
  bewerbenLinks(document);

  // ------------------------------------------------------------------ Aufbereitung der Stelle (Detailseite und Vorschau gleich)
  function norm(s) { return (s || '').toLowerCase(); }

  var ICONS = {
    ort: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
    modell: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    zeit: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    bereich: '<rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
    gehalt: '<circle cx="12" cy="12" r="10"></circle><path d="M15 9.5A4 4 0 1 0 15 14.5"></path><line x1="7" y1="11" x2="13" y2="11"></line><line x1="7" y1="13.5" x2="13" y2="13.5"></line>',
    sonst: '<circle cx="12" cy="12" r="3"></circle>'
  };
  function artFuer(label) {
    var l = norm(label);
    if (/ort|location/.test(l)) return 'ort';
    if (/modell|model|remote|hybrid/.test(l)) return 'modell';
    if (/zeit|hours|time/.test(l)) return 'zeit';
    if (/bereich|area|field|branche/.test(l)) return 'bereich';
    if (/gehalt|salary/.test(l)) return 'gehalt';
    return 'sonst';
  }
  function symbol(art) {
    // nur feste Zeichenketten aus ICONS, nie Inhalte der Seite
    var s = document.createElement('span');
    s.className = 'job-fact-icon';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + ICONS[art] + '</svg>';
    return s;
  }
  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text) e.textContent = text;
    return e;
  }

  // Baut article.job (Markup des CRM) zu Kopf, "Auf einen Blick"-Kacheln und Abschnitten um.
  // optionen.seite: Detailseite (h1, kein "Seite öffnen"); sonst Vorschau (h2). optionen.href: Adresse der Detailseite.
  function enhance(artikel, optionen) {
    var seite = !!optionen.seite;
    var wurzel = el('div', 'job-built');

    var fakten = {};
    var liste = [];
    var dl = artikel.querySelector('dl.job-facts');
    if (dl) {
      Array.prototype.forEach.call(dl.querySelectorAll('dt'), function (dt) {
        var dd = dt.nextElementSibling;
        if (!dd) return;
        var art = artFuer(dt.textContent);
        fakten[art] = dd.textContent;
        liste.push({ art: art, label: dt.textContent, wert: dd.textContent });
      });
    }

    // Kopf: Titel und Knöpfe (bleiben beim Scrollen sichtbar)
    var kopf = el('div', 'job-header');
    var titelQuelle = artikel.querySelector('h1, h2');
    var titelText = titelQuelle ? titelQuelle.textContent : '';
    kopf.appendChild(el(seite ? 'h1' : 'h2', 'job-title', titelText));
    var aktionen = el('div', 'job-header-actions');
    var bewerben = artikel.querySelector('a.job-apply-link');
    if (bewerben) aktionen.appendChild(bewerben.cloneNode(true));
    var kopieren = el('button', 'job-copy', T.kopieren);
    kopieren.type = 'button';
    kopieren.setAttribute('data-copy-url', new URL(optionen.href || location.href, location.href).href.split('#')[0]);
    aktionen.appendChild(kopieren);
    if (!seite && optionen.href) {
      var offen = el('a', 'job-open', T.seite);
      offen.href = optionen.href;
      aktionen.appendChild(offen);
    }
    kopf.appendChild(aktionen);
    wurzel.appendChild(kopf);

    // Firma, Ort · Arbeitszeit, Merkmale (Bereich, Arbeitsmodell)
    var meta = el('div', 'job-head-meta');
    var firma = artikel.querySelector('.job-company');
    if (firma) meta.appendChild(el('p', 'job-company', firma.textContent));
    var zeile = [fakten.ort, fakten.zeit].filter(Boolean).join(' · ');
    if (zeile) meta.appendChild(el('p', 'job-meta-line', zeile));
    var merkmale = [fakten.bereich, fakten.modell].filter(Boolean);
    if (merkmale.length) {
      var ul = el('ul', 'job-tags');
      merkmale.forEach(function (m) { ul.appendChild(el('li', '', m)); });
      meta.appendChild(ul);
    }
    if (meta.childNodes.length) wurzel.appendChild(meta);

    // Auf einen Blick
    if (liste.length) {
      var block = el('div', 'job-glance');
      block.appendChild(el('h2', 'job-glance-titel', T.blick));
      var gitter = el('div', 'job-facts-grid');
      liste.forEach(function (f) {
        var k = el('div', 'job-fact');
        k.appendChild(symbol(f.art));
        var txt = el('div');
        txt.appendChild(el('span', 'job-fact-label', f.label));
        txt.appendChild(el('strong', 'job-fact-value', f.wert));
        k.appendChild(txt);
        gitter.appendChild(k);
      });
      block.appendChild(gitter);
      wurzel.appendChild(block);
    }

    // Text: Einleitung vor der ersten Zwischenüberschrift, danach je ein Abschnitt pro h2
    var text = artikel.querySelector('.job-text');
    if (text) {
      var intro = el('div', 'job-intro');
      var abschnitte = [];
      var abschnitt = null;
      Array.prototype.forEach.call(text.children, function (n) {
        if (n.tagName === 'H2') {
          abschnitt = el('section', 'job-section');
          abschnitt.appendChild(n.cloneNode(true));
          abschnitte.push(abschnitt);
        } else if (abschnitt) {
          abschnitt.appendChild(n.cloneNode(true));
        } else {
          intro.appendChild(n.cloneNode(true));
        }
      });
      if (intro.childNodes.length) wurzel.appendChild(intro);
      abschnitte.forEach(function (a) { wurzel.appendChild(a); });
    }
    Array.prototype.forEach.call(artikel.querySelectorAll('section.job-section, .job-legal'), function (n) { wurzel.appendChild(n.cloneNode(true)); });
    return wurzel;
  }

  // "Link kopieren" (auch für Knöpfe in der Vorschau, deshalb ein Handler am Dokument) mit Rückmeldung "Link kopiert"
  var statusBox = null;
  function melde(text) {
    if (!statusBox) {
      statusBox = el('div', 'sr-only');
      statusBox.setAttribute('role', 'status');
      document.body.appendChild(statusBox);
    }
    statusBox.textContent = '';
    setTimeout(function () { statusBox.textContent = text; }, 30);
  }
  function kopiere(knopf) {
    var url = knopf.getAttribute('data-copy-url') || '';
    var fertig = function () {
      if (!knopf.hasAttribute('data-label')) knopf.setAttribute('data-label', knopf.textContent);
      knopf.textContent = T.kopiert;
      melde(T.kopiert);
      clearTimeout(knopf.jobTimer);
      knopf.jobTimer = setTimeout(function () { knopf.textContent = knopf.getAttribute('data-label'); }, 2200);
    };
    var notbehelf = function () {
      var t = document.createElement('textarea');
      t.value = url;
      t.setAttribute('readonly', '');
      t.className = 'sr-only';
      document.body.appendChild(t);
      t.select();
      try { if (document.execCommand('copy')) fertig(); } catch (e) { /* nicht möglich: kein Hinweis */ }
      document.body.removeChild(t);
      knopf.focus();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(fertig, notbehelf);
    else notbehelf();
  }
  document.addEventListener('click', function (e) {
    var k = e.target.closest ? e.target.closest('[data-copy-url]') : null;
    if (k) kopiere(k);
  });

  // Detailseite: article.job umbauen (ohne JavaScript bleibt das Markup des CRM stehen)
  (function () {
    if (document.querySelector('[data-job-list]')) return;
    var koerper = document.querySelector('[data-job-body]');
    var artikel = (koerper || document).querySelector('article.job');
    // Bis hierher hält die CSS (html.js [data-job-body]:not(.is-enhanced)) das CRM-Markup unsichtbar; danach erscheint nur der fertige Aufbau.
    try {
      if (!artikel || !artikel.parentNode) return;
      var gebaut = enhance(artikel, { seite: true, href: location.href });
      artikel.parentNode.replaceChild(gebaut, artikel);
      bewerbenLinks(gebaut);
      document.body.classList.add('job-gebaut');
    } finally {
      if (koerper) koerper.classList.add('is-enhanced');
    }
  })();

  var liste = document.querySelector('[data-job-list]');
  if (!liste) return;
  var karten = Array.prototype.slice.call(liste.querySelectorAll('article.job-card'));

  // 2. Neue Liste mit Suche, Chips und Vorschau (Vorlage mit #job-form); ältere, schon hochgeladene Listen behalten den einfachen Filter unten.
  if (document.getElementById('job-form')) {
    neueListe();
  } else {
    einfacherFilter();
  }

  // ------------------------------------------------------------------ neue Liste
  function neueListe() {
    var form = document.getElementById('job-form');
    var feldQ = document.getElementById('job-q');
    var feldL = document.getElementById('job-l');
    var chipsBox = document.getElementById('job-chips');
    var zaehler = document.getElementById('job-count');
    var leer = document.getElementById('job-empty');
    var keine = document.getElementById('job-none');
    var split = liste.closest ? liste.closest('.job-split') : null;
    var pane = document.getElementById('job-pane');
    var gesamt = karten.length;
    var desktop = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : { matches: false };

    form.hidden = false;
    if (split && pane) {
      split.classList.add('job-js');
      pane.textContent = ''; // neutral und leer, bis die erste Stelle geladen ist (kein Aufblitzen eines Hinweises)
    }
    var bereit = false;

    function slugVon(href) { var m = /([^\/]+?)(?:\.html)?(?:[?#].*)?$/.exec(href || ''); return m ? m[1] : ''; }

    // Kacheln vorbereiten: Suchtext, Slug, "Neu"-Marke (Veröffentlichung höchstens 7 Tage her)
    karten.forEach(function (k) {
      var h2a = k.querySelector('h2 a');
      k.setAttribute('data-slug', slugVon(h2a ? h2a.getAttribute('href') : ''));
      k.jobText = norm(k.textContent + ' ' + (k.getAttribute('data-bereich-label') || ''));
      k.jobOrt = norm(k.getAttribute('data-ort'));
      var zeit = k.querySelector('time[datetime]');
      var t = zeit ? Date.parse(zeit.getAttribute('datetime')) : NaN;
      if (!isNaN(t) && Date.now() - t <= 7 * 86400000 && Date.now() - t > -86400000) {
        var marke = document.createElement('span');
        marke.className = 'job-new';
        marke.textContent = T.neu;
        var h2 = k.querySelector('h2');
        if (h2) h2.appendChild(marke);
      }
    });

    // Bereichs-Chips (erst ab zwei Bereichen)
    var bereiche = {};
    karten.forEach(function (k) {
      var v = k.getAttribute('data-bereich');
      if (v) bereiche[v] = k.getAttribute('data-bereich-label') || v;
    });
    var bereichKeys = Object.keys(bereiche).sort(function (a, b) { return bereiche[a].localeCompare(bereiche[b], en ? 'en' : 'de'); });
    var gewaehlt = '';
    var chips = [];
    if (bereichKeys.length > 1) {
      [''].concat(bereichKeys).forEach(function (key) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'job-chip';
        b.textContent = key ? bereiche[key] : T.alle;
        b.setAttribute('aria-pressed', key === '' ? 'true' : 'false');
        b.addEventListener('click', function () {
          gewaehlt = key;
          chips.forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
          anwenden();
        });
        chips.push(b);
        chipsBox.appendChild(b);
      });
    } else {
      chipsBox.hidden = true;
    }

    var aktuell = null;
    function anwenden() {
      var q = norm(feldQ.value).split(/\s+/).filter(Boolean);
      var o = norm(feldL.value).trim();
      var sichtbar = 0;
      karten.forEach(function (k) {
        var ok = (!gewaehlt || k.getAttribute('data-bereich') === gewaehlt) &&
          (!o || k.jobOrt.indexOf(o) !== -1) &&
          q.every(function (w) { return k.jobText.indexOf(w) !== -1; });
        k.hidden = !ok;
        if (ok) sichtbar++;
      });
      if (zaehler) zaehler.textContent = T.stellen + ' (' + sichtbar + ')';
      if (leer) leer.hidden = !(gesamt > 0 && sichtbar === 0);
      if (keine) keine.hidden = !(gesamt === 0 && !liste.querySelector('.job-none'));
      if (aktuell && aktuell.hidden) {
        aktuell.removeAttribute('aria-current');
        aktuell = null;
      }
      if (bereit) auto();
    }
    feldQ.addEventListener('input', anwenden);
    feldL.addEventListener('input', anwenden);
    form.addEventListener('submit', function (e) { e.preventDefault(); anwenden(); });

    // ---------------------------------------------------------- Vorschau
    var cache = {};
    var anfrage = 0;

    // Am Desktop immer die oberste sichtbare Stelle zeigen (beim Laden und wenn die gezeigte Stelle ausgeblendet wird); ohne Treffer bleibt die Vorschau ausgeblendet
    function auto() {
      if (!pane || !desktop.matches) return;
      var erste = karten.filter(function (k) { return !k.hidden; })[0];
      if (!erste) {
        aktuell = null;
        pane.textContent = '';
        pane.hidden = true;
        return;
      }
      pane.hidden = false;
      if (aktuell && !aktuell.hidden) return;
      zeige(erste, { auto: true, verlauf: false });
    }

    function holeDetail(href) {
      if (cache[href]) return Promise.resolve(cache[href]);
      return fetch(href, { credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var artikel = doc.querySelector('[data-job-body] article.job') || doc.querySelector('article.job');
        if (!artikel) throw new Error('kein Inhalt');
        var gebaut = enhance(artikel, { seite: false, href: href });
        // Abschnitte der Detailseite außerhalb von article.job (Kontakt, Hinweis) gehören auch in die Vorschau
        var huelle = artikel.parentNode;
        if (huelle) {
          Array.prototype.forEach.call(huelle.children, function (n) {
            if (n !== artikel && n.matches && n.matches('section.job-section')) gebaut.appendChild(n.cloneNode(true));
          });
        }
        cache[href] = gebaut;
        return cache[href];
      });
    }

    // opt.auto: automatisch geöffnet (kein #slug, bei Fehler keine Weiterleitung); sonst Klick des Nutzers
    function zeige(karte, opt) {
      opt = opt || {};
      var a = karte.querySelector('h2 a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (aktuell && aktuell !== karte) aktuell.removeAttribute('aria-current');
      aktuell = karte;
      karte.setAttribute('aria-current', 'true');
      var slug = karte.getAttribute('data-slug');
      if (opt.verlauf !== false && !opt.auto && slug && window.history && history.replaceState) history.replaceState(null, '', '#' + slug);
      var mein = ++anfrage;
      pane.setAttribute('aria-busy', 'true');
      holeDetail(href).then(function (inhalt) {
        if (mein !== anfrage) return;
        var kopie = inhalt.cloneNode(true);
        bewerbenLinks(kopie);
        pane.textContent = '';
        pane.appendChild(kopie);
        pane.scrollTop = 0;
        pane.removeAttribute('aria-busy');
      }).catch(function () {
        if (mein !== anfrage) return;
        if (!opt.auto) { location.href = href; return; } // Klick des Nutzers: normale Detailseite
        pane.textContent = '';
        var p = document.createElement('p');
        p.className = 'job-pane-hint';
        p.appendChild(document.createTextNode(T.fehler + ' '));
        var l = document.createElement('a');
        l.href = href;
        l.textContent = T.seite;
        p.appendChild(l);
        pane.appendChild(p);
        pane.removeAttribute('aria-busy');
      });
    }

    // Klick auf eine Kachel: am Desktop (ab 1024 px) Vorschau, sonst normal zur Detailseite. Strg/Cmd/Shift/Mittelklick bleiben Standard.
    if (pane) {
      liste.addEventListener('click', function (e) {
        if (!desktop.matches || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        var karte = e.target.closest ? e.target.closest('article.job-card') : null;
        if (!karte || !liste.contains(karte)) return;
        e.preventDefault();
        zeige(karte);
      });
    }

    anwenden();

    // Adresse mit #slug hat Vorrang vor der obersten Stelle (nur Desktop)
    if (pane && location.hash.length > 1 && desktop.matches) {
      var slug = decodeURIComponent(location.hash.slice(1));
      var treffer = karten.filter(function (k) { return k.getAttribute('data-slug') === slug; })[0];
      if (treffer) zeige(treffer, { auto: true, verlauf: false });
    }
    bereit = true;
    auto();

    // Wechsel von schmal auf breit: oberste Stelle zeigen, falls noch keine aktiv ist; schmal: Markierung weg
    function breiteGeaendert() {
      if (desktop.matches) {
        auto();
      } else if (aktuell) {
        aktuell.removeAttribute('aria-current');
        aktuell = null;
      }
    }
    if (desktop.addEventListener) desktop.addEventListener('change', breiteGeaendert);
    else if (desktop.addListener) desktop.addListener(breiteGeaendert);
  }

  // ------------------------------------------------------------------ einfacher Filter (ältere Listenseiten ohne #job-form)
  function einfacherFilter() {
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
  }
})();
