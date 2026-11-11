"""Build and verify the narrowly scoped C2MEF ZGC clock patch."""
import shutil
import subprocess
from pathlib import Path
from workspace import C2ME, CANDIDATE, JAVA, ROOT, SOURCE

PRISM_LIBRARIES = Path('C:/Users/Tony/AppData/Roaming/PrismLauncher/libraries')
TOOLS = Path(__file__).resolve().parent / 'gc_patch'
OUTPUT = ROOT / 'c2me-gc-patch'
BUILDER = OUTPUT / 'builder'


def build():
    BUILDER.mkdir(parents=True, exist_ok=True)
    dependencies = [PRISM_LIBRARIES / f'org/ow2/asm/{name}/9.8/{name}-9.8.jar'
                    for name in ['asm', 'asm-tree', 'asm-commons', 'asm-analysis']]
    dependencies.extend(PRISM_LIBRARIES / path for path in [
        'org/slf4j/slf4j-api/2.0.1/slf4j-api-2.0.1.jar',
        'com/mojang/logging/1.1.1/logging-1.1.1.jar',
        'com/google/guava/guava/31.1-jre/guava-31.1-jre.jar',
        'it/unimi/dsi/fastutil/8.5.9/fastutil-8.5.9.jar',
        'org/apache/commons/commons-lang3/3.12.0/commons-lang3-3.12.0.jar',
        'cpw/mods/modlauncher/10.0.9/modlauncher-10.0.9.jar'])
    dependencies.extend([SOURCE / 'mods/hotai-1.0.jar', BUILDER])
    for path in dependencies:
        if not path.exists():
            raise FileNotFoundError(path)
    classpath = ';'.join(map(str, dependencies))
    subprocess.run([str(JAVA.parent / 'javac.exe'), '--release', '17', '-proc:none', '-encoding', 'UTF-8',
                    '-cp', classpath, '-d', str(BUILDER), str(TOOLS / 'CollectorClockTemplate.java'),
                    str(TOOLS / 'PatchAdaptiveGc.java')], check=True)
    subprocess.run([str(JAVA), '-Xverify:all', '-cp', classpath, 'PatchAdaptiveGc',
                    str(CANDIDATE / C2ME), str(BUILDER), str(OUTPUT)], check=True)
    relative = Path('com/ishland/c2me/base/common/AdaptiveWorldGenController.badiff')
    target = CANDIDATE / 'hotai' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUTPUT / 'fixture' / relative, target)
    print('PATCH_READY', target)


if __name__ == '__main__':
    build()
