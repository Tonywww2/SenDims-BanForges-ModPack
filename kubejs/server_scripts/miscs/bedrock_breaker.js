// 基岩破坏者：在月球或暮色森林对基岩连敲三下，凿穿后坠入下界。
// 每敲一下物品进入短暂冷却（原版冷却，期间 KubeJS 不会触发右键事件）；两下间隔超过 3 秒裂纹消退、重新计数。
let bbAllowDims = Utils.newMap();
bbAllowDims.put("ad_astra:moon", "minecraft:the_nether");
bbAllowDims.put("twilightforest:twilight_forest", "minecraft:the_nether");
// bbAllowDims.add("minecraft:the_nether", "ad_astra:moon");

let moonToNetherKey = "sbdf.moon_to_nether";
let BB_HITS = 3;
let BB_HIT_COOLDOWN = 8;
let BB_RESET_TICKS = 60;
let BB_STAGES = [3, 6, 9];
let bbProgress = {};

// 挖掘裂纹按“破坏者 ID”区分；原版不会把裂纹发给同 ID 的实体，所以不能用玩家自己的实体 ID。
let bbCrackId = pos => -1 - Math.abs((pos.x * 73856093) ^ (pos.y * 19349663) ^ (pos.z * 83492791)) % 1000000;
let bbSetCrack = (level, pos, stage) => {
    try {
        level.destroyBlockProgress(bbCrackId(pos), pos, stage);
    } catch (error) {
        console.warn(`[bedrock_breaker] 裂纹显示失败：${error}`);
    }
};

let bbTravel = (player, fromDim) => {
    let targetDim = bbAllowDims.get(fromDim);
    let level = player.level;
    if (global.immptEnabled) {
        if (!level.getData().getOrDefault(moonToNetherKey, false)) {
            level.getData().put(moonToNetherKey, true);
            level.runCommandSilent("portal global connect_floor ad_astra:moon minecraft:the_nether");
            level.runCommandSilent("portal global connect_ceil minecraft:the_nether ad_astra:moon");
        }
        return;
    }
    let targetLevel = player.server.getLevel(targetDim);
    let x = player.x;
    let y = player.y + 150;
    let z = player.z;
    player.server.runCommandSilent(`/execute in ${targetDim} run tp ${player.name.string} ${x} ${y} ${z}`);
    for (let i = x - 2; i < x + 2; i++) {
        for (let j = z - 2; j < z + 2; j++) {
            for (let k = y - 2; k < y + 2; k++) {
                targetLevel.removeBlock(new BlockPos(i, k, j), true);
            }
            targetLevel.setBlock(new BlockPos(i, y - 3, j), Blocks.OBSIDIAN.defaultBlockState(), 2);
        }
    }
    // 抵达下界：绯红孢子与灰烬卷起，平台四角冒出黑曜石碎屑
    let theme = RitualFx.theme('bedrock');
    player.server.scheduleInTicks(1, callback => {
        RitualFx.particle(targetLevel, 'minecraft:crimson_spore', x, y, z, 2, 1.5, 2, 0.02, 60, null);
        RitualFx.particle(targetLevel, 'minecraft:ash', x, y, z, 2, 1.5, 2, 0.02, 40, null);
        RitualFx.particle(targetLevel, 'minecraft:block minecraft:obsidian', x, y - 2.9, z, 1.6, 0.05, 1.6, 0.05, 30, null);
        RitualFx.particle(targetLevel, RitualFx.dust(theme), x, y - 1.5, z, 1.5, 0.5, 1.5, 0, 20, null);
        RitualFx.sound(targetLevel, 'minecraft:ambient.nether_wastes.mood', x, y, z, 1, 1, null);
        RitualFx.sound(targetLevel, 'minecraft:block.respawn_anchor.set_spawn', x, y - 2, z, 0.6, 0.7, null);
    });
};

let bbHit = (level, pos, player, count) => {
    let cx = pos.x + 0.5, cy = pos.y + 1.0, cz = pos.z + 0.5;
    bbSetCrack(level, pos, BB_STAGES[count - 1]);
    RitualFx.particle(level, 'minecraft:block minecraft:bedrock', cx, cy, cz, 0.3, 0.1, 0.3, 0.15, 12 + count * 6, null);
    RitualFx.sound(level, 'minecraft:block.deepslate.hit', cx, cy, cz, 1, 0.6, null);
    RitualFx.sound(level, 'minecraft:block.anvil.land', cx, cy, cz, 0.35 + count * 0.1, 0.55 - count * 0.05, null);
    if (count >= 2) {
        RitualFx.particle(level, 'minecraft:lava', cx, cy, cz, 0.25, 0.05, 0.25, 0, 3 * count, null);
        RitualFx.particle(level, 'minecraft:flame', cx, cy, cz, 0.3, 0.05, 0.3, 0.01, 6, null);
    }
    RitualFx.actionbar(player, Text.translatable('info.kubejs.bedrock_breaker.crack', String(count)).gold());
};

