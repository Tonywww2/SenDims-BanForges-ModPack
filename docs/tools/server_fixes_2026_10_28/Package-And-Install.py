"""Validate changed data, assemble the remote release, exercise installer on a fixture, install locally."""
from pathlib import Path
import hashlib
import importlib.util
import json
import os
import time
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[3]
BUILD = ROOT / 'docs/archive/server-fixes-2026-10-28'
RELEASE = BUILD / 'release'
BACKUP = ROOT / 'docs/releases/backups/server-fixes-2026-10-28'
DATA = [
    'kubejs/data/umapyoi/advancements/support_pedestal.json',
    'kubejs/data/riichi_mahjong_forge/loot_tables/blocks/yaku_generator.json',
    'kubejs/data/tetra/schematics/slashblade/blade/soul_blade.json',
    'kubejs/data/tetra/schematics/armor/chest/extra/dragon_wing.json',
    'kubejs/data/tetra/schematics/slashblade/special/orz.json',
    'kubejs/data/the_bumblezone/bz_bee_queen_trades/revival/modded/regions_unexplored_oak_branch.json',
    'kubejs/data/the_bumblezone/bz_bee_queen_trades/revival/modded/regions_unexplored_oak_shrub.json',
    'kubejs/data/terra_entity/loot_tables/entities/spawn_diamond_sword_staff.json',
]
DATA += [row['path'] for row in json.loads((BUILD / 'disabled-nc-recipes.json').read_text())]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def validate_data():
    assert len(DATA) == 21 and len(set(DATA)) == 21
    for rel in DATA:
        d = json.loads((ROOT / rel).read_text(encoding='utf8'))
        if '/schematics/' in rel:
            assert d['slots'] == ['sdbf/disabled'] and d['outcomes'] == []
        if '/nuclearcraft/' in rel:
            assert {'type': 'forge:false'} in d['conditions']
        if '/bz_bee_queen_trades/' in rel:
            assert d['possible_rewards'][0]['id'].startswith('regions_unexplored:')
        if rel.endswith('spawn_diamond_sword_staff.json'):
            assert d['type'] == 'minecraft:entity'
    with zipfile.ZipFile(ROOT / 'mods/riichi_mahjong_forge-0.2.0.jar') as z:
        for tier in [1, 2, 3]:
            p = f'data/riichi_mahjong_forge/loot_tables/blocks/yaku_generator_tier_{tier}.json'
            assert p in z.namelist(), p
    a = json.loads((ROOT / DATA[0]).read_text())
    conditions = a['criteria']['buildSupport']['conditions']
    assert [c['condition'] for c in conditions['location']] == ['minecraft:location_check', 'minecraft:match_tool']
    # Verify actual RU registered blocks back the corrected namespaces.
    with zipfile.ZipFile(ROOT / 'mods/RegionsUnexploredForge-0.5.6+1.20.1.jar') as z:
        registry = z.read('net/regions_unexplored/block/RuBlocks.class')
        for key in [b'oak_branch', b'oak_shrub']:
            assert key in registry
    for rel in DATA:
        p = RELEASE / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / rel, p)


def make_manifest():
    lines = (RELEASE / 'CLASS-FINGERPRINTS.tsv').read_text().splitlines()
    classes = [dict(zip(['jar', 'class', 'original_sha256', 'patched_sha256'], line.split('\t'))) for line in lines[1:]]
    assert len(classes) == 8
    own = dict(line.split('=', 1) for line in (RELEASE / 'OWN-MOD-FINGERPRINTS.txt').read_text().splitlines())
    own['path'] = 'mods/slashblade_sendims-1.1.1.jar'
    files = []
    jar_for = {'umapyoi': 'umapyoi-1.12.73-1.20.1.jar', 'riichi_mahjong_forge': 'riichi_mahjong_forge-0.2.0.jar', 'terra_entity': 'terra_entity-1.2.3-all.jar', 'the_bumblezone': 'the_bumblezone-7.14.0+1.20.1-forge.jar', 'nuclearcraft': 'NuclearCraft-1.20.1-1.2.36.jar'}
    for rel in DATA:
        allowed = []
        old = BACKUP / rel
        if old.exists():
            allowed.append(sha(old.read_bytes()))
        namespace = rel.split('/')[2]
        if namespace in jar_for:
            with zipfile.ZipFile(ROOT / 'mods' / jar_for[namespace]) as z:
                allowed.append(sha(z.read(rel.removeprefix('kubejs/'))))
        files.append({'path': rel, 'sha256': sha((RELEASE / rel).read_bytes()), 'allowed_existing': allowed})
    for row in classes:
        files.append({'path': 'hotai/' + row['class'] + '.class', 'sha256': row['patched_sha256']})
    files.append({'path': own['path'], 'sha256': own['patched_sha256'], 'allowed_existing': [own['original_sha256']]})
    deletions = []
    for name in ['hydrogen_mask', 'dune_detail']:
        rel = f'kubejs/data/sdbf/worldgen/density_function/{name}.json'
        assert not (ROOT / rel).exists()
        deletions.append({'path': rel, 'sha256': sha((BACKUP / rel).read_bytes())})
    manifest = {'classes': classes, 'own_mod': own, 'files': files, 'deletions': deletions, 'config_edits': [
        {'path': 'config/aether_redux_common.toml', 'kind': 'redux'},
        {'path': 'config/apotheosis/enchantments.cfg', 'kind': 'capturing'}
    ]}
    (RELEASE / 'MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf8')
    shutil.copy2(Path(__file__).with_name('Apply-Fixes.py'), RELEASE / 'Apply-Fixes.py')
    return manifest


