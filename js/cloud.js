/*
 * cloud.js - a word cloud, for the Word cloud lens (js/distant.js). Melville's until bench-kit's word
 * cloud is released; then the lens calls the kit's and this file goes. As SW.cloud:
 *   cloud(items, o)   items: [{ w, n, fill?, title? }]. o: width (760), height (420), min (11) and max (60)
 *                     font sizes, seed, font, scale (the count that takes the largest size: the items'
 *                     largest by default), places (an earlier layout's: each word drawn at its place, its
 *                     size scaled by its count here; words without a place are left out), faint (a word
 *                     with no count here drawn faintly at its place), measure(w, size, font).
 *                     { svg, places: { w: { x, y, w, h, size } }, dropped, drawn }
 *   measure(w, size, font)   a word's width: on a canvas where there is one, estimated where not (node)
 * Words are placed largest first, each on an Archimedean spiral from the centre to the first box free of
 * the others (a grid of cells finds them). The SVG is coloured by the theme's tokens.
 */
(function (root) {
  'use strict';
  var T = {}, TS = (root.SW && root.SW.textstats) || require('./textstats.js');
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var FONT = 'Georgia, "Times New Roman", serif', ctx = null;
  // a word's width at a size: measured on a canvas where there is one, estimated where there is not (node)
  T.measure = function (w, size, font) {
    if (typeof document !== 'undefined') {
      if (!ctx) ctx = document.createElement('canvas').getContext('2d');
      ctx.font = size + 'px ' + (font || FONT);
      return ctx.measureText(w).width;
    }
    return w.length * size * 0.52;
  };

  // items: [{ w, n, fill?, title? }]. o: width (760), height (420), min (11) and max (60) font sizes, seed,
  // font, scale (the count that takes the largest size: the items' largest by default), places (an
  // earlier layout's: each word drawn at its place, its size scaled by its count here; words without a
  // place are left out), faint (draw a word with no count here faintly at its place).
  // { svg, places: { w: { x, y, w, h, size } }, dropped: [words that did not fit] }
  T.cloud = function (items, o) {
    o = o || {};
    var W = o.width || 760, H = o.height || 420, lo = o.min || 11, hi = o.max || 60, font = o.font || FONT, measure = o.measure || T.measure;
    var maxN = o.scale || items.reduce(function (m, x) { return Math.max(m, x.n); }, 1);
    function size(n) { return n > 0 ? lo + (hi - lo) * Math.sqrt(n / maxN) : 0; }
    var places = o.places ? o.places : {}, dropped = [], drawn = [];
    if (!o.places) {
      var rand = TS.rng(o.seed == null ? 11 : o.seed), boxes = [], CELL = 24, grid = Object.create(null);
      var cols = Math.ceil(W / CELL);
      function cells(b, f) {
        for (var gy = Math.floor(b.y / CELL); gy <= Math.floor((b.y + b.h) / CELL); gy++)
          for (var gx = Math.floor(b.x / CELL); gx <= Math.floor((b.x + b.w) / CELL); gx++) if (f(gy * cols + gx) === false) return false;
        return true;
      }
      function hits(b) {
        return !cells(b, function (key) {
          var L = grid[key]; if (!L) return true;
          for (var i = 0; i < L.length; i++) { var a = L[i]; if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) return false; }
          return true;
        });
      }
      items.slice().sort(function (a, b) { return b.n - a.n || (a.w < b.w ? -1 : 1); }).forEach(function (it) {
        var s = size(it.n); if (!s) return;
        var bw = measure(it.w, s, font) + 4, bh = s * 1.16, th = rand() * Math.PI * 2, ok = null, ax = Math.max(1, (W / H) * 0.9);
        // an Archimedean spiral (r = 0.8θ), walked in steps of about 2 px along its length
        for (var a = 0, r = 0; r < Math.max(W, H); a += Math.min(0.5, 2 / Math.max(r, 1)), r = 0.8 * a) {
          var cx = W / 2 + r * Math.cos(th + a) * ax, cy = H / 2 + r * Math.sin(th + a);
          var b = { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
          if (b.x < 2 || b.y < 2 || b.x + b.w > W - 2 || b.y + b.h > H - 2) continue;
          if (!hits(b)) { ok = b; break; }
        }
        if (!ok) { dropped.push(it.w); return; }
        boxes.push(ok); cells(ok, function (key) { (grid[key] = grid[key] || []).push(ok); });
        places[it.w] = { x: ok.x + ok.w / 2, y: ok.y + ok.h / 2, w: ok.w, h: ok.h, size: s };
      });
    }
    var by = Object.create(null); items.forEach(function (it) { by[it.w] = it; });
    var out = [];
    Object.keys(places).forEach(function (w) {
      var P = places[w], it = by[w], s = it ? Math.min(P.size, size(it.n)) : 0;
      if (!s) {
        if (o.faint) out.push('<text x="' + P.x.toFixed(1) + '" y="' + P.y.toFixed(1) + '" font-size="' + (P.size * 0.45).toFixed(1) + '" fill="var(--line)" text-anchor="middle" dominant-baseline="central" data-w="' + esc(w) + '">' + esc(w) + '</text>');
        return;
      }
      drawn.push(w);
      out.push('<text x="' + P.x.toFixed(1) + '" y="' + P.y.toFixed(1) + '" font-size="' + s.toFixed(1) + '" fill="' + (it.fill || 'var(--text)') + '" text-anchor="middle" dominant-baseline="central" data-w="' + esc(w) + '"><title>' + esc(it.title || w + ': ' + it.n) + '</title>' + esc(w) + '</text>');
    });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="ts-cloud" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" font-family="' + esc(font) + '">' + out.join('') + '</svg>';
    return { svg: svg, places: places, dropped: dropped, drawn: drawn };
  };

  if (root.SW) root.SW.cloud = T;
  if (typeof module !== 'undefined' && module.exports) module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
