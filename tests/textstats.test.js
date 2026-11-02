/*
 * textstats.test.js - checks of js/textstats.js (to become bench-kit's) on small fixed texts, worked by
 * hand: the words, log-likelihood and the Mann-Whitney ρ, Delta's nearest text, principal components,
 * the type-token ratio, Yule's K, Heaps' growth, sentences and collocates; and of the bench's js/topics.js
 * (the same topics for the same seed) and js/cloud.js (a word kept in its place from step to step).
 * Loaded after kit/tests/run.js, by annotations.html; the checks wait for the bench's scripts.
 */
(function () {
  'use strict';
  var T = window.T;
  function ready() {
    return new Promise(function (res) { (function wait() { if (window.SW && SW.textstats && SW.topics && SW.cloud) res(); else setTimeout(wait, 50); })(); });
  }
  function r(x, d) { var p = Math.pow(10, d == null ? 4 : d); return Math.round(x * p) / p; }
  T.later('text statistics', function () {
    return ready().then(function () {
      var S = SW.textstats, eq = T.eq;
      T.group('Text statistics: words');
      eq('lower-cased, curly apostrophes straightened, the possessive taken off', S.tokens('The sailor’s hat; Billy\'s ship'), ['the', 'sailor', 'hat', 'billy', 'ship']);
      eq('the possessive kept when asked', S.tokens('Billy’s', { possessive: true }), ["billy's"]);
      eq('case kept when asked', S.tokens('Vere', { keepCase: true }), ['Vere']);
      eq('stopwords left out of the counts', S.counts(['the', 'sea', 'the', 'ship'], S.stopSet()), (function () { var c = Object.create(null); c.sea = 1; c.ship = 1; return c; })());
      eq('the top words, ties in alphabetical order', S.top({ b: 2, a: 2, c: 5 }), [['c', 5], ['a', 2], ['b', 2]]);
      eq('a short last chunk joins the one before', S.chunks([1, 2, 3, 4, 5, 6, 7], 3).map(function (c) { return c.length; }), [3, 4]);

      T.group('Text statistics: what sets two texts apart');
      // 10 and 2 in 1,000 words each: E = 6, G² = 2 (10 ln 10/6 + 2 ln 2/6) = 5.8221
      eq('G², worked by hand', r(S.g2(10, 2, 1000, 1000)), 5.8221);
      eq('G² negative where the second text has more', r(S.g2(2, 10, 1000, 1000)), -5.8221);
      eq('G² 0 where the rates are equal', S.g2(5, 10, 1000, 2000), 0);
      // 3,4,5 against 1,2,3: 2.5 + 3 + 3 of 9 pairs
      eq('ρ, worked by hand, a tie counted half', r(S.rho([3, 4, 5], [1, 2, 3])), r(8.5 / 9));
      eq('ρ 0.5 where the sets are the same', S.rho([1, 2], [1, 2]), 0.5);
      var k = S.keyness({ sea: 10, ship: 2 }, { sea: 2, ship: 10 });
      eq('keyness: most over-represented in the first text first', [k[0].w, k[k.length - 1].w], ['sea', 'ship']);

      T.group('Text statistics: stylometry');
      var d = S.delta([['a', 'b', 'a', 'c'], ['a', 'b', 'a', 'd'], ['x', 'y', 'z', 'x']], { n: 6 });
      eq('Delta: the nearest of three texts', [S.nearest(d.m, 0), S.nearest(d.m, 2)], [1, 0]);
      eq('Delta of a text with itself is 0', d.m[1][1], 0);
      eq('Delta is symmetric', r(d.m[0][2]), r(d.m[2][0]));
      var pc = S.pca([[1, 2], [2, 4], [3, 6], [4, 8]], 2);
      eq('principal components: points on a line, all the variance on the first', r(pc.variance[0], 3), 1);
      var lr = S.logistic([[1, 0], [2, 0], [0, 1], [0, 2], [1.5, 0.1], [0.1, 1.5]], [1, 1, 0, 0, 1, 0], { folds: 3 });
      eq('a model of the difference: separable sets held out and placed', lr.accuracy, 1);

      T.group('Text statistics: regularities');
      // windows of 2 over a a b c: 1/2, 1, 1
      eq('MATTR, worked by hand', r(S.mattr(['a', 'a', 'b', 'c'], 2)), r(2.5 / 3));
      eq('MATTR of a text shorter than the window is its TTR', S.mattr(['a', 'a'], 5), 0.5);
      // a a b c: N 4, Σ f² 6, K = 10⁴ (6 − 4) / 16
      eq('Yule’s K, worked by hand', S.yuleK(S.counts(['a', 'a', 'b', 'c'])), 1250);
      eq('Heaps: distinct words as the text is read', S.heaps(['a', 'b', 'a', 'c'], 2), [[2, 2], [4, 3]]);
      eq('hapax and dis legomena', S.hapax(S.counts(['a', 'a', 'b', 'c'])), { hapax: 2, dis: 1 });
      eq('Zipf: rank and count', S.zipf({ a: 3, b: 1 }), [[1, 3], [2, 1]]);
      eq('a fit of a line', r(S.fit([[0, 1], [1, 3], [2, 5]]).slope), 2);
      eq('sentence lengths, closing quotes kept with their sentence', S.sentences('He went. She said "no!" Then? fine'), [2, 3, 1, 1]);
      var co = S.collocates('the old sea and the old ship and the new sea'.split(' '), 'old', { window: 1, min: 1 });
      eq('collocates: occurrences, and the words beside them', [co.hits, co.list.map(function (x) { return x.w; }).sort()], [2, ['sea', 'ship', 'the']]);

      T.group('Topics (js/topics.js)');
      var docs = [['ship', 'sea', 'sail', 'sea', 'ship'], ['law', 'court', 'law', 'judge'], ['sea', 'ship', 'sail'], ['court', 'judge', 'law']];
      var a = SW.topics.ldaSync(docs, { k: 2, iter: 200, seed: 5 }), b = SW.topics.ldaSync(docs, { k: 2, iter: 200, seed: 5 });
      eq('the same topics for the same seed', JSON.stringify(a.topics), JSON.stringify(b.topics));
      eq('two topics that keep the sea and the court apart', a.topics.map(function (t) { return t.words.slice(0, 3).map(function (x) { return x[0]; }).sort().join(' '); }).sort(), ['court judge law', 'sail sea ship']);
      eq('each document’s mixture sums to 1', a.theta.map(function (row) { return r(row[0] + row[1]); }), [1, 1, 1, 1]);

      T.group('Word cloud (js/cloud.js)');
      function measure(w, s) { return w.length * s * 0.5; }
      var first = SW.cloud.cloud([{ w: 'sea', n: 10 }, { w: 'ship', n: 5 }, { w: 'sail', n: 2 }], { measure: measure, seed: 3 });
      eq('every word placed', first.dropped, []);
      var again = SW.cloud.cloud([{ w: 'sea', n: 10 }, { w: 'ship', n: 5 }, { w: 'sail', n: 2 }], { measure: measure, seed: 3 });
      eq('the same layout for the same seed', JSON.stringify(again.places), JSON.stringify(first.places));
      var step = SW.cloud.cloud([{ w: 'sea', n: 4 }, { w: 'ship', n: 5 }], { places: first.places, scale: 10, measure: measure });
      var at = /<text x="([\d.]+)" y="([\d.]+)"[^>]*data-w="sea"/.exec(step.svg);
      eq('a word kept in its place at the next step', at ? [+at[1], +at[2]] : null, [+first.places.sea.x.toFixed(1), +first.places.sea.y.toFixed(1)]);
      eq('a word with no count at the next step not drawn', step.drawn.sort(), ['sea', 'ship']);
      var size = /data-w="sea"/.test(step.svg) && +/font-size="([\d.]+)"[^>]*data-w="sea"/.exec(step.svg)[1];
      eq('drawn smaller where its count is lower', size < first.places.sea.size, true);
      var many = 'sea ship sail mast deck hold keel boom spar yard helm rope'.split(' ').map(function (w, i) { return { w: w, n: 20 - i }; });
      var up = SW.cloud.cloud(many, { measure: measure, upright: 1 });
      eq('all upright: every word turned, its box taller than wide', Object.keys(up.places).every(function (w) { var P = up.places[w]; return P.up && P.h > P.w; }) && /rotate\(-90 /.test(up.svg), true);
      var round = SW.cloud.cloud(many, { measure: measure, shape: 'round', width: 760, height: 420 });
      eq('round: every box inside the circle of the height', Object.keys(round.places).every(function (w) {
        var P = round.places[w], R = 208;
        return [[-1, -1], [1, -1], [-1, 1], [1, 1]].every(function (s) { var dx = P.x + s[0] * P.w / 2 - 380, dy = P.y + s[1] * P.h / 2 - 210; return dx * dx + dy * dy <= R * R + 1; });
      }), true);
      var caps = SW.cloud.cloud([{ w: 'sea', n: 3, alpha: 0.5 }], { measure: measure, caps: true, weight: 'bold' });
      eq('capitals, bold and an opacity drawn; the word kept for its link', [/>SEA<\/text>/.test(caps.svg), /font-weight="bold"/.test(caps.svg), /fill-opacity="0.50"/.test(caps.svg), /data-w="sea"/.test(caps.svg)], [true, true, true, true]);
      var flat = SW.cloud.cloud([{ w: 'sea', n: 100 }, { w: 'ship', n: 1 }], { measure: measure, contrast: 'log' }), steep = SW.cloud.cloud([{ w: 'sea', n: 100 }, { w: 'ship', n: 1 }], { measure: measure, contrast: 'linear' });
      eq('sizes closer together by the log of the count, further apart by the count', flat.places.ship.size > steep.places.ship.size, true);
    });
  });
})();
