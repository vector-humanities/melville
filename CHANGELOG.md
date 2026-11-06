# Changelog: the research bench

Changes to the research bench. The bench keeps its own version numbers, raised by 0.0.1 with each change (the `?v=` on every script and stylesheet in `index.html`); this file records the versions published, newest first.

## Unreleased (0.3.17)

- **On bench-kit 1.3.0:** the Library at full width, with facets by kind, decade, author, language and tag, a citation with Copy in each box, and DOIs as links. In Book the leaves show whenever a page opens, with an eye to hide them.

## 0.3.16 (2026-11-06)

- **The Library grows:** 2049 texts (+153), 72 of them held (+9), from the search of the literature on *Billy Budd* under way since 6 November.

## 0.3.15 (2026-11-06)

- **The Library grows:** 1896 texts (+74), 63 of them held (+0), from the search of the literature on *Billy Budd* under way since 6 November.

## 0.3.14 (2026-11-06)

- **The Library grows:** 1822 texts (+32), 63 of them held (+1), from the search of the literature on *Billy Budd* under way since 6 November.

## 0.3.13 (2026-11-06)

- **The Library grows:** 1790 texts (+786), 74 of them held (+36), from the search of the literature on *Billy Budd* under way since 6 November.

## 0.3.12 (2026-11-06)

- **The Library grows:** 1004 texts (+895), 38 of them held (+10), from the search of the literature on *Billy Budd* under way since 6 November.

## 0.3.11 (2026-11-06)

- **The Library grows:** 499 texts (+390), 28 of them held (+0), from the search of the literature on *Billy Budd* under way since 6 November.
- **On bench-kit 0.99.0**, with Genealogy left off: it treats the manuscript as one unit and the reading text as 35 chapters, and so reports no similarity between them. It is gone from Versions ▾, the README and the tour; a link to it still opens the view. Collate, Book's stages and the words added and erased show how the text changed.

## 0.3.10 (2026-11-05)

- **On bench-kit 0.98.0:** the Library, and the kit's other new parts (the Images tab, Open a folder, Book's Compare for up to four texts, dictionaries in any language), which Melville leaves off.
- **The Library**, a tab after Paratexts: 109 texts for wider reading on *Billy Budd*, from the paratexts hunt of 5 November. 28 are public domain and held in `library/files/` (261 MB): Weaver's 1924 printing and his 1928 text, the Somers court of inquiry and court martial, Richard Parker's trials, the 1797 Act against incitement to mutiny, the Gazettes of the Nile and Trafalgar, Southey, William James, *White-Jacket*, Weaver's 1919 article and 1921 biography, John Freeman's *Herman Melville*, and the pamphlets on impressment. 81 link out to where they are published, each with its licence: the later editions and the criticism. Forster's *Aspects of the Novel* and Mumford's *Herman Melville* are public domain in the US only, so they link out, with the group's copies in Paratexts.

## 0.3.9 (2026-11-02)

- **On bench-kit 0.97.1:** Help ▸ Getting set up (in place of Joining the annotation group), two steps for each service (join, then the token) and a checklist in the guide and in ⚙ Settings ▸ Annotations; an empty stored Hypothesis group falls back to the bench's.
- **Lens 8 (Topics) is retired into the Topics tab**, which does what it did on the kit's engine (mallette, as MALLET) and more: published models, the seed check, and the manuscript at any stage without MEL's composition notes. `js/topics.js` (Melville's own LDA) and its three checks are gone. The number 8 is kept and not reused; a link to lens 8 opens the Topics tab.
- **A second topic model, the manuscript before revision** (M-511fea): eight topics of stage 0, made with the reading-text model's settings (K 8, min 2) so that the two differ only in their text. Four of its topics match the reading text's by cosine (Vere and the court, Billy, Claggart, the deck and the watch) and two fall just below; one (back, took, aloft, pipe) recurs in no other seed. Its note in the Topics tab gives the figures.

## 0.3.8 (2026-11-02)

- **On bench-kit 0.96.1:** the Topics tab's parts 2–9 (the topics, documents and topics, a topic through the text, a word's, a document's and a selection's topics, across the stages, steadiness across seeds), Help ▸ Topic models, and topics compared by cosine. Read is a plain tab; versions open from File ▾ ▸ Open a version… (⌘O), and Read keeps its place.
- **The published model rebuilt with the cosine check: M-f555e1** in place of M-771c6b (`topics/M-f555e1.json`; M-771c6b is in the 0.3.7 release). The same trial, MEL's reading text in 80 chunks of about 400 words at 8 and 12 topics, minimum counts 2 and 3, five seeds each, with topics matched across seeds by the cosine of their word probabilities (threshold 0.695, the lower quartile of 357 best-match pairs). K 8, minimum count 2 is again the steadiest (85% recur by cosine, 79% by Jaccard), and its steadiest seed is now 3. Topics 2, 3 and 5–8 recur in all four other seeds, topic 1 (nature, knowledge, power, world, human) in three, topic 4 (war, mutiny, naval, act) in two. The file records the check, the bench at 0.3.8 and MEL's commit; fingerprint 70201ece, as before.
- **For the kit's topic views:** each document names the version its lines are in (`meta.v`: `mel-rt` or `ms-dipl`); `SW.BENCH.topics.open(doc)` opens a reading-text document in Read at its lines, and a stage document in Book at its stage (`SW.book.openAt`, kit 0.96.1); a model made before `meta.v` is read from the id. `SW.BENCH.topics.tokens(text)` gives a passage's words as the documents have them, for 🧩 Topics on a selection. Model ids and fingerprints are unchanged. 412/412.

