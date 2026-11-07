# Melville Research Bench

**Project:** David M. Berry and Michael Jonik (University of Sussex)  
**Version:** 0.3.37 (bench-kit 1.8.5)  
**Live:** https://vector-humanities.github.io/melville/  
**DOI:** [10.5281/zenodo.23715253](https://doi.org/10.5281/zenodo.23715253) (all versions)

A bench for reading, annotating and comparing Herman Melville's *Billy Budd* and his short tales in their versions: the manuscript's states of revision, the editions made from it, and the magazine and book texts of the tales. It is built on [bench-kit](https://github.com/critical-code-studies/bench-kit), the modules shared by the critical code studies benches (SHRDLU, Spacewar!, ELIZA), and is the first of them whose texts are prose.

## The texts

*Billy Budd* comes from the [Melville Electronic Library](https://melville.electroniclibrary.org/) (MEL), *Versions of Billy Budd*, edited by John Bryant and MEL's editors. **MEL's files are not copied into this repository.** The bench reads MEL's TEI from [MEL's own repository](https://github.com/performant-software/mel-website) at a fixed commit (named in `js/versions.js`), and divides it into lines in the browser (`js/tei.js`):

| Version | Reference | Read as |
|---|---|---|
| Manuscript, before revision | BB-MS1 | Melville's deletions kept, his additions left out |
| Manuscript, last readings | BB-MS | his additions kept, his deletions taken out |
| Manuscript, diplomatic | BB-MSD | every reading: additions `\text/`, deletions `⟦text⟧` |
| MEL reading text | BB-RT | a sentence to a line, regularised spelling, MEL's notes left out |

The manuscript is a line of the leaf to a line. Each leaf begins with a line `[img_N]`, MEL's image number; the reading text marks the leaves it is edited from in the same way, so Collate can set the two side by side leaf by leaf.

The manuscript is in the Houghton Library, Harvard University: Herman Melville papers (MS Am 188-188.6), Box 19, Volume 2, MS Am 188 (363). The images of its 449 leaves are held in `img/leaves/`, made from Harvard's own IIIF image service (560 pixels wide beside the text, and about 1,600 pixels on the long side for the enlarged view), with the permission of the Houghton Library, granted by Leslie A. Morris, Gore Vidal Curator of Modern Books and Manuscripts, on 30 October 2026, for non-commercial research and teaching. Each is credited to the Houghton Library, and `img/leaves/provenance.csv` gives every file's archival location (with Houghton's folio and Harvard's sequence) and its source URLs in Harvard's [digital copy](https://nrs.harvard.edu/URN-3:FHCL.HOUGH:4686413) and [IIIF manifest](https://nrs.harvard.edu/URN-3:FHCL.HOUGH:4686413:MANIFEST:3); see also the [finding aid](https://hollisarchives.lib.harvard.edu/catalog/hou00338_hou00338c00388). `tools/leaves.py` makes them.

## What is here

- **Read**: each version line by line, with a search, annotations shared through a Hypothesis group, citations, export to Word and Markdown, and a reading edition.
- **Book**: the text set in leaves, each beside its image from Houghton; the manuscript as one text with a slider through its stages of composition (Play, Every revision); a second text facing it at the same leaf (Compare); annotation and links from a selection.
- **Text ▾**: lenses on a version, or across the versions, in three groups.
  - **The manuscript**: the revisions on each leaf, how the story grew stage by stage, every revision with its stage, hand and medium, and the words of Melville's additions set against those of his deletions.
  - **Words**: the lines that contain a word, word frequencies, a word cloud stepped through the chapters or the manuscript's stages, collocates with every occurrence in context, and rare words with their definitions in Webster's 1913.
  - **Distant reading**: distinctive words (log-likelihood, or the Mann–Whitney ρ over chunks), topics (latent Dirichlet allocation, seeded), trends and where words occur, the vocabulary's measures (moving-average type-token ratio, Yule's K, sentence length, Zipf and Heaps), stylometry (Burrows's Delta and principal components on the most frequent words), and a model of the difference (a logistic regression trained to tell two sets of passages or two versions apart, judged on chunks it did not see).

  A version is read in its chapters: the reading text's files (MEL's editor's note left out), or for the manuscript its leaves, each in the chapter of the reading text that first marks it. The statistics, the word cloud and the topics are the kit's (`kit/textstats.js`, `kit/wordcloud.js`, and `kit/topics.js` on mallette for the Topics tab, which took the place of lens 8 in 0.3.9); the lenses are `js/analyse.js` and `js/distant.js`, which also gives the Topics tab its documents. 📕 **Look up**, on a word selected in Read or Book, gives its entries in Webster's Revised Unabridged Dictionary (1913) with its frequency in present-day English (wordfreq); `tools/dictionary.py` makes `data/webster.json` and `data/wordfreq.json`.
- **Versions ▾**: each version's record and **Collate** (as text, or leaf by leaf).
- **Findings**, **My notes**, **Paratexts** and **Help**, as in every bench-kit bench.

## Running it locally

Clone with the kit and serve the folder over HTTP:

```
git clone --recurse-submodules https://github.com/vector-humanities/melville
cd melville
python3 -m http.server 8000
```

and open `http://localhost:8000/`. The texts are fetched from GitHub, so the bench needs a network connection.

## Methods: a bibliography

The works the Text ▾ lenses take their methods from.

- Blei, D. M., Ng, A. Y. and Jordan, M. I. (2003) 'Latent Dirichlet allocation', *Journal of Machine Learning Research*, 3, pp. 993–1022.
- Burrows, J. (2002) ''Delta': a measure of stylistic difference and a guide to likely authorship', *Literary and Linguistic Computing*, 17(3), pp. 267–287. https://doi.org/10.1093/llc/17.3.267.
- Covington, M. A. and McFall, J. D. (2010) 'Cutting the Gordian knot: the moving-average type–token ratio (MATTR)', *Journal of Quantitative Linguistics*, 17(2), pp. 94–100. https://doi.org/10.1080/09296171003643098.
- Dunning, T. (1993) 'Accurate methods for the statistics of surprise and coincidence', *Computational Linguistics*, 19(1), pp. 61–74. https://aclanthology.org/J93-1003/.
- Griffiths, T. L. and Steyvers, M. (2004) 'Finding scientific topics', *Proceedings of the National Academy of Sciences*, 101(suppl. 1), pp. 5228–5235. https://doi.org/10.1073/pnas.0307752101.
- Jockers, M. L. (2013) *Macroanalysis: Digital Methods and Literary History*. Urbana: University of Illinois Press.
- Moretti, F. (2000) 'Conjectures on world literature', *New Left Review*, 1, pp. 54–68.
- Mueller, A. C. (2026) *word_cloud* (version 1.9.6). https://github.com/amueller/word_cloud. The word cloud's layout.
- Speer, R. (2023) *wordfreq* (version 3.1.1). https://github.com/rspeer/wordfreq.
- Underwood, T. (2011) 'Identifying diction that characterizes an author or genre: why Dunning's may not be the best method', *The Stone and the Shell*, 9 November. https://tedunderwood.com/2011/11/09/identifying-the-terms-that-characterize-an-author-or-genre-why-dunnings-may-not-be-the-best-method/.
- Underwood, T. (2012) 'Topic modeling made just simple enough', *The Stone and the Shell*, 7 April. https://tedunderwood.com/2012/04/07/topic-modeling-made-just-simple-enough/.
- Underwood, T. (2019) *Distant Horizons: Digital Evidence and Literary Change*. Chicago: University of Chicago Press.
- *Webster's Revised Unabridged Dictionary* (1913). Springfield, MA: G. & C. Merriam. Project Gutenberg ebook 29765.

## Citing the bench

Berry, D. M. and Jonik, M. (2026) *Melville Research Bench*. Zenodo. https://doi.org/10.5281/zenodo.23715253.

The DOI above resolves to the latest version. Each release has its own DOI on Zenodo: version 0.1.25 is [10.5281/zenodo.23715254](https://doi.org/10.5281/zenodo.23715254).

## Licence

The bench's code is GPL-3.0 (`LICENSE`); the kit is GPL-3.0. Melville's texts are in the public domain. The transcriptions, encoding and notes the bench reads are MEL's and remain under MEL's terms. `data/webster.json` is taken from Webster's Revised Unabridged Dictionary (1913), in the public domain in the United States (from Project Gutenberg's text; the definitions only); `data/wordfreq.json` is from wordfreq, CC BY-SA 4.0.

[![DOI](https://zenodo.org/badge/1428696893.svg)](https://doi.org/10.5281/zenodo.23715253)
