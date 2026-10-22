"""Angular low-poly Damnation models, shared 128px atlas, and offline previews.

Run with Python + numpy + Pillow. No game extraction, shader, or external model
dependency. Model units follow SlashBlade: negative X is the tip and the middle
of the grip is (0, 0, 0). Each component is a closed, outward-wound solid.
"""
from __future__ import annotations

import argparse
import collections
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'kubejs/assets/sdbf/model/damnation'
TAU = math.tau
# Approved candidate-v2: short barbs, 580 / 780 triangles. Regenerating without
# options must reproduce the installed choice, never the enlarged-barb draft.
APPLIED_PROFILE = 'angular'
# Deliberate square/diamond cross-sections and coarse bends fit Minecraft's
# silhouette. Shared budgets also apply to damaged and inventory variants.
SECTION_SIDES = 4
BRAID_RINGS = 17
BROKEN_BRAID_RINGS = 10
BARB_RINGS = 5
GRIP_WRAP_RINGS = 9
CORE_RINGS = 9
BROKEN_CORE_RINGS = 6
POMMEL_SEGMENTS = 6
SEAM_RINGS = 3
FAN_CAPS = True
RESTORED_BARBS = False


def select_profile(profile):
    global BRAID_RINGS, BROKEN_BRAID_RINGS, BARB_RINGS, GRIP_WRAP_RINGS
    global CORE_RINGS, BROKEN_CORE_RINGS, POMMEL_SEGMENTS, SEAM_RINGS, FAN_CAPS, RESTORED_BARBS
    RESTORED_BARBS = profile == 'angular_restored'
    if profile in ('angular', 'angular_restored'):
        BRAID_RINGS, BROKEN_BRAID_RINGS, BARB_RINGS, GRIP_WRAP_RINGS = 11, 7, 4, 6
        CORE_RINGS, BROKEN_CORE_RINGS, POMMEL_SEGMENTS, SEAM_RINGS = 5, 4, 4, 2
        FAN_CAPS = False
    elif profile == 'current':
        BRAID_RINGS, BROKEN_BRAID_RINGS, BARB_RINGS, GRIP_WRAP_RINGS = 17, 10, 5, 9
        CORE_RINGS, BROKEN_CORE_RINGS, POMMEL_SEGMENTS, SEAM_RINGS = 9, 6, 6, 3
        FAN_CAPS = True
    else:
        raise ValueError(profile)


class Mesh:
    def __init__(self):
        self.vertices, self.faces, self.uvs = [], [], []

    def triangle(self, ids, uv):
        self.faces.append(tuple(ids))
        self.uvs.append(tuple(uv))

    def add(self, other, transform=None):
        offset = len(self.vertices)
        self.vertices.extend(tuple(transform(np.array(p))) if transform else p for p in other.vertices)
        self.faces.extend(tuple(i + offset for i in face) for face in other.faces)
        self.uvs.extend(other.uvs)

    def validate(self):
        edges, directed = collections.Counter(), collections.Counter()
        neighbors = collections.defaultdict(set)
        for face in self.faces:
            a, b, c = np.array([self.vertices[i] for i in face])
            assert np.linalg.norm(np.cross(b - a, c - a)) > 1e-7, 'Degenerate face'
            for u, v in zip(face, (face[1], face[2], face[0])):
                edges[tuple(sorted((u, v)))] += 1
                directed[u, v] += 1
                neighbors[u].add(v)
                neighbors[v].add(u)
        assert all(n == 2 for n in edges.values()), 'Open/non-manifold component'
        assert all(directed[v, u] == n for (u, v), n in directed.items()), 'Reversed edge'
        # A closed but wholly inside-out component also passes the edge check.
        pending = set(neighbors)
        while pending:
            component, todo = set(), [next(iter(pending))]
            while todo:
                node = todo.pop()
                if node in component:
                    continue
                component.add(node)
                todo.extend(neighbors[node] - component)
            pending.difference_update(component)
            volume = 0.0
            for face in self.faces:
                if face[0] in component:
                    a, b, c = np.array([self.vertices[i] for i in face])
                    volume += np.dot(a, np.cross(b, c)) / 6
            assert volume > 1e-7, ('Inside-out component', volume)
        assert np.isfinite(self.vertices).all()
        assert np.isfinite(self.uvs).all()


