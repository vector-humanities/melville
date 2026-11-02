/*
 * topics.test.js - checks of the bench's js/topics.js on a small fixed text: the same topics for the same
 * seed, two topics that keep two vocabularies apart, and each document's mixture summing to 1. The text
 * statistics and the word cloud are the kit's, checked by kit/tests/run.js. Loaded after it, by
 * annotations.html; the checks wait for the bench's scripts.
 */
(function () {
  'use strict';
  var T = window.T;
  function ready() {
    return new Promise(function (res) { (function wait() { if (window.SW && SW.textstats && SW.topics) res(); else setTimeout(wait, 50); })(); });
  }
  function r(x, d) { var p = Math.pow(10, d == null ? 4 : d); return Math.round(x * p) / p; }
  T.later('topics', function () {
    return ready().then(function () {
      var eq = T.eq;
      T.group('Topics (js/topics.js)');
      var docs = [['ship', 'sea', 'sail', 'sea', 'ship'], ['law', 'court', 'law', 'judge'], ['sea', 'ship', 'sail'], ['court', 'judge', 'law']];
      var a = SW.topics.ldaSync(docs, { k: 2, iter: 200, seed: 5 }), b = SW.topics.ldaSync(docs, { k: 2, iter: 200, seed: 5 });
      eq('the same topics for the same seed', JSON.stringify(a.topics), JSON.stringify(b.topics));
      eq('two topics that keep the sea and the court apart', a.topics.map(function (t) { return t.words.slice(0, 3).map(function (x) { return x[0]; }).sort().join(' '); }).sort(), ['court judge law', 'sail sea ship']);
      eq('each document’s mixture sums to 1', a.theta.map(function (row) { return r(row[0] + row[1]); }), [1, 1, 1, 1]);
    });
  });
})();
