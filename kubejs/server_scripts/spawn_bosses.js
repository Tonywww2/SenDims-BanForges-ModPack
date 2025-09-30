const BASE_STRUCTURE_PATTERNS = [
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

/**
 * boss召唤结构
 * @param {Object} config
 * @param {Object} config.blockMapping - 方块映射 {A: 'block_id', B: 'block_id', C: 'block_id'}
 * @param {Function} config.executeCommands - 执行的函数 (level, centerPos, player) => void
 * @param {string} config.structureName - 结构名
 * @param {boolean} config.destroyAfterSpawn - 召唤后是否销毁结构
 * @param {string} config.failMessage - 结构不匹配时的提示消息
 */
const createBossStructure = (config) => {

    let activateItem = config.activateItem;
    let blockMapping = config.blockMapping;
    let executeCommands = config.executeCommands;

    let structureName = config.structureName;
    let failMessage = config.failMessage;
    let patterns = config.patterns;
    let destroyAfterSpawn = config.destroyAfterSpawn;

    if (!structureName) structureName = "Boss";
    if (!failMessage) failMessage = Text.translatable("info.kubejs.faill_spawn_structure");
    if (!patterns) patterns = BASE_STRUCTURE_PATTERNS;
    if (destroyAfterSpawn === undefined) destroyAfterSpawn = true;

    const destroyStructure = (level, centerPos) => {
        for (let layerIndex = 0; layerIndex < patterns.length; layerIndex++) {
            const pattern = patterns[layerIndex];
            const yOffset = 1 - layerIndex;
            for (let row = 0; row < pattern.length; row++) {
                const rowPattern = pattern[row];
                const zOffset = row - 1;
                for (let col = 0; col < rowPattern.length; col++) {
                    const expectedChar = rowPattern.charAt(col);
                    const xOffset = col - 1;
                    // if (expectedChar != " ") {
                        const blockPos = centerPos.offset(xOffset, yOffset, zOffset);
                        console.log(blockPos)
                        level.removeBlock(blockPos, true);
                    // }
                }
            }
        }
    };

    const checkStructure = (level, centerPos) => {
        for (let layerIndex = 0; layerIndex < patterns.length; layerIndex++) {
            const pattern = patterns[layerIndex];
            const yOffset = 1 - layerIndex;

            for (let row = 0; row < pattern.length; row++) {
                const rowPattern = pattern[row];
                const zOffset = row - 1;

                for (let col = 0; col < rowPattern.length; col++) {
                    const expectedChar = rowPattern.charAt(col);
                    const xOffset = col - 1;

                    const checkPos = centerPos.offset(xOffset, yOffset, zOffset);
                    const actualBlock = level.getBlockState(checkPos).getBlock();

                    if (expectedChar === ' ') {
                        if (!actualBlock.equals(Blocks.AIR)) {
                            return false;
                        }
                    } else {
                        const expectedBlock = blockMapping[expectedChar];
                        if (!expectedBlock || !actualBlock.equals(Block.getBlock(expectedBlock))) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    };

    const spawn = (level, centerPos, player, event) => {
        if (destroyAfterSpawn) {
            destroyStructure(level, centerPos);
        }
        player.addItemCooldown(event.item, 100);
        event.item.shrink(1);
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

        checkStructure: checkStructure,
        spawn: spawn,
        destroyStructure: destroyStructure
    };
}

const registeredStructures = new Map();

/**
 * 注册一个召唤结构
 * @param {Object} config
 */
const registerBossStructure = (config) => {
    const structure = createBossStructure(config);
    registeredStructures.set(config.activateItem, structure);
    return structure;
}

registerBossStructure({
    activateItem: 'blue_skies:pyrope_gem',
    blockMapping: {
        'A': 'blue_skies:starlit_planks',
        'B': 'blue_skies:moonstone_block',
        'C': 'blue_skies:turquoise_stonebrick'
    },
    destroyAfterSpawn: true,
    executeCommands: (level, centerPos, player) => {
        player.tell(Text.of("TungTungTung").obfuscated())
        level.runCommandSilent(`execute at ${player.name.string} run place structure blue_skies:everbright_blinding_dungeon`);
    },
    structureName: "everbright_blinding_dungeon"
});

registerBossStructure({
    activateItem: 'blue_skies:starlit_sapling',
    blockMapping: {
        'A': 'blue_skies:turquoise_stonebrick',
        'B': 'blue_skies:pyrope_block',
        'C': 'blue_skies:moonstone_block'
    },
    destroyAfterSpawn: true,
    executeCommands: (level, centerPos, player) => {
        player.tell(Text.of("TungTungTung").obfuscated())
        level.runCommandSilent(`execute at ${player.name.string} run place structure blue_skies:nature_dungeon`);
    },
    structureName: "nature_dungeon"
});

BlockEvents.rightClicked(event => {
    const { block, level, player, hand } = event;

    if (hand !== 'main_hand') return;

    const centerPos = event.block.pos;

    if (registeredStructures.has(String(event.item.getId()))) {
        const structure = registeredStructures.get(String(event.item.getId()));
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