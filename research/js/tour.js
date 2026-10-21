/*
 * tour.js - this bench's guided tour: its stops, and the offer made on a first visit. The
 * tour itself is bench-kit's (kit/tours.js), which reads them from SW.BENCH. A stop: title,
 * text, and where to go: v (version), tab, find (a pattern for the line to select in Read),
 * b (Compare's other version), focus (a selector to outline).
 */
(function (root) {
  'use strict';
  var B = root.SW.BENCH;
  B.tourOffer = 'A short tour shows how to read, compare and annotate the texts (five stops, about a minute).';
  B.tours = {
    welcome: { title: 'Welcome to the bench', stops: [
      { title: 'Welcome to the bench', v: 'mel-rt', tab: 'read', focus: '#pick-a',
        text: 'The bench holds Billy Budd in its versions: the manuscript before revision, its last readings and its diplomatic transcription, and MEL’s reading text. Choose one here.' },
      { title: 'Reading a text', v: 'mel-rt', tab: 'read', find: /Handsome Sailor/, focus: '.ln.sel',
        text: 'The reading text a sentence to a line, the manuscript a line of the leaf to a line; [img_5] marks the leaf. Click a line to select it (shift-click for a range); the bar below offers Annotate, Copy citation and the rest.' },
      { title: 'Annotating together', v: 'mel-rt', tab: 'read', find: /Handsome Sailor/, focus: '#rd-selbar',
        text: 'Annotations are signed with your initials and dated, and shared with the group through Hypothesis. Set your initials and the group under ⚙ Settings.' },
      { title: 'Compare two versions', v: 'ms-first', tab: 'compare', b: 'ms-final', focus: '#tabs [data-menu="versions"]',
        text: 'Compare sets two versions side by side, as text or leaf by leaf. Genealogy shows how the versions descend.' },
      { title: 'Findings and My notes', v: 'mel-rt', tab: 'findings', focus: '#tabs [data-tab="notes"]',
        text: 'Findings gathers what the group and the bench have established, each with its evidence. My notes is your own tray for writing: figures, excerpts and findings, exported to Word or Markdown.' }
    ] }
  };
})(typeof window !== 'undefined' ? window : globalThis);
