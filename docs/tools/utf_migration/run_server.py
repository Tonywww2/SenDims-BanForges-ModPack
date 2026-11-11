"""Run one isolated Forge test and retain its effective inputs and diagnostics."""
import argparse
import json
import re
import shutil
import subprocess
import time
from pathlib import Path
import psutil
from resource_guard import external_games, wait_for_isolation
from workspace import (BASELINE, C2ME, CANDIDATE, JAVA, OLD_BENCH, ROOT,
                       RUNS, RUNTIME, TECTONIC, UTF, sha256, write_control_json, write_json)

TOOLS = Path(__file__).resolve().parent


def reset_directory(name):
    target = (RUNTIME / name).resolve()
    assert target.parent == RUNTIME.resolve() and RUNTIME.resolve().is_relative_to(ROOT.resolve())
    if target.exists():
        shutil.rmtree(target)
    if (BASELINE / name).exists():
        shutil.copytree(BASELINE / name, target)


def configure(variant, mode, seed, run_name, parallelism=None, gc_patch=True, reuse_world=None, center=None):
    if mode == 'reload' and not reuse_world:
        raise ValueError('Reload mode requires an existing test world')
    for folder in ['config', 'defaultconfigs', 'kubejs', 'hotai']:
        reset_directory(folder)
    active = RUNTIME / 'mods' / TECTONIC
    disabled = active.with_suffix('.jar.variant-disabled')
    if variant == 'A' and disabled.exists():
        disabled.rename(active)
    if variant != 'A' and active.exists():
        active.rename(disabled)
    for name in [UTF, C2ME]:
        target = RUNTIME / 'mods' / name
        if target.exists():
            target.unlink()
    if variant != 'A':
        shutil.copy2(CANDIDATE / UTF, RUNTIME / 'mods' / UTF)
        shutil.copytree(CANDIDATE / 'config', RUNTIME / 'config', dirs_exist_ok=True)
        if mode != 'export':
            shutil.copytree(CANDIDATE / 'kubejs/data', RUNTIME / 'kubejs/data', dirs_exist_ok=True)
    if variant == 'C':
        shutil.copy2(CANDIDATE / C2ME, RUNTIME / 'mods' / C2ME)
        if gc_patch and (CANDIDATE / 'hotai').exists():
            shutil.copytree(CANDIDATE / 'hotai', RUNTIME / 'hotai', dirs_exist_ok=True)
        c2me = RUNTIME / 'config/c2me.toml'
        lines = c2me.read_text(encoding='utf-8').splitlines()
        section = ''
        for index, line in enumerate(lines):
            if line.strip().startswith('['):
                section = line.strip()
            if line.strip().startswith('gcFreeChunkSerializer ='):
                lines[index] = '\tgcFreeChunkSerializer = false'
            if parallelism is not None and line.strip().startswith('globalExecutorParallelism ='):
                lines[index] = f'globalExecutorParallelism = {parallelism}'
            if section == '[noTickViewDistance]' and line.strip().startswith('enabled ='):
                lines[index] = '\tenabled = false'
        c2me.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    config = {'variant': variant, 'mode': mode, 'seed': seed, 'run': run_name,
              'parallelism': parallelism, 'gcPatch': bool(gc_patch and variant == 'C'), 'reuseWorld': reuse_world}
    config['center'] = list(center or [16384, 16384])
    config['candidatePatches'] = {path.relative_to(CANDIDATE).as_posix(): sha256(path)
                                 for path in (CANDIDATE / 'hotai').rglob('*.badiff')
                                 if variant == 'C' and gc_patch}
    write_json(RUNTIME / 'migration-test.json', config)
    shutil.copy2(TOOLS / 'server_probe.js', RUNTIME / 'kubejs/server_scripts/zz_utf_migration_probe.js')
    properties = (OLD_BENCH / 'server.properties').read_text(encoding='utf-8')
    if reuse_world:
        world = (RUNTIME / reuse_world).resolve()
        if world.parent != RUNTIME.resolve() or not (world / 'level.dat').exists() or mode != 'reload':
            raise ValueError('Invalid test world for reload')
    values = {'level-name': reuse_world or 'world-' + run_name, 'level-seed': str(seed),
              'level-type': 'ultraterraforged:ultraterraforged' if mode == 'export' else 'skyblockbuilder:skyblock',
              'server-port': '25579', 'max-tick-time': '-1', 'view-distance': '8',
              'simulation-distance': '6', 'gamemode': 'spectator'}
    for key, value in values.items():
        properties = re.sub(r'^' + re.escape(key) + r'=.*$', lambda _: key + '=' + value,
                            properties, flags=re.MULTILINE)
    (RUNTIME / 'server.properties').write_text(properties, encoding='utf-8')
    return config


