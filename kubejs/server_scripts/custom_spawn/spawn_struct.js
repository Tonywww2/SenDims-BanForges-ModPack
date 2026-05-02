registerStructure({
    activateItem: 'aether_redux:golden_swet_ball',
    blockMapping: {
        'A': 'aether:cold_aercloud',
        'B': 'aether:ambrosium_block',
        'C': 'aether:angelic_stone'
    },
    destroyAfterSpawn: true,
    executeCommands: (level, centerPos, player) => {
        player.tell(Text.of("TungTungTung").obfuscated())
        level.runCommandSilent(`execute at ${player.name.string} run place structure lost_aether_content:platinum_dungeon`);
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
    executeCommands: (level, centerPos, player) => {
        player.tell(Text.of("Samurai X").obfuscated())
        level.runCommandSilent(`execute positioned ${centerPos.x} ${centerPos.y} ${centerPos.z} run summon final_samurai:samurai`);
    },
    structureName: "samurai_x"
});

