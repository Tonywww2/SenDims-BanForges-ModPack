"""Build the C2MEF autosave monitor fix and its deterministic deadlock fixture."""
import shutil
import subprocess
from pathlib import Path
from workspace import C2ME, CANDIDATE, JAVA, ROOT, SOURCE
from build_gc_patch import PRISM_LIBRARIES

TOOLS = Path(__file__).resolve().parent / 'gc_patch'
OUTPUT = ROOT / 'c2me-autosave-patch'


def build():
    builder = OUTPUT / 'builder'
    builder.mkdir(parents=True, exist_ok=True)
    sources = {
        'net/minecraft/world/level/ChunkPos.java': '''package net.minecraft.world.level;
public record ChunkPos(long id) { public long m_45588_() { return id; } }''',
        'net/minecraft/world/level/chunk/ChunkAccess.java': '''package net.minecraft.world.level.chunk;
public class ChunkAccess {}''',
        'net/minecraft/server/level/ChunkHolder.java': '''package net.minecraft.server.level;
import java.util.concurrent.CompletableFuture;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.chunk.ChunkAccess;
public record ChunkHolder(ChunkPos position, CompletableFuture<ChunkAccess> future) {
 public ChunkPos m_140092_() { return position; }
 public CompletableFuture<ChunkAccess> m_140090_() { return future; }
}''',
        'com/ishland/c2me/opts/scheduling/common/Config.java': '''package com.ishland.c2me.opts.scheduling.common;
public class Config { public static long autoSaveDelayMillis = 30000; }'''
    }
    source_files = []
    for relative, source in sources.items():
        path = OUTPUT / 'stubs' / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(source, encoding='utf-8')
        source_files.append(path)
    dependencies = [builder]
    dependencies.extend(PRISM_LIBRARIES / f'org/ow2/asm/{name}/9.8/{name}-9.8.jar'
                        for name in ['asm', 'asm-tree', 'asm-commons', 'asm-analysis'])
    dependencies.extend(PRISM_LIBRARIES / path for path in [
        'org/slf4j/slf4j-api/2.0.1/slf4j-api-2.0.1.jar',
        'com/mojang/logging/1.1.1/logging-1.1.1.jar',
        'com/google/guava/guava/31.1-jre/guava-31.1-jre.jar',
        'it/unimi/dsi/fastutil/8.5.9/fastutil-8.5.9.jar',
        'org/apache/commons/commons-lang3/3.12.0/commons-lang3-3.12.0.jar',
        'cpw/mods/modlauncher/10.0.9/modlauncher-10.0.9.jar'])
    dependencies.append(SOURCE / 'mods/hotai-1.0.jar')
    classpath = ';'.join(map(str, dependencies))
    subprocess.run([str(JAVA.parent / 'javac.exe'), '--release', '17', '-proc:none', '-encoding', 'UTF-8',
                    '-cp', classpath, '-d', str(builder), *map(str, source_files),
                    str(TOOLS / 'AutoSaveTemplate.java'), str(TOOLS / 'AutoSaveFixture.java'),
                    str(TOOLS / 'PatchAutoSave.java')], check=True)
    subprocess.run([str(JAVA), '-Xverify:all', '-cp', classpath, 'AutoSaveFixture'], check=True)
    subprocess.run([str(JAVA), '-Xverify:all', '-cp', classpath, 'PatchAutoSave',
                    str(CANDIDATE / C2ME), str(builder), str(OUTPUT)], check=True)
    relative = Path('com/ishland/c2me/opts/scheduling/mixin/idle_tasks/autosave/enhanced_autosave/MixinThreadedAnvilChunkStorage.badiff')
    target = CANDIDATE / 'hotai' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUTPUT / 'fixture' / relative, target)
    print('AUTOSAVE_PATCH_READY', target)


if __name__ == '__main__':
    build()
