"""Build the original "Rift" (裂空) tachi for 天顶·裂空 from scratch.

Run with Python, numpy and Pillow. Coordinates follow the native SlashBlade
blade.obj: negative X is the blade tip, the grip sits around the hand pivot and
the sheath follows the blade's curve so the sheathed blade stays inside it.
Glowing parts live in the renderer's ``<group>_luminous`` groups (additive,
full-bright): the rift seam along the blade, the thin seam ring on the guard and
the seam on the sheath. No gems. One 256x256 pixel atlas, painted directly.

The glowing parts are not painted: their UVs address SenDims' rift canvas
(slashblade_sendims:dynamic/zenith_rift/blade, 128x4096), which a core shader
(zenith_rift_blade.fsh) bakes every frame outside world rendering. SenDims
redirects the luminous render type of this model's atlas to that canvas, so the
glow animates in hand, on the waist, in the inventory and with shader packs.
Canvas layout by u: [0.01, 0.49] blade rift, [0.51, 0.74] sheath seam,
[0.76, 0.99] guard ring; v runs along the strip (OBJ stores 1 - v).

Output goes to SenDims: --out <SlashBlade-SenDims>/src/main/resources/assets/
slashblade_sendims/model/zenith_final. --canvas takes a baked frame of the shader
(see bake_core_shader_preview.js) for the preview's glow layers.
"""
from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from generate_damnation_models import Mesh
from generate_zenith_model import orient

SIZE = 256

BLADE_ROOT = -36.0
BLADE_LENGTH = 332.0  # about 30% longer than the native katana (~255)
YOKOTE = 0.92
GUARD_GRIP_SIDE, GUARD_BLADE_SIDE = -33.2, -35.6
GRIP_START, GRIP_END = -31.0, 42.0
SHEATH_MOUTH, SHEATH_END = -35.8, -376.0
SEAM_FROM, SEAM_TO = 0.03, 0.90
GLOW_LIFT, GLOW_TOP = 0.08, 0.14

# Atlas regions (pixels). Strips run along the length; tiles are 32x32.
BLADE = (0, 64)
SHEATH = (88, 128)
GRIP = (128, 160)
TILES = {'metal': (160, 0), 'guard': (192, 0),
         'broken': (160, 32), 'habaki': (192, 32), 'dark': (224, 32)}
# Rift canvas regions (u ranges), see the module docstring.
CANVAS_BLADE, CANVAS_SHEATH, CANVAS_RING = (0.01, 0.49), (0.51, 0.74), (0.76, 0.99)


# ---------------------------------------------------------------- uv helpers

def px_uv(x, y):
    return (x / SIZE, 1 - y / SIZE)


def strip_uv(region, u, s):
    x0, x1 = region
    return px_uv(x0 + 1 + u * (x1 - x0 - 2), 2 + s * (SIZE - 5))


def grip_uv(u, v):
    return px_uv(GRIP[0] + 1 + u * 30, 2 + v * 123)


def canvas_uv(region, across, along):
    lo, hi = region
    return (lo + across * (hi - lo), 1 - along)


def tile_uv(name, u, v):
    x, y = TILES[name]
    return px_uv(x + 1 + u * 30, y + 1 + v * 30)


# ---------------------------------------------------------------- geometry

def loft(rings, uv, cap0=None, cap1=None, closed_path=False):
    """Connect rings of equal size; uv(r, j) may receive j == n for the wrap seam.

    Open paths get fan caps (convex rings), closed paths (washers) wrap around.
    """
    mesh = Mesh()
    n = len(rings[0])
    for ring in rings:
        mesh.vertices.extend(tuple(float(c) for c in p) for p in ring)
    count = len(rings)
    spans = count if closed_path else count - 1
    for r in range(spans):
        r2 = (r + 1) % count
        for j in range(n):
            a, b = r * n + j, r * n + (j + 1) % n
            c, d = r2 * n + (j + 1) % n, r2 * n + j
            ua, ub = uv(r, j), uv(r, j + 1)
            uc, ud = uv(r + 1, j + 1), uv(r + 1, j)
            mesh.triangle((a, b, c), (ua, ub, uc))
            mesh.triangle((a, c, d), (ua, uc, ud))
    if not closed_path:
        for r, cap in ((0, cap0), (count - 1, cap1)):
            ids = list(range(r * n, r * n + n))
            if r == 0:
                ids.reverse()
            for j in range(1, n - 1):
                mesh.triangle((ids[0], ids[j], ids[j + 1]), [cap] * 3)
    return orient(mesh)