## 0.3.7 (2026-11-02)

- **The source of a topic model:** `SW.BENCH.topics.source()` gives the bench's version and MEL's repository at the commit `js/versions.js` pins, for the kit to record in each model file and to warn when the text a model was made from has moved on.
- **The manuscript at a stage is Melville's text only.** The stage documents, and the counts the word cloud steps through, left in the notes on the composition that the diplomatic transcription holds: MEL's bracketed notes ("[See leaf image 499 …]", the mount note) and Melville's memos and dates. They now leave them out, as the bench's MS1 and MS readings always have: 1,144 words fewer before revision (65 documents, 80 at the last stage). A check that the notes stay out.
- **On bench-kit 0.95.0, with a Topics tab.** The kit's topics engine (`kit/mallette.js`, `kit/topics.js`, on mallette 0.2.1) is loaded, and the tab shows Melville's first published model, **M-771c6b, "The reading text, eight topics"** (`topics/M-771c6b.json`): MEL's reading text in 80 chunks of about 400 words, the bench's stopwords, minimum word length 3, minimum count 2, seed 5. It was chosen from 8 and 12 topics at minimum counts 2 and 3, five seeds each, as the steadiest: 79% of its topics recur across seeds. Topics 2–5, 7 and 8 recur in all four other seeds, topic 1 in three, topic 6 (war, act, king, officers, martial) in one. The file records the check, the bench's version and MEL's commit. Readers can also run their own models in the tab, of the reading text or the manuscript at any of its 34 states (`SW.BENCH.topics.sets`). The Topics lens (8) stays on `js/topics.js` for now. 399/399.

## 0.3.6 (2026-11-02)

- **On bench-kit 0.94.0. Word cloud on the kit's control:** one toolbar row (text or stages, word count, Look ▾, ⚙, Default View, Share). The looks are the kit's (Oval, the default, as you chose it; Classic, Ink on paper, Poster, Typewriter, Heart); ⚙ holds colour, hue, font, shape, upright, spacing, sizes, bold and capitals, with "keep each word in its place" and "leave out common words". The Format and colour panel is gone, and with it the free colour picker until the kit's control has one.
- **Kept from visit to visit:** the whole view, the step included. **Default View** shows once the view is not the default (chapter by chapter, 80 words, Oval, the first step) and puts it all back, the zoom too.
- **Zoom and export:** − Fit + (50% to 400%), SVG, PNG and My notes, from the kit's frame.
- **Share links** carry the look and only what differs (`cloud=look:oval,shape:heart,src:chapters,…,step:20`); links from 0.3.5 open as before. A shared cloud is not kept as the reader's own until they change it.
- **Back:** a word clicked in the cloud opens its lines with "← Word cloud" in the tab row; it and the browser's Back return to the cloud at the step it was left.
- **Documents for the kit's topics:** `SW.BENCH.topics.documents({ set, stage, chunk })` gives the reading text (`set: 'reading'`), or the manuscript at a stage (`set: 'stage'`, 0 before revision to 33), in 400-word chunks within chapters, in the kit's document shape: ids stable from build to build (`rt-c12-2`, `st3-c12-2`, `st3-x-1`), the chapter's number and label, the leaf, the first and last lines, the place in reading order. Leaves not in the reading text are kept at each stage as their own. The reading text makes 80 documents, the manuscript 69 before revision and 83 at the last stage. The Topics tab stays off until there is a model. 13 more checks.
- 384/384.

