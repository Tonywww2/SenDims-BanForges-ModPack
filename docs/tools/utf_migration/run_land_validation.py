"""Run a land-dominant sensitivity comparison after the primary pipeline exits."""
import json
import shutil
import time
from pathlib import Path
from workspace import ROOT, RUNS, write_json
from run_server import run
from run_validation_pipeline import client_test, completed, read_json

CENTERS = {'A': [13824, 13312], 'B': [6656, 9216], 'C': [6656, 9216]}


def state(phase, **details):
    write_json(ROOT / 'land-status.json', {'phase': phase, 'time': time.time(), **details})
    print('LAND', phase, details, flush=True)


def main():
    state('waiting-for-primary-pipeline')
    while True:
        current = read_json(ROOT / 'pipeline-status.json')
        if current and current['phase'] == 'complete':
            break
        time.sleep(5)
    names = read_json(ROOT / 'land-runs.json') or {}
    for variant, center in CENTERS.items():
        if completed(names.get(variant)):
            continue
        state('running', variant=variant, center=center)
        output = run(variant, 'throughput', 20261107, center=center)
        names[variant] = output.name
        write_json(ROOT / 'land-runs.json', names)
    if not (ROOT / 'formal-a-retake.json').exists():
        state('baseline-first-seed-retake')
        output = run('A', 'throughput', 20261107)
        formal = read_json(ROOT / 'formal-runs.json')
        old = 'A-throughput-20261107-20261109-164903'
        formal[formal.index(old)] = output.name
        write_json(ROOT / 'formal-runs.json', formal)
        write_json(RUNS / old / 'exclusion.json', {
            'reason': 'Superseded performance timing due to prolonged OS available memory below 1GiB. Saved world retained for content/storage inspection only.',
            'replacement': output.name})
        write_json(ROOT / 'formal-a-retake.json', {'run': output.name, 'superseded': old})
        current = read_json(ROOT / 'pipeline-status.json')
        current['formalRuns'] = formal
        write_json(ROOT / 'pipeline-status.json', current)
    if not (ROOT / 'client-retake.json').exists():
        state('client-b-retake')
        previous = read_json(ROOT / 'pipeline-status.json')
        original = ROOT / 'visuals/B-exploration.json'
        shutil.copy2(original, original.with_name('B-exploration-background-limited.json'))
        worlds = read_json(ROOT / 'primary-worlds.json')
        points = read_json(ROOT / 'client-points-ready.json')
        name = client_test('B', Path(worlds['B']), points['B'])
        clients = read_json(ROOT / 'client-tests.json')
        prior_name = clients['B']
        clients['B'] = name
        write_json(ROOT / 'client-tests.json', clients)
        write_json(ROOT / 'client-retake.json', {'variant': 'B', 'run': name, 'superseded': prior_name,
                   'reason': 'ModernUI background 30FPS cap affected the original B route. Test-only inactive cap disabled. A/C original routes were 100% windowActive.'})
        write_json(ROOT / 'pipeline-status.json', previous)
    state('complete', runs=names)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        state('failed', error=str(error))
        raise