def center_y(s):
    """Blade/sheath centre line: the sori bends the tip toward -Y like the native katana."""
    return 3.6 - 30.0 * max(s, 0.0) ** 2


def blade_x(s):
    return BLADE_ROOT - s * BLADE_LENGTH


def blade_profile(s):
    """Spine/edge offsets from the centre line, shinogi position and half thickness."""
    h = 5.4 - 1.1 * min(s, YOKOTE) / YOKOTE
    spine, edge = -h, h
    if s > YOKOTE:
        k = min(1.0, (s - YOKOTE) / (1 - YOKOTE))
        spine = -h + 0.4 * h * k * k
        edge = -0.6 * h + 1.6 * h * math.sqrt(max(0.0, 1 - k * k))
    thick = 0.85 * (1 - 0.35 * s)
    if s > YOKOTE:
        thick *= 1 - 0.85 * ((s - YOKOTE) / (1 - YOKOTE)) ** 2
    shinogi = spine + 0.33 * (edge - spine)
    return spine, edge, shinogi, thick


def blade_ring(s, jag=None):
    spine, edge, shinogi, t = blade_profile(s)
    if s >= 1.0:
        mid = (spine + edge) / 2
        spine, edge, shinogi, t = mid - .05, mid + .05, mid - .02, .02
    yc = center_y(s)
    local = [(edge, 0), (shinogi, t), (spine, .55 * t), (spine - .12 * t - .02, 0),
             (spine, -.55 * t), (shinogi, -t)]
    x = blade_x(s)
    ring = []
    for j, (y, z) in enumerate(local):
        ring.append((x + (jag[j] if jag else 0.0), yc + y, z))
    return ring, local, spine, edge


def make_blade_body(broken=False):
    stations = [0.0, 0.01] + [k / 50 for k in range(1, 51)]
    stations = sorted(set(s for s in stations if s <= YOKOTE) |
                      {YOKOTE + (1 - YOKOTE) * k / 6 for k in range(1, 7)})
    if broken:
        stations = [s for s in stations if s < 0.40] + [0.42]
    rings, uvs = [], []
    for i, s in enumerate(stations):
        jag = [-4.0, 1.5, -2.5, -1.0, -2.5, 1.5] if broken and i == len(stations) - 1 else None
        ring, local, spine, edge = blade_ring(s, jag)
        rings.append(ring)
        uvs.append([((y - spine) / max(edge - spine, 1e-6), s) for y, _ in local])

    def uv(r, j):
        u, s = uvs[r][j % 6]
        return strip_uv(BLADE, min(1.0, max(0.0, u)), s)

    tip_cap = tile_uv('broken', .5, .5) if broken else strip_uv(BLADE, 1.0, 1.0)
    return loft(rings, uv, tile_uv('metal', .5, .5), tip_cap)


def face_z(s, y_local):
    """Front blade face between the shinogi and the edge (linear)."""
    spine, edge, shinogi, t = blade_profile(s)
    return t * (edge - y_local) / (edge - shinogi)


def blade_seam(end=SEAM_TO):
    """The rift: a thin glowing slab on each face, centred between shinogi and edge."""
    stations = [SEAM_FROM + (end - SEAM_FROM) * k / 60 for k in range(61)]
    meshes = Mesh()
    for side in (1, -1):
        rings, us = [], [0, 1, 1, 0]
        for s in stations:
            spine, edge, _, _ = blade_profile(s)
            mid = spine + 0.55 * (edge - spine)
            half = 0.13 * (edge - spine)
            yc, x = center_y(s), blade_x(s)
            lo, hi = mid - half, mid + half
            ring = [(x, yc + lo, side * (face_z(s, lo) + GLOW_LIFT)),
                    (x, yc + hi, side * (face_z(s, hi) + GLOW_LIFT)),
                    (x, yc + hi, side * (face_z(s, hi) + GLOW_TOP)),
                    (x, yc + lo, side * (face_z(s, lo) + GLOW_TOP))]
            rings.append(ring)

        def uv(r, j, stations=stations):
            return canvas_uv(CANVAS_BLADE, us[j % 4], (stations[r] - SEAM_FROM) / (SEAM_TO - SEAM_FROM))

        cap = canvas_uv(CANVAS_BLADE, 0.0, 0.0)
        meshes.add(loft(rings, uv, cap, cap))
    return meshes


def ellipse(n, ry, rz, phase=0.0):
    return [(ry * math.cos(2 * math.pi * (j + phase) / n), rz * math.sin(2 * math.pi * (j + phase) / n))
            for j in range(n)]


