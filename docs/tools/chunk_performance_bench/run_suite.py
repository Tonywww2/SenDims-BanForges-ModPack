"""Run fixed-seed world-generation comparisons in the isolated Forge copy."""
import argparse
import json
import json5
import re
import shutil
import subprocess
import time
import zipfile
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[3]
BENCH = SOURCE / 'docs/archive/chunk-performance-2026-11-07/bench'
OUTPUT = BENCH.parent / 'runs'
JAVA = Path('C:/Program Files/Java/graalvm-jdk-21.0.5+9.1/bin/java.exe')
TERRALITH = 'Terralith_1.20.x_v2.5.4.jar'
SCENARIOS = {
    'baseline': {},
    'no_tectonic': {'tectonic': False},
    'no_terralith': {'terralith': False},
    'no_ru_regions': {'ru': False},
    'no_mod_structures': {'structures': 'all'},
    'no_ati_structures': {'structures': 'ati_structures'},
    'no_dungeons_structures': {'structures': 'dungeons_arise'},
    'no_ae2_structures': {'structures': 'ae2'},
    'terrain_base': {'tectonic': False, 'terralith': False, 'ru': False, 'structures': 'all'},
    'baseline_repeat': {},
    'terrain_ae2_off': {'tectonic': False, 'remove_tectonic': True},
    'terrain_ultra': {'tectonic': False, 'remove_tectonic': True, 'replacement': 'ultra',
                      'world_type': 'ultraterraforged:ultraterraforged'},
    'terrain_reimagined': {'tectonic': False, 'remove_tectonic': True,
                           'replacement': 'reimagined', 'world_type': 'terraforged:normal'},
    'ultra_height_384': {'tectonic': False, 'remove_tectonic': True, 'replacement': 'ultra',
                         'world_type': 'ultraterraforged:ultraterraforged',
                         'mode': 'height_survey', 'height_limit': 384},
    'ultra_height_320': {'tectonic': False, 'remove_tectonic': True, 'replacement': 'ultra',
                         'world_type': 'ultraterraforged:ultraterraforged',
                         'mode': 'height_survey', 'height_limit': 320},
    'place_keep_kayra_slo': {'structures': 'all', 'mode': 'structure_placement',
                            'target': 'dungeons_arise:keep_kayra', 'optimizer': True},
    'place_keep_kayra': {'structures': 'all', 'mode': 'structure_placement',
                         'target': 'dungeons_arise:keep_kayra'},
    'place_ati_steam_house': {'structures': 'all', 'mode': 'structure_placement',
                            'target': 'ati_structures:steam_house'},
}


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')


def without_terralith(value):
    if isinstance(value, list):
        return [without_terralith(item) for item in value
                if not isinstance(item, str) or not item.startswith('terralith:')]
    if isinstance(value, dict):
        return {key: without_terralith(item) for key, item in value.items()}
    return value


