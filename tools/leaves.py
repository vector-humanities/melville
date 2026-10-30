"""Fetch the Billy Budd manuscript's leaves into img/leaves/ from Harvard's own image service, with a
record of where each comes from.

Held with the permission of the Houghton Library, Harvard University (Leslie A. Morris, Gore Vidal
Curator of Modern Books and Manuscripts, 30 October 2026): JPEG derivatives at web resolution, no
more than 1,600 pixels on the long side, for non-commercial research and teaching, each credited to
Houghton Library, Harvard University, MS Am 188 (363).

The leaves are those MEL transcribes (the <surface>s of bb-ms.xml, at the commit js/versions.js
reads). MEL's img_N is Harvard's sequence N in the manuscript's IIIF manifest (the same photograph,
at the same size); img_Nb is a second region of the same photograph, so it takes sequence N's image.
Each is taken from Harvard's IIIF image service twice: <id>.jpg, 560 pixels wide (the Images slider's
widest), and <id>-large.jpg, no more than 1,600 pixels on its long side. It writes:
  img/leaves/provenance.csv and provenance.json   every file's archival location and source URLs
  js/leaves.js                                    the leaves held, with Harvard's image service, for js/config.js

python3 tools/leaves.py          (from the repository's root; --refetch to fetch every file again)
"""
import concurrent.futures as cf, csv, datetime, json, os, re, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'img', 'leaves')
URN = 'URN-3:FHCL.HOUGH:4686413'
MANIFEST = 'https://nrs.harvard.edu/' + URN + ':MANIFEST:3'
OBJECT = 'https://nrs.harvard.edu/' + URN
FINDING_AID = 'https://hollisarchives.lib.harvard.edu/catalog/hou00338_hou00338c00388'
LOCATION = 'Houghton Library, Harvard University. Herman Melville papers, 1761-1964 (MS Am 188-188.6), Box 19, Volume 2: Billy Budd. A.Ms., MS Am 188 (363)'
CREDIT = 'Houghton Library, Harvard University, MS Am 188 (363). Reproduced with the permission of the Houghton Library.'
# the largest each copy may be (width, long side); a service that rounds up is asked again a pixel smaller
SIZES = {'': (560, None), '-large': (None, 1600)}

def jpeg_size(data):
    i = 2
    while i < len(data):
        if data[i] != 0xFF: i += 1; continue
        m = data[i + 1]; n = int.from_bytes(data[i + 2:i + 4], 'big')
        if m in (0xC0, 0xC1, 0xC2): return int.from_bytes(data[i + 7:i + 9], 'big'), int.from_bytes(data[i + 5:i + 7], 'big')
        i += 2 + n
    return None

def within(data, width, side):
    w, h = jpeg_size(data)
    return (width is None or w <= width) and (side is None or max(w, h) <= side)
REFETCH = '--refetch' in sys.argv

def get(url, tries=4):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'melville-bench (vector-humanities)'}), timeout=90) as r:
                return r.read()
        except Exception:
            if k == tries - 1: raise
            time.sleep(2 * (k + 1))

def mel_leaves():
    v = open(os.path.join(ROOT, 'js', 'versions.js'), encoding='utf-8').read()
    commit = re.search(r"commit: '([0-9a-f]{40})'", v).group(1)
    xml = get('https://raw.githubusercontent.com/performant-software/mel-website/%s/xml/versions-of-billy-budd/bb-ms.xml' % commit).decode('utf-8')
    out = []
    for m in re.finditer(r'<surface\b([^>]*)>(.*?)</surface>', xml, re.S):
        a = m.group(1); sid = re.search(r'xml:id="([^"]+)"', a)
        g = re.search(r'<graphic\b[^>]*url="([^"]+)"', m.group(2))
        if sid: out.append({'id': sid.group(1), 'w': int(re.search(r'lrx="(\d+)"', a).group(1)), 'h': int(re.search(r'lry="(\d+)"', a).group(1)), 'mel_iiif': g.group(1) if g else ''})
    return commit, out

def harvard():
    m = json.loads(get(MANIFEST))
    pages = []
    for i, c in enumerate(m['items']):
        label = c['label']['none'][0]
        body = c['items'][0]['items'][0]['body']
        pages.append({'seq': i + 1, 'label': label, 'folio': re.sub(r',?\s*\(seq\.\s*\d+\)\s*$', '', label).strip(),
                      'canvas': c['id'], 'service': body['service'][0]['id'], 'w': c['width'], 'h': c['height']})
    return m['id'], pages

