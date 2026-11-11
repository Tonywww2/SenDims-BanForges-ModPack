// Installed only into the isolated migration workspace.
ServerEvents.loaded(event => {
    let server = event.server;
    let config = JsonIO.read('migration-test.json');
    server.runCommandSilent('gamerule doMobSpawning false');
    server.runCommandSilent('gamerule randomTickSpeed 0');
    server.runCommandSilent('gamerule doDaylightCycle false');
    server.runCommandSilent('gamerule doWeatherCycle false');
    server.scheduleInTicks(100, () => {
        let result = { run: String(config.run), mode: String(config.mode), variant: String(config.variant), complete: false };
        let recording = false;
        let finish = error => {
            if (recording) server.runCommandSilent('jfr stop');
            recording = false;
            if (error) result.error = String(error);
            else result.complete = true;
            JsonIO.write('migration-result.json', result);
            server.runCommandSilent('stop');
        };
        try {
            let level = server.overworld();
            let generator = level.getChunkSource().getGenerator();
            result.generator = String(generator.getClass().getName());
            result.minY = Number(level.getMinBuildHeight());
            result.maxYExclusive = Number(level.getMaxBuildHeight());
            result.spawn = String(level.getSharedSpawnPos());
            result.loadedAtStart = Number(level.getChunkSource().getLoadedChunksCount());
            if (String(config.variant) !== 'A') {
                let context = level.getChunkSource().randomState().generatorContext();
                if (!context) throw new Error('UTF context is missing');
                result.worldHeight = Number(context.preset.world().properties.worldHeight);
                result.continentScale = Number(context.preset.world().continent.continentScale);
                if (result.worldHeight !== 320 || result.continentScale !== 4800) throw new Error('Wrong UTF preset');
            }
            if (String(config.mode) === 'smoke') {
                result.chunks = [];
                for (let area of [[1024, 1024], [2048, -1024], [-2048, 1024]]) {
                    let start = Date.now();
                    for (let z = 0; z < 4; z++) {
                        for (let x = 0; x < 4; x++) level.getChunk(area[0] + x, area[1] + z);
                    }
                    result.chunks.push({ origin: area, wallMs: Date.now() - start });
                }
            }
            if (String(config.mode) === 'reload') {
                result.reloaded = [];
                for (let z = 0; z < 4; z++) {
                    for (let x = 0; x < 4; x++) {
                        let cx = 1000 + x * 16;
                        let cz = 1000 + z * 16;
                        level.getChunk(cx, cz);
                        result.reloaded.push([cx, cz]);
                    }
                }
                level.getChunk(129, 0);
                result.reloaded.push([129, 0]);
            }
            if (String(config.mode) === 'throughput') {
                for (let z = 0; z < 8; z++) {
                    for (let x = 0; x < 8; x++) level.getChunk(512 + x, 512 + z);
                }
                let chunky = Java.loadClass('org.popcraft.chunky.ChunkyProvider').get();
                let api = chunky.getApi();
                if (server.runCommandSilent('jfr start') !== 1) throw new Error('JFR start failed');
                recording = true;
                let started = Date.now();
                let center = config.center || [16384, 16384];
                if (!api.startTask('minecraft:overworld', 'square', Number(center[0]), Number(center[1]), 1000, 1000, 'concentric')) throw new Error('Chunky start failed');
                let task = chunky.getGenerationTasks().get('minecraft:overworld');
                let monitor = () => {
                    try {
                        if (api.isRunning('minecraft:overworld') || Number(task.getCount()) < Number(task.getChunkIterator().total())) {
                            server.scheduleInTicks(2, monitor);
                            return;
                        }
                        result.throughput = { chunks: Number(task.getCount()), planned: Number(task.getChunkIterator().total()), taskMs: Number(task.getTotalTime()),
                            observedMs: Date.now() - started, startedEpochMs: started, finishedEpochMs: Date.now(),
                            center: center, radius: 1000, shape: 'square' };
                        if (result.throughput.chunks !== result.throughput.planned || result.throughput.planned < 15000) throw new Error('Incomplete Chunky task ' + result.throughput.chunks);
                        finish();
                    } catch (error) { finish(error); }
                };
                server.scheduleInTicks(2, monitor);
                return;
            }
            if (String(config.mode) === 'compat') {
                result.dimensions = [];
                for (let dimension of server.getAllLevels()) {
                    let id = String(dimension.dimension);
                    let sample = { id: id, generator: String(dimension.getChunkSource().getGenerator().getClass().getName()),
                        minY: Number(dimension.getMinBuildHeight()), maxY: Number(dimension.getMaxBuildHeight()), chunks: [] };
                    let context = dimension.getChunkSource().randomState().generatorContext();
                    sample.utf = context !== null;
                    let before = Date.now();
                    for (let i = 0; i < 2; i++) {
                        let chunk = dimension.getChunk(640 + i, -640);
                        sample.chunks.push(String(chunk.getPos()));
                    }
                    sample.wallMs = Date.now() - before;
                    result.dimensions.push(sample);
                    JsonIO.write('migration-result.json', result);
                    console.info('[UTF_MIGRATION] DIMENSION ' + id + ' ' + sample.wallMs + ' ms');
                }
            }
            if (String(config.mode) === 'survey') {
                let Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types');
                let randomState = level.getChunkSource().randomState();
                let biomeSource = generator.getBiomeSource();
                let context = String(config.variant) === 'A' ? null : randomState.generatorContext();
                let Cell = context ? Java.loadClass('com.pandaismyname1.ultraterraforged.world.worldgen.cell.Cell') : null;
                let cell = context ? new Cell() : null;
                result.map = { extent: 16384, step: 512, points: [] };
                result.caveBiomes = {};
                result.cavePoints = {};
                for (let z = -16384; z <= 16384; z += 512) {
                    for (let x = -16384; x <= 16384; x += 512) {
                        let height = 0;
                        let terrain = '';
                        if (context) {
                            context.lookup.compute(cell.reset(), x, z);
                            height = Number(cell.height) * Number(context.levels.worldHeight);
                            terrain = String(cell.terrain.getName());
                        } else height = Number(generator.getBaseHeight(x, z, Heightmap.WORLD_SURFACE_WG, level, randomState));
                        let biome = String(biomeSource.getNoiseBiome(x >> 2, Math.max(64, Math.floor(height)) >> 2, z >> 2, randomState.sampler()).unwrapKey().get().location());
                        result.map.points.push([x, z, height, terrain, biome]);
                        for (let y of [-48, -32, -16, 0, 16, 32]) {
                            let cave = String(biomeSource.getNoiseBiome(x >> 2, y >> 2, z >> 2, randomState.sampler()).unwrapKey().get().location());
                            result.caveBiomes[cave] = (result.caveBiomes[cave] || 0) + 1;
                            if (!result.cavePoints[cave]) result.cavePoints[cave] = [x, y, z];
                        }
                    }
                    if (z % 2048 === 0) JsonIO.write('migration-result.json', result);
                }
                result.generatedCaves = [];
                let Position = Java.loadClass('net.minecraft.core.BlockPos');
                for (let biome of Object.keys(result.cavePoints)) {
                    if (biome.indexOf('regions_unexplored:') !== 0 && biome.indexOf('cave') < 0 && biome.indexOf('deep_dark') < 0 && biome.indexOf('darkerdepths') < 0) continue;
                    let point = result.cavePoints[biome];
                    let chunk = level.getChunk(point[0] >> 4, point[2] >> 4);
                    let air = 0;
                    let water = 0;
                    let underground = 0;
                    let actualBiomes = {};
                    for (let y = -48; y <= 32; y += 4) {
                        for (let z = 0; z < 16; z += 4) {
                            for (let x = 0; x < 16; x += 4) {
                                let pos = new Position(point[0] + x, y, point[2] + z);
                                let state = chunk.getBlockState(pos);
                                underground++;
                                if (state.isAir()) air++;
                                if (!state.getFluidState().isEmpty()) water++;
                                let id = String(level.getBiome(pos).unwrapKey().get().location());
                                actualBiomes[id] = (actualBiomes[id] || 0) + 1;
                            }
                        }
                    }
                    result.generatedCaves.push({ target: biome, point: point, samples: underground, air: air, fluid: water, biomes: actualBiomes });
                    JsonIO.write('migration-result.json', result);
                }
            }
            if (String(config.mode) === 'biome-exposure') {
                let Position = Java.loadClass('net.minecraft.core.BlockPos');
                let targets = [
                    ['regions_unexplored:redstone_caves', -14848, -16384],
                    ['regions_unexplored:bioshroom_caves', 16384, -11264],
                    ['regions_unexplored:ancient_delta', 14848, -7168],
                    ['regions_unexplored:scorching_caves', 15872, -7168],
                    ['regions_unexplored:prismachasm', 6144, 5120]
                ];
                result.exposure = [];
                let offsets = [0, 1, -1, 2, -2, 3, -3, 4, -4];
                for (let target of targets) {
                    let sample = { biome: target[0], generated: 0, point: null };
                    for (let dz of offsets) {
                        if (sample.point) break;
                        for (let dx of offsets) {
                            if (sample.point) break;
                            let cx = (target[1] >> 4) + dx;
                            let cz = (target[2] >> 4) + dz;
                            let chunk = level.getChunk(cx, cz);
                            sample.generated++;
                            for (let y = -48; y <= 96 && !sample.point; y += 2) {
                                for (let z = 2; z < 15 && !sample.point; z += 4) {
                                    for (let x = 2; x < 15; x += 4) {
                                        let pos = new Position(cx * 16 + x, y, cz * 16 + z);
                                        if (!chunk.getBlockState(pos).isAir()) continue;
                                        let biome = String(level.getBiome(pos).unwrapKey().get().location());
                                        if (biome !== target[0]) continue;
                                        let clear = true;
                                        for (let delta of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 2, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
                                            if (!chunk.getBlockState(pos.offset(delta[0], delta[1], delta[2])).isAir()) clear = false;
                                        }
                                        if (clear) { sample.point = [cx * 16 + x, y, cz * 16 + z]; break; }
                                    }
                                }
                            }
                        }
                    }
                    result.exposure.push(sample);
                    JsonIO.write('migration-result.json', result);
                    console.info('[UTF_MIGRATION] EXPOSED ' + JSON.stringify(sample));
                }
            }
            if (String(config.mode) === 'memory' || String(config.mode) === 'memory-smoke') {
                result.memory = [];
                let round = 0;
                let started = Date.now();
                let smoke = String(config.mode) === 'memory-smoke';
                if (server.runCommandSilent('jfr start') !== 1) throw new Error('JFR start failed');
                recording = true;
                let explore = () => {
                    try {
                        let before = Date.now();
                        for (let z = 0; z < 8; z++) {
                            for (let x = 0; x < 8; x++) level.getChunk(2048 + round * 48 + x, 2048 + z);
                        }
                        result.memory.push({ round: round, phase: 'generated', elapsedMs: Date.now() - started,
                            generateMs: Date.now() - before, loaded: Number(level.getChunkSource().getLoadedChunksCount()) });
                        JsonIO.write('migration-result.json', result);
                        server.scheduleInTicks(smoke ? 600 : 4800, () => {
                            result.memoryCheckpoint = { round: round, loaded: Number(level.getChunkSource().getLoadedChunksCount()),
                                elapsedMs: Date.now() - started };
                            JsonIO.write('migration-result.json', result);
                            let awaitDiagnostics = () => {
                                let sample = JsonIO.read('migration-gc-result.json');
                                if (!sample || String(sample.run) !== String(config.run) || Number(sample.round) !== round) {
                                    server.scheduleInTicks(20, awaitDiagnostics);
                                    return;
                                }
                                if (sample.error) { finish(String(sample.error)); return; }
                                result.memory.push({ round: round, phase: 'idle-after-gc', elapsedMs: Date.now() - started,
                                    loaded: Number(level.getChunkSource().getLoadedChunksCount()), heapUsed: Number(sample.heapUsed) });
                                result.memoryCheckpoint = null;
                                JsonIO.write('migration-result.json', result);
                                round++;
                                if (round >= 1) finish();
                                else server.scheduleInTicks(400, explore);
                            };
                            server.scheduleInTicks(20, awaitDiagnostics);
                        });
                    } catch (error) { finish(error); }
                };
                explore();
                return;
            }
            if (String(config.mode) === 'client') {
                result.ready = true;
                JsonIO.write('migration-result.json', result);
                return;
            }
            result.complete = true;
        } catch (error) {
            result.error = String(error);
            console.error('[UTF_MIGRATION] ' + error);
        }
        finish(result.error);
    });
});
