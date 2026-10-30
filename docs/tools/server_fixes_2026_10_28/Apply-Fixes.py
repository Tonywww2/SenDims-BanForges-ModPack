"""Python 3.9+: validate a stopped server/client, then apply this exact release with backups."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import shutil
import zipfile


def sha(data):
    return hashlib.sha256(data).hexdigest()


def inside(root, rel):
    path = (root / rel).resolve()
    path.relative_to(root.resolve())
    return path


def config_update(data, edit):
    text = data.decode('utf-8-sig')
    if edit['kind'] == 'redux':
        old = '"Redux Noise" = "without_aa"'
        new = '"Redux Noise" = "WITHOUT_AA"'
        if new in text:
            return data
        if text.count(old) != 1:
            raise ValueError('Redux Noise setting differs; review it manually before applying.')
        return data.replace(old.encode(), new.encode())
    marker = b'"apotheosis:capturing" {'
    start = data.index(marker)
    end = data.index(b'\n}', start)
    section = data[start:end]
    key = b'S:"Max Power Function"='
    lines = [line.strip() for line in section.splitlines() if line.strip().startswith(key)]
    if lines == [key]:
        return data
    if lines != [key + b'x*0.001']:
        raise ValueError('Capturing power differs; review it manually before applying.')
    return data[:start] + section.replace(key + b'x*0.001', key) + data[end:]


def plan(root, package, manifest):
    operations = []
    # Validate every input before writing anything, including the companion mod baseline.
    for row in manifest['classes']:
        jar = inside(root, 'mods/' + row['jar'])
        with zipfile.ZipFile(jar) as z:
            actual = sha(z.read(row['class'] + '.class'))
        if actual != row['original_sha256']:
            raise ValueError('Wrong original class: ' + row['jar'] + ' / ' + row['class'])
    for jar in inside(root, 'mods').glob('*.jar'):
        with zipfile.ZipFile(jar) as z:
            if 'mcjty/theoneprobe/api/ProbeMode.class' in z.namelist():
                raise ValueError('This release requires TOP to be absent. Do not apply the Bonsai adapter removal with TOP installed.')
    own = manifest['own_mod']
    current = sha(inside(root, own['path']).read_bytes())
    if current not in [own['original_sha256'], own['patched_sha256']]:
        raise ValueError('Own mod JAR differs from the verified baseline; do not overwrite another build.')
    for row in manifest['files']:
        target = inside(root, row['path'])
        payload = inside(package, row['path']).read_bytes()
        if sha(payload) != row['sha256']:
            raise ValueError('Corrupt release payload: ' + row['path'])
        if target.exists():
            if sha(target.read_bytes()) == row['sha256']:
                continue
            if row.get('allowed_existing') and sha(target.read_bytes()) not in row['allowed_existing']:
                raise ValueError('Existing data differs; review before overwrite: ' + row['path'])
        operations.append(('write', target, payload))
    for row in manifest['deletions']:
        target = inside(root, row['path'])
        if target.exists():
            if sha(target.read_bytes()) != row['sha256']:
                raise ValueError('Unused density definition differs; review before removal: ' + row['path'])
            operations.append(('delete', target, None))
    for row in manifest['config_edits']:
        target = inside(root, row['path'])
        if not target.exists():
            # The mod creates defaults; these two fixes only repair existing invalid overrides.
            continue
        data = target.read_bytes()
        updated = config_update(data, row)
        if updated != data:
            operations.append(('write', target, updated))
    # HotAI scans recursively. Remove old forms of these targets, with backups outside hotai.
    hotai = inside(root, 'hotai')
    for row in manifest['classes']:
        owner = row['class']
        for old in hotai.rglob('*') if hotai.exists() else []:
            if old.is_file() and any(old.relative_to(hotai).as_posix().endswith(owner + ext) for ext in ['.class', '.badiff']):
                canonical = hotai / (owner + '.class')
                if old == canonical and sha(old.read_bytes()) == row['patched_sha256']:
                    continue
                if not any(path == old and action == 'write' for action, path, _ in operations):
                    operations.insert(0, ('delete', old, None))
    return operations


def apply(root, operations):
    stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    backup = inside(root, '.sdbf-backups/server-fixes-' + stamp)
    records = []
    for action, path, payload in operations:
        rel = path.relative_to(root).as_posix()
        existed = path.exists()
        if existed:
            saved = inside(backup, rel)
            saved.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, saved)
        records.append({'path': rel, 'action': action, 'existed': existed})
    backup.mkdir(parents=True, exist_ok=True)
    (backup / 'ROLLBACK-FILES.json').write_text(json.dumps(records, indent=2), encoding='utf8')
    for action, path, payload in operations:
        if action == 'delete':
            path.unlink()
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            # Break only this directory entry if a launcher linked it to another instance.
            if path.exists() and path.stat().st_nlink > 1:
                path.unlink()
            path.write_bytes(payload)
    return backup


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, help='Stopped server or client Minecraft directory')
    parser.add_argument('--apply', action='store_true', help='Write the validated changes; default is check only')
    args = parser.parse_args()
    root = Path(args.root).resolve()
    package = Path(__file__).resolve().parent
    manifest = json.loads((package / 'MANIFEST.json').read_text(encoding='utf8'))
    operations = plan(root, package, manifest)
    print('Validated original classes, own-mod baseline, payloads, existing data and configuration.')
    print('Planned file changes:', len(operations))
    for action, path, _ in operations:
        print(action, path.relative_to(root).as_posix())
    if args.apply and operations:
        backup = apply(root, operations)
        print('Applied. Backups:', backup)
        print('Restart required. Preserve all other HotAI patches.')
    elif not args.apply:
        print('Check only. Stop the instance and add --apply to install.')


if __name__ == '__main__':
    main()
