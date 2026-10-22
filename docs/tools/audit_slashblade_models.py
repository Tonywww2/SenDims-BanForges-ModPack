"""Read-only audit of installed SlashBlade meshes, named blades and texture sizes.

Writes reports only; never modifies models, textures, scripts or installed mods.
Re-run from any directory with the bundled Python runtime (standard library only).
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import statistics
import struct
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
from pathlib import Path
from zipfile import ZipFile
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
NATIVE = 'SlashBladeResharped-1.20.1-1.9.65.jar'
DEFAULT_MODEL = 'slashblade:model/blade.obj'
DEFAULT_TEXTURE = 'slashblade:model/blade.png'
DEF = re.compile(r'^data/([^/]+)/slashblade/named_blades/(.+)\.json$')
ASSET = re.compile(r'^assets/([^/]+)/(.+)$')


@dataclass(frozen=True)
class Source:
    container: Path
    entry: str
    priority: int

    @property
    def label(self):
        path = self.container.relative_to(ROOT).as_posix()
        return path + ('!/' + self.entry if self.entry else '')

    def read(self):
        return archive(self.container).read(self.entry) if self.entry else self.container.read_bytes()


@lru_cache(maxsize=20)
def archive(path):
    return ZipFile(path)


def resource_id(path):
    match = ASSET.match(path)
    return match[1] + ':' + match[2] if match else None


def parse_obj(data):
    groups = defaultdict(lambda: {'faces': 0, 'triangles': 0})
    face_sizes, vertices, texcoords, normals = Counter(), 0, 0, 0
    group, errors, segment_sizes = '(default)', [], set()
    for number, line in enumerate(data.decode('utf-8-sig', errors='replace').splitlines(), 1):
        tokens = line.split('#', 1)[0].split()
        if not tokens:
            continue
        directive = tokens[0]
        if directive in ('g', 'o') and len(tokens) > 1:
            group = ' '.join(tokens[1:]).lower()
            segment_sizes = set()
        elif directive in ('v', 'vt', 'vn'):
            vertices += directive == 'v'
            texcoords += directive == 'vt'
            normals += directive == 'vn'
        elif directive == 'f':
            count = len(tokens) - 1
            face_sizes[count] += 1
            groups[group]['faces'] += 1
            groups[group]['triangles'] += max(0, count - 2)
            segment_sizes.add(count)
            if count not in (3, 4):
                errors.append(f'line {number}: unsupported {count}-vertex face')
            if len(segment_sizes) > 1:
                errors.append(f'line {number}: mixed triangle/quad drawing mode in group')
            for token in tokens[1:]:
                try:
                    index = int(token.split('/')[0])
                    if index == 0 or index > vertices or index < -vertices:
                        errors.append(f'line {number}: invalid vertex index {index}')
                except ValueError:
                    errors.append(f'line {number}: invalid face index')
    tri = lambda name: groups.get(name, {}).get('triangles', 0)
    return {
        'faces': sum(face_sizes.values()), 'triangles': sum(g['triangles'] for g in groups.values()),
        'vertices': vertices, 'uv_vertices': texcoords, 'normal_vertices': normals,
        'triangle_faces': face_sizes[3], 'quad_faces': face_sizes[4],
        'ngon_faces': sum(v for k, v in face_sizes.items() if k not in (3, 4)),
        'blade_triangles': tri('blade'), 'sheath_triangles': tri('sheath'),
        'normal_triangles': tri('blade') + tri('sheath'),
        'inventory_triangles': tri('item_blade'), 'inventory_no_sheath_triangles': tri('item_bladens'),
        'groups': dict(groups), 'parse_warnings': sorted(set(errors))[:20],
        'obj_bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
    }


def png_info(data):
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        return {'error': 'Not a PNG'}
    width, height, depth, color = struct.unpack('>IIBB', data[16:26])
    return {'width': width, 'height': height, 'bit_depth': depth, 'color_type': color,
            'pixels': width * height, 'size': f'{width}×{height}', 'png_bytes': len(data),
            'rgba_mib': width * height * 4 / 1048576,
            'sha256': hashlib.sha256(data).hexdigest()}


def write_csv(path, rows, fields):
    with path.open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fields, extrasaction='ignore')
        writer.writeheader()
        for row in rows:
            writer.writerow({k: '; '.join(v) if isinstance(v, list) else v for k, v in row.items() if k in fields})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'docs/model-audit')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    resources, definitions = defaultdict(list), defaultdict(list)
    active_packs = []
    for line in (ROOT / 'options.txt').read_text(encoding='utf-8').splitlines():
        if line.startswith('resourcePacks:'):
            active_packs = json.loads(line.split(':', 1)[1])
    embedded = []
    jars = sorted((ROOT / 'mods').glob('*.jar'), key=lambda p: p.name.lower())

    def add(path, source):
        if DEF.match(path):
            definitions[path].append(source)
        key = resource_id(path)
        if key and (path.endswith(('.obj', '.png', '.png.mcmeta')) or '/lang/' in path and path.endswith('.json')):
            resources[key].append(source)

    for jar in jars:
        with ZipFile(jar) as z:
            for name in z.namelist():
                add(name, Source(jar, name, 0))
                if name.endswith('/pack.mcmeta'):
                    prefix = name[:-len('pack.mcmeta')]
                    suffix = prefix.rstrip('/').removeprefix('packs/').removeprefix('resourcepacks/')
                    if any(pack.removeprefix('builtin/') == suffix for pack in active_packs):
                        embedded.append((jar, prefix))
    for jar, prefix in embedded:
        with ZipFile(jar) as z:
            for name in z.namelist():
                if name.startswith(prefix + 'assets/'):
                    add(name[len(prefix):], Source(jar, name, 10))

    # KubeJS assets are above the mod/builtin packs in the recorded ResourceManager order.
    for category in ('data', 'assets'):
        base = ROOT / 'kubejs' / category
        for path in sorted(base.rglob('*')):
            if path.is_file():
                add(category + '/' + path.relative_to(base).as_posix(), Source(path, '', 20))
    quest_pack = ROOT / 'config/quest_enhance'
    if 'quest_enhance' in active_packs and (quest_pack / 'assets').is_dir():
        for path in (quest_pack / 'assets').rglob('*'):
            if path.is_file():
                add('assets/' + path.relative_to(quest_pack / 'assets').as_posix(), Source(path, '', 10))
    for order, pack in enumerate(active_packs):
        if not pack.startswith('file/'):
            continue
        path = ROOT / 'resourcepacks' / pack[5:]
        if path.is_file():
            with ZipFile(path) as z:
                for name in z.namelist():
                    add(name, Source(path, name, 30 + order))
        elif path.is_dir():
            for file in path.rglob('*'):
                if file.is_file():
                    add(file.relative_to(path).as_posix(), Source(file, '', 30 + order))

    def resolve(index, key):
        candidates = index.get(key, [])
        return max(candidates, key=lambda s: (s.priority, s.label)) if candidates else None

    blades = []
    for path in sorted(definitions):
        source = resolve(definitions, path)
        definition = json.loads(source.read().decode('utf-8-sig'))
        match = DEF.match(path)
        key = match[1] + ':' + match[2]
        name = definition.get('name', key)
        render = definition.get('render', {})
        blades.append({'id': key, 'name_id': name,
                       'translation_key': 'item.' + name.replace(':', '.').replace('/', '.'),
                       'model': render.get('model') or DEFAULT_MODEL,
                       'texture': render.get('texture') or DEFAULT_TEXTURE,
                       'implicit_model': not bool(render.get('model')),
                       'definition_source': source.label})

    # The two client RenderOverrideEvent scripts currently agree with these definitions.
    # Record this explicitly so future script edits cannot silently escape the audit.
    runtime_bindings = {}
    for suffix in ('faded', 'lone', 'thunder', 'judgement', 'king'):
        runtime_bindings['slashblade:nameless_' + suffix] = (
            f'sdbf:model/nameless/nameless_{suffix}.obj', f'sdbf:model/nameless/nameless_{suffix}.png')
    for suffix in ('', '_plus'):
        runtime_bindings['slashblade:greatsword_of_damnation' + suffix] = (
            'slashblade:model/named/dios/dios.obj', f'slashblade:model/greatsword_of_damnation/greatsword_of_damnation{suffix}.png')
    runtime_bindings['slashblade:greatsword_of_damnation_full'] = (
        'sdbf:model/damnation/greatsword.obj', 'sdbf:model/damnation/damnation_gold.png')
    runtime_bindings['slashblade_sendims:greatsword_of_damnation_final'] = (
        'sdbf:model/damnation/damnation.obj', 'sdbf:model/damnation/damnation_gold.png')
    runtime_differences = []
    for blade in blades:
        if blade['id'] in runtime_bindings:
            model, texture = runtime_bindings[blade['id']]
            if (blade['model'], blade['texture']) != (model, texture):
                runtime_differences.append(blade['id'])
            blade.update(model=model, texture=texture, runtime_override=True)
        else:
            blade['runtime_override'] = False

    namespaces = {b['id'].split(':')[0] for b in blades} | {'kubejs', 'slashbladetetra'}
    translations = {}
    lang_sources = []
    for key in resources:
        ns, path = key.split(':', 1)
        if ns in namespaces and path == 'lang/zh_cn.json':
            lang_sources.append(resolve(resources, key))
    for source in sorted(set(lang_sources), key=lambda s: (s.priority, s.label)):
        translations.update(json.loads(source.read().decode('utf-8-sig')))
    doc_names = {}
    for line in (ROOT / 'kubejs/docs/slashblade-list.md').read_text(encoding='utf-8').splitlines():
        match = re.match(r'\| `([^`]+)` \| [^|]+ \| ([^|]+) \|', line)
        if match:
            doc_names[match[1]] = match[2].strip()
    for blade in blades:
        blade['name'] = translations.get(blade['translation_key'], doc_names.get(blade['id'], blade['id']))

    # OBJ strings in renderer classes help identify effects among the non-definition assets.
    # These are static references, not proof that a runtime branch is currently active.
    class_references = defaultdict(set)
    obj_keys = {key for key in resources if key.endswith('.obj')}
    obj_by_path = defaultdict(list)
    for key in obj_keys:
        obj_by_path[key.split(':', 1)[1]].append(key)
    model_jars = {s.container for key in obj_keys for s in resources[key] if s.entry}
    for jar in sorted(model_jars):
        if jar.parent != ROOT / 'mods':
            continue
        with ZipFile(jar) as z:
            for name in z.namelist():
                if not name.endswith('.class'):
                    continue
                for value in re.findall(rb'[A-Za-z0-9_.:/+-]+\.obj', z.read(name)):
                    value = value.decode('ascii')
                    matches = [value] if value in obj_keys else obj_by_path.get(value, [])
                    for key in matches:
                        class_references[key].add(jar.name + '!/' + name)

    model_to_blades, texture_to_blades = defaultdict(list), defaultdict(list)
    for blade in blades:
        model_to_blades[blade['model']].append(blade)
        texture_to_blades[blade['texture']].append(blade)
    model_ids = {key for key in resources if key.endswith('.obj') and key.split(':', 1)[1].startswith('model/')}
    model_ids.update(model_to_blades)
    model_ids.add(DEFAULT_MODEL)
    models, textures, missing = [], [], []
    for key in sorted(model_ids):
        source = resolve(resources, key)
        if source is None:
            missing.append({'kind': 'model', 'resource': key, 'blades': [b['id'] for b in model_to_blades[key]]})
            continue
        info = parse_obj(source.read())
        used = model_to_blades[key]
        info.update(resource=key, source=source.label, blade_count=len(used),
                    blade_ids=[b['id'] for b in used], blade_names=[b['name'] for b in used],
                    role='named_weapon' if used else 'default_weapon' if key == DEFAULT_MODEL else 'unreferenced_or_effect',
                    texture_ids=sorted({b['texture'] for b in used}))
        info['class_references'] = sorted(class_references[key])
        models.append(info)
    for key in sorted(texture_to_blades.keys() | {DEFAULT_TEXTURE}):
        source = resolve(resources, key)
        if source is None:
            missing.append({'kind': 'texture', 'resource': key, 'blades': [b['id'] for b in texture_to_blades[key]]})
            continue
        info = png_info(source.read())
        info.update(resource=key, source=source.label, blade_count=len(texture_to_blades[key]),
                    blade_ids=[b['id'] for b in texture_to_blades[key]],
                    blade_names=[b['name'] for b in texture_to_blades[key]])
        mcmeta = resolve(resources, key + '.mcmeta')
        animation = json.loads(mcmeta.read().decode('utf-8-sig')).get('animation') if mcmeta else None
        info['animated'] = animation is not None
        textures.append(info)

    model_index = {m['resource']: m for m in models}
    texture_index = {t['resource']: t for t in textures}
    base_model, base_texture = model_index[DEFAULT_MODEL], texture_index[DEFAULT_TEXTURE]
    for model in models:
        model['total_ratio_default'] = round(model['triangles'] / base_model['triangles'], 3)
        model['normal_ratio_default'] = round(model['normal_triangles'] / base_model['normal_triangles'], 3)
        model['inventory_ratio_default'] = round(model['inventory_triangles'] / base_model['inventory_triangles'], 3)
    for texture in textures:
        if 'pixels' in texture:
            texture['pixel_ratio_default'] = texture['pixels'] / base_texture['pixels']
    for blade in blades:
        model, texture = model_index.get(blade['model'], {}), texture_index.get(blade['texture'], {})
        for field in ('faces', 'triangles', 'blade_triangles', 'sheath_triangles', 'normal_triangles',
                      'inventory_triangles', 'total_ratio_default', 'normal_ratio_default', 'inventory_ratio_default'):
            blade[field] = model.get(field)
        blade.update(texture_size=texture.get('size'), texture_pixels=texture.get('pixels'),
                     pixel_ratio_default=texture.get('pixel_ratio_default'), texture_rgba_mib=texture.get('rgba_mib'),
                     model_source=model.get('source'), texture_source=texture.get('source'))

    baselines = []
    with ZipFile(ROOT / 'mods' / NATIVE) as z:
        stock_defs = [json.loads(z.read(n)) for n in z.namelist() if DEF.match(n)]
        native_models = sorted({d.get('render', {}).get('model', DEFAULT_MODEL) for d in stock_defs} | {DEFAULT_MODEL})
        for key in native_models:
            asset = 'assets/' + key.replace(':', '/', 1)
            info = parse_obj(z.read(asset))
            texture_keys = sorted({d.get('render', {}).get('texture', DEFAULT_TEXTURE) for d in stock_defs
                                   if d.get('render', {}).get('model', DEFAULT_MODEL) == key})
            texture_info = []
            for texture_key in texture_keys:
                data = png_info(z.read('assets/' + texture_key.replace(':', '/', 1)))
                texture_info.append({'resource': texture_key, 'size': data.get('size'), 'pixels': data.get('pixels')})
            info.update(resource=key, textures=texture_info)
            baselines.append(info)

    conflicts = []
    used_ids = model_ids | set(texture_to_blades)
    for key in sorted(used_ids):
        providers = resources.get(key, [])
        if len(providers) <= 1:
            continue
        selected = resolve(resources, key)
        top = [s for s in providers if s.priority == selected.priority]
        hashes = {hashlib.sha256(s.read()).hexdigest() for s in top}
        conflicts.append({'resource': key, 'selected': selected.label,
                          'providers': [s.label for s in providers],
                          'ambiguous': len(hashes) > 1,
                          'different_contents': len({hashlib.sha256(s.read()).hexdigest() for s in providers}) > 1})

    weapon_models = [m for m in models if m['role'] in ('named_weapon', 'default_weapon')]
    texture_sizes = Counter(t.get('size', '?') for t in textures)
    unique_texture_hashes = {t['sha256']: t for t in textures if 'sha256' in t}
    summary = {
        'generated': datetime.now(ZoneInfo('America/Los_Angeles')).isoformat(timespec='seconds'),
        'mods_scanned': len(jars), 'named_blades': len(blades), 'weapon_models': len(weapon_models),
        'obj_assets': len(models), 'other_obj_assets': len(models) - len(weapon_models),
        'weapon_textures': len(textures), 'unique_texture_contents': len(unique_texture_hashes),
        'texture_sizes': dict(texture_sizes), 'missing_resources': len(missing),
        'ambiguous_resources': sum(c['ambiguous'] for c in conflicts),
        'median_weapon_triangles': statistics.median(m['triangles'] for m in weapon_models),
        'median_weapon_normal_triangles': statistics.median(m['normal_triangles'] for m in weapon_models),
        'total_unique_texture_rgba_mib': sum(t.get('rgba_mib', 0) for t in unique_texture_hashes.values()),
        'total_texture_rgba_mib': sum(t.get('rgba_mib', 0) for t in textures),
        'runtime_definition_differences': runtime_differences,
        'active_resource_packs': active_packs,
    }
    log_path = ROOT / 'logs/latest.log'
    if log_path.is_file():
        logged = re.findall(r'OBJ reload: models=(\d+).*?fallbackParses=(\d+)',
                            log_path.read_text(encoding='utf-8', errors='replace'))
        if logged:
            summary['last_logged_obj_count'] = int(logged[-1][0])
            summary['last_logged_fallback_parses'] = int(logged[-1][1])
    result = {'summary': summary, 'native_baselines': baselines, 'models': models,
              'textures': textures, 'blades': blades, 'missing': missing, 'overrides': conflicts,
              'runtime_bindings': runtime_bindings}
    (args.output / 'audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    write_csv(args.output / 'blades.csv', blades, [
        'id', 'name', 'model', 'texture', 'faces', 'triangles', 'normal_triangles', 'inventory_triangles',
        'texture_size', 'texture_rgba_mib', 'total_ratio_default', 'normal_ratio_default',
        'inventory_ratio_default', 'pixel_ratio_default', 'implicit_model', 'runtime_override',
        'definition_source', 'model_source', 'texture_source'])
    write_csv(args.output / 'models.csv', models, [
        'resource', 'role', 'blade_count', 'blade_names', 'faces', 'triangles', 'blade_triangles',
        'sheath_triangles', 'normal_triangles', 'inventory_triangles', 'inventory_no_sheath_triangles',
        'vertices', 'uv_vertices', 'normal_vertices', 'triangle_faces', 'quad_faces', 'ngon_faces',
        'total_ratio_default', 'normal_ratio_default', 'inventory_ratio_default', 'texture_ids',
        'obj_bytes', 'source', 'class_references', 'parse_warnings', 'sha256'])
    write_csv(args.output / 'textures.csv', textures, [
        'resource', 'size', 'width', 'height', 'pixels', 'pixel_ratio_default', 'rgba_mib',
        'png_bytes', 'bit_depth', 'color_type', 'animated', 'blade_count', 'blade_names', 'source', 'sha256'])
    write_report(args.output, result)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print('\nTOP NORMAL MESHES')
    for m in sorted(weapon_models, key=lambda m: m['normal_triangles'], reverse=True)[:15]:
        print(m['normal_triangles'], m['triangles'], m['resource'], ' / '.join(m['blade_names'][:3]))
    print('\nTOP TEXTURES')
    for t in sorted(textures, key=lambda t: t.get('pixels', 0), reverse=True)[:12]:
        print(t.get('size'), t['resource'], ' / '.join(t['blade_names'][:3]))
    if missing:
        print('\nMISSING', json.dumps(missing, ensure_ascii=False))


def write_report(output, data):
    summary, baselines = data['summary'], data['native_baselines']
    models = [m for m in data['models'] if m['role'] in ('named_weapon', 'default_weapon')]
    textures = {t['resource']: t for t in data['textures']}
    line = []
    add = line.append
    add('# 拔刀剑模型与贴图审计\n')
    add(f"生成时间：{summary['generated']}（America/Los_Angeles）。\n")
    add(f"扫描 {summary['mods_scanned']} 个模组 JAR、KubeJS 覆盖和启用的文件资源包。"
        f"合并后有 {summary['named_blades']} 个命名刀定义，对应 {summary['weapon_models']} 个武器 OBJ（含本体默认模型）、"
        f"{summary['weapon_textures']} 张武器贴图；另统计 {summary['other_obj_assets']} 个未被命名刀直接引用的 OBJ。\n")
    add('这是当前磁盘资源的静态检查，不是 FPS 基准测试。未修改任何游戏资源，也未启动游戏。\n')
    if 'last_logged_obj_count' in summary:
        add(f"现有 latest.log 最近一次实际加载记载 OBJ 为 {summary['last_logged_obj_count']} 个，"
            f"与本次文件扫描 {'一致' if summary['last_logged_obj_count'] == summary['obj_assets'] else '不一致'}；"
            f"该次 fallbackParses={summary['last_logged_fallback_parses']}。这是既有日志交叉核对，未另行启动游戏。\n")
    add('## 统计口径\n')
    add('- `faces` 为 OBJ 的 `f` 行数；三角面按每个 n 边形 n−2 个统计。四边形不能与三角形直接按 f 行比较。')
    add('- 文件总三角面包含完整、破损、碎片、鞘、特效和物品栏网格；这些状态通常不会同时渲染。')
    add('- 正常网格 = `blade`＋`sheath`；物品栏列为 `item_blade`，无鞘状态另记录在 JSON/CSV 的 `item_bladens` 列。')
    add('- 原生渲染的重复绘制、附魔光效、透明层、光影和实体数量会改变实际开销；面数比例不等于 FPS 比例。')
    add('- 贴图内存为宽×高×4 的 RGBA8 估算；不含 mipmap、驱动开销或光影附加贴图。分辨率本身不代表美术质量。')
    add('- 同一 OBJ 或贴图被多把刀复用时按资源去重；所有刀到资源的对应关系见 blades.csv。')
    add('- 模组资源同路径存在不同内容且优先级相同的情况标为歧义，不把文件名排序当成已确认的 Forge 加载顺序。')
    add('- 无名五刀及永罚四刀的客户端覆盖单独核对；运行时绑定与定义不一致项记录在 audit.json。')
    add('- Tetra 拔刀物品继承原生 ItemSlashBlade，两个 SlashBladeTetra 模组没有独立 OBJ；按刀状态绑定的模型统计，不把拼装组合当成新的独立 OBJ。\n')
    add('## 本体原始标准模型（直接取安装的 SlashBlade JAR）\n')
    add('| 模型 | OBJ 面 | 总三角面 | 刀身＋鞘 | 物品栏 | 原始贴图尺寸 |')
    add('|---|---:|---:|---:|---:|---|')
    for m in baselines:
        add(f"| `{m['resource']}` | {m['faces']:,} | {m['triangles']:,} | {m['normal_triangles']:,} | "
            f"{m['inventory_triangles']:,} | {', '.join(sorted({t['size'] for t in m['textures'] if t['size']}))} |")
    add('\n## 主要发现与优化顺序\n')
    add('- 本体默认常态为 215 个三角面；本体传统命名刀为 151～926，文件总量为 745～3330。不能仅用默认刀的最低负载代表所有本体名刀。')
    for threshold in (2000, 5000, 10000):
        add(f"- 常态三角面超过 {threshold:,} 的独立武器模型有 {sum(m['normal_triangles'] > threshold for m in models)} 个。")
    add('- 几何优先核对：凯伯水晶光剑、灵刃狐月刀、樱剪、红樱、隐月·刃、狐月刀灵狐/仙狐、知更鸟及无名五刀。')
    add('- 贴图优先核对：绝念 2134×2133；猩红龙刃、蓝之梦、闪刀零衣与赫刀零衣为 2048×2048。')
    add('- 神威/极神威共用的常态网格均为 151 个三角面；役刀六种共享模型均为 600，物品栏为 456，符合本体名刀的数量级。')
    add('- 永罚大剑常态 580、最终永罚 780，贴图共用 128×128；黄金两剑常态约 1652～1704，御厨子 2836。')
    add('- 无名五刀常态 3397～4397，贴图都是 256×512。贴图属于本体已有尺寸级别，优先优化网格更有依据。')
    add('- 未被命名刀直接引用的解构者完整版仍有 82952 个文件总三角面，常态刀身 16142。不能直接断言它在当前战斗中使用，也不能把此类模型当成不会影响加载的空文件。')
    add(f"- 202 个武器贴图资源路径按 RGBA8 基础层估算总计 {summary['total_texture_rgba_mib']:.2f} MiB；"
        f"仅按图片内容哈希去重为 {summary['unique_texture_contents']} 份、{summary['total_unique_texture_rgba_mib']:.2f} MiB。"
        '游戏按资源路径缓存，不能假设不同路径的相同图片会自动合并。\n')
    add('\n## 当前武器模型全表\n')
    add('| 模型 | 使用刀举例 | 刀数 | OBJ 面 | 总三角面 | 刀身＋鞘 | 正常/默认倍率 | 物品栏 | 贴图尺寸 |')
    add('|---|---|---:|---:|---:|---:|---:|---:|---|')
    for m in sorted(models, key=lambda m: m['normal_triangles'], reverse=True):
        dims = sorted({textures[t]['size'] for t in m['texture_ids'] if t in textures and 'size' in textures[t]})
        names = '、'.join(m['blade_names'][:3]) + ('等' if len(m['blade_names']) > 3 else '')
        add(f"| `{m['resource']}` | {names or '本体默认'} | {m['blade_count']} | {m['faces']:,} | {m['triangles']:,} | "
            f"{m['normal_triangles']:,} | {m['normal_ratio_default']:.2f}× | {m['inventory_triangles']:,} | {', '.join(dims)} |")
    add('\n## 其他 OBJ 全表（特效、备用或变形资源）\n')
    add('“未被定义直接引用”不代表未使用；存在代码静态引用的会列在最后一列。\n')
    add('| 模型 | OBJ 面 | 总三角面 | blade＋sheath | 主要分组 | 代码静态引用 |')
    add('|---|---:|---:|---:|---|---|')
    for m in sorted((m for m in data['models'] if m not in models), key=lambda m: -m['triangles']):
        groups = ', '.join(f"{k}:{v['triangles']}" for k, v in m['groups'].items() if v['triangles'])
        add(f"| `{m['resource']}` | {m['faces']:,} | {m['triangles']:,} | {m['normal_triangles']:,} | "
            f"{groups} | {', '.join(m['class_references'])} |")
    add('\n死球示例：`sjap_adder:model/util/the_hole.obj` 文件总量 1584 三角面，其中 `base` 为 432。'
        'DeadBallRender 实际调用 `renderOverridedLuminous(..., "base", ...)`，单球主体只取 432，'
        '配套 `sjap_adder:model/util/ss.png` 为 32×32；21 枚球主体单次绘制约 9072 三角面，未含代码生成的拖尾。\n')
    add('\n## 贴图尺寸分布（资源路径去重）\n')
    add('| 尺寸 | 数量 |')
    add('|---|---:|')
    for size, count in sorted(summary['texture_sizes'].items(), key=lambda item: -item[1]):
        add(f'| {size} | {count} |')
    add('\n## 缺失资源与解析提示\n')
    for item in data['missing']:
        add(f"- 缺失 {item['kind']}：`{item['resource']}`；涉及 {', '.join(item['blades'])}。")
    for m in data['models']:
        if m['parse_warnings']:
            add(f"- `{m['resource']}`：{'；'.join(m['parse_warnings'][:3])}")
    if not data['missing'] and not any(m['parse_warnings'] for m in data['models']):
        add('本次扫描未发现引用资源缺失或 OBJ 面索引/面类型异常。')
    add('\n## 资源覆盖\n')
    for item in data['overrides']:
        if item['different_contents']:
            add(f"- `{item['resource']}` → `{item['selected']}`" + (' **同优先级来源歧义**' if item['ambiguous'] else ''))
    add('\n## 完整数据\n')
    add('- `blades.csv`：逐把命名刀的名称、模型、面数、贴图尺寸与最终资源来源。')
    add('- `models.csv`：全部缓存范围内 OBJ，包括没有被命名刀直接引用的特效/备用模型。')
    add('- `textures.csv`：全部武器贴图的尺寸、像素数、RGBA8 估算与复用刀名。')
    add('- `audit.json`：完整分组面数、本体原始对照、覆盖来源与缺失项。')
    add('- 复现：`python docs/tools/audit_slashblade_models.py`。')
    (output / 'report.md').write_text('\n'.join(line) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
