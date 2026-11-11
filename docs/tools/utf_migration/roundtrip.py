"""Save, reopen and compare fixed already-generated chunks through native Forge."""
import argparse
from pathlib import Path
from analyze_worlds import selected_chunks
from run_server import run
from workspace import ROOT, RUNTIME, write_json


def verify(variant, world_name, parallelism=None):
    positions = [(1000 + x * 16, 1000 + z * 16) for z in range(4) for x in range(4)] + [(129, 0)]
    world = RUNTIME / world_name
    if world.resolve().parent != RUNTIME.resolve():
        raise ValueError('World outside the test runtime')
    before = selected_chunks(world, positions)
    output = run(variant, 'reload', 20261107, parallelism, reuse_world=world_name)
    after = selected_chunks(world, positions)
    changes = {position: [key for key in before[position] if before[position][key] != after[position][key]]
               for position in before if before[position] != after[position]}
    content_changes = {position: [key for key in fields if key != 'light']
                       for position, fields in changes.items() if any(key != 'light' for key in fields)}
    write_json(output / 'roundtrip-content.json', {'world': world_name, 'before': before, 'after': after,
                                                 'changes': changes, 'identical': not changes,
                                                 'contentChanges': content_changes, 'contentIdentical': not content_changes,
                                                 'lightingChangedChunks': sum('light' in fields for fields in changes.values())})
    print('ROUNDTRIP', variant, 'content identical' if not content_changes else content_changes, flush=True)
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--variant', choices=['A', 'B', 'C'], required=True)
    parser.add_argument('--world', required=True)
    parser.add_argument('--parallelism', type=int)
    options = parser.parse_args()
    verify(options.variant, options.world, options.parallelism)
