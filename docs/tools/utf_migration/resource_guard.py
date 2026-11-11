"""Keep the user's game separate from disposable benchmark JVMs."""
import json
import time
from pathlib import Path
import psutil
from workspace import ROOT, RUNTIME, write_json


def external_games():
    result = []
    owned = {RUNTIME.resolve(), (ROOT / 'client').resolve()}
    for process in psutil.process_iter(['pid', 'name']):
        if (process.info['name'] or '').lower() not in ['java.exe', 'javaw.exe']:
            continue
        try:
            directory = Path(process.cwd()).resolve()
            if directory in owned:
                continue
            arguments = process.cmdline()
            game = any(marker in argument for argument in arguments for marker in [
                'org.prismlauncher.EntryPoint', 'net.minecraft.client.main.Main',
                'io.github.zekerzhayard.forgewrapper.installer.Main', 'forgeclient'])
            if game:
                result.append({'pid': process.pid, 'cwd': str(directory), 'rss': process.memory_info().rss})
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return result


def wait_for_isolation():
    waiting = False
    while True:
        games = external_games()
        if not games:
            if waiting:
                write_json(ROOT / 'resource-wait.json', {'waiting': False, 'time': time.time()})
            return
        write_json(ROOT / 'resource-wait.json', {'waiting': True, 'time': time.time(), 'games': games})
        if not waiting:
            print('WAITING_FOR_EXTERNAL_GAME', [game['pid'] for game in games], flush=True)
            waiting = True
        time.sleep(5)
