"""Melville Research Bench mark: a mariner's astrolabe hung from its ring, drawn in hollow beams.

After the Vector Humanities mark (Leonardo's rhombicuboctahedron for Pacioli, 1509): the same
perspective, the same hollow beams (an outer stroke, an inner stroke in the ground colour at 40% of
its width), depth drawn by mixing towards the ground rather than by opacity, the suspension in the
accent colour. The instrument is a bronze ring with a cross of spokes and a central boss, an
alidade (sighting rule) with two pierced vanes, and a lug at the top carrying the suspension ring,
turned square to the face, on a thread.

Levels: 'full' (160 px and up) every edge, the hidden ones thin and pale; 'front' (40 to 160 px)
the visible edges only, solid; 'icon' (16 to 40 px) the instrument face on, drawn for the size.

python3 tools/mark/astrolabe.py <out dir>   writes the marks, the icon, and sheet.html to look at.
"""
import math, sys

DIST = 9.0
SPIN, TILT = 0.55, 0.22             # turned about the thread, tilted towards the viewer
RO, RI, H = 1.0, 0.80, 0.09         # the ring: outer and inner radius, half its thickness
N = 16                              # facets round the ring, as Leonardo and Uccello faceted a ring

PALETTES = {
    'paper': dict(bg='#f3eee2', beam='#1f3f66', thread='#2a2420', accent='#b5481f'),
    'night': dict(bg='#0e141b', beam='#e8e1d1', thread='#a9a291', accent='#e8835a'),
    'navy':  dict(bg='#1f3f66', beam='#f3eee2', thread='#f3eee2', accent='#e8835a'),
}

# ---------- the instrument, as solids of faces ----------
# Each solid is (vertices, faces); a face is a list of vertex indices, its outward normal given by
# the right-hand rule seen from outside. The front of the instrument faces -z (the eye is at -DIST).