let bbBreakThrough = (level, pos, player, fromDim, item) => {
    let cx = pos.x + 0.5, cy = pos.y + 1.0, cz = pos.z + 0.5;
    let server = player.server;
    player.mainHandItem.shrink(1);
    player.cooldowns.addCooldown(item, 50);
    // 基岩碎裂只是表现，方块本身保留
    server.scheduleInTicks(3, callback => {
        bbSetCrack(level, pos, -1);
        RitualFx.particle(level, 'minecraft:block minecraft:bedrock', cx, cy - 0.4, cz, 0.35, 0.35, 0.35, 0.2, 60, null);
        RitualFx.column(level, 'minecraft:flame', cx, cy, cz, 3, 8);
        RitualFx.particle(level, 'minecraft:lava', cx, cy, cz, 0.4, 0.2, 0.4, 0, 12, null);
        RitualFx.particle(level, RitualFx.dust(RitualFx.theme('bedrock')), cx, cy + 0.5, cz, 0.4, 1, 0.4, 0, 20, null);
        RitualFx.sound(level, 'minecraft:entity.generic.explode', cx, cy, cz, 0.5, 0.7, null);
        RitualFx.sound(level, 'minecraft:block.respawn_anchor.deplete', cx, cy, cz, 1, 0.8, null);
        RitualFx.sound(level, 'minecraft:entity.item.break', player.x, player.y, player.z, 0.8, 0.8, player);
        RitualFx.shake(level, cx, cy, cz, 10, 0.15, 12, 8);
        RitualFx.darkness(player, 30);
    });
    server.scheduleInTicks(13, callback => {
        if (player.hasDisconnected() || !player.isAlive()) return;
        if (RitualFx.dimOf(player.level) !== fromDim) return;
        bbTravel(player, fromDim);
    });
};

BlockEvents.rightClicked("minecraft:bedrock", event => {
    if (String(event.hand).toUpperCase() !== 'MAIN_HAND') return;
    if (String(event.item.getId()) !== "kubejs:bedrock_breaker") return;
    let { level, player } = event;
    let pos = event.block.pos;
    let item = event.item.getItem();
    let fromDim = RitualFx.dimOf(level);

    if (!bbAllowDims.containsKey(fromDim)) {
        RitualFx.particle(level, 'minecraft:electric_spark', pos.x + 0.5, pos.y + 1.0, pos.z + 0.5, 0.2, 0.05, 0.2, 0.1, 8, null);
        RitualFx.sound(level, 'minecraft:block.anvil.land', pos.x + 0.5, pos.y + 1.0, pos.z + 0.5, 0.3, 1.6, null);
        RitualFx.actionbar(player, Text.translatable('info.kubejs.bedrock_breaker.no_path').gray());
        player.cooldowns.addCooldown(item, BB_HIT_COOLDOWN);
        event.cancel();
    }

    let key = String(player.uuid);
    let posKey = `${fromDim}|${pos.x},${pos.y},${pos.z}`;
    let now = player.server.getTickCount();
    let state = bbProgress[key];
    if (!state || state.pos !== posKey || now - state.last > BB_RESET_TICKS) {
        if (state && state.pos !== posKey && state.level) bbSetCrack(state.level, state.blockPos, -1);
        state = { pos: posKey, count: 0, last: now, level: level, blockPos: pos };
    }
    state.count++;
    state.last = now;
    bbProgress[key] = state;
    player.swing();

    if (state.count < BB_HITS) {
        bbHit(level, pos, player, state.count);
        player.cooldowns.addCooldown(item, BB_HIT_COOLDOWN);
        // 超时未继续敲击：裂纹消退
        let hitAt = now;
        player.server.scheduleInTicks(BB_RESET_TICKS + 1, callback => {
            let current = bbProgress[key];
            if (current && current.pos === posKey && current.last === hitAt) {
                delete bbProgress[key];
                bbSetCrack(level, pos, -1);
            }
        });
        event.cancel();
    }

    delete bbProgress[key];
    bbHit(level, pos, player, BB_HITS);
    bbBreakThrough(level, pos, player, fromDim, item);
    event.cancel();
});