def atlas_uv(material, u, v):
    # Four strips, padded away from neighboring materials. OBJ V is bottom-up.
    return ((material * 32 + 2 + u * 27) / 128, 1 - (3 + v * 121) / 128)


def tube(path, radii, material=0, sides=SECTION_SIDES, flatten=1.0, twist=0.0, closed=False):
    """Parallel transported elliptical rings; UVs follow the curved metal."""
    mesh = Mesh()
    points = np.array(path, dtype=float)
    count = len(points)
    tangents = []
    for i in range(count):
        if closed:
            d = points[(i + 1) % count] - points[(i - 1) % count]
        else:
            d = points[min(i + 1, count - 1)] - points[max(i - 1, 0)]
        tangents.append(d / np.linalg.norm(d))
    normal = np.cross(tangents[0], (0, 0, 1))
    if np.linalg.norm(normal) < .01:
        normal = np.cross(tangents[0], (0, 1, 0))
    normal /= np.linalg.norm(normal)
    for i, (p, tangent, radius) in enumerate(zip(points, tangents, radii)):
        previous_binormal = np.cross(tangents[max(0, i-1)], normal)
        normal -= tangent * np.dot(normal, tangent)
        if np.linalg.norm(normal) < 1e-8:
            # A four-sided ring has right-angle turns: projection alone loses
            # the normal. Preserve the previous bend plane at that corner.
            normal = np.cross(previous_binormal, tangent)
        normal /= np.linalg.norm(normal)
        binormal = np.cross(tangent, normal)
        for j in range(sides):
            angle = j / sides * TAU + twist * i / max(1, count - 1)
            q = p + radius * (math.cos(angle) * normal + math.sin(angle) * binormal * flatten)
            mesh.vertices.append(tuple(q))
    intervals = count if closed else count - 1
    for i in range(intervals):
        nxt = (i + 1) % count
        for j in range(sides):
            k = (j + 1) % sides
            ids = (i * sides + j, i * sides + k, nxt * sides + k, nxt * sides + j)
            uv = [atlas_uv(material, u, v) for u, v in
                  ((j / sides, i / intervals), ((j + 1) / sides, i / intervals),
                   ((j + 1) / sides, (i + 1) / intervals), (j / sides, (i + 1) / intervals))]
            mesh.triangle((ids[0], ids[1], ids[2]), (uv[0], uv[1], uv[2]))
            mesh.triangle((ids[0], ids[2], ids[3]), (uv[0], uv[2], uv[3]))
    if not closed:
        for end in (0, count - 1):
            if not FAN_CAPS:
                # Convex planar cross-sections need no extra center vertex.
                ids = [end*sides+j for j in range(sides)]
                if end == 0:
                    ids.reverse()
                for j in range(1, sides-1):
                    mesh.triangle((ids[0], ids[j], ids[j+1]), [atlas_uv(material, .5, .5)]*3)
                continue
            center = len(mesh.vertices)
            mesh.vertices.append(tuple(points[end]))
            for j in range(sides):
                a, b = end * sides + j, end * sides + (j + 1) % sides
                if end == 0:
                    a, b = b, a
                mesh.triangle((center, a, b), [atlas_uv(material, .5, .5)] * 3)
    mesh.validate()
    return mesh


def curve(control, steps=None):
    if steps is None:
        steps = BARB_RINGS
    a, b, c, d = np.array(control, float)
    return [(1-t)**3*a + 3*(1-t)**2*t*b + 3*(1-t)*t*t*c + t**3*d
            for t in np.linspace(0, 1, steps)]


def barb(mesh, control, width, material=1, sides=SECTION_SIDES, steps=None):
    points = curve(control, steps)
    radii = [max(.08, width * (1 - t)**.85) for t in np.linspace(0, 1, len(points))]
    mesh.add(tube(points, radii, material, sides, flatten=.48))


