/*
 * findings-data.js - this bench's own findings and how bench-kit's Findings (kit/findings.js)
 * shows them: the list, its categories and its texts. Loaded before the kit.
 */
(function (root) {
  'use strict';
  var B = root.SW.BENCH;

  // Evidence is a line, found by pattern in a version's text (so it survives renumbering),
  // or a view (tab, b: Collate's other version).
  B.findings = [
    { no: 'F1', kind: 'Revision', cat: 'revision', level: 'key', title: 'The Handsome Sailor was first a “signal figure”',
      text: 'On the first leaves Melville wrote of “some one signal figure” and later revised it to “some superior figure”; MEL’s note at the phrase traces the revision. The leaf before revision and the reading text show the two readings.',
      ev: [{ v: 'ms-dipl', re: /signal/, label: 'the revision on the leaf' }, { v: 'mel-rt', re: /some superior figure/, label: 'the reading text' }, { v: 'ms-first', tab: 'compare', b: 'ms-final', label: 'Collate' }] }
  ];
  // A category is found from the words of a finding (the one with most matches), unless a cat: tag sets it
  B.findingCats = [
    ['revision', 'Revision', /\b(revis\w*|deletions?|additions?|cancel\w*|stages?|leaf|leaves|hands?)\b/gi],
    ['text', 'The text', /\b(spellings?|punctuation|transcri\w*|readings?|emend\w*|words?)\b/gi],
    ['versions', 'Editions and genealogy', /\b(editions?|versions?|editors?|collat\w*|Weaver|Freeman|Hayford|Sealts)\b/gi]
  ];
  B.findingsTitle = 'Findings';
  B.findingsSubtitle = 'What the sources and their comparison show';
  B.findingsIntro = 'What the group and the bench have established, each with its evidence one click away. Crew: the group’s findings, by member. Bench: the bench’s own, with its checks run afresh.';
  B.findingsSide = 'bench';
  B.findingsRecheck = 'Run the checks again, and fetch the group’s findings';
})(typeof window !== 'undefined' ? window : globalThis);
