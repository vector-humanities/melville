"""Fetch the Billy Budd manuscript's leaves into img/leaves/, for Book to show from the bench's own files.

Held with the permission of the Houghton Library, Harvard University (Leslie A. Morris, Gore Vidal
Curator of Modern Books and Manuscripts, 30 October 2026): JPEG derivatives at web resolution, no
more than 1,600 pixels on the long side, for non-commercial research and teaching, each credited to
Houghton Library, Harvard University, MS Am 188 (363).

Each leaf (a <surface> of MEL's bb-ms.xml, at the commit js/versions.js reads) is taken from its IIIF
image service twice: <id>.jpg, 560 pixels wide (the Images slider's widest), beside the text, and
<id>-large.jpg, no more than 1,600 pixels on its long side, for the enlarged view. A leaf already
held is left as it is, so the script can be run again to fill gaps. js/leaves.js lists the leaves
held, for js/config.js's doc.image.

python3 tools/leaves.py          (from the repository's root)
"""
import concurrent.futures as cf, json, os, re, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'img', 'leaves')
SIZES = {'': 'full/560,/0/default.jpg', '-large': 'full/!1600,1600/0/default.jpg'}

def get(url, tries=4):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'melville-bench (vector-humanities)'}), timeout=60) as r:
                return r.read()
        except Exception as e:
            if k == tries - 1: raise
            time.sleep(2 * (k + 1))

def leaves():
    v = open(os.path.join(ROOT, 'js', 'versions.js'), encoding='utf-8').read()
    commit = re.search(r"commit: '([0-9a-f]{40})'", v).group(1)
    xml = get('https://raw.githubusercontent.com/performant-software/mel-website/%s/xml/versions-of-billy-budd/bb-ms.xml' % commit).decode('utf-8')
    out = []
    for m in re.finditer(r'<surface\b([^>]*)>(.*?)</surface>', xml, re.S):
        sid = re.search(r'xml:id="([^"]+)"', m.group(1))
        g = re.search(r'<graphic\b[^>]*url="([^"]+)"', m.group(2))
        if sid and g: out.append((sid.group(1), g.group(1)))
    return out

def fetch(leaf):
    sid, svc = leaf
    done = []
    for suffix, path in SIZES.items():
        f = os.path.join(OUT, sid + suffix + '.jpg')
        if not (os.path.exists(f) and os.path.getsize(f) > 0):
            data = get(svc + '/' + path)
            if not data.startswith(b'\xff\xd8'): raise ValueError('%s%s: not a JPEG' % (sid, suffix))
            open(f + '.part', 'wb').write(data); os.replace(f + '.part', f)
        done.append(suffix)
    return sid

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    ls = leaves()
    held, failed = [], []
    with cf.ThreadPoolExecutor(6) as ex:
        for leaf, fut in [(l, ex.submit(fetch, l)) for l in ls]:
            try: held.append(fut.result())
            except Exception as e: failed.append((leaf[0], str(e)))
    held.sort(key=lambda s: [int(x) if x.isdigit() else x for x in re.split(r'(\d+)', s)])
    with open(os.path.join(ROOT, 'js', 'leaves.js'), 'w', encoding='utf-8') as f:
        f.write('/* leaves.js - the manuscript leaves held in img/leaves/ (made by tools/leaves.py; run it again when\n'
                ' * leaves are added). Held with the permission of the Houghton Library, Harvard University, MS Am 188 (363). */\n'
                '(function (root) { root.MelLeaves = ' + json.dumps(held) + '; })(this);\n')
    print('%d leaves held, %d failed' % (len(held), len(failed)))
    for f in failed: print('  failed', *f)
    sys.exit(1 if failed else 0)
