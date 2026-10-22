/*
 * analyse.js - lenses on a version, drawn in bench-kit's Analyse view (kit/lenses.js), which
 * gives each its heading, its menu (Text ▾), its modes and its export. Four lenses for prose:
 * the revisions on each leaf of the manuscript (counted in the diplomatic transcription,
 * where additions are \text/ and deletions ⟦text⟧), the lines that contain a word, how the
 * story grew (the words in each chapter at each stage of composition), and every revision with
 * its before and after, stage, hand and medium (from the manuscript's document, b.doc). Each
 * draws cards into the grid it is given and returns a function giving its export; one in
 * `across` reads every version at once. Keep the numbers stable, so that a lens can be named
 * in discussion ("lens 2").
 */
(function (root) {
  'use strict';
  var SW = root.SW, card = SW.lenses.card, wide = SW.lenses.wide, bars = SW.lenses.bars;

  function fileName(b, p) { return b.parts[p].src.split('/').pop(); }
  // a line's place, as a link into Read
  function where(b, p, n) { return { html: '<a href="#" data-go="' + p + ':' + n + '">' + SW.esc(fileName(b, p) + ':' + n) + '</a>', sort: p * 100000 + n, text: fileName(b, p) + ':' + n }; }
  function linkRows(el) {
    el.addEventListener('click', function (e) {
      var a = e.target.closest('[data-go]'); if (!a) return;
      e.preventDefault();
      var x = a.dataset.go.split(':'), p = +x[0], n = +x[1];
      SW.state.sel = { p: p, n0: n, n1: n }; SW.setTab('read'); SW.emit('goto', { p: p, n: n, tab: 'read' });
    });
  }
  function plain(rows) { return rows.map(function (r) { return r.map(function (c) { return c && c.text != null ? c.text : c; }); }); }
  function short(v) { return SW.refOf(v.id) + ' ' + v.label; }
  var LEAF = /^\[(img_\w+)\]$/;

  // ---------- 1 revisions by leaf ----------
  // additions and deletions on each leaf, from the diplomatic transcription
  function revisionsOf(b) {
    var out = [], cur = null;
    b.lines.forEach(function (ls, p) {
      ls.forEach(function (L) {
        var m = LEAF.exec(L.raw);
        if (m) { cur = { leaf: m[1], p: p, n: L.n, add: 0, del: 0, lines: 0 }; out.push(cur); return; }
        if (!cur) return;
        cur.lines++;
        cur.add += (L.raw.match(/\\[^\\/]*\//g) || []).length;
        cur.del += (L.raw.match(/⟦[^⟦⟧]*⟧/g) || []).length;
      });
    });
    return out;
  }
  function revisions(b, el) {
    var rows = [];
    var c = wide(card('Revisions by leaf', 'Additions and deletions on each leaf of the manuscript, counted in the diplomatic transcription (BB-MSD) whichever version is open. Sort by a column; click a leaf to read it there.'));
    var out = SW.el('p', { class: 'hint' }, 'Reading the diplomatic transcription…');
    c.appendChild(out); el.appendChild(c);
    SW.build('ms-dipl').then(function (d) {
      var rs = revisionsOf(d);
      rows = rs.map(function (r) { return [r.leaf, r.lines, r.add, r.del, r.add + r.del]; });
      var tbl = SW.table(['Leaf', 'Lines', 'Additions', 'Deletions', 'Revisions'], rs.map(function (r) {
        return [{ html: '<a href="#" data-leaf="' + r.p + ':' + r.n + '">' + SW.esc(r.leaf) + '</a>', text: r.leaf, sort: r.p * 100000 + r.n }, r.lines, r.add, r.del, r.add + r.del];
      }), { cls: ['mono', 'num', 'num', 'num', 'num'] });
      c.replaceChild(tbl, out);
      c.addEventListener('click', function (e) {
        var a = e.target.closest('[data-leaf]'); if (!a) return;
        e.preventDefault();
        var x = a.dataset.leaf.split(':');
        SW.openAt('ms-dipl', { p: +x[0], n0: +x[1] });
      });
      var top = rs.slice().sort(function (x, y) { return (y.add + y.del) - (x.add + x.del); }).slice(0, 15);
      var tc = card('Most revised leaves', 'The fifteen leaves with the most additions and deletions.');
      tc.insertAdjacentHTML('beforeend', bars(top.map(function (r) { return [r.leaf, r.add + r.del]; })));
      el.appendChild(tc);
    }).catch(function (err) { out.textContent = err.message; });
    return function () { return [SW.tableBlock('Revisions by leaf', ['Leaf', 'Lines', 'Additions', 'Deletions', 'Revisions'], rows)]; };
  }
  // which leaves each version marks: the reading text marks the leaves it is edited from
  function leavesAcross(vs, bs, el) {
    var all = {}, order = [];
    bs.forEach(function (b) { Object.keys(b.sym || {}).forEach(function (k) { if (!all[k]) { all[k] = 1; order.push(k); } }); });
    var rows = order.map(function (k) { return [k].concat(bs.map(function (b) { return b.sym && b.sym[k] ? '●' : '–'; })); });
    var head = ['Leaf'].concat(vs.map(function (v) { return SW.refOf(v.id); }));
    var c = wide(card('Leaves across the versions', order.length + ' leaves across ' + vs.length + ' versions: ● where a version marks the leaf, – where it does not.'));
    c.appendChild(SW.table(head, rows, { cls: ['mono'].concat(vs.map(function () { return 'num'; })) }));
    el.appendChild(c);
    return function () { return [SW.tableBlock('Leaves across the versions', head, rows)]; };
  }

  // ---------- 2 words ----------
  // the lines that contain a word or phrase (case aside), in this version or counted in each
  function finder(q) { return q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : null; }
  function words(b, el) {
    var rows = [];
    var c = wide(card('Words', 'Type a word or phrase to list the lines that contain it; click a place to read it in Read.'));
    var inp = SW.el('input', { type: 'search', placeholder: 'Find a word…', value: SW.store.get('an.wq', ''), style: 'width:260px' });
    var out = SW.el('div');
    c.appendChild(inp); c.appendChild(out); el.appendChild(c);
    function draw() {
      var q = inp.value.trim(), re = finder(q); SW.store.set('an.wq', inp.value);
      rows = [];
      if (re) b.lines.forEach(function (ls, p) { ls.forEach(function (L) { re.lastIndex = 0; if (re.test(L.raw)) rows.push([where(b, p, L.n), L.raw]); }); });
      out.innerHTML = '';
      out.appendChild(!re ? SW.el('p', { class: 'hint' }, 'Nothing typed yet.') : rows.length ? SW.table(['Where', 'Line'], rows, { cls: ['mono', ''] }) : SW.el('p', { class: 'hint' }, 'No line contains “' + q + '”.'));
    }
    inp.addEventListener('input', draw); draw(); linkRows(c);
    return function () { return [SW.tableBlock('Lines containing “' + inp.value.trim() + '”', ['Where', 'Line'], plain(rows))]; };
  }
  function wordsAcross(vs, bs, el) {
    var rows = [];
    var c = wide(card('Words across the versions', 'How often a word or phrase occurs in each version.'));
    var inp = SW.el('input', { type: 'search', placeholder: 'Find a word…', value: SW.store.get('an.wq', ''), style: 'width:260px' });
    var out = SW.el('div');
    c.appendChild(inp); c.appendChild(out); el.appendChild(c);
    function draw() {
      var re = finder(inp.value.trim()); SW.store.set('an.wq', inp.value);
      rows = vs.map(function (v, i) {
        var n = 0;
        if (re) bs[i].lines.forEach(function (ls) { ls.forEach(function (L) { n += (L.raw.match(re) || []).length; }); });
        return [short(v), n];
      });
      out.innerHTML = '';
      if (!re) { out.appendChild(SW.el('p', { class: 'hint' }, 'Nothing typed yet.')); return; }
      out.insertAdjacentHTML('beforeend', bars(rows));
      out.appendChild(SW.table(['Version', 'Occurrences'], rows, { cls: ['', 'num'] }));
    }
    inp.addEventListener('input', draw); draw();
    return function () { return [SW.tableBlock('“' + inp.value.trim() + '” across the versions', ['Version', 'Occurrences'], rows)]; };
  }

  // ---------- shared: the manuscript's document, and the leaves the reading text sets in each chapter ----------
  function msDoc() { return SW.build('ms-dipl').then(function (b) { return { b: b, doc: b.doc && b.doc[0] }; }); }
  function chapterLabel(src) {
    var f = src.split('/').pop().replace(/\.xml$/, '');
    var m = /^chapter-(\d+)$/.exec(f);
    return m ? 'Chapter ' + m[1] : f.replace(/-/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); });
  }
  // each leaf to the first chapter of the reading text that marks it
  function leafChapters() {
    return SW.build('mel-rt').then(function (rt) {
      var of = {}, order = [];
      rt.parts.forEach(function (pt, p) {
        var ch = chapterLabel(pt.src); order.push(ch);
        rt.lines[p].forEach(function (L) { var m = LEAF.exec(L.raw); if (m && !of[m[1]]) of[m[1]] = ch; });
      });
      return { of: of, order: order };
    });
  }
  function wordCount(t) { return (t.match(/[A-Za-z][A-Za-z’'-]*/g) || []).length; }
  var STAGES = ((SW.BENCH.doc || {}).stages || []).map(function (x) { return x.id; });

  // ---------- 3 how the story grew ----------
  // the words standing in each chapter at each stage, by Book's rule (SW.book.shownAt): before
  // revision, then at the end of each stage letter (B to G), or at every substage
  function grew(b, el) {
    var rows = [], head = [];
    var c = wide(card('How the story grew', 'The words standing in each chapter at each stage of composition, counted by the rule Book uses for its slider: Melville’s additions up to the stage in, his deletions up to it out. A leaf is counted in the chapter of the reading text that first marks it. The stages are Hayford and Sealts’s as MEL codes them; MEL’s codes outside that scheme count from the first stage, as in Book.'));
    var all = SW.el('label', { class: 'check' }); all.innerHTML = '<input type="checkbox"> every substage';
    var out = SW.el('div', null, 'Counting…');
    c.appendChild(all); c.appendChild(out); el.appendChild(c);
    var data = null;
    Promise.all([msDoc(), leafChapters()]).then(function (r) {
      var doc = r[0].doc, lc = r[1], K = SW.book, AT = K.stageMap(STAGES), hands = (SW.BENCH.doc || {}).stageHands || null;
      var spans = [], leaf = null;
      doc.blocks.forEach(function (bl) {
        if (bl.t === 'pb') { leaf = bl.facs; return; }
        bl.spans.forEach(function (sp) { spans.push({ ch: (leaf && lc.of[leaf]) || 'Not in the reading text', n: sp.n, s: sp.s, marks: sp.marks }); });
      });
      var chs = lc.order.filter(function (ch) { return spans.some(function (x) { return x.ch === ch; }); });
      if (spans.some(function (x) { return x.ch === 'Not in the reading text'; })) chs.push('Not in the reading text');
      // words in each chapter at each stage, 0 to the last
      var at = [];
      for (var st = 0; st <= STAGES.length; st++) {
        var text = {}, last = {};
        spans.forEach(function (x) {
          if (!K.shownAt(x.marks, st, AT, hands)) return;
          text[x.ch] = (text[x.ch] || '') + (last[x.ch] != null && x.n !== last[x.ch] ? ' ' : '') + x.s;
          last[x.ch] = x.n;
        });
        at.push(chs.map(function (ch) { return wordCount(text[ch] || ''); }));
      }
      data = { chs: chs, at: at };
      draw();
    }).catch(function (e) { out.textContent = e.message; });
    function cols() {
      if (all.querySelector('input').checked) return STAGES.map(function (id, i) { return [id, i + 1]; });
      // the last substage of each letter
      var by = {}; STAGES.forEach(function (id, i) { by[id[0]] = i + 1; });
      return Object.keys(by).sort().map(function (L) { return [L, by[L]]; });
    }
    function draw() {
      if (!data) return;
      var cs = [['before', 0]].concat(cols());
      head = ['Chapter'].concat(cs.map(function (x) { return x[0]; }));
      var max = 0;
      rows = data.chs.map(function (ch, i) {
        return [ch].concat(cs.map(function (x, k) {
          var v = data.at[x[1]][i], prev = k ? data.at[cs[k - 1][1]][i] : v, d = v - prev;
          max = Math.max(max, Math.abs(d));
          return { v: v, d: d };
        }));
      });
      var tot = ['All'].concat(cs.map(function (x) { var v = data.at[x[1]].reduce(function (a, b) { return a + b; }, 0); return { v: v, d: 0 }; }));
      var show = rows.concat([tot]).map(function (r) {
        return [r[0]].concat(r.slice(1).map(function (x) {
          var t = Math.min(1, Math.abs(x.d) / (max || 1)), bg = x.d > 0 ? 'rgba(47,107,69,' + (0.08 + 0.4 * t).toFixed(2) + ')' : x.d < 0 ? 'rgba(155,47,34,' + (0.08 + 0.4 * t).toFixed(2) + ')' : 'transparent';
          return { html: '<span title="' + (x.d > 0 ? '+' : '') + x.d + ' from the column before" style="display:block;background:' + bg + ';padding:0 4px">' + x.v + '</span>', sort: x.v, text: x.v };
        }));
      });
      out.innerHTML = '';
      out.appendChild(SW.table(head, show, { cls: ['', ].concat(head.slice(1).map(function () { return 'num'; })) }));
      out.appendChild(SW.el('p', { class: 'hint' }, 'Green: words gained since the column before; red: words lost. Hover a figure for the change.'));
    }
    all.addEventListener('change', draw);
    return function () { return [SW.tableBlock('How the story grew: words standing in each chapter at each stage', head, plain(rows.map(function (r) { return [r[0]].concat(r.slice(1).map(function (x) { return x.v; })); })))]; };
  }

  // ---------- 4 the revisions ----------
  // one row a revision: a replacement (a deletion and addition MEL pairs in <subst>, or a deletion
  // followed directly by an addition of the same stage), an addition, a deletion, a reinstatement;
  // its text as written, where it is, its stage, hand and medium
  function lexicon(b, el) {
    var all = [], shown = [];
    var c = wide(card('Revisions', 'Every revision in the manuscript: replacements, additions, deletions and reinstatements, with the text as written (revisions made within it in the diplomatic signs, ⟦deleted⟧ and \\added/), the leaf and line (click to read it there), the stage, the hand and the medium (MEL’s code from the encoding: HMp, ink1 …). A replacement is a deletion and addition MEL pairs, or a deletion followed directly by an addition of the same stage.'));
    var bar = SW.el('div', { class: 'toolbar' });
    bar.innerHTML = '<input type="search" placeholder="Find in the revisions…" style="width:240px"> <select data-f="type"><option value="">every kind</option><option>replacement</option><option>addition</option><option>deletion</option><option>reinstatement</option></select> <select data-f="stage"><option value="">every stage</option>' + STAGES.map(function (id) { return '<option>' + id + '</option>'; }).join('') + '<option value="?">not placed</option></select> <select data-f="hand"><option value="">every hand</option>' + (SW.BENCH.hands || []).map(function (h) { return '<option value="' + h.k + '">' + SW.esc(h.who) + '</option>'; }).join('') + '</select>';
    var out = SW.el('div', null, 'Gathering the revisions…');
    c.appendChild(bar); c.appendChild(out); el.appendChild(c);
    var who = {}; (SW.BENCH.hands || []).forEach(function (h) { who[h.k] = h.who; });
    msDoc().then(function (r) {
      var doc = r.doc, revs = {}, order = [], seq = [], leaf = null;
      doc.blocks.forEach(function (bl) {
        if (bl.t === 'pb') { leaf = bl.facs; return; }
        bl.spans.forEach(function (sp) {
          var i = seq.length; seq.push(sp);
          var sub = null;
          sp.marks.forEach(function (m, j) {
            if (m.k === 'subst') sub = m.id;
            if (m.id == null || m.k === 'subst') return;
            var R = revs[m.id];
            if (!R) { R = revs[m.id] = { m: m, sub: sub, text: '', last: null, first: i, end: i, leaf: leaf, n: sp.n }; order.push(R); }
            // the revisions made within this one, in the diplomatic signs: ⟦deleted⟧, \added/
            var open = '', close = '';
            sp.marks.slice(j + 1).forEach(function (x) {
              if (x.k === 'erased') { open += '⟦'; close = '⟧' + close; }
              else if (x.k === 'added') { open += '\\'; close = '/' + close; }
            });
            R.text += (R.last != null && sp.n !== R.last ? ' ' : '') + open + sp.s + close; R.last = sp.n; R.end = i;
          });
        });
      });
      // one sign for a run: ⟦vain⟧⟦glory⟧ is ⟦vainglory⟧
      order.forEach(function (R) { R.text = R.text.replace(/⟧⟦/g, '').replace(/\/\\/g, ''); });
      function gapEmpty(a, z) { for (var i = a + 1; i < z; i++) if (/\S/.test(seq[i].s) && !seq[i].marks.some(function (m) { return m.id != null; })) return false; return true; }
      var used = {};
      order.forEach(function (R, i) {
        if (used[R.m.id]) return;
        var kind = { added: 'addition', erased: 'deletion', reinstated: 'reinstatement' }[R.m.k], before = '', after = '';
        if (R.m.k === 'erased') {
          // its addition: the one MEL pairs with it, or the next revision, an addition of its stage
          var A = order.filter(function (X) { return X !== R && R.sub != null && X.sub === R.sub && X.m.k === 'added'; })[0];
          if (!A) { var X = order[i + 1]; if (X && X.m.k === 'added' && X.m.change === R.m.change && X.first > R.end && gapEmpty(R.end, X.first)) A = X; }
          before = R.text.trim();
          if (A) { used[A.m.id] = 1; kind = 'replacement'; after = A.text.trim(); }
        } else if (R.m.k === 'added') after = R.text.trim();
        else before = R.text.trim();
        var placed = R.m.change && STAGES.indexOf(R.m.change) >= 0;
        all.push({ kind: kind, before: before, after: after, stage: R.m.change || '', placed: placed, hand: R.m.hand || 'HM', medium: R.m.medium || R.m.handAs || '', leaf: R.leaf || '', n: R.n, ord: i });
      });
      draw();
    }).catch(function (e) { out.textContent = e.message; });
    function draw() {
      var q = SW.$('input', bar).value.trim().toLowerCase(), f = {};
      SW.$$('select', bar).forEach(function (x) { f[x.dataset.f] = x.value; });
      shown = all.filter(function (x) {
        if (f.type && x.kind !== f.type) return false;
        if (f.stage === '?' ? x.placed : f.stage && x.stage !== f.stage) return false;
        if (f.hand && x.hand !== f.hand) return false;
        return !q || (x.before + ' ' + x.after).toLowerCase().indexOf(q) >= 0;
      });
      var counts = {}; all.forEach(function (x) { counts[x.kind] = (counts[x.kind] || 0) + 1; });
      var LIMIT = 400, rows = shown.slice(0, LIMIT).map(function (x) {
        return [x.kind, x.before, x.after, x.stage || '–', who[x.hand] || x.hand, x.medium,
          { html: '<a href="#" data-at="' + x.n + '">' + SW.esc(x.leaf + ', line ' + x.n) + '</a>', sort: x.ord, text: x.leaf + ':' + x.n }];
      });
      out.innerHTML = '';
      out.appendChild(SW.el('p', { class: 'hint' }, all.length + ' revisions: ' + ['replacement', 'addition', 'deletion', 'reinstatement'].map(function (k) { return (counts[k] || 0) + ' ' + k + 's'; }).join(', ') + '. Showing ' + Math.min(LIMIT, shown.length) + ' of the ' + shown.length + ' that match; search or filter to narrow them.'));
      out.appendChild(SW.table(['Kind', 'Before', 'After', 'Stage', 'Hand', 'Medium', 'Where'], rows, { cls: ['', '', '', 'mono', '', 'mono', 'mono'] }));
    }
    bar.addEventListener('input', draw); bar.addEventListener('change', draw);
    out.addEventListener('click', function (e) {
      var a = e.target.closest('[data-at]'); if (!a) return;
      e.preventDefault(); SW.openAt('ms-dipl', { p: 0, n0: +a.dataset.at });
    });
    return function () { return [SW.tableBlock('Revisions in the manuscript', ['Kind', 'Before', 'After', 'Stage', 'Hand', 'Medium', 'Leaf', 'Line'], shown.map(function (x) { return [x.kind, x.before, x.after, x.stage, who[x.hand] || x.hand, x.medium, x.leaf, x.n]; }))]; };
  }

  // ---------- for kit/lenses.js ----------
  SW.BENCH.lenses = {
    list: [[1, 'Revisions by leaf', 'Additions and deletions on each leaf of the manuscript'],
           [2, 'Words', 'The lines that contain a word or phrase'],
           [3, 'How the story grew', 'The words standing in each chapter at each stage of composition'],
           [4, 'Revisions', 'Every revision: before and after, stage, hand and medium']],
    menus: { text: [['', [1, 2, 3, 4]]] },
    one: { 1: revisions, 2: words, 3: grew, 4: lexicon },
    across: { 1: leavesAcross, 2: wordsAcross },
    acrossLabel: 'Across the versions'
  };
})(this);
