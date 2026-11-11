"""Control the isolated test client through native commands and the capture probe."""
import argparse
import json
import shutil
import subprocess
import time
import psutil
from PIL import Image, UnidentifiedImageError
from workspace import JAVA, ROOT, write_control_json, write_json

CLIENT = ROOT / 'client'


def command(pid, text):
    if psutil.Process(pid).cwd() != str(CLIENT):
        raise RuntimeError('Command target is outside the isolated client instance')
    result = CLIENT / 'native-command-result.txt'
    before = result.stat().st_mtime_ns if result.exists() else 0
    subprocess.run([str(JAVA), '-cp', str(ROOT / 'native-agent'), 'AttachCommand', str(pid),
                    str(ROOT / 'native-agent/native-command-agent.jar'), text], check=True,
                   creationflags=subprocess.CREATE_NO_WINDOW)
    deadline = time.time() + 60
    while time.time() < deadline:
        if result.exists() and result.stat().st_mtime_ns > before:
            value = result.read_text()
            if value.startswith(text + '\n'):
                return value
            raise RuntimeError(value)
        time.sleep(0.2)
    raise TimeoutError(text)


def capture(pid, variant, point):
    name = variant + '-' + point['name']
    text = 'tp SDBFBenchmark {x} {y} {z} {yaw} {pitch}'.format(**point)
    value = command(pid, text)
    if not value.endswith('\n1'):
        raise RuntimeError('Teleport failed: ' + value)
    status = json.loads((CLIENT / 'visual-client-status.json').read_text())
    write_control_json(CLIENT / 'visual-state.json', {'name': name, 'yaw': point['yaw'], 'pitch': point['pitch'],
                                            'readyTick': status['ticks'] + 500})
    deadline = time.time() + 180
    telemetry = []
    while time.time() < deadline:
        process = psutil.Process(pid)
        memory = process.memory_info()
        telemetry.append({'time': time.time(), 'rss': memory.rss, 'private': getattr(memory, 'private', None),
                          'cpu': list(process.cpu_times()[:2])})
        path = CLIENT / 'visual-captured.json'
        if path.exists():
            try:
                data = json.loads(path.read_text())
            except (ValueError, PermissionError):
                time.sleep(0.5)
                continue
            screenshot = CLIENT / 'screenshots' / (name + '.png')
            if data['name'] == name and screenshot.exists():
                try:
                    with Image.open(screenshot) as picture:
                        picture.verify()
                except (OSError, UnidentifiedImageError, SyntaxError):
                    time.sleep(0.5)
                    continue
                output = ROOT / 'visuals'
                output.mkdir(exist_ok=True)
                shutil.copy2(screenshot, output / screenshot.name)
                write_json(output / (name + '.json'), {'camera': point, 'capture': data, 'process': telemetry})
                print('CAPTURED', name, data.get('rendered'), flush=True)
                return
        time.sleep(1)
    raise TimeoutError(name)


def route(pid, variant):
    name = variant + '-exploration'
    write_control_json(CLIENT / 'visual-state.json', {'name': name + '-live', 'yaw': -90, 'pitch': 8,
                                            'readyTick': 1000000000})
    write_control_json(CLIENT / 'visual-route.json', {'name': name, 'x': 65536, 'y': 150, 'z': 65536,
                                             'blocksPerStep': 16, 'steps': 90})
    samples = []
    deadline = time.time() + 900
    while time.time() < deadline:
        try:
            result = json.loads((CLIENT / 'visual-route-result.json').read_text())
        except (FileNotFoundError, ValueError, PermissionError):
            result = {}
        frame = CLIENT / 'visual-frame-window.json'
        if frame.exists():
            try:
                window = json.loads(frame.read_text())
                process = psutil.Process(pid)
                info = process.memory_info()
                samples.append({'time': time.time(), 'window': window, 'rss': info.rss,
                                'private': getattr(info, 'private', None), 'cpu': list(process.cpu_times()[:2])})
            except (ValueError, PermissionError):
                pass
        if result.get('name') == name and result.get('complete'):
            output = ROOT / 'visuals'
            output.mkdir(exist_ok=True)
            write_json(output / (name + '.json'), {'route': result, 'samples': samples})
            if result.get('error'):
                raise RuntimeError(result['error'])
            print('ROUTE_COMPLETE', name, result['samples'][-1]['elapsedMs'], flush=True)
            return
        time.sleep(1)
    raise TimeoutError(name)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--points', required=True)
    parser.add_argument('--exit', action='store_true')
    parser.add_argument('--route', action='store_true')
    options = parser.parse_args()
    status = json.loads((ROOT / 'client-status.json').read_text())
    command(status['pid'], 'gamemode spectator SDBFBenchmark')
    for point in json.loads(open(options.points, encoding='utf-8').read()):
        capture(status['pid'], status['variant'], point)
    if options.route:
        route(status['pid'], status['variant'])
    if options.exit:
        write_control_json(CLIENT / 'visual-state.json', {'exit': True})
