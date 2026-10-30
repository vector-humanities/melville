# Changelog: the research bench

Changes to the research bench. The bench keeps its own version numbers, raised by 0.0.1 with each change (the `?v=` on every script and stylesheet in `index.html`); this file records the versions published, newest first.

## 0.2.0 (2026-10-30)

- The Houghton version. The manuscript's 449 leaves are made from Harvard's own IIIF image service and held in the bench with the permission of the Houghton Library, Harvard University (30 October 2026). Every file's archival location (Herman Melville papers, MS Am 188-188.6, Box 19, Volume 2, MS Am 188 (363), with Houghton's folio and Harvard's sequence) and its source URLs are in img/leaves/provenance.csv. Book's enlarged leaf links to the page in Harvard's image service, and its credit names the Houghton Library.

## 0.1.28 (2026-10-30)

- The manuscript's 449 leaves held in the bench (img/leaves/), with the permission of the Houghton Library, Harvard University (30 October 2026): 560 pixels wide beside the text, no more than 1,600 on the long side for the enlarged view, each credited to Houghton with the call number and links to the finding aid and Harvard's digital copy. Book shows them from the bench's own files, so they come as fast as the bench does. tools/leaves.py fetches them.

## 0.1.27 (2026-10-29)

- The DOI in the About box: a DOI row with Zenodo's badge (10.5281/zenodo.23715253, every version), and Cite as ending with it. Only a release published on GitHub gets a DOI of its own (v0.1.25 is 10.5281/zenodo.23715254), so the row gives the DOI of every version. The kit at 0.84.4.

## 0.1.26 (2026-10-27)

- The bench's DOI from Zenodo, 10.5281/zenodo.23715253 (all versions; v0.1.25 is 10.5281/zenodo.23715254), in the README with a citation. The kit at 0.84.0 (its project builder, which this bench does not use, and a Beside menu in Read for a version of several files).

## 0.1.25 (2026-10-27)

- The kit at 0.80.0: the enlarged leaf zooms and pans; a link (Share, in the leaf's details and in the panel) opens Book on the same leaf, zoom, stage and highlighted revision; a leaf whose text MEL transcribes elsewhere leads there (img_7's lower slip to img_9).

## 0.1.24 (2026-10-25)

- Where MEL notes that a leaf's text is transcribed with another leaf (img_7's lower slip on img_9; img_521 and img_521b; img_561b on img_561), the manuscript's document records it on the leaf break (elsewhere: [{ to, note }]) for Book to lead there.

## 0.1.23 (2026-10-25)

- The kit at 0.79.0: a click on a revision's box keeps its text highlighted until the next action ("Highlight this in panel"); in the enlarged leaf, a box under the pointer shows its words, what the revision is, and its stage and hand.

## 0.1.22 (2026-10-22)

