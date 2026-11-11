"""Summarize native exploration frames and repeated post-GC checkpoints."""
import json
import os
import re
import statistics
from pathlib import Path
import numpy as np
from workspace import ROOT, RUNS, write_json


def client_result(variant):
    data = json.loads((ROOT / 'visuals' / (variant + '-exploration.json')).read_text())
    route = data['route']
    start = route['started']
    end = start + route['samples'][-1]['elapsedMs']
    windows = {}
    samples = []
    for sample in data['samples']:
        frame = sample['window']
        if start + 1000 <= frame['timeMs'] <= end:
            windows[frame['timeMs']] = frame
            samples.append(sample)
    durations = np.array([value / 1e6 for frame in windows.values() for value in frame['frames']])
    if not len(durations):
        raise ValueError('No native frame durations for ' + variant)
    seconds = (end - start) / 1000
    return {'routeSeconds': seconds, 'steps': len(route['samples']),
            'distanceBlocks': 16 * (len(route['samples']) - 1),
            'teleportFailures': sum(sample['result'] != 1 for sample in route['samples']),
            'frameCount': len(durations), 'frameWindows': len(windows),
            'windowActiveFraction': statistics.mean(frame['windowActive'] for frame in windows.values()),
            'weightedFps': float(1000 / durations.mean()),
            'frameMs': {str(percentile): float(np.percentile(durations, percentile))
                        for percentile in [50, 95, 99, 100]},
            'framesAbove50ms': int((durations > 50).sum()),
            'framesAbove100ms': int((durations > 100).sum()),
            'peakRss': max(sample['rss'] for sample in samples),
            'peakPrivate': max(sample['private'] for sample in samples)}


def nmt_categories(path):
    text = path.read_text(encoding='utf-8', errors='replace')
    result = {}
    for name, reserved, committed in re.findall(
            r'^-\s+(.+?)\s+\(reserved=(\d+)KB, committed=(\d+)KB\)', text, re.MULTILINE):
        result[name.strip()] = {'reserved': int(reserved) * 1024, 'committed': int(committed) * 1024}
    return result


def memory_result(name):
    output = RUNS / name
    result = json.loads((output / 'result.json').read_text())
    samples = [row for row in result['memory'] if row['phase'] == 'idle-after-gc']
    if not result['complete'] or len(samples) != 1:
        raise ValueError('Incomplete memory sample set ' + name)
    timing = json.loads((output / 'timing.json').read_text())
    process = [json.loads(line) for line in (output / 'process-memory.jsonl').read_text().splitlines()]
    for row in samples:
        report = nmt_categories(output / f"cycle-{row['round']:02d}-VM.native_memory.txt")
        row['nativeMemory'] = report
    return {'run': name, 'wallMinutes': (timing['processEndEpoch'] - timing['processStartEpoch']) / 60,
            'samples': samples, 'postGcHeapBytes': samples[0]['heapUsed'],
            'peakRss': max(row['rss'] for row in process),
            'peakPrivate': max(row['private'] for row in process),
            'minimumAvailableMemory': min(row['availableMemory'] for row in process)}


def render(memory):
    os.environ['MPLCONFIGDIR'] = str(ROOT / 'plot-cache')
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.font_manager import FontProperties
    font = Path('C:/Windows/Fonts/msyh.ttc')
    if font.exists():
        plt.rcParams['font.family'] = FontProperties(fname=str(font)).get_name()
    plt.rcParams['axes.unicode_minus'] = False
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), layout='constrained')
    variants = ['A', 'B', 'C']
    labels = ['A 旧配置', 'B UTF', 'C UTF+C2MEF']
    colors = ['#667085', '#2b91a9', '#4a9b62']
    axes[0].bar(labels, [memory[variant]['samples'][0]['heapUsed'] / 2**30 for variant in variants], color=colors)
    axes[1].bar(labels, [memory[variant]['samples'][0]['loaded'] for variant in variants], color=colors)
    axes[0].set_ylabel('GC 后 Java 堆占用 GiB')
    axes[1].set_ylabel('已加载 FULL 区块数')
    for axis in axes:
        axis.grid(axis='y', alpha=.2)
        axis.set_axisbelow(True)
    fig.suptitle('生成 64 个新区块，闲置 4 分钟后执行一次 GC')
    fig.savefig(ROOT / 'figures' / 'memory-retention.png', dpi=180)
    plt.close(fig)


def main():
    names = json.loads((ROOT / 'memory-runs.json').read_text())
    clients = {variant: client_result(variant) for variant in ['A', 'B', 'C']}
    memory = {variant: memory_result(names[variant]) for variant in ['A', 'B', 'C']}
    write_json(ROOT / 'client-memory-summary.json', {'clients': clients, 'memory': memory,
        'frameDefinition': 'Native FrameTimer samples from unique complete one-second windows inside the exploration route',
        'memoryDefinition': 'One explicit GC checkpoint after a four-minute idle period. This measures a single retention snapshot.'})
    render(memory)
    print('CLIENT_MEMORY_SUMMARIZED')


if __name__ == '__main__':
    main()
