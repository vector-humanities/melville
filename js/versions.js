/*
 * versions.js - the versions this bench holds, and how they descend from one another.
 *
 * Billy Budd from the Melville Electronic Library (MEL): the manuscript in three states and
 * MEL's reading text. MEL's TEI is not copied into this repository: it is read from MEL's
 * own repository (github.com/performant-software/mel-website) at the commit named in MEL,
 * and divided into lines by js/tei.js. A file under mel/ is MEL's; any other is under
 * source/ here.
 */
(function (root) {
  'use strict';

  var SRC = 'source/';
  var MEL = { repo: 'https://github.com/performant-software/mel-website',
              commit: '35c6cd803d81643e1790a0a917c7926a690c6b84',   // 17 June 2026
              raw: 'https://raw.githubusercontent.com/performant-software/mel-website/' };

  // the list's machinery (links, descent, loading) is bench-kit's kit/versionlist.js
  var L = root.SWVersionList || require('../kit/versionlist.js'), files = L.files;

  var BB = 'xml/versions-of-billy-budd/';
  var CHAPTERS = ['dedication'].concat(Array.from({ length: 30 }, function (_, i) { return 'chapter-' + (i + 1); }),
    ['billy-in-the-darbies', 'draft-chapter', 'draft-preface', 'editors-note']);
  function ms(mode) { return [{ src: 'mel/' + BB + 'bb-ms.xml', role: 'text', tei: 'manuscript', mode: mode }]; }

  // fork: the group a version is listed under in the version picker (SW.BENCH.forks)
  // status: 'recovered' (held), 'lost' (known only from the record), 'reconstructed'
  var VERSIONS = [
    { id: 'ms-first', label: 'Manuscript, before revision', date: '1886–1891', sort: 18860000, authors: 'Herman Melville',
      fork: 'ms', status: 'reconstructed', medium: 'Manuscript (Houghton Library, bMS 188 (363)), transcribed by MEL',
      summary: 'The leaves with Melville’s deletions kept and his additions left out, read from MEL’s encoding of the manuscript. The leaves were written over five years, cut, pinned and renumbered, so this is the state of each line before revision, not a draft that existed whole.',
      build: ms('first') },
    { id: 'ms-final', label: 'Manuscript, last readings', date: '1891', sort: 18910900, authors: 'Herman Melville',
      fork: 'ms', status: 'recovered', medium: 'Manuscript (Houghton Library, bMS 188 (363)), transcribed by MEL',
      summary: 'The leaves with Melville’s additions kept and his deletions taken out, as he left them at his death in September 1891. Marks by Elizabeth Shaw Melville and Raymond Weaver are left as they stand.',
      build: ms('final') },
    { id: 'ms-dipl', label: 'Manuscript, diplomatic', date: '1886–1891', sort: 18910500, authors: 'Herman Melville',
      fork: 'ms', status: 'recovered', medium: 'Manuscript (Houghton Library, bMS 188 (363)), transcribed by MEL',
      summary: 'Every reading on the leaves: additions as \\text/, deletions as ⟦text⟧. Revisions by other hands are included.',
      build: ms('diplomatic') },
    { id: 'mel-rt', label: 'MEL reading text', date: '2020s', sort: 20200000, authors: 'John Bryant and MEL’s editors',
      fork: 'ed', status: 'recovered', medium: 'Digital edition (Versions of Billy Budd)',
      summary: 'MEL’s reading text of Billy Budd, Sailor, emended from the manuscript’s last readings, with the draft chapter, draft preface and MEL’s editor’s note. A sentence to a line; MEL’s notes are on its site.',
      build: CHAPTERS.map(function (c) { return { src: 'mel/' + BB + c + '.xml', role: 'text', tei: 'reading' }; }) }
  ];

  var DIALECTS = { text: { label: 'Text (TEI from MEL, divided into lines)', options: {} } };

  VERSIONS.forEach(function (v) {
    v.dialect = 'text';
    v.buildNotes = (v.buildNotes || []).map(function (t) { return { by: 'log', who: 'build log', date: '', text: t }; });
  });

  // MEL's files are fetched once each (the three states of the manuscript share one) and
  // read by js/tei.js; the rest as the kit reads them
  var melCache = {};
  function melText(path) {
    if (!melCache[path]) melCache[path] = fetch(MEL.raw + MEL.commit + '/' + path.replace(/^mel\//, '')).then(function (r) {
      if (!r.ok) throw new Error('MEL’s ' + path.replace(/^mel\//, '') + ': ' + r.status);
      return r.text();
    });
    melCache[path].catch(function () { delete melCache[path]; });
    return melCache[path];
  }
  function load(v, fetchText) {
    if (!v.build) return Promise.resolve({ version: v, parts: [], files: [] });
    return Promise.all(v.build.map(function (b) {
      if (!b.tei) return fetchText(b.src);
      return melText(b.src).then(function (xml) { return b.tei === 'manuscript' ? root.MelTEI.manuscript(xml, b.mode) : root.MelTEI.reading(xml); });
    })).then(function (got) {
      // MEL's files come with a document for the Book view (js/tei.js); the rest as text
      var parts = v.build.map(function (b, i) {
        var t = typeof got[i] === 'string' ? got[i] : got[i].text;
        return { src: b.src, role: b.role, raw: t, text: t, doc: got[i].doc || null, patch: null, title: 1, end: null };
      });
      return { version: v, parts: parts, files: parts.map(function (p) { return { name: p.src.split('/').pop(), text: p.text, doc: false }; }) };
    });
  }

  // ---------- descent ----------
  // the reading text is edited from the manuscript's last readings; the diplomatic
  // transcription is another reading of the same leaves
  var PARENT = { 'ms-final': 'ms-first', 'mel-rt': 'ms-final' };
  var WITNESS = { 'ms-dipl': 'ms-final' };
  var ALSO = {};
  var INFLUENCE = {};
  var LINES = [
    { id: 'main', label: 'Manuscript to reading text', tip: 'mel-rt' }
  ];

  var api = L({ versions: VERSIONS, src: SRC, dialects: DIALECTS, lines: LINES, load: load,
                 parent: PARENT, witness: WITNESS, also: ALSO, influence: INFLUENCE, extra: { MEL: MEL } });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SWVersions = api;
})(this);
