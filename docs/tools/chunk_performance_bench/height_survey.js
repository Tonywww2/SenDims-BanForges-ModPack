// Runs only in the isolated benchmark server.
ServerEvents.loaded(event => {
    let config = JsonIO.read('benchmark-config.json');
    let server = event.server;
    server.runCommandSilent('gamerule doMobSpawning false');
    server.runCommandSilent('gamerule randomTickSpeed 0');
    server.scheduleInTicks(100, () => {
        let result = { scenario: String(config.scenario), mode: 'height_survey', areas: [], complete: false };
        let started = Date.now();
        try {
            let Context = Java.loadClass('com.pandaismyname1.ultraterraforged.world.worldgen.GeneratorContext');
            let Cell = Java.loadClass('com.pandaismyname1.ultraterraforged.world.worldgen.cell.Cell');
            let Position = Java.loadClass('net.minecraft.core.BlockPos');
            let level = server.overworld();
            let live = level.getChunkSource().randomState().generatorContext();
            let preset = live.preset;
            result.worldHeight = Number(preset.world().properties.worldHeight);
            result.worldDepth = Number(preset.world().properties.worldDepth);
            result.minBuildHeight = Number(level.getMinBuildHeight());
            result.maxBuildHeightExclusive = Number(level.getMaxBuildHeight());
            result.terrainScale = Number(live.levels.worldHeight);
            result.surveys = [];
            for (let seed of [20261107, 1111, 2222]) {
                let context = Context.makeUncached(preset, seed, 3, 1, 6);
                let alternate = preset.copy();
                alternate.world().properties.worldHeight = 512;
                let reference = Context.makeUncached(alternate, seed, 3, 1, 6);
                let cell = new Cell();
                let other = new Cell();
                let survey = { seed: seed, coarseSamples: 0, refinedSamples: 0, comparisonSamples: 0,
                    differentHeights: 0, maximum: { y: -1000 }, byTerrain: {}, top: [] };
                let sample = (x, z, coarse) => {
                    context.lookup.compute(cell.reset(), x, z);
                    let height = Number(cell.height) * Number(context.levels.worldHeight);
                    let terrain = String(cell.terrain.getName());
                    let point = { x: x, z: z, y: height, terrain: terrain };
                    if (height > survey.maximum.y) survey.maximum = point;
                    if (!survey.byTerrain[terrain] || height > survey.byTerrain[terrain].y) survey.byTerrain[terrain] = point;
                    if (coarse) {
                        survey.coarseSamples++;
                        if (survey.top.length < 8 || height > survey.top[survey.top.length - 1].y) {
                            survey.top.push(point);
                            survey.top.sort((a, b) => b.y - a.y);
                            if (survey.top.length > 8) survey.top.pop();
                        }
                        if (survey.coarseSamples % 16 === 0) {
                            reference.lookup.compute(other.reset(), x, z);
                            survey.comparisonSamples++;
                            if (Math.abs(Number(other.height) - Number(cell.height)) > 0.000001) survey.differentHeights++;
                        }
                    } else {
                        survey.refinedSamples++;
                    }
                };
                for (let z = -16384; z <= 16384; z += 256) {
                    for (let x = -16384; x <= 16384; x += 256) sample(x, z, true);
                }
                for (let peak of survey.top.slice(0, 4)) {
                    for (let z = peak.z - 128; z <= peak.z + 128; z += 8) {
                        for (let x = peak.x - 128; x <= peak.x + 128; x += 8) sample(x, z, false);
                    }
                }
                result.surveys.push(survey);
                JsonIO.write('benchmark-result.json', result);
                console.info('[SDBF_HEIGHT] seed ' + seed + ' maximum ' + JSON.stringify(survey.maximum));
            }
            result.generatedChecks = [];
            let first = result.surveys[0];
            let candidates = [first.maximum];
            for (let terrain of Object.keys(first.byTerrain)) {
                if (terrain.indexOf('volcan') >= 0) candidates.push(first.byTerrain[terrain]);
            }
            for (let point of candidates) {
                let cx = Math.floor(point.x / 16);
                let cz = Math.floor(point.z / 16);
                let chunk = level.getChunk(cx, cz);
                let highest = -1000;
                let roofSolid = 0;
                for (let z = 0; z < 16; z++) {
                    for (let x = 0; x < 16; x++) {
                        for (let y = level.getMaxBuildHeight() - 1; y >= level.getMinBuildHeight(); y--) {
                            let state = chunk.getBlockState(new Position(cx * 16 + x, y, cz * 16 + z));
                            if (!state.isAir()) {
                                highest = Math.max(highest, y);
                                if (y === level.getMaxBuildHeight() - 1) roofSolid++;
                                break;
                            }
                        }
                    }
                }
                result.generatedChecks.push({ sample: point, chunk: [cx, cz], highestNonAirY: highest, roofNonAirColumns: roofSolid });
            }
            result.complete = true;
        } catch (error) {
            result.error = String(error);
            console.error('[SDBF_HEIGHT] ' + error);
        }
        result.areas.push({ name: 'height-survey', wallMs: Date.now() - started, requests: [] });
        JsonIO.write('benchmark-result.json', result);
        server.runCommandSilent('stop');
    });
});
