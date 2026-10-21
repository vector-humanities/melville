/*
 * compare-defs.js - this bench's second mode in Versions ▸ Collate (bench-kit's kit/compare.js): the
 * leaves each version marks ([img_5], indexed by core.js as a code bench indexes routines),
 * and whether the text on each leaf is the same, spacing and case aside.
 */
(function (root) {
  'use strict';
  var SW = root.SW;
  // A leaf's text: from its mark to the next leaf's in the same file, spacing and case aside.
  function routineText(b, s) {
    var ls = b.lines[s.p], end = ls.length;
    for (var n = s.n + 1; n <= ls.length; n++) if (b.kind[s.p + ':' + n] === 'def') { end = n - 1; break; }
    return ls.slice(s.n - 1, end).map(function (L) { return SW.parseLine(L.raw).code; }).join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  // leaves in the order of their images: img_9 before img_10
  function byLeaf(x, y) { return (parseInt(x.slice(4), 10) - parseInt(y.slice(4), 10)) || (x < y ? -1 : x > y ? 1 : 0); }
  function where(b, s) { return b.parts[s.p].src.split('/').pop() + ':' + s.n; }
  function routinesDiff(el, A, B, h) {
    var sa = A.sym || {}, sb = B.sym || {}, names = {};
    Object.keys(sa).concat(Object.keys(sb)).forEach(function (k) { names[k] = 1; });
    var srow = [], same = 0;
    Object.keys(names).sort(byLeaf).forEach(function (k) {
      var a = sa[k], x = sb[k];
      var st = !a ? 'only in ' + B.v.label : !x ? 'only in ' + A.v.label : routineText(A, a) !== routineText(B, x) ? 'changed' : '';
      if (!st) { same++; return; }
      srow.push([k, a ? where(A, a) : '', x ? where(B, x) : '', st]);
    });
    var pad = SW.el('div', { class: 'pad' });
    pad.innerHTML = '<h3>Leaves that differ</h3><p class="hint">' + Object.keys(names).length + ' leaves are marked in one or both; ' + same + ' have the same text in both (spacing and case set aside). The manuscript and the reading text divide a leaf’s text differently, so between them a leaf differs where its words do.</p>';
    pad.appendChild(SW.table(['Leaf', h.vl(A), h.vl(B), 'Change'], srow, { cls: ['mono', 'mono', 'mono', ''] }));
    el.appendChild(pad);
    return { crow: [], mrow: [], srow: srow };
  }

  SW.BENCH.compareDefs = {
    label: 'Leaves',
    by: 'leaf',                // Versions ▾: “Two versions collated: line by line and by leaf”
    render: function (el, A, B, h) { return routinesDiff(el, A, B, h); },
    doc: function (A, B, r, h) {
      return { title: A.v.label + ' and ' + B.v.label + ': leaves that differ', blocks: [SW.tableBlock('Leaves that differ', ['Leaf', h.vl(A), h.vl(B), 'Change'], r.srow)] };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
