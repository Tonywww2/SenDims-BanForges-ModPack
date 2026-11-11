"""Shared paths and immutable baseline setup for the UTF migration tests."""
import hashlib
import json
import shutil
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[3]
ROOT = SOURCE / 'docs/archive/utf-migration-2026-11-09'
BASELINE = ROOT / 'baseline'
RUNTIME = ROOT / 'server'
CANDIDATE = ROOT / 'candidate'
RUNS = ROOT / 'runs'
JAVA = Path('C:/Program Files/Java/graalvm-jdk-21.0.5+9.1/bin/java.exe')
JDK = JAVA.parent
OLD_BENCH = SOURCE / 'docs/archive/chunk-performance-2026-11-07/bench'
TERRAIN_DOWNLOADS = SOURCE / 'docs/archive/chunk-performance-2026-11-07/terrain-replacements'
TECTONIC = 'tectonic-3.0.17-forge-1.20.1.jar'
UTF = 'ultraterraforged-1.0.3+1.20.1-forge.jar'
C2ME = 'c2meforge-0.2.0-forge.9.9.6-all.jar'


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')


def write_control_json(path, value):
    """Publish a small command file atomically to a concurrently running game."""
    temporary = path.with_name(path.name + '.pending')
    write_json(temporary, value)
    temporary.replace(path)


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def setup():
    ROOT.mkdir(parents=True, exist_ok=True)
    CANDIDATE.mkdir(exist_ok=True)
    RUNS.mkdir(exist_ok=True)
    manifest_path = ROOT / 'baseline-manifest.json'
    if not manifest_path.exists():
        manifest = []
        for folder in ['mods', 'config', 'defaultconfigs', 'kubejs', 'hotai']:
            origin = SOURCE / folder
            if not origin.exists():
                continue
            print('SNAPSHOT', folder, flush=True)
            for path in origin.rglob('*'):
                if not path.is_file():
                    continue
                relative = path.relative_to(SOURCE)
                target = BASELINE / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, target)
                digest = sha256(target)
                if digest != sha256(path):
                    raise RuntimeError(f'Source changed during snapshot: {relative}')
                manifest.append({'path': relative.as_posix(), 'bytes': target.stat().st_size,
                                 'sha256': digest})
        write_json(manifest_path, manifest)
        print('BASELINE', len(manifest), 'files', flush=True)
    else:
        print('USING_EXISTING_IMMUTABLE_BASELINE', flush=True)
    if not (RUNTIME / 'libraries').exists():
        shutil.copytree(OLD_BENCH / 'libraries', RUNTIME / 'libraries')
    if not (RUNTIME / 'mods').exists():
        shutil.copytree(BASELINE / 'mods', RUNTIME / 'mods')
        exclusions = json.loads((OLD_BENCH / 'client-only-exclusions.json').read_text())
        exclusions.append('carbon-1.20.1.9.jar')
        applied = []
        for name in exclusions:
            path = RUNTIME / 'mods' / name
            if path.exists():
                path.rename(path.with_suffix('.jar.test-disabled'))
                applied.append(name)
        write_json(ROOT / 'server-only-exclusions.json', applied)
    (RUNTIME / 'eula.txt').write_text('eula=true\n', encoding='ascii')
    shutil.copy2(TERRAIN_DOWNLOADS / 'ultra.jar', CANDIDATE / UTF)
    print('WORKSPACE_READY', ROOT, flush=True)


if __name__ == '__main__':
    setup()