def prism(poly, z0, z1):
    """A flat polygon (counter-clockwise seen from -z) extruded from z0 (front) to z1 (back)."""
    n = len(poly)
    vs = [(x, y, z0) for x, y in poly] + [(x, y, z1) for x, y in poly]
    fs = [list(range(n))[::-1], list(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        fs.append([i, j, n + j, n + i])
    return vs, fs

def annulus(ro, ri, z0, z1, n):
    """A ring of n facets: the front and back faces as quads, the outer and inner walls."""
    vs = []
    for z in (z0, z1):
        for r in (ro, ri):
            for k in range(n):
                a = 2 * math.pi * k / n
                vs.append((r * math.sin(a), r * math.cos(a), z))
    of, if_, ob, ib = 0, n, 2 * n, 3 * n
    fs = []
    for k in range(n):
        m = (k + 1) % n
        fs.append([of + m, if_ + m, if_ + k, of + k])        # front
        fs.append([ib + k, ib + m, ob + m, ob + k])          # back
        fs.append([ob + k, ob + m, of + m, of + k])          # outer wall
        fs.append([if_ + m, ib + m, ib + k, if_ + k])        # inner wall
    return vs, fs

def plus(w, r):
    """The cross of spokes, as one outline (counter-clockwise from -z), its arms ending at radius r."""
    e = math.sqrt(r * r - w * w)
    return [(w, w), (e, w), (e, -w), (w, -w), (w, -e), (-w, -e), (-w, -w), (-e, -w), (-e, w), (-w, w), (-w, e), (w, e)][::-1]

def circle(r, n, cx=0.0, cy=0.0):
    return [(cx + r * math.cos(2 * math.pi * k / n), cy + r * math.sin(2 * math.pi * k / n)) for k in range(n)]

def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

def place(solid, f):
    vs, fs = solid
    return [f(v) for v in vs], fs

def instrument():
    """The parts: solids (vertices, faces) and beams (vertices, edges), each with its weight and
    whether it is drawn in the accent colour. The ring and the lug are solids; the spokes and the
    alidade are bars, drawn as Leonardo draws an edge, each a single hollow beam."""
    parts = []
    parts.append(('solid', annulus(RO, RI, -H, H, N), 1.0, False))
    # the cross of spokes, and the boss where they meet
    parts.append(('beam', ([(0, RI, 0), (0, -RI, 0), (RI, 0, 0), (-RI, 0, 0)], [(0, 1), (2, 3)]), 0.95, False))
    boss = [(x, y, -0.03) for x, y in circle(0.075, 10)]
    parts.append(('beam', (boss, [(k, (k + 1) % 10) for k in range(10)]), 0.8, False))
    # the alidade, in front, at an angle, with a pierced vane standing out at each end
    th, L, z = math.radians(-38), RI * 0.93, -H - 0.05
    r2 = lambda x, y, zz: (x * math.cos(th) - y * math.sin(th), x * math.sin(th) + y * math.cos(th), zz)
    vs, es = [r2(-L, 0, z), r2(L, 0, z)], [(0, 1)]
    for sx in (-1, 1):
        x, w, hgt = sx * (L - 0.06), 0.06, 0.2
        q = len(vs)
        vs += [r2(x, -w, z), r2(x, w, z), r2(x, w, z - hgt), r2(x, -w, z - hgt)]
        es += [(q, q + 1), (q + 1, q + 2), (q + 2, q + 3), (q + 3, q)]
        # the sighting hole
        h0 = len(vs)
        vs += [r2(x, 0.028 * math.cos(2 * math.pi * k / 8), z - hgt * 0.62 + 0.028 * math.sin(2 * math.pi * k / 8)) for k in range(8)]
        es += [(h0 + k, h0 + (k + 1) % 8) for k in range(8)]
    parts.append(('beam', (vs, es), 1.2, False))
    # the lug at the top, and the suspension ring turned square to the face
    parts.append(('solid', prism(rect(-0.07, RO - 0.02, 0.07, RO + 0.09), -H * 0.8, H * 0.8), 1.0, False))
    cy, r = RO + 0.09 + 0.085, 0.085
    ring = [(0.0, cy + r * math.cos(2 * math.pi * k / 16), r * math.sin(2 * math.pi * k / 16)) for k in range(16)]
    parts.append(('beam', (ring, [(k, (k + 1) % 16) for k in range(16)]), 1.0, True))
    return parts, (0.0, cy + r, 0.0)

# ---------- pose, projection, visibility ----------

def rot(p, ax, ay):
    x, y, z = p
    x, z = x * math.cos(ay) + z * math.sin(ay), -x * math.sin(ay) + z * math.cos(ay)
    y, z = y * math.cos(ax) - z * math.sin(ax), y * math.sin(ax) + z * math.cos(ax)
    return (x, y, z)

def turn(v, spin, tilt): return rot(v, tilt, spin)

def proj(v): return (v[0] * DIST / (DIST + v[2]), -v[1] * DIST / (DIST + v[2]))

def sub(a, b): return tuple(a[i] - b[i] for i in range(3))
def cross(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])

def edges_of(parts, spin, tilt):
    """Every edge once: its 3D ends after the pose, whether it can be seen, its weight, and whether it
    is the accent's. A solid's edge can be seen when a face turned to the eye borders it; a beam is
    a bar, and is seen."""
    out = []
    for kind, (vs, fs), wt, accent in parts:
        R = [turn(v, spin, tilt) for v in vs]
        if kind == 'beam':
            out += [(R[i], R[j], True, wt, accent) for i, j in fs]
            continue
        seen = {}
        for f in fs:
            nrm = cross(sub(R[f[1]], R[f[0]]), sub(R[f[2]], R[f[0]]))
            c = [sum(R[q][k] for q in f) / len(f) for k in range(3)]
            facing = nrm[0] * c[0] + nrm[1] * c[1] + nrm[2] * (c[2] + DIST) < 0
            for k in range(len(f)):
                e = tuple(sorted((f[k], f[(k + 1) % len(f)])))
                seen.setdefault(e, []).append((nrm, facing))
        for e, adj in seen.items():
            # an edge between two faces in one plane (the ring's flat faces) is not an edge
            if len(adj) == 2:
                a, b = adj[0][0], adj[1][0]
                la, lb = math.sqrt(sum(t * t for t in a)) or 1, math.sqrt(sum(t * t for t in b)) or 1
                if sum(a[i] * b[i] for i in range(3)) / la / lb > 0.9999:
                    continue
            out.append((R[e[0]], R[e[1]], any(f for _, f in adj), wt, accent))
    return out

def mix(a, b, t):
    ca = [int(a[i:i + 2], 16) for i in (1, 3, 5)]; cb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(x + (y - x) * t):02x}' for x, y in zip(ca, cb))

