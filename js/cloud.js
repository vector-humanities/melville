/*
 * cloud.js - a word cloud, for the Word cloud lens (js/distant.js). Melville's until bench-kit's word
 * cloud is released; then the lens calls the kit's and this file goes. As SW.cloud:
 *   cloud(items, o)   items: [{ w, n, fill?, title? }]. o: width (760), height (420), min (11) and max (60)
 *                     font sizes, seed, font, scale (the count that takes the largest size: the items'
 *                     largest by default), places (an earlier layout's: each word drawn at its place, its
 *                     size scaled by its count here; words without a place are left out), faint (a word
 *                     with no count here drawn faintly at its place), measure(w, size, font, weight),
 *                     and the format: weight ('bold'), caps (words in capitals), upright (the share of
 *                     words turned upright, 0 to 1), shape ('rect', 'oval' or 'round'), pad (the space
 *                     round each word, 4), contrast ('log', 'sqrt' or 'linear': size by the log of the
 *                     count, its square root, or the count). An item's alpha (0 to 1) is its opacity.
 *                     { svg, places: { w: { x, y, w, h, size, up } }, dropped, drawn }
 *   measure(w, size, font, weight)   a word's width: on a canvas where there is one, estimated where not
 *   FONTS   the fonts the lens offers, { id: [name, CSS font-family] }
 * Words are placed largest first, each on an Archimedean spiral from the centre to the first box free of
 * the others (a grid of cells finds them) and inside the shape. The SVG is coloured by the theme's tokens.
 */
(function (root) {
  'use strict';
  var T = {}, TS = (root.SW && root.SW.textstats) || require('./textstats.js');
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var FONT = 'Georgia, "Times New Roman", serif', ctx = null;
  T.FONTS = {
    serif: ['Georgia', FONT],
    old: ['Old style', '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", serif'],
    sans: ['Sans serif', '"Helvetica Neue", Helvetica, Arial, sans-serif'],
    mono: ['Typewriter', '"American Typewriter", "Courier New", Courier, monospace']
  };
  // a word's width at a size: measured on a canvas where there is one, estimated where there is not (node)
  T.measure = function (w, size, font, weight) {
    if (typeof document !== 'undefined') {
      if (!ctx) ctx = document.createElement('canvas').getContext('2d');
      ctx.font = (weight || 'normal') + ' ' + size + 'px ' + (font || FONT);
      return ctx.measureText(w).width;
    }
    return w.length * size * 0.52;
  };

  // items: [{ w, n, fill?, alpha?, title? }]. o: as above.
  T.cloud = function (items, o) {
    o = o || {};
    var W = o.width || 760, H = o.height || 420, lo = o.min || 11, hi = o.max || 60, font = o.font || FONT, measure = o.measure || T.measure;
    var weight = o.weight || 'normal', pad = o.pad == null ? 4 : o.pad, shape = o.shape || 'rect', contrast = o.contrast || 'sqrt';
    // a smaller shape, smaller words: sizes scaled by the square root of its share of the rectangle
    var fit = shape === 'round' ? Math.sqrt(Math.PI * H / (4 * W)) : shape === 'oval' ? Math.sqrt(Math.PI / 4) : 1;
    lo *= Math.max(fit, 0.8); hi *= fit;
    var maxN = o.scale || items.reduce(function (m, x) { return Math.max(m, x.n); }, 1);
    function size(n) {
      if (!(n > 0)) return 0;
      var f = contrast === 'linear' ? n / maxN : contrast === 'log' ? Math.log(1 + n) / Math.log(1 + maxN) : Math.sqrt(n / maxN);
      return lo + (hi - lo) * Math.min(1, f);
    }
    function label(w) { return o.caps ? w.toUpperCase() : w; }
    // a box inside the shape: the rectangle, the ellipse within it, or the circle of its height
    function inside(b) {
      if (b.x < 2 || b.y < 2 || b.x + b.w > W - 2 || b.y + b.h > H - 2) return false;
      if (shape === 'rect') return true;
      var rx = shape === 'round' ? H / 2 - 2 : W / 2 - 2, ry = H / 2 - 2;
      return [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].every(function (p) {
        var dx = (p[0] - W / 2) / rx, dy = (p[1] - H / 2) / ry; return dx * dx + dy * dy <= 1;
      });
    }
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
        var th = rand() * Math.PI * 2, up = rand() < (o.upright || 0), ok = null, ax = shape === 'round' ? 1 : Math.max(1, (W / H) * 0.9);
        var bw = measure(label(it.w), s, font, weight) + pad, bh = s * (1 + 0.04 * pad);
        if (up) { var t = bw; bw = bh; bh = t; }
        // an Archimedean spiral (r = 0.8θ), walked in steps of about 2 px along its length
        for (var a = 0, r = 0; r < Math.max(W, H); a += Math.min(0.5, 2 / Math.max(r, 1)), r = 0.8 * a) {
          var cx = W / 2 + r * Math.cos(th + a) * ax, cy = H / 2 + r * Math.sin(th + a);
          var b = { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
          if (!inside(b)) continue;
          if (!hits(b)) { ok = b; break; }
        }
        if (!ok) { dropped.push(it.w); return; }
        boxes.push(ok); cells(ok, function (key) { (grid[key] = grid[key] || []).push(ok); });
        places[it.w] = { x: ok.x + ok.w / 2, y: ok.y + ok.h / 2, w: ok.w, h: ok.h, size: s, up: up };
      });
    }
    var by = Object.create(null); items.forEach(function (it) { by[it.w] = it; });
    var out = [];
    function at(P) { var x = P.x.toFixed(1), y = P.y.toFixed(1); return 'x="' + x + '" y="' + y + '"' + (P.up ? ' transform="rotate(-90 ' + x + ' ' + y + ')"' : ''); }
    Object.keys(places).forEach(function (w) {
      var P = places[w], it = by[w], s = it ? Math.min(P.size, size(it.n)) : 0;
      if (!s) {
        if (o.faint) out.push('<text ' + at(P) + ' font-size="' + (P.size * 0.45).toFixed(1) + '" fill="var(--line)" text-anchor="middle" dominant-baseline="central" data-w="' + esc(w) + '">' + esc(label(w)) + '</text>');
        return;
      }
      drawn.push(w);
      var a = it.alpha != null && it.alpha < 1 ? ' fill-opacity="' + it.alpha.toFixed(2) + '"' : '';
      out.push('<text ' + at(P) + ' font-size="' + s.toFixed(1) + '" fill="' + (it.fill || 'var(--text)') + '"' + a + ' text-anchor="middle" dominant-baseline="central" data-w="' + esc(w) + '"><title>' + esc(it.title || w + ': ' + it.n) + '</title>' + esc(label(w)) + '</text>');
    });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="ts-cloud" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" font-family="' + esc(font) + '"' + (weight !== 'normal' ? ' font-weight="' + weight + '"' : '') + '>' + out.join('') + '</svg>';
    return { svg: svg, places: places, dropped: dropped, drawn: drawn };
  };

  if (root.SW) root.SW.cloud = T;
  if (typeof module !== 'undefined' && module.exports) module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
