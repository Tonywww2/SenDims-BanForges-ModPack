"""Summarize only completed formal runs and their measured generation windows."""
import json
import re
import statistics
from pathlib import Path
import numpy as np
from workspace import ROOT, RUNS, write_json


def summarize_run(name):
    output = RUNS / name
    inputs = json.loads((output / 'inputs.json').read_text())
    result = json.loads((output / 'result.json').read_text())
    shutdown = json.loads((output / 'shutdown.json').read_text())
    if not result['complete'] or not shutdown['allDimensionsSaved']:
        raise ValueError('Incomplete formal run ' + name)
    task = result['throughput']
    timing = json.loads((output / 'timing.json').read_text())
    memory = [json.loads(line) for line in (output / 'process-memory.jsonl').read_text().splitlines()]
    start, end = task['startedEpochMs'] / 1000, task['finishedEpochMs'] / 1000
    window = [row for row in memory if start <= timing['processStartEpoch'] + row['elapsed'] <= end]
    epochs = [timing['processStartEpoch'] + row['elapsed'] for row in memory]
    cpu = [sum(row['cpu']) for row in memory]
    seconds = task['observedMs'] / 1000
    core_seconds = float(np.interp(end, epochs, cpu) - np.interp(start, epochs, cpu))
    log = (output / 'console.log').read_text(encoding='utf-8', errors='replace')
    workers = re.search(r'worldgen workers: (\d+)', log)
    summary = {'run': name, 'variant': inputs['variant'], 'seed': inputs['seed'],
               'gcPatch': inputs.get('gcPatch', False), 'effectiveC2meWorkers': int(workers[1]) if workers else None,
               'chunks': task['chunks'], 'seconds': seconds, 'fullChunksPerSecond': task['chunks'] / seconds,
               'processCpuCoreSeconds': core_seconds, 'meanProcessCpuCores': core_seconds / seconds,
               'peakGenerationRss': max(row['rss'] for row in window),
               'peakGenerationPrivate': max(row['private'] for row in window),
               'minimumAvailableMemory': min(row['availableMemory'] for row in window),
               'meanSystemCpuPercent': statistics.mean(row['systemCpuPercent'] for row in window),
               'peakGenerationThreads': max(row['threads'] for row in window),
               'cleanSave': True, 'exitCode': shutdown['exitCode']}
    jfr = output / 'jfr-summary.json'
    if jfr.exists():
        data = json.loads(jfr.read_text())
        ticks = [row['average_ms'] for row in data.get('tick_timeline', [])
                 if task['startedEpochMs'] + 20000 <= row['epoch_ms'] <= task['finishedEpochMs']]
        summary['gcPauseMs'] = data['gc_pause_ms']
        summary['sampledAllocationBytesPerSecond'] = data['estimated_allocation_bytes_per_second']
        summary['peakGcHeapSummaryBytes'] = data['peak_gc_heap_summary_bytes']
        if ticks:
            summary['stableSmoothedTickMs'] = {'mean': statistics.mean(ticks), 'median': statistics.median(ticks),
                                               'p95': float(np.percentile(ticks, 95)), 'max': max(ticks)}
    return summary


def main():
    names = json.loads((ROOT / 'formal-runs.json').read_text())
    runs = [summarize_run(name) for name in names]
    groups = {}
    for variant in ['A', 'B', 'C']:
        rows = [row for row in runs if row['variant'] == variant]
        rates = [row['fullChunksPerSecond'] for row in rows]
        if rates:
            groups[variant] = {'runs': len(rows), 'medianFullChunksPerSecond': statistics.median(rates),
                               'minFullChunksPerSecond': min(rates), 'maxFullChunksPerSecond': max(rates),
                               'medianSeconds': statistics.median(row['seconds'] for row in rows)}
    result = {'runs': runs, 'groups': groups,
              'tickDefinition': 'Minecraft one-second smoothed averages, first 20 seconds excluded to remove warm-up carry-over',
              'memoryDefinition': 'OS working set/private bytes are sampled in the generation interval. ZGC heap backing is also reported separately.'}
    write_json(ROOT / 'formal-summary.json', result)
    print(json.dumps(groups, indent=2))


if __name__ == '__main__':
    main()