def collar(x_stations, ry, rz, tile, yc=3.6, n=16):
    """Closed elliptic band along X: list of (x, scale) stations."""
    rings = [[(x, yc + y * k, z * k) for y, z in ellipse(n, ry, rz)] for x, k in x_stations]

    def uv(r, j):
        return tile_uv(tile, j / n, r / max(1, len(rings) - 1))

    return loft(rings, uv, tile_uv(tile, .5, .5), tile_uv(tile, .5, .5))


GUARD_RY, GUARD_RZ = 13.5, 12.0


def guard():
    mesh = Mesh()
    g, b = GUARD_GRIP_SIDE, GUARD_BLADE_SIDE
    mesh.add(collar([(g, .94), (g - .4, 1.0), (b + .4, 1.0), (b, .94)], GUARD_RY, GUARD_RZ, 'guard', n=40))
    return mesh


def guard_rings():
    """A thin glowing seam ring near the rim on both faces of the guard."""
    mesh = Mesh()
    n = 48
    for face, out in ((GUARD_GRIP_SIDE, 1), (GUARD_BLADE_SIDE, -1)):
        x_lo, x_hi = face + out * 0.10, face + out * 0.16
        rings = []
        for y, z in ellipse(n, 1.0, 1.0):
            pts = []
            for r, x in ((.84, x_lo), (.89, x_lo), (.89, x_hi), (.84, x_hi)):
                pts.append((x, 3.6 + y * GUARD_RY * r, z * GUARD_RZ * r))
            rings.append(pts)
        us = [0, 1, 1, 0]

        def uv(r, j):
            return canvas_uv(CANVAS_RING, us[j % 4], r / n)

        mesh.add(loft(rings, uv, closed_path=True))
    return mesh


def habaki():
    rings = []
    for x, k in ((-35.4, 1.0), (-38.0, 1.0), (-41.0, .92), (-41.6, .84)):
        rings.append([(x, center_y(0) + y * k, z * k) for y, z in ellipse(12, 6.3, 1.7)])
    return loft(rings, lambda r, j: tile_uv('habaki', j / 12, r / 3), tile_uv('habaki', .5, .5),
                tile_uv('habaki', .5, .5))


def grip_center(x):
    k = (x - GRIP_START) / (GRIP_END - GRIP_START)
    return 3.6 + 1.4 * k * k


def tsuka():
    mesh = Mesh()
    xs = [GRIP_START + (GRIP_END - GRIP_START) * k / 10 for k in range(11)]
    rings = []
    for x in xs:
        k = (x - GRIP_START) / (GRIP_END - GRIP_START)
        swell = 1.0 + 0.05 * math.sin(math.pi * k)
        rings.append([(x, grip_center(x) + y * swell, z * swell) for y, z in ellipse(12, 4.4, 3.4)])

    def uv(r, j):
        return grip_uv(j / 12, r / 10)

    mesh.add(loft(rings, uv, tile_uv('metal', .5, .5), tile_uv('metal', .5, .5)))
    # Fuchi (collar at the guard) and kashira (pommel cap), plain dark metal.
    mesh.add(collar([(GRIP_START - 2.2, 1.0), (GRIP_START + 0.6, 1.0)], 4.9, 3.85, 'metal', n=12))
    kx = GRIP_END
    rings = []
    for x, k in ((kx - 1.0, 1.0), (kx + 2.0, 1.0), (kx + 3.6, .82), (kx + 4.3, .5)):
        rings.append([(x, grip_center(kx) + y * k, z * k) for y, z in ellipse(12, 4.8, 3.8)])
    mesh.add(loft(rings, lambda r, j: tile_uv('metal', j / 12, r / 3), tile_uv('metal', .5, .5),
                  tile_uv('metal', .5, .5)))
    return mesh


def make_blade(broken=False):
    mesh = Mesh()
    mesh.add(make_blade_body(broken))
    mesh.add(habaki())
    mesh.add(guard())
    mesh.add(tsuka())
    mesh.validate()
    return mesh


def make_blade_glow(broken=False):
    mesh = Mesh()
    mesh.add(blade_seam(0.40 if broken else SEAM_TO))
    mesh.add(guard_rings())
    mesh.validate()
    return mesh


SHEATH_N = 16


def sheath_size(x):
    k = (SHEATH_MOUTH - x) / (SHEATH_MOUTH - SHEATH_END)
    return 6.9 - 0.7 * k, 3.05 - 0.4 * k


def sheath_s(x):
    return (BLADE_ROOT - x) / BLADE_LENGTH