- The kit at 0.78.0: the enlarged leaf has the revision boxes too (lit on hover, the stage's in red, a click going to the text); in Compare with, a passage of the reading text under the pointer lights its leaf in the manuscript, and the boxes of the revisions it holds.

## 0.1.21 (2026-10-22)

- The kit at 0.77.0: Book joins the text and the leaf. Hover a revision and its box lights on the leaf; with the pointer on the leaf every revision's box shows faintly, and a click on one goes to its text; the slider lights the boxes of the revisions made at its stage.

## 0.1.20 (2026-10-22)

- Text ▾ gains two lenses: How the story grew (the words standing in each chapter at each stage of composition, by Book's rule) and Revisions (every revision, with its before and after, stage, hand and medium, searchable, each a link into Read). The manuscript's document now numbers each revision, pairs MEL's substitutions, and gives each revision's medium and its zone on the leaf, with the zones' boxes and each leaf's size.

## 0.1.19 (2026-10-22)

- The kit at 0.76.0: Book's Strike deletions, beside the slider; deletions made up to the stage stay in the text, struck through in red, drawn through as the slider reaches them, with the stage's own revisions marked more strongly (&del=strike).

## 0.1.18 (2026-10-22)

- The manuscript's call number corrected to MS Am 188 (363), as Houghton's finding aid gives it (MEL's page has bMS 188 (363)). The kit at 0.75.0 (a bench may give Book its own leaf images; this one still draws them from MEL).

## 0.1.17 (2026-10-22)

- The kit at 0.74.3 (Collate's description in Versions ▾ names By function only for Lisp; unchanged here).

## 0.1.16 (2026-10-22)

- The kit at 0.74.2: Versions ▾ describes Collate from this bench's modes, “Two versions collated: line by line and by leaf”.

## 0.1.15 (2026-10-22)

- The kit at 0.74.1: with no version picker, the kit itself keeps the bench's name in the top bar down to 380 px, and this bench's own rules for it are gone.

## 0.1.14 (2026-10-22)

- The kit at 0.74.0: Versions ▸ Compare is now Versions ▸ Collate, and Book's control for a second text facing the first is Compare (“with MEL reading text”); the tour, a finding and the README follow. The bench's name back in the top bar: the kit hid it below 1240 px wide to make room for the version picker, which this bench leaves out.

## 0.1.13 (2026-10-21)

- The kit at 0.73.0: Book's toolbar works again (since 0.72.0 every click was taken as an image-size click, so the texts, ◀ ▶ ▶▶ and Read here did nothing); the leaf images sized by a slider, with Off to fold them away; ◀ ▶ and ✕ in the enlarged leaf; Compare with in place of Beside, and no lag when the two texts scroll together.

## 0.1.12 (2026-10-21)

- The kit at 0.72.1 (its release tool only).

## 0.1.11 (2026-10-21)

- The kit at 0.72.0: Book's Images ▸ Large, Small or Off (Off folds the leaf images away, a ▣ at each leaf break opens one; &img= in a link); a reinstatement in Book brings back only the deletion it encloses; ◐ checks the theme it goes to. The manuscript's last readings corrected by the same rule: a reinstated phrase no longer brings back a word deleted within it (“no perceptible trace of the vainglorious”, where Read had “perceptableperceptible” and “vaingloryvainglorious”). And ?v= set right again (0.1.10 was published with ?v=c1).

## 0.1.10 (2026-10-21)

- ◐ works again in a browser that saw the bench before 0.1.1: the light and dark themes it keeps are checked against the bench's themes as it starts (it had kept the bench's own theme, light since 0.1.1, as its dark one, so ◐ went from light to light).

## 0.1.9 (2026-10-21)

- Book from the kit (0.71.0) in place of this bench's prototype: the text set in leaves, each beside its image from Houghton; the manuscript's three states as one text with a slider through the stages of composition, Play and Every revision; Beside, a second text facing the first at the same leaf; annotation, citation and links from a selection; 📖 Book from Read. The prototype (js/book.js) removed.

## 0.1.8 (2026-10-21)

- Book (a prototype, until bench-kit's Book view): the text set as a page from the document js/tei.js makes; the manuscript through its stages of composition on a slider, revisions coming and going as it moves, with Play, a diplomatic mode and hands in colour; the reading text in paragraphs with MEL's notes; leaves as small images from MEL's IIIF service; &stage= in a link. The kit at 0.70.0: picker: false leaves the version picker out of the top bar.

## 0.1.7 (2026-10-21)

- The version picker taken off the top bar (the versions are chosen from Read ▾); the welcome tour's first stop points at Read ▾.

## 0.1.6 (2026-10-21)

- The kit at 0.69.0: no Author row in the About box; Cite as names the project's leads (Berry, D. M. and Jonik, M.); A Bench Kit project at its foot.

## 0.1.5 (2026-10-21)

- The bench's mark: a mariner's astrolabe hung from its ring, drawn in hollow beams in perspective after the Vector Humanities mark (navy on paper, sailcloth on night, the shackle in the accent colour); face on at small sizes on a paper tile, as the icon, favicon and About box's mark. Its generator is tools/mark/astrolabe.py.

## 0.1.4 (2026-10-21)

- The Book view's document: js/tei.js gives each version, beside its lines, a document of blocks and spans (b.doc), each span keyed to its line and its place in it, with marks for additions, deletions, reinstated deletions, hands and stages; the stages of composition and the hands in js/config.js; tests/doc.test.js checks the documents against the lines. One line in chapter 25 corrected: “neck—a conventional”, without the space that MEL's choice element held.

## 0.1.3 (2026-10-21)

- The kit at 0.68.0: the Project row in the About box names the project as David M. Berry's and Michael Jonik's; Compare offers Text and Leaves only, with no comment filter; the text is called text, not code, in Settings, Read and the size toast.

## 0.1.2 (2026-10-21)

- The project named as David M. Berry's and Michael Jonik's in the About box (Author, Purpose), Help ▸ What you should read and the welcome tour.

## 0.1.1 (2026-10-21)

- The bench at the root of the site (https://vector-humanities.github.io/melville/), no longer under research/; the kit at kit/.
- Two colour themes of its own: Houghton leaf, the default (iron-gall ink on the manuscript's cream paper, man-of-war navy), and Night watch for ◐ (sailcloth on a sea-navy ground, the orange-red of Aldebaran for the accent). The texts in a serif at 15 px unless Settings names another font or size.

## 0.1.0 (2026-10-21)

- First version, from bench-template 0.1.96 with the kit at 0.67.0. *Billy Budd* in four versions read from the Melville Electronic Library's TEI at MEL's commit 35c6cd8: the manuscript before revision, its last readings and its diplomatic transcription (`js/tei.js`), and MEL's reading text a sentence to a line. Leaves marked `[img_N]`; Compare's second mode is Leaves; lenses for revisions by leaf and for words. The Functional overview and the site map are left out.
