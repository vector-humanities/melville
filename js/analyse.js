/*
 * analyse.js - lenses on a version, drawn in bench-kit's Analyse view (kit/lenses.js), which
 * gives each its heading, its menu (Text ▾), its modes and its export. Two lenses for prose:
 * the revisions on each leaf of the manuscript (counted in the diplomatic transcription,
 * where additions are \text/ and deletions ⟦text⟧), and the lines that contain a word. Each
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

  // ---------- for kit/lenses.js ----------
  SW.BENCH.lenses = {
    list: [[1, 'Revisions by leaf', 'Additions and deletions on each leaf of the manuscript'],
           [2, 'Words', 'The lines that contain a word or phrase']],
    menus: { text: [['', [1, 2]]] },
    one: { 1: revisions, 2: words },
    across: { 1: leavesAcross, 2: wordsAcross },
    acrossLabel: 'Across the versions'
  };
})(this);