def grip(mesh, final):
    mesh.add(tube([(x, 0, 0) for x in (-32, -25, 0, 25, 31)], [5, 4.5, 4, 4.8, 5], 2, SECTION_SIDES, .85))
    # Two cast-gold strands wrap the handle; they are geometry, not painted bands.
    for phase in (0, math.pi):
        path = [(x, 4.2*math.cos(t*TAU*1.2+phase), 3.6*math.sin(t*TAU*1.2+phase))
                for t, x in zip(np.linspace(0, 1, GRIP_WRAP_RINGS), np.linspace(-30, 29, GRIP_WRAP_RINGS))]
        mesh.add(tube(path, [1.3]*len(path), 0))
    for x in (-30, 28):
        mesh.add(tube([(x-1, 0, 0), (x+1, 0, 0)], [5.2, 5.2], 1, SECTION_SIDES, .88))
    ring = [(36+5.6*math.cos(t), 5.6*math.sin(t), 0) for t in np.linspace(0, TAU, POMMEL_SEGMENTS, endpoint=False)]
    mesh.add(tube(ring, [1.6]*len(ring), 0, closed=True))
    # One short asymmetrical hooked guard, as on the source weapon.
    barb(mesh, [(-31, 3, 0), (-37, 15, 0), (-17, 15, 1), (-19, 27 if final else 21, 1)], 3.1)


def restored_barbs(mesh, cutoff):
    """Unfurled golden impaling quills: long blades, four rings each.

    The source silhouette spreads sideways and slightly toward the main tip;
    avoid the previous small hooks swept back toward the hilt. Reuse the same
    six lateral + two depth quills, with no additional geometry components.
    """
    for index, (root, reach, sweep, width) in enumerate((
            (-126, 94, 37, 8.6), (-187, 74, 28, 7.2), (-242, 51, 21, 5.8))):
        if root < cutoff:
            continue
        for side in (-1, 1):
            x = root+(12 if side < 0 else 0)
            span = reach*(1.0 if side > 0 else .91)
            z = (1 if index % 2 else -1)*3
            # Unequal heights and subtle front/back splay keep the thorns from
            # reading as identical ornaments glued onto a flat sword face.
            path = [(x, side*3, z), (x-sweep*.64, side*span*.23, z+side*5),
                    (x-sweep, side*span*.62, z+side*10),
                    (x-sweep*.86, side*span, z+side*15)]
            mesh.add(tube(path, [width, width*.92, width*.53, .09], 1, flatten=.48))
    # Reposition the existing rear pair into opposing directions so the opened
    # weapon remains recognisable from the side, without adding another pair.
    root = -164
    if root >= cutoff:
        for side in (-1, 1):
            x = root+(9 if side > 0 else 0)
            path = [(x, 1, side*2), (x-19, side*8, side*18),
                    (x-31, side*16, side*44), (x-27, side*21, side*68)]
            mesh.add(tube(path, [7, 6.3, 3.6, .09], 0, flatten=.5))


def blade(final=False, broken=False):
    mesh = Mesh()
    grip(mesh, final)
    length = 288 if final else 267
    limit = .52 if broken else 1.0
    # A narrow twisted spindle keeps an actual stabbing edge within the braid.
    ts = np.linspace(0, limit, CORE_RINGS if not broken else BROKEN_CORE_RINGS)
    core = [(-32-length*t, 1.5*math.sin(t*12), .5*math.sin(t*19)) for t in ts]
    radii = [max(.22, (5.4 if final else 4.6)*(1-t)**.55) for t in ts]
    mesh.add(tube(core, radii, 2 if final else 0, 4, .55, twist=TAU*.8))
    # Enclosed strands form the almond-shaped root and a tapering helical blade.
    for index in range(3):
        ts = np.linspace(0, limit, BRAID_RINGS if not broken else BROKEN_BRAID_RINGS)
        points, widths = [], []
        for t in ts:
            profile = float(np.interp(t, [0, .12, .24, .40, .62, .83, 1], [3.8, 10, 17.5, 10.0, 6, 3.2, .1]))
            angle = t * TAU * 2.35 + index * TAU / 3 + .3
            points.append((-32-length*t, profile*math.cos(angle), profile*.64*math.sin(angle)))
            widths.append(max(.22, (5.2 if index != 2 else 2.9)*(1-t)**.55))
        mesh.add(tube(points, widths, 1 if index == 1 else 0, SECTION_SIDES, .63))
    if final and RESTORED_BARBS:
        restored_barbs(mesh, -32-length*limit)
    if final and not RESTORED_BARBS:
        # Midra-inspired released barbs: long curved quills at staggered heights.
        for index, (x, span, sweep, width) in enumerate(((-105, 42, 39, 5.0), (-155, 36, 31, 4.4), (-207, 25, 24, 3.5))):
            if broken and x < -32-length*limit:
                continue
            for sign in (-1, 1):
                xx = x + (11 if sign < 0 else 0)
                z = (-1 if index % 2 else 1) * 5
                barb(mesh, [(xx, sign*3, z), (xx-14, sign*span*.48, z+sign*3),
                            (xx+sweep*.22, sign*span, z+sign*6), (xx+sweep, sign*span, z+sign*8)], width)
        # Rear prongs give the crown volume without making it a flat silhouette.
        for sign in (-1, 1):
            barb(mesh, [(-95, sign*5, -2), (-115, sign*14, -14), (-87, sign*18, -25), (-66, sign*17, -23)], 3.3, 0)
    if final:
        # Thin amber seams sit in the central metal, opaque and inexpensive.
        for index, x in enumerate((-63, -101, -141, -179, -221)):
            if broken and x < -32-length*limit+10:
                continue
            barb(mesh, [(x, 0, 1.9), (x-7, 2, 2.2), (x-16, -1, 2), (x-22, 0, 1.6)], .65, 3, steps=SEAM_RINGS)
    else:
        for x, sign, width in ((-70, 1, 2.3), (-129, -1, 2.1), (-183, 1, 1.5)):
            if broken and x < -32-length*limit:
                continue
            barb(mesh, [(x, sign*7, 0), (x-9, sign*15, 1), (x+5, sign*18, 2), (x+13, sign*16, 2)], width)
    mesh.validate()
    return mesh


