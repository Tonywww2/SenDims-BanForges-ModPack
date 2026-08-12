// priority: 100

let BASE_STRUCTURE_PATTERNS = [
    [
        " A ",
        "AAA",
        " A "
    ],
    [
        "A A",
        " B ",
        "A A"
    ],
    [
        "CAC",
        "AAA",
        "CAC"
    ]
];

let RETURN_PORTAL_PATTERN = [
    [
        "   ",
        "   ",
        "   "
    ],
    [
        "   ",
        " B ",
        "   "
    ],
    [
        "AAA",
        "AAA",
        "AAA"
    ]
];

let registeredStructures = Utils.newMap();

/**
 * boss召唤结构
 * @param {Object} config
 * @param {Object} config.blockMapping - 方块映射 {A: 'block_id', B: 'block_id', C: 'block_id'}
 * @param {Function} config.executeCommands - 执行的函数 (level, centerPos, player) => void
 * @param {string} config.structureName - 结构名
 * @param {boolean} config.destroyAfterSpawn - 召唤后是否销毁结构
 * @param {boolean} config.weakMatch - 是否忽略 pattern 中的空格坐标
 * @param {string} config.failMessage - 结构不匹配时的提示消息
 */
let createBossStructure = (config) => {

    let activateItem = config.activateItem;
    let blockMapping = config.blockMapping;
    let executeCommands = config.executeCommands;

    let structureName = config.structureName;
    let failMessage = config.failMessage;
    let patterns = config.patterns;
    let destroyAfterSpawn = config.destroyAfterSpawn;
    let consumeActivateItem = config.consumeActivateItem;
    let weakMatch = config.weakMatch;

    if (!structureName) structureName = "Boss";
    if (!failMessage) failMessage = Text.translatable("info.kubejs.faill_spawn_structure");
    if (!patterns) patterns = BASE_STRUCTURE_PATTERNS;
    if (destroyAfterSpawn === undefined) destroyAfterSpawn = true;
    if (consumeActivateItem === undefined) consumeActivateItem = true;
    if (weakMatch === undefined) weakMatch = false;

    let configuredPositions = [];
    let emptyPositions = [];
    for (let layerIndex = 0; layerIndex < patterns.length; layerIndex++) {
        let pattern = patterns[layerIndex];
        let yOffset = 1 - layerIndex;
        for (let row = 0; row < pattern.length; row++) {
            let rowPattern = pattern[row];
            let zOffset = row - 1;
            for (let col = 0; col < rowPattern.length; col++) {
                let expectedChar = rowPattern.charAt(col);
                let position = [col - 1, yOffset, zOffset];
                if (expectedChar === ' ') {
                    emptyPositions.push(position);
                } else {
                    position.push(Block.getBlock(blockMapping[expectedChar]));
                    configuredPositions.push(position);
                }
            }
        }
    }

    let destroyStructure = (level, centerPos) => {
        for (let position of configuredPositions) {
            let blockPos = centerPos.offset(position[0], position[1], position[2]);
            level.removeBlock(blockPos, true);
            level.setBlock(blockPos, Blocks.AIR.defaultBlockState(), 2);
        }
    };

    let checkStructure = (level, centerPos) => {
        for (let position of configuredPositions) {
            let checkPos = centerPos.offset(position[0], position[1], position[2]);
            let actualBlock = level.getBlockState(checkPos).getBlock();
            if (!actualBlock.equals(position[3])) return false;
        }

        if (!weakMatch) {
            for (let position of emptyPositions) {
                let checkPos = centerPos.offset(position[0], position[1], position[2]);
                let actualBlock = level.getBlockState(checkPos).getBlock();
                if (!actualBlock.equals(Blocks.AIR)) return false;
            }
        }
        return true;
    };

    let spawn = (level, centerPos, player, event) => {
        if (destroyAfterSpawn) {
            destroyStructure(level, centerPos);
        }
        player.addItemCooldown(event.item, 100);
        if (consumeActivateItem) {
            event.item.shrink(1);
        }
        // console.log(config)
        executeCommands(level, centerPos, player);
    };

    return {
        activateItem: activateItem,
        blockMapping: blockMapping,
        executeCommands: executeCommands,
        structureName: structureName,
        destroyAfterSpawn: destroyAfterSpawn,
        failMessage: failMessage,
        patterns: patterns,
        weakMatch: weakMatch,

        checkStructure: checkStructure,
        spawn: spawn,
        destroyStructure: destroyStructure
    };
}


/**
 * 注册一个传送结构
 * @param {Object} config
 */
let registerPortal = (config) => {
    let xf = config.x;
    let yf = config.y;
    let zf = config.z;
    let from = config.from;
    let toDim = config.to;
    let clearDestinationBlocks = config.clearDestinationBlocks;

    let executePortalCommands = (level, centerPos, player) => {
        if (from != null && level.dimensionKey !== from) {
            player.tell(Text.translatable("info.kubejs.wrong_dimension"));
            return;
        }

        let x = xf(player);
        let y = yf(player);
        let z = zf(player);

        let targetX = x != null ? x : centerPos.x;
        let targetY = y != null ? y : centerPos.y;
        let targetZ = z != null ? z : centerPos.z;

        // player.teleportTo(toDim, targetX + 0.5, targetY + 1, targetZ + 0.5, player.getYaw(), player.getPitch());
        player.server.runCommandSilent(`/execute in ${toDim} run tp ${player.name.string} ${targetX + 0.5} ${targetY + 1} ${targetZ + 0.5}`);


        if (clearDestinationBlocks) {
            let server = level.getServer();
            let targetLevel = server.getLevel(toDim);
            if (targetLevel) {
                let destPos = new BlockPos(targetX, targetY, targetZ);
                // Clear 5x7x5 area
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = 0; dy <= 6; dy++) {
                        for (let dz = -2; dz <= 2; dz++) {
                            let clearPos = destPos.offset(dx, dy, dz);
                            targetLevel.setBlock(clearPos, Blocks.AIR.defaultBlockState(), 2);
                        }
                    }
                }
                // Generate cobblestone ceiling (5x5)
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dz = -2; dz <= 2; dz++) {
                        let ceilPos = destPos.offset(dx, 7, dz);
                        targetLevel.setBlock(ceilPos, Blocks.COBBLESTONE.defaultBlockState(), 2);
                    }
                }

                // Generate return structure at bottom
                // Base obsidian
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        targetLevel.setBlock(destPos.offset(dx, -1, dz), Blocks.OBSIDIAN.defaultBlockState(), 2);
                    }
                }
                // Core crying obsidian
                targetLevel.setBlock(destPos, Blocks.CRYING_OBSIDIAN.defaultBlockState(), 2);
            }
        }
    };

    let portalConfig = Object.assign({}, config, { executeCommands: executePortalCommands });
    return registerStructure(portalConfig);
}

/**
 * 注册一个召唤结构
 * @param {Object} config
 */
let registerStructure = (config) => {
    let structure = createBossStructure(config);
    registeredStructures.put(config.activateItem, structure);
    return structure;
}

BlockEvents.rightClicked(event => {
    let { block, level, player, hand } = event;

    if (hand !== 'main_hand') return;

    let centerPos = event.block.pos;

    if (registeredStructures.containsKey(String(event.item.getId()))) {
        let structure = registeredStructures.get(String(event.item.getId()));
        if (block.id === structure.blockMapping['B']) {
            if (structure.checkStructure(level, centerPos)) {
                structure.spawn(level, centerPos, player, event);
                return;
            } else {
                player.tell(structure.failMessage);
                return;
            }
        }
    }
});