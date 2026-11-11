// Test-only native game API probe. No input automation is used.
let migrationVisualTicks = 0;
let migrationVisualCaptured = '';
let migrationVisualFrames = [];
let migrationVisualFailed = false;
let migrationVisualStable = 0;
let migrationVisualState = '';
let migrationFrameLastEnd = -1;
let migrationFrameBatch = [];
ClientEvents.tick(event => {
    if (migrationVisualFailed) return;
    try {
        let minecraft = Java.loadClass('net.minecraft.client.Minecraft').getInstance();
        if (!minecraft.level || !minecraft.player) return;
        migrationVisualTicks++;
        minecraft.options.pauseOnLostFocus = false;
        minecraft.options.hideGui = true;
        if (minecraft.screen) minecraft.setScreen(null);
        let timer = minecraft.getFrameTimer();
        let logs = timer.getLog();
        let end = Number(timer.getLogEnd());
        if (migrationFrameLastEnd < 0) migrationFrameLastEnd = end;
        while (migrationFrameLastEnd !== end) {
            let duration = Number(logs[migrationFrameLastEnd]);
            if (duration > 0) migrationFrameBatch.push(duration);
            migrationFrameLastEnd = (migrationFrameLastEnd + 1) % logs.length;
        }
        if (migrationVisualTicks % 20 === 0) {
            JsonIO.write('visual-client-status.json', { ticks: migrationVisualTicks, captured: migrationVisualCaptured });
            let frame = { ticks: migrationVisualTicks, timeMs: Date.now(), fps: Number(minecraft.getFps()),
                frames: migrationFrameBatch, windowActive: Boolean(minecraft.isWindowActive()),
                position: [Number(minecraft.player.x), Number(minecraft.player.y), Number(minecraft.player.z)] };
            JsonIO.write('visual-frame-window.json', frame);
            console.log('[UTF_FRAMES] ' + JSON.stringify(frame));
            migrationFrameBatch = [];
        }
        let state = JsonIO.read('visual-state.json');
        if (state && state.exit) {
            minecraft.stop();
            return;
        }
        if (!state || !state.name) return;
        minecraft.player.setRotation(Number(state.yaw), Number(state.pitch));
        if (migrationVisualState !== String(state.name)) {
            migrationVisualState = String(state.name);
            migrationVisualStable = 0;
        }
        if (migrationVisualTicks > Number(state.readyTick) && minecraft.levelRenderer.hasRenderedAllChunks()) migrationVisualStable++;
        else migrationVisualStable = 0;
        if (String(state.name) !== migrationVisualCaptured && migrationVisualStable >= 40) {
            let Screenshot = Java.loadClass('net.minecraft.client.Screenshot');
            let name = String(state.name);
            Screenshot.grab(minecraft.gameDirectory, name + '.png', minecraft.getMainRenderTarget(), message => {
                console.log('[UTF_VISUAL] ' + message.getString());
            });
            migrationVisualCaptured = name;
            JsonIO.write('visual-captured.json', { name: name, ticks: migrationVisualTicks,
                rendered: String(minecraft.levelRenderer.getChunkStatistics()), settledTicks: migrationVisualStable,
                frames: migrationVisualFrames });
            migrationVisualFrames = [];
        }
        if (migrationVisualTicks % 20 === 0) {
            migrationVisualFrames.push({ tick: migrationVisualTicks, fps: Number(minecraft.getFps()),
                frameNs: Number(minecraft.getFrameTimeNs()) });
            JsonIO.write('visual-client-status.json', { ticks: migrationVisualTicks, captured: migrationVisualCaptured });
        }
    } catch (error) {
        migrationVisualFailed = true;
        JsonIO.write('visual-client-error.json', { error: String(error) });
        console.error('[UTF_VISUAL] ' + error);
    }
});
