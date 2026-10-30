/*
 * main.js - this bench's parts of the frame (bench-kit's kit/shell.js, loaded after it is set):
 * its views, in the order of the tabs. The picker's groups and the version shown first are in
 * js/config.js (forks, start). A bench adds here the language shown beside the picker (lang),
 * links of its own (query), its Help items (help) and the rest (the kit's README); and its row in
 * Settings (a Book tab).
 */
(function (root) {
  'use strict';
  root.SW.BENCH.shell = {
    views: ['read', 'book', 'analyse', 'compare', 'genealogy', 'about', 'findings', 'notes', 'paratexts']
  };
  // Settings ▸ Book: whether Book's enlarged leaf fetches Harvard's full-size image (js/config.js, doc.image)
  root.SW.settings.addTab('book', 'Book', 3);
  root.SW.settings.add({
    tab: 'book',
    html: '<h2>The enlarged leaf</h2><label class="check-row"><span><input type="checkbox" id="set-fullleaves"> Full-size leaves</span><span class="hint">The enlarged leaf in Book is shown from Harvard’s full-size image (about 3,300 pixels, 1.2 MB a leaf), fetched from Harvard’s image service as the leaf opens, with the leaves either side. Off: the bench’s own copy, at 1,600 pixels.</span></label>',
    load: function () { root.SW.$('#set-fullleaves').checked = root.SW.store.get('fullLeaves', true) !== false; },
    save: function () { root.SW.store.set('fullLeaves', root.SW.$('#set-fullleaves').checked); }
  });
})(this);
