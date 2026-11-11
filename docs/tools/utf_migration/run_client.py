"""Launch an offline, isolated Forge client using cached Prism libraries."""
import argparse
import json
import re
import shutil
import subprocess
import time
import uuid
import zipfile
from pathlib import Path
import psutil
from workspace import BASELINE, CANDIDATE, C2ME, JAVA, ROOT, RUNS, SOURCE, TECTONIC, UTF, write_json
from resource_guard import wait_for_isolation

PRISM = Path('C:/Users/Tony/AppData/Roaming/PrismLauncher')
CLIENT = ROOT / 'client'
TOOLS = Path(__file__).resolve().parent


def coordinate_path(coordinate):
    fields = coordinate.split(':')
    group, artifact, version = fields[:3]
    classifier = '-' + fields[3] if len(fields) > 3 else ''
    return Path(group.replace('.', '/')) / artifact / version / f'{artifact}-{version}{classifier}.jar'


def allowed(library):
    rules = library.get('rules')
    if rules is None:
        return True
    enabled = False
    for rule in rules:
        system = rule.get('os', {})
        if system.get('name', 'windows') != 'windows':
            continue
        if system.get('arch', 'x86_64') not in ['x86_64', 'amd64']:
            continue
        enabled = rule['action'] == 'allow'
    return enabled


def prepare(variant, world):
    CLIENT.mkdir(parents=True, exist_ok=True)
    for folder in ['mods', 'config', 'defaultconfigs', 'kubejs', 'hotai']:
        target = (CLIENT / folder).resolve()
        assert target.parent == CLIENT.resolve() and CLIENT.resolve().is_relative_to(ROOT.resolve())
        if target.exists():
            shutil.rmtree(target)
        if (BASELINE / folder).exists():
            shutil.copytree(BASELINE / folder, target)
    # This duplicate is present in the source pack alongside the newer -A build.
    duplicate = CLIENT / 'mods/carbon-1.20.1.9.jar'
    if duplicate.exists():
        duplicate.rename(duplicate.with_suffix('.jar.test-disabled'))
    if variant != 'A':
        (CLIENT / 'mods' / TECTONIC).rename(CLIENT / 'mods' / (TECTONIC + '.test-disabled'))
        shutil.copy2(CANDIDATE / UTF, CLIENT / 'mods' / UTF)
        shutil.copytree(CANDIDATE / 'config', CLIENT / 'config', dirs_exist_ok=True)
        shutil.copytree(CANDIDATE / 'kubejs/data', CLIENT / 'kubejs/data', dirs_exist_ok=True)
    if variant == 'C':
        shutil.copy2(CANDIDATE / C2ME, CLIENT / 'mods' / C2ME)
        if (CANDIDATE / 'hotai').exists():
            shutil.copytree(CANDIDATE / 'hotai', CLIENT / 'hotai', dirs_exist_ok=True)
        text = (CLIENT / 'config/c2me.toml').read_text(encoding='utf-8')
        text = re.sub(r'(?m)^\s*gcFreeChunkSerializer = .*$', '\tgcFreeChunkSerializer = false', text)
        text = text.replace('[noTickViewDistance]\n', '[noTickViewDistance]\n')
        section = re.search(r'(?ms)^\[noTickViewDistance\].*?(?=^\[|\Z)', text)
        text = text[:section.start()] + re.sub(r'(?m)^\s*enabled = .*$', '\tenabled = false', section[0]) + text[section.end():]
        (CLIENT / 'config/c2me.toml').write_text(text, encoding='utf-8')
    modernui = CLIENT / 'config/ModernUI/client.toml'
    text = modernui.read_text(encoding='utf-8')
    text = re.sub(r'(?m)^(\s*framerateInactive\s*=).*$', r'\1 0', text)
    modernui.write_text(text, encoding='utf-8')
    for kind, filename in [('client', 'client_probe.js'), ('server', 'client_server_probe.js')]:
        shutil.copy2(TOOLS / filename, CLIENT / f'kubejs/{kind}_scripts/zz_utf_visual_probe.js')
    name = f'Visual-{variant}-{int(time.time())}'
    target_world = CLIENT / 'saves' / name
    shutil.copytree(world, target_world)
    for relative in ['session.lock', 'playerdata', 'advancements', 'stats']:
        path = target_world / relative
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()
    # Controlled rendering conditions, no authentication files or user options are copied.
    (CLIENT / 'options.txt').write_text('\n'.join([
        'version:3465', 'lang:en_us', 'renderDistance:24', 'simulationDistance:6',
        'maxFps:120', 'enableVsync:false', 'graphicsMode:1', 'mipmapLevels:4',
        'guiScale:2', 'fov:0.0', 'fullscreen:false', 'pauseOnLostFocus:false',
        'resourcePacks:[]', 'incompatibleResourcePacks:[]', 'soundCategory_master:0.0',
        'autoJump:false', 'tutorialStep:none', 'skipMultiplayerWarning:true', 'renderClouds:"false"',
        'onboardAccessibility:false', 'joinedFirstServer:true', 'mouseSensitivity:0.5',
    ]) + '\n', encoding='utf-8')
    write_json(CLIENT / 'visual-config.json', {'variant': variant, 'points': []})
    for filename in ['visual-state.json', 'visual-captured.json', 'visual-client-status.json',
                     'visual-client-error.json', 'visual-server-result.json', 'visual-route.json',
                     'visual-route-result.json', 'visual-frame-window.json']:
        path = CLIENT / filename
        if path.exists():
            path.unlink()
    return name