def run(variant, mode, seed, parallelism=None, gc_patch=True, reuse_world=None, center=None):
    wait_for_isolation()
    stamp = time.strftime('%Y%m%d-%H%M%S')
    name = f'{variant}-{mode}-{seed}-{stamp}'
    out = RUNS / name
    out.mkdir(parents=True)
    config = configure(variant, mode, seed, name, parallelism, gc_patch, reuse_world, center)
    write_json(out / 'inputs.json', config)
    result_path = RUNTIME / 'migration-result.json'
    if result_path.exists():
        result_path.unlink()
    args = [str(JAVA), '-Xms4G', '-Xmx12G', '-XX:+UseZGC', '-XX:+ZGenerational',
            '-XX:+EnableDynamicAgentLoading', '-XX:NativeMemoryTracking=summary',
            '-XX:FlightRecorderOptions=stackdepth=256', '-Dsdbf.benchmark=true',
            '-Dfile.encoding=UTF-8',
            '@libraries/net/minecraftforge/forge/1.20.1-47.4.10/win_args.txt', 'nogui']
    print('START', name, flush=True)
    started = time.time()
    write_json(out / 'timing.json', {'processStartEpoch': started})
    failure = None
    completed_at = None
    log_offset = 0
    log_tail = ''
    captured_memory_rounds = set()
    next_resource_check = 0
    with (out / 'console.log').open('w', encoding='utf-8') as console, \
            (out / 'process-memory.jsonl').open('w', encoding='utf-8') as memory:
        process = subprocess.Popen(args, cwd=RUNTIME, stdin=subprocess.PIPE,
                                   stdout=console, stderr=subprocess.STDOUT,
                                   creationflags=subprocess.CREATE_NO_WINDOW)
        tracked = psutil.Process(process.pid)
        write_json(ROOT / 'status.json', {'run': name, 'pid': process.pid, 'state': 'running'})
        while process.poll() is None:
            time.sleep(2)
            if time.time() >= next_resource_check and failure is None:
                next_resource_check = time.time() + 10
                games = external_games()
                if games:
                    failure = 'External Minecraft appeared during measurement; sample excluded'
                    print('STOPPING_CONTAMINATED_TEST', [game['pid'] for game in games], flush=True)
                    process.stdin.write(b'stop\n')
                    process.stdin.flush()
            try:
                info = tracked.memory_info()
                memory.write(json.dumps({'elapsed': time.time() - started, 'rss': info.rss,
                                         'private': getattr(info, 'private', None),
                                         'threads': tracked.num_threads(),
                                         'cpu': list(tracked.cpu_times()[:2]),
                                         'systemCpuPercent': psutil.cpu_percent(),
                                         'availableMemory': psutil.virtual_memory().available}) + '\n')
                memory.flush()
            except psutil.NoSuchProcess:
                pass
            if result_path.exists():
                try:
                    current = json.loads(result_path.read_text(encoding='utf-8'))
                except (ValueError, PermissionError):
                    current = {}
                if current.get('run') == name and (current.get('complete') or current.get('error')):
                    if completed_at is None:
                        completed_at = time.time()
                    if time.time() - completed_at > 300:
                        failure = 'Save/shutdown timeout after probe completed'
                        process.terminate()
                if mode.startswith('memory') and current.get('memoryCheckpoint'):
                    sample = current['memoryCheckpoint']
                    cycle = sample.get('round')
                    if cycle not in captured_memory_rounds:
                        captured_memory_rounds.add(cycle)
                        gc_result = {'run': name, 'round': cycle}
                        try:
                            for operation in ['GC.run', 'GC.heap_info', 'VM.native_memory summary']:
                                diagnostic = subprocess.run([str(JAVA.parent / 'jcmd.exe'), str(process.pid),
                                                             *operation.split()], capture_output=True,
                                                            text=True, errors='replace', timeout=60,
                                                            creationflags=subprocess.CREATE_NO_WINDOW)
                                report = diagnostic.stdout + diagnostic.stderr
                                (out / f'cycle-{cycle:02d}-{operation.split()[0]}.txt').write_text(report, encoding='utf-8')
                                if diagnostic.returncode:
                                    raise RuntimeError(report)
                                if operation == 'GC.run':
                                    time.sleep(5)
                                if operation == 'GC.heap_info':
                                    used = re.search(r'ZHeap\s+used\s+([\d.]+)([KMG])', report)
                                    if used is None:
                                        raise ValueError('Unrecognized ZGC heap diagnostic')
                                    gc_result['heapUsed'] = int(float(used[1]) * {'K': 1024, 'M': 1024**2, 'G': 1024**3}[used[2]])
                        except Exception as error:
                            gc_result['error'] = str(error)
                        write_control_json(RUNTIME / 'migration-gc-result.json', gc_result)
            timeout = 9000 if mode.startswith('memory') else 5400
            if time.time() - started > timeout:
                failure = 'Test timeout'
                process.terminate()
            with (out / 'console.log').open('rb') as reader:
                reader.seek(log_offset)
                recent = reader.read()
                log_offset = reader.tell()
            log_tail = (log_tail + recent.decode('utf-8', errors='replace'))[-8192:]
            if any(x in log_tail for x in ['Failed to start the minecraft server',
                                     'Failed to load registries due to above errors',
                                     "Error in 'ServerEvents.loaded'"]):
                failure = 'Startup or probe failed'
                process.terminate()
        process.wait(timeout=30)
    write_json(out / 'timing.json', {'processStartEpoch': started, 'processEndEpoch': time.time()})
    if result_path.exists():
        shutil.copy2(result_path, out / 'result.json')
    for diagnostic in (RUNTIME / 'debug').rglob('*.jfr') if (RUNTIME / 'debug').exists() else []:
        if diagnostic.stat().st_mtime >= started:
            shutil.copy2(diagnostic, out / diagnostic.name)
    for filename in ['c2me.toml', 'ultraterraforged/server-preset.json']:
        effective = RUNTIME / 'config' / filename
        if effective.exists():
            destination = out / 'effective-config' / filename
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(effective, destination)
    result = json.loads(result_path.read_text(encoding='utf-8')) if result_path.exists() else {}
    final_log = (out / 'console.log').read_text(encoding='utf-8', errors='replace')
    clean_save = 'All dimensions are saved' in final_log
    write_json(out / 'shutdown.json', {'exitCode': process.returncode, 'allDimensionsSaved': clean_save})
    valid = result.get('run') == name and result.get('complete') and failure is None and clean_save
    if not clean_save and failure is None:
        failure = 'Missing clean-save completion marker'
    write_json(ROOT / 'status.json', {'run': name, 'state': 'complete' if valid else 'failed',
                                     'error': failure or result.get('error')})
    print('DONE' if valid else 'FAILED', name, failure or result.get('error', ''), flush=True)
    if not valid:
        raise RuntimeError(name + ': ' + str(failure or result.get('error', 'no result')))
    return out


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--variant', choices=['A', 'B', 'C'], required=True)
    parser.add_argument('--mode', choices=['export', 'smoke', 'throughput', 'memory', 'memory-smoke', 'survey', 'biome-exposure', 'compat', 'client', 'reload'], default='smoke')
    parser.add_argument('--seed', type=int, default=20261107)
    parser.add_argument('--parallelism', type=int)
    parser.add_argument('--disable-gc-patch', action='store_true')
    parser.add_argument('--reuse-world')
    options = parser.parse_args()
    run(options.variant, options.mode, options.seed, options.parallelism, not options.disable_gc_patch, options.reuse_world)
