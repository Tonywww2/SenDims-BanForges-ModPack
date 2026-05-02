registerPortal({
    activateItem: 'minecraft:stick',
    blockMapping: {
        'A': 'minecraft:obsidian',
        'B': 'minecraft:crying_obsidian'
    },
    consumeActivateItem: false,
    destroyAfterSpawn: false,
    patterns: RETURN_PORTAL_PATTERN,
    from: null,
    to: 'minecraft:overworld',
    x: SPAWN_X,
    y: PLAYER_Y,
    z: SPAWN_Z,
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
    patterns: RETURN_PORTAL_PATTERN,
    from: 'minecraft:overworld',
    to: 'tofucraft:tofu_world',
    x: null,
    y: 64,
    z: null,
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
    patterns: RETURN_PORTAL_PATTERN,
    from: 'minecraft:overworld',
    to: 'sdbf:deep_realm_level_1',
    x: null,
    y: 285,
    z: null,
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
    patterns: RETURN_PORTAL_PATTERN,
    from: 'minecraft:overworld',
    to: 'sdbf:deep_realm_level_2',
    x: null,
    y: 140,
    z: null,
    clearDestinationBlocks: true,
    structureName: "deep_realm_level_2_portal"
});
