/*
 * topics.js - topics by latent Dirichlet allocation (collapsed Gibbs sampling), seeded, for the Topics
 * lens (js/distant.js). Melville's until bench-kit's topics module is released; then the lens calls the
 * kit's and this file goes. As SW.topics:
 *   LDA(docs, o)      docs: arrays of words (stopwords already out); o: k (10), alpha (0.1), beta (0.01),
 *                     seed (1). { sweep(), result(n words), done() }
 *   ldaSync(docs, o)  o.iter sweeps (300), then the result
 *   lda(docs, o)      the same in steps of about 40 ms: o.progress(i, n), o.done(result); returns { cancel }
 * A result: { topics: [{ k, words: [[w, p]], share }], theta: docs × k, k, iterations, vocab }.
 */
(function (root) {
  'use strict';
  var K = {}, T = (root.SW && root.SW.textstats) || require('./textstats.js');
  function sum(xs) { var s = 0; for (var i = 0; i < xs.length; i++) s += xs[i]; return s; }
  // docs: arrays of words (stopwords already out). o: k (10), alpha (0.1), beta (0.01), seed (1)
  K.LDA = function (docs, o) {
    o = o || {};
    var K = o.k || 10, alpha = o.alpha || 0.1, beta = o.beta || 0.01, rand = T.rng(o.seed == null ? 1 : o.seed);
    var vocab = [], id = Object.create(null), W = [], Z = [];
    docs.forEach(function (d) { W.push(d.map(function (w) { if (!(w in id)) { id[w] = vocab.length; vocab.push(w); } return id[w]; })); });
    var V = vocab.length, nkw = new Int32Array(K * V), nk = new Int32Array(K), ndk = docs.map(function () { return new Int32Array(K); });
    W.forEach(function (d, di) {
      var z = new Int32Array(d.length);
      for (var i = 0; i < d.length; i++) { var k = Math.floor(rand() * K); z[i] = k; nkw[k * V + d[i]]++; nk[k]++; ndk[di][k]++; }
      Z.push(z);
    });
    var p = new Float64Array(K), done = 0;
    function sweep() {
      for (var di = 0; di < W.length; di++) {
        var d = W[di], z = Z[di], nd = ndk[di];
        for (var i = 0; i < d.length; i++) {
          var w = d[i], k = z[i];
          nkw[k * V + w]--; nk[k]--; nd[k]--;
          var s = 0;
          for (k = 0; k < K; k++) { s += (nd[k] + alpha) * (nkw[k * V + w] + beta) / (nk[k] + V * beta); p[k] = s; }
          var u = rand() * s;
          for (k = 0; k < K - 1 && p[k] < u; k++);
          z[i] = k; nkw[k * V + w]++; nk[k]++; nd[k]++;
        }
      }
      done++;
    }
    function result(n) {
      var topics = [];
      for (var k = 0; k < K; k++) {
        var ws = [];
        for (var w = 0; w < V; w++) if (nkw[k * V + w]) ws.push([vocab[w], (nkw[k * V + w] + beta) / (nk[k] + V * beta)]);
        ws.sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); });
        topics.push({ k: k, words: ws.slice(0, n || 20), share: 0 });
      }
      var theta = W.map(function (d, di) {
        var row = []; for (var k = 0; k < K; k++) row.push((ndk[di][k] + alpha) / (d.length + K * alpha)); return row;
      });
      var tok = sum(Array.prototype.slice.call(nk));
      topics.forEach(function (t) { t.share = tok ? nk[t.k] / tok : 0; });
      return { topics: topics, theta: theta, k: K, iterations: done, vocab: V };
    }
    return { sweep: sweep, result: result, done: function () { return done; } };
  };
  K.ldaSync = function (docs, o) { var m = K.LDA(docs, o), n = (o && o.iter) || 300; for (var i = 0; i < n; i++) m.sweep(); return m.result(o && o.words); };
  // in steps of about 40 ms: o.progress(i, n), o.done(result); returns { cancel }
  K.lda = function (docs, o) {
    o = o || {};
    var m = K.LDA(docs, o), n = o.iter || 300, stop = false;
    (function step() {
      if (stop) return;
      var t0 = Date.now();
      while (m.done() < n && Date.now() - t0 < 40) m.sweep();
      if (o.progress) o.progress(m.done(), n);
      if (m.done() < n) setTimeout(step, 0); else if (o.done) o.done(m.result(o.words));
    })();
    return { cancel: function () { stop = true; } };
  };

  if (root.SW) root.SW.topics = K;
  if (typeof module !== 'undefined' && module.exports) module.exports = K;
})(typeof window !== 'undefined' ? window : globalThis);
