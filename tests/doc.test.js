/*
 * doc.test.js - this bench's checks of the Book view's document (b.doc, made by js/tei.js), run
 * with bench-kit's tests by annotations.html. Loaded after kit/tests/run.js, so window.T is
 * there; the checks wait for the bench's scripts, then read every version from MEL (a network
 * connection is needed).
 */
(function () {
  'use strict';
  var T = window.T;
  function ready() {
    return new Promise(function (res) { (function wait() { if (window.SW && SW.build && window.SWVersions && window.MelTEI && SW.BENCH.doc) res(); else setTimeout(wait, 50); })(); });
  }
  T.later('the documents', function () {
    return ready().then(function () {
      var B = SW.BENCH, hands = {}, stages = {};
      B.hands.forEach(function (h) { hands[h.k] = 1; });
      B.doc.stages.forEach(function (s) { stages[s.id] = 1; });
      Object.keys(B.doc.unplaced).forEach(function (k) { stages[k] = 1; });
      var ids = ['ms-first', 'ms-final', 'ms-dipl', 'mel-rt'];
      return Promise.all(ids.map(function (id) { return SW.build(id); })).then(function (bs) {
        bs.forEach(function (b) {
          var id = b.v.id, bad = { text: [], range: [], leaf: [], gaps: [], hand: [], stage: [], held: [] };
          T.group('Document, ' + id);
          T.eq('a document for each file', (b.doc || []).filter(Boolean).length, b.parts.length);
          b.doc.forEach(function (d, p) {
            var lines = b.lines[p], covered = lines.map(function () { return []; });
            d.blocks.forEach(function (bl) {
              if (bl.t !== 'note' && !(bl.n0 >= 1 && bl.n1 >= bl.n0 && bl.n1 <= lines.length)) bad.range.push(p + ':' + bl.n0 + '-' + bl.n1);
              if (bl.t === 'pb' && lines[bl.n0 - 1].raw !== '[' + bl.facs + ']') bad.leaf.push(p + ':' + bl.n0);
              bl.spans.forEach(function (sp) {
                sp.marks.forEach(function (m) {
                  if (m.hand && !hands[m.hand]) bad.hand.push(m.hand);
                  if (m.change && !stages[m.change]) bad.stage.push(m.change);
                });
                if (sp.n == null) return;
                var L = lines[sp.n - 1];
                if (!L || L.raw.slice(sp.c0, sp.c1) !== sp.s) bad.text.push(p + ':' + sp.n);
                else covered[sp.n - 1].push([sp.c0, sp.c1]);
                if (sp.n < bl.n0 || sp.n > bl.n1) bad.range.push(p + ':' + sp.n + ' outside its block');
                // what each version holds: no addition before revision, no deletion after it,
                // unless reinstated or in another hand
                var k = sp.marks.map(function (m) { return m.k; });
                if (id === 'ms-first' && k.indexOf('added') >= 0) bad.held.push(p + ':' + sp.n + ' added');
                if (id === 'ms-final' && sp.marks.some(function (m) { return m.k === 'erased' && m.hand === 'HM'; }) && k.indexOf('reinstated') < 0) bad.held.push(p + ':' + sp.n + ' erased');
              });
            });
            // a line's text outside the spans is spaces, sigla or a leaf's mark only
            lines.forEach(function (L, i) {
              if (/^\[img_\w+\]$/.test(L.raw)) return;
              var rest = L.raw.split('');
              covered[i].forEach(function (r) { for (var c = r[0]; c < r[1]; c++) rest[c] = ''; });
              if (/[^\s\\/⟦⟧]/.test(rest.join(''))) bad.gaps.push(p + ':' + L.n);
            });
          });
          T.eq('each span is the text of its line at its offsets', bad.text.slice(0, 5), []);
          T.eq('each block’s lines are in the file, its spans within them', bad.range.slice(0, 5), []);
          T.eq('each leaf break is on its [img_N] line', bad.leaf.slice(0, 5), []);
          T.eq('no text in the lines outside the spans', bad.gaps.slice(0, 5), []);
          T.eq('every hand is one of SW.BENCH.hands', bad.hand.slice(0, 5), []);
          T.eq('every stage is listed, placed or unplaced', bad.stage.slice(0, 5), []);
          T.eq('the version’s lines hold what its state says', bad.held.slice(0, 5), []);
        });
        var first = bs[0].lines[0].map(function (L) { return L.raw; });
        T.group('Document, readings');
        T.yes('before revision: “some one signal”', first.some(function (t) { return /some one signal/.test(t); }));
        T.yes('the reading text: “neck—a conventional”, without the space inside MEL’s choice', bs[3].lines.some(function (ls) { return ls.some(function (L) { return /neck—a conventional/.test(L.raw); }); }));
      });
    });
  });
})();
