registerStructure({
    activateItem: 'aether_redux:golden_swet_ball',
    blockMapping: {
        'A': 'aether:cold_aercloud',
        'B': 'aether:ambrosium_block',
        'C': 'aether:angelic_stone'
    },
    destroyAfterSpawn: true,
    weakMatch: true,
    theme: 'aether',
    displayName: 'info.kubejs.ritual.name.platinum_dungeon',
    summonKind: 'structure',
    executeCommands: (level, centerPos, player) => {
        player.tell(Text.of("TungTungTung").obfuscated())
        player.server.runCommandSilent(`execute at ${player.name.string} run place structure lost_aether_content:platinum_dungeon`);
    },
    structureName: "platinum_dungeon"
});

registerStructure({
    activateItem: 'undergarden:utherium_crystal',
    blockMapping: {
        'A': 'minecraft:soul_soil',
        'B': 'undergarden:utherium_block',
        'C': 'undergarden:virulent_mix'
    },
    destroyAfterSpawn: true,
    weakMatch: true,
    theme: 'undergarden',
    displayName: 'info.kubejs.ritual.name.samurai_x',
    summonKind: 'boss',
    executeCommands: (level, centerPos, player) => {
        player.tell(Text.of("Samurai X").obfuscated())
        player.server.runCommandSilent(`execute in ${level.dimensionKey.location().toString()} positioned ${centerPos.x} ${centerPos.y} ${centerPos.z} run summon final_samurai:samurai`);
    },
    structureName: "samurai_x"
});


// 暮刃守卫：终焉城堡顶端中央平台的召唤仪式（docs/development/终焉城堡内容设计-2026-11-18.md 第 6 节）
let $FinalCastleApi = Java.loadClass('com.tonywww.slashblade_sendims.twilight.FinalCastleApi');
let TWILIGHT_BLADE_WARDEN_CHECK_RADIUS = 48;

registerStructure({
    activateItem: 'kubejs:finale_sigil',
    blockMapping: {
        'A': 'twilightforest:castle_brick',
        'B': 'kubejs:finale_rune_core',
        'C': 'twilightforest:thick_castle_brick'
    },
    destroyAfterSpawn: true,
    weakMatch: true,
    from: 'twilightforest:twilight_forest',
    theme: 'twilight',
    displayName: 'info.kubejs.ritual.name.twilight_blade_warden',
    summonKind: 'boss',
    precheck: (level, centerPos, player) => {
        if (!$FinalCastleApi.isOnSummit(level, centerPos.x, centerPos.y, centerPos.z)) {
            return Text.translatable('info.kubejs.ritual.twilight_blade_warden.not_summit').red();
        }
        if ($FinalCastleApi.hasWardenNear(level, centerPos.x, centerPos.y, centerPos.z, TWILIGHT_BLADE_WARDEN_CHECK_RADIUS)) {
            return Text.translatable('info.kubejs.ritual.twilight_blade_warden.present').yellow();
        }
        return null;
    },
    executeCommands: (level, centerPos, player) => {
        player.server.runCommandSilent(`execute in ${level.dimensionKey.location().toString()} positioned ${centerPos.x + 0.5} ${centerPos.y} ${centerPos.z + 0.5} run summon slashblade_sendims:twilight_blade_warden ~ ~ ~`);
    },
    structureName: "twilight_blade_warden"
});
