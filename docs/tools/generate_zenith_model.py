"""Build the shared Terraria Zenith-inspired SlashBlade model from scratch.

Run with Python, numpy and Pillow. The four S5 variants use one mesh and four
opaque atlases; no extra renderer, shader or animation is required. Negative X is
the blade tip, with the grip centered at the native SlashBlade hand pivot.
"""
from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from generate_damnation_models import Mesh, render as render_mesh
from zenith_variant_textures import VARIANTS, texture_variant

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'kubejs/assets/sdbf/model/zenith'
TILES = {
    'jade': (64, 0), 'gold': (96, 0),
    'ruby': (64, 32), 'grip': (96, 32),
    'blue': (64, 64), 'silver': (96, 64),
    'broken': (64, 96), 'wrap': (96, 96),
}


def icon(mesh):
    """Match Terra Blade's actual item_bladens pose, measured from SJAP's OBJ.

    Its blade-to-item UV correspondences yield a 129.385 degree rotation.
    Fit within its occupied XY bounds and its positive-depth sword layer;
    both intact and damaged icons use the same native inventory convention.
    This transform is baked into item groups, never applied to held geometry.
    """
    angle = math.radians(129.383761582)
    rotation = np.array([[math.cos(angle), -math.sin(angle), 0],
                         [math.sin(angle), math.cos(angle), 0], [0, 0, 1]])
    points = np.asarray(mesh.vertices)
    rotated = points @ rotation.T
    low, high = rotated.min(axis=0), rotated.max(axis=0)
    scale = min(149.238602 / (high[0] - low[0]),
                133.6534 / (high[1] - low[1]))
    center = (low + high) / 2
    depth_scale = 2.0 / max(abs(low[2] - center[2]), abs(high[2] - center[2]))
    transform_scale = np.array((scale, scale, depth_scale))
    offset = np.array((-13.165802, 8.0977, 15.42695))
    result = Mesh()
    result.add(mesh, lambda p: ((rotation @ p) - center) * transform_scale + offset)
    result.validate()
    return result


def render(image, mesh, atlas, box, camera=(.15, .25, 1), inventory=False, frame=None):
    if inventory:
        # Match the common item's GUI scale (0.65); render_mesh's base frame
        # already corresponds to SlashBlade's native 0.008 icon scale.
        scaled = Mesh()
        scaled.add(mesh, lambda p: p * .65)
        mesh = scaled
    return render_mesh(image, mesh, atlas, box, camera, inventory, frame)


def uv_tile(material, u, v):
    x, y = TILES[material]
    return ((x + 2 + u * 27) / 128, 1 - (y + 2 + v * 27) / 128)


def orient(mesh):
    volume = sum(np.dot(a, np.cross(b, c)) / 6 for a, b, c in
                 (np.asarray([mesh.vertices[i] for i in f]) for f in mesh.faces))
    if volume < 0:
        mesh.faces = [tuple(reversed(f)) for f in mesh.faces]
        mesh.uvs = [tuple(reversed(t)) for t in mesh.uvs]
    mesh.validate()
    return mesh


def sections(rings, material, blade_uv=False):
    """Eight-sided beveled metal cross-section, shared vertices and closed caps."""
    mesh = Mesh()
    uv = []
    for x, width, thick in rings:
        profile = [(-1, 0), (-.68, -1), (0, -1.17), (.68, -1),
                   (1, 0), (.68, 1), (0, 1.17), (-.68, 1)]
        for y, z in profile:
            mesh.vertices.append((x, y * width, z * thick))
            if blade_uv:
                # Same hand-painted surface on both sides; no mirrored writing.
                uv.append(((3 + (y + 1) * 28.5) / 128,
                           1 - (4 + (-x - 28) / 240 * 119) / 128))
            else:
                uv.append(uv_tile(material, (y + 1) / 2,
                                  (x - rings[0][0]) / (rings[-1][0] - rings[0][0])))
    for ring in range(len(rings) - 1):
        for j in range(8):
            a, b = ring * 8 + j, ring * 8 + (j + 1) % 8
            c, d = b + 8, a + 8
            for ids in ((a, b, c), (a, c, d)):
                mesh.triangle(ids, [uv[i] for i in ids])
    for ring in (0, len(rings) - 1):
        ids = list(range(ring * 8, ring * 8 + 8))
        if ring == 0:
            ids.reverse()
        for j in range(1, 7):
            face = (ids[0], ids[j], ids[j + 1])
            mesh.triangle(face, [uv_tile('broken' if blade_uv else material, .5, .5)] * 3)
    return orient(mesh)


