// Runs only in the isolated single-player visual test instance.
let migrationVisualStarted = false;
ServerEvents.tick(event => {
    if (migrationVisualStarted || event.server.players.isEmpty()) return;
    migrationVisualStarted = true;
    let server = event.server;
    let player = event.server.players.get(0);
    let result = { island: {}, points: [], complete: false };
    let config = JsonIO.read('visual-config.json');
    server.runCommandSilent('gamerule doMobSpawning false');
    server.runCommandSilent('gamerule doDaylightCycle false');
    server.runCommandSilent('gamerule doWeatherCycle false');
    server.runCommandSilent('gamerule randomTickSpeed 0');
    server.runCommandSilent('time set noon');
    server.runCommandSilent('weather clear');
    server.scheduleInTicks(40, () => {
        try {
            result.island.createResult = Number(server.runCommand('skyblock manage teams create UTFBenchmark'));
            result.island.kickPlayerResult = Number(server.runCommand('skyblock manage kickPlayer SDBFBenchmark'));
            result.island.joinResult = Number(server.runCommand('skyblock manage addPlayer SDBFBenchmark UTFBenchmark'));
            server.runCommandSilent('execute as SDBFBenchmark run skyblock home');
            server.scheduleInTicks(100, () => {
                try {
                    result.island.position = [Number(player.x), Number(player.y), Number(player.z)];
                    result.island.dimension = String(player.level.dimension);
                    result.island.maxY = Number(player.level.getMaxBuildHeight());
                    JsonIO.write('visual-server-result.json', result);
                    player.stages.add('sdbf.world_lock');
                    server.runCommandSilent('gamemode spectator SDBFBenchmark');
                    let index = 0;
                    let next = () => {
                        if (index >= config.points.length) {
                            result.complete = true;
                            JsonIO.write('visual-server-result.json', result);
                            return;
                        }
                        let point = config.points[index];
                        result.lastTeleportResult = Number(server.runCommandSilent('tp SDBFBenchmark ' + point.x + ' ' + point.y + ' ' + point.z + ' ' + point.yaw + ' ' + point.pitch));
                        let status = JsonIO.read('visual-client-status.json');
                        let tick = status ? Number(status.ticks) : 0;
                        JsonIO.write('visual-state.json', { name: String(config.variant) + '-' + point.name,
                            yaw: Number(point.yaw), pitch: Number(point.pitch), readyTick: tick + 400 });
                        server.scheduleInTicks(700, () => {
                            let capture = JsonIO.read('visual-captured.json');
                            result.points.push({ point: point, capture: capture });
                            JsonIO.write('visual-server-result.json', result);
                            index++;
                            next();
                        });
                    };
                    next();
                } catch (error) {
                    result.error = String(error);
                    JsonIO.write('visual-server-result.json', result);
                }
            });
        } catch (error) {
            result.error = String(error);
            JsonIO.write('visual-server-result.json', result);
        }
    });
});

let migrationRoute = null;
let migrationRouteTick = 0;
ServerEvents.tick(event => {
    migrationRouteTick++;
    if (migrationRouteTick % 20 !== 0 || event.server.players.isEmpty()) return;
    let request = JsonIO.read('visual-route.json');
    if (!request || !request.name) return;
    if (!migrationRoute || migrationRoute.name !== String(request.name)) {
        migrationRoute = { name: String(request.name), started: Date.now(), samples: [], complete: false };
        event.server.players.get(0).stages.add('sdbf.world_lock');
        event.server.runCommandSilent('gamemode spectator SDBFBenchmark');
    }
    if (migrationRoute.complete) return;
    try {
        let step = migrationRoute.samples.length;
        let x = Number(request.x) + step * Number(request.blocksPerStep);
        let before = Date.now();
        let code = event.server.runCommandSilent('tp SDBFBenchmark ' + x + ' ' + request.y + ' ' + request.z + ' -90 8');
        migrationRoute.samples.push({ step: step, elapsedMs: Date.now() - migrationRoute.started,
            teleportMs: Date.now() - before, result: Number(code), x: x });
        migrationRoute.complete = migrationRoute.samples.length >= Number(request.steps);
        JsonIO.write('visual-route-result.json', migrationRoute);
    } catch (error) {
        migrationRoute.error = String(error);
        migrationRoute.complete = true;
        JsonIO.write('visual-route-result.json', migrationRoute);
    }
});
