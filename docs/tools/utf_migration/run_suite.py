"""Sequential test batches. Only one measured Minecraft JVM runs at a time."""
import argparse
import json
import time
import traceback
import psutil
from workspace import ROOT, write_json
from run_server import run


def wait_for_client():
    status = ROOT / 'client-status.json'
    if not status.exists():
        return
    pid = json.loads(status.read_text())['pid']
    deadline = time.time() + 900
    while psutil.pid_exists(pid):
        process = psutil.Process(pid)
        if process.cwd() != str(ROOT / 'client'):
            return
        if time.time() > deadline:
            raise TimeoutError('Visual client still running')
        time.sleep(5)


def main(batch):
    wait_for_client()
    if batch == 'compat':
        plan = [('B', 'smoke', 20261107, None), ('C', 'smoke', 20261107, None),
                ('C', 'compat', 20261107, 8)]
    elif batch == 'parallelism':
        plan = [('C', 'throughput', 20261107, count) for count in [4, 6, 8]]
    elif batch == 'integration':
        plan = [('C', 'compat', 20261107, 8)] + [('C', 'throughput', 20261107, count) for count in [4, 6, 8]]
    elif batch == 'formal':
        plan = [(variant, 'throughput', seed, 8 if variant == 'C' else None)
                for seed in [20261107, 1111, 2222] for variant in ['A', 'B', 'C']]
    elif batch == 'memory':
        plan = [(variant, 'memory', 20261107, 8 if variant == 'C' else None) for variant in ['A', 'B', 'C']]
    else:
        plan = [('A', 'survey', 20261107, None)]
    results = []
    for variant, mode, seed, parallelism in plan:
        try:
            output = run(variant, mode, seed, parallelism)
            results.append({'run': output.name, 'success': True})
        except Exception as error:
            results.append({'variant': variant, 'mode': mode, 'error': str(error)})
            write_json(ROOT / ('suite-' + batch + '.json'), results)
            traceback.print_exc()
            raise
        write_json(ROOT / ('suite-' + batch + '.json'), results)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('batch', choices=['compat', 'parallelism', 'integration', 'formal', 'memory', 'survey'])
    main(parser.parse_args().batch)
