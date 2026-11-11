"""Summarize the actual blocks that differ between two fresh generation runs."""
import argparse
import json
from collections import Counter
from pathlib import Path
import numpy as np
from analyze_worlds import regions, unpack_palette
from workspace import write_json


def load(world):
    return {(int(chunk['xPos']), int(chunk['zPos'])): chunk
            for _, _, _, _, chunk in regions(world / 'region')
            if str(chunk.get('Status', '')) == 'minecraft:full'}


def compare(a, b):
    left, right = load(a), load(b)
    transitions = Counter()
    changed_chunks = Counter()
    for position in set(left) & set(right):
        sections_a = {int(section['Y']): section for section in left[position].get('sections', [])}
        sections_b = {int(section['Y']): section for section in right[position].get('sections', [])}
        for y in set(sections_a) & set(sections_b):
            if 'block_states' not in sections_a[y] or 'block_states' not in sections_b[y]:
                continue
            palette_a, values_a = unpack_palette(sections_a[y]['block_states'], 4096, 4)
            palette_b, values_b = unpack_palette(sections_b[y]['block_states'], 4096, 4)
            common = sorted(set(palette_a) | set(palette_b))
            map_a = np.array([common.index(value) for value in palette_a])
            map_b = np.array([common.index(value) for value in palette_b])
            mapped_a, mapped_b = map_a[values_a], map_b[values_b]
            changed = mapped_a != mapped_b
            changed_chunks[position] += int(changed.sum())
            pairs = Counter(zip(mapped_a[changed].tolist(), mapped_b[changed].tolist()))
            for (before, after), count in pairs.items():
                transitions[(common[before], common[after])] += count
    return {'commonFull': len(set(left) & set(right)), 'differentBlocks': sum(transitions.values()),
            'transitions': [{'before': json.loads(pair[0]), 'after': json.loads(pair[1]), 'count': count}
                            for pair, count in transitions.most_common()],
            'changedChunks': [{'chunk': position, 'blocks': count} for position, count in changed_chunks.most_common() if count]}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('left', type=Path)
    parser.add_argument('right', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    options = parser.parse_args()
    result = compare(options.left, options.right)
    write_json(options.output, result)
    print('CHANGED_BLOCKS', result['differentBlocks'])
    print(json.dumps(result['transitions'][:12], ensure_ascii=False))