## 0.3.5 (2026-11-02)

- **On bench-kit 0.93.0.** **Word cloud:** eight shapes in the Shape menu (rectangle, square, oval, circle, diamond, hexagon, triangle, heart), built from the kit's list (`SW.wordcloud.SHAPES`), so new shapes in the kit appear without a change here. The kit's menu switches (`menusOff`) and Topics tab come with it; the tab stays off until the config sets `topics`. 336/336.
- **Word cloud: Share.** A Share button beside the word count makes a link to the cloud as it is shown: the text or stages, the step, the number of words and the whole format (`?…&lens=6&cloud=src:chapters,step:20,shape:oval,…`). The link opens the cloud as shared without changing the reader's own saved format.
- **Word cloud: new defaults.** Chapter by chapter, many colours, half the words upright, an oval. Settings saved before are stored afresh, so every reader starts from these.
- `js/topics.js` adds its functions to `SW.topics` rather than replacing it, ready for the kit's `topics.js`, which builds on the same object.

## 0.3.4 (2026-11-02)

- **Word cloud:** the cloud fills its card at any window width (it stayed 880 px wide in a wide window, with the rest of the card empty), no taller than three-quarters of the screen. "Keep each word in its place" is on by default only for the words standing at each stage; chapter by chapter, each step is laid out afresh and fills the space. The description is one line, with the rest under "How it works".

## 0.3.3 (2026-11-02)

- **On bench-kit 0.92.1**, whose word-cloud checks now use a fixed width for each letter, so they pass on GitHub's test machines (which lack Georgia) as they do here. Nothing in the bench changes. 308/308.

## 0.3.2 (2026-11-02)

- **On bench-kit 0.92.0**, which takes in Melville's text statistics and word cloud. The lenses use the kit's `kit/textstats.js` and `kit/wordcloud.js`; `js/textstats.js`, `css/textstats.css` and `js/cloud.js` are gone. The word cloud's layout is now the kit's, after Andreas Mueller's word_cloud: small words settle into the gaps between large ones, and a word too big for the space left is drawn smaller rather than dropped. Format and colour works as before.
- **Look up** finds four more words through the kit's -men → -man rule (countrymen, laymen, madmen, oarsmen): `data/webster.json` rebuilt, 5,845 entries.
- The bench's own checks are now the topics (`tests/topics.test.js`); the kit checks the text statistics and the word cloud. 308/308.
- README: word_cloud in the methods bibliography.

## 0.3.1 (2026-11-02)