def sheath():
    mesh = Mesh()
    xs = [SHEATH_MOUTH - 4.0 - (SHEATH_MOUTH - 4.0 - (SHEATH_END + 8.0)) * k / 30 for k in range(31)]
    rings = []
    for x in xs:
        ry, rz = sheath_size(x)
        yc = center_y(sheath_s(x))
        rings.append([(x, yc + y, z) for y, z in ellipse(SHEATH_N, ry, rz)])

    def uv(r, j):
        return strip_uv(SHEATH, j / SHEATH_N, r / 30)

    mesh.add(loft(rings, uv, tile_uv('metal', .5, .5), tile_uv('metal', .5, .5)))
    # Koiguchi (mouth ring) and kojiri (end cap).
    rings = []
    for x, k in ((SHEATH_MOUTH, .97), (SHEATH_MOUTH - .5, 1.05), (SHEATH_MOUTH - 4.6, 1.05), (SHEATH_MOUTH - 5.2, .99)):
        ry, rz = sheath_size(x)
        rings.append([(x, center_y(sheath_s(x)) + y * k, z * k) for y, z in ellipse(SHEATH_N, ry, rz)])
    mesh.add(loft(rings, lambda r, j: tile_uv('metal', j / SHEATH_N, r / 3), tile_uv('dark', .5, .5),
                  tile_uv('metal', .5, .5)))
    rings = []
    for x, k in ((SHEATH_END + 9.0, 1.0), (SHEATH_END + 8.4, 1.05), (SHEATH_END + 2.0, 1.05),
                 (SHEATH_END + .6, .86), (SHEATH_END, .55)):
        ry, rz = sheath_size(x)
        rings.append([(x, center_y(sheath_s(x)) + y * k, z * k) for y, z in ellipse(SHEATH_N, ry, rz)])
    mesh.add(loft(rings, lambda r, j: tile_uv('metal', j / SHEATH_N, r / 4), tile_uv('metal', .5, .5),
                  tile_uv('metal', .5, .5)))
    mesh.validate()
    return mesh


def sheath_glow():
    mesh = Mesh()
    x_from, x_to = SHEATH_MOUTH - 14.0, SHEATH_END + 24.0
    xs = [x_from + (x_to - x_from) * k / 40 for k in range(41)]
    for side in (1, -1):
        rings = []
        for x in xs:
            ry, rz = sheath_size(x)
            yc = center_y(sheath_s(x))
            pts = []
            for y, lift in ((1.15, GLOW_LIFT), (1.85, GLOW_LIFT), (1.85, GLOW_TOP), (1.15, GLOW_TOP)):
                z = rz * math.sqrt(max(0.0, 1 - (y / ry) ** 2)) + lift
                pts.append((x, yc + y, side * z))
            rings.append(pts)
        us = [0, 1, 1, 0]

        def uv(r, j):
            return canvas_uv(CANVAS_SHEATH, us[j % 4], r / 40)

        cap = canvas_uv(CANVAS_SHEATH, 0.0, 0.0)
        mesh.add(loft(rings, uv, cap, cap))
    mesh.validate()
    return mesh


# ---------------------------------------------------------------- item pose

def icon_transform(mesh, depth=4.0):
    """Same inventory pose as the Zenith shared model (Terra Blade's measured pose),
    fitted to the occupied XY bounds; depth is kept a little deeper so the glow
    layers stay clear of the surface in the GUI."""
    angle = math.radians(129.383761582)
    rotation = np.array([[math.cos(angle), -math.sin(angle), 0],
                         [math.sin(angle), math.cos(angle), 0], [0, 0, 1]])
    rotated = np.asarray(mesh.vertices) @ rotation.T
    low, high = rotated.min(axis=0), rotated.max(axis=0)
    scale = min(149.238602 / (high[0] - low[0]), 133.6534 / (high[1] - low[1]))
    center = (low + high) / 2
    depth_scale = depth / max(abs(low[2] - center[2]), abs(high[2] - center[2]))
    factors = np.array((scale, scale, depth_scale))
    offset = np.array((-13.165802, 8.0977, 15.42695))
    return lambda p, lift=0.0: ((rotation @ p) - center) * factors + offset + np.array((0, 0, lift))


