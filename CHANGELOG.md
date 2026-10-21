# Changelog: the research bench

Changes to the research bench. The bench keeps its own version numbers, raised by 0.0.1 with each change (the `?v=` on every script and stylesheet in `index.html`); this file records the versions published, newest first.

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