- **Word cloud (lens 6): Format and colour.** Colour by change from the step before (as before), ink, one colour (the theme's accent, beam, violet, green, red or ink, or one of your own), one colour shaded by count, by size, or many colours (each word keeps its colour from step to step). Font (Georgia, Old style, Sans serif, Typewriter), bold, capitals; words upright (none, a few, half, all); the cloud's shape (rectangle, oval, round, with the sizes scaled to fit); spacing; and how far apart the sizes run (by the log of the count, its square root, or the count). Kept from visit to visit; "keep each word in its place" lays the words out again when a setting changes a word's box. 284/284 checks.

## 0.3.0 (2026-11-02)

- **Text ▾: eleven lenses of distant reading** (lenses 5–15), in three groups (The manuscript, Words, Distant reading), each in this version and most across the versions, with its export:
  - **5 Word frequencies**: the words by count and rate per 10,000, overall or in a chapter.
  - **6 Word cloud**: the most frequent words, stepped through the chapters or the manuscript's stages (the words standing, added or erased at each), each word kept in its place from step to step, green where it has more than at the step before and red where fewer.
  - **7 Distinctive words**: a chapter or run of chapters against the rest or another, by log-likelihood (G²) or the Mann–Whitney ρ over 250-word chunks; across the versions, what revision brought in and took out.
  - **8 Topics**: latent Dirichlet allocation on 400-word chunks, seeded, with the topics in each chapter and the chunks that carry most of a topic.
  - **9 Trends**: words per 10,000 by chapter, and a stroke for each occurrence through the text.
  - **10 Collocates**: the words near a word, by G² and PMI, with every occurrence in context.
  - **11 Vocabulary**: distinct words, moving-average type-token ratio, hapax legomena, Yule's K, sentence length, Zipf's and Heaps' laws with their fitted exponents.
  - **12 Stylometry**: Burrows's Delta and principal components of the chapters on the most frequent words; across the versions, every version's chapters together.
  - **13 Words added and erased**: the words of Melville's additions against those of his deletions, by stage and hand.
  - **14 Rare words**: words rare in present-day English (wordfreq), with their entries in Webster's Revised Unabridged Dictionary (1913), by Webster's field (Nautical, Law, Military …).
  - **15 A model of the difference**: a logistic regression trained to tell two sets of chapters, or two versions, apart, with its accuracy on chunks it did not see and the words it leans on.
- bench-kit 0.91.0: 📕 **Look up** on a word selected in Read or Book, from Webster's 1913 (`data/webster.json`) with the word's frequency (`data/wordfreq.json`), both made by `tools/dictionary.py`; Settings ▸ Dictionaries. File ▾ and Help read "Back up my data" and "Restore my data (non-destructive)".
- bench-kit 0.90.3: A− and A+ set Book's text size while Book is open.
- Book: MEL's note on img_7's mount reads "[This leaf is not part of this stage of the text. Advance the slider (above) to see it.]".
- Tests: 34 checks of the statistics, topics and cloud on small texts worked by hand (`tests/textstats.test.js`); 280 in all.

## 0.2.8 (2026-11-01)

- The bench's name on one line in the top bar.

## 0.2.7 (2026-10-31)

- bench-kit 0.90.2: the enlarged leaf stays open on a click on the image, the grey round it or its details (such as the credit's fold), and closes with ✕, Esc or a click outside.

## 0.2.6 (2026-10-31)

- bench-kit 0.90.1: bookmarks in Book (a red bookmark at a leaf's top right, beside the text and enlarged; 🔖 Bookmarks in the toolbar lists them); the enlarged leaf's details are tighter, with the image's credit folded behind "Houghton Library, Harvard University, MS Am 188 (363)" (doc.imageCreditShort).

## 0.2.5 (2026-10-31)

- bench-kit 0.89.0: a leaf can be rated out of three stars in Book's enlarged leaf (a Rating row in its details, as Paratexts' items and the findings have), shared through the group's annotations.

## 0.2.4 (2026-10-30)

- bench-kit 0.88.0: each leaf's image is trimmed of the colour card and ruler Harvard photographs beside it (on the right of 431 leaves, on the left of 18), beside the text and enlarged; Settings ▸ Book ▸ The pages' edges sets a trim of your own. The enlarged leaf takes the leaf's shape, and its details wrap within their column.

## 0.2.3 (2026-10-30)

- bench-kit 0.87.0: Book's enlarged leaf zooms and moves as Paratexts' pictures do (pinch, wheel, double-click, a bar with Fit and 1:1, 0.5–40×), and is shown from Harvard's full-size image, fetched from Harvard's image service as the leaf opens (Settings ▸ Book ▸ Full-size leaves, on by default; off, the bench's 1,600-pixel copy). Large revision boxes lie beneath the line bands, so every line can be reached.

## 0.2.2 (2026-10-30)

- The kit at 0.86.0: Book draws each leaf's line bands beside the text and in the enlarged leaf, so any line can be selected on the image (hover lights it in the text, a click highlights it in the panel; estimated bands are marked). The enlarged leaf's details give Houghton's folio and Harvard's sequence, e.g. "img_3 (Houghton folio 1, seq. 3)".

## 0.2.1 (2026-10-30)

- A band on each leaf for every line of its main text (pb.lines in Book's document), so every line can be selected on the image, not only the revised ones. MEL gives boxes only for its revisions; the bands are fitted through the boxes of each leaf's deletions and inline additions, with a typical spacing on leaves that have too few, and marked measured where a box lies on the band. Book draws them once bench-kit supports them (requested).

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