def icon(mesh):
    vertices = np.array(mesh.vertices)
    center = (vertices.min(axis=0)+vertices.max(axis=0))/2
    # Default SlashBlade diagonal: tip at upper right, hilt at lower left.
    angle = math.radians(225)
    rotation = np.array([[math.cos(angle), -math.sin(angle), 0], [math.sin(angle), math.cos(angle), 0], [0, 0, 1]])
    # Small icons need a little more width to keep the separated gold strands legible.
    rotation = rotation @ np.diag((1, 1.3, 1))
    rotated = (vertices-center) @ rotation.T
    scale = 102 / max(np.ptp(rotated[:, :2], axis=0))
    offset = np.array((0., 3., max(25., 6.5-rotated[:, 2].min()*scale)))
    # The unfolded depth quills must also clear the GUI durability plane.
    # Recenter only an icon that would exceed the margin, keeping existing
    # compact weapon icons identical to the earlier candidate.
    if np.abs(rotated[:, :2]*scale+offset[:2]).max() >= 58:
        offset[:2] -= (rotated[:, :2].min(axis=0)+rotated[:, :2].max(axis=0))*scale/2
    result = Mesh()
    result.add(mesh, lambda p: rotation @ (p-center) * scale + offset)
    return result


def texture():
    """Hand-authored pixel atlas: hammered gold, polished ridges, char, amber."""
    rng = np.random.default_rng(421)
    image = Image.new('RGBA', (128, 128))
    colors = [(196, 142, 49), (232, 182, 82), (88, 58, 25), (247, 160, 20)]
    for mat, base in enumerate(colors):
        for y in range(128):
            for x in range(32):
                groove = math.cos(x/31*TAU*2 + .16*math.sin(y*.13))
                grain = float(rng.normal(0, 2.5))
                hammered = 5*math.sin(x*.71+y*.23)*math.sin(y*.53-x*.17)
                shade = 14*groove + grain + hammered
                image.putpixel((mat*32+x, y), tuple(int(np.clip(c+shade, 0, 255)) for c in base)+(255,))
    draw = ImageDraw.Draw(image)
    for mat in (0, 1, 2):
        for i in range(24):
            x = mat*32 + int(rng.integers(3, 29))
            y = int(rng.integers(3, 117))
            length = int(rng.integers(2, 9))
            base = colors[mat]
            draw.line((x, y, x-1, y+length), fill=tuple(max(0, c-28) for c in base)+(255,))
            if i % 3 == 0:
                draw.point((x+1, y), fill=tuple(min(255, c+40) for c in base)+(255,))
    return image


