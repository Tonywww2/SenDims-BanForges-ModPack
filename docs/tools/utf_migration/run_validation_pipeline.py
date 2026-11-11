"""Run the approved comparison sequentially, with review checkpoints for terrain and cameras."""
import json
import shutil
import time
from pathlib import Path
import psutil
from workspace import CANDIDATE, ROOT, RUNS, RUNTIME, sha256, write_control_json, write_json
from run_server import run
from run_suite import wait_for_client
from run_client import CLIENT, launch
from control_client import capture, command, route
from roundtrip import verify


def read_json(path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (FileNotFoundError, ValueError, PermissionError):
        return None


def phase(name, **details):
    write_json(ROOT / 'pipeline-status.json', {'phase': name, 'time': time.time(), **details})
    print('PHASE', name, details, flush=True)


def wait_marker(name):
    phase('waiting-' + name)
    deadline = time.time() + 43200
    while time.time() < deadline:
        data = read_json(ROOT / (name + '.json'))
        if data:
            return data
        time.sleep(5)
    raise TimeoutError(name)


def manifest():
    return {path.relative_to(CANDIDATE).as_posix(): sha256(path)
            for path in sorted(CANDIDATE.rglob('*')) if path.is_file()}


def completed(name):
    if not name:
        return False
    result = read_json(RUNS / name / 'result.json')
    shutdown = read_json(RUNS / name / 'shutdown.json')
    excluded = (RUNS / name / 'exclusion.json').exists()
    return bool(not excluded and result and result.get('complete') and shutdown
                and shutdown.get('allDimensionsSaved') and shutdown.get('exitCode') == 0)


def client_test(variant, world, points):
    phase('client', variant=variant)
    previous = read_json(ROOT / 'client-status.json')
    existing = bool(previous and previous.get('variant') == variant and psutil.pid_exists(previous['pid'])
                    and Path(psutil.Process(previous['pid']).cwd()).resolve() == CLIENT.resolve())
    if not existing:
        launch(variant, world)
    status = read_json(ROOT / 'client-status.json')
    pid = status['pid']
    deadline = time.time() + 600
    while time.time() < deadline:
        server = read_json(CLIENT / 'visual-server-result.json')
        error = read_json(CLIENT / 'visual-client-error.json')
        if error or (server and server.get('error')):
            raise RuntimeError(str(error or server))
        if server and server.get('complete') and read_json(CLIENT / 'visual-client-status.json'):
            break
        if not psutil.pid_exists(pid):
            raise RuntimeError('Visual client exited before readiness')
        time.sleep(2)
    else:
        raise TimeoutError('Visual client readiness')
    if server['island'].get('createResult') != 1 or server['island'].get('joinResult') != 1:
        raise RuntimeError('Native team-island creation did not pass: ' + str(server['island']))
    command(pid, 'gamemode spectator SDBFBenchmark')
    for point in points:
        if point.get('nightVision'):
            command(pid, 'effect give SDBFBenchmark minecraft:night_vision 99999 0 true')
        capture(pid, variant, point)
    command(pid, 'effect clear SDBFBenchmark')
    route(pid, variant)
    write_control_json(CLIENT / 'visual-state.json', {'exit': True})
    deadline = time.time() + 300
    while psutil.pid_exists(pid):
        if time.time() > deadline:
            raise TimeoutError('Visual client save/shutdown')
        time.sleep(2)
    output = Path(status['run'])
    for filename in ['visual-server-result.json', 'visual-route-result.json', 'visual-captured.json']:
        shutil.copy2(CLIENT / filename, output / filename)
    print('CLIENT_DONE', variant, output.name, flush=True)
    return output.name


def main():
    formal_checkpoint = read_json(ROOT / 'formal-runs.json') or []
    roundtrip_checkpoint = read_json(ROOT / 'roundtrip-runs.json') or {}
    client_checkpoint = (len(formal_checkpoint) == 9 and all(completed(name) for name in formal_checkpoint)
                         and len(roundtrip_checkpoint) == 3
                         and all(completed(name) for name in roundtrip_checkpoint.values())
                         and read_json(ROOT / 'client-points-ready.json'))
    if not client_checkpoint:
        wait_for_client()
    previous = read_json(ROOT / 'status.json')
    if previous and previous.get('state') == 'running' and psutil.pid_exists(previous['pid']):
        process = psutil.Process(previous['pid'])
        if Path(process.cwd()).resolve() == RUNTIME.resolve():
            raise RuntimeError('Another server test is running')
    baseline = read_json(ROOT / 'pipeline-baseline-survey.json')
    if not baseline or not completed(baseline.get('run')):
        phase('baseline-survey')
        survey = run('A', 'survey', 20261107)
        write_json(ROOT / 'pipeline-baseline-survey.json', {'run': survey.name})
    ready = wait_marker('final-candidate-ready')
    frozen = manifest()
    if ready.get('files') != frozen:
        raise RuntimeError('Candidate differs from the reviewed manifest')
    selected = int(ready['selectedParallelism'])
    regression = read_json(ROOT / 'pipeline-regression.json')
    if not regression:
        for output in sorted(RUNS.glob('C-throughput-20261107-*'), reverse=True):
            inputs = read_json(output / 'inputs.json')
            if (inputs and inputs.get('gcPatch') is False and inputs.get('parallelism') == selected
                    and completed(output.name)):
                regression = {'run': output.name}
                break
    if not regression or not completed(regression.get('run')):
        phase('unpatched-regression', parallelism=selected)
        output = run('C', 'throughput', 20261107, selected, gc_patch=False)
        regression = {'run': output.name}
    write_json(ROOT / 'pipeline-regression.json', regression)
    primary_worlds = {}
    formal = [name for name in (read_json(ROOT / 'formal-runs.json') or []) if completed(name)]
    prior = {}
    for name in formal:
        inputs = read_json(RUNS / name / 'inputs.json')
        prior[(inputs['variant'], inputs['seed'])] = name
    for seed in [20261107, 1111, 2222]:
        for variant in ['A', 'B', 'C']:
            if manifest() != frozen:
                raise RuntimeError('Candidate changed during the formal comparison')
            name = prior.get((variant, seed))
            if name:
                print('REUSE_FORMAL', name, flush=True)
            else:
                phase('formal', variant=variant, seed=seed)
                output = run(variant, 'throughput', seed)
                name = output.name
                formal.append(name)
            write_json(ROOT / 'formal-runs.json', formal)
            if seed == 20261107:
                primary_worlds[variant] = RUNTIME / ('world-' + name)
    phase('roundtrip')
    roundtrips = read_json(ROOT / 'roundtrip-runs.json') or {}
    for variant, world in primary_worlds.items():
        prior_roundtrip = roundtrips.get(variant)
        if prior_roundtrip and completed(prior_roundtrip):
            continue
        output = verify(variant, world.name)
        result = read_json(output / 'roundtrip-content.json')
        if not result['contentIdentical']:
            raise RuntimeError('Round-trip content changed: ' + str(output))
        roundtrips[variant] = output.name
        write_json(ROOT / 'roundtrip-runs.json', roundtrips)
    write_json(ROOT / 'primary-worlds.json', {key: str(value) for key, value in primary_worlds.items()})
    points = wait_marker('client-points-ready')
    clients = read_json(ROOT / 'client-tests.json') or {}
    for variant, world in primary_worlds.items():
        if variant not in clients:
            clients[variant] = client_test(variant, world, points[variant])
            write_json(ROOT / 'client-tests.json', clients)
    smoke = read_json(ROOT / 'pipeline-memory-smoke.json') or {}
    if not completed(smoke.get('run')):
        phase('memory-protocol-smoke')
        output = run('C', 'memory-smoke', 20261107)
        write_json(ROOT / 'pipeline-memory-smoke.json', {'run': output.name})
    memory = read_json(ROOT / 'memory-runs.json') or {}
    for variant in ['A', 'B', 'C']:
        if not completed(memory.get(variant)):
            phase('memory', variant=variant)
            output = run(variant, 'memory', 20261107)
            memory[variant] = output.name
            write_json(ROOT / 'memory-runs.json', memory)
    phase('complete', formalRuns=formal)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        phase('failed', error=str(error))
        raise