def launch(variant, world, prepared=False):
    wait_for_isolation()
    name = world if prepared else prepare(variant, world)
    libraries = []
    for package, version in [('org.lwjgl3', '3.3.1'), ('net.minecraft', '1.20.1'), ('net.minecraftforge', '47.4.10')]:
        metadata = json.loads((PRISM / 'meta' / package / (version + '.json')).read_text())
        libraries.extend(item for item in metadata.get('libraries', []) if allowed(item))
    paths = {}
    natives = CLIENT / 'natives'
    natives.mkdir(exist_ok=True)
    for library in libraries:
        coordinate = library['name']
        group, artifact = coordinate.split(':')[:2]
        path = PRISM / 'libraries' / coordinate_path(coordinate)
        if not path.exists():
            raise FileNotFoundError(path)
        paths[(group, artifact)] = path
        if 'natives-windows' in coordinate:
            with zipfile.ZipFile(path) as archive:
                for member in archive.namelist():
                    if member.endswith('.dll'):
                        (natives / Path(member).name).write_bytes(archive.read(member))
    minecraft = PRISM / 'libraries/com/mojang/minecraft/1.20.1/minecraft-1.20.1-client.jar'
    installer = PRISM / 'libraries/net/minecraftforge/forge/1.20.1-47.4.10/forge-1.20.1-47.4.10-installer.jar'
    args = [str(JAVA), '-Xms3G', '-Xmx12G', '-XX:+UseZGC', '-XX:+ZGenerational',
            '-XX:+EnableDynamicAgentLoading', '-Dfile.encoding=UTF-8', '-Dsdbf.benchmark=true',
            '-Djava.library.path=' + str(natives), '-Dforgewrapper.librariesDir=' + str(PRISM / 'libraries'),
            '-Dforgewrapper.installer=' + str(installer), '-Dforgewrapper.minecraft=' + str(minecraft),
            '-cp', ';'.join(str(path) for path in paths.values()),
            'io.github.zekerzhayard.forgewrapper.installer.Main',
            '--username', 'SDBFBenchmark', '--version', '1.20.1', '--gameDir', str(CLIENT),
            '--assetsDir', str(PRISM / 'assets'), '--assetIndex', '5',
            '--uuid', str(uuid.uuid3(uuid.NAMESPACE_DNS, 'OfflinePlayer:SDBFBenchmark')).replace('-', ''),
            '--accessToken', '0', '--userType', 'legacy', '--versionType', 'release',
            '--launchTarget', 'forgeclient', '--fml.forgeVersion', '47.4.10', '--fml.mcVersion', '1.20.1',
            '--fml.forgeGroup', 'net.minecraftforge', '--fml.mcpVersion', '20230612.114412',
            '--width', '1600', '--height', '900', '--quickPlaySingleplayer', name]
    out = RUNS / f'{variant}-client-{time.strftime("%Y%m%d-%H%M%S")}'
    out.mkdir()
    with (out / 'console.log').open('w', encoding='utf-8') as console:
        process = subprocess.Popen(args, cwd=CLIENT, stdout=console, stderr=subprocess.STDOUT,
                                   creationflags=subprocess.CREATE_NO_WINDOW)
    write_json(ROOT / 'client-status.json', {'pid': process.pid, 'world': name, 'variant': variant, 'run': str(out)})
    print('CLIENT_STARTED', process.pid, name, flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--variant', choices=['A', 'B', 'C'], required=True)
    parser.add_argument('--world', required=True)
    parser.add_argument('--prepared', action='store_true')
    options = parser.parse_args()
    launch(options.variant, options.world if options.prepared else Path(options.world).resolve(), options.prepared)
