"""Back up and bound DeepRealmCertificate tooltip palette indices in the local JAR.

Uses cached ASM libraries and the installed JDK. Only one class is replaced;
every other uncompressed JAR entry must remain byte-for-byte identical.
"""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[2]
JAR = ROOT / 'mods/slashblade_sendims-1.0.22.jar'
ENTRY = 'com/tonywww/slashblade_sendims/items/DeepRealmCertificate.class'
CACHE = ROOT / 'docs/archive/cache/deep-realm-certificate-crash'
JDK = Path('C:/Program Files/Java/openjdk-19.0.1/bin')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    asm = Path.home() / '.gradle/caches/modules-2/files-2.1/org.ow2.asm'
    libraries = []
    for name in ('asm', 'asm-tree', 'asm-analysis'):
        matches = list((asm / name / '9.9.1').glob(f'*/{name}-9.9.1.jar'))
        if len(matches) != 1:
            raise RuntimeError(f'Missing cached {name} 9.9.1 library')
        libraries.append(str(matches[0]))
    classes = CACHE / 'classes'
    classes.mkdir(exist_ok=True)
    source = ROOT / 'docs/tools/deep_realm_certificate_fix/PatchDeepRealmCertificate.java'
    classpath = os.pathsep.join(libraries)
    subprocess.run([str(JDK / 'javac.exe'), '--release', '17', '-cp', classpath,
                    '-d', str(classes), str(source)], check=True)
    before_hash = digest(JAR.read_bytes())
    with zipfile.ZipFile(JAR) as source_jar:
        assert not any(name.upper().endswith(('.SF', '.RSA', '.DSA')) for name in source_jar.namelist()), 'Signed JAR'
        original = source_jar.read(ENTRY)
    input_class = CACHE / 'DeepRealmCertificate.before.class'
    output_class = CACHE / 'DeepRealmCertificate.patched.class'
    input_class.write_bytes(original)
    subprocess.run([str(JDK / 'java.exe'), '-Xverify:all', '-cp',
                    os.pathsep.join([str(classes), classpath]), 'PatchDeepRealmCertificate',
                    str(input_class), str(output_class)], check=True)
    patched = output_class.read_bytes()
    if patched == original:
        print('Already patched; installed JAR left untouched')
        return
    backup = CACHE / f'slashblade_sendims-1.0.22.before-{before_hash[:12]}.jar'
    if backup.exists():
        assert digest(backup.read_bytes()) == before_hash
    else:
        shutil.copy2(JAR, backup)
    staged = CACHE / 'slashblade_sendims-1.0.22.patched.jar'
    with zipfile.ZipFile(backup) as old, zipfile.ZipFile(staged, 'w') as new:
        new.comment = old.comment
        for info in old.infolist():
            new.writestr(info, patched if info.filename == ENTRY else old.read(info.filename))
    with zipfile.ZipFile(backup) as old, zipfile.ZipFile(staged) as new:
        assert old.namelist() == new.namelist()
        changed = [name for name in old.namelist() if old.read(name) != new.read(name)]
        assert changed == [ENTRY], changed
        assert new.testzip() is None
    assert digest(JAR.read_bytes()) == before_hash, 'Installed JAR changed during patching'
    assert JAR.resolve().is_relative_to((ROOT / 'mods').resolve())
    assert staged.resolve().is_relative_to(CACHE.resolve())
    after_hash = digest(staged.read_bytes())
    os.replace(staged, JAR)
    assert digest(JAR.read_bytes()) == after_hash
    (CACHE / 'patch-audit.json').write_text(json.dumps({
        'jar': str(JAR), 'backup': str(backup), 'before_sha256': before_hash,
        'after_sha256': after_hash, 'changed_entries': changed,
        'checks': ['three bounded palette reads', '24 executed boundary cases',
                   'ASM tooltip stack verification', 'JVM fixture verification',
                   'all other JAR entries unchanged', 'ZIP integrity']
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(f'Patched: {JAR}')
    print(f'Backup: {backup}')
    print('PASS: exactly one class changed; all other JAR entries preserved')


if __name__ == '__main__':
    main()
