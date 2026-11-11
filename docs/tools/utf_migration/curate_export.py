"""Select UTF-owned generation resources and preserve the pack's shared features."""
import argparse
import json
import zipfile
from pathlib import Path
from workspace import BASELINE, CANDIDATE, ROOT, write_json


def curate(archive_path):
    output = CANDIDATE / 'kubejs'
    records = []
    skipped_prefixes = [
        'data/minecraft/worldgen/configured_feature/',
        'data/minecraft/worldgen/placed_feature/',
        'data/minecraft/worldgen/configured_carver/',
    ]
    swamp_modifier = ('data/ultraterraforged/ultraterraforged/worldgen/'
                      'biome_modifier/raw_generation/swamp_surface.json')
    with zipfile.ZipFile(archive_path) as archive:
        for name in archive.namelist():
            if not name.startswith('data/') or not name.endswith('.json'):
                continue
            reason = None
            if any(name.startswith(prefix) for prefix in skipped_prefixes):
                reason = 'Use the existing shared vanilla/modpack definition'
            if name == swamp_modifier:
                reason = 'Shared swamp feature has no UTF dimension-context guard'
            if reason:
                records.append({'resource': name, 'action': 'omit_override', 'reason': reason})
                continue
            value = json.loads(archive.read(name))
            if name == 'data/minecraft/tags/blocks/overworld_carver_replaceables.json':
                value['replace'] = False
            relative = Path(name)
            original = BASELINE / 'kubejs' / relative
            if original.exists() and json.loads(original.read_text(encoding='utf-8-sig')) != value:
                raise RuntimeError('Existing KubeJS resource needs an explicit merge: ' + name)
            write_json(output / relative, value)
            records.append({'resource': name, 'action': 'include', 'existing': original.exists()})
    write_json(ROOT / 'export-resource-policy.json', records)
    print('CURATED', sum(row['action'] == 'include' for row in records), 'resources;',
          sum(row['action'] == 'omit_override' for row in records), 'shared overrides omitted')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('archive', type=Path)
    options = parser.parse_args()
    curate(options.archive)
