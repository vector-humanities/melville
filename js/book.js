/*
 * book.js - Book: the text set as a page, from the document js/tei.js makes beside each version's
 * lines (b.doc). A prototype in this bench, until bench-kit's Book view (render.js) replaces it.
 *
 * The manuscript is drawn from the diplomatic transcription's document, which holds every
 * revision with its hand and stage, so one page serves all three states: a slider runs through
 * the stages of composition (SW.BENCH.doc.stages), from before revision to the last readings,
 * and the revisions come and go as it moves. At a stage, an addition is shown and a deletion
 * applied when its stage is at or before it; a reinstated deletion comes back at its own stage;
 * a stage not yet placed is applied from the first. Marks in other hands (Elizabeth Shaw
 * Melville, Raymond Weaver) are shown only in Diplomatic, which draws every revision: additions
 * raised, deletions struck, each with its hand and stage. The reading text is set in paragraphs,
 * MEL's notes on its references, its regularisations with the manuscript's spelling.
 * Leaf breaks are small images of the leaf from MEL's IIIF service. &stage= in a link sets the
 * stage. Annotations stay in Read.
 */
(function (root) {
  'use strict';
  var SW = root.SW, B = SW.BENCH, V = root.SWVersions;
  var STAGES = (B.doc && B.doc.stages || []).map(function (s) { return s.id; });
  var AT = {}; STAGES.forEach(function (id, i) { AT[id] = i + 1; });
  var HANDS = {}; (B.hands || []).forEach(function (h) { HANDS[h.k] = h; });
  var view = SW.$('#view-book');
  var st = { stage: STAGES.length, dipl: false, colour: true, play: null, text: null };
  var page = null, spans = [], blocks = [];

  // a link's stage (&stage=Fa, or 0 for before revision), read now: kit/shell.js rewrites the
  // address as the bench starts
  var linked = (function () {
    var m = /[?&]stage=([^&]+)/.exec(location.search);
    return m ? (m[1] === '0' ? 0 : (AT[decodeURIComponent(m[1])] || STAGES.length)) : null;
  })();
  function writeStage() {
    var u = new URL(location.href);
    if (SW.state.tab === 'book' && st.text === 'ms') u.searchParams.set('stage', st.stage ? STAGES[st.stage - 1] : '0');
    else u.searchParams.delete('stage');
    history.replaceState(null, '', u);
  }

  // ---------- a span at a stage ----------
  // the stage at which a mark takes effect: its place in the list, 1 for one not placed or none
  function at(m) { return m.change && AT[m.change] ? AT[m.change] : 1; }
  function shownAt(marks, s) {
    if (s === 0) return !marks.some(function (m) { return m.k === 'added'; });
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      if (m.k === 'added' && m.hand !== 'HM' && m.hand) return false;
      if (m.k === 'added' && at(m) > s) return false;
      if (m.k === 'erased' && (m.hand || 'HM') === 'HM' && at(m) <= s) {
        var back = marks.slice(0, i).some(function (r) { return r.k === 'reinstated' && at(r) <= s; });
        if (!back) return false;
      }
    }
    return true;
  }
  function describe(marks) {
    return marks.map(function (m) {
      var who = m.hand && HANDS[m.hand] ? HANDS[m.hand].who : '';
      var stage = m.change ? (AT[m.change] ? 'stage ' + m.change : 'unplaced (' + m.change + ')') : '';
      var name = { added: 'Added', erased: 'Deleted', reinstated: 'Reinstated', uncertain: 'Uncertain reading', sic: 'So in the manuscript', regularised: 'Regularised by MEL', metamark: 'Note in the manuscript' }[m.k];
      if (!name) return '';
      if (m.k === 'regularised') return name + (m.orig ? ': the manuscript reads “' + m.orig + '”' : '');
      return [name, who && who !== 'Herman Melville' ? 'by ' + who : '', stage].filter(Boolean).join(', ');
    }).filter(Boolean).join('; ');
  }

  // ---------- drawing ----------
  function noteText(doc) {
    var out = {};
    doc.blocks.forEach(function (bl) { if (bl.t === 'note') out[bl.id] = bl.spans.map(function (s) { return s.s; }).join('').trim(); });
    return out;
  }
  function leafBlock(bl) {
    var d = SW.el('div', { class: 'bk-leaf' });
    var label = bl.facs.replace(/^img_/, 'leaf image ');
    if (bl.iiif) {
      var a = SW.el('a', { href: bl.iiif.id + '/full/max/0/default.jpg', target: '_blank', rel: 'noopener', title: 'The leaf (' + bl.facs + '), from MEL’s images of the Houghton Library manuscript' });
      a.appendChild(SW.el('img', { src: bl.iiif.id + '/full/,160/0/default.jpg', alt: label, loading: 'lazy' }));
      d.appendChild(a);
    }
    d.appendChild(SW.el('span', { class: 'bk-leaf-n' }, bl.facs));
    return d;
  }
  function spanEl(sp, notes) {
    var e = document.createElement('span');
    e.textContent = sp.s;
    var cls = ['bk-s'], title = describe(sp.marks);
    sp.marks.forEach(function (m) {
      if (m.k === 'added') cls.push('bk-add');
      else if (m.k === 'erased') cls.push('bk-del');
      else if (m.k === 'reinstated') cls.push('bk-stet');
      else if (m.k === 'uncertain') cls.push('bk-unc');
      else if (m.k === 'regularised') cls.push('bk-reg');
      else if (m.k === 'metamark') cls.push('bk-meta');
      else if (m.k === 'hi' && m.rend) cls.push('bk-' + m.rend.replace(/[^\w-]/g, ''));
      else if (m.k === 'ref' && notes[m.note]) { cls.push('bk-ref'); title = (title ? title + '. ' : '') + notes[m.note]; }
      if ((m.k === 'added' || m.k === 'erased') && m.hand && HANDS[m.hand]) e.style.setProperty('--hand', HANDS[m.hand].colour);
    });
    e.className = cls.join(' ');
    if (title) e.title = title;
    return e;
  }
  function draw(doc, kind) {
    var notes = noteText(doc), box = SW.el('div', { class: 'bk-page bk-' + kind });
    doc.blocks.forEach(function (bl) {
      if (bl.t === 'note') return;
      if (bl.t === 'pb') { box.appendChild(leafBlock(bl)); return; }
      var tag = bl.t === 'head' ? 'h3' : 'p';
      var cls = 'bk-' + bl.t + (bl.cont ? ' bk-cont' : '') + (bl.t === 'ab' && bl.rend ? ' bk-margin' : '');
      var el = SW.el(tag, { class: cls });
      var last = null, tail = '', mine = [];
      bl.spans.forEach(function (sp) {
        // the manuscript's lines run on as prose: a space between one line and the next, unless
        // the line ends in a hyphen (a space beside another collapses, whatever is shown)
        if (kind === 'ms' && last != null && sp.n != null && sp.n !== last && !/-$/.test(tail)) el.appendChild(document.createTextNode(' '));
        if (sp.n != null) { last = sp.n; tail = sp.s; }
        var e = spanEl(sp, notes);
        e.dataset.n = sp.n == null ? '' : sp.n;
        el.appendChild(e);
        var x = { el: e, marks: sp.marks, text: /\S/.test(sp.s) };
        spans.push(x); mine.push(x);
      });
      blocks.push({ el: el, spans: mine });
      if (bl.rend && kind === 'ms') el.dataset.where = bl.rend.replace(/-/g, ' ');
      box.appendChild(el);
    });
    return box;
  }
  // the page at the slider's stage: each span shown, or closed up
  function apply(animate) {
    if (!page) return;
    page.classList.toggle('bk-dipl', st.dipl);
    page.classList.toggle('bk-hands', st.colour);
    // a span going out fades and closes up, then leaves the line (so the spaces either side of it
    // close up too); one coming in returns to the line, then opens, and is marked for a moment
    var arriving = [], leaving = [];
    spans.forEach(function (x) {
      x.on = st.dipl ? true : shownAt(x.marks, st.stage);
      var was = !x.el.classList.contains('bk-off');
      if (x.on === was) return;
      x.el.classList.remove('bk-new');
      if (x.on) { x.el.classList.remove('bk-gone'); if (animate) arriving.push(x.el); else x.el.classList.remove('bk-off'); }
      else { x.el.classList.add('bk-off'); if (animate) leaving.push(x.el); else x.el.classList.add('bk-gone'); }
    });
    if (arriving.length) requestAnimationFrame(function () { requestAnimationFrame(function () { arriving.forEach(function (e) { e.classList.remove('bk-off'); e.classList.add('bk-new'); }); }); });
    if (leaving.length) setTimeout(function () { leaving.forEach(function (e) { if (e.classList.contains('bk-off')) e.classList.add('bk-gone'); }); }, 480);
    // a passage with nothing to show at this stage (a margin holding only a folio number) is left out
    blocks.forEach(function (bl) { bl.el.hidden = !bl.spans.some(function (x) { return x.on && x.text; }); });
    var lab = SW.$('#bk-stage-l');
    if (lab) lab.textContent = st.dipl ? 'Every revision' : st.stage === 0 ? 'Before revision' : st.stage === STAGES.length ? 'Last readings (stage ' + STAGES[st.stage - 1] + ')' : 'Stage ' + STAGES[st.stage - 1] + ' (' + st.stage + ' of ' + STAGES.length + ')';
    var r = SW.$('#bk-stage'); if (r) { r.value = st.stage; r.disabled = st.dipl; }
    writeStage();
  }

  function toolbar() {
    var tb = SW.el('div', { class: 'toolbar bk-bar' });
    var ms = st.text === 'ms';
    tb.innerHTML =
      '<span class="bk-texts"><button class="btn' + (ms ? ' on' : '') + '" data-text="ms">Manuscript</button><button class="btn' + (!ms ? ' on' : '') + '" data-text="rt">Reading text</button></span>' +
      (ms ? '<span class="sep"></span><button class="btn ghost" id="bk-prev" title="The stage before">◀</button>' +
        '<input type="range" id="bk-stage" min="0" max="' + STAGES.length + '" step="1" value="' + st.stage + '" aria-label="Stage of composition">' +
        '<button class="btn ghost" id="bk-next" title="The stage after">▶</button>' +
        '<button class="btn ghost" id="bk-play" title="Run through the stages">' + (st.play ? '❚❚' : 'Play') + '</button>' +
        '<span class="bk-stage-l" id="bk-stage-l"></span><span class="sep"></span>' +
        '<label class="check" title="Every revision at once: additions raised, deletions struck, each with its hand and stage"><input type="checkbox" id="bk-dipl"' + (st.dipl ? ' checked' : '') + '> diplomatic</label>' +
        '<label class="check" title="Revisions coloured by hand: Herman Melville, Elizabeth Shaw Melville, Raymond Weaver"><input type="checkbox" id="bk-hands"' + (st.colour ? ' checked' : '') + '> hands</label>' : '') +
      '<span class="sep"></span><span class="hint">A prototype; annotate in Read.</span>';
    tb.addEventListener('click', function (e) {
      var t = e.target.closest('[data-text]');
      if (t && t.dataset.text !== st.text) { stop(); SW.select(t.dataset.text === 'ms' ? 'ms-dipl' : 'mel-rt'); return; }
      if (e.target.id === 'bk-prev') { stop(); st.stage = Math.max(0, st.stage - 1); apply(true); }
      if (e.target.id === 'bk-next') { stop(); st.stage = Math.min(STAGES.length, st.stage + 1); apply(true); }
      if (e.target.id === 'bk-play') { if (st.play) stop(); else play(); }
    });
    tb.addEventListener('input', function (e) { if (e.target.id === 'bk-stage') { stop(); st.stage = +e.target.value; apply(true); } });
    tb.addEventListener('change', function (e) {
      if (e.target.id === 'bk-dipl') { st.dipl = e.target.checked; apply(false); }
      if (e.target.id === 'bk-hands') { st.colour = e.target.checked; apply(false); }
    });
    return tb;
  }
  function play() {
    if (st.dipl) { st.dipl = false; var c = SW.$('#bk-dipl'); if (c) c.checked = false; }
    if (st.stage >= STAGES.length) st.stage = 0;
    apply(true);
    st.play = setInterval(function () {
      if (st.stage >= STAGES.length) { stop(); return; }
      st.stage++; apply(true);
    }, 900);
    var p = SW.$('#bk-play'); if (p) p.textContent = '❚❚';
  }
  function stop() {
    if (st.play) clearInterval(st.play);
    st.play = null;
    var p = SW.$('#bk-play'); if (p) p.textContent = 'Play';
  }

  // the leaf of the line selected in Read, to open the page there
  function leafOf(b) {
    var sel = SW.state.sel; if (!sel || !b.lines[sel.p]) return null;
    for (var n = sel.n0; n >= 1; n--) { var m = /^\[(img_\w+)\]$/.exec((b.lines[sel.p][n - 1] || {}).raw || ''); if (m) return m[1]; }
    return null;
  }
  function show(b) {
    stop();
    var ms = /^ms-/.test(b.v.id);
    st.text = ms ? 'ms' : 'rt';
    if (linked != null) { st.stage = linked; linked = null; }
    else if (b.v.id === 'ms-first') st.stage = 0;
    else if (b.v.id === 'ms-final') st.stage = STAGES.length;
    if (b.v.id === 'ms-dipl') st.dipl = true;
    else st.dipl = false;
    var leaf = leafOf(b);
    view.innerHTML = '';
    view.appendChild(toolbar());
    var wrap = SW.el('div', { class: 'bk-wrap' });
    wrap.appendChild(SW.el('p', { class: 'hint pad' }, 'Setting the page…'));
    view.appendChild(wrap);
    (ms ? SW.build('ms-dipl') : Promise.resolve(b)).then(function (d) {
      if (!d.doc) { wrap.innerHTML = '<p class="pad hint">This version has no document to set as a page.</p>'; return; }
      wrap.innerHTML = '';
      spans = []; blocks = [];
      d.doc.forEach(function (doc, p) {
        if (!doc) return;
        if (!ms && d.parts.length > 1) wrap.appendChild(SW.el('div', { class: 'bk-file' }, d.parts[p].src.split('/').pop().replace(/\.xml$/, '').replace(/-/g, ' ')));
        page = draw(doc, ms ? 'ms' : 'rt');
        wrap.appendChild(page);
      });
      // one page element for apply(): the wrap holds them all
      page = wrap;
      apply(false);
      if (leaf) { var at_ = wrap.querySelector('.bk-leaf-n'); wrap.querySelectorAll('.bk-leaf-n').forEach(function (x) { if (x.textContent === leaf) at_ = x; }); if (at_) at_.scrollIntoView({ block: 'start' }); }
    }).catch(function (e) { wrap.innerHTML = '<p class="pad badge err">' + SW.esc(e.message) + '</p>'; });
  }
  SW.views.book = { show: show, hide: function () { stop(); writeStage(); } };
})(typeof window !== 'undefined' ? window : globalThis);
