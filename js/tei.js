/*
 * tei.js - the Melville Electronic Library's TEI read for the bench (root.MelTEI): each file
 * into lines, for Read and Compare, and into a document of blocks and spans (b.doc) for the
 * Book view, each span keyed to the line it sits on.
 *
 * The Billy Budd manuscript (xml/versions-of-billy-budd/bb-ms.xml, encoded in TextLab) in
 * three states:
 *   final       Melville's last readings: his additions kept, his deletions taken out, a
 *               deletion he reinstated (restore) kept
 *   first       his deletions kept and his additions left out: the leaves before revision,
 *               as near as the encoding allows
 *   diplomatic  every reading, additions as \text/ and deletions as ⟦text⟧ (the Leiden marks)
 * A line is a line of the leaf (lb, ab). Marks made by other hands (Raymond Weaver,
 * Elizabeth Shaw Melville, the library's foliation) are left as they stand in the first two
 * states. Folio numbers, carets and insertion marks are left out of all three.
 *
 * The reading text (one file a chapter, from Juxta Editions) a sentence to a line: the
 * regularised spelling (reg), MEL's notes left out of the lines and kept in the document.
 *
 * Both mark the leaf each part of the text is on with a line of its own, [img_5], the
 * image's ID in MEL, so the manuscript and the reading text can be matched leaf by leaf.
 *
 * The document (bench-kit's Book view): { blocks: [block] }, a block { t, rend?, n0, n1,
 * spans } with t one of head, p, l, ab, note, pb; a pb carries the leaf (facs) and its IIIF
 * image service (iiif: { id, v: 3 }); a block that goes on after a leaf break is marked cont.
 * A span { s, n, c0, c1, marks }: its text, the line it is on and where in the line (UTF-16
 * offsets into the line's raw text). A span with no n is in the document but not in this
 * version's lines (an addition, in the manuscript before revision). Each version has its own
 * document, so its line keys are its own. Marks use bench-kit's ids where it has one (added,
 * erased, uncertain, sic) and name the rest: reinstated (a deletion the author restored),
 * regularised (the reading text's spelling, the source's in orig), hi, ref, metamark.
 * A mark's hand is the k of SW.BENCH.hands, its change a stage id of SW.BENCH.doc.stages,
 * or one not yet placed (SW.BENCH.doc.unplaced); MEL's forms are normalised by stageOf.
 */
