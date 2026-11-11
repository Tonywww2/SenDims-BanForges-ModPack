"""Detach the approved one-off test runner from the interactive command session."""
import ctypes
import argparse
from ctypes import wintypes
import subprocess
import sys
import time
from pathlib import Path
from workspace import ROOT, SOURCE, write_json


def launch(worker):
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.GetCurrentProcess.restype = wintypes.HANDLE
    kernel.IsProcessInJob.argtypes = [wintypes.HANDLE, wintypes.HANDLE, ctypes.POINTER(wintypes.BOOL)]
    in_job = wintypes.BOOL()
    if not kernel.IsProcessInJob(kernel.GetCurrentProcess(), None, ctypes.byref(in_job)):
        raise ctypes.WinError(ctypes.get_last_error())
    flags = subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP
    if in_job.value:
        flags |= subprocess.CREATE_BREAKAWAY_FROM_JOB
    log = ROOT / (worker + '-background-' + time.strftime('%Y%m%d-%H%M%S') + '.log')
    filename = {'pipeline': 'run_validation_pipeline.py', 'analysis': 'analyze_when_ready.py',
                'land': 'run_land_validation.py'}[worker]
    script = Path(__file__).with_name(filename).resolve()
    with log.open('w', encoding='utf-8') as console:
        process = subprocess.Popen([sys.executable, '-X', 'utf8', '-u', str(script)],
                                   cwd=SOURCE, stdin=subprocess.DEVNULL, stdout=console,
                                   stderr=subprocess.STDOUT, creationflags=flags)
    metadata = 'runner.json' if worker == 'pipeline' else worker + '-runner.json'
    write_json(ROOT / metadata, {'pid': process.pid, 'startedEpoch': time.time(),
                                     'console': str(log), 'breakaway': bool(in_job.value)})
    print('BACKGROUND_RUNNER', process.pid, log, flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--worker', choices=['pipeline', 'analysis', 'land'], default='pipeline')
    launch(parser.parse_args().worker)
