/*
 * tei.js - the Melville Electronic Library's TEI read for the bench (root.MelTEI): each file
 * into lines, for Read and Collate, and into a document of blocks and spans (b.doc) for the
 * Book view, each span keyed to the line it sits on.
 *
 * The Billy Budd manuscript (xml/versions-of-billy-budd/bb-ms.xml, encoded in TextLab) in
 * three states:
 *   final       Melville's last readings: his additions kept, his deletions taken out, a
 *               deletion he reinstated (restore) kept, though not a deletion made within it
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
 * In the manuscript, an addition, deletion or reinstatement also carries an id (one revision,
 * however many spans it runs over), its medium (MEL's code from its rend: HMp, ink1 …) and the
 * zone of the leaf it is written in (zone); a deletion and addition MEL pairs in <subst> share a
 * mark { k: 'subst', id }. The manuscript's document gives the zones' boxes on the leaf image
 * (zones: { id: [ulx, uly, lrx, lry] }, in the pixels of the leaf as encoded), and each pb the
 * leaf's size (size: [w, h]). Where MEL notes that text on a leaf is transcribed with another
 * ("[See next leaf for transcription of text on this mount.]"), the pb carries it as
 * elsewhere: [{ to, note }], to being the leaf that holds the text.
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
  // revisions and substitutions are numbered as each manuscript is read
  var REV = 0, SUB = 0;
  var REVISION = { added: 1, erased: 1, reinstated: 1 };
  function mark(k, e, more) {
    var m = { k: k };
    if (e) {
      if (e.hasAttribute('hand')) { m.hand = handOf(e); if (rawHand(e) && !HANDS[rawHand(e)]) m.handAs = rawHand(e); }
      var c = stageOf(e); if (c) m.change = c;
      if (REVISION[k]) {
        m.id = ++REV;
        var md = /(?:^|\s)_(\w+)/.exec(att(e, 'rend')); if (md) m.medium = md[1];
        var z = att(e, 'facs').replace(/^#/, ''); if (z) m.zone = z;
      }
    }
    for (var x in more || {}) if (more[x]) m[x] = more[x];
    return m;
  }
  function xmlId(e) { return att(e, 'xml:id') || e.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'id'); }
  // the facsimile: a surface's ID to its IIIF image service and its size, and every zone's box
  function services(d) {
    var out = { zones: {} };
    Array.prototype.forEach.call(all(d, 'surface'), function (s) {
      var g = all(s, 'graphic')[0];
      if (g) out[xmlId(s)] = { url: att(g, 'url'), size: [+att(s, 'lrx') || 0, +att(s, 'lry') || 0] };
      Array.prototype.forEach.call(all(s, 'zone'), function (z) {
        out.zones[xmlId(z)] = [+att(z, 'ulx'), +att(z, 'uly'), +att(z, 'lrx'), +att(z, 'lry')];
      });
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
  // a note of MEL's that text on the leaf is transcribed elsewhere, kept on the leaf's pb
  Doc.prototype.elsewhere = function (note) {
    if (!this.pb) return;
    (this.pb.elsewhere = this.pb.elsewhere || []).push({ note: note });
  };
  Doc.prototype.leaf = function (id, iiif, size) {
    if (!id) return;
    var b = this.block, t = b && b.t, rend = b && b.rend;
    this.close();
    id = id.replace(/^#/, '');
    this.lines.push('[' + id + ']');
    var n = this.lines.length, pb = { t: 'pb', facs: id, n0: n, n1: n, spans: [] };
    if (iiif) pb.iiif = { id: iiif, v: 3 };
    if (size && size[0] && size[1]) pb.size = size;
    this.pb = pb;
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
      else if (n === 'pb') { var f = att(c, 'facs').replace(/^#/, ''), sv = svc[f] || {}; D.leaf(f, sv.url, sv.size); }
      else if (n === 'ab' && key) { D.open('ab', { rend: att(c, 'rend') }); ms(c, mode, D, marks, key, restored, svc); D.close(); }
      else if (n === 'metamark') {
        var fn = att(c, 'function');
        if (NOTEXT[fn]) continue;
        var said = /\[(?:See|Ed\. Note)[^\]]*transcription[^\]]*\]/i.exec(c.textContent);
        if (said) D.elsewhere(said[0]);
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
        // a restore reinstates the deletion it encloses, not one made inside that deletion
        m = marks.concat(mark('erased', c, { rend: att(c, 'rend') }));
        inThis = mode === 'diplomatic' || mode === 'first' || restored || other;
        if (key && mode === 'diplomatic') D.sig('⟦');
        ms(c, mode, D, m, key && inThis, false, svc);
        if (key && mode === 'diplomatic') D.sig('⟧');
      }
      else if (n === 'restore') ms(c, mode, D, marks.concat(mark('reinstated', c)), key, true, svc);
      else if (n === 'subst') ms(c, mode, D, marks.concat({ k: 'subst', id: ++SUB }), key, restored, svc);
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

  // the leaf each of MEL's notes points to: the next leaf; a leaf by its number ("see leaf 561");
  // or, for a chapter ("See Ch. 19 …"), the other image of the same leaf (img_521 and img_521b)
  function elsewhere(blocks) {
    var pbs = blocks.filter(function (b) { return b.t === 'pb'; }), ids = pbs.map(function (b) { return b.facs; });
    pbs.forEach(function (pb, i) {
      (pb.elsewhere || []).forEach(function (e) {
        var m;
        if (/next leaf/i.test(e.note)) e.to = ids[i + 1];
        else if ((m = /leaf (\d+\w?)/i.exec(e.note))) e.to = 'img_' + m[1];
        else if (/Ch\.\s*\d+/i.test(e.note)) e.to = /b$/.test(pb.facs) ? pb.facs.slice(0, -1) : pb.facs + 'b';
        if (e.to && ids.indexOf(e.to) < 0) delete e.to;
      });
    });
  }
  function body(d) { return all(d, 'body')[0]; }
  root.MelTEI = {
    // { text, doc }
    manuscript: function (xml, mode) {
      var d = parse(xml), D = new Doc(), svc = services(d);
      REV = 0; SUB = 0;
      ms(body(d), mode || 'final', D, [], true, false, svc);
      var r = D.result();
      r.doc.zones = svc.zones;
      elsewhere(r.doc.blocks);
      return r;
    },
    reading: function (xml) { var D = new Doc(sentences); rt(body(parse(xml)), D, []); return D.result(); },
    sentences: sentences, stageOf: function (c) { return stageOf({ getAttribute: function () { return c; } }); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