# ---------- drawing ----------

def icon(c, px):
    """16 to 28 px: the instrument face on, drawn for the size: the ring, the cross of spokes, the
    alidade heavier on its diagonal, and the shackle as a dot in the accent colour."""
    u = 100.0 / px
    cx, cy, r = 50.0, 57.0, 37.5
    ring = max(8.5, 1.35 * u); bar = max(6.0, 1.0 * u); ali = max(8.0, 1.25 * u)
    th = math.radians(-38); dx, dy = math.cos(th) * (r - ring / 2), -math.sin(th) * (r - ring / 2)
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{c["beam"]}" stroke-width="{ring:.2f}"/>'
            f'<path d="M{cx},{cy - r} V{cy + r} M{cx - r},{cy} H{cx + r}" stroke="{c["beam"]}" stroke-width="{bar:.2f}"/>'
            f'<path d="M{cx - dx:.2f},{cy - dy:.2f} L{cx + dx:.2f},{cy + dy:.2f}" stroke="{c["beam"]}" stroke-width="{ali:.2f}" stroke-linecap="round"/>'
            f'<circle cx="{cx}" cy="{cy - r - ring / 2 - 6.5:.2f}" r="{max(6.0, 1.0 * u):.2f}" fill="{c["accent"]}"/>')

def body(c, level, px, box=(7.0, 2.0, 93.0, 98.0), spin=SPIN, tilt=TILT):
    u = 100.0 / px
    if level == 'icon':
        return icon(c, px)
    parts, top = instrument()
    E = edges_of(parts, spin, tilt)
    if level == 'front':
        E = [e for e in E if e[2]]
    pts = [proj(p) for e in E for p in e[:2]] + [proj(turn(top, spin, tilt))]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, y0, x1, y1 = box
    thread = 5.0
    sc = min((x1 - x0) / (max(xs) - min(xs)), (y1 - y0 - thread) / (max(ys) - min(ys)))
    T = proj(turn(top, spin, tilt))
    ox = (x0 + x1) / 2 - T[0] * sc
    oy = y0 + thread - min(ys) * sc + ((y1 - y0 - thread) - (max(ys) - min(ys)) * sc) / 2
    S = lambda v: (proj(v)[0] * sc + ox, proj(v)[1] * sc + oy)
    zs = [p[2] for e in E for p in e[:2]]
    zmin, zmax = min(zs), max(zs)
    out = []
    if thread:
        t = S(turn(top, spin, tilt))
        out.append(f'<path d="M{t[0]:.2f},{t[1]:.2f} V0" stroke="{c["thread"]}" stroke-width="{max(0.45, 0.8 * u):.2f}"/>')
    # back to front; each edge an outer stroke and, at full size, an inner stroke in the ground
    order = sorted(range(len(E)), key=lambda n: -(E[n][0][2] + E[n][1][2]))
    base = {'full': 1.7, 'front': max(2.4, 1.5 * u)}[level]
    hollow = level == 'full'
    ends = {}
    drawn = []
    def key(p): return (round(p[0], 4), round(p[1], 4), round(p[2], 4))
    for n in order:
        a, b, vis, wt, acc = E[n]
        d = ((a[2] + b[2]) / 2 - zmin) / ((zmax - zmin) or 1)        # 0 nearest, 1 farthest
        w = base * wt * (1.0 - 0.35 * d) * (1.0 if vis else 0.55)
        col = c['accent'] if acc else mix(c['beam'], c['bg'], (0.15 * d if vis else 0.5 + 0.2 * d))
        A, B = S(a), S(b)
        out.append(f'<path d="M{A[0]:.2f},{A[1]:.2f} L{B[0]:.2f},{B[1]:.2f}" stroke="{col}" stroke-width="{w:.2f}" stroke-linecap="round"/>')
        if hollow and w > 0.8:
            wi = 0.4 * w
            out.append(f'<path d="M{A[0]:.2f},{A[1]:.2f} L{B[0]:.2f},{B[1]:.2f}" stroke="{c["bg"]}" stroke-width="{wi:.2f}" stroke-linecap="round"/>')
            # reopen the channels of the beams already drawn that meet this one, which its outer
            # stroke has closed at the joint
            for p, P in ((a, A), (b, B)):
                for (Q, R2, wq) in ends.get(key(p), []):
                    dx, dy = R2[0] - Q[0], R2[1] - Q[1]; ln = math.hypot(dx, dy) or 1
                    k = min(1.0, 0.75 * w / ln)
                    out.append(f'<path d="M{Q[0]:.2f},{Q[1]:.2f} L{Q[0] + dx * k:.2f},{Q[1] + dy * k:.2f}" stroke="{c["bg"]}" stroke-width="{wq:.2f}" stroke-linecap="round"/>')
            ends.setdefault(key(a), []).append((A, B, wi))
            ends.setdefault(key(b), []).append((B, A, wi))
    return ''.join(out)