def write_obj(path, groups):
    lines = ['# Original Damnation model. All components closed; grip centered at origin.',
             '# Shared opaque 128x128 atlas; native SlashBlade groups.']
    vertex_offset = uv_offset = normal_offset = 0
    for name, mesh in groups.items():
        mesh.validate()
        lines.append('g '+name)
        lines.extend('v '+' '.join(f'{v:.6f}' for v in p) for p in mesh.vertices)
        for uv in mesh.uvs:
            lines.extend(f'vt {u:.6f} {v:.6f}' for u, v in uv)
        for face in mesh.faces:
            a, b, c = np.array([mesh.vertices[i] for i in face])
            normal = np.cross(b-a, c-a)
            normal /= np.linalg.norm(normal)
            lines.append('vn '+' '.join(f'{v:.6f}' for v in normal))
        for k, face in enumerate(mesh.faces):
            lines.append('f '+' '.join(f'{i+vertex_offset+1}/{uv_offset+k*3+j+1}/{normal_offset+k+1}' for j, i in enumerate(face)))
        vertex_offset += len(mesh.vertices)
        uv_offset += len(mesh.uvs)*3
        normal_offset += len(mesh.faces)
    path.write_text('\n'.join(lines)+'\n', encoding='utf-8')


def render(image, mesh, atlas, box, camera=(.15, .25, 1), inventory=False, frame=None):
    x0, y0, x1, y1 = box
    width, height = x1-x0, y1-y0
    camera = np.array(camera, float)
    camera /= np.linalg.norm(camera)
    up = np.array((0, 1, 0) if inventory else (-1, 0, 0), float)
    right = np.cross(up, camera)
    right /= np.linalg.norm(right)
    up = np.cross(camera, right)
    points = np.array(mesh.vertices)
    projected = np.column_stack((points@right, points@up))
    low, high = projected.min(axis=0), projected.max(axis=0)
    middle = (low+high)/2
    scale = .92*min(width/(high[0]-low[0]), height/(high[1]-low[1]))
    if frame is not None:
        middle, scale = frame
    if inventory:
        scale, middle = min(width, height)/125, np.zeros(2)
    projected = (projected-middle)*scale*np.array((1, -1))+np.array((width/2, height/2))
    depth = points@camera
    zbuffer = np.full((height, width), -np.inf)
    pixels = np.array(image.crop(box).convert('RGB'))
    tex = np.array(atlas.convert('RGB'))
    light = np.array((-.45, .5, 1))
    light /= np.linalg.norm(light)
    for face, uv in zip(mesh.faces, mesh.uvs):
        ids = list(face)
        a, b, c = points[ids]
        normal = np.cross(b-a, c-a)
        normal /= np.linalg.norm(normal)
        if normal@camera <= 0:
            continue
        p = projected[ids]
        xmin, ymin = np.maximum(np.floor(p.min(axis=0)).astype(int), 0)
        xmax, ymax = np.minimum(np.ceil(p.max(axis=0)).astype(int), (width-1, height-1))
        if xmin > xmax or ymin > ymax:
            continue
        yy, xx = np.mgrid[ymin:ymax+1, xmin:xmax+1]
        xx, yy = xx+.5, yy+.5
        denom = (p[1, 1]-p[2, 1])*(p[0, 0]-p[2, 0])+(p[2, 0]-p[1, 0])*(p[0, 1]-p[2, 1])
        if abs(denom) < 1e-9:
            continue
        w0 = ((p[1, 1]-p[2, 1])*(xx-p[2, 0])+(p[2, 0]-p[1, 0])*(yy-p[2, 1]))/denom
        w1 = ((p[2, 1]-p[0, 1])*(xx-p[2, 0])+(p[0, 0]-p[2, 0])*(yy-p[2, 1]))/denom
        weights = np.stack((w0, w1, 1-w0-w1), axis=-1)
        zz = weights@depth[ids]
        region = zbuffer[ymin:ymax+1, xmin:xmax+1]
        mask = (weights.min(axis=-1) >= -1e-7) & (zz > region)
        if not mask.any():
            continue
        coords = weights@np.array(uv)
        tx = np.clip((coords[..., 0]*128).astype(int), 0, 127)
        ty = np.clip(((1-coords[..., 1])*128).astype(int), 0, 127)
        strength = .54 + .52*max(0, normal@light)
        color = np.clip(tex[ty, tx]*strength, 0, 255).astype('uint8')
        pixels[ymin:ymax+1, xmin:xmax+1][mask] = color[mask]
        region[mask] = zz[mask]
    image.paste(Image.fromarray(pixels), (x0, y0))


