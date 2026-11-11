"""Analyze in the deliberately idle checkpoint, then release the native client tests."""
import json
import subprocess
import time
from pathlib import Path
from workspace import JAVA, ROOT, RUNS, SOURCE, write_control_json, write_json


def state(phase, **details):
    write_json(ROOT / 'analysis-status.json', {'phase': phase, 'time': time.time(), **details})
    print('ANALYSIS', phase, details, flush=True)


def main():
    state('waiting-for-idle-checkpoint')
    deadline = time.time() + 43200
    while time.time() < deadline:
        try:
            current = json.loads((ROOT / 'pipeline-status.json').read_text())
        except (FileNotFoundError, ValueError, PermissionError):
            time.sleep(5)
            continue
        if current['phase'] == 'waiting-client-points-ready':
            break
        if current['phase'] == 'failed':
            raise RuntimeError('Validation pipeline failed: ' + str(current))
        time.sleep(5)
    else:
        raise TimeoutError('Idle analysis checkpoint')
    state('jfr')
    builder = ROOT / 'analyzer'
    builder.mkdir(exist_ok=True)
    gson = Path('C:/Users/Tony/AppData/Roaming/PrismLauncher/libraries/com/google/code/gson/gson/2.10/gson-2.10.jar')
    source = SOURCE / 'docs/tools/chunk_performance_bench/AnalyzeJfr.java'
    subprocess.run([str(JAVA.parent / 'javac.exe'), '-encoding', 'UTF-8', '-cp', str(gson),
                    '-d', str(builder), str(source)], check=True, creationflags=subprocess.CREATE_NO_WINDOW)
    names = json.loads((ROOT / 'formal-runs.json').read_text())
    for name in names:
        recordings = list((RUNS / name).glob('*.jfr'))
        if len(recordings) != 1:
            raise ValueError('Expected one recording for ' + name)
        subprocess.run([str(JAVA), '-Xmx2G', '-cp', str(builder) + ';' + str(gson),
                        'AnalyzeJfr', str(recordings[0])], check=True, creationflags=subprocess.CREATE_NO_WINDOW)
    state('saved-worlds')
    from measure_worlds import main as measure
    measure()
    from summarize import main as summarize
    summarize()
    state('figures')
    from render_figures import render
    render()
    points = json.loads((ROOT / 'planned-client-points.json').read_text())
    write_control_json(ROOT / 'client-points-ready.json', points)
    state('complete')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        state('failed', error=str(error))
        raise