def configure(name):
    settings = SCENARIOS[name]
    downloads = BENCH.parent / 'terrain-replacements'
    if settings.get('mode') == 'height_survey':
        preset_path = BENCH / 'config/ultraterraforged/server-preset.json'
        saved_preset = downloads / 'height-survey-original-server-preset.json'
        if not saved_preset.exists():
            shutil.copy2(preset_path, saved_preset)
        preset = json.loads(saved_preset.read_text(encoding='utf-8'))
        preset['world']['properties']['worldHeight'] = settings['height_limit']
        write_json(preset_path, preset)
    elif settings.get('replacement') == 'ultra':
        saved_preset = downloads / 'height-survey-original-server-preset.json'
        if saved_preset.exists():
            shutil.copy2(saved_preset, BENCH / 'config/ultraterraforged/server-preset.json')
    for key, filename in [('ultra', 'ultraterraforged-benchmark.jar'),
                          ('reimagined', 'terraforged-reimagined-benchmark.jar')]:
        target = BENCH / 'mods' / filename
        if target.exists():
            target.unlink()
        if settings.get('replacement') == key:
            shutil.copy2(downloads / (key + '.jar'), target)
    optimizer = BENCH / 'mods/structure_layout_optimizer-forge-1.0.11.jar'
    if optimizer.exists():
        optimizer.unlink()
    if settings.get('optimizer'):
        shutil.copy2(downloads / optimizer.name, optimizer)
    tectonic_jar = BENCH / 'mods/tectonic-3.0.17-forge-1.20.1.jar'
    removed_tectonic = tectonic_jar.with_suffix('.jar.scenario-disabled')
    if settings.get('remove_tectonic') and tectonic_jar.exists():
        tectonic_jar.rename(removed_tectonic)
    if not settings.get('remove_tectonic') and removed_tectonic.exists():
        removed_tectonic.rename(tectonic_jar)
    meteorite = Path('kubejs/data/ae2/worldgen/structure_set/meteorite.json')
    if (SOURCE / meteorite).exists():
        (BENCH / meteorite).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(SOURCE / meteorite, BENCH / meteorite)
    common_path = Path('kubejs/config/common.properties')
    common = (SOURCE / common_path).read_text(encoding='utf-8')
    if settings.get('mode') == 'structure_placement':
        common = common.replace('allowAsyncStreams=true', 'allowAsyncStreams=false')
    (BENCH / common_path).write_text(common, encoding='utf-8')
    generated_manifest = BENCH / 'generated-structure-overrides.json'
    if generated_manifest.exists():
        for relative_string in json.loads(generated_manifest.read_text(encoding='utf-8')):
            relative = Path(relative_string)
            target = (BENCH / 'kubejs/data' / relative).resolve()
            assert target.is_relative_to((BENCH / 'kubejs/data').resolve())
            original = SOURCE / 'kubejs/data' / relative
            if original.exists():
                shutil.copy2(original, target)
            elif target.exists():
                target.unlink()
    tectonic_path = Path('config/tectonic.json')
    tectonic = json.loads((SOURCE / tectonic_path).read_text(encoding='utf-8'))
    tectonic['general']['mod_enabled'] = settings.get('tectonic', True)
    write_json(BENCH / tectonic_path, tectonic)
    ru_path = Path('config/regions_unexplored/ru-common.toml')
    ru = (SOURCE / ru_path).read_text(encoding='utf-8')
    if not settings.get('ru', True):
        ru = re.sub(r'((?:primary|secondary|rare)_region_weight\s*=\s*)\d+', r'\g<1>0', ru)
    (BENCH / ru_path).write_text(ru, encoding='utf-8')
    active = BENCH / 'mods' / TERRALITH
    inactive = active.with_suffix('.jar.scenario-disabled')
    if settings.get('terralith', True) and inactive.exists():
        inactive.rename(active)
    if not settings.get('terralith', True) and active.exists():
        active.rename(inactive)
    foreign_paths = [
        Path('kubejs/data/sdbf/tags/worldgen/biome/netherman_overworld_only.json'),
        Path('kubejs/data/sdbf/tags/worldgen/biome/netherman_overworld_taiga_only.json'),
        Path('kubejs/data/kubejs/worldgen/biome/fourth_layer_gravel_desert.json'),
    ]
    for relative in foreign_paths:
        value = json.loads((SOURCE / relative).read_text(encoding='utf-8-sig'))
        if not settings.get('terralith', True):
            value = without_terralith(value)
        write_json(BENCH / relative, value)
    if 'structures' not in settings:
        write_json(generated_manifest, [])
        return {'settings': settings, 'disabled_structure_sets': []}
    # Build overrides only for the structures disabled by this variant.
    structure_sets = {}
    for jar in (SOURCE / 'mods').glob('*.jar'):
        if jar.name == TERRALITH and not settings.get('terralith', True):
            continue
        with zipfile.ZipFile(jar) as archive:
            for resource in archive.namelist():
                parts = resource.split('/')
                if (len(parts) >= 5 and parts[0] == 'data'
                        and parts[2:4] == ['worldgen', 'structure_set']
                        and resource.endswith('.json')):
                    structure_sets[Path(*parts[1:])] = json5.loads(archive.read(resource).decode('utf-8-sig'))
    for path in (SOURCE / 'kubejs/data').glob('*/worldgen/structure_set/**/*.json'):
        structure_sets[path.relative_to(SOURCE / 'kubejs/data')] = json.loads(
            path.read_text(encoding='utf-8-sig'))
    disabled = []
    for relative, value in structure_sets.items():
        namespace = relative.parts[0]
        selected = settings.get('structures')
        if (namespace != 'minecraft' and selected in ['all', namespace]
                and value.get('placement', {}).get('type') == 'minecraft:random_spread'):
            value['placement']['frequency'] = 0.0
            disabled.append(str(relative))
            write_json(BENCH / 'kubejs/data' / relative, value)
    write_json(generated_manifest, disabled)
    return {'settings': settings, 'disabled_structure_sets': disabled}