def fixture_test(installer, manifest):
    fixture = BUILD / ('installer-fixture-' + str(time.time_ns()))
    assert not fixture.exists(), 'Keep prior fixtures for diagnosis; choose a fresh build before rerunning.'
    for name in {row['jar'] for row in manifest['classes']}:
        dest = fixture / 'mods' / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        source = ROOT / 'mods' / name
        shutil.copy2(source, dest)
    for row in manifest['config_edits'] + manifest['deletions']:
        dest = fixture / row['path']
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(BACKUP / row['path'], dest)
    old = fixture / 'hotai' / (manifest['classes'][0]['class'] + '.badiff')
    old.parent.mkdir(parents=True, exist_ok=True)
    old.write_bytes(b'old-specific-target-diff')
    unrelated = fixture / 'hotai/unrelated/Unchanged.badiff'
    unrelated.parent.mkdir(parents=True, exist_ok=True)
    unrelated.write_bytes(b'preserve-other-patch')
    fixture = fixture.resolve()
    actions = installer.plan(fixture, RELEASE.resolve(), manifest)
    assert len(actions) == 35, len(actions)
    saved = installer.apply(fixture, actions)
    assert sha((ROOT / manifest['own_mod']['path']).read_bytes()) == manifest['own_mod']['original_sha256'], 'Fixture must never mutate a linked input'
    assert (saved / old.relative_to(fixture)).read_bytes() == b'old-specific-target-diff'
    assert not old.exists() and unrelated.read_bytes() == b'preserve-other-patch'
    assert installer.plan(fixture, RELEASE.resolve(), manifest) == [], 'install should be idempotent'
    for row in manifest['files']:
        assert sha((fixture / row['path']).read_bytes()) == row['sha256']
    for row in manifest['deletions']:
        assert not (fixture / row['path']).exists()
    print('PASS installer fixture: backups, per-key config edits, two deletions, old diff removal, unrelated patch preservation, idempotence')


def main():
    validate_data()
    manifest = make_manifest()
    spec = importlib.util.spec_from_file_location('sdbf_installer', RELEASE / 'Apply-Fixes.py')
    installer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(installer)
    fixture_test(installer, manifest)
    # Capture all original runtime patches before local installation.
    original_hotai = {p.relative_to(ROOT).as_posix(): sha(p.read_bytes()) for p in (ROOT / 'hotai').rglob('*') if p.is_file()}
    (BACKUP / 'original-hotai-sha256.json').write_text(json.dumps(original_hotai, indent=2) + '\n', encoding='utf8')
    original_mod = ROOT / manifest['own_mod']['path']
    dest = BACKUP / manifest['own_mod']['path']
    dest.parent.mkdir(parents=True, exist_ok=True)
    assert not dest.exists()
    shutil.copy2(original_mod, dest)
    operations = installer.plan(ROOT.resolve(), RELEASE.resolve(), manifest)
    print('Local runtime files to install:', len(operations))
    local_backup = installer.apply(ROOT.resolve(), operations)
    assert installer.plan(ROOT.resolve(), RELEASE.resolve(), manifest) == []
    for rel, expected in original_hotai.items():
        assert sha((ROOT / rel).read_bytes()) == expected, 'Unrelated existing patch changed: ' + rel
    assert len(original_hotai) == 13
    print('PASS local install; all 13 previous HotAI patches unchanged; backup:', local_backup)
    package = ROOT / 'docs/releases/SDBF-Server-Fixes-2026-10-29.zip'
    with zipfile.ZipFile(package, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for p in sorted(RELEASE.rglob('*')):
            if p.is_file() and '__pycache__' not in p.parts:
                assert p.suffix != '.badiff', 'Never ship runtime differences'
                z.write(p, p.relative_to(RELEASE).as_posix())
    print('Release:', package)
    print('SHA256:', sha(package.read_bytes()))


if __name__ == '__main__':
    main()
