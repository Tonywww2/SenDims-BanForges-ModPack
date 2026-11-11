"""Select a portable, tested C2MEF worker cap for the candidate release."""
import argparse
from workspace import BASELINE, CANDIDATE


def select(cap):
    path = BASELINE / 'config/c2me.toml'
    lines = path.read_text(encoding='utf-8').splitlines()
    section = ''
    for index, line in enumerate(lines):
        if line.strip().startswith('['):
            section = line.strip()
        if line.startswith('defaultGlobalExecutorParallelismExpression ='):
            lines[index] = f'defaultGlobalExecutorParallelismExpression = "max(1, min({cap}, cpus / 2))"'
        if line.startswith('globalExecutorParallelism ='):
            lines[index] = 'globalExecutorParallelism = "default"'
        if line.strip().startswith('gcFreeChunkSerializer ='):
            lines[index] = '\tgcFreeChunkSerializer = false'
        if section == '[noTickViewDistance]' and line.strip().startswith('enabled ='):
            lines[index] = '\tenabled = false'
    target = CANDIDATE / 'config/c2me.toml'
    target.write_text('# SDBF worker cap uses at most half the logical processors, with a minimum of one.\n'
                      + '\n'.join(lines) + '\n', encoding='utf-8')
    print('PROFILE_READY', cap, target)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--cap', type=int, required=True)
    options = parser.parse_args()
    if options.cap < 1:
        raise ValueError('Worker cap must be positive')
    select(options.cap)