def mark_svg(c, px=400, level=None, bg=True, title='Melville Research Bench', tile=False):
    """The mark in a 100-unit square; tile: on a rounded ground with a hairline edge, to stand on any
    background (the bench's icon, which serves as favicon, top bar and About box)."""
    level = level or ('full' if px >= 160 else 'front' if px >= 40 else 'icon')
    rect_ = (f'<rect x="1" y="1" width="98" height="98" rx="18" fill="{c["bg"]}" stroke="{c["thread"]}" stroke-opacity="0.25" stroke-width="1.5"/>' if tile
             else f'<rect width="100" height="100" fill="{c["bg"]}"/>' if bg else '')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="{px}" height="{px}">'
            f'<title>{title}</title>{rect_}{body(c, level, px)}</svg>')

if __name__ == '__main__':
    out = sys.argv[1]
    for name, c in PALETTES.items():
        for lv in ('full', 'front', 'icon'):
            open(f'{out}/mark-{lv}-{name}.svg', 'w').write(mark_svg(c, 400, lv))
    # the bench's icon: the face-on drawing on a paper tile
    open(f'{out}/icon.svg', 'w').write(mark_svg(PALETTES['paper'], 32, 'icon', tile=True).replace(' width="32" height="32"', ''))
    cells = []
    for name, c in PALETTES.items():
        cells.append(f'<div class="c" style="background:{c["bg"]}"><div class="t" style="color:{c["thread"]}">{name}</div>{mark_svg(c, 340)}'
                     '<div class="sm">' + ''.join(mark_svg(c, s) for s in (128, 64, 48, 40, 32, 24, 16)) + '</div></div>')
    open(f'{out}/sheet.html', 'w').write(
        '<!doctype html><meta charset="utf-8"><title>Melville mark</title><style>body{margin:0;padding:18px;background:#d8d4ca}'
        '.g{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.c{border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:12px;align-items:center}'
        '.t{align-self:flex-start;font:12px Menlo,monospace;letter-spacing:.12em;text-transform:uppercase}'
        '.sm{display:flex;gap:12px;align-items:flex-end}</style><div class="g">' + ''.join(cells) + '</div>')
    print('ok')