(function (root) {
  'use strict';

  // the hands, as SW.BENCH.hands names them: MEL's other values for Melville's hand are its
  // media (HMp, ink1r, Cg …), kept on the mark as handAs
  var HANDS = { HM: 'HM', ESM: 'ESM', RW: 'RW', HT: 'HT', Ht: 'HT' };
  // hands other than Melville's
  var OTHER = { RW: 1, ESM: 1, HT: 1 };
  // metamarks that carry no text
  var NOTEXT = { folio: 1, caret: 1, 'insertion-device': 1, 'section-divider': 1 };

  function parse(xml) {
    var d = new DOMParser().parseFromString(xml, 'application/xml');
    var err = d.getElementsByTagName('parsererror')[0];
    if (err) throw new Error('The TEI could not be read: ' + err.textContent.slice(0, 200));
    return d;
  }
  function all(d, name) { return d.getElementsByTagNameNS('http://www.tei-c.org/ns/1.0', name); }
  function att(e, a) { return e.getAttribute(a) || ''; }
  function rawHand(e) { return att(e, 'hand').replace(/^#/, ''); }
  function handOf(e) { return HANDS[rawHand(e)] || 'HM'; }
  // MEL's stage codes as the bench's stage ids: #StFa, StFa and "Fa: a note" are all Fa
  function stageOf(e) {
    var c = att(e, 'change').replace(/^#/, '').split(':')[0].trim();
    return c.replace(/^[Ss]t(?=[A-Z])/, '') || null;
  }
  function mark(k, e, more) {
    var m = { k: k };
    if (e) {
      if (e.hasAttribute('hand')) { m.hand = handOf(e); if (rawHand(e) && !HANDS[rawHand(e)]) m.handAs = rawHand(e); }
      var c = stageOf(e); if (c) m.change = c;
    }
    for (var x in more || {}) if (more[x]) m[x] = more[x];
    return m;
  }
  // the facsimile: a surface's ID to its IIIF image service
  function services(d) {
    var out = {};
    Array.prototype.forEach.call(all(d, 'surface'), function (s) {
      var g = all(s, 'graphic')[0];
      if (g) out[att(s, 'xml:id') || s.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'id')] = att(g, 'url');
    });
    return out;
  }

  // ---------- lines and the document, made together ----------
  // Text is gathered a segment at a time: { s, marks, key } (key: in this version's lines) or
  // a siglum (in the lines, not a span). A break ends the line: whitespace is collapsed and
  // trimmed, the spans get their offsets, and the reading text's lines are cut at sentences.
  function Doc(split) { this.split = split; this.lines = []; this.blocks = []; this.block = null; this.cur = []; this.notes = []; }
  Doc.prototype.put = function (s, marks, key) { if (s) this.cur.push({ s: s, marks: marks, key: key }); };
  Doc.prototype.sig = function (s) { this.cur.push({ s: s, sig: true, key: true }); };
  Doc.prototype.open = function (t, extra) {
    this.close();
    this.block = { t: t, spans: [] };
    for (var x in extra || {}) if (extra[x]) this.block[x] = extra[x];
    this.blocks.push(this.block);
  };
  Doc.prototype.close = function () {
    this.br();
    var b = this.block; this.block = null;
    if (b) {
      var ns = b.spans.filter(function (sp) { return sp.n; }).map(function (sp) { return sp.n; });
      b.n0 = ns.length ? Math.min.apply(null, ns) : this.lines.length || 1;
      b.n1 = ns.length ? Math.max.apply(null, ns) : b.n0;
      if (!b.spans.length) this.blocks.splice(this.blocks.indexOf(b), 1);
    }
    var self = this;
    this.notes.forEach(function (nb) { self.blocks.push(nb); }); this.notes = [];
  };
  Doc.prototype.leaf = function (id, iiif) {
    if (!id) return;
    var b = this.block, t = b && b.t, rend = b && b.rend;
    this.close();
    id = id.replace(/^#/, '');
    this.lines.push('[' + id + ']');
    var n = this.lines.length, pb = { t: 'pb', facs: id, n0: n, n1: n, spans: [] };
    if (iiif) pb.iiif = { id: iiif, v: 3 };
    this.blocks.push(pb);
    if (t) this.open(t, { rend: rend, cont: true });
  };
  Doc.prototype.br = function () {
    var segs = this.cur; this.cur = [];
    if (!segs.length) return;
    if (!this.block) this.open('ab');
    var out = '', spans = [];
    segs.forEach(function (g) {
      if (!g.key) { var s = g.s.replace(/\s+/g, ' '); if (s.trim()) spans.push({ s: s, marks: g.marks, at: out.length }); return; }
      var c0 = -1;
      for (var i = 0; i < g.s.length; i++) {
        var ch = g.s[i];
        if (/\s/.test(ch)) { if (!out.length || out[out.length - 1] === ' ') continue; ch = ' '; }
        if (c0 < 0) c0 = out.length;
        out += ch;
      }
      if (!g.sig && c0 >= 0) spans.push({ s: out.slice(c0), marks: g.marks, c0: c0, c1: out.length });
    });
    if (out.slice(-1) === ' ') out = out.slice(0, -1);
    // the line, or the reading text's sentences: each a range of out
    var ranges = !out ? [] : this.split ? this.split(out) : [[0, out.length]];
    var base = this.lines.length, self = this;
    ranges.forEach(function (r) { self.lines.push(out.slice(r[0], r[1])); });
    spans.forEach(function (sp) {
      if (sp.c0 == null) { delete sp.at; self.block.spans.push(sp); return; }   // in the document only
      ranges.forEach(function (r, i) {
        var a = Math.max(sp.c0, r[0]), z = Math.min(sp.c1, r[1]);
        if (a >= z) return;
        self.block.spans.push({ s: out.slice(a, z), n: base + i + 1, c0: a - r[0], c1: z - r[0], marks: sp.marks });
      });
    });
  };
  Doc.prototype.result = function () { this.close(); return { text: this.lines.join('\n') + '\n', doc: { blocks: this.blocks } }; };

  // ---------- the manuscript ----------
  function ms(node, mode, D, marks, key, restored, svc) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { D.put(c.nodeValue, marks, key); continue; }
      if (c.nodeType !== 1) continue;
      var n = c.localName, other = OTHER[handOf(c)] && c.hasAttribute('hand'), m, inThis;
      // a break inside text this version does not hold (an addition, before revision) is a
      // space in the document, not a break in the version's lines
      if (n === 'lb') { if (key) D.br(); else D.put(' ', marks, false); }
      else if (n === 'pb') { var f = att(c, 'facs').replace(/^#/, ''); D.leaf(f, svc[f]); }
      else if (n === 'ab' && key) { D.open('ab', { rend: att(c, 'rend') }); ms(c, mode, D, marks, key, restored, svc); D.close(); }
      else if (n === 'metamark') {
        var fn = att(c, 'function');
        if (NOTEXT[fn]) continue;
        inThis = mode === 'diplomatic' || fn !== 'composition-information';
        ms(c, mode, D, fn ? marks.concat(mark('metamark', c, { function: fn })) : marks, key && inThis, restored, svc);
      }
      else if (n === 'add') {
        m = marks.concat(mark('added', c, { place: att(c, 'place'), rend: att(c, 'rend') }));
        inThis = mode === 'diplomatic' || mode === 'final' && !other;
        if (key && mode === 'diplomatic') D.sig('\\');
        ms(c, mode, D, m, key && inThis, restored, svc);
        if (key && mode === 'diplomatic') D.sig('/');
      }
      else if (n === 'del') {
        m = marks.concat(mark('erased', c, { rend: att(c, 'rend') }));
        inThis = mode === 'diplomatic' || mode === 'first' || restored || other;
        if (key && mode === 'diplomatic') D.sig('⟦');
        ms(c, mode, D, m, key && inThis, restored, svc);
        if (key && mode === 'diplomatic') D.sig('⟧');
      }
      else if (n === 'restore') ms(c, mode, D, marks.concat(mark('reinstated', c)), key, true, svc);
      else if (n === 'hi') ms(c, mode, D, att(c, 'rend') === 'restoration' ? marks : marks.concat(mark('hi', null, { rend: att(c, 'rend') })), key, restored, svc);
      else if (n === 'unclear') ms(c, mode, D, marks.concat(mark('uncertain', null, { resp: att(c, 'resp').replace(/^#/, '') })), key, restored, svc);
      else if (n === 'sic') ms(c, mode, D, marks.concat(mark('sic')), key, restored, svc);
      else if (n === 'note' || n === 'label' || n === 'milestone' || n === 'delSpan' || n === 'anchor') continue;
      else ms(c, mode, D, marks, key, restored, svc);
    }
  }

  // ---------- the reading text ----------
  // A paragraph divided into sentences, as ranges [start, end) of the line: at . ! or ? (with
  // any closing quotation mark or bracket) before a capital, a digit or an opening quotation
  // mark, except after a short abbreviation or an initial
  var ABBR = /(?:\b(?:Mr|Mrs|Dr|St|Capt|Lieut|Esq|No|vs|viz|Nov|Dec|Jan|Feb|Aug|Sept|Oct)|\b[A-Z])\.$/;
  function sentences(t) {
    var out = [], re = /([.!?]+["”’')\]]*)\s+(?=["“‘(\[]?[A-Z0-9])/g, last = 0, m;
    while ((m = re.exec(t))) {
      var end = m.index + m[1].length;
      if (ABBR.test(t.slice(last, end))) continue;
      out.push([last, end]); last = re.lastIndex;
    }
    out.push([last, t.length]);
    return out.filter(function (r) { return r[1] > r[0]; });
  }
  // a note's text as spans in the document, outside the lines
  function noteSpans(node, marks, out) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { var s = c.nodeValue.replace(/\s+/g, ' '); if (s) out.push({ s: s, marks: marks }); }
      else if (c.nodeType === 1) noteSpans(c, c.localName === 'hi' ? marks.concat({ k: 'hi', rend: att(c, 'rend') }) : marks, out);
    }
    return out;
  }
  var BLOCK = { p: 'p', head: 'head', l: 'l', ab: 'ab' };
  function rt(node, D, marks) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { D.put(c.nodeValue, marks, true); continue; }
      if (c.nodeType !== 1) continue;
      var n = c.localName;
      if (n === 'teiHeader' || n === 'orig') continue;
      if (n === 'note') {
        var sp = noteSpans(c, [], []);
        if (sp.length) { sp[0].s = sp[0].s.replace(/^ /, ''); D.notes.push({ t: 'note', id: att(c, 'xml:id') || c.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'id'), spans: sp }); }
      }
      else if (n === 'pb') D.leaf(att(c, 'corresp'), /^https?:/.test(att(c, 'facs')) ? att(c, 'facs') : '');
      else if (n === 'lb') D.br();
      else if (n === 'div' || n === 'lg') { D.br(); rt(c, D, marks); D.br(); }
      else if (BLOCK[n]) { D.open(BLOCK[n], { rend: att(c, 'rend') }); rt(c, D, marks); D.close(); }
      else if (n === 'choice') {
        var reg = all(c, 'reg')[0], orig = all(c, 'orig')[0];
        if (reg) rt(reg, D, marks.concat({ k: 'regularised', orig: orig ? orig.textContent : '' }));
      }
      else if (n === 'ref') rt(c, D, marks.concat({ k: 'ref', note: att(c, 'target').replace(/^#/, '') }));
      else if (n === 'hi') rt(c, D, marks.concat({ k: 'hi', rend: att(c, 'rend') }));
      else rt(c, D, marks);
    }
  }

  function body(d) { return all(d, 'body')[0]; }
  root.MelTEI = {
    // { text, doc }
    manuscript: function (xml, mode) {
      var d = parse(xml), D = new Doc();
      ms(body(d), mode || 'final', D, [], true, false, services(d));
      return D.result();
    },
    reading: function (xml) { var D = new Doc(sentences); rt(body(parse(xml)), D, []); return D.result(); },
    sentences: sentences, stageOf: function (c) { return stageOf({ getAttribute: function () { return c; } }); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