def front_only(mesh):
    """Keep the closed glow components whose centre lies on the +Z (front) side."""
    out = Mesh()
    # Components are added as contiguous vertex blocks; split by connectivity.
    parent = list(range(len(mesh.vertices)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for face in mesh.faces:
        for v in face[1:]:
            parent[find(v)] = find(face[0])
    groups = {}
    for i in range(len(mesh.vertices)):
        groups.setdefault(find(i), []).append(i)
    for ids in groups.values():
        if np.mean([mesh.vertices[i][2] for i in ids]) <= 0.5:
            continue
        index = {old: new for new, old in enumerate(ids)}
        part = Mesh()
        part.vertices = [mesh.vertices[i] for i in ids]
        for face, uv in zip(mesh.faces, mesh.uvs):
            if face[0] in index:
                part.triangle(tuple(index[i] for i in face), uv)
        out.add(part)
    return out


def item_groups(blade, glow, sheath_mesh=None, sheath_glow_mesh=None):
    base = Mesh()
    base.add(blade)
    shift = np.array((0.0, -17.0, -9.0))
    if sheath_mesh is not None:
        base.add(sheath_mesh, lambda p: p + shift)
    transform = icon_transform(base)
    item = Mesh()
    item.add(base, transform)
    lum = Mesh()
    lum.add(front_only(glow), lambda p: transform(p, 0.35))
    if sheath_glow_mesh is not None:
        lum.add(front_only(sheath_glow_mesh), lambda p: transform(p + shift, 0.35))
    item.validate()
    lum.validate()
    return item, lum


def write_obj(path, groups):
    lines = ['# Zenith Rift (tenchou rekkuu): original tachi geometry, closed components only.',
             '# One 256x256 atlas. Grip pivot near 0 0 0, tip toward -X (native blade.obj layout).',
             '# *_luminous groups use SenDims rift canvas UVs (shader-baked every frame).']
    vo = to = no = 0
    for name, mesh in groups.items():
        mesh.validate()
        lines.append('g ' + name)
        lines.extend('v ' + ' '.join(f'{v:.6f}' for v in p) for p in mesh.vertices)
        for uv in mesh.uvs:
            lines.extend(f'vt {u:.6f} {v:.6f}' for u, v in uv)
        for ids in mesh.faces:
            a, b, c = np.asarray([mesh.vertices[i] for i in ids])
            normal = np.cross(b - a, c - a)
            normal /= np.linalg.norm(normal)
            lines.append('vn ' + ' '.join(f'{v:.6f}' for v in normal))
        for k, ids in enumerate(mesh.faces):
            lines.append('f ' + ' '.join(f'{i + vo + 1}/{to + k * 3 + j + 1}/{no + k + 1}' for j, i in enumerate(ids)))
        vo += len(mesh.vertices)
        to += len(mesh.faces) * 3
        no += len(mesh.faces)
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


# ---------------------------------------------------------------- texture

def hexrgb(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def texture():
    rng = random.Random(0x5EA1)
    image = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 255))
    px = image.load()

    def put(x, y, c):
        px[x, y] = (*c, 255) if len(c) == 3 else c

    # Blade: u (x) from spine to edge, v (y) from habaki to tip.
    # The dark band under the rift only spans the rift itself and narrows at its ends;
    # no line is painted across the yokote, so the kissaki continues the blade's surface.
    x0, x1 = BLADE
    for y in range(SIZE):
        s = (y - 2) / (SIZE - 5)
        wave = 2.0 * math.sin(y * 0.35) + math.sin(y * 0.13 + 1.3)
        hamon = round(47 + wave)
        opening = min(1.0, max(0.0, (SEAM_TO - s) / 0.04)) * min(1.0, max(0.0, (s - SEAM_FROM) / 0.02))
        half = round(8 * opening)
        for x in range(x0, x1):
            u = x - x0
            if u <= 5:
                c = ('#262a35', '#2d3240')[(y // 9) % 2]
            elif u <= 19:
                c = rng.choice(('#323a4e', '#36405a', '#2e3547', '#323a4e'))
            elif u <= 21:
                c = '#9aa6bf'
            elif half > 0 and abs(u - 35) <= half:
                # Under the rift slab (u 0.42-0.68 of the profile): the void the glow shows through.
                c = '#141a3a' if abs(u - 35) == half else rng.choice(('#05081a', '#070b20', '#04061a'))
            elif u <= 26:
                c = ('#76819a', '#7d889f')[min(1, (u - 22) // 3)]
            elif u < hamon:
                c = ('#8692a8', '#8a95ab')[(y // 6) % 2]
            elif u <= 55:
                c = '#e8eef8' if rng.random() < 0.08 else '#cfd8e6'
            elif u < 63:
                c = '#eef3fb'
            else:
                c = '#f8fbff'
            put(x, y, hexrgb(c))

    # Sheath lacquer: u around the ellipse (0 = edge side), v along the length.
    hx0, hx1 = SHEATH
    seam_u = (math.acos(1.5 / 6.6) / (2 * math.pi), 1 - math.acos(1.5 / 6.6) / (2 * math.pi))
    for y in range(SIZE):
        for x in range(hx0, hx1):
            u = (x - hx0 - 1) / (hx1 - hx0 - 2)
            sheen = max(0.0, math.cos((u - 0.3) * 2 * math.pi * 1.2)) ** 6 + \
                max(0.0, math.cos((u - 0.7) * 2 * math.pi * 1.2)) ** 6
            base = 13 + rng.randint(0, 3)
            c = (base + int(26 * sheen), base + 2 + int(30 * sheen), base + 8 + int(42 * sheen))
            if any(abs(u - su) < 0.03 for su in seam_u):
                c = (5, 6, 13)
            put(x, y, c)

    # Grip: black silk wrap (tsuka-ito) diamonds over dark blue rayskin.
    rx0, rx1 = GRIP
    for y in range(0, 128):
        for x in range(rx0, rx1):
            fu = (x - rx0) / 32 * 4
            fy = y / 9.0
            du, dv = abs(fu % 1 - .5), abs(fy % 1 - .5)
            if du + dv < 0.3:
                c = (44, 53, 80) if rng.random() > .25 else (61, 74, 108)
            elif abs(du - dv) < 0.08:
                c = (38, 43, 58)
            else:
                c = (14, 16, 24)
            put(x, y, c)

    def tile(name, colors, dots=None):
        ox, oy = TILES[name]
        dark, mid, light, accent = (hexrgb(c) for c in colors)
        for y in range(oy, oy + 32):
            for x in range(ox, ox + 32):
                u, v = x - ox, y - oy
                c = mid
                if u < 3 or v < 3:
                    c = light
                if u > 28 or v > 28:
                    c = dark
                if dots and 3 <= u <= 28 and 3 <= v <= 28 and rng.random() < dots:
                    c = accent
                put(x, y, c)

    tile('metal', ('#121419', '#1b1e27', '#2b303d', '#252a36'), 0.12)
    tile('guard', ('#15171e', '#20232c', '#30343f', '#2a2e3a'), 0.18)
    tile('broken', ('#101218', '#1a1c24', '#2c3140', '#3a4256'), 0.10)
    tile('habaki', ('#262b3a', '#3a4258', '#56607a', '#4a536b'), 0.08)
    tile('dark', ('#050608', '#0a0b10', '#14161e', '#0d0f15'))
    return image


# ---------------------------------------------------------------- preview

def render(image, layers, box, camera, inventory=False, frame=None, focus=None):
    """Opaque layers with a z-buffer, then glow layers added on top (depth-tested).

    Inventory views are mirrored vertically: item_* groups are stored like the native
    blade.obj (tip toward +X/-Y) and SlashBlade shows them with the tip at the top right.
    """
    x0, y0, x1, y1 = box
    width, height = x1 - x0, y1 - y0
    camera = np.array(camera, float)
    camera /= np.linalg.norm(camera)
    up = np.array((0, 1, 0) if inventory else (-1, 0, 0), float)
    right = np.cross(up, camera)
    right /= np.linalg.norm(right)
    up = np.cross(camera, right)
    all_points = np.concatenate([np.asarray(m.vertices) for m, _, _ in layers if m.vertices])
    proj_all = np.column_stack((all_points @ right, all_points @ up))
    low, high = proj_all.min(axis=0), proj_all.max(axis=0)
    middle = (low + high) / 2
    scale = .92 * min(width / (high[0] - low[0]), height / (high[1] - low[1]))
    if frame is not None:
        middle, scale = frame
    if focus is not None:
        point, scale = np.asarray(focus[0], float), focus[1]
        middle = np.array((point @ right, point @ up))
    if inventory:
        scale, middle = min(width, height) / 125, np.zeros(2)
    zbuffer = np.full((height, width), -np.inf)
    pixels = np.array(image.crop(box).convert('RGB')).astype(float)
    light = np.array((-.45, .5, 1))
    light /= np.linalg.norm(light)
    for glow_pass in (False, True):
        for mesh, atlas, glow in layers:
            if glow != glow_pass or not mesh.faces:
                continue
            tex = np.array(atlas.convert('RGB')).astype(float)
            tex_h, tex_w = tex.shape[:2]
            points = np.asarray(mesh.vertices)
            projected = np.column_stack((points @ right, points @ up))
            flip = np.array((1, 1)) if inventory else np.array((1, -1))
            projected = (projected - middle) * scale * flip + np.array((width / 2, height / 2))
            depth = points @ camera
            for face, uv in zip(mesh.faces, mesh.uvs):
                ids = list(face)
                a, b, c = points[ids]
                normal = np.cross(b - a, c - a)
                normal /= np.linalg.norm(normal)
                if normal @ camera <= 0:
                    continue
                p = projected[ids]
                xmin, ymin = np.maximum(np.floor(p.min(axis=0)).astype(int), 0)
                xmax, ymax = np.minimum(np.ceil(p.max(axis=0)).astype(int), (width - 1, height - 1))
                if xmin > xmax or ymin > ymax:
                    continue
                yy, xx = np.mgrid[ymin:ymax + 1, xmin:xmax + 1]
                xx, yy = xx + .5, yy + .5
                denom = (p[1, 1] - p[2, 1]) * (p[0, 0] - p[2, 0]) + (p[2, 0] - p[1, 0]) * (p[0, 1] - p[2, 1])
                if abs(denom) < 1e-9:
                    continue
                w0 = ((p[1, 1] - p[2, 1]) * (xx - p[2, 0]) + (p[2, 0] - p[1, 0]) * (yy - p[2, 1])) / denom
                w1 = ((p[2, 1] - p[0, 1]) * (xx - p[2, 0]) + (p[0, 0] - p[2, 0]) * (yy - p[2, 1])) / denom
                weights = np.stack((w0, w1, 1 - w0 - w1), axis=-1)
                zz = weights @ depth[ids]
                region = zbuffer[ymin:ymax + 1, xmin:xmax + 1]
                inside = weights.min(axis=-1) >= -1e-7
                mask = inside & ((zz >= region - 0.5) if glow else (zz > region))
                if not mask.any():
                    continue
                coords = weights @ np.array(uv)
                tx = np.clip((coords[..., 0] * tex_w).astype(int), 0, tex_w - 1)
                ty = np.clip(((1 - coords[..., 1]) * tex_h).astype(int), 0, tex_h - 1)
                target = pixels[ymin:ymax + 1, xmin:xmax + 1]
                if glow:
                    target[mask] = np.minimum(255, target[mask] + tex[ty, tx][mask])
                else:
                    strength = .54 + .52 * max(0, normal @ light)
                    target[mask] = np.clip(tex[ty, tx] * strength, 0, 255)[mask]
                    region[mask] = zz[mask]
    image.paste(Image.fromarray(pixels.astype('uint8')), (x0, y0))


def font(size):
    for path in ('C:/Windows/Fonts/msyh.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def preview(path, groups, atlas, canvas):
    image = Image.new('RGB', (1500, 1040), '#0d121d')
    draw = ImageDraw.Draw(image)
    draw.text((36, 20), '天顶·裂空 · 原创太刀模型', font=font(32), fill='#e6eef8')
    draw.text((36, 68), '深蓝空间裂缝贯穿刀身（着色器实时绘制）· 素面深色圆镡与细发光缝 · 黑漆刀鞘与鞘身裂缝 · 不镶宝石',
              font=font(18), fill='#8fb0cf')
    blade = [(groups['blade'], atlas, False), (groups['blade_luminous'], canvas, True)]
    sheath_layers = [(groups['sheath'], atlas, False), (groups['sheath_luminous'], canvas, True)]
    views = [('正面', blade, (0, 0, 1)), ('背面', blade, (0, 0, -1)),
             ('斜侧面', blade, (.12, .72, 1)), ('刀鞘', sheath_layers, (0, 0, 1))]
    for index, (name, layers, camera) in enumerate(views):
        x = 24 + index * 270
        draw.rounded_rectangle((x, 110, x + 255, 900), 12, fill='#162032')
        render(image, layers, (x + 10, 130, x + 245, 860), camera)
        draw.text((x + 100, 866), name, font=font(20), fill='#b9cbd9')
    x = 1110
    draw.rounded_rectangle((x, 110, x + 366, 900), 12, fill='#162032')
    item = [(groups['item_blade'], atlas, False), (groups['item_blade_luminous'], canvas, True)]
    render(image, item, (x + 20, 130, x + 250, 360), (0, 0, 1), True)
    draw.text((x + 40, 362), '物品栏（带鞘）', font=font(18), fill='#b9cbd9')
    bare = [(groups['item_bladens'], atlas, False), (groups['item_bladens_luminous'], canvas, True)]
    render(image, bare, (x + 20, 400, x + 250, 630), (0, 0, 1), True)
    draw.text((x + 40, 632), '物品栏（无鞘）', font=font(18), fill='#b9cbd9')
    broken = [(groups['item_damaged'], atlas, False), (groups['item_damaged_luminous'], canvas, True)]
    render(image, broken, (x + 20, 664, x + 250, 894), (0, 0, 1), True)
    draw.text((x + 250, 860), '损坏', font=font(18), fill='#b9cbd9')
    for k, layers in enumerate((item, bare)):
        slot = Image.new('RGB', (16, 16), '#8b8b8b')
        render(slot, layers, (0, 0, 16, 16), (0, 0, 1), True)
        image.paste(slot.resize((96, 96), Image.Resampling.NEAREST), (x + 262, 160 + k * 270))
        draw.text((x + 262, 262 + k * 270), '16px', font=font(16), fill='#8fb0cf')
    faces = sum(len(groups[g].faces) for g in groups)
    draw.text((36, 930), f'刀身 {len(groups["blade"].faces)} 面 · 发光层 {len(groups["blade_luminous"].faces)} 面 · '
              f'刀鞘 {len(groups["sheath"].faces)} 面 · 全部分组 {faces} 面 · 256×256 像素贴图（不含发光）',
              font=font(18), fill='#d1dedf')
    draw.text((36, 970), '坐标沿用原生 blade.obj：刀尖朝 -X，刀身比原生太刀长约三成；发光部件放在 *_luminous 分组，采样特供模组每帧烘焙的着色器画布',
              font=font(18), fill='#8fb0cf')
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def detail(path, groups, atlas, canvas):
    """Close-ups: kissaki, the rift mid-blade, guard face with its seam ring, sheath mouth."""
    blade = [(groups['blade'], atlas, False), (groups['blade_luminous'], canvas, True)]
    sheath_layers = [(groups['sheath'], atlas, False), (groups['sheath_luminous'], canvas, True)]
    image = Image.new('RGB', (1500, 900), '#0d121d')
    draw = ImageDraw.Draw(image)
    draw.text((36, 20), '天顶·裂空 · 局部放大', font=font(30), fill='#e6eef8')
    s_tip, s_mid = 0.95, 0.5
    views = [('刀尖（帽子）', blade, (0, 0, 1), ((blade_x(s_tip), center_y(s_tip), 0), 14)),
             ('刀身中段的裂缝', blade, (0, 0, 1), ((blade_x(s_mid), center_y(s_mid), 0), 14)),
             ('刀镡（柄侧）与发光缝', blade, (.85, .25, .55), ((GUARD_GRIP_SIDE, 3.6, 0), 11)),
             ('鞘口与鞘身裂缝', sheath_layers, (0, 0, 1), ((SHEATH_MOUTH - 25, center_y(0), 0), 9))]
    for index, (name, layers, camera, focus) in enumerate(views):
        x = 24 + index * 368
        draw.rounded_rectangle((x, 80, x + 352, 860), 12, fill='#162032')
        render(image, layers, (x + 10, 100, x + 342, 800), camera, focus=focus)
        draw.text((x + 20, 815), name, font=font(20), fill='#b9cbd9')
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--canvas', type=Path, help='A baked frame of zenith_rift_blade.fsh (128x4096, GL row 0 at the top).')
    parser.add_argument('--preview', type=Path)
    args = parser.parse_args()
    blade, damaged = make_blade(), make_blade(True)
    glow, damaged_glow = make_blade_glow(), make_blade_glow(True)
    sheath_mesh, sheath_lum = sheath(), sheath_glow()
    item_blade, item_blade_lum = item_groups(blade, glow, sheath_mesh, sheath_lum)
    item_bare, item_bare_lum = item_groups(blade, glow)
    item_broken, item_broken_lum = item_groups(damaged, damaged_glow)
    groups = {'blade': blade, 'blade_luminous': glow,
              'blade_damaged': damaged, 'blade_damaged_luminous': damaged_glow,
              'sheath': sheath_mesh, 'sheath_luminous': sheath_lum,
              'item_blade': item_blade, 'item_blade_luminous': item_blade_lum,
              'item_bladens': item_bare, 'item_bladens_luminous': item_bare_lum,
              'item_damaged': item_broken, 'item_damaged_luminous': item_broken_lum}
    atlas = texture()
    args.out.mkdir(parents=True, exist_ok=True)
    write_obj(args.out / 'zenith_final.obj', groups)
    atlas.save(args.out / 'zenith_final.png')
    if args.preview:
        canvas = Image.open(args.canvas).convert('RGB') if args.canvas else Image.new('RGB', (128, 4096))
        preview(args.preview, groups, atlas, canvas)
        detail(args.preview.with_name(args.preview.stem + '-detail.png'), groups, atlas, canvas)
    print({name: len(mesh.faces) for name, mesh in groups.items()})


if __name__ == '__main__':
    main()
