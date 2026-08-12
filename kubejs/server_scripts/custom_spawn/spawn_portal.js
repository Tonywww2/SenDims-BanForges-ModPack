registerPortal({
    activateItem: 'minecraft:stick',
    blockMapping: {
        'A': 'minecraft:obsidian',
        'B': 'minecraft:crying_obsidian'
    },
    consumeActivateItem: false,
    destroyAfterSpawn: false,
    weakMatch: true,
    patterns: RETURN_PORTAL_PATTERN,
    from: null,
    to: 'minecraft:overworld',
    x: (player) => getLevelSpawnPoint(player.level)[0],
    y: (player) => PLAYER_Y,
    z: (player) => getLevelSpawnPoint(player.level)[2],
    clearDestinationBlocks: false,
    structureName: "return_portal"
});

registerPortal({
    activateItem: 'tofucraft:tofustick',
    blockMapping: {
        'A': 'tofucraft:blocktofugrilled',
        'B': 'minecraft:moss_block'
    },
    consumeActivateItem: false,
    destroyAfterSpawn: false,
    weakMatch: true,
    patterns: RETURN_PORTAL_PATTERN,
    from: 'minecraft:overworld',
    to: 'tofucraft:tofu_world',
    x: (player) => null,
    y: (player) => 64,
    z: (player) => null,
    clearDestinationBlocks: true,
    structureName: "tofu_portal"
});

registerPortal({
    activateItem: 'slashblade_sendims:deeprealm_certificate',
    blockMapping: {
        'A': 'biomemakeover:cracked_bricks',
        'B': 'minecraft:bricks'
    },
    consumeActivateItem: false,
    destroyAfterSpawn: false,
    weakMatch: true,
    patterns: RETURN_PORTAL_PATTERN,
    from: 'minecraft:overworld',
    to: 'sdbf:deep_realm_level_1',
    x: (player) => null,
    y: (player) => 285,
    z: (player) => null,
    clearDestinationBlocks: true,
    structureName: "deep_realm_level_1_portal"
});

registerPortal({
    activateItem: 'integrateddynamics:variable',
    blockMapping: {
        'A': 'aether:sentry_stone',
        'B': 'aether_redux:sentry_base'
    },
    consumeActivateItem: false,
    destroyAfterSpawn: false,
    weakMatch: true,
    patterns: RETURN_PORTAL_PATTERN,
    from: 'minecraft:overworld',
    to: 'sdbf:deep_realm_level_2',
    x: (player) => null,
    y: (player) => 140,
    z: (player) => null,
    clearDestinationBlocks: true,
    structureName: "deep_realm_level_2_portal"
});
