"""Check saved land coverage and summarize the land-dominant sensitivity case."""
import json
from pathlib import Path
import numpy as np
from analyze_worlds import inspect
from measure_worlds import Collector
from summarize import summarize_run
from workspace import ROOT, RUNS, RUNTIME, write_json


def main():
    names = json.loads((ROOT / 'land-runs.json').read_text())
    results = {}
    for variant, name in names.items():
        inputs = json.loads((RUNS / name / 'inputs.json').read_text())
        collector = Collector(inputs['center'])
        stats, _ = inspect(RUNTIME / ('world-' + name), collect=collector.collect)
        if collector.requested_full != 16129:
            raise ValueError('Incomplete saved land test ' + name)
        row = summarize_run(name)
        row['center'] = inputs['center']
        row['storage'] = stats
        row['targetSeaSurfaceFraction'] = float(((collector.surface == 62) & (collector.floor < 62)).mean())
        row['surfaceMinMax'] = [int(collector.surface.min()), int(collector.surface.max())]
        row['surfaceMedian'] = float(np.median(collector.surface))
        row['nonAirSections'] = collector.non_air_sections
        results[variant] = row
        np.savez_compressed(ROOT / 'world-metrics' / (variant + '-land-heights.npz'),
                            surface=collector.surface, floor=collector.floor)
        print('LAND_ANALYZED', variant, row['seconds'], row['targetSeaSurfaceFraction'], flush=True)
    write_json(ROOT / 'land-summary.json', results)


if __name__ == '__main__':
    main()
