/* config.js - this bench's settings for bench-kit (kit/). Loaded after kit/base.js, before the rest of the kit and the bench's own scripts.
 * The kit's README lists every setting. */
(function (root) {
  'use strict';
  // the leaves whose photograph has Harvard's colour card on the left (doc.trim)
  var cardLeft = {};
  'img_109 img_110 img_188 img_198 img_202 img_212 img_272 img_316 img_325 img_407 img_408 img_492 img_498 img_532 img_584 img_672 img_801 img_827'.split(' ').forEach(function (id) { cardLeft[id] = 1; });
  root.SW.BENCH = {
    name: 'Melville',
    title: 'Melville Research Bench',
    slug: 'melville',
    store: 'melbench.',
    base: 'https://vector-humanities.github.io/melville/',
    repo: 'https://github.com/vector-humanities/melville',
    // references to the sources (kit/refs.js): [REF: BB-MS, bb-ms.xml:120]
    refs: { names: { 'ms-first': 'BB-MS1', 'ms-final': 'BB-MS', 'ms-dipl': 'BB-MSD', 'mel-rt': 'BB-RT' }, prefix: 'BB-', dir: 'source' },
    forks: [['ms', 'Manuscript'], ['ed', 'Editions']],
    start: 'mel-rt',
    picker: false,                                          // no version picker in the top bar: the versions are in Read ▾
    // prose: no comment mark; a leaf's mark ([img_5]) stands where a routine would begin
    lang: 'plain',
    comment: false,
    routine: '^\\[(img_\\w+)\\]$',
    caseFold: false,
    entry: '',
    // the About box (kit/about.js); purpose, inside and sources are HTML
    about: {
      icon: '<img src="img/icon.svg" alt="" width="40" height="40">',
      project: 'A research project of David M. Berry and Michael Jonik (University of Sussex)',
      cite: { authors: 'Berry, D. M. and Jonik, M.', title: 'Melville Research Bench' },
      doi: '10.5281/zenodo.23715253',                          // every version (Zenodo's concept DOI)
      doiBadge: 'https://zenodo.org/badge/1428696893.svg',      // Zenodo's badge for the repository
      purpose: 'A bench for reading, annotating and comparing Herman Melville’s <i>Billy Budd</i> and his short tales in their versions: the manuscript’s states of revision, the editions made from it, and the magazine and book texts of the tales. The first bench-kit bench for prose.',
      inside: 'The Melville Electronic Library’s TEI, read from MEL’s repository and divided into lines: the manuscript a line of the leaf to a line, the reading text a sentence to a line. Each leaf is marked [img_N], MEL’s image number.',
      sources: 'The Melville Electronic Library (MEL), <a href="https://melville.electroniclibrary.org/versions-of-billy-budd" target="_blank" rel="noopener"><i>Versions of Billy Budd</i></a>, John Bryant and MEL’s editors; its data at <a href="https://github.com/performant-software/mel-website" target="_blank" rel="noopener">github.com/performant-software/mel-website</a>. The manuscript is in the Houghton Library, Harvard University (MS Am 188 (363)); the images of its leaves are Houghton’s, made from Harvard’s own image service and held here with the library’s permission, each with its archival location and source in img/leaves/provenance.csv. Nothing of MEL’s transcription is copied into this repository.',
      code: 'https://github.com/vector-humanities/melville',
      catalogue: { skip: [], held: 'read from MEL' }
    },
    theme: { label: 'Houghton leaf', note: 'iron-gall ink on the manuscript’s cream paper (the default)' },
    accent: { dark: '#e8835a', light: '#1f3f66' },
    // the hands on the manuscript (js/tei.js gives each mark's hand as k); re finds a name written in a
    // line, which these texts do not have
    hands: [
      { k: 'HM', who: 'Herman Melville', re: /(?!)/, colour: '#3d7ab8' },
      { k: 'ESM', who: 'Elizabeth Shaw Melville', re: /(?!)/, colour: '#b0569e' },
      { k: 'RW', who: 'Raymond Weaver', re: /(?!)/, colour: '#c0802a' },
      { k: 'HT', who: 'Houghton Library (foliation)', re: /(?!)/, colour: '#8a8f96' }
    ],
    // the Book view's document (js/tei.js): the stages of composition in order, after Hayford and
    // Sealts (1962) as MEL codes them, a stage letter before its substages. Provisional: MEL's codes
    // that do not fit the pattern are listed in unplaced, to be placed against Hayford and Sealts.
    doc: {
      stages: ['B', 'Ba', 'Bb', 'Bbb', 'Bc', 'Bca', 'Bcb', 'C', 'Ca', 'Caa', 'Cab', 'Cb', 'Cba', 'Cbb', 'Cc', 'Cca',
               'D', 'Da', 'Daa', 'Db', 'E', 'Ea', 'Eaa', 'Eab', 'Eb', 'Ec', 'F', 'Fa', 'Fb', 'G', 'Ga', 'Gab', 'Gb'].map(function (id) {
        return { id: id, label: 'Stage ' + id[0] + (id.length > 1 ? ' ' + id.slice(1) : ''), note: 'MEL’s code St' + id };
      }),
      unplaced: { Stp: 'Stp', X: 'StX', EG: 'StEG', EeF: 'StEeF', Eef: 'StEef', BcCa: 'StBcCa', DA: 'StDA', MEL: 'MEL',
                  ESM: 'ESM, a hand written as a stage', RW: 'RW, a hand written as a stage', Ht: 'Ht, the library’s foliation', v: 'v' },
      // Book (kit/book.js): the manuscript's three states as one text with a slider through the stages
      states: { source: 'ms-dipl', first: 'ms-first', last: 'ms-final', label: 'Manuscript' },
      stageHands: ['HM'], mainHand: 'HM', folioWord: 'Houghton folio',
      words: { page: 'leaf', all: 'Every revision' },
      // the leaves held in img/leaves/, made from Harvard's own image service with the permission of the
      // Houghton Library (30 October 2026); tools/leaves.py fetches them and writes js/leaves.js and
      // img/leaves/provenance.csv (each file's archival location and URLs). A leaf not held is shown from
      // its IIIF service. The enlarged leaf also takes Harvard's full-size image (sharp), fetched by the
      // reader's browser from Harvard's service, while Settings ▸ Book ▸ Full-size leaves is on (js/main.js);
      // read as the leaf opens, so the setting holds at once
      image: function (pb) {
        var held = root.MelLeaves || {}, L = pb.facs && held[pb.facs];
        if (!L) return null;
        return { src: 'img/leaves/' + pb.facs + '.jpg', large: 'img/leaves/' + pb.facs + '-large.jpg',
                 get sharp() { return L.iiif && root.SW.store.get('fullLeaves', true) !== false ? L.iiif + '/full/max/0/default.jpg' : null; } };
      },
      // each leaf's image trimmed of the colour card and ruler Harvard photographs beside it (Settings ▸ Book
      // ▸ The pages' edges; a reader's own trim overrides it). Measured on all 449 leaves, 30 October 2026:
      // the card is on the right of 431, its left edge at 0.861-0.932 of the width, the paper always 0.043
      // or more clear of it; on the left of the leaves in cardLeft (mostly overlays photographed from
      // behind), its right edge at 0.066-0.139, the paper from about 0.17
      trim: function (pb) {
        return cardLeft[pb.facs] ? { l: 0.15 } : { r: pb.facs === 'img_826' ? 0.14 : 0.135 };
      },
      // the credit's line shown before it is opened in the enlarged leaf's details: the library and call number
      imageCreditShort: 'Houghton Library, Harvard University, MS Am 188 (363)',
      imageCredit: 'Houghton Library, Harvard University, Herman Melville papers (MS Am 188-188.6), Box 19, Volume 2: Billy Budd, MS Am 188 (363). Reproduced with the permission of the Houghton Library. The folio and the file’s source are given for every leaf in <a href="https://github.com/vector-humanities/melville/blob/main/img/leaves/provenance.csv" target="_blank" rel="noopener">img/leaves/provenance.csv ↗</a>. <a href="https://hollisarchives.lib.harvard.edu/catalog/hou00338_hou00338c00388" target="_blank" rel="noopener">Finding aid ↗</a> · <a href="http://nrs.harvard.edu/urn-3:FHCL.Hough:4686413" target="_blank" rel="noopener">Harvard’s digital copy ↗</a>',
      versions: ['ms-final', 'mel-rt']
    },
    group: '',                                             // the Hypothesis group's ID, once one is made
    relation: 'Billy Budd, ',
    topShare: false,
    settings: {
      tour: 'A few stops through reading, comparing and annotating; about a minute.',
      groupHint: 'Annotations are shared through a Hypothesis group: paste its link or ID, and a personal API token (hypothes.is/account/developer). Without them, annotations are kept as drafts in this browser and can be exported or published later.',
      groupPlaceholder: 'https://hypothes.is/groups/…',
      themeHint: 'The colours of the whole bench: texts, annotations and figures. The ◐ button in the top bar switches between your last light and dark themes.'
    },
    tag: 'bk:',
    tagsHint: 'e.g. revision, hand, stage, source',
    joinCard: '',
    // the worked examples in Help ▸ Advanced annotation
    annoHelp: {
      manual: 'https://melville.electroniclibrary.org/versions-of-billy-budd', manualName: 'MEL, Versions of Billy Budd',
      start: 'the "Handsome Sailor"', search: 'Handsome Sailor',
      refA: 'DB, BB-MS1, bb-ms.xml', refB: 'MJ, BB-RT, chapter-1.xml',
      noteA: 'Before revision…', noteB: 'In the reading text…', quoteA: 'Before revision…',
      boxA: 'Manuscript, before revision', boxB: 'MEL reading text, chapter 1',
      tryText: 'Melville first wrote `signal figure`', code: '`signal figure`',
      caption: 'A link from an annotation on the reading text to one on the manuscript before revision. The manuscript annotation lists it under Linked from'
    },
    compare: { comment: '', normalised: false, reading: 'Reading', modes: ['text', 'constants'],
               supplied: ['all files', 'Include every file, not only the text'] },
    words: { text: 'Text', font: 'Text font', source: 'Text' },
    comparePrefix: 'Billy Budd: ',
    genealogy: { set: ['ms-first', 'ms-final', 'mel-rt'], line: 'main', lineNames: { main: 'Manuscript to reading text' } },
    figureNum: { print: '#1f3f66', paper: '#1f3f66', phosphor: '#1f3f66' },
    paratexts: { org: 'vector-humanities', repo: 'melville_paratexts', cache: 'melville-paratexts' },   // a private repository, to be made
    examples: { date: 'e.g. 1888-11-16, or 1888', archive: 'e.g. Houghton Library', versions: 'e.g. ms-final, mel-rt',
                refs: 'e.g. [REF: BB-RT, chapter-1.xml:12]', publisher: 'e.g. University of Chicago Press', finding: 'F1' },
    stemma: { root: 'ms-first', lostBetween: {}, skip: [], lostOnTrunk: false },
    edition: {
      built: function () { return ['Read as', 'TEI from MEL, divided into lines']; },
      layout: function (raw) { return String(raw); },
      words: false,
      files: ['all files', 'Include every file']
    },
    // Help ▸ Referencing and versions (kit/helppages.js): how the bench's references read
    refHelp: {
      example: '[REF: BB-RT, chapter-1.xml:12–14]',
      about: '<p><b>BB</b> (<i>Billy Budd</i>), then the version: <b>MS1</b> the manuscript before revision, <b>MS</b> its last readings, <b>MSD</b> the diplomatic transcription, <b>RT</b> MEL’s reading text; then the file (<b>chapter-1.xml</b>) and the bench’s lines (<b>12–14</b>). The lines are the bench’s division of MEL’s text, not the lines of MEL’s XML.</p>',
      more: '<p>Shorter forms: the version alone, <span class="mono">[REF: BB-MS]</span>; a whole file, <span class="mono">[REF: BB-RT, chapter-21.xml]</span>.</p>',
      form: 'Form: [REF: BB<version>, <file>:<lines>], e.g. [REF: BB-RT, chapter-1.xml:12–14].',
      versions: { title: 'The versions', all: true }
    },
    sitemap: false,
    reading: {
      intro: 'Where to begin on the text of Billy Budd and its revision, for the research project of David M. Berry and Michael Jonik (University of Sussex).',
      menu: 'Billy Budd',
      groups: [
        ['The text and its editions', [
          'Bryant, J. (2002) <i>The Fluid Text: A Theory of Revision and Editing for Book and Screen</i>. Ann Arbor: University of Michigan Press.',
          'Hayford, H. and Sealts, M. M., Jr. (eds) (1962) <i>Billy Budd, Sailor (An Inside Narrative): Reading Text and Genetic Text</i>. Chicago: University of Chicago Press.',
          'Melville Electronic Library (n.d.) <i>Versions of Billy Budd</i>. Available at: <a href="https://melville.electroniclibrary.org/versions-of-billy-budd" target="_blank" rel="noopener">https://melville.electroniclibrary.org/versions-of-billy-budd</a>.']],
        ['Reading Melville', [
          'Jonik, M. (2018) <i>Herman Melville and the Politics of the Inhuman</i>. Cambridge: Cambridge University Press.']]
      ]
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
