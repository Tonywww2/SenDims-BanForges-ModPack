"""Package the verified migration and optionally deploy its exact file set with backups."""
import argparse
import json
import shutil
import time
import zipfile
from pathlib import Path
from workspace import C2ME, CANDIDATE, ROOT, SOURCE, TECTONIC, UTF, sha256, write_json
from resource_guard import external_games
from run_validation_pipeline import completed

REMOVALS = [Path('mods') / TECTONIC, Path('config/tectonic.json')]


def payload():
    ready = json.loads((ROOT / 'final-candidate-ready.json').read_text())
    current = {path.relative_to(CANDIDATE).as_posix(): sha256(path)
               for path in sorted(CANDIDATE.rglob('*')) if path.is_file()}
    if current != ready['files']:
        raise ValueError('Candidate differs from the formally tested manifest')
    files = {}
    for relative, digest in current.items():
        target = Path('mods') / relative if relative in [UTF, C2ME] else Path(relative)
        if not (SOURCE / target).resolve().is_relative_to(SOURCE.resolve()):
            raise ValueError('Payload path outside the Minecraft directory')
        files[target] = {'source': CANDIDATE / relative, 'sha256': digest}
    return files


def verify_results():
    if json.loads((ROOT / 'pipeline-status.json').read_text())['phase'] != 'complete':
        raise ValueError('Validation pipeline is still incomplete')
    formal = json.loads((ROOT / 'formal-runs.json').read_text())
    if len(formal) != 9 or not all(completed(name) for name in formal):
        raise ValueError('Expected nine completed formal runs')
    clients = json.loads((ROOT / 'client-tests.json').read_text())
    memory = json.loads((ROOT / 'memory-runs.json').read_text())
    for variant in ['A', 'B', 'C']:
        if variant not in clients or variant not in memory:
            raise ValueError('Missing client or single-round memory result for ' + variant)
        result = json.loads((ROOT / 'runs' / memory[variant] / 'result.json').read_text())
        samples = [sample for sample in result['memory'] if sample['phase'] == 'idle-after-gc']
        if not result['complete'] or len(samples) != 1:
            raise ValueError('Incomplete single-round memory run for ' + variant)
        if not completed(memory[variant]):
            raise ValueError('Memory run did not save cleanly for ' + variant)
    roundtrips = json.loads((ROOT / 'roundtrip-runs.json').read_text())
    for variant in ['A', 'B', 'C']:
        result = json.loads((ROOT / 'runs' / roundtrips[variant] / 'roundtrip-content.json').read_text())
        if not completed(roundtrips[variant]) or not result['contentIdentical']:
            raise ValueError('Round-trip content verification failed for ' + variant)
    land = json.loads((ROOT / 'land-runs.json').read_text())
    if len(land) != 3 or not all(completed(name) for name in land.values()):
        raise ValueError('Land comparison is still incomplete')


def package(files, release):
    directory = release / 'payload'
    for relative, entry in files.items():
        destination = directory / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(entry['source'], destination)
    (directory / 'remove-files.txt').write_text('\n'.join(path.as_posix() for path in REMOVALS) + '\n', encoding='utf-8')
    (directory / 'README.zh_cn.md').write_text(
        '# UTF 与 C2MEF 新档更新\n\n'
        '关闭 Minecraft 与服务端进程后，将包内 mods、config、kubejs、hotai 合并到游戏目录。\n\n'
        '按 remove-files.txt 删除旧 Tectonic JAR 和配置文件，然后通过 SkyblockBuilder 入口创建新存档。\n\n'
        'UTF 的世界范围为 Y=-64～319。源预设与 kubejs/data 中的导出资源需要一起更新。\n\n'
        'C2MEF 使用一半逻辑核心且上限为 4，最少为 1。HotAI 修正了 9.9.6 的 ZGC 并发周期计时和自动保存队列持锁死锁。\n\n'
        '客户端与服务端均应用这套文件。SHA-256 校验值见 manifest.json。\n', encoding='utf-8')
    manifest = {'files': {path.as_posix(): entry['sha256'] for path, entry in files.items()},
                'remove': [path.as_posix() for path in REMOVALS]}
    write_json(directory / 'manifest.json', manifest)
    archive = release / 'SDBF-UTF-C2MEF-update.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output:
        for path in sorted(directory.rglob('*')):
            if path.is_file():
                output.write(path, path.relative_to(directory).as_posix())
    return archive


