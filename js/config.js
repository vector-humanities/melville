/* config.js - this bench's settings for bench-kit (kit/). Loaded after kit/base.js, before the rest of the kit and the bench's own scripts.
 * The kit's README lists every setting. */
(function (root) {
  'use strict';
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
    // prose: no comment mark; a leaf's mark ([img_5]) stands where a routine would begin
    lang: 'plain',
    comment: false,
    routine: '^\\[(img_\\w+)\\]$',
    caseFold: false,
    entry: '',
    // the About box (kit/about.js); purpose, inside and sources are HTML
    about: {
      icon: '<img src="img/icon.svg" alt="" width="40" height="40">',
      author: 'David M. Berry', citeAuthor: 'Berry, D. M.',
      project: 'A research project of David M. Berry and Michael Jonik (University of Sussex)',
      purpose: 'A bench for reading, annotating and comparing Herman Melville’s <i>Billy Budd</i> and his short tales in their versions: the manuscript’s states of revision, the editions made from it, and the magazine and book texts of the tales. The first bench-kit bench for prose.',
      inside: 'The Melville Electronic Library’s TEI, read from MEL’s repository and divided into lines: the manuscript a line of the leaf to a line, the reading text a sentence to a line. Each leaf is marked [img_N], MEL’s image number.',
      sources: 'The Melville Electronic Library (MEL), <a href="https://melville.electroniclibrary.org/versions-of-billy-budd" target="_blank" rel="noopener"><i>Versions of Billy Budd</i></a>, John Bryant and MEL’s editors; its data at <a href="https://github.com/performant-software/mel-website" target="_blank" rel="noopener">github.com/performant-software/mel-website</a>. The manuscript is in the Houghton Library, Harvard University (bMS 188 (363)); its images are Houghton’s, shown by MEL with the library’s permission. Nothing of MEL’s is copied into this repository.',
      code: 'https://github.com/vector-humanities/melville',
      catalogue: { skip: [], held: 'read from MEL' }
    },
    theme: { label: 'Houghton leaf', note: 'iron-gall ink on the manuscript’s cream paper (the default)' },
    accent: { dark: '#e8835a', light: '#1f3f66' },
    hands: [],
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