def triangulate(poly):
    """Ear clipping for the angular, concave guard silhouettes (CCW)."""
    points = np.asarray(poly)
    cross = lambda a, b, c: float((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
    ids, tris = list(range(len(poly))), []
    while len(ids) > 3:
        for j, b in enumerate(ids):
            a, c = ids[j - 1], ids[(j + 1) % len(ids)]
            if cross(points[a], points[b], points[c]) <= 1e-8:
                continue
            if any(all(t >= -1e-8 for t in (
                cross(points[a], points[b], points[k]),
                cross(points[b], points[c], points[k]),
                cross(points[c], points[a], points[k])))
                for k in ids if k not in (a, b, c)):
                continue
            tris.append((a, b, c))
            ids.pop(j)
            break
        else:
            raise ValueError('Guard outline is not a simple polygon')
    return tris + [tuple(ids)]


def plate(poly, depth, material, bevel=.82, center_z=0):
    """Closed chamfered silhouette, with ear-clipped front and back faces."""
    p = np.asarray(poly, float)
    if sum(p[i, 0] * p[(i + 1) % len(p), 1] - p[i, 1] * p[(i + 1) % len(p), 0]
           for i in range(len(p))) < 0:
        p = p[::-1]
    mid = p.mean(axis=0)
    inside = mid + (p - mid) * bevel
    n, mesh = len(p), Mesh()
    low, span = p.min(axis=0), np.maximum(np.ptp(p, axis=0), .01)
    uv = []
    for outline, z in ((inside, -depth), (p, -depth * .45),
                       (p, depth * .45), (inside, depth)):
        for xy in outline:
            mesh.vertices.append((*xy, z + center_z))
            uv.append(uv_tile(material, *((xy - low) / span)))
    for ring in range(3):
        for j in range(n):
            a, b = ring * n + j, ring * n + (j + 1) % n
            c, d = b + n, a + n
            for ids in ((a, b, c), (a, c, d)):
                mesh.triangle(ids, [uv[i] for i in ids])
    for tri in triangulate(inside):
        back = tuple(reversed(tri))
        front = tuple(i + 3 * n for i in tri)
        mesh.triangle(back, [uv[i] for i in back])
        mesh.triangle(front, [uv[i] for i in front])
    return orient(mesh)


def make_blade(broken=False):
    mesh = Mesh()
    # The shallow waist and flared root preserve the sprite's broad silhouette.
    rings = [(-28, 12, 3.8), (-52, 28, 3.5), (-78, 21, 3),
             (-114, 18.5, 2.9)]
    rings += [(-158, 18.5, 2.9)] if broken else [
        (-223, 19, 2.9), (-246, 14, 2.5), (-268, .35, .12)]
    mesh.add(sections(rings, 'blue', True))
    # Hexagonal-looking bevels, dark indigo wrap and two compact end collars.
    mesh.add(sections([(-25, 5.2, 4.6), (-18, 4.5, 4),
                       (21, 4.5, 4), (27, 5.2, 4.6)], 'grip'))
    for x in (-24, 24):
        mesh.add(sections([(x - 1.4, 6, 4.9), (x + 1.4, 6, 4.9)], 'gold'))
    mesh.add(plate([(24, 0), (33, -10), (44, 0), (33, 10)], 4, 'jade'))
    mesh.add(plate([(29, 0), (33, -4.5), (38, 0), (33, 4.5)], 4.55, 'gold'))
    # Both quillons sweep toward the blade, leaving the hand pivot free.
    arm = [(-24, 0), (-25, 18), (-33, 33), (-44, 43), (-55, 43),
           (-47, 32), (-40, 17), (-40, 0)]
    trim = [(-27, 6), (-28, 18), (-36, 33), (-47, 41),
            (-47, 36), (-39, 29), (-32, 16), (-32, 6)]
    for sign in (-1, 1):
        mesh.add(plate([(x, y * sign) for x, y in arm], 4.3, 'jade'))
        # Inset trim has real thickness and covered rear faces, no z-fighting.
        for front in (-1, 1):
            mesh.add(plate([(x, y * sign) for x, y in trim], .45, 'gold',
                           center_z=front * 4.3))
    mesh.add(plate([(-47, 0), (-32, -13), (-17, 0), (-32, 13)], 5, 'jade'))
    mesh.add(plate([(-42, 0), (-32, -8.6), (-22, 0), (-32, 8.6)], 5.7, 'gold'))
    mesh.add(plate([(-39, 0), (-32, -6.3), (-25, 0), (-32, 6.3)], 7.6, 'ruby', .62))
    mesh.validate()
    return mesh


def texture():
    """Native 128px pixel atlas, painted directly, never downsampled artwork."""
    image = Image.new('RGBA', (128, 128), '#252039')
    draw = ImageDraw.Draw(image)
    # Blade: moon-white edge, lavender transition, deep blue checker spine.
    for y in range(128):
        for x in range(64):
            side = abs(x - 31.5)
            if side > 28:
                c = '#3c405b'
            elif side > 24:
                c = ('#a4a7dc', '#868dc8')[(y // 12) % 2]
            elif side > 19:
                c = ('#edf3dd', '#eee3f4', '#dae8f1')[(y // 16) % 3]
            elif side > 13:
                c = ('#8c83cb', '#9d9edb', '#95c3cf')[(y // 20) % 3]
            elif side > 6:
                c = ('#454497', '#5b4db0')[(y // 8 + x // 5) % 2]
            else:
                c = ('#28213d', '#4f50a4')[(y // 5 + x // 5) % 2]
            draw.point((x, y), fill=c)
    # Silver chevrons follow the etched diamond motifs of the source sprite.
    for y in (70, 92, 113):
        draw.line([(14, y - 6), (22, y - 6), (32, y + 5), (42, y - 6), (49, y - 6)],
                  fill='#d7d7ee', width=3)
        draw.line([(18, y - 4), (24, y - 4), (32, y + 4)], fill='#f3eaf5', width=2)
    palettes = {
        'jade': ('#064859', '#087b7c', '#3fac9d', '#97dccc'),
        'gold': ('#6a885c', '#c2ce64', '#e4e68a', '#fff6bc'),
        'ruby': ('#45193f', '#87285f', '#c04d99', '#f5b8e4'),
        'grip': ('#171a31', '#37337d', '#6350a8', '#9296d1'),
        'blue': ('#302d52', '#5455a0', '#9698d1', '#d5dcf0'),
        'silver': ('#707ca6', '#b6b8d5', '#e0e5ef', '#fff9ef'),
        'broken': ('#1c233d', '#3e436f', '#62668d', '#989fc1'),
        'wrap': ('#262345', '#41387c', '#7371b7', '#b0b5dd'),
    }
    for material, (ox, oy) in TILES.items():
        colors = palettes[material]
        draw.rectangle((ox, oy, ox + 31, oy + 31), fill=colors[1])
        draw.rectangle((ox + 2, oy + 2, ox + 29, oy + 6), fill=colors[2])
        draw.rectangle((ox + 2, oy + 2, ox + 5, oy + 29), fill=colors[2])
        draw.rectangle((ox + 25, oy + 7, ox + 29, oy + 29), fill=colors[0])
        draw.rectangle((ox + 6, oy + 26, ox + 29, oy + 29), fill=colors[0])
        draw.line((ox + 6, oy + 7, ox + 21, oy + 7), fill=colors[3], width=2)
        if material == 'grip':
            for y in range(-20, 50, 7):
                draw.line((ox + 3, oy + min(28, max(3, y)),
                           ox + 28, oy + min(28, max(3, y + 13))),
                          fill=colors[2], width=2)
        if material == 'ruby':
            draw.polygon([(ox + 7, oy + 7), (ox + 20, oy + 7), (ox + 7, oy + 20)],
                         fill=colors[3])
        if material == 'jade':
            draw.line([(ox + 11, oy + 12), (ox + 20, oy + 12), (ox + 20, oy + 21)],
                      fill=colors[2], width=2)
    return image


def write_obj(path, groups):
    lines = ['# Zenith-inspired original geometry; closed bevelled components.',
             '# One shared opaque 128x128 atlas. Grip pivot: 0 0 0. Tip: -X.',
             '# Empty sheath by design. All native render groups included.']
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
            lines.append('f ' + ' '.join(f'{i+vo+1}/{to+k*3+j+1}/{no+k+1}' for j, i in enumerate(ids)))
        vo += len(mesh.vertices)
        to += len(mesh.faces) * 3
        no += len(mesh.faces)
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def preview(path, blade, damaged, atlas):
    image = Image.new('RGB', (1440, 1000), '#101725')
    draw = ImageDraw.Draw(image)
    title = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 32)
    label = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 20)
    small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 17)
    draw.text((40, 24), '天顶 · 共用模型', font=title, fill='#e9f4ed')
    draw.text((40, 73), '黑冠 / 神威 / 王权 / 暗咒    ·    离线模型预览', font=label, fill='#95b9c9')
    views = [('正面', (0, 0, 1)), ('背面', (0, 0, -1)),
             ('斜侧面', (.12, .72, 1)), ('厚度', (0, 1, .13))]
    for index, (name, camera) in enumerate(views):
        x = 30 + index * 285
        draw.rounded_rectangle((x, 120, x + 270, 820), 12, fill='#1a2536')
        render(image, blade, atlas, (x + 12, 150, x + 258, 760), camera)
        draw.text((x + 90, 778), name, font=label, fill='#b9cbd9')
    draw.rounded_rectangle((1180, 120, 1410, 820), 12, fill='#1a2536')
    render(image, icon(blade), atlas, (1190, 144, 1400, 354), (0, 0, 1), True)
    draw.text((1210, 365), '物品栏姿势', font=label, fill='#b9cbd9')
    slot = Image.new('RGB', (16, 16), '#8b8b8b')
    render(slot, icon(blade), atlas, (0, 0, 16, 16), (0, 0, 1), True)
    image.paste(slot.resize((128, 128), Image.Resampling.NEAREST), (1230, 413))
    draw.text((1212, 557), '16px 图标放大', font=small, fill='#95b9c9')
    render(image, icon(damaged), atlas, (1200, 607, 1390, 797), (0, 0, 1), True)
    draw.text((40, 856), f'剑身 {len(blade.faces)} 三角面 · 共用 128×128 像素贴图 · 无剑鞘', font=label, fill='#d1dedf')
    draw.text((40, 901), '封闭实体 / 手柄中心握持 / 双面宝石与护手 / 原生模型缓存', font=label, fill='#95b9c9')
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def variants_preview(path, blade, atlases):
    image = Image.new('RGB', (1480, 1020), '#101725')
    draw = ImageDraw.Draw(image)
    title = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 32)
    label = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 24)
    small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 17)
    draw.text((36, 22), '天顶 · 四分支专属贴图', font=title, fill='#e9f4ed')
    draw.text((36, 72), '共用 724 面模型 / 每张 128×128 / 原生不透明材质 / 离线模型预览',
              font=small, fill='#9bb7c9')
    item = icon(blade)
    for index, (key, theme) in enumerate(VARIANTS.items()):
        x = 20 + index * 370
        atlas = atlases[key]
        draw.rounded_rectangle((x, 115, x + 350, 993), 12, fill='#1a2536')
        draw.text((x + 22, 132), theme['name'], font=label, fill=theme['accent'])
        draw.text((x + 22, 175), theme['detail'], font=small, fill='#a9c0ce')
        render(image, blade, atlas, (x + 32, 211, x + 318, 755), (.06, .22, 1))
        render(image, item, atlas, (x + 15, 779, x + 214, 978), (0, 0, 1), True)
        slot = Image.new('RGB', (16, 16), '#8b8b8b')
        render(slot, item, atlas, (0, 0, 16, 16), (0, 0, 1), True)
        image.paste(slot.resize((96, 96), Image.Resampling.NEAREST), (x + 231, 821))
        draw.text((x + 226, 932), '16px 图标', font=small, fill='#9bb7c9')
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--preview', type=Path)
    parser.add_argument('--textures-only', action='store_true', help='Keep installed geometry byte-for-byte.')
    args = parser.parse_args()
    blade, damaged = make_blade(), make_blade(True)
    atlas = texture()
    groups = {'blade': blade, 'blade_damaged': damaged, 'sheath': Mesh(),
              'item_blade': icon(blade), 'item_bladens': icon(blade),
              'item_damaged': icon(damaged)}
    OUT.mkdir(parents=True, exist_ok=True)
    if not args.textures_only:
        write_obj(OUT / 'zenith.obj', groups)
        atlas.save(OUT / 'zenith.png')
    atlases = {key: texture_variant(key, TILES) for key in VARIANTS}
    for key, variant_atlas in atlases.items():
        variant_atlas.save(OUT / ('zenith_' + key + '.png'))
    if args.preview:
        variants_preview(args.preview, blade, atlases)
    print({name: len(mesh.faces) for name, mesh in groups.items()})


if __name__ == '__main__':
    main()
