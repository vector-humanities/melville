# Melville Research Bench

**Project:** David M. Berry and Michael Jonik (University of Sussex)  
**Version:** 0.1.5 (bench-kit 0.68.0)  
**Live:** https://vector-humanities.github.io/melville/

A bench for reading, annotating and comparing Herman Melville's *Billy Budd* and his short tales in their versions: the manuscript's states of revision, the editions made from it, and the magazine and book texts of the tales. It is built on [bench-kit](https://github.com/critical-code-studies/bench-kit), the modules shared by the critical code studies benches (SHRDLU, Spacewar!, ELIZA), and is the first of them whose texts are prose.

## The texts

*Billy Budd* comes from the [Melville Electronic Library](https://melville.electroniclibrary.org/) (MEL), *Versions of Billy Budd*, edited by John Bryant and MEL's editors. **MEL's files are not copied into this repository.** The bench reads MEL's TEI from [MEL's own repository](https://github.com/performant-software/mel-website) at a fixed commit (named in `js/versions.js`), and divides it into lines in the browser (`js/tei.js`):

| Version | Reference | Read as |
|---|---|---|
| Manuscript, before revision | BB-MS1 | Melville's deletions kept, his additions left out |
| Manuscript, last readings | BB-MS | his additions kept, his deletions taken out |
| Manuscript, diplomatic | BB-MSD | every reading: additions `\text/`, deletions `⟦text⟧` |
| MEL reading text | BB-RT | a sentence to a line, regularised spelling, MEL's notes left out |

The manuscript is a line of the leaf to a line. Each leaf begins with a line `[img_N]`, MEL's image number; the reading text marks the leaves it is edited from in the same way, so Compare can set the two side by side leaf by leaf.

The manuscript is in the Houghton Library, Harvard University (bMS 188 (363)). Its images are Houghton's, shown by MEL with the library's permission; the bench links to them and holds none.

## What is here

- **Read**: each version line by line, with a search, annotations shared through a Hypothesis group, citations, export to Word and Markdown, and a reading edition.
- **Text ▾**: lenses for the revisions on each leaf and for the lines that contain a word, in one version or across them.
- **Versions ▾**: each version's record, **Compare** (as text, or leaf by leaf) and **Genealogy**.
- **Findings**, **My notes**, **Paratexts** and **Help**, as in every bench-kit bench.

## Running it locally

Clone with the kit and serve the folder over HTTP:

```
git clone --recurse-submodules https://github.com/vector-humanities/melville
cd melville
python3 -m http.server 8000
```

and open `http://localhost:8000/`. The texts are fetched from GitHub, so the bench needs a network connection.

## Licence

The bench's code is GPL-3.0 (`LICENSE`); the kit is GPL-3.0. Melville's texts are in the public domain. The transcriptions, encoding and notes the bench reads are MEL's and remain under MEL's terms.