def fetch(job):
    for suffix, (width, side) in SIZES.items():
        f = os.path.join(OUT, job['id'] + suffix + '.jpg')
        if not REFETCH and os.path.exists(f) and os.path.getsize(f) > 0 and within(open(f, 'rb').read(), width, side): continue
        for less in range(4):
            path = 'full/%d,/0/default.jpg' % (width - less) if width else 'full/!%d,%d/0/default.jpg' % (side - less, side - less)
            data = get(job['service'] + '/' + path)
            if not data.startswith(b'\xff\xd8'): raise ValueError('%s%s: not a JPEG' % (job['id'], suffix))
            if within(data, width, side): break
        else: raise ValueError('%s%s: larger than allowed' % (job['id'], suffix))
        open(f + '.part', 'wb').write(data); os.replace(f + '.part', f)
    return job['id']

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    commit, mel = mel_leaves()
    manifest_id, pages = harvard()
    jobs, unmatched = [], []
    for L in mel:
        n = re.match(r'img_(\d+)(b?)$', L['id'])
        p = pages[int(n.group(1)) - 1] if n and int(n.group(1)) <= len(pages) else None
        if not p or abs(p['w'] - L['w']) > 3 or abs(p['h'] - L['h']) > 3:
            unmatched.append(L['id']); continue
        jobs.append(dict(L, **{'seq': p['seq'], 'label': p['label'], 'folio': p['folio'], 'canvas': p['canvas'], 'service': p['service'], 'second_region': bool(n.group(2))}))
    held, failed = [], []
    with cf.ThreadPoolExecutor(6) as ex:
        for j, fut in [(j, ex.submit(fetch, j)) for j in jobs]:
            try: fut.result(); held.append(j)
            except Exception as e: failed.append((j['id'], str(e)))
    key = lambda s: [int(x) if x.isdigit() else x for x in re.split(r'(\d+)', s)]
    held.sort(key=lambda j: key(j['id']))
    today = datetime.date.today().isoformat()
    rows = [{
        'file': 'img/leaves/%s.jpg' % j['id'], 'file_large': 'img/leaves/%s-large.jpg' % j['id'],
        'sizes': '560 pixels wide; at most 1600 pixels on the long side',
        'mel_leaf': j['id'], 'harvard_sequence': j['seq'], 'folio': j['folio'], 'harvard_label': j['label'],
        'second_region_of_photograph': 'yes' if j['second_region'] else '',
        'archival_location': LOCATION + ', ' + j['label'],
        'harvard_image_service': j['service'], 'harvard_image': j['service'] + '/full/full/0/default.jpg',
        'harvard_canvas': j['canvas'], 'harvard_manifest': manifest_id, 'harvard_object': OBJECT, 'finding_aid': FINDING_AID,
        'original_pixels': '%d x %d' % (j['w'], j['h']), 'mel_iiif': j['mel_iiif'],
        'mel_transcription': 'https://github.com/performant-software/mel-website/blob/%s/xml/versions-of-billy-budd/bb-ms.xml' % commit,
        'credit': CREDIT, 'permission': 'Houghton Library, Harvard University (Leslie A. Morris, Gore Vidal Curator of Modern Books and Manuscripts), 30 October 2026',
        'fetched': today} for j in held]
    with open(os.path.join(OUT, 'provenance.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    json.dump({'repository': 'Houghton Library, Harvard University', 'call_number': 'MS Am 188 (363)', 'location': LOCATION,
               'harvard_object': OBJECT, 'harvard_manifest': manifest_id, 'finding_aid': FINDING_AID, 'credit': CREDIT,
               'leaves': rows}, open(os.path.join(OUT, 'provenance.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    with open(os.path.join(ROOT, 'js', 'leaves.js'), 'w', encoding='utf-8') as f:
        f.write('/* leaves.js - the manuscript leaves held in img/leaves/, each with its page in Harvard\'s IIIF manifest\n'
                ' * (made by tools/leaves.py; img/leaves/provenance.csv gives every file\'s archival location and URLs).\n'
                ' * Held with the permission of the Houghton Library, Harvard University, MS Am 188 (363). */\n'
                '(function (root) { root.MelLeaves = ' + json.dumps({j['id']: {'seq': j['seq'], 'folio': j['folio'], 'iiif': j['service']} for j in held}, separators=(',', ':')) + '; })(this);\n')
    print('%d leaves held from Harvard, %d failed, %d not matched to Harvard' % (len(held), len(failed), len(unmatched)))
    for x in failed: print('  failed', *x)
    for x in unmatched: print('  not matched', x)
    sys.exit(1 if failed or unmatched else 0)
