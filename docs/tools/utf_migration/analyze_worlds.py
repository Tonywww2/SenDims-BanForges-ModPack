"""Inspect saved Anvil data and compare canonical generation content."""
import argparse
import gzip
import hashlib
import io
import json
import struct
import zlib
from collections import Counter
from pathlib import Path
import nbtlib
import numpy as np
from workspace import write_json


def read_payload(stream):
    length = int.from_bytes(stream.read(4), 'big')
    compression = stream.read(1)[0]
    if compression & 128:
        raise RuntimeError('External Anvil streams require explicit handling')
    payload = stream.read(length - 1)
    raw = {1: gzip.decompress, 2: zlib.decompress, 3: lambda value: value}[compression](payload)
    return length + 4, nbtlib.File.parse(io.BytesIO(raw))


def regions(folder):
    for path in sorted(folder.glob('*.mca')):
        with path.open('rb') as stream:
            header = stream.read(8192)
            for index in range(1024):
                location = int.from_bytes(header[index * 4:index * 4 + 4], 'big')
                sector, sectors = location >> 8, location & 255
                if not sector:
                    continue
                stream.seek(sector * 4096)
                payload_size, value = read_payload(stream)
                yield path, index, sectors * 4096, payload_size, value


def load_chunk(world, x, z):
    path = world / 'region' / f'r.{x // 32}.{z // 32}.mca'
    with path.open('rb') as stream:
        index = (x & 31) + (z & 31) * 32
        stream.seek(index * 4)
        location = int.from_bytes(stream.read(4), 'big')
        if not location:
            raise ValueError(f'Missing saved chunk {x}, {z}')
        stream.seek((location >> 8) * 4096)
        _, chunk = read_payload(stream)
        if (int(chunk['xPos']), int(chunk['zPos'])) != (x, z):
            raise ValueError(f'Chunk address mismatch in {path}, {index}')
        return chunk


def selected_chunks(world, positions):
    return {f'{x},{z}': chunk_content(load_chunk(world, x, z)) for x, z in positions}


def plain(value):
    if isinstance(value, dict):
        return {key: plain(child) for key, child in value.items()}
    if isinstance(value, (list, tuple, np.ndarray)):
        return [plain(child) for child in value]
    if isinstance(value, (np.integer, int)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        return float(value)
    return str(value)


def unpack_palette(container, size, minimum_bits):
    palette = [plain(entry) for entry in container.get('palette', [])]
    canonical = [json.dumps(entry, sort_keys=True, separators=(',', ':')) for entry in palette]
    ordered = sorted(set(canonical))
    remap = np.array([ordered.index(entry) for entry in canonical], dtype=np.uint16)
    if len(palette) <= 1:
        values = np.zeros(size, dtype=np.uint16)
    else:
        bits = max(minimum_bits, (len(palette) - 1).bit_length())
        per_word = 64 // bits
        data = np.asarray(container['data'], dtype=np.int64).view(np.uint64)
        indices = np.arange(size, dtype=np.uint64)
        values = remap[((data[indices // per_word] >> ((indices % per_word) * bits)) & ((1 << bits) - 1)).astype(np.int64)]
    return ordered, values


def packed(container, size, minimum_bits):
    ordered, values = unpack_palette(container, size, minimum_bits)
    result = hashlib.sha256()
    result.update(json.dumps(ordered, separators=(',', ':')).encode())
    result.update(values.tobytes())
    return result.hexdigest()


def digest(value):
    return hashlib.sha256(json.dumps(plain(value), sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def chunk_content(chunk):
    sections = {}
    for section in chunk.get('sections', []):
        y = int(section['Y'])
        content = {kind: packed(section[kind], size, bits)
                   for kind, size, bits in [('block_states', 4096, 4), ('biomes', 64, 1)]
                   if kind in section}
        if content:
            sections[y] = content
    entities = []
    for entity in chunk.get('block_entities', []):
        # Generated owners/connections are kept. No block-entity fields are excluded.
        entities.append(plain(entity))
    entities.sort(key=lambda entity: (entity.get('x', 0), entity.get('y', 0), entity.get('z', 0)))
    structures = plain(chunk.get('structures', {}))
    for key, values in structures.get('References', {}).items():
        structures['References'][key] = sorted(values)
    return {'sections': sections, 'block_entities': digest(entities),
            'structures': digest(structures), 'heightmaps': digest(chunk.get('Heightmaps', {})),
            'forge': digest(chunk.get('ForgeCaps', {})),
            'forge_data': digest(chunk.get('ForgeData', {})),
            'light': digest([{key: section[key] for key in ['Y', 'BlockLight', 'SkyLight'] if key in section}
                             for section in sorted(chunk.get('sections', []), key=lambda section: int(section['Y']))]),
            'fluid_ticks': digest(chunk.get('fluid_ticks', [])),
            'block_ticks': digest(chunk.get('block_ticks', []))}


def inspect(world, detailed=False, collect=None):
    stats = {'world': str(world), 'files': 0, 'fileBytes': 0, 'sectorBytes': 0,
             'payloadBytes': 0, 'statuses': Counter(), 'full': 0, 'blockEntities': 0,
             'biomes': Counter(), 'structureStarts': Counter()}
    chunks = {}
    for path in world.joinpath('region').glob('*.mca'):
        stats['files'] += 1
        stats['fileBytes'] += path.stat().st_size
    for _, _, sectors, payload, chunk in regions(world / 'region'):
        stats['sectorBytes'] += sectors
        stats['payloadBytes'] += payload
        status = str(chunk.get('Status', ''))
        stats['statuses'][status] += 1
        if status != 'minecraft:full':
            continue
        stats['full'] += 1
        if collect is not None:
            collect(chunk)
        stats['blockEntities'] += len(chunk.get('block_entities', []))
        for section in chunk.get('sections', []):
            if 'biomes' in section:
                stats['biomes'].update(str(entry) for entry in section['biomes']['palette'])
        for key, start in chunk.get('structures', {}).get('starts', {}).items():
            if str(start.get('id', 'INVALID')) != 'INVALID':
                stats['structureStarts'][key] += 1
        if detailed:
            chunks[(int(chunk['xPos']), int(chunk['zPos']))] = chunk_content(chunk)
    for category in ['entities', 'poi']:
        stats[category + 'FileBytes'] = sum(path.stat().st_size for path in (world / category).glob('*.mca'))
    return stats, chunks


def compare(left, right):
    a_stats, a = inspect(left, True)
    b_stats, b = inspect(right, True)
    common = sorted(set(a) & set(b))
    differences = []
    categories = Counter()
    for position in common:
        fields = [key for key in a[position] if a[position][key] != b[position][key]]
        if fields:
            categories.update(fields)
            differences.append({'chunk': position, 'fields': fields})
    return {'left': a_stats, 'right': b_stats, 'commonFull': len(common),
            'leftOnlyFull': len(set(a) - set(b)), 'rightOnlyFull': len(set(b) - set(a)),
            'differentChunks': len(differences), 'categories': categories, 'differences': differences}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('world', type=Path)
    parser.add_argument('--compare', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    options = parser.parse_args()
    result = compare(options.world, options.compare) if options.compare else inspect(options.world)[0]
    write_json(options.output, result)
    if options.compare:
        print('COMMON', result['commonFull'], 'DIFFERENT', result['differentChunks'], result['categories'])
    else:
        print('FULL', result['full'], 'FILE_MIB', round(result['fileBytes'] / 2**20, 2))