def preview(path, blades, atlas, heading='永罚系列 · 多边形减面版'):
    image = Image.new('RGB', (1540, 1080), '#11151b')
    draw = ImageDraw.Draw(image)
    font_path = 'C:/Windows/Fonts/msyh.ttc'
    title = ImageFont.truetype(font_path, 30)
    small = ImageFont.truetype(font_path, 19)
    draw.text((46, 24), heading, font=title, fill='#eee0bb')
    for col, (name, mesh) in enumerate(blades.items()):
        x = 35+col*770
        label = '永罚大剑 · 收束螺旋' if name == 'greatsword' else '「永罚」· 展开逆刺'
        draw.rounded_rectangle((x, 85, x+735, 1035), 14, fill='#1a2029', outline='#383e45')
        draw.text((x+22, 102), label, font=title, fill='#e4c586')
        draw.text((x+22, 149), f'{len(mesh.faces):,} 三角面 / 共用 128 × 128 不透明贴图', font=small, fill='#a9b1ba')
        for view, camera in enumerate(((.06, .12, 1), (.06, .12, -1), (.03, 1, .12))):
            left = x+20+view*235
            render(image, mesh, atlas, (left, 210, left+220, 775), camera)
            draw.text((left+80, 788), ('正面', '背面', '侧面')[view], font=small, fill='#afb6bd')
        render(image, icon(mesh), atlas, (x+36, 850, x+190, 1004), (0, 0, 1), True)
        # Pixel-accurate 16px slot enlarged by nearest-neighbor for inspection.
        slot = Image.new('RGB', (16, 16), '#8b8b8b')
        render(slot, icon(mesh), atlas, (0, 0, 16, 16), (0, 0, 1), True)
        image.paste(slot.resize((112, 112), Image.Resampling.NEAREST), (x+226, 868))
        draw.text((x+367, 871), '左：物品栏姿势\n中：16px 图标放大\n握持点：剑柄中心\n无刀鞘 / 实体逆刺', font=small, fill='#a9b1ba', spacing=9)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def read_blade(path):
    """Read the actual installed blade group for an honest preview comparison."""
    mesh, vertices, uvs, remap = Mesh(), [], [], {}
    group = None
    for line in path.read_text(encoding='utf-8').splitlines():
        fields = line.split()
        if not fields:
            continue
        if fields[0] == 'v':
            vertices.append(tuple(map(float, fields[1:])))
        elif fields[0] == 'vt':
            uvs.append(tuple(map(float, fields[1:])))
        elif fields[0] == 'g':
            group = fields[1]
        elif fields[0] == 'f' and group == 'blade':
            ids, coords = [], []
            for corner in fields[1:]:
                v, uv, _ = map(int, corner.split('/'))
                if v not in remap:
                    remap[v] = len(mesh.vertices)
                    mesh.vertices.append(vertices[v-1])
                ids.append(remap[v])
                coords.append(uvs[uv-1])
            mesh.triangle(ids, coords)
    return mesh


def comparison_preview(path, candidates, atlas):
    image = Image.new('RGB', (1560, 1050), '#11151b')
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 27)
    small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 20)
    draw.text((35, 23), '第二次多边形化 · 候选预览，尚未应用', font=font, fill='#eee0bb')
    draw.text((35, 67), '同角度 / 同贴图 / 保留螺旋金刃与展开逆刺', font=small, fill='#a9b1ba')
    for index, (name, candidate) in enumerate(candidates.items()):
        installed = read_blade(OUT/(name+'.obj'))
        x = 25+index*780
        draw.rounded_rectangle((x, 112, x+750, 1028), 14, fill='#1a2029', outline='#383e45')
        draw.text((x+25, 128), '永罚大剑' if name == 'greatsword' else '「永罚」', font=font, fill='#e4c586')
        for col, (label, mesh) in enumerate((('当前版', installed), ('候选版', candidate))):
            left = x+22+col*370
            draw.text((left+72, 180), f'{label} · {len(mesh.faces):,} 面', font=small, fill='#d4dbe0')
            render(image, mesh, atlas, (left, 225, left+325, 814), (.06, .12, 1))
            render(image, icon(mesh), atlas, (left+91, 828, left+231, 968), (0, 0, 1), True)
        reduction = (1-len(candidate.faces)/len(installed.faces))*100
        draw.text((x+218, 986), f'三角面数进一步减少 {reduction:.1f}%', font=small, fill='#c8b483')
    image.save(path)


