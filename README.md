# Melville Research Bench

**Project:** David M. Berry and Michael Jonik (University of Sussex)  
**Version:** 0.2.3 (bench-kit 0.87.0)  
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
- **Text ▾**: lenses for the revisions on each leaf and for the lines that contain a word, in one version or across them.
- **Versions ▾**: each version's record, **Collate** (as text, or leaf by leaf) and **Genealogy**.
- **Findings**, **My notes**, **Paratexts** and **Help**, as in every bench-kit bench.

## Running it locally

Clone with the kit and serve the folder over HTTP:

```
git clone --recurse-submodules https://github.com/vector-humanities/melville
cd melville
python3 -m http.server 8000
```

and open `http://localhost:8000/`. The texts are fetched from GitHub, so the bench needs a network connection.

## Citing the bench

Berry, D. M. and Jonik, M. (2026) *Melville Research Bench*. Zenodo. https://doi.org/10.5281/zenodo.23715253.

The DOI above resolves to the latest version. Each release has its own DOI on Zenodo: version 0.1.25 is [10.5281/zenodo.23715254](https://doi.org/10.5281/zenodo.23715254).

## Licence

The bench's code is GPL-3.0 (`LICENSE`); the kit is GPL-3.0. Melville's texts are in the public domain. The transcriptions, encoding and notes the bench reads are MEL's and remain under MEL's terms.

[![DOI](https://zenodo.org/badge/1428696893.svg)](https://doi.org/10.5281/zenodo.23715253)
