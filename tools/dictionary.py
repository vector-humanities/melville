"""Write the bench's dictionary and word frequencies, for bench-kit's dictionary.js (📕 Look up in Read and
Book, and the Rare words lens, js/distant.js):
  data/wordfreq.json   how common each word of the texts is in present-day English
  data/webster.json    the entries of Webster's 1913 that the texts' words need (by bench-kit's tools/dict-build.js)

The words are every word in MEL's TEI of Billy Budd (bb-ms.xml and the reading text's files, at the
commit js/versions.js reads), the deleted readings and MEL's notes included, so that any version can
look its words up. How common: wordfreq's Zipf frequency (Speer, wordfreq 3, CC BY-SA 4.0), the base-10
logarithm of a word's occurrences per thousand million words (a word once in a million is 3); its
corpora are present-day (Wikipedia, subtitles, news, books, the web), not the nineteenth century's.
Definitions: Webster's Revised Unabridged Dictionary (1913), from Project Gutenberg's plain text
(ebook 29765, in the public domain in the United States), only its definitions taken; the entries kept
are those of the words and the lemmas dictionary.js tries for them.

uv run --python "$(which python3)" --with wordfreq python tools/dictionary.py     (from the repository's root)
The dictionary's text is fetched once into _tmp/webster/ (29 MB); --refetch to fetch it again.
"""
import json, os, re, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FREQ = os.path.join(ROOT, 'data', 'wordfreq.json')
DICT = os.path.join(ROOT, 'data', 'webster.json')
WEB = os.path.join(ROOT, '_tmp', 'webster', 'pg29765.txt')
WEB_URL = 'https://www.gutenberg.org/cache/epub/29765/pg29765.txt'
VERSIONS = open(os.path.join(ROOT, 'js', 'versions.js'), encoding='utf-8').read()
COMMIT = re.search(r"commit: '([0-9a-f]{40})'", VERSIONS).group(1)
RAW = 'https://raw.githubusercontent.com/performant-software/mel-website/' + COMMIT + '/xml/versions-of-billy-budd/'
FILES = ['bb-ms.xml', 'dedication.xml'] + ['chapter-%d.xml' % i for i in range(1, 31)] + \
        ['billy-in-the-darbies.xml', 'draft-chapter.xml', 'draft-preface.xml', 'editors-note.xml']
WORD = re.compile(r"[a-z]+(?:'[a-z]+)*")


def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read().decode('utf-8')


def words():
    seen = {}
    for f in FILES:
        xml = fetch(RAW + f)
        xml = re.sub(r'<teiHeader.*?</teiHeader>', ' ', xml, flags=re.S)
        text = re.sub(r'<[^>]+>', ' ', xml)
        text = re.sub(r'&[a-z]+;|&#\d+;', ' ', text).replace('’', "'").replace('‘', "'").lower()
        for w in WORD.findall(text):
            w = w.strip("'")
            if len(w) > 1 or w in ('a', 'i', 'o'):
                seen[w] = seen.get(w, 0) + 1
        print('read', f, file=sys.stderr)
    return seen


def webster_text():
    if '--refetch' in sys.argv or not os.path.exists(WEB):
        os.makedirs(os.path.dirname(WEB), exist_ok=True)
        with open(WEB, 'w', encoding='utf-8') as fh:
            fh.write(fetch(WEB_URL))
    return WEB


def main():
    from wordfreq import zipf_frequency
    seen = words()
    os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
    freq = {'kind': 'bench-kit-frequencies', 'name': 'wordfreq', 'source': 'wordfreq 3 (Robyn Speer), Zipf frequency in present-day English, for the words of MEL\'s TEI of Billy Budd at ' + COMMIT[:7] + ' (tools/dictionary.py)',
            'licence': 'CC BY-SA 4.0', 'scale': 'zipf', 'words': {w: round(zipf_frequency(w, 'en'), 2) for w in sorted(seen)}}
    with open(FREQ, 'w', encoding='utf-8') as fh:
        json.dump(freq, fh, ensure_ascii=False, separators=(',', ':'))
    lst = os.path.join(ROOT, '_tmp', 'webster', 'words.txt')
    with open(lst, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(sorted(seen)) + '\n')
    subprocess.run(['node', os.path.join(ROOT, 'kit', 'tools', 'dict-build.js'), 'webster', webster_text(), '--one', DICT, '--words', lst,
                    '--name', 'Webster’s Revised Unabridged Dictionary (1913)'], check=True)
    print('%d words; %s %d KB, %s %d KB' % (len(seen), FREQ, os.path.getsize(FREQ) // 1024, DICT, os.path.getsize(DICT) // 1024), file=sys.stderr)


if __name__ == '__main__':
    main()
