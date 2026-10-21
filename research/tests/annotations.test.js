/*
 * annotations.test.js - this bench's values for bench-kit's annotation tests
 * (kit/tests/annotations.test.js, loaded after this by annotations.html).
 */
window.BENCH_TESTS = {
  link: { v: 'mel-rt', l: '1:2-3', name: /^see annotation, BB-RT, chapter-1\.xml:2/ },   // a bench link, and its name in print
  text: 'Melville’s “Handsome Sailor” – ⟦signal⟧ \\superior/',   // non-ASCII
  lineKey: ['\tQuite  surround   SOME superior', 'quite surround some superior']   // a line and its key: no comment mark, spacing and case aside
};
