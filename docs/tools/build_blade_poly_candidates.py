"""Create UV-preserving, unapplied SlashBlade polygonal reduction candidates.

Requires numpy, Pillow and pymeshlab. Cached PyMeshLab is read from .cache/modeling-python.
All exported assets stay in the explicitly supplied review directory, never live game paths.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import math
import shutil
import sys
import tempfile
import zlib
from dataclasses import dataclass
from pathlib import Path
from zipfile import ZipFile

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '.cache/modeling-python'))
import pymeshlab as ml


@dataclass
class Mesh:
    vertices: np.ndarray
    faces: np.ndarray
    uv: np.ndarray

    def points(self):
        return self.vertices[self.faces]


def parse_obj(data):
    vertices, coords, groups = [], [], {}
    group = None
    for line in data.decode('utf-8-sig', errors='replace').splitlines():
        tokens = line.split('#', 1)[0].split()
        if not tokens:
            continue
        if tokens[0] == 'v':
            vertices.append([float(v) for v in tokens[1:4]])
        elif tokens[0] == 'vt':
            coords.append([float(v) for v in tokens[1:3]])
        elif tokens[0] in ('g', 'o'):
            group = ' '.join(tokens[1:])
            groups.setdefault(group, [])
        elif tokens[0] == 'f' and group is not None:
            corners = []
            for token in tokens[1:]:
                parts = token.split('/')
                if len(parts) < 2 or not parts[1]:
                    raise ValueError(f'Missing UV in {group}')
                vi, ti = int(parts[0]), int(parts[1])
                corners.append((vi - 1 if vi > 0 else len(vertices) + vi,
                                ti - 1 if ti > 0 else len(coords) + ti))
            for i in range(1, len(corners) - 1):
                groups[group].append([corners[0], corners[i], corners[i + 1]])
    vertices, coords = np.asarray(vertices, float), np.asarray(coords, float)
    result = {}
    for name, tris in groups.items():
        if not tris:
            result[name] = Mesh(np.empty((0, 3)), np.empty((0, 3), np.int32), np.empty((0, 3, 2)))
            continue
        indices = np.asarray(tris, np.int32)
        used, inverse = np.unique(indices[:, :, 0], return_inverse=True)
        result[name] = Mesh(vertices[used], inverse.reshape(-1, 3).astype(np.int32), coords[indices[:, :, 1]])
    return result


def export_obj(path, groups, material=False):
    lines = ['# Polygonal reduction review candidate; not installed.', 's off']
    if material:
        lines.extend(['mtllib mesh.mtl', 'usemtl surface'])
    vo = to = no = 0
    for name, mesh in groups.items():
        lines.append('g ' + name)
        if not len(mesh.faces):
            continue
        for vertex in mesh.vertices:
            lines.append('v ' + ' '.join(f'{value:.9f}' for value in vertex))
        for coord in mesh.uv.reshape(-1, 2):
            lines.append('vt ' + ' '.join(f'{value:.9f}' for value in coord))
        pts = mesh.points()
        normals = np.cross(pts[:, 1] - pts[:, 0], pts[:, 2] - pts[:, 0])
        lengths = np.linalg.norm(normals, axis=1)
        normals /= np.maximum(lengths[:, None], 1e-20)
        for normal in normals:
            lines.append('vn ' + ' '.join(f'{value:.9f}' for value in normal))
        for i, tri in enumerate(mesh.faces):
            lines.append('f ' + ' '.join(f'{int(v) + vo + 1}/{to + i * 3 + j + 1}/{no + i + 1}'
                                         for j, v in enumerate(tri)))
        vo += len(mesh.vertices)
        to += len(mesh.faces) * 3
        no += len(mesh.faces)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def reduce_group(mesh, target, work):
    if target >= len(mesh.faces) or len(mesh.faces) < 800:
        return mesh
    paired = separate_back_faces(mesh, target, work)
    return paired if paired is not None else decimate_sheet(mesh, target, work)


def separate_back_faces(mesh, target, work):
    # Double-sided exports are non-manifold: simplify one sheet and restore its
    # exact reverse. Keep faces whose front/back UV differs completely untouched.
    order = np.argsort(mesh.faces, axis=1)
    keys = np.take_along_axis(mesh.faces, order, axis=1)
    ordered_uv = np.take_along_axis(mesh.uv, order[:, :, None], axis=1)
    _, inverse, counts = np.unique(keys, axis=0, return_inverse=True, return_counts=True)
    representatives, fixed = [], []
    if (counts > 1).sum() > len(counts) * .75:
        for i in range(len(counts)):
            ids = np.flatnonzero(inverse == i)
            # Both windings must exist; same-facing overlays are not a back face.
            permutations = order[ids]
            parity = ((permutations[:, 0] > permutations[:, 1]).astype(int)
                      + (permutations[:, 0] > permutations[:, 2])
                      + (permutations[:, 1] > permutations[:, 2])) % 2
            if (len(ids) > 1 and len(np.unique(parity)) == 2
                    and np.max(np.abs(ordered_uv[ids] - ordered_uv[ids[0]])) < 1e-5):
                representatives.append(ids[0])
            else:
                fixed.extend(ids)
        if len(representatives) * 2 > len(mesh.faces) * .75:
            sheet = Mesh(mesh.vertices, mesh.faces[representatives], mesh.uv[representatives])
            reduced = decimate_sheet(sheet, max(1, (target - len(fixed)) // 2), work)
            back = Mesh(reduced.vertices, reduced.faces[:, ::-1], reduced.uv[:, ::-1])
            untouched = Mesh(mesh.vertices, mesh.faces[fixed], mesh.uv[fixed])
            return concatenate({'front': reduced, 'back': back, 'fixed': untouched}, ('front', 'back', 'fixed'))
    return None


def decimate_sheet(mesh, target, work):
    """Budget disconnected ornaments separately so coils cannot starve the body."""
    positions, inverse = np.unique(mesh.vertices, axis=0, return_inverse=True)
    faces = inverse[mesh.faces]
    edges = np.concatenate((faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]))
    adjacency = coo_matrix((np.ones(len(edges)), (edges[:, 0], edges[:, 1])),
                           shape=(len(positions), len(positions)))
    _, labels = connected_components(adjacency, directed=False)
    face_labels = labels[faces[:, 0]]
    pieces = [np.flatnonzero(face_labels == label) for label in np.unique(face_labels)]
    sizes = np.asarray([len(ids) for ids in pieces])
    base = np.where(sizes < 48, sizes, 16)
    if base.sum() >= target:
        base = np.minimum(sizes, 3)
    weights = sizes - base
    raw = weights / max(weights.sum(), 1) * (target - base.sum())
    budgets = base + np.floor(raw).astype(int)
    for i in np.argsort(-(raw - np.floor(raw)))[:target - budgets.sum()]:
        budgets[i] += 1
    parts = {}
    for i, ids in enumerate(pieces):
        part = Mesh(mesh.vertices, mesh.faces[ids], mesh.uv[ids])
        parts[str(i)] = part if len(ids) <= budgets[i] else decimate_component(part, int(budgets[i]), work)
    return concatenate(parts, list(parts))


def transfer_uv(source, result):
    """Project onto the original component, with face-normal tie breaking at seams."""
    triangles = source.points()
    centers = triangles.mean(1)
    normals = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
    normals /= np.maximum(np.linalg.norm(normals, axis=1)[:, None], 1e-20)
    points = result.points()
    face_normals = np.cross(points[:, 1] - points[:, 0], points[:, 2] - points[:, 0])
    face_normals /= np.maximum(np.linalg.norm(face_normals, axis=1)[:, None], 1e-20)
    query = points.reshape(-1, 3)
    k = min(32, len(triangles))
    _, nearby = cKDTree(centers).query(query, k=k)
    if k == 1:
        nearby = nearby[:, None]
    t = triangles[nearby]
    a, ab, ac = t[:, :, 0], t[:, :, 1] - t[:, :, 0], t[:, :, 2] - t[:, :, 0]
    delta = query[:, None] - a
    d00, d01, d11 = (ab * ab).sum(-1), (ab * ac).sum(-1), (ac * ac).sum(-1)
    d20, d21 = (delta * ab).sum(-1), (delta * ac).sum(-1)
    determinant = np.maximum(d00 * d11 - d01 * d01, 1e-30)
    v, w = (d11 * d20 - d01 * d21) / determinant, (d00 * d21 - d01 * d20) / determinant
    weights = np.stack((1 - v - w, v, w), axis=-1)
    inside = weights.min(-1) >= 0
    projected = (t * weights[:, :, :, None]).sum(2)
    distances = ((query[:, None] - projected) ** 2).sum(-1)
    distances[~inside] = np.inf
    for first, second in ((0, 1), (1, 2), (2, 0)):
        edge = t[:, :, second] - t[:, :, first]
        u = np.clip(((query[:, None] - t[:, :, first]) * edge).sum(-1)
                    / np.maximum((edge * edge).sum(-1), 1e-30), 0, 1)
        foot = t[:, :, first] + u[:, :, None] * edge
        distance = ((query[:, None] - foot) ** 2).sum(-1)
        closer = distance < distances
        alternative = np.zeros_like(weights)
        alternative[:, :, first], alternative[:, :, second] = 1 - u, u
        weights[closer], distances[closer] = alternative[closer], distance[closer]
    extent = max(np.ptp(source.vertices, axis=0).max(), 1e-10)
    agreement = (normals[nearby] * np.repeat(face_normals, 3, axis=0)[:, None]).sum(-1)
    scores = distances + np.maximum(0, 1 - agreement) * extent ** 2 * 1e-8
    chosen = scores.argmin(1)
    uv = (source.uv[nearby[np.arange(len(query)), chosen]]
          * weights[np.arange(len(query)), chosen, :, None]).sum(1)
    return uv.reshape(-1, 3, 2)


def decimate_component(mesh, target, work):
    paired = separate_back_faces(mesh, target, work)
    if paired is not None:
        return paired
    export_obj(work / 'mesh.obj', {'part': mesh}, material=True)
    result = None
    for textured, boundary, quality in ((True, True, .1), (True, True, .01),
                                       (False, True, .1), (False, False, .05)):
        ms = ml.MeshSet()
        ms.load_new_mesh(str(work / 'mesh.obj'))
        ms.apply_filter('meshing_remove_duplicate_vertices')
        ms.apply_filter('meshing_remove_unreferenced_vertices')
        parameters = dict(targetfacenum=target, preserveboundary=boundary, boundaryweight=10.0,
                          preservenormal=True, planarquadric=True, qualitythr=quality,
                          optimalplacement=True)
        if textured:
            parameters['extratcoordw'] = 1.0
        ms.apply_filter('meshing_decimation_quadric_edge_collapse_with_texture' if textured
                        else 'meshing_decimation_quadric_edge_collapse', **parameters)
        ms.apply_filter('meshing_remove_unreferenced_vertices')
        m = ms.current_mesh()
        candidate = Mesh(m.vertex_matrix().copy(), m.face_matrix().copy(),
                         m.wedge_tex_coord_matrix().copy().reshape(-1, 3, 2))
        used = mesh.vertices[mesh.faces].reshape(-1, 3)
        candidate.vertices = np.clip(candidate.vertices, used.min(0), used.max(0))
        if not textured:
            candidate.uv = transfer_uv(mesh, candidate)
        if result is None or abs(len(candidate.faces) - target) < abs(len(result.faces) - target):
            result = candidate
        if len(result.faces) <= target + 1:
            break
    if not np.isfinite(result.vertices).all() or not np.isfinite(result.uv).all():
        raise ValueError('Non-finite geometry or UV coordinates')
    return result


def group_budgets(groups, target):
    normal = {k: len(v.faces) for k, v in groups.items() if k in ('blade', 'sheath')}
    original = sum(normal.values())
    fixed = sum(n for n in normal.values() if n < 800)
    mutable = [(k, n) for k, n in normal.items() if n >= 800]
    available, total_mutable = target - fixed, sum(n for _, n in mutable)
    budgets = {}
    allocated = 0
    for i, (name, count) in enumerate(mutable):
        n = round(available * count / total_mutable) if i < len(mutable) - 1 else available - allocated
        budgets[name] = n
        allocated += n
    for name, mesh in groups.items():
        count = len(mesh.faces)
        if name not in budgets:
            budgets[name] = count if count < 800 else min(target, round(count * target / original))
    return budgets


def read_source(label):
    if '!/' in label:
        jar, name = label.split('!/', 1)
        with ZipFile(ROOT / jar) as z:
            return z.read(name)
    return (ROOT / label).read_bytes()


def concatenate(groups, names):
    vertices, faces, uv, offset = [], [], [], 0
    for name in names:
        mesh = groups.get(name)
        if mesh is None or not len(mesh.faces):
            continue
        vertices.append(mesh.vertices)
        faces.append(mesh.faces + offset)
        uv.append(mesh.uv)
        offset += len(mesh.vertices)
    if not vertices:
        return Mesh(np.empty((0, 3)), np.empty((0, 3), np.int32), np.empty((0, 3, 2)))
    return Mesh(np.concatenate(vertices), np.concatenate(faces), np.concatenate(uv))


def font(size, bold=False):
    for name in ('msyhbd.ttc' if bold else 'msyh.ttc', 'simhei.ttf', 'segoeui.ttf'):
        path = Path('C:/Windows/Fonts') / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def render(mesh, texture, size, camera, bounds, clay=False):
    width, height = size
    eye = np.asarray(camera, float)
    eye /= np.linalg.norm(eye)
    right = np.cross((0, 1, 0), eye)
    right /= np.linalg.norm(right)
    up = np.cross(eye, right)
    transform = np.column_stack((right, up, eye))
    reference = bounds @ transform
    span = np.ptp(reference[:, :2], axis=0)
    if span[1] > span[0] * 1.5:
        transform = np.column_stack((up, -right, eye))
    projected = mesh.vertices @ transform
    reference = bounds @ transform
    low, high = reference[:, :2].min(0), reference[:, :2].max(0)
    scale = min((width - 60) / max(high[0] - low[0], 1), (height - 36) / max(high[1] - low[1], 1))
    projected[:, :2] = (projected[:, :2] - (low + high) / 2) * (scale, -scale) + (width / 2, height / 2)
    pixels = np.zeros((height, width, 4), np.uint8)
    depth = np.full((height, width), -np.inf)
    tex = np.asarray(texture.convert('RGBA'))
    light = np.asarray((-.3, .5, .9), float)
    light /= np.linalg.norm(light)
    for i, tri in enumerate(mesh.faces):
        p = projected[tri]
        world = mesh.vertices[tri]
        normal = np.cross(world[1] - world[0], world[2] - world[0])
        norm = np.linalg.norm(normal)
        if norm < 1e-14 or normal @ eye <= 0:
            continue
        lo = np.maximum(np.floor(p[:, :2].min(0)).astype(int), (0, 0))
        hi = np.minimum(np.ceil(p[:, :2].max(0)).astype(int), (width - 1, height - 1))
        if (lo > hi).any():
            continue
        x0, y0 = lo; x1, y1 = hi
        xx, yy = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
        denominator = (p[1, 1] - p[2, 1]) * (p[0, 0] - p[2, 0]) + (p[2, 0] - p[1, 0]) * (p[0, 1] - p[2, 1])
        if abs(denominator) < 1e-12:
            continue
        a = ((p[1, 1] - p[2, 1]) * (xx - p[2, 0]) + (p[2, 0] - p[1, 0]) * (yy - p[2, 1])) / denominator
        b = ((p[2, 1] - p[0, 1]) * (xx - p[2, 0]) + (p[0, 0] - p[2, 0]) * (yy - p[2, 1])) / denominator
        weights = np.stack((a, b, 1 - a - b), axis=-1)
        region = depth[y0:y1 + 1, x0:x1 + 1]
        z = weights @ p[:, 2]
        mask = (weights.min(-1) >= -1e-7) & (z > region + 1e-6)
        if not mask.any():
            continue
        if clay:
            sampled = np.empty(mask.shape + (4,), np.uint8)
            sampled[:] = (180, 191, 208, 255)
        else:
            uv = weights @ mesh.uv[i]
            tx = np.clip(uv[:, :, 0] * tex.shape[1], 0, tex.shape[1] - 1).astype(int)
            ty = np.clip((1 - uv[:, :, 1]) * tex.shape[0], 0, tex.shape[0] - 1).astype(int)
            sampled = tex[ty, tx].copy()
            mask &= sampled[:, :, 3] > 16
        brightness = .60 + .40 * max(0, float(normal @ light / norm))
        sampled[:, :, :3] = np.clip(sampled[:, :, :3] * brightness, 0, 255).astype(np.uint8)
        pixels[y0:y1 + 1, x0:x1 + 1][mask] = sampled[mask]
        region[mask] = z[mask]
    return Image.fromarray(pixels)


def preview_clay_reason(mesh, texture):
    tex = np.asarray(texture.convert('RGBA'))
    uv = mesh.uv.reshape(-1, 2)
    tx = np.clip(uv[:, 0] * tex.shape[1], 0, tex.shape[1] - 1).astype(int)
    ty = np.clip((1 - uv[:, 1]) * tex.shape[0], 0, tex.shape[0] - 1).astype(int)
    samples = tex[ty, tx]
    if samples[:, 3].max() < 17:
        return '原贴图接近透明，默认以灰模展示'
    if np.median(samples[:, :3].mean(1)) < 18:
        return '原贴图采样区域偏暗，默认以灰模展示'
    return ''


def make_preview(path, title, original, candidate, texture):
    a = concatenate(original, ('blade', 'sheath'))
    b = concatenate(candidate, ('blade', 'sheath'))
    bounds = a.vertices
    clay_reason = preview_clay_reason(a, texture)
    canvas = Image.new('RGBA', (1680, 1080), '#10151e')
    draw = ImageDraw.Draw(canvas)
    draw.text((38, 24), title, font=font(28, True), fill='#e7eaf0')
    draw.text((38, 65), '多面体化候选 · 未接入游戏 · 同一视角 / 同一比例'
              + (' · ' + clay_reason if clay_reason else ' / 同一原贴图'), font=font(17), fill='#94a3b8')
    draw.text((70, 109), f'原版  {len(a.faces):,} 三角面', font=font(22, True), fill='#a5b4c8')
    draw.text((905, 109), f'候选  {len(b.faces):,} 三角面', font=font(22, True), fill='#83ddbd')
    for row, (label, camera, clay) in enumerate((('斜视贴图', (.10, .22, 1), False),
                                                 ('背面贴图', (-.15, .15, -1), False),
                                                 ('灰模几何', (.22, .30, 1), True))):
        y = 158 + row * 296
        if clay_reason:
            label, clay = label.replace('贴图', '灰模'), True
        draw.text((38, y), label, font=font(17), fill='#71839e')
        for col, mesh in enumerate((a, b)):
            x = 32 + col * 838
            draw.rounded_rectangle((x, y + 28, x + 810, y + 278), 12, fill='#1a2230')
            image = render(mesh, texture, (810, 250), camera, bounds, clay)
            canvas.alpha_composite(image, (x, y + 28))
    canvas.convert('RGB').save(path)


def packed_mesh(mesh):
    if not len(mesh.faces):
        return {'data': '', 'triangles': 0}
    points = mesh.points()
    normals = np.cross(points[:, 1] - points[:, 0], points[:, 2] - points[:, 0])
    normals /= np.maximum(np.linalg.norm(normals, axis=1)[:, None], 1e-20)
    values = np.concatenate((points, np.repeat(normals[:, None, :], 3, axis=1), mesh.uv), axis=2).astype('<f4')
    return {'data': base64.b64encode(zlib.compress(values.tobytes(), 9)).decode('ascii'), 'triangles': len(mesh.faces)}


def build():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--target', type=int, default=5000)
    args = parser.parse_args()
    output = args.output.resolve()
    for folder in ('mods', 'kubejs', 'resourcepacks'):
        if output.is_relative_to(ROOT / folder):
            raise ValueError('Refusing to write candidate assets into a live game folder')
    if output.exists() and any(output.iterdir()):
        raise ValueError('Use a new empty review directory to preserve previous candidates')
    output.mkdir(parents=True, exist_ok=True)
    audit = json.loads((ROOT / 'docs/model-audit/audit.json').read_text(encoding='utf-8'))
    selected = [m for m in audit['models'] if m['blade_count'] and m['normal_triangles'] > args.target]
    textures = {t['resource']: t for t in audit['textures']}
    manifest = {'applied': False, 'target_normal_triangles': args.target, 'models': []}
    review = []
    work_parent = (ROOT / '.codex-tmp').resolve()
    work_parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='blade-poly-', dir=work_parent) as temporary:
        work = Path(temporary).resolve()
        assert work.is_relative_to(work_parent)
        for number, model in enumerate(selected, 1):
            key = model['resource']
            slug = f'{number:02d}-' + key.split(':')[0] + '-' + Path(key).stem
            data = read_source(model['source'])
            original = parse_obj(data)
            texture_set = []
            for texture_id in model['texture_ids']:
                data_tex = read_source(textures[texture_id]['source'])
                relative = 'assets/' + texture_id.replace(':', '/', 1)
                path = output / 'original' / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data_tex)
                target_tex = output / 'candidate' / relative
                target_tex.parent.mkdir(parents=True, exist_ok=True)
                target_tex.write_bytes(data_tex)
                texture_set.append({'resource': texture_id,
                                    'image': base64.b64encode(data_tex).decode('ascii'),
                                    'sha256': hashlib.sha256(data_tex).hexdigest(),
                                    'size': textures[texture_id]['size']})
            first_texture = read_source(textures[model['texture_ids'][0]]['source'])
            (work / 'texture.png').write_bytes(first_texture)
            (work / 'mesh.mtl').write_text('newmtl surface\nmap_Kd texture.png\n', encoding='utf-8')
            budgets = group_budgets(original, args.target)
            candidate = {}
            for name, mesh in original.items():
                candidate[name] = reduce_group(mesh, budgets[name], work)
                print(f'{number}/{len(selected)} {key} [{name}] {len(mesh.faces)} -> {len(candidate[name].faces)}', flush=True)
            normal_before = sum(len(original[k].faces) for k in ('blade', 'sheath') if k in original)
            normal_after = sum(len(candidate[k].faces) for k in ('blade', 'sheath') if k in candidate)
            if not args.target * .96 <= normal_after <= args.target * 1.03:
                raise ValueError(f'Normal mesh missed target: {key}, {normal_after}')
            relative = 'assets/' + key.replace(':', '/', 1)
            original_path, candidate_path = output / 'original' / relative, output / 'candidate' / relative
            original_path.parent.mkdir(parents=True, exist_ok=True)
            original_path.write_bytes(data)
            export_obj(candidate_path, candidate)
            reparsed = parse_obj(candidate_path.read_bytes())
            assert list(reparsed) == list(original), 'OBJ group names changed'
            assert all(len(reparsed[k].faces) == len(v.faces) for k, v in candidate.items())
            for texture in texture_set:
                relative_texture = 'assets/' + texture['resource'].replace(':', '/', 1)
                assert hashlib.sha256((output / 'candidate' / relative_texture).read_bytes()).hexdigest() == texture['sha256']
            stats = {'resource': key, 'names': model['blade_names'], 'normal_before': normal_before,
                     'normal_after': normal_after, 'total_before': sum(len(v.faces) for v in original.values()),
                     'total_after': sum(len(v.faces) for v in candidate.values()),
                     'groups': {name: {'before': len(original[name].faces), 'after': len(m.faces)} for name, m in candidate.items()},
                     'original_source': model['source'], 'source_sha256': hashlib.sha256(data).hexdigest(),
                     'original_path': str(original_path), 'candidate_path': str(candidate_path),
                     'preview': slug + '.png', 'textures': [{k: v for k, v in t.items() if k != 'image'} for t in texture_set]}
            manifest['models'].append(stats)
            (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
            make_preview(output / stats['preview'], ' / '.join(model['blade_names']), original, candidate,
                         Image.open(io.BytesIO(first_texture)))
            modes = {}
            for mode, names in {'normal': ('blade', 'sheath'), 'blade': ('blade',), 'sheath': ('sheath',),
                                'inventory': ('item_blade',)}.items():
                original_mesh, candidate_mesh = concatenate(original, names), concatenate(candidate, names)
                if not len(original_mesh.faces):
                    continue
                points = original_mesh.vertices
                modes[mode] = {'original': packed_mesh(original_mesh), 'candidate': packed_mesh(candidate_mesh),
                               'low': points.min(0).tolist(), 'high': points.max(0).tolist()}
            reason = preview_clay_reason(concatenate(original, ('blade', 'sheath')), Image.open(io.BytesIO(first_texture)))
            review.append({'name': ' / '.join(model['blade_names']), 'textures': texture_set,
                           'modes': modes, 'defaultClay': bool(reason), 'note': reason})
            print(f'PREVIEW {stats["preview"]}: {normal_before} -> {normal_after}', flush=True)
    for model in manifest['models']:
        assert hashlib.sha256(read_source(model['original_source'])).hexdigest() == model['source_sha256']
    template = (ROOT / 'docs/tools/blade_poly_review.html').read_text(encoding='utf-8')
    (output / 'review.html').write_text(template.replace('/*__MODEL_DATA__*/[]',
                                                       json.dumps(review, ensure_ascii=False, separators=(',', ':'))), encoding='utf-8')
    thumbs = Image.new('RGB', (1680, len(manifest['models']) * 400 + 100), '#10151e')
    draw = ImageDraw.Draw(thumbs)
    draw.text((38, 25), '约 5k 多面体化候选 · 未接入游戏', font=font(30, True), fill='#e6edf3')
    for i, model in enumerate(manifest['models']):
        image = Image.open(output / model['preview'])
        # A source render crop keeps comparison text and the first textured view together.
        crop = image.crop((0, 0, 1680, 440))
        crop.thumbnail((1680, 400))
        thumbs.paste(crop, (0, 100 + i * 400))
    thumbs.save(output / 'overview.png')
    table = ['# 约 5k 拔刀剑多面体化候选（未接入）', '',
             '面数口径为正常刀身 blade＋刀鞘 sheath 的三角面数。文件中仍保留物品栏、破损与特效分组，因此文件总面数会高于 5k。',
             '原贴图逐字节保留；按连通装饰分配面数，优先使用保留纹理的减面。纹理接缝阻碍减面时，将 UV 投射回原曲面，并以逐面法线呈现棱面。', '',
             '| 刀 | 原版常态 | 候选常态 | 原版文件总计 | 候选文件总计 |', '|---|---:|---:|---:|---:|']
    for model in manifest['models']:
        table.append(f'| {" / ".join(model["names"])} | {model["normal_before"]:,} | {model["normal_after"]:,} | {model["total_before"]:,} | {model["total_after"]:,} |')
    table.extend(['', '打开 review.html 可并排旋转、缩放并切换刀身／刀鞘／物品栏及线框视图。',
                  '本预览不模拟 Minecraft 动画、附魔光效、运行时发光层和光影。',
                  '隐月·刃的原贴图接近透明，光剑的原贴图采样区域偏暗；为看清轮廓，预览默认灰模，可在交互页取消灰模。',
                  'original/ 为原始资源，candidate/ 为候选资源；两者均位于独立审阅目录。'])
    (output / 'README.md').write_text('\n'.join(table) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(output), 'models': len(manifest['models']), 'applied': False}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    build()
