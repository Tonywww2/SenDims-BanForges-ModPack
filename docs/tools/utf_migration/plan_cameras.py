"""Choose documented camera positions from completed terrain and cave surveys."""
import json
from pathlib import Path
import numpy as np
from analyze_worlds import load_chunk, unpack_palette
from workspace import ROOT, RUNTIME, write_json


def cave_biome(name):
    return ('cave' in name or name in ['minecraft:deep_dark', 'regions_unexplored:ancient_delta',
            'regions_unexplored:prismachasm', 'darkerdepths:sandy_catacombs',
            'darkerdepths:glowshroom_forest', 'darkerdepths:molten_cavern', 'quark:glimmering_weald'])


def heightmap(data):
    packed = np.asarray(data, dtype=np.int64).view(np.uint64)
    indices = np.arange(256, dtype=np.uint64)
    values = ((packed[indices // 7] >> ((indices % 7) * 9)) & 511).astype(np.int32)
    return (values - 65).reshape(16, 16)


def open_cave(world, survey):
    checked = set()
    for sample in sorted(survey['generatedCaves'], key=lambda value: value['air'], reverse=True):
        if not cave_biome(sample['target']):
            continue
        cx, cz = int(sample['point'][0]) // 16, int(sample['point'][2]) // 16
        if (cx, cz) in checked:
            continue
        checked.add((cx, cz))
        chunk = load_chunk(world, cx, cz)
        air = np.ones((384, 16, 16), dtype=bool)
        biome_mask = np.zeros_like(air)
        for section in chunk['sections']:
            offset = int(section['Y']) * 16 + 64
            if offset < 0 or offset + 16 > 384:
                continue
            if 'block_states' in section:
                palette, values = unpack_palette(section['block_states'], 4096, 4)
                lookup = np.array([json.loads(entry)['Name'] in ['minecraft:air', 'minecraft:cave_air'] for entry in palette])
                air[offset:offset + 16] = lookup[values].reshape(16, 16, 16)
            if 'biomes' in section:
                palette, values = unpack_palette(section['biomes'], 64, 1)
                lookup = np.array([cave_biome(json.loads(entry)) for entry in palette])
                coarse = lookup[values].reshape(4, 4, 4)
                biome_mask[offset:offset + 16] = coarse.repeat(4, axis=0).repeat(4, axis=1).repeat(4, axis=2)
        padded = np.pad(air, 2)
        score = np.zeros(air.shape, dtype=np.uint16)
        for y in range(5):
            for z in range(5):
                for x in range(5):
                    score += padded[y:y + 384, z:z + 16, x:x + 16]
        world_y = np.arange(-64, 320)[:, None, None]
        floor = heightmap(chunk['Heightmaps']['OCEAN_FLOOR'])
        valid = air & biome_mask & (world_y >= -48) & (world_y <= 32) & (world_y < floor[None, :, :] - 8)
        valid[:, :2, :] = False
        valid[:, -2:, :] = False
        valid[:, :, :2] = False
        valid[:, :, -2:] = False
        score[~valid] = 0
        if int(score.max()) < 110:
            continue
        y, z, x = map(int, np.unravel_index(score.argmax(), score.shape))
        return {'name': 'cave-matched', 'x': cx * 16 + x + 0.5, 'y': y - 64 - 1.12,
                'z': cz * 16 + z + 0.5, 'yaw': 90 if x >= 8 else -90, 'pitch': 5,
                'nightVision': True, 'sourceBiome': sample['target'], 'clearAirIn5Cube': int(score.max())}
    raise ValueError('No sufficiently open saved cave camera was found')


def plan():
    surveys = {variant: json.loads((ROOT / 'runs' / name / 'result.json').read_text()) for variant, name in [
        ('A', 'A-survey-20261107-20261109-161214'), ('B', 'B-survey-20261107-20261109-113301')]}
    points = {}
    for variant, survey in surveys.items():
        peak = max(survey['map']['points'], key=lambda value: value[2])
        points[variant] = [
            {'name': 'same-coordinate-final', 'x': 16384, 'y': 360, 'z': 16384, 'yaw': 135, 'pitch': 45},
            {'name': 'mountain-matched', 'x': peak[0] + 160, 'y': peak[2] + 60,
             'z': peak[1] + 160, 'yaw': 135, 'pitch': 18},
            {'name': 'spawn-island-final', 'x': 2090, 'y': 319, 'z': 50, 'yaw': 140, 'pitch': 25},
            open_cave(RUNTIME / ('world-' + survey['run']), survey),
        ]
    points['B'].append({'name': 'prismachasm', 'x': 6222.5, 'y': 16.88, 'z': 5122.5,
                        'yaw': 90, 'pitch': 5, 'nightVision': True})
    points['C'] = points['B']
    write_json(ROOT / 'planned-client-points.json', points)
    print(json.dumps(points, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    plan()
