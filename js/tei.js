/*
 * tei.js - the Melville Electronic Library's TEI read into lines for the bench (root.MelTEI).
 *
 * The Billy Budd manuscript (xml/versions-of-billy-budd/bb-ms.xml, encoded in TextLab) in
 * three states:
 *   final       Melville's last readings: his additions kept, his deletions taken out, a
 *               restored deletion kept
 *   first       his deletions kept and his additions left out: the leaves before revision,
 *               as near as the encoding allows
 *   diplomatic  every reading, additions as \text/ and deletions as ⟦text⟧ (the Leiden marks)
 * A line is a line of the leaf (lb, ab). Marks made by other hands (Raymond Weaver,
 * Elizabeth Shaw Melville, the library's foliation) are left as they stand in the first two
 * states. Folio numbers, carets and insertion marks are left out of all three.
 *
 * The reading text (one file a chapter, from Juxta Editions) a sentence to a line: the
 * regularised spelling (reg), MEL's notes left out.
 *
 * Both mark the leaf each part of the text is on with a line of its own, [img_5], the
 * image's ID in MEL, so the manuscript and the reading text can be matched leaf by leaf.
 */
(function (root) {
  'use strict';

  // hands other than Melville's
  var OTHER = { '#RW': 1, '#ESM': 1, '#HT': 1, '#Ht': 1 };
  // metamarks that carry no text
  var NOTEXT = { folio: 1, caret: 1, 'insertion-device': 1, 'section-divider': 1 };

  function parse(xml) {
    var d = new DOMParser().parseFromString(xml, 'application/xml');
    var err = d.getElementsByTagName('parsererror')[0];
    if (err) throw new Error('The TEI could not be read: ' + err.textContent.slice(0, 200));
    return d;
  }
  function first(d, name) { return d.getElementsByTagNameNS('http://www.tei-c.org/ns/1.0', name)[0]; }

  // Lines as they are made: text is put on the current line, a break ends it
  function Lines(split) { this.out = []; this.cur = ''; this.split = split; }
  Lines.prototype.put = function (s) { this.cur += s; };
  Lines.prototype.br = function () {
    var t = this.cur.replace(/\s+/g, ' ').trim(), out = this.out;
    if (t) (this.split ? this.split(t) : [t]).forEach(function (s) { out.push(s); });
    this.cur = '';
  };
  Lines.prototype.leaf = function (id) { if (!id) return; this.br(); this.out.push('[' + id.replace(/^#/, '') + ']'); };
  Lines.prototype.text = function () { this.br(); return this.out.join('\n') + '\n'; };

  function ms(node, mode, L, restored) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { L.put(c.nodeValue); continue; }
      if (c.nodeType !== 1) continue;
      var n = c.localName, other = OTHER[c.getAttribute('hand')];
      if (n === 'lb') L.br();
      else if (n === 'pb') L.leaf(c.getAttribute('facs'));
      else if (n === 'ab') { L.br(); ms(c, mode, L, restored); L.br(); }
      else if (n === 'metamark') { if (!NOTEXT[c.getAttribute('function')] && (mode === 'diplomatic' || c.getAttribute('function') !== 'composition-information')) ms(c, mode, L, restored); }
      else if (n === 'add') {
        if (mode === 'diplomatic') { L.put('\\'); ms(c, mode, L, restored); L.put('/'); }
        else if (mode === 'final' && !other) ms(c, mode, L, restored);
      }
      else if (n === 'del') {
        if (mode === 'diplomatic') { L.put('⟦'); ms(c, mode, L, restored); L.put('⟧'); }
        else if (mode === 'first' || restored || other) ms(c, mode, L, restored);
      }
      else if (n === 'restore') ms(c, mode, L, true);
      else if (n === 'note' || n === 'label' || n === 'milestone' || n === 'delSpan' || n === 'anchor') continue;
      else ms(c, mode, L, restored);
    }
  }

  // A paragraph divided into sentences: at . ! or ? (with any closing quotation mark or
  // bracket) before a capital, a digit or an opening quotation mark, except after a short
  // abbreviation or an initial
  var ABBR = /(?:\b(?:Mr|Mrs|Dr|St|Capt|Lieut|Esq|No|vs|viz|Nov|Dec|Jan|Feb|Aug|Sept|Oct)|\b[A-Z])\.$/;
  function sentences(t) {
    var out = [], re = /([.!?]+["”’')\]]*)\s+(?=["“‘(\[]?[A-Z0-9])/g, last = 0, m;
    while ((m = re.exec(t))) {
      var piece = t.slice(last, m.index + m[1].length);
      if (ABBR.test(piece)) continue;
      out.push(piece.trim()); last = re.lastIndex;
    }
    out.push(t.slice(last).trim());
    return out.filter(Boolean);
  }

  function rt(node, L) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { L.put(c.nodeValue); continue; }
      if (c.nodeType !== 1) continue;
      var n = c.localName;
      if (n === 'note' || n === 'orig' || n === 'teiHeader') continue;
      if (n === 'pb') L.leaf(c.getAttribute('corresp'));
      else if (n === 'lb') L.br();
      else if (n === 'p' || n === 'head' || n === 'l' || n === 'lg' || n === 'div' || n === 'ab') { L.br(); rt(c, L); L.br(); }
      else rt(c, L);
    }
  }

  root.MelTEI = {
    manuscript: function (xml, mode) { var L = new Lines(); ms(first(parse(xml), 'body'), mode || 'final', L, false); return L.text(); },
    reading: function (xml) { var L = new Lines(sentences); rt(first(parse(xml), 'body'), L); return L.text(); },
    sentences: sentences
  };
})(typeof window !== 'undefined' ? window : globalThis);