def deploy(files, release):
    if external_games():
        raise ValueError('Minecraft must exit before deployment')
    baseline = {entry['path']: entry['sha256'] for entry in json.loads((ROOT / 'baseline-manifest.json').read_text())}
    for relative, entry in files.items():
        target = SOURCE / relative
        if target.exists() and sha256(target) not in [entry['sha256'], baseline.get(relative.as_posix())]:
            raise ValueError('Concurrent modification at ' + str(target))
        if target.suffix == '.badiff' and target.with_suffix('.class').exists():
            raise ValueError('Conflicting HotAI class replacement at ' + str(target.with_suffix('.class')))
    for relative in REMOVALS:
        target = SOURCE / relative
        if target.exists() and sha256(target) != baseline.get(relative.as_posix()):
            raise ValueError('Concurrent modification at ' + str(target))
    backup = release / 'backup'
    saved = {}
    for relative in set(files) | set(REMOVALS):
        target = (SOURCE / relative).resolve()
        if not target.is_relative_to(SOURCE.resolve()):
            raise ValueError('Deployment target outside the Minecraft directory')
        if target.exists():
            destination = backup / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, destination)
            digest = sha256(target)
            if sha256(destination) != digest:
                raise ValueError('Backup verification failed for ' + str(target))
            saved[relative.as_posix()] = digest
    write_json(release / 'backup-manifest.json', saved)
    installed = []
    removed = []
    try:
        for relative in REMOVALS:
            target = SOURCE / relative
            if target.exists():
                target.unlink()
                removed.append(relative)
        for relative, entry in files.items():
            target = SOURCE / relative
            if target.exists() and sha256(target) == entry['sha256']:
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            temporary = target.with_name(target.name + '.utf-update-pending')
            shutil.copy2(entry['source'], temporary)
            if sha256(temporary) != entry['sha256']:
                raise ValueError('Staged file verification failed for ' + str(target))
            temporary.replace(target)
            installed.append(relative)
        for relative, entry in files.items():
            if sha256(SOURCE / relative) != entry['sha256']:
                raise ValueError('Final deployment verification failed at ' + str(relative))
        for relative in REMOVALS:
            if (SOURCE / relative).exists():
                raise ValueError('Old migration file remains at ' + str(relative))
    except Exception as error:
        rollback_errors = []
        for relative in reversed(installed):
            target = SOURCE / relative
            try:
                if sha256(target) != files[relative]['sha256']:
                    raise ValueError('File changed during rollback')
                if (backup / relative).exists():
                    shutil.copy2(backup / relative, target)
                else:
                    target.unlink()
            except Exception as rollback_error:
                rollback_errors.append(str(target) + ' ' + str(rollback_error))
        for relative in removed:
            try:
                shutil.copy2(backup / relative, SOURCE / relative)
            except Exception as rollback_error:
                rollback_errors.append(str(relative) + ' ' + str(rollback_error))
        write_json(release / 'deployment.json', {'complete': False, 'error': str(error), 'rollbackErrors': rollback_errors})
        raise
    write_json(release / 'deployment.json', {'complete': True, 'installed': [path.as_posix() for path in installed],
                                          'removed': [path.as_posix() for path in removed]})


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--deploy', action='store_true')
    options = parser.parse_args()
    verify_results()
    files = payload()
    release = ROOT / 'releases' / time.strftime('%Y%m%d-%H%M%S')
    release.mkdir(parents=True)
    archive = package(files, release)
    if options.deploy:
        deploy(files, release)
    write_json(ROOT / 'release-result.json', {'directory': str(release), 'archive': str(archive),
                                            'deployed': options.deploy, 'payloadFiles': len(files)})
    print('RELEASE_READY', archive, 'DEPLOYED', options.deploy)
