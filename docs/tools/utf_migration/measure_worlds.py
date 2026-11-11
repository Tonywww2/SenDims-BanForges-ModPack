"""Measure first-seed storage, ore content, saved terrain and B/C consistency in one pass."""
import json
from collections import Counter
from functools import lru_cache
from pathlib import Path
import numpy as np
from analyze_worlds import inspect, unpack_palette
from plan_cameras import cave_biome, heightmap
from workspace import ROOT, write_json


@lru_cache(maxsize=16384)
def block_name(palette_entry):
    return json.loads(palette_entry)['Name']


class Collector:
    def __init__(self, center=(16384, 16384)):
        self.origin_x = center[0] // 16 - 63
        self.origin_z = center[1] // 16 - 63
        self.surface = np.full((2032, 2032), -32768, dtype=np.int16)
        self.floor = np.full_like(self.surface, -32768)
        self.requested_full = 0
        self.ores = Counter()
        self.non_air_sections = 0
        self.underground = Counter()

    def collect(self, chunk):
        cx, cz = int(chunk['xPos']), int(chunk['zPos'])
        inside = self.origin_x <= cx < self.origin_x + 127 and self.origin_z <= cz < self.origin_z + 127
        if inside:
            self.requested_full += 1
            x, z = (cx - self.origin_x) * 16, (cz - self.origin_z) * 16
            self.surface[z:z + 16, x:x + 16] = heightmap(chunk['Heightmaps']['WORLD_SURFACE'])
            floor = heightmap(chunk['Heightmaps']['OCEAN_FLOOR'])
            self.floor[z:z + 16, x:x + 16] = floor
        for section in chunk.get('sections', []):
            state = section.get('block_states')
            if not state:
                continue
            names = [str(entry['Name']) for entry in state['palette']]
            if any(name not in ['minecraft:air', 'minecraft:cave_air', 'minecraft:void_air'] for name in names):
                self.non_air_sections += 1
            has_ore = any(name.endswith('_ore') or name in ['minecraft:raw_iron_block', 'minecraft:raw_copper_block',
                                                           'regions_unexplored:raw_redstone_block'] for name in names)
            sample_y = int(section['Y']) * 16
            sample_underground = inside and -48 <= sample_y <= 32
            if not has_ore and not sample_underground:
                continue
            palette, values = unpack_palette(state, 4096, 4)
            decoded_names = np.array([block_name(entry) for entry in palette])
            if sample_underground:
                indices = np.array([z * 16 + x for z in range(0, 16, 4) for x in range(0, 16, 4)])
                valid = (sample_y < floor[::4, ::4].ravel() - 8)
                sampled = decoded_names[values[indices]][valid]
                biomes, biome_values = unpack_palette(section['biomes'], 64, 1)
                cave_flags = np.array([cave_biome(json.loads(entry)) for entry in biomes])[biome_values[:16]][valid]
                air = np.isin(sampled, ['minecraft:air', 'minecraft:cave_air', 'minecraft:void_air'])
                fluid = np.isin(sampled, ['minecraft:water', 'minecraft:lava'])
                self.underground['samples'] += int(valid.sum())
                self.underground['caveBiomeSamples'] += int(cave_flags.sum())
                self.underground['airSamples'] += int(air.sum())
                self.underground['fluidSamples'] += int(fluid.sum())
                self.underground['caveBiomeAirSamples'] += int((air & cave_flags).sum())
            if not has_ore:
                continue
            counts = np.bincount(values, minlength=len(palette))
            for entry, count in zip(palette, counts):
                name = block_name(entry)
                if name.endswith('_ore') or name in ['minecraft:raw_iron_block', 'minecraft:raw_copper_block',
                                                     'regions_unexplored:raw_redstone_block']:
                    self.ores[name] += int(count)


def main():
    worlds = json.loads((ROOT / 'primary-worlds.json').read_text())
    output = ROOT / 'world-metrics'
    output.mkdir(exist_ok=True)
    retained = {}
    all_stats = {}
    for variant in ['A', 'B', 'C']:
        collector = Collector()
        stats, chunks = inspect(Path(worlds[variant]), variant in ['B', 'C'], collector.collect)
        if collector.requested_full != 16129:
            raise ValueError(f'{variant} saved only {collector.requested_full} requested FULL chunks')
        stats['requestedFull'] = collector.requested_full
        stats['nonAirSections'] = collector.non_air_sections
        stats['oreBlocks'] = collector.ores
        stats['undergroundGrid'] = collector.underground
        stats['targetSeaSurfaceFraction'] = float(((collector.surface == 62) & (collector.floor < 62)).mean())
        np.savez_compressed(output / (variant + '-heights.npz'), surface=collector.surface, floor=collector.floor)
        write_json(output / (variant + '-storage.json'), stats)
        all_stats[variant] = stats
        if variant in ['B', 'C']:
            retained[variant] = chunks
        print('WORLD_MEASURED', variant, stats['full'], stats['fileBytes'], flush=True)
    left, right = retained['B'], retained['C']
    common = sorted(set(left) & set(right))
    differences = []
    categories = Counter()
    for position in common:
        fields = [key for key in left[position] if left[position][key] != right[position][key]]
        if fields:
            categories.update(fields)
            differences.append({'chunk': position, 'fields': fields})
    write_json(output / 'BC-content.json', {'commonFull': len(common), 'differentChunks': len(differences),
                                           'categories': categories, 'differences': differences,
                                           'leftOnly': len(set(left) - set(right)), 'rightOnly': len(set(right) - set(left))})
    write_json(output / 'storage-summary.json', all_stats)
    print('CONTENT_COMPARED', len(common), categories)


if __name__ == '__main__':
    main()