def run(name, size):
    stamp = time.strftime('%Y%m%d-%H%M%S')
    run_name = name + '-' + stamp
    out = OUTPUT / run_name
    out.mkdir(parents=True)
    controls = configure(name)
    seed = 20261107
    areas = [
        {'name': 'north-east', 'x': 1024, 'z': 1024, 'size': size},
        {'name': 'south-east', 'x': 2048, 'z': -1024, 'size': size},
        {'name': 'north-west', 'x': -2048, 'z': 1024, 'size': size},
    ]
    config = {'scenario': run_name, 'seed': seed, 'areas': areas}
    if controls['settings'].get('mode'):
        config['mode'] = controls['settings']['mode']
    if controls['settings'].get('mode') == 'structure_placement':
        config.update(mode='structure_placement', target=controls['settings']['target'])
    probe = {'structure_placement': 'structure_probe.js',
             'height_survey': 'height_survey.js'}.get(config.get('mode'), 'chunk_probe.js')
    shutil.copy2(Path(__file__).parent / probe,
                 BENCH / 'kubejs/server_scripts/zz_sdbf_perf_probe.js')
    write_json(BENCH / 'benchmark-config.json', config)
    properties = (BENCH / 'server.properties').read_text(encoding='utf-8')
    properties = re.sub(r'^level-name=.*$', 'level-name=benchmark-' + run_name,
                        properties, flags=re.MULTILINE)
    world_type = controls['settings'].get('world_type', 'minecraft:normal')
    properties = re.sub(r'^level-type=.*$', 'level-type=' + world_type,
                        properties, flags=re.MULTILINE)
    (BENCH / 'server.properties').write_text(properties, encoding='utf-8')
    # Preserve earlier probe results instead of allowing stale success detection.
    result_path = BENCH / 'benchmark-result.json'
    if result_path.exists():
        result_path.rename(out / 'preceding-result.json')
    write_json(out / 'controls.json', controls)
    write_json(out / 'workload.json', config)
    started = time.time()
    jfr_before = set((BENCH / 'debug').rglob('*.jfr'))
    args = [str(JAVA), '-Xms4G', '-Xmx10G', '-XX:+UseZGC', '-XX:+ZGenerational',
            '-XX:+EnableDynamicAgentLoading', '-XX:FlightRecorderOptions=stackdepth=256',
            '-Dsdbf.benchmark=true', '-Dfile.encoding=UTF-8',
            '@libraries/net/minecraftforge/forge/1.20.1-47.4.10/win_args.txt', 'nogui']
    print('START', run_name, flush=True)
    with (out / 'console.log').open('w', encoding='utf-8') as console:
        process = subprocess.Popen(args, cwd=BENCH, stdin=subprocess.PIPE,
                                   stdout=console, stderr=subprocess.STDOUT,
                                   creationflags=subprocess.CREATE_NO_WINDOW)
        write_json(OUTPUT / 'status.json', {'run': run_name, 'pid': process.pid, 'state': 'running'})
        completed_at = None
        failure = None
        while process.poll() is None:
            time.sleep(2)
            if result_path.exists():
                try:
                    result = json.loads(result_path.read_text(encoding='utf-8'))
                except (ValueError, PermissionError):
                    continue
                if result.get('scenario') == run_name and (result.get('complete') or result.get('error')):
                    if completed_at is None:
                        completed_at = time.time()
                        print('RESULT', run_name, result.get('complete'), result.get('error', ''), flush=True)
                    if time.time() - completed_at > 75:
                        process.terminate()
                        break
            limit = 1800 if config.get('mode') else 900
            if time.time() - started > limit:
                failure = 'Test exceeded time limit'
                process.terminate()
                break
            log = (out / 'console.log').read_text(encoding='utf-8', errors='replace')
            if any(marker in log for marker in [
                    'Failed to start the minecraft server', 'Failed to load registries due to above errors',
                    'Error in \'ServerEvents.loaded\'']):
                failure = 'Startup or probe event failed; see console.log'
                process.terminate()
                break
        try:
            process.wait(timeout=20)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
    if result_path.exists():
        shutil.copy2(result_path, out / 'result.json')
    for path in set((BENCH / 'debug').rglob('*.jfr')) - jfr_before:
        shutil.copy2(path, out / path.name)
    if (BENCH / 'logs/latest.log').exists():
        shutil.copy2(BENCH / 'logs/latest.log', out / 'latest.log')
    result = json.loads((out / 'result.json').read_text(encoding='utf-8')) if (out / 'result.json').exists() else {}
    valid = result.get('complete') and result.get('scenario') == run_name and failure is None
    write_json(OUTPUT / 'status.json', {'run': run_name, 'state': 'complete' if valid else 'failed', 'error': failure})
    if not valid:
        raise RuntimeError(f'{run_name}: {failure or result.get("error") or "missing result"}')
    elapsed = sum(area['wallMs'] for area in result['areas']) / 1000
    requests = sum(len(area['requests']) for area in result['areas'])
    print('DONE', run_name, requests, 'FULL requests', round(elapsed, 3), 'seconds', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--scenarios', nargs='+', choices=SCENARIOS, default=list(SCENARIOS))
    parser.add_argument('--size', type=int, default=12)
    options = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for scenario in options.scenarios:
        run(scenario, options.size)
