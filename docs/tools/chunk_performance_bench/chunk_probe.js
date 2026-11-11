// Installed only in the isolated benchmark copy.
ServerEvents.loaded(event => {
    let config = JsonIO.read('benchmark-config.json');
    let server = event.server;
    server.runCommandSilent('gamerule doMobSpawning false');
    server.runCommandSilent('gamerule doDaylightCycle false');
    server.runCommandSilent('gamerule doWeatherCycle false');
    server.runCommandSilent('gamerule randomTickSpeed 0');
    server.scheduleInTicks(100, () => {
        let results = { scenario: String(config.scenario), seed: String(config.seed), areas: [], complete: false };
        let recording = false;
        try {
            let level = server.overworld();
            let Position = Java.loadClass('net.minecraft.core.BlockPos');
            results.generator = String(level.getChunkSource().getGenerator().getClass().getName());
            results.biomeSource = String(level.getChunkSource().getGenerator().getBiomeSource().getClass().getName());
            results.possibleBiomes = [];
            let biomeIterator = level.getChunkSource().getGenerator().getBiomeSource().possibleBiomes().iterator();
            while (biomeIterator.hasNext()) {
                results.possibleBiomes.push(String(biomeIterator.next().unwrapKey().get().location()));
            }
            console.info('[SDBF_BENCH] WARMUP ' + config.scenario);
            for (let z = 0; z < 8; z++) {
                for (let x = 0; x < 8; x++) level.getChunk(512 + x, 512 + z);
            }
            if (server.runCommandSilent('jfr start') !== 1) throw new Error('JFR start failed');
            recording = true;
            for (let area of config.areas) {
                let sample = { name: String(area.name), origin: [Number(area.x), Number(area.z)], requests: [], biomes: {} };
                let start = Date.now();
                console.info('[SDBF_BENCH] AREA_START ' + area.name);
                for (let z = 0; z < Number(area.size); z++) {
                    for (let x = 0; x < Number(area.size); x++) {
                        let cx = Number(area.x) + x;
                        let cz = Number(area.z) + z;
                        let before = Date.now();
                        level.getChunk(cx, cz);
                        sample.requests.push({ x: cx, z: cz, ms: Number(Date.now() - before) });
                        let biome = String(level.getBiome(new Position(cx * 16 + 8, 80, cz * 16 + 8)).unwrapKey().get().location());
                        sample.biomes[biome] = (sample.biomes[biome] || 0) + 1;
                    }
                    console.info('[SDBF_BENCH] ROW ' + area.name + ' ' + (z + 1));
                }
                sample.wallMs = Number(Date.now() - start);
                results.areas.push(sample);
                JsonIO.write('benchmark-result.json', results);
                console.info('[SDBF_BENCH] AREA_DONE ' + area.name + ' ' + sample.wallMs + ' ms');
            }
            server.runCommandSilent('jfr stop');
            recording = false;
            results.complete = true;
            console.info('[SDBF_BENCH] COMPLETE ' + config.scenario);
        } catch (error) {
            results.error = String(error);
            console.error('[SDBF_BENCH] FAILED ' + error);
            if (recording) server.runCommandSilent('jfr stop');
        }
        JsonIO.write('benchmark-result.json', results);
        server.runCommandSilent('stop');
    });
});