def restoration_preview(path, baseline, candidate, atlas):
    image = Image.new('RGB', (1500, 1120), '#11151b')
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 28)
    small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 20)
    draw.text((35, 24), '「永罚」· 展开长刺还原候选（未应用）', font=font, fill='#eee0bb')
    draw.text((35, 70), '剑身等比例对比 / 金色主刺延长 / 前后方向展开 / 三角面数不增加', font=small, fill='#a9b1ba')
    camera = np.array((.06, .12, 1), float)
    camera /= np.linalg.norm(camera)
    right = np.cross((-1, 0, 0), camera)
    right /= np.linalg.norm(right)
    up = np.cross(camera, right)
    union = np.array(baseline.vertices+candidate.vertices)
    projection = np.column_stack((union@right, union@up))
    low, high = projection.min(axis=0), projection.max(axis=0)
    shared_frame = ((low+high)/2, .92*min(430/(high[0]-low[0]), 660/(high[1]-low[1])))
    for index, (label, mesh, cam) in enumerate((
            ('上一候选 · 正面', baseline, camera),
            ('还原优化 · 正面', candidate, camera),
            ('还原优化 · 侧面', candidate, (.03, 1, .12)))):
        x = 20+index*500
        draw.rounded_rectangle((x, 122, x+460, 1095), 12, fill='#1a2029', outline='#383e45')
        draw.text((x+27, 143), label, font=font, fill='#e4c586')
        draw.text((x+27, 185), f'{len(mesh.faces):,} 三角面 · 128 × 128 贴图', font=small, fill='#a9b1ba')
        render(image, mesh, atlas, (x+15, 230, x+445, 890), cam,
               frame=shared_frame if index < 2 else None)
        if index < 2:
            render(image, icon(mesh), atlas, (x+140, 910, x+310, 1080), (0, 0, 1), True)
        else:
            draw.text((x+42, 946), '侧向主刺约扩大至 2 倍\n长刺从粗根过渡至尖端\n维持四边截面与三个转折段\n预览保留握柄与刀身原长度', font=small, fill='#a9b1ba', spacing=10)
    image.save(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--preview', type=Path)
    parser.add_argument('--profile', choices=('current', 'angular', 'angular_restored'), default=APPLIED_PROFILE)
    parser.add_argument('--output', type=Path, help='Explicit destination; unapproved profiles must be outside kubejs.')
    parser.add_argument('--baseline', type=Path, help='Earlier candidate folder for restoration comparison.')
    args = parser.parse_args()
    output = (args.output or OUT).resolve()
    if args.profile != APPLIED_PROFILE and (args.output is None or output.is_relative_to(ROOT/'kubejs')):
        parser.error('This unapproved profile requires --output outside kubejs; it must not replace live assets.')
    if args.profile == 'angular_restored' and (args.baseline is None or not (args.baseline/'damnation.obj').is_file()):
        parser.error('The restored candidate requires --baseline pointing to an existing candidate folder.')
    select_profile(args.profile)
    output.mkdir(parents=True, exist_ok=True)
    atlas = texture()
    atlas.save(output/'damnation_gold.png')
    blades = {}
    for name, final in (('greatsword', False), ('damnation', True)):
        whole, damaged = blade(final), blade(final, True)
        blades[name] = whole
        write_obj(output/(name+'.obj'), {
            'blade': whole, 'sheath': Mesh(), 'blade_damaged': damaged,
            'item_blade': icon(whole), 'item_bladens': icon(whole), 'item_damaged': icon(damaged),
        })
        print(f'{name}: {len(whole.vertices)} vertices, {len(whole.faces)} triangles; closed, outward normals')
    if args.preview:
        heading = {'current': '永罚系列 · 多边形减面版',
                   'angular': '永罚系列 · 已采用多边形版',
                   'angular_restored': '永罚系列 · 展开长刺还原候选（未应用）'}[args.profile]
        preview(args.preview, blades, atlas, heading)
        print(args.preview)
        if args.profile == 'angular' and output != OUT.resolve():
            comparison_path = args.preview.with_name('comparison.png')
            comparison_preview(comparison_path, blades, atlas)
            print(comparison_path)
        elif args.profile == 'angular_restored':
            comparison_path = args.preview.with_name('comparison.png')
            restoration_preview(comparison_path, read_blade(args.baseline/'damnation.obj'), blades['damnation'], atlas)
            print(comparison_path)


if __name__ == '__main__':
    main()
