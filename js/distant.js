/*
 * distant.js - lenses of distant reading on Billy Budd, added to those of js/analyse.js in Text ▾ (kit/lenses.js
 * draws them). The methods are the kit's: kit/textstats.js, kit/wordcloud.js and the dictionary (SW.dict);
 * topics are the kit's Topics tab (kit/topics.js), made from the documents at the foot of this file. A
 * version is read in its chapters: the reading text's files (MEL's editor's note left out), or for the
 * manuscript its leaves, each in the chapter of the reading text that first marks it. The stages are the
 * manuscript's, by Book's rule (SW.book.shownAt), whichever version is open.
 *   5  Word frequencies         9  Trends                    13 Words added and erased
 *   6  Word cloud               10 Collocates                14 Rare words (bench-kit's SW.dict)
 *   7  Distinctive words        11 Vocabulary                15 A model of the difference
 *   8  (Topics: now the Topics tab) 12 Stylometry
 * Keep the numbers stable, so that a lens can be named in discussion.
 */
(function (root) {
  'use strict';
  var SW = root.SW, TS = SW.textstats, card = SW.lenses.card, wide = SW.lenses.wide, bars = SW.lenses.bars, esc = SW.esc, fmt = TS.fmt;
  var LEAF = /^\[(img_\w+)\]$/, NOT_RT = 'Not in the reading text';
  var STAGES = ((SW.BENCH.doc || {}).stages || []).map(function (x) { return x.id; });
  function stop() { return TS.stopSet((SW.BENCH.textstats || {}).stopwords); }
  function per10k(n, N) { return N ? +(1e4 * n / N).toFixed(2) : 0; }
  function el(tag, attrs, html) { return SW.el(tag, attrs, html); }
  function opt(v, label, on) { return '<option value="' + esc(v) + '"' + (on ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function svgBox(svg, cls) { var d = el('div', { class: 'ds-fig' + (cls ? ' ' + cls : '') }); d.innerHTML = SW.displaySVG(svg); return d; }
  function keep(k, v) { if (v === undefined) return SW.store.get('ds.' + k, null); SW.store.set('ds.' + k, v); return v; }
  // the Words lens (2) on a word
  function toWord(w) { SW.store.set('an.wq', w); SW.openLens(2); }

  // ---------- the chapters of a version ----------
  function chapterLabel(src) {
    var f = src.split('/').pop().replace(/\.xml$/, ''), m = /^chapter-(\d+)$/.exec(f);
    return m ? 'Chapter ' + m[1] : f.replace(/-/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); });
  }
  function shortLabel(l) {
    var m = /^Chapter (\d+)$/.exec(l);
    return m ? m[1] : { 'Dedication': 'Ded.', 'Billy in the darbies': 'Darbies', 'Draft chapter': 'Draft ch.', 'Draft preface': 'Draft pref.' }[l] || (l === NOT_RT ? 'Not RT' : l);
  }
  var lcP = null;
  function leafChapters() {
    if (!lcP) lcP = SW.build('mel-rt').then(function (rt) {
      var of = {}, order = [];
      rt.parts.forEach(function (pt, p) {
        var ch = chapterLabel(pt.src); order.push(ch);
        rt.lines[p].forEach(function (L) { var m = LEAF.exec(L.raw); if (m && !of[m[1]]) of[m[1]] = ch; });
      });
      return { of: of, order: order };
    });
    return lcP;
  }
  // [{ label, short, toks, cased, at (each token's line: [p, n]), text, words }], and the whole: { chs, toks, at, cased }
  var chCache = {};
  function chaptersOf(b) {
    var id = b.v.id;
    if (chCache[id]) return chCache[id];
    chCache[id] = leafChapters().then(function (lc) {
      var by = {}, order = [];
      function ch(label) { if (!by[label]) { by[label] = { label: label, short: shortLabel(label), toks: [], cased: [], at: [], text: [] }; order.push(label); } return by[label]; }
      var many = b.parts.length > 1;
      b.parts.forEach(function (pt, p) {
        if (/editors-note\.xml$/.test(pt.src)) return;            // MEL's, not Melville's
        var cur = many ? ch(chapterLabel(pt.src)) : null;
        b.lines[p].forEach(function (L) {
          var m = LEAF.exec(L.raw);
          if (m) { if (!many) cur = ch(lc.of[m[1]] || NOT_RT); return; }
          if (!cur) cur = ch(many ? chapterLabel(pt.src) : NOT_RT);
          var raw = L.raw.replace(/[⟦⟧\\/]/g, ''), ts = TS.tokens(raw, { keepCase: true });
          cur.text.push(raw);
          for (var i = 0; i < ts.length; i++) { cur.cased.push(ts[i]); cur.toks.push(ts[i].toLowerCase()); cur.at.push([p, L.n]); }
        });
      });
      // the reading text's order of chapters; leaves not in it last
      var rank = {}; lc.order.forEach(function (l, i) { rank[l] = i; });
      if (!many) order.sort(function (a, x) { return (a in rank ? rank[a] : 999) - (x in rank ? rank[x] : 999); });
      var chs = order.map(function (l) { var c = by[l]; c.text = c.text.join(' '); c.words = c.toks.length; return c; }).filter(function (c) { return c.words; });
      var all = { chs: chs, toks: [], at: [], cased: [] };
      chs.forEach(function (c) { c.from = all.toks.length; all.toks = all.toks.concat(c.toks); all.at = all.at.concat(c.at); all.cased = all.cased.concat(c.cased); });
      return all;
    });
    chCache[id].catch(function () { delete chCache[id]; });
    return chCache[id];
  }
  function lineLink(p, n, label) { return '<a href="#" data-go="' + p + ':' + n + '">' + esc(label) + '</a>'; }
  function linkLines(elm) {
    elm.addEventListener('click', function (e) {
      var a = e.target.closest('[data-go]');
      if (a) {
        e.preventDefault();
        var x = a.dataset.go.split(':'), p = +x[0], n = +x[1];
        SW.state.sel = { p: p, n0: n, n1: n }; SW.setTab('read'); SW.emit('goto', { p: p, n: n, tab: 'read' });
        return;
      }
      var w = e.target.closest('[data-word]');
      if (w) { e.preventDefault(); toWord(w.dataset.word); }
    });
  }
  function wordLink(w, label) { return '<a href="#" data-word="' + esc(w) + '" title="The lines with “' + esc(w) + '” (lens 2)">' + esc(label || w) + '</a>'; }
  function wait(c, text) { var p = el('p', { class: 'hint' }, text || 'Reading…'); c.appendChild(p); return p; }

  // ---------- the manuscript's stages: the words standing at each ----------
  // Melville's text at a stage leaves out what the diplomatic transcription holds beside it: notes on the
  // composition (metamarks of function composition-information: MEL's bracketed notes, as "[See leaf
  // image 499 …]", and Melville's own memos and dates), as the bench's readings of the manuscript (MS1,
  // MS) leave them out (js/tei.js)
  function ofTheWork(sp) { return !sp.marks.some(function (m) { return m.k === 'metamark' && m.function === 'composition-information'; }); }
  var stP = null;
  function stageStates() {
    if (!stP) stP = SW.build('ms-dipl').then(function (b) {
      var doc = b.doc && b.doc[0], K = SW.book, AT = K.stageMap(STAGES), hands = (SW.BENCH.doc || {}).stageHands || null, spans = [];
      doc.blocks.forEach(function (bl) { if (bl.t !== 'pb') bl.spans.forEach(function (sp) { spans.push(sp); }); });
      var counts = [];
      for (var st = 0; st <= STAGES.length; st++) {
        var parts = [], last = null;
        spans.forEach(function (sp) {
          if (!K.shownAt(sp.marks, st, AT, hands) || !ofTheWork(sp)) return;
          parts.push((last != null && sp.n !== last ? ' ' : '') + sp.s); last = sp.n;
        });
        counts.push(TS.counts(TS.tokens(parts.join('').replace(/[⟦⟧\\/]/g, ''))));
      }
      return { counts: counts, doc: doc };
    });
    stP.catch(function () { stP = null; });
    return stP;
  }
  // the states stepped through: before revision, then the end of each stage letter, or every substage
  function stageSteps(every) {
    var out = [['Before revision', 0]];
    if (every) STAGES.forEach(function (id, i) { out.push(['Stage ' + id, i + 1]); });
    else { var by = {}; STAGES.forEach(function (id, i) { by[id[0]] = i + 1; }); Object.keys(by).sort().forEach(function (L) { out.push(['Stage ' + L, by[L]]); }); }
    return out;
  }
  function diff(a, b) { var d = Object.create(null), w; for (w in b) { var x = b[w] - (a[w] || 0); if (x) d[w] = x; } for (w in a) if (!(w in b)) d[w] = -a[w]; return d; }

  // ---------- 5 word frequencies ----------
  function freqs(b, el0) {
    var rows = [];
    var c = wide(card('Word frequencies', 'The words of this version by how often they occur, overall or in a chapter, with their rate per 10,000 words. Click a word for the lines that contain it.'));
    var bar = el('div', { class: 'toolbar ds-bar' });
    var out = el('div');
    c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    var w8 = wait(out);
    chaptersOf(b).then(function (all) {
      w8.remove();
      bar.innerHTML = '<select data-k="ch"><option value="">The whole text</option>' + all.chs.map(function (ch, i) { return opt(i, ch.label); }).join('') + '</select> <label class="check"><input type="checkbox" data-k="stop"' + (keep('stop') !== false ? ' checked' : '') + '> leave out common words</label> <select data-k="n">' + [50, 100, 250, 1000].map(function (n) { return opt(n, n + ' words', n === 100); }).join('') + '</select>';
      function draw() {
        var ci = SW.$('[data-k="ch"]', bar).value, st = SW.$('[data-k="stop"]', bar).checked, n = +SW.$('[data-k="n"]', bar).value;
        keep('stop', st);
        var toks = ci === '' ? all.toks : all.chs[+ci].toks, N = toks.length, cs = TS.counts(toks, st ? stop() : null), top = TS.top(cs, n);
        var types = Object.keys(TS.counts(toks)).length;
        rows = top.map(function (x, i) { return [i + 1, { html: wordLink(x[0]), text: x[0], sort: x[0] }, x[1], per10k(x[1], N)]; });
        out.innerHTML = '';
        out.appendChild(el('p', { class: 'hint' }, N.toLocaleString('en-GB') + ' words, ' + types.toLocaleString('en-GB') + ' distinct.'));
        var g = el('div', { class: 'ds-two' });
        var t = el('div', { class: 'scroll' }); t.appendChild(SW.table(['Rank', 'Word', 'Count', 'Per 10,000'], rows, { cls: ['num', '', 'num', 'num'] }));
        var bw = el('div'); bw.innerHTML = bars(top.slice(0, 25).map(function (x) { return [x[0], x[1]]; }));
        g.appendChild(t); g.appendChild(bw); out.appendChild(g);
      }
      bar.addEventListener('change', draw); draw();
    }).catch(function (e) { w8.textContent = e.message; });
    linkLines(c);
    return function () { return [SW.tableBlock('Word frequencies', ['Rank', 'Word', 'Count', 'Per 10,000'], rows)]; };
  }
  function freqsAcross(vs, bs, el0) {
    var rows = [], head = [];
    var c = wide(card('Word frequencies across the versions', 'The most frequent words of all the versions together, at their rate per 10,000 words in each. The manuscript’s diplomatic transcription holds both readings of each revision.'));
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<label class="check"><input type="checkbox" data-k="stop"' + (keep('stop') !== false ? ' checked' : '') + '> leave out common words</label>';
    var out = el('div'); c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    Promise.all(bs.map(chaptersOf)).then(function (alls) {
      function draw() {
        var st = SW.$('input', bar).checked, S = st ? stop() : null; keep('stop', st);
        var cs = alls.map(function (a) { return TS.counts(a.toks, S); }), sum = Object.create(null);
        cs.forEach(function (x) { for (var w in x) sum[w] = (sum[w] || 0) + x[w]; });
        head = ['Word'].concat(vs.map(function (v) { return SW.refOf(v.id); }));
        rows = TS.top(sum, 60).map(function (x) { return [{ html: wordLink(x[0]), text: x[0], sort: x[0] }].concat(cs.map(function (cc, i) { return per10k(cc[x[0]] || 0, alls[i].toks.length); })); });
        out.innerHTML = ''; var t = el('div', { class: 'scroll' }); t.appendChild(SW.table(head, rows, { cls: [''].concat(vs.map(function () { return 'num'; })) })); out.appendChild(t);
      }
      bar.addEventListener('change', draw); draw();
    });
    linkLines(c);
    return function () { return [SW.tableBlock('Word frequencies per 10,000 words', head, rows)]; };
  }

  // ---------- 6 word cloud ----------
  // a shared cloud's settings, read as the page loads (the bench rewrites the address once it starts) and
  // used the first time the lens opens
  var SHARED = SW.readQuery().cloud || '';
  function cloudLens(b, el0) {
    var cur = { svg: '', rows: [], label: '' };
    var c = wide(card('Word cloud', 'The most frequent words, sized by count.'));
    var how = el('details', { class: 'ds-fmt' });
    how.innerHTML = '<summary>How it works</summary><p class="hint">Step through the chapters, or the manuscript’s stages: the words standing at each stage, or those added or erased in it. Green is more than at the step before, red fewer. With “keep each word in its place”, words hold their positions and only their size changes. Click a word for its lines.</p>';
    c.appendChild(how);
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<select data-k="src">' + opt('whole', 'The whole text') + opt('chapters', 'Chapter by chapter') + opt('stages', 'Stage by stage (the manuscript)') + '</select> ' +
      '<select data-k="mode">' + opt('standing', 'the words standing') + opt('added', 'the words added') + opt('erased', 'the words erased') + '</select> ' +
      '<label class="check"><input type="checkbox" data-k="every"> every substage</label> ' +
      '<select data-k="n">' + [40, 80, 150].map(function (n) { return opt(n, n + ' words'); }).join('') + '</select> ';
    // the view: the kit's look and details (its control: Look, ⚙, Default View) and this lens's own part,
    // kept from visit to visit; a shared cloud (?cloud=…) opens as it was shared, and is kept only once
    // the reader changes something in it
    var DEF = { src: 'chapters', mode: 'standing', every: 0, stable: 0, stop: 1, n: 80, step: 0 };
    var linked = SHARED ? SW.wordcloud.decode(SHARED) : null, step0 = 0;
    SHARED = '';
    var more = el('div', { class: 'ds-more' });
    more.innerHTML = '<label class="check"><input type="checkbox" data-k="stable"> keep each word in its place</label><br>' +
      '<label class="check"><input type="checkbox" data-k="stop"> leave out common words</label>';
    function v(k) { var x = SW.$('[data-k="' + k + '"]', bar) || SW.$('[data-k="' + k + '"]', more); return x.type === 'checkbox' ? x.checked : x.value; }
    function stepAt() { var st = SW.$('.ts-step', stepWrap); return st ? st.value() : 0; }
    function viewGet() { return { src: v('src'), mode: v('mode'), every: v('every') ? 1 : 0, stable: v('stable') ? 1 : 0, stop: v('stop') ? 1 : 0, n: +v('n'), step: stepAt() }; }
    function viewSet(x) {
      x = Object.assign({}, DEF, x);
      [['src', x.src], ['mode', x.mode], ['every', !!+x.every], ['stable', !!+x.stable], ['stop', !!+x.stop], ['n', String(x.n)]].forEach(function (y) {
        var e = SW.$('[data-k="' + y[0] + '"]', bar) || SW.$('[data-k="' + y[0] + '"]', more); if (e.type === 'checkbox') e.checked = y[1]; else e.value = y[1];
      });
      step0 = +x.step || 0; layout = null; prepare();
    }
    var frame = SW.wordcloud.frame({ name: function () { return 'word-cloud-' + String(cur.label).toLowerCase().replace(/[^a-z0-9]+/g, '-'); }, ref: function () { return SW.refsOf([b.v.id]); } });
    var F = null;
    var ctl = SW.wordcloud.control({ key: 'ds.cloud', value: linked && linked.format, frame: frame, more: more,
      view: { defaults: DEF, get: viewGet, set: viewSet }, colours: [['change', 'by change from the step before']],
      change: function (f) { F = f; linked = null; layout = null; redraw(); } });
    F = ctl.value();
    bar.appendChild(ctl);
    bar.insertAdjacentHTML('beforeend', ' <button type="button" class="btn" data-k="share" title="Share a link to this cloud, at this step and with this look">' + SW.SHARE_ICON + ' Share</button>');
    var stepWrap = el('div', { class: 'ds-stepwrap' }), fig = el('div', { class: 'ds-cloud' }), cmp = el('div', { class: 'ds-cmp' });
    c.appendChild(bar); c.appendChild(stepWrap); c.appendChild(fig); c.appendChild(cmp); el0.appendChild(c);
    var data = null, layout = null, layoutKey = '';
    function show(k, on) { SW.$('[data-k="' + k + '"]', bar).closest(k === 'mode' ? 'select' : 'label').hidden = !on; }
    var gen = 0;
    function prepare() {
      var s = v('src'), g = ++gen;
      show('mode', s === 'stages'); show('every', s === 'stages');
      fig.innerHTML = ''; cmp.innerHTML = ''; stepWrap.innerHTML = '';
      var w8 = wait(fig, s === 'stages' ? 'Reading the manuscript at each stage…' : 'Reading…');
      var P = s === 'stages' ? stageStates().then(function (S) {
        var steps = stageSteps(v('every')), mode = v('mode');
        return steps.map(function (st, i) {
          var now = S.counts[st[1]], before = i ? S.counts[steps[i - 1][1]] : null;
          if (mode === 'standing') return { label: st[0], counts: now, prev: before };
          if (!i) return { label: st[0], counts: mode === 'added' ? Object.create(null) : Object.create(null), prev: null, note: 'Nothing is ' + mode + ' before revision: step on to a stage.' };
          var d = diff(before, now), out = Object.create(null);
          for (var w in d) if (mode === 'added' ? d[w] > 0 : d[w] < 0) out[w] = Math.abs(d[w]);
          return { label: st[0], counts: out, fill: mode === 'added' ? 'var(--green)' : 'var(--red)' };
        });
      }) : chaptersOf(b).then(function (all) {
        if (s === 'whole') return [{ label: 'The whole text', counts: TS.counts(all.toks) }];
        return all.chs.map(function (ch, i) { return { label: ch.label, counts: TS.counts(ch.toks), prev: i ? TS.counts(all.chs[i - 1].toks) : null, rel: true }; });
      });
      P.then(function (steps) {
        if (g !== gen) return;   // a later choice has taken over
        w8.remove(); data = steps; layout = null;
        if (steps.length > 1) {
          var at = Math.min(step0, steps.length - 1);
          var sp = TS.stepper({ labels: steps.map(function (x) { return x.label; }), value: at, title: 'Step', change: draw });
          stepWrap.appendChild(sp);
          step0 = 0;
          draw(at);
        } else draw(0);
      }).catch(function (e) { w8.textContent = e.message; });
    }
    function filtered(cs) { var S = v('stop') ? stop() : null, o = Object.create(null); for (var w in cs) if (!(S && S[w]) && w.length > 1) o[w] = cs[w]; return o; }
    function draw(i) {
      if (!data) return;
      var stp = data[i], n = +v('n'), cs = filtered(stp.counts), top = TS.top(cs, n), stable = v('stable') && data.length > 1;
      var prev = stp.prev ? filtered(stp.prev) : null;
      // chapters differ in length: compared by rate
      var N = TS.total(stp.counts) || 1, Np = stp.prev ? TS.total(stp.prev) || 1 : 1;
      // this lens's own colouring: the words added or erased, and the change from the step before
      function colour(x) {
        if (stp.fill) return stp.fill;
        if (F.colour !== 'change') return null;
        if (!prev) return 'var(--text)';
        var a = stp.rel ? (cs[x.w] || 0) / N : cs[x.w] || 0, z = stp.rel ? (prev[x.w] || 0) / Np : prev[x.w] || 0;
        return a > z * 1.0001 ? 'var(--green)' : a < z * 0.9999 ? 'var(--red)' : 'var(--text)';
      }
      var o = Object.assign({ width: 880, height: 440, seed: 11 }, SW.wordcloud.options(F));
      if (stable) {
        var key = [v('src'), v('mode'), v('every'), v('stop'), n, JSON.stringify(SW.wordcloud.options(F))].join('|');
        if (layoutKey !== key || !layout) {
          // the layout: every word in any step's top n, at its largest count over the steps
          var mx = Object.create(null);
          data.forEach(function (d) { TS.top(filtered(d.counts), n).forEach(function (x) { mx[x[0]] = Math.max(mx[x[0]] || 0, x[1]); }); });
          var big = TS.top(mx, Math.round(n * 1.8));
          var scale = big.length ? big[0][1] : 1;
          layout = { scale: scale, r: SW.wordcloud.cloud(big.map(function (x) { return { w: x[0], n: x[1] }; }), Object.assign({}, o, { max: 54 })) };
          layoutKey = key;
        }
        o.places = layout.r.places; o.scale = layout.scale; o.max = 54;
      }
      var items = SW.wordcloud.colour(top.map(function (x) { return { w: x[0], n: x[1] }; }), F, { colour: colour });
      var r = SW.wordcloud.cloud(items, o);
      cur.svg = r.svg; cur.label = stp.label;
      fig.innerHTML = '';
      if (stp.note && !top.length) fig.appendChild(el('p', { class: 'hint' }, stp.note)); else { fig.appendChild(frame); frame.show(r.svg); }
      if (!top.length && !stp.note) fig.appendChild(el('p', { class: 'hint' }, 'No words at this step.'));
      cur.rows = top.map(function (x) { return [x[0], x[1]]; });
      // what changed since the step before
      cmp.innerHTML = '';
      if (prev) {
        var ch = [];
        Object.keys(Object.assign({}, cs, prev)).forEach(function (w) {
          var a = stp.rel ? 1e4 * (cs[w] || 0) / N : cs[w] || 0, z = stp.rel ? 1e4 * (prev[w] || 0) / Np : prev[w] || 0;
          if (a !== z) ch.push([w, a - z]);
        });
        ch.sort(function (x, y) { return y[1] - x[1]; });
        var unit = stp.rel ? ' per 10,000' : '';
        cmp.innerHTML = '<div><h4>More than at the step before' + unit + '</h4><p>' + ch.slice(0, 15).filter(function (x) { return x[1] > 0; }).map(function (x) { return wordLink(x[0]) + ' <span class="ds-d up">+' + (stp.rel ? fmt(x[1]) : x[1]) + '</span>'; }).join(', ') + '</p></div>' +
          '<div><h4>Fewer</h4><p>' + ch.slice(-15).reverse().filter(function (x) { return x[1] < 0; }).map(function (x) { return wordLink(x[0]) + ' <span class="ds-d down">' + (stp.rel ? fmt(x[1]) : x[1]) + '</span>'; }).join(', ') + '</p></div>';
      }
      var unplaced = stable ? top.filter(function (x) { return r.drawn.indexOf(x[0]) < 0; }).map(function (x) { return x[0]; }) : r.dropped;
      if (unplaced.length) cmp.appendChild(el('p', { class: 'hint' }, (stable ? 'Without a place in the layout held from step to step: ' : 'Not fitted in: ') + unplaced.join(', ') + '.'));
      // the view kept (and Default View shown or not), unless it is a shared one not yet changed
      if (!linked) ctl.refresh();
    }
    bar.addEventListener('change', function (e) {
      var k = e.target.dataset && e.target.dataset.k; if (!k) return;
      linked = null;
      // a layout held over the steps leaves most of its places empty at any one step, so it is held only
      // for the words standing at each stage, where a word's staying put matters more; the chapters and
      // the added and erased words are each laid out afresh
      if (k === 'mode' || k === 'src') SW.$('[data-k="stable"]', more).checked = v('src') === 'stages' && v('mode') === 'standing';
      if (/^(src|mode|every)$/.test(k)) { step0 = 0; prepare(); } else { layout = null; redraw(); }
    });
    stepWrap.addEventListener('click', function () { linked = null; }, true);
    stepWrap.addEventListener('input', function () { linked = null; }, true);
    function share() {
      var url = SW.permalink({ v: SW.state.v, tab: 'analyse', lens: 6, cloud: ctl.share() }).replace(/%3A/g, ':').replace(/%2C/g, ',');
      SW.share({ url: url, title: 'Word cloud: ' + cur.label });
    }
    bar.addEventListener('click', function (e) { if (e.target.closest('[data-k="share"]')) share(); });
    function redraw() { draw(stepAt()); }
    fig.addEventListener('click', function (e) { var t = e.target.closest('text[data-w]'); if (t) toWord(t.dataset.w); });
    linkLines(cmp);
    // the way back (kit/lenses.js): the cloud as it was left, step and all
    SW.lenses.state(6, function () { return ctl.share(); }, function (s) { viewSet(SW.wordcloud.decode(s).view); });
    viewSet(linked ? linked.view : ctl.kept && ctl.kept.view ? ctl.kept.view : DEF);
    return function () { return [TS.figure(cur.svg, 'Word cloud: ' + cur.label), SW.tableBlock('Words in the cloud: ' + cur.label, ['Word', 'Count'], cur.rows)]; };
  }

  // ---------- 7 distinctive words ----------
  function keyTable(list, A, B, method) {
    var head = method === 'rho' ? ['Word', 'ρ', 'In ' + A, 'In ' + B] : ['Word', 'G²', 'In ' + A, 'In ' + B];
    function row(x) { return [{ html: wordLink(x.w), text: x.w, sort: x.w }, method === 'rho' ? +x.rho.toFixed(3) : +Math.abs(x.g2).toFixed(1), x.a, x.b]; }
    return { head: head, row: row };
  }
  function distinctive(b, el0) {
    var blocks = [];
    var c = wide(card('Distinctive words', 'The words that set one part of the text apart from another. Log-likelihood (Dunning’s G²) compares the two parts’ counts as wholes, so a word frequent in one passage can carry it; the Mann–Whitney ρ asks how often a 250-word chunk of the first part uses the word more than a chunk of the second, so it favours words spread through the part. ρ is 0.5 where the parts do not differ. Words that occur fewer than 3 times are left out.'));
    var bar = el('div', { class: 'toolbar ds-bar' }), out = el('div');
    c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    var w8 = wait(out);
    chaptersOf(b).then(function (all) {
      w8.remove();
      var chOpts = all.chs.map(function (ch, i) { return opt(i, ch.label); }).join('');
      bar.innerHTML = 'From <select data-k="a0">' + chOpts + '</select> to <select data-k="a1">' + chOpts + '</select> against <select data-k="b"><option value="rest">the rest of the text</option>' + all.chs.map(function (ch, i) { return opt(i, ch.label); }).join('') + '</select> ' +
        '<select data-k="m">' + opt('g2', 'by log-likelihood (G²)') + opt('rho', 'by Mann–Whitney ρ over chunks') + '</select> <label class="check"><input type="checkbox" data-k="stop"> leave out common words</label>';
      var a1 = SW.$('[data-k="a1"]', bar), a0 = SW.$('[data-k="a0"]', bar);
      var ix = all.chs.map(function (ch) { return ch.label; }).indexOf('Chapter 21');
      a0.value = a1.value = String(ix >= 0 ? ix : 0);
      function draw() {
        var i0 = +a0.value, i1 = Math.max(i0, +a1.value), bv = SW.$('[data-k="b"]', bar).value, m = SW.$('[data-k="m"]', bar).value, S = SW.$('[data-k="stop"]', bar).checked ? stop() : null;
        var A = all.chs.slice(i0, i1 + 1), B = bv === 'rest' ? all.chs.filter(function (_, i) { return i < i0 || i > i1; }) : [all.chs[+bv]];
        var la = i0 === i1 ? all.chs[i0].label : all.chs[i0].label + '–' + shortLabel(all.chs[i1].label), lb = bv === 'rest' ? 'the rest' : all.chs[+bv].label;
        var ta = [].concat.apply([], A.map(function (x) { return x.toks; })), tb = [].concat.apply([], B.map(function (x) { return x.toks; }));
        var list;
        if (m === 'rho') list = TS.distinctive(TS.chunks(ta, 250), TS.chunks(tb, 250), { stop: S, min: 3 });
        else list = TS.keyness(TS.counts(ta), TS.counts(tb), { stop: S, min: 3 });
        var K = keyTable(list, la, lb, m), score = m === 'rho' ? function (x) { return x.rho - 0.5; } : function (x) { return x.g2; };
        var up = list.filter(function (x) { return score(x) > 0; }).slice(0, 40), down = list.filter(function (x) { return score(x) < 0; }).reverse().slice(0, 40);
        out.innerHTML = '';
        out.appendChild(el('p', { class: 'hint' }, la + ': ' + ta.length.toLocaleString('en-GB') + ' words; ' + lb + ': ' + tb.length.toLocaleString('en-GB') + '.' + (m === 'rho' ? ' ' + TS.chunks(ta, 250).length + ' and ' + TS.chunks(tb, 250).length + ' chunks.' : ' Above about 10.8, a difference this large would arise by chance less than once in a thousand times, were the words drawn at random.')));
        var g = el('div', { class: 'ds-two' });
        [[up, 'More in ' + la], [down, 'More in ' + lb]].forEach(function (x) {
          var d = el('div'); d.appendChild(el('h4', null, esc(x[1])));
          var s = el('div', { class: 'scroll' }); s.appendChild(SW.table(K.head, x[0].map(K.row), { cls: ['', 'num', 'num', 'num'] })); d.appendChild(s); g.appendChild(d);
        });
        out.appendChild(g);
        blocks = [SW.tableBlock('Words more frequent in ' + la + ' than in ' + lb, K.head, up.map(K.row)), SW.tableBlock('Words more frequent in ' + lb + ' than in ' + la, K.head, down.map(K.row))];
      }
      bar.addEventListener('change', draw); draw();
    }).catch(function (e) { w8.textContent = e.message; });
    linkLines(c);
    return function () { return blocks; };
  }
  function distinctiveAcross(vs, bs, el0) {
    var blocks = [];
    var c = wide(card('Distinctive words between two versions', 'The words one version has more of than another, by log-likelihood (G²): between the manuscript before and after revision, what revision brought in and took out.'));
    var bar = el('div', { class: 'toolbar ds-bar' }), out = el('div');
    var o = vs.map(function (v, i) { return opt(i, short(v)); }).join('');
    bar.innerHTML = '<select data-k="a">' + o + '</select> against <select data-k="b">' + o + '</select> <label class="check"><input type="checkbox" data-k="stop"> leave out common words</label>';
    c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    var ia = vs.map(function (v) { return v.id; }).indexOf('ms-final'), ib = vs.map(function (v) { return v.id; }).indexOf('ms-first');
    SW.$('[data-k="a"]', bar).value = String(ia >= 0 ? ia : 0); SW.$('[data-k="b"]', bar).value = String(ib >= 0 ? ib : 1 % vs.length);
    Promise.all(bs.map(chaptersOf)).then(function (alls) {
      function draw() {
        var a = +SW.$('[data-k="a"]', bar).value, bb = +SW.$('[data-k="b"]', bar).value, S = SW.$('[data-k="stop"]', bar).checked ? stop() : null;
        var list = TS.keyness(TS.counts(alls[a].toks), TS.counts(alls[bb].toks), { stop: S, min: 3 }), la = SW.refOf(vs[a].id), lb = SW.refOf(vs[bb].id);
        var K = keyTable(list, la, lb, 'g2'), up = list.filter(function (x) { return x.g2 > 0; }).slice(0, 40), down = list.filter(function (x) { return x.g2 < 0; }).reverse().slice(0, 40);
        out.innerHTML = '';
        var g = el('div', { class: 'ds-two' });
        [[up, 'More in ' + la], [down, 'More in ' + lb]].forEach(function (x) {
          var d = el('div'); d.appendChild(el('h4', null, esc(x[1])));
          var s = el('div', { class: 'scroll' }); s.appendChild(SW.table(K.head, x[0].map(K.row), { cls: ['', 'num', 'num', 'num'] })); d.appendChild(s); g.appendChild(d);
        });
        out.appendChild(g);
        blocks = [SW.tableBlock('Words more frequent in ' + la + ' than in ' + lb, K.head, up.map(K.row)), SW.tableBlock('Words more frequent in ' + lb + ' than in ' + la, K.head, down.map(K.row))];
      }
      bar.addEventListener('change', draw); draw();
    });
    linkLines(c);
    return function () { return blocks; };
  }
  function short(v) { return SW.refOf(v.id) + ' ' + v.label; }

  // ---------- 9 trends ----------
  function wordsIn(s) { return String(s || '').toLowerCase().split(/[,;]+/).map(function (x) { return x.trim().replace(/[’]/g, "'"); }).filter(Boolean); }
  function countIn(toks, w) { var n = 0, parts = w.split(/\s+/); for (var i = 0; i <= toks.length - parts.length; i++) { var ok = true; for (var j = 0; j < parts.length; j++) if (toks[i + j] !== parts[j]) { ok = false; break; } if (ok) n++; } return n; }
  function positions(toks, w) { var at = [], parts = w.split(/\s+/); for (var i = 0; i <= toks.length - parts.length; i++) { var ok = true; for (var j = 0; j < parts.length; j++) if (toks[i + j] !== parts[j]) { ok = false; break; } if (ok) at.push(i); } return at; }
  function trends(b, el0) {
    var cur = { svg: '', disp: '', rows: [], head: [] };
    var c = wide(card('Trends', 'How often words occur, chapter by chapter, per 10,000 words; and where each occurs through the text, a stroke for each occurrence. Separate words with commas; a phrase is matched as a whole.'));
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<input type="search" data-k="q" style="width:320px" value="' + esc(keep('trend') || 'billy, captain, claggart, vere') + '">';
    var out = el('div'); c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    var w8 = wait(out);
    chaptersOf(b).then(function (all) {
      w8.remove();
      function draw() {
        var ws = wordsIn(SW.$('input', bar).value).slice(0, 7); keep('trend', SW.$('input', bar).value);
        out.innerHTML = '';
        if (!ws.length) { out.appendChild(el('p', { class: 'hint' }, 'Type a word.')); return; }
        var series = ws.map(function (w) { return { label: w, pts: all.chs.map(function (ch, i) { return [i, 1e4 * countIn(ch.toks, w) / (ch.words || 1)]; }) }; });
        cur.svg = TS.lines(series, { width: 880, height: 300, dots: true, ylabel: 'per 10,000 words', xlabel: 'chapter', xtick: function (i) { return all.chs[i] ? all.chs[i].short : ''; }, xr: [0, all.chs.length - 1] });
        out.appendChild(svgBox(cur.svg));
        var N = all.toks.length;
        cur.disp = TS.dispersion(ws.map(function (w) { return { label: w, at: positions(all.toks, w).map(function (i) { return i / N; }) }; }), {
          width: 880, marks: all.chs.map(function (ch, i) { return [ch.from / N, i % 2 ? '' : ch.short]; }) });
        out.appendChild(el('h4', null, 'Where they occur'));
        out.appendChild(svgBox(cur.disp));
        cur.head = ['Chapter', 'Words'].concat(ws);
        cur.rows = all.chs.map(function (ch, i) { return [ch.label, ch.words].concat(series.map(function (s) { return +s.pts[i][1].toFixed(1); })); });
      }
      var t = null; bar.addEventListener('input', function () { clearTimeout(t); t = setTimeout(draw, 300); }); draw();
    }).catch(function (e) { w8.textContent = e.message; });
    return function () { return [TS.figure(cur.svg, 'Trends per 10,000 words, by chapter'), TS.figure(cur.disp, 'Where the words occur through the text'), SW.tableBlock('Per 10,000 words, by chapter', cur.head, cur.rows)]; };
  }
  function trendsAcross(vs, bs, el0) {
    var cur = { svg: '', rows: [], head: [] };
    var c = wide(card('A word’s trend across the versions', 'How often a word occurs in each chapter of each version, per 10,000 words.'));
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<input type="search" data-k="q" style="width:220px" value="' + esc((wordsIn(keep('trend') || 'claggart')[0]) || 'claggart') + '">';
    var out = el('div'); c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    Promise.all(bs.map(chaptersOf)).then(function (alls) {
      var labels = alls.reduce(function (m, a) { return a.chs.length > m.length ? a.chs.map(function (x) { return x.label; }) : m; }, []);
      function draw() {
        var w = wordsIn(SW.$('input', bar).value)[0]; out.innerHTML = '';
        if (!w) return;
        var series = alls.map(function (a, i) {
          return { label: SW.refOf(vs[i].id), pts: a.chs.map(function (ch) { return [labels.indexOf(ch.label), 1e4 * countIn(ch.toks, w) / (ch.words || 1)]; }).filter(function (p) { return p[0] >= 0; }).sort(function (x, y) { return x[0] - y[0]; }) };
        });
        cur.svg = TS.lines(series, { width: 880, height: 300, dots: true, ylabel: '“' + w + '” per 10,000 words', xlabel: 'chapter', xtick: function (i) { return labels[i] ? shortLabel(labels[i]) : ''; }, xr: [0, labels.length - 1] });
        out.appendChild(svgBox(cur.svg));
        cur.head = ['Chapter'].concat(vs.map(function (v) { return SW.refOf(v.id); }));
        cur.rows = labels.map(function (l) { return [l].concat(alls.map(function (a) { var ch = a.chs.filter(function (x) { return x.label === l; })[0]; return ch ? +(1e4 * countIn(ch.toks, w) / (ch.words || 1)).toFixed(1) : '–'; })); });
      }
      var t = null; bar.addEventListener('input', function () { clearTimeout(t); t = setTimeout(draw, 300); }); draw();
    });
    return function () { return [TS.figure(cur.svg, 'A word per 10,000 words in each version, by chapter'), SW.tableBlock('Per 10,000 words', cur.head, cur.rows)]; };
  }

  // ---------- 10 collocates ----------
  function collocates(b, el0) {
    var rows = [], kw = [];
    var c = wide(card('Collocates', 'The words that occur near a word, within a window either side, ranked by log-likelihood (G²) against the rest of the text, with their pointwise mutual information (PMI, in bits: how much more often than chance they meet). Common words are left out of the list; below, every occurrence in its context.'));
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<input type="search" data-k="q" style="width:200px" value="' + esc(keep('node') || 'sea') + '"> <select data-k="win">' + [3, 5, 8].map(function (n) { return opt(n, n + ' words either side', n === 5); }).join('') + '</select>';
    var out = el('div'); c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    var w8 = wait(out);
    chaptersOf(b).then(function (all) {
      w8.remove();
      function draw() {
        var q = SW.$('input', bar).value.trim().toLowerCase().replace(/’/g, "'"), win = +SW.$('select', bar).value; keep('node', q);
        out.innerHTML = '';
        if (!q) return;
        var star = /\*$/.test(q), base = q.replace(/\*$/, ''), isNode = function (w) { return star ? w.indexOf(base) === 0 : w === q; };
        var r = TS.collocates(all.toks, isNode, { window: win, stop: stop(), min: 2 });
        if (!r.hits) { out.appendChild(el('p', { class: 'hint' }, '“' + q + '” does not occur. End a word with * to match its forms (sail*).')); rows = []; kw = []; return; }
        rows = r.list.slice(0, 50).map(function (x) { return [{ html: wordLink(x.w), text: x.w, sort: x.w }, x.n, x.all, +x.g2.toFixed(1), +x.pmi.toFixed(2)]; });
        out.appendChild(el('p', { class: 'hint' }, '“' + q + '”: ' + r.hits + ' occurrences; ' + r.span.toLocaleString('en-GB') + ' words in their windows.'));
        var g = el('div', { class: 'ds-two' }), t = el('div', { class: 'scroll' });
        t.appendChild(SW.table(['Collocate', 'Near', 'In all', 'G²', 'PMI'], rows, { cls: ['', 'num', 'num', 'num', 'num'] }));
        var bw = el('div'); bw.innerHTML = bars(r.list.slice(0, 20).map(function (x) { return [x.w, +x.g2.toFixed(1)]; }));
        g.appendChild(t); g.appendChild(bw); out.appendChild(g);
        // in context
        kw = [];
        for (var i = 0; i < all.toks.length && kw.length < 300; i++) if (isNode(all.toks[i])) {
          var at = all.at[i], chi = 0; while (chi + 1 < all.chs.length && all.chs[chi + 1].from <= i) chi++;
          kw.push({ l: all.cased.slice(Math.max(0, i - 8), i).join(' '), k: all.cased[i], r: all.cased.slice(i + 1, i + 9).join(' '), at: at, ch: all.chs[chi].short });
        }
        var kd = el('div', { class: 'scroll ds-kwic' });
        kd.innerHTML = '<table class="data"><tbody>' + kw.map(function (k) { return '<tr><td class="mono">' + lineLink(k.at[0], k.at[1], k.ch + ':' + k.at[1]) + '</td><td class="l">' + esc(k.l) + '</td><td class="k">' + esc(k.k) + '</td><td>' + esc(k.r) + '</td></tr>'; }).join('') + '</tbody></table>';
        out.appendChild(el('h4', null, 'In context'));
        out.appendChild(kd);
      }
      var t = null; bar.addEventListener('input', function () { clearTimeout(t); t = setTimeout(draw, 300); }); bar.addEventListener('change', draw); draw();
    }).catch(function (e) { w8.textContent = e.message; });
    linkLines(c);
    return function () { return [SW.tableBlock('Collocates of “' + keep('node') + '”', ['Collocate', 'Near', 'In all', 'G²', 'PMI'], rows), SW.tableBlock('“' + keep('node') + '” in context', ['Where', 'Before', 'Word', 'After'], kw.map(function (k) { return [k.ch + ':' + k.at[1], k.l, k.k, k.r]; }))]; };
  }

  // ---------- 11 vocabulary ----------
  function stats(toks, text) {
    var cs = TS.counts(toks), hx = TS.hapax(cs), sl = TS.sentences(text), V = Object.keys(cs).length;
    return { N: toks.length, V: V, mattr100: TS.mattr(toks, 100), mattr500: TS.mattr(toks, 500), hapax: hx.hapax, dis: hx.dis, K: TS.yuleK(cs),
             sent: TS.mean(sl), sentMax: sl.length ? Math.max.apply(null, sl) : 0, sents: sl, cs: cs };
  }
  function vocabulary(b, el0) {
    var rows = [], figs = [];
    var c = wide(card('Vocabulary', 'Measures of the vocabulary, chapter by chapter: distinct words; the moving-average type-token ratio (the share of distinct words in every window of 100, which does not fall with length as the plain ratio does); words used once (hapax legomena) and twice; Yule’s K (the chance that two words drawn at random are the same, ×10⁴: higher where words repeat); and the mean and longest sentence in words. Below, Zipf’s law (each word’s count against its rank) and Heaps’ law (the vocabulary’s growth through the text), with their fitted exponents.'));
    var out = el('div'); c.appendChild(out); el0.appendChild(c);
    var w8 = wait(out);
    chaptersOf(b).then(function (all) {
      w8.remove();
      var head = ['Chapter', 'Words', 'Distinct', 'MATTR (100)', 'Once', 'Twice', 'Yule’s K', 'Mean sentence', 'Longest'];
      rows = all.chs.map(function (ch) {
        var s = stats(ch.toks, ch.text);
        return [ch.label, s.N, s.V, +s.mattr100.toFixed(3), s.hapax, s.dis, +s.K.toFixed(1), +s.sent.toFixed(1), s.sentMax];
      });
      var whole = stats(all.toks, all.chs.map(function (ch) { return ch.text; }).join(' '));
      rows.push(['The whole text', whole.N, whole.V, +whole.mattr100.toFixed(3), whole.hapax, whole.dis, +whole.K.toFixed(1), +whole.sent.toFixed(1), whole.sentMax]);
      var t = el('div', { class: 'scroll' }); t.appendChild(SW.table(head, rows.slice(), { cls: ['', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num'] })); out.appendChild(t);
      out.appendChild(el('p', { class: 'hint' }, 'The whole text’s MATTR over windows of 500 words: ' + whole.mattr500.toFixed(3) + '. Sentences are divided at a full stop, question or exclamation mark followed by a space; the manuscript’s punctuation is Melville’s, and a line of verse without one runs on.'));
      var z = TS.zipf(whole.cs), zf = TS.fit(z.slice(0, 1000).map(function (p) { return [Math.log10(p[0]), Math.log10(p[1])]; }));
      var hp = TS.heaps(all.toks, 250), hf = TS.fit(hp.map(function (p) { return [Math.log10(p[0]), Math.log10(p[1])]; }));
      var zs = TS.lines([{ label: 'count', pts: z }, { label: 'fitted, slope ' + zf.slope.toFixed(2), pts: [[1, Math.pow(10, zf.intercept)], [Math.min(1000, z.length), Math.pow(10, zf.intercept + zf.slope * Math.log10(Math.min(1000, z.length)))]], colour: 'var(--text-dim)' }],
        { width: 430, height: 280, logx: true, logy: true, xlabel: 'rank', ylabel: 'count' });
      var hs = TS.lines([{ label: 'distinct words', pts: hp }, { label: 'fitted, β ' + hf.slope.toFixed(2), pts: hp.map(function (p) { return [p[0], Math.pow(10, hf.intercept) * Math.pow(p[0], hf.slope)]; }), colour: 'var(--text-dim)' }],
        { width: 430, height: 280, xlabel: 'words read', ylabel: 'distinct words' });
      var g = el('div', { class: 'ds-two' }); g.appendChild(svgBox(zs)); g.appendChild(svgBox(hs)); out.appendChild(g);
      var hist = {}; whole.sents.forEach(function (n) { var k = Math.min(80, Math.floor(n / 5) * 5); hist[k] = (hist[k] || 0) + 1; });
      var hd = el('div'); hd.innerHTML = '<h4>Sentence lengths</h4>' + bars(Object.keys(hist).map(Number).sort(function (a, x) { return a - x; }).map(function (k) { return [k === 80 ? '80 or more' : k + '–' + (k + 4), hist[k]]; }));
      out.appendChild(hd);
      figs = [TS.figure(zs, 'Zipf’s law: count against rank, log–log; fitted slope ' + zf.slope.toFixed(2) + ' (ranks 1–1,000)'), TS.figure(hs, 'Heaps’ law: distinct words against words read; fitted β ' + hf.slope.toFixed(2))];
      rows.head = head;
    }).catch(function (e) { w8.textContent = e.message; });
    return function () { return [SW.tableBlock('Vocabulary by chapter', rows.head || [], rows)].concat(figs); };
  }
  function vocabularyAcross(vs, bs, el0) {
    var rows = [], fig = '';
    var c = wide(card('Vocabulary across the versions', 'The measures of the vocabulary for each version as a whole. MATTR over windows of 500 words; Zipf’s slope over ranks 1–1,000; Heaps’ β the exponent of the vocabulary’s growth.'));
    var out = el('div'); c.appendChild(out); el0.appendChild(c);
    var head = ['Version', 'Words', 'Distinct', 'MATTR (500)', 'Once', 'Yule’s K', 'Zipf slope', 'Heaps β', 'Mean sentence'];
    Promise.all(bs.map(chaptersOf)).then(function (alls) {
      var series = [];
      rows = alls.map(function (a, i) {
        var s = stats(a.toks, a.chs.map(function (ch) { return ch.text; }).join(' '));
        var z = TS.fit(TS.zipf(s.cs).slice(0, 1000).map(function (p) { return [Math.log10(p[0]), Math.log10(p[1])]; }));
        var hp = TS.heaps(a.toks, 500), h = TS.fit(hp.map(function (p) { return [Math.log10(p[0]), Math.log10(p[1])]; }));
        series.push({ label: SW.refOf(vs[i].id), pts: hp });
        return [short(vs[i]), s.N, s.V, +s.mattr500.toFixed(3), s.hapax, +s.K.toFixed(1), +z.slope.toFixed(3), +h.slope.toFixed(3), +s.sent.toFixed(1)];
      });
      out.appendChild(SW.table(head, rows.slice(), { cls: ['', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num'] }));
      fig = TS.lines(series, { width: 880, height: 300, xlabel: 'words read', ylabel: 'distinct words' });
      out.appendChild(el('h4', null, 'The vocabulary’s growth'));
      out.appendChild(svgBox(fig));
    });
    return function () { return [SW.tableBlock('Vocabulary of each version', head, rows), TS.figure(fig, 'Distinct words against words read, each version')]; };
  }

  // ---------- 12 stylometry ----------
  function styloDraw(out, docs, labels, colours, o) {
    var n = +o.n, P = TS.delta(docs.map(function (d) { return d.toks; }), { n: n });
    var pc = TS.pca(P.z, 2);
    var pts = docs.map(function (d, i) { return { x: pc.scores[i][0], y: pc.scores[i][1], label: d.short, title: labels[i], colour: colours ? colours[i] : 'var(--amber)', i: i }; });
    var sc = TS.scatter(pts, { width: 880, height: 440, xlabel: 'PC1 (' + (100 * pc.variance[0]).toFixed(0) + '% of the variance)', ylabel: 'PC2 (' + (100 * (pc.variance[1] || 0)).toFixed(0) + '%)' });
    out.appendChild(svgBox(sc));
    // the words that pull along each component
    function pulls(j) {
      var L = P.words.map(function (w, k) { return [w, pc.loadings[j] ? pc.loadings[j][k] : 0]; }).sort(function (a, x) { return x[1] - a[1]; });
      return '<p><b>PC' + (j + 1) + '</b> + ' + L.slice(0, 10).map(function (x) { return wordLink(x[0]); }).join(' ') + '<br>− ' + L.slice(-10).reverse().map(function (x) { return wordLink(x[0]); }).join(' ') + '</p>';
    }
    var pl = el('div', { class: 'ds-pulls' }); pl.innerHTML = '<h4>The words that place the texts along each component</h4>' + pulls(0) + pulls(1);
    out.appendChild(pl);
    var rows = docs.map(function (d, i) { var j = TS.nearest(P.m, i); return [labels[i], d.toks.length, j >= 0 ? labels[j] : '–', j >= 0 ? +P.m[i][j].toFixed(3) : '', +pc.scores[i][0].toFixed(2), +(pc.scores[i][1] || 0).toFixed(2)]; });
    var t = el('div', { class: 'scroll' }); t.appendChild(SW.table(['Text', 'Words', 'Nearest by Delta', 'Delta', 'PC1', 'PC2'], rows.slice(), { cls: ['', 'num', '', 'num', 'num', 'num'] }));
    out.appendChild(el('h4', null, 'Nearest neighbours'));
    out.appendChild(t);
    return [TS.figure(sc, 'Principal components of the ' + n + ' most frequent words'), SW.tableBlock('Nearest by Burrows’s Delta (' + n + ' most frequent words)', ['Text', 'Words', 'Nearest by Delta', 'Delta', 'PC1', 'PC2'], rows)];
  }
  var STYLO_LEDE = 'The texts compared by their use of the most frequent words, the common words included: for each, its rate in each text as a z-score (how far above or below the mean of all the texts, in standard deviations). Burrows’s Delta is the mean difference of two texts’ z-scores: the smaller, the nearer. The scatter places each text on the two principal components of the z-scores, the directions in which the texts differ most. Texts shorter than the minimum are left out, since their rates are unsteady.';
  function stylometry(b, el0) {
    var blocks = [];
    var c = wide(card('Stylometry', STYLO_LEDE));
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<select data-k="n">' + [50, 100, 200, 500].map(function (n) { return opt(n, n + ' most frequent words', n === 100); }).join('') + '</select> <select data-k="min">' + [300, 600, 1000].map(function (n) { return opt(n, 'chapters of ' + n + ' words or more', n === 600); }).join('') + '</select>';
    var out = el('div'); c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    var w8 = wait(out);
    chaptersOf(b).then(function (all) {
      w8.remove();
      function draw() {
        out.innerHTML = '';
        var min = +SW.$('[data-k="min"]', bar).value, docs = all.chs.filter(function (ch) { return ch.words >= min; });
        if (docs.length < 3) { out.appendChild(el('p', { class: 'hint' }, 'Fewer than three chapters are that long.')); return; }
        blocks = styloDraw(out, docs, docs.map(function (d) { return d.label; }), null, { n: SW.$('[data-k="n"]', bar).value });
      }
      bar.addEventListener('change', draw); draw();
    }).catch(function (e) { w8.textContent = e.message; });
    linkLines(c);
    return function () { return blocks; };
  }
  function stylometryAcross(vs, bs, el0) {
    var blocks = [];
    var c = wide(card('Stylometry across the versions', 'The chapters of every version together, coloured by version. ' + STYLO_LEDE));
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<select data-k="n">' + [50, 100, 200].map(function (n) { return opt(n, n + ' most frequent words', n === 100); }).join('') + '</select> <select data-k="min">' + [300, 600, 1000].map(function (n) { return opt(n, 'chapters of ' + n + ' words or more', n === 600); }).join('') + '</select>';
    var out = el('div'), key = el('p', { class: 'hint' }); c.appendChild(bar); c.appendChild(key); c.appendChild(out); el0.appendChild(c);
    key.innerHTML = vs.map(function (v, i) { return '<span style="color:' + TS.PALETTE[i % TS.PALETTE.length] + '">●</span> ' + esc(short(v)); }).join(' &nbsp; ');
    Promise.all(bs.map(chaptersOf)).then(function (alls) {
      function draw() {
        out.innerHTML = '';
        var min = +SW.$('[data-k="min"]', bar).value, docs = [], labels = [], cols = [];
        alls.forEach(function (a, i) { a.chs.forEach(function (ch) { if (ch.words >= min) { docs.push({ toks: ch.toks, short: SW.refOf(vs[i].id).replace(/^BB-/, '') + ' ' + ch.short }); labels.push(SW.refOf(vs[i].id) + ', ' + ch.label); cols.push(TS.PALETTE[i % TS.PALETTE.length]); } }); });
        blocks = styloDraw(out, docs, labels, cols, { n: SW.$('[data-k="n"]', bar).value });
      }
      bar.addEventListener('change', draw); draw();
    });
    linkLines(c);
    return function () { return blocks; };
  }

  // ---------- 13 words added and erased ----------
  function revisionWords(b, el0) {
    var blocks = [];
    var c = wide(card('Words added and erased', 'The words of Melville’s additions set against those of his deletions, by log-likelihood (G²): the words he wrote in more than he struck out, and the reverse, over the whole manuscript or at one stage. Read from the manuscript’s encoding whichever version is open; a revision within a revision counts with the one it is written in. Click a word for its lines in the version open.'));
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<select data-k="stage"><option value="">every stage</option>' + STAGES.map(function (id) { return opt(id, 'Stage ' + id); }).join('') + '<option value="?">not placed</option></select> <select data-k="hand"><option value="HM">Melville’s hand</option><option value="">every hand</option>' + (SW.BENCH.hands || []).filter(function (h) { return h.k !== 'HM'; }).map(function (h) { return opt(h.k, h.who); }).join('') + '</select> <label class="check"><input type="checkbox" data-k="stop"> leave out common words</label>';
    var out = el('div'); c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    var w8 = wait(out, 'Reading the manuscript’s revisions…');
    stageStates().then(function (S) {
      w8.remove();
      // each revision's words, by its outermost mark
      var revs = {};
      S.doc.blocks.forEach(function (bl) {
        if (bl.t === 'pb') return;
        bl.spans.forEach(function (sp) {
          var m = sp.marks.filter(function (x) { return x.id != null && (x.k === 'added' || x.k === 'erased'); })[0];
          if (!m) return;
          var R = revs[m.id] || (revs[m.id] = { k: m.k, stage: m.change || '', hand: m.hand || 'HM', text: [] });
          R.text.push(sp.s);
        });
      });
      var list = Object.keys(revs).map(function (k) { var R = revs[k]; R.toks = TS.tokens(R.text.join('').replace(/[⟦⟧\\/]/g, '')); return R; });
      function draw() {
        var st = SW.$('[data-k="stage"]', bar).value, hd = SW.$('[data-k="hand"]', bar).value, Sx = SW.$('[data-k="stop"]', bar).checked ? stop() : null;
        var sel = list.filter(function (R) { return (!hd || R.hand === hd) && (st === '?' ? STAGES.indexOf(R.stage) < 0 : !st || R.stage === st); });
        var add = [], del = [];
        sel.forEach(function (R) { (R.k === 'added' ? add : del).push.apply(R.k === 'added' ? add : del, R.toks); });
        var kl = TS.keyness(TS.counts(add), TS.counts(del), { stop: Sx, min: 3 });
        var head = ['Word', 'G²', 'Added', 'Erased'], row = function (x) { return [{ html: wordLink(x.w), text: x.w, sort: x.w }, +Math.abs(x.g2).toFixed(1), x.a, x.b]; };
        var up = kl.filter(function (x) { return x.g2 > 0; }).slice(0, 40), down = kl.filter(function (x) { return x.g2 < 0; }).reverse().slice(0, 40);
        out.innerHTML = '';
        out.appendChild(el('p', { class: 'hint' }, sel.filter(function (R) { return R.k === 'added'; }).length + ' additions (' + add.length.toLocaleString('en-GB') + ' words) and ' + sel.filter(function (R) { return R.k === 'erased'; }).length + ' deletions (' + del.length.toLocaleString('en-GB') + ' words). Words that occur fewer than 3 times in either are left out.'));
        var g = el('div', { class: 'ds-two' });
        [[up, 'Added more than erased'], [down, 'Erased more than added']].forEach(function (x) {
          var d = el('div'); d.appendChild(el('h4', null, x[1]));
          var s = el('div', { class: 'scroll' }); s.appendChild(SW.table(head, x[0].map(row), { cls: ['', 'num', 'num', 'num'] })); d.appendChild(s); g.appendChild(d);
        });
        out.appendChild(g);
        var lab = (st ? 'stage ' + st : 'every stage') + ', ' + (hd || 'every hand');
        blocks = [SW.tableBlock('Words added more than erased (' + lab + ')', head, up.map(row)), SW.tableBlock('Words erased more than added (' + lab + ')', head, down.map(row))];
      }
      bar.addEventListener('change', draw); draw();
    }).catch(function (e) { w8.textContent = e.message; });
    linkLines(c);
    return function () { return blocks; };
  }

  // ---------- 14 rare words ----------
  // the words' frequencies and entries are bench-kit's dictionary.js (SW.dict), from SW.BENCH.dictionaries and wordFreq
  var FIELDS = { Naut: 'Nautical', Law: 'Law', Mil: 'Military', Fort: 'Fortification', Gun: 'Gunnery', Eccl: 'Ecclesiastical', Theol: 'Theology', Script: 'Scripture', Myth: 'Mythology', Her: 'Heraldry', Med: 'Medicine', Bot: 'Botany', Zool: 'Zoology', 'Zoöl': 'Zoology', Arch: 'Architecture', Mus: 'Music', Gram: 'Grammar', Rhet: 'Rhetoric', Logic: 'Logic', Philos: 'Philosophy', Chem: 'Chemistry', Anat: 'Anatomy', Com: 'Commerce', Print: 'Printing', Geol: 'Geology', Mech: 'Mechanics', Math: 'Mathematics', Astron: 'Astronomy', Paint: 'Painting', Falconry: 'Falconry', Shipbuilding: 'Shipbuilding' };
  function entriesOf(r) { return r && r.found.length ? r.found : null; }
  function firstSense(f) { var e = f.entries[0]; return ((e && e.senses[0]) || '').replace(/^\d+\.\s*/, ''); }
  function defHTML(r) {
    var fs = entriesOf(r);
    if (!fs) return '<span class="hint">Not found</span>';
    var first = firstSense(fs[0]), f0 = fs[0];
    return '<details><summary>' + (f0.how !== 'as written' ? '<span class="ds-as">' + esc(f0.as) + ':</span> ' : '') + esc(first.length > 110 ? first.slice(0, 108) + '…' : first) + '</summary><div class="dict-pop ds-dict">' + fs.map(SW.dict.entryHTML).join('') + '</div></details>';
  }
  function rare(b, el0) {
    var shown = [], found = {};
    var D = SW.dict, dname = ((SW.BENCH.dictionaries || [])[0] || {}).short || 'the dictionary';
    var c = wide(card('Rare words', 'The words of this version that are rare in present-day English, with their definitions in Webster’s Revised Unabridged Dictionary (1913), the dictionary nearest Melville’s English that is free to use. Rarity is the word’s Zipf frequency in present-day English (wordfreq): 3 is once in a million words, 2 once in ten million; it measures today’s usage, not that of the 1880s. Words not in wordfreq at all are listed apart: most are Melville’s spellings and the manuscript’s slips, kept as he wrote them. Names (words always capitalised in the text) are left out unless asked for. A word not found as written is looked for without its inflection, and the form found is given. Click a definition to open it; click a word for its lines. Select any word in Read or Book for 📕 Look up.'));
    var bar = el('div', { class: 'toolbar ds-bar' });
    bar.innerHTML = '<label>rarer than <input type="range" data-k="z" min="1" max="3.5" step="0.1" value="' + (+keep('zipf') || 2.5) + '" style="width:120px"> <b class="ds-z"></b></label> <select data-k="which">' + opt('rare', 'rare words') + opt('none', 'not in present-day English') + '</select> <select data-k="field"><option value="">every field</option></select> <label class="check"><input type="checkbox" data-k="names"> names</label> <label class="check"><input type="checkbox" data-k="def"> defined only</label> <input type="search" data-k="q" placeholder="Find…" style="width:140px">';
    var out = el('div'); c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    if (!D || !D.list().length) { out.appendChild(el('p', { class: 'hint' }, 'No dictionary is named for this bench.')); return null; }
    var w8 = wait(out, 'Reading the dictionary…');
    Promise.all([chaptersOf(b), D.load()]).then(function (r) {
      var all = r[0], words = Object.create(null);
      all.toks.forEach(function (w, i) {
        var x = words[w] || (words[w] = { w: w, n: 0, first: i, capsOnly: true });
        x.n++;
        if (all.cased[i][0] === all.cased[i][0].toLowerCase()) x.capsOnly = false;
      });
      var list = Object.keys(words).filter(function (w) { var z = D.zipf(w); return w.length > 2 && z != null && z < 3.5; });
      return D.lookupMany(list).then(function (res) { found = res; return { all: all, words: words }; });
    }).then(function (R) {
      w8.remove();
      var all = R.all, words = R.words, fields = {};
      Object.keys(found).forEach(function (w) { (entriesOf(found[w]) || []).forEach(function (f) { f.entries.forEach(function (e) { (e.field || []).forEach(function (fl) { fields[fl] = (fields[fl] || 0) + 1; }); }); }); });
      SW.$('[data-k="field"]', bar).innerHTML = '<option value="">every field</option>' + Object.keys(fields).sort(function (a, x) { return fields[x] - fields[a]; }).map(function (f) { return opt(f, (FIELDS[f] || f) + ' (' + dname + '’s label)'); }).join('');
      function draw() {
        var z = +SW.$('[data-k="z"]', bar).value, which = SW.$('[data-k="which"]', bar).value, fd = SW.$('[data-k="field"]', bar).value, names = SW.$('[data-k="names"]', bar).checked, only = SW.$('[data-k="def"]', bar).checked, q = SW.$('[data-k="q"]', bar).value.trim().toLowerCase();
        keep('zipf', z); SW.$('.ds-z', bar).textContent = z.toFixed(1);
        SW.$('[data-k="z"]', bar).closest('label').hidden = which === 'none';
        shown = Object.keys(found).map(function (w) { return words[w]; }).filter(function (x) {
          var zf = D.zipf(x.w), fs = entriesOf(found[x.w]);
          if (which === 'none' ? zf > 0 : !(zf > 0 && zf < z)) return false;
          if (!names && x.capsOnly) return false;
          if (only && !fs) return false;
          if (fd && !(fs && fs.some(function (f) { return f.entries.some(function (e) { return (e.field || []).indexOf(fd) >= 0; }); }))) return false;
          return !q || x.w.indexOf(q) >= 0 || (fs && JSON.stringify(fs.map(function (f) { return f.entries; })).toLowerCase().indexOf(q) >= 0);
        }).sort(function (a, x) { return (D.zipf(a.w) - D.zipf(x.w)) || x.n - a.n; });
        var rows = shown.slice(0, 500).map(function (x) {
          var at = all.at[x.first];
          return [{ html: wordLink(x.w), text: x.w, sort: x.w }, x.n, D.zipf(x.w), { html: lineLink(at[0], at[1], all.chs[chapterAt(all, x.first)].short + ':' + at[1]), text: at[1], sort: x.first }, { html: defHTML(found[x.w]), text: '', sort: entriesOf(found[x.w]) ? 0 : 1 }];
        });
        out.innerHTML = '';
        out.appendChild(el('p', { class: 'hint' }, shown.length + ' words' + (shown.length > 500 ? ', the first 500 shown' : '') + '. ' + (which === 'none' ? 'Not in wordfreq, with ' + dname + '’s entry where it has one.' : 'Rarest first.')));
        var t = el('div', { class: 'scroll ds-rare' }); t.appendChild(SW.table(['Word', 'Here', 'Zipf', 'First', dname], rows, { cls: ['', 'num', 'num', 'mono', ''] })); out.appendChild(t);
      }
      var tm = null; bar.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(draw, 150); }); bar.addEventListener('change', draw); draw();
    }).catch(function (e) { w8.textContent = e.message; });
    linkLines(c);
    return function () {
      return [SW.tableBlock('Rare words, with ' + ((SW.BENCH.dictionaries || [])[0] || {}).name + '; Zipf frequency from wordfreq', ['Word', 'Count', 'Zipf', dname], shown.map(function (x) {
        var fs = entriesOf(found[x.w]);
        return [x.w, x.n, D.zipf(x.w), fs ? fs.map(function (f) { return (f.how !== 'as written' ? f.as + ': ' : '') + f.entries.map(function (e) { return e.pos + ' ' + e.senses.join(' '); }).join(' | '); }).join(' || ') : ''];
      }))];
    };
  }
  function chapterAt(all, i) { var lo = 0, hi = all.chs.length - 1; while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (all.chs[mid].from <= i) lo = mid; else hi = mid - 1; } return lo; }

  // ---------- 15 a model of the difference ----------
  var MODEL_LEDE = 'How well the words tell two sets of passages apart. The texts are cut into chunks of 300 words; each chunk is described by its rates of the most frequent words (as z-scores), and a logistic regression is trained to tell the sets apart. Each chunk’s probability is given by a model that did not see it (five-fold cross-validation), so the accuracy is that of prediction, not of fit. The words with the largest weights are those the model leans on most. At 50% accuracy or below, the sets do not differ in these words (below 50% is what held-out prediction gives when they do not: each fold’s model learns the noise of the chunks it was trained on).';
  function model(chA, chB, n) {
    var X0 = chA.concat(chB), P = TS.profile(X0.map(function (x) { return x.toks; }), { n: n });
    var y = chA.map(function () { return 1; }).concat(chB.map(function () { return 0; }));
    var r = TS.logistic(P.z, y, { folds: 5, c: 0.5, iter: 500 });
    var ws = P.words.map(function (w, j) { return [w, r.w[j]]; }).sort(function (a, x) { return x[1] - a[1]; });
    return { r: r, ws: ws, y: y, X0: X0 };
  }
  function modelShow(out, M, la, lb) {
    var r = M.r, n = M.y.length;
    out.appendChild(el('p', { class: 'ds-acc' }, '<b>' + (100 * r.accuracy).toFixed(0) + '%</b> of ' + n + ' chunks placed correctly by a model that had not seen them (' + M.y.filter(Boolean).length + ' in ' + esc(la) + ', ' + M.y.filter(function (v) { return !v; }).length + ' in ' + esc(lb) + ').'));
    var pts = M.X0.map(function (x, i) { return { x: i, y: r.held[i], label: '', title: x.label + ': ' + (100 * r.held[i]).toFixed(0) + '% ' + la, colour: M.y[i] ? 'var(--amber)' : 'var(--beam)' }; });
    var sc = TS.scatter(pts, { width: 880, height: 240, xlabel: 'chunks, in order (' + la + ' first)', ylabel: 'probability of ' + la });
    out.appendChild(svgBox(sc));
    var g = el('div', { class: 'ds-two' });
    g.innerHTML = '<div><h4>Words that point to ' + esc(la) + '</h4><p>' + M.ws.slice(0, 25).map(function (x) { return wordLink(x[0]) + ' <span class="ds-d up">' + x[1].toFixed(2) + '</span>'; }).join(', ') + '</p></div><div><h4>Words that point to ' + esc(lb) + '</h4><p>' + M.ws.slice(-25).reverse().map(function (x) { return wordLink(x[0]) + ' <span class="ds-d down">' + x[1].toFixed(2) + '</span>'; }).join(', ') + '</p></div>';
    out.appendChild(g);
    return [TS.figure(sc, 'Held-out probability of ' + la + ' for each chunk; accuracy ' + (100 * r.accuracy).toFixed(0) + '%'),
      SW.tableBlock('Weights of the model (' + la + ' against ' + lb + ')', ['Word', 'Weight'], M.ws.map(function (x) { return [x[0], x[1].toFixed(3)]; }))];
  }
  function chunked(chs, size) {
    var out = [];
    chs.forEach(function (ch) { TS.chunks(ch.toks, size).forEach(function (t, i) { out.push({ toks: t, label: ch.label + ', chunk ' + (i + 1) }); }); });
    return out;
  }
  function modelLens(b, el0) {
    var blocks = [];
    var c = wide(card('A model of the difference', MODEL_LEDE + ' Tick the chapters of the first set; the rest are the second.'));
    var bar = el('div', { class: 'toolbar ds-bar' }), picks = el('div', { class: 'ds-picks' }), out = el('div');
    bar.innerHTML = '<select data-k="n">' + [100, 200, 400].map(function (n) { return opt(n, n + ' most frequent words', n === 200); }).join('') + '</select> <button class="btn" data-k="run">Model</button>';
    c.appendChild(bar); c.appendChild(picks); c.appendChild(out); el0.appendChild(c);
    var w8 = wait(out);
    chaptersOf(b).then(function (all) {
      w8.remove();
      var on = keep('modelA') || all.chs.map(function (ch, i) { return /^Chapter (\d+)$/.test(ch.label) && +/\d+/.exec(ch.label)[0] <= 15 ? ch.label : null; }).filter(Boolean);
      picks.innerHTML = all.chs.map(function (ch, i) { return '<label class="check"><input type="checkbox" data-i="' + i + '"' + (on.indexOf(ch.label) >= 0 ? ' checked' : '') + '> ' + esc(ch.short) + '</label>'; }).join(' ');
      function run() {
        out.innerHTML = '';
        var A = [], B = [];
        SW.$$('input', picks).forEach(function (x) { (x.checked ? A : B).push(all.chs[+x.dataset.i]); });
        keep('modelA', A.map(function (ch) { return ch.label; }));
        var ca = chunked(A, 300), cb = chunked(B, 300);
        if (ca.length < 3 || cb.length < 3) { out.appendChild(el('p', { class: 'hint' }, 'Each set needs at least three chunks of 300 words.')); return; }
        var la = A.length === 1 ? A[0].label : 'the first set', lb = B.length === 1 ? B[0].label : 'the second set';
        blocks = modelShow(out, model(ca, cb, +SW.$('[data-k="n"]', bar).value), la, lb);
      }
      bar.addEventListener('click', function (e) { if (e.target.closest('[data-k="run"]')) run(); });
      bar.addEventListener('change', run); picks.addEventListener('change', run); run();
    }).catch(function (e) { w8.textContent = e.message; });
    linkLines(c);
    return function () { return blocks; };
  }
  function modelAcross(vs, bs, el0) {
    var blocks = [];
    var c = wide(card('A model of the difference between two versions', MODEL_LEDE + ' Here the sets are two versions: can the words tell a chunk of one from a chunk of the other?'));
    var bar = el('div', { class: 'toolbar ds-bar' }), out = el('div');
    var o = vs.map(function (v, i) { return opt(i, short(v)); }).join('');
    bar.innerHTML = '<select data-k="a">' + o + '</select> against <select data-k="b">' + o + '</select> <select data-k="n">' + [100, 200, 400].map(function (n) { return opt(n, n + ' most frequent words', n === 200); }).join('') + '</select>';
    c.appendChild(bar); c.appendChild(out); el0.appendChild(c);
    var ids = vs.map(function (v) { return v.id; });
    SW.$('[data-k="a"]', bar).value = String(Math.max(0, ids.indexOf('ms-first'))); SW.$('[data-k="b"]', bar).value = String(Math.max(0, ids.indexOf('mel-rt')));
    Promise.all(bs.map(chaptersOf)).then(function (alls) {
      function run() {
        out.innerHTML = '';
        var a = +SW.$('[data-k="a"]', bar).value, bb = +SW.$('[data-k="b"]', bar).value;
        if (a === bb) { out.appendChild(el('p', { class: 'hint' }, 'Choose two versions.')); return; }
        blocks = modelShow(out, model(chunked(alls[a].chs, 300), chunked(alls[bb].chs, 300), +SW.$('[data-k="n"]', bar).value), SW.refOf(vs[a].id), SW.refOf(vs[bb].id));
      }
      bar.addEventListener('change', run); run();
    });
    linkLines(c);
    return function () { return blocks; };
  }

  // ---------- for kit/lenses.js, beside js/analyse.js's ----------
  var Lz = SW.BENCH.lenses;
  Lz.list = Lz.list.concat([
    [5, 'Word frequencies', 'The words by how often they occur'],
    [6, 'Word cloud', 'The most frequent words, stepped through the chapters or the stages'],
    [7, 'Distinctive words', 'The words that set one part of the text apart from another'],
    [8, 'Topics', 'Moved to the Topics tab'],
    [9, 'Trends', 'How often words occur through the chapters, and where'],
    [10, 'Collocates', 'The words that occur near a word, and every occurrence in context'],
    [11, 'Vocabulary', 'Distinct words, type-token ratio, Yule’s K, sentence length, Zipf and Heaps'],
    [12, 'Stylometry', 'The chapters compared by their most frequent words: Delta and principal components'],
    [13, 'Words added and erased', 'The words of Melville’s additions against those of his deletions'],
    [14, 'Rare words', 'Words rare in English today, with Webster’s 1913 definitions'],
    [15, 'A model of the difference', 'How well the words tell two sets of passages apart']]);
  Lz.menus = { text: [['The manuscript', [1, 3, 4, 13]], ['Words', [2, 5, 6, 10, 14]], ['Distant reading', [7, 9, 11, 12, 15]]] };
  // lens 8, Topics, is the kit's Topics tab since 0.3.9: its number is kept, not reused, and a link to it
  // opens the tab (the address is put right before kit/shell.js reads it)
  Lz.skip = (Lz.skip || []).concat([8]);
  (function () {
    var q = new URLSearchParams(root.location ? root.location.search : '');
    if (q.get('lens') !== '8') return;
    q.delete('lens'); q.set('tab', 'topics');
    root.history.replaceState(root.history.state, '', '?' + q.toString() + root.location.hash);
  })();
  Object.assign(Lz.one, { 5: freqs, 6: cloudLens, 7: distinctive, 9: trends, 10: collocates, 11: vocabulary, 12: stylometry, 13: revisionWords, 14: rare, 15: modelLens });
  Object.assign(Lz.across, { 5: freqsAcross, 7: distinctiveAcross, 9: trendsAcross, 11: vocabularyAcross, 12: stylometryAcross, 15: modelAcross });

  // ---------- documents for the kit's topics (SW.BENCH.topics.documents) ----------
  // The reading text, or the manuscript at a stage, in chunks of about 400 words within chapters, in the
  // kit's document shape: { id, label, tokens (lower-cased, stopwords kept), meta: { v (the version its lines
  // are in), chapter (its number, or null), chapterLabel, leaf, from: [p, n], to: [p, n], seq (its place in
  // reading order), stage } }.
  // An id is made from the set, the chapter and the chunk's place in it ('rt-c12-2', 'st3-c12-2',
  // 'st3-x-1' outside the reading text), so it is the same from build to build. kit/topics.js and the
  // kit's tools/topics.js call it in the page.
  function chapterNo(label) { var m = /^Chapter (\d+)$/.exec(label); return m ? +m[1] : null; }
  function chapterKey(label) { var n = chapterNo(label); return label === NOT_RT ? 'x' : n != null ? 'c' + n : label.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
  // each line's leaf, '[p:n]' → 'img_7'
  function leafOfLines(b) {
    var o = {};
    b.parts.forEach(function (pt, p) { var cur = null; b.lines[p].forEach(function (L) { var m = LEAF.exec(L.raw); if (m) cur = m[1]; else o[p + ':' + L.n] = cur; }); });
    return o;
  }
  // groups: [{ label, toks, at }], in reading order
  function chunkDocs(prefix, groups, size, leafOf, stage, vid) {
    var docs = [], where = stage == null ? '' : ', ' + (stage ? 'stage ' + STAGES[stage - 1] : 'before revision');
    groups.forEach(function (g) {
      var idx = []; for (var i = 0; i < g.toks.length; i++) idx.push(i);
      var cs = TS.chunks(idx, size);
      cs.forEach(function (ix, k) {
        var a = g.at[ix[0]], z = g.at[ix[ix.length - 1]];
        docs.push({ id: prefix + '-' + chapterKey(g.label) + '-' + (k + 1), label: g.label + (cs.length > 1 ? ', ' + (k + 1) + ' of ' + cs.length : '') + where,
          tokens: ix.map(function (i) { return g.toks[i]; }),
          meta: { v: vid, chapter: chapterNo(g.label), chapterLabel: g.label, leaf: leafOf[a[0] + ':' + a[1]] || null, from: a, to: z, seq: docs.length, stage: stage == null ? null : stage } });
      });
    });
    return docs;
  }
  function readingDocs(size) {
    return SW.build('mel-rt').then(function (b) {
      return chaptersOf(b).then(function (all) { return chunkDocs('rt', all.chs, size, leafOfLines(b), null, 'mel-rt'); });
    });
  }
  // the manuscript at stage st (0 before revision … STAGES.length): the spans Book shows then, line by line,
  // each line in the reading-text chapter of its leaf; leaves not in the reading text kept, as their own
  function stageDocs(st, size) {
    if (!(st >= 0 && st <= STAGES.length)) return Promise.reject(new Error('No stage ' + st + ': the stages are 0 to ' + STAGES.length));
    return Promise.all([SW.build('ms-dipl'), stageStates()]).then(function (r) {
      var b = r[0], doc = r[1].doc, K = SW.book, AT = K.stageMap(STAGES), hands = (SW.BENCH.doc || {}).stageHands || null;
      return chaptersOf(b).then(function (ms) {
        var lineCh = {}, lines = {}, order = [], by = {};
        ms.chs.forEach(function (c) { c.at.forEach(function (a) { lineCh[a[0] + ':' + a[1]] = c.label; }); });
        doc.blocks.forEach(function (bl) {
          if (bl.t === 'pb') return;
          bl.spans.forEach(function (sp) {
            if (!K.shownAt(sp.marks, st, AT, hands) || !ofTheWork(sp)) return;
            if (!lines[sp.n]) { lines[sp.n] = []; order.push(sp.n); }
            lines[sp.n].push(sp.s);
          });
        });
        order.forEach(function (n) {
          var lab = lineCh['0:' + n] || NOT_RT, g = by[lab] = by[lab] || { label: lab, toks: [], at: [] };
          TS.tokens(lines[n].join('').replace(/[⟦⟧\\/]/g, '')).forEach(function (t) { g.toks.push(t); g.at.push([0, n]); });
        });
        var groups = ms.chs.map(function (c) { return by[c.label]; }).filter(Boolean);
        if (by[NOT_RT] && groups.indexOf(by[NOT_RT]) < 0) groups.push(by[NOT_RT]);
        return chunkDocs('st' + st, groups, size, leafOfLines(b), st, 'ms-dipl');
      });
    });
  }
  SW.BENCH.topics = SW.BENCH.topics || {};
  // o: set 'reading' or 'stage', stage (for 'stage'), chunk (400 words)
  SW.BENCH.topics.documents = function (o) {
    o = o || {};
    var size = o.chunk || 400;
    return o.set === 'stage' ? stageDocs(+o.stage, size) : readingDocs(size);
  };
  // the sets a reader may model in the Topics tab, and the tool's --set and --choice
  SW.BENCH.topics.sets = [
    { id: 'reading', label: 'The reading text' },
    { id: 'stage', label: 'The manuscript at a stage', param: 'stage', choices: function () {
      return [[0, 'Before revision']].concat(STAGES.map(function (id, i) { return [i + 1, 'Stage ' + id]; }));
    } }
  ];
  // a document's text at its lines, in its own version: a stage's document in Book at its stage (where
  // the kit has SW.book.openAt), the reading text's in Read; a model made before meta.v (as M-771c6b) is
  // read from the id: rt- the reading text, st<n>- the diplomatic transcription at stage n
  SW.BENCH.topics.open = function (doc) {
    var m = doc.meta || {}, a = m.from, z = m.to || a, st = /^st(\d+)-/.exec(doc.id);
    var v = m.v || (/^rt-/.test(doc.id) ? 'mel-rt' : st ? 'ms-dipl' : null);
    var stage = m.stage != null ? m.stage : st ? +st[1] : null;
    if (!a) return;
    var at = { p: a[0], n0: a[1], n1: z[0] === a[0] ? z[1] : a[1] };
    if (stage != null && SW.book && SW.book.openAt) SW.book.openAt(v, at, stage); else SW.openAt(v, at);
  };
  // a passage's words as the documents have them, for 🧩 Topics on a selection
  SW.BENCH.topics.tokens = function (text) { return TS.tokens(String(text).replace(/[⟦⟧\\/]/g, '')); };
  // what the documents are made from, recorded in a model file so the kit can warn when the text has moved
  // on: the bench's version, and MEL's repository at the commit js/versions.js pins
  SW.BENCH.topics.source = function () {
    var M = (root.SWVersions || {}).MEL || {};
    return { bench: SW.VERSION, sources: [{ name: 'MEL', repo: M.repo, commit: M.commit }] };
  };
  SW.distant = { chaptersOf: chaptersOf, stageStates: stageStates, stageSteps: stageSteps, documents: SW.BENCH.topics.documents };
})(this);
