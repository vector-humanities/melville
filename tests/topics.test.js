/*
 * topics.test.js - checks of the documents the kit's topics are made from (SW.BENCH.topics.documents):
 * every word in one document, the same ids when made again, chapters, stages and the leaves outside
 * the reading text. The topics engine, the text statistics and the word cloud are the kit's, checked by
 * kit/tests/run.js. Loaded after it, by annotations.html; the checks wait for the bench's scripts.
 */
(function () {
  'use strict';
  var T = window.T;
  function ready() {
    return new Promise(function (res) { (function wait() { if (window.SW && SW.textstats && SW.topics) res(); else setTimeout(wait, 50); })(); });
  }
  // the documents the kit's topics are made from (SW.BENCH.topics.documents, in js/distant.js)
  T.later('topics: documents', function () {
    function ids(d) { return d.map(function (x) { return x.id; }); }
    function count(d) { return d.reduce(function (n, x) { return n + x.tokens.length; }, 0); }
    function unique(d) { return ids(d).filter(function (x, i, a) { return a.indexOf(x) === i; }).length === d.length; }
    var D = function (o) { return SW.BENCH.topics.documents(o); }, last;
    // the documents need the whole bench: Book's stages (kit/book.js loads after js/distant.js) and its builds
    function bench() {
      return new Promise(function (res) { (function wait() { if (window.SW && SW.book && SW.book.stageMap && SW.build && SW.BENCH && SW.BENCH.topics && SW.distant) res(); else setTimeout(wait, 50); })(); });
    }
    return ready().then(bench).then(function () {
      last = (SW.BENCH.doc.stages || []).length;
      return Promise.all([D({ set: 'reading' }), D({ set: 'reading' }), SW.build('mel-rt').then(SW.distant.chaptersOf), D({ set: 'stage', stage: 0 }), D({ set: 'stage', stage: 0 }), D({ set: 'stage', stage: last }), SW.distant.stageStates()]);
    }).then(function (R) {
      var eq = T.eq, rt = R[0], st0 = R[3], stN = R[5], TS = SW.textstats;
      T.group('Topics: documents of the reading text');
      eq('every word of the reading text in exactly one document', count(rt), R[2].toks.length);
      eq('the same ids when made again', ids(R[1]), ids(rt));
      eq('ids unique', unique(rt), true);
      eq('chunks of 200 to 600 words', rt.every(function (x) { return x.tokens.length >= 200 || rt.filter(function (y) { return y.meta.chapterLabel === x.meta.chapterLabel; }).length === 1; }) && rt.every(function (x) { return x.tokens.length < 600; }), true);
      var c12 = rt.filter(function (x) { return x.meta.chapterLabel === 'Chapter 12'; });
      eq('a chapter’s number and label, and its id', [c12[0].meta.chapter, c12[0].id], [12, 'rt-c12-1']);
      eq('in reading order', rt.map(function (x) { return x.meta.seq; }).join(), rt.map(function (x, i) { return i; }).join());
      eq('no document outside the reading text', rt.some(function (x) { return x.meta.chapter == null && /^Chapter/.test(x.meta.chapterLabel); }), false);
      T.group('Topics: documents of the manuscript at a stage');
      eq('before revision: every word in exactly one document', count(st0), TS.total(R[6].counts[0]));
      eq('at the last stage: every word in exactly one document', count(stN), TS.total(R[6].counts[last]));
      eq('the same ids when made again', ids(R[4]), ids(st0));
      eq('ids unique, and named for the stage', unique(stN) && stN.every(function (x) { return x.id.indexOf('st' + last + '-') === 0 && x.meta.stage === last; }), true);
      var x = stN.filter(function (d) { return d.meta.chapterLabel === 'Not in the reading text'; });
      eq('leaves not in the reading text kept, as their own', x.length > 0 && x.every(function (d) { return d.meta.chapter === null && /-x-/.test(d.id); }), true);
      var said = st0.concat(stN).map(function (d) { return d.tokens.join(' '); }).join(' ');
      eq('notes on the composition left out (MEL’s, as “[See leaf image 499 …]”, and Melville’s memos)', [/leaf image/.test(said), /superseded by text on leaf/.test(said), /saturday nov/.test(said)], [false, false, false]);
      eq('each document names the version its lines are in', [rt.every(function (d) { return d.meta.v === 'mel-rt'; }), stN.every(function (d) { return d.meta.v === 'ms-dipl'; })], [true, true]);
      eq('a passage’s words as the documents have them', SW.BENCH.topics.tokens('Billy’s ship, ⟦the sea⟧'), ['billy', 'ship', 'the', 'sea']);
      var src = SW.BENCH.topics.source();
      eq('the source recorded with a model: the bench’s version and MEL at its pinned commit', [src.bench === SW.VERSION, src.sources[0].name, /^[0-9a-f]{40}$/.test(src.sources[0].commit), src.sources[0].commit === SWVersions.MEL.commit], [true, 'MEL', true, true]);
      return D({ set: 'stage', stage: last + 1 }).then(function () { eq('a stage past the last refused', 'given', 'refused'); }, function (e) { eq('a stage past the last refused', /No stage/.test(e.message), true); });
    });
  });
})();
