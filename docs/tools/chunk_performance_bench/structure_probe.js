// Controlled placement test after pre-generating a fresh world in the benchmark copy.
ServerEvents.loaded(event => {
    let config = JsonIO.read('benchmark-config.json');
    let server = event.server;
    server.runCommandSilent('gamerule doMobSpawning false');
    server.runCommandSilent('gamerule doDaylightCycle false');
    server.runCommandSilent('gamerule doWeatherCycle false');
    server.runCommandSilent('gamerule randomTickSpeed 0');
    server.scheduleInTicks(100, () => {
        let results = { scenario: String(config.scenario), seed: String(config.seed), areas: [], complete: false, mode: 'structure_placement' };
        let recording = false;
        try {
            let level = server.overworld();
            results.generator = String(level.getChunkSource().getGenerator().getClass().getName());
            let centerX = 4096;
            let centerZ = 4096;
            let preloadStart = Date.now();
            console.info('[SDBF_BENCH] PRELOADING_TEST_AREA ' + config.target);
            for (let z = -16; z <= 16; z++) {
                for (let x = -16; x <= 16; x++) level.getChunk(centerX + x, centerZ + z);
                if (z % 4 === 0) console.info('[SDBF_BENCH] PRELOAD_ROW ' + z);
            }
            let sample = {
                name: String(config.target),
                origin: [centerX * 16 + 8, 64, centerZ * 16 + 8],
                requests: [],
                preloadMs: Date.now() - preloadStart,
                preloadedChunks: 1089
            };
            if (server.runCommandSilent('jfr start') !== 1) throw new Error('JFR start failed');
            recording = true;
            let command = 'place structure ' + config.target + ' ' + sample.origin.join(' ');
            console.info('[SDBF_BENCH] PLACEMENT_START ' + command);
            let started = Date.now();
            sample.commandResult = Number(server.runCommandSilent(command));
            sample.wallMs = Date.now() - started;
            results.areas.push(sample);
            server.runCommandSilent('jfr stop');
            recording = false;
            if (sample.commandResult <= 0) throw new Error('Structure placement failed');
            results.complete = true;
            console.info('[SDBF_BENCH] COMPLETE ' + config.target + ' ' + sample.wallMs + ' ms');
        } catch (error) {
            results.error = String(error);
            console.error('[SDBF_BENCH] FAILED ' + error);
            if (recording) server.runCommandSilent('jfr stop');
        }
        JsonIO.write('benchmark-result.json', results);
        server.runCommandSilent('stop');
    });
});
