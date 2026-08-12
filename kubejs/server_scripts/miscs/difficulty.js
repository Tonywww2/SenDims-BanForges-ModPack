// priority: 80

let DIFFICULTY_STAGE_PREFIX = 'sdbf_difficulty_current_';
let DIFFICULTY_REWARD_ROUTE_STAGE_PREFIX = 'sdbf_difficulty_reward_route_';
let DIFFICULTY_REWARD_STAGE_PREFIX = 'sdbf_difficulty_rewarded_';
let DIFFICULTY_LOCK_STAGE = 'sdbf_difficulty_locked';
let DEFAULT_DIFFICULTY_ID = 'n_0';

let difficulty_list = [
    {
        id: 'n_0', level: 0,
        multipliers: { health: 1.0, attack: 1.0, armor: 1.0 },
        starterItems: [
            Item.of('slashblade:proudsoul_tiny')
        ],
        playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_-1', level: -1,
        multipliers: { health: 0.8, attack: 0.8, armor: 0.8 },
        starterItems: [],
        playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_-2', level: -2,
        multipliers: { health: 0.8, attack: 0.8, armor: 0.8 },
        starterItems: [
            Item.of('ae2:crafting_terminal', 2),
            Item.of("ae2:red_smart_cable", 16),
            Item.of("ae2:storage_bus", 4),
            Item.of("ae2:crystal_resonance_generator", 1),
        ],
        playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_-3', level: -3,
        multipliers: { health: 0.6, attack: 0.6, armor: 0.6 },
        starterItems: [
            Item.of('slashblade:proudsoul_ingot', 16),
            Item.of('slashblade:proudsoul_sphere', 8),
            Item.of('slashblade:proudsoul_crystal', 4),
        ],
        playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_-4', level: -4,
        multipliers: { health: 0.6, attack: 0.6, armor: 0.6 },
        starterItems: [
            Item.of('rehooked:ender_hook', 1),
            Item.of('draconicevolution:advanced_dislocator', '{fuel:128}')
        ],
        playerModifiers: [], eventRules: { entityDropMultiplier: 2 }
    },
    {
        id: 'n_-5', level: -5,
        multipliers: { health: 0.4, attack: 0.4, armor: 0.4 },
        starterItems: [],
        playerModifiers: [
            { key: 'ap_gain_percentage', amount: 1.5 },
            { key: 'ap_reduce_amount', amount: 300 }
        ],
        eventRules: { entityDropMultiplier: 3 }
    },
    {
        id: 'n_-10', level: -10,
        multipliers: { health: 0.1, attack: 0.1, armor: 0.1 },
        starterItems: [
            Item.of('storagedrawers:creative_vending_upgrade')
        ],
        playerModifiers: [], eventRules: { entityDropMultiplier: 3 }
    },
    {
        id: 'n_1', level: 1,
        multipliers: { health: 1.1, attack: 1.05, armor: 1.0 },
        starterItems: [], playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_2', level: 2,
        multipliers: { health: 1.2, attack: 1.1, armor: 1.0 },
        starterItems: [], playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_3', level: 3,
        multipliers: { health: 1.4, attack: 1.15, armor: 1.0 },
        starterItems: [
            Item.of('rodofdiscord:chaos_rod_500', 1)
        ],
        playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_4', level: 4,
        multipliers: { health: 1.6, attack: 1.15, armor: 1.1 },
        starterItems: [], playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_5', level: 5,
        multipliers: { health: 1.8, attack: 1.2, armor: 1.2 },
        starterItems: [], playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    },
    {
        id: 'n_10', level: 10,
        multipliers: { health: 3.0, attack: 1.5, armor: 1.5 },
        starterItems: [], playerModifiers: [], eventRules: { entityDropMultiplier: 1 }
    }
];

let negativeDifficultyChain = ['n_-1', 'n_-2', 'n_-3', 'n_-4', 'n_-5', 'n_-10'];
let positiveDifficultyChain = ['n_1', 'n_2', 'n_3', 'n_4', 'n_5', 'n_10'];
let difficultyDisplayOrder = negativeDifficultyChain.slice().reverse()
    .concat([DEFAULT_DIFFICULTY_ID], positiveDifficultyChain);
let difficultyById = {};
let difficultyIndexById = {};

// Add one catalog entry per logical modifier, then reference its key from a difficulty.
let modifierCatalog = {
    ap_gain_percentage: {
        uuid: '19f55a7d-f033-45fe-ba52-46b7012c6574',
        attribute: 'slashblade_sendims:ap_gain_percentage',
        operation: 'addition'
    },
    ap_reduce_amount: {
        uuid: 'c2dd843a-6588-432f-9fc7-9f6dd8d3487f',
        attribute: 'slashblade_sendims:ap_reduce_amount',
        operation: 'addition'
    }
};

difficulty_list.forEach((difficulty, index) => {
    difficultyById[difficulty.id] = difficulty;
    difficultyIndexById[difficulty.id] = index;
});

let compileModifierCatalog = () => {
    Object.keys(modifierCatalog).forEach(key => {
        let definition = modifierCatalog[key];
        definition.javaUuid = $UUID.fromString(definition.uuid);
        definition.javaOperation = $AttributeModifierOperation.valueOf(String(definition.operation).toUpperCase());
        definition.attributeInstance = $ForgeRegistries.ATTRIBUTES.getValue(ResourceLocation.parse(definition.attribute));
        definition.instances = {};
    });

    difficulty_list.forEach(difficulty => {
        difficulty.playerModifiers.forEach(modifier => {
            let definition = modifierCatalog[modifier.key];
            definition.instances[difficulty.id] = new $AttributeModifier(
                definition.javaUuid,
                `sdbf.difficulty.${modifier.key}`,
                modifier.amount,
                definition.javaOperation
            );
        });
    });
};

compileModifierCatalog();

let isRealPlayer = player => {
    return player && !(player.isFake && player.isFake());
};

let getDifficultyById = id => {
    return difficultyById[String(id)] || difficultyById[DEFAULT_DIFFICULTY_ID];
};

let getDifficultyStage = id => `${DIFFICULTY_STAGE_PREFIX}${id}`;
let getRewardStage = id => `${DIFFICULTY_REWARD_STAGE_PREFIX}${id}`;
let getRewardRouteStage = route => `${DIFFICULTY_REWARD_ROUTE_STAGE_PREFIX}${route}`;

let setPlayerDifficultyStage = (player, difficulty) => {
    let stagesToRemove = [];
    player.stages.getAll().forEach(stage => {
        let stageId = String(stage);
        if (stageId.indexOf(DIFFICULTY_STAGE_PREFIX) == 0) stagesToRemove.push(stageId);
    });
    stagesToRemove.forEach(stage => player.stages.remove(stage));
    player.stages.add(getDifficultyStage(difficulty.id));
};

let getPlayerDifficulty = player => {
    if (!isRealPlayer(player)) return difficultyById[DEFAULT_DIFFICULTY_ID];
    let stagedDifficulties = [];
    player.stages.getAll().forEach(stage => {
        let stageId = String(stage);
        if (stageId.indexOf(DIFFICULTY_STAGE_PREFIX) != 0) return;
        let difficultyId = stageId.substring(DIFFICULTY_STAGE_PREFIX.length);
        if (difficultyById[difficultyId]) stagedDifficulties.push(difficultyById[difficultyId]);
    });

    let difficulty = null;
    stagedDifficulties.forEach(stagedDifficulty => {
        if (!difficulty || stagedDifficulty.level < difficulty.level) difficulty = stagedDifficulty;
    });
    if (!difficulty) difficulty = difficultyById[DEFAULT_DIFFICULTY_ID];
    if (stagedDifficulties.length != 1 || stagedDifficulties[0].id != difficulty.id) {
        setPlayerDifficultyStage(player, difficulty);
    }
    return difficulty;
};

let giveStarterItems = (player, difficulty) => {
    difficulty.starterItems.forEach(stack => {
        player.give(stack.copy());
    });
};

let settleDifficultyReward = (player, difficulty) => {
    let rewardStage = getRewardStage(difficulty.id);
    if (player.stages.has(rewardStage)) return false;
    giveStarterItems(player, difficulty);
    player.stages.add(rewardStage);
    return true;
};

let getRewardRoute = difficulty => {
    if (difficulty.level < 0) return 'negative';
    if (difficulty.level > 0) return 'positive';
    return 'neutral';
};

let getEligibleMilestones = (player, target) => {
    if (target.level == 0) return [target];
    let route = getRewardRoute(target);
    let lockedRoute = player.stages.has(getRewardRouteStage('negative'))
        ? 'negative'
        : (player.stages.has(getRewardRouteStage('positive')) ? 'positive' : '');
    if (lockedRoute && lockedRoute != route) return [];
    let chain = route == 'negative' ? negativeDifficultyChain : positiveDifficultyChain;
    let targetIndex = chain.indexOf(target.id);
    if (targetIndex < 0) return [];
    let result = [];
    for (let i = 0; i <= targetIndex; i++) result.push(difficultyById[chain[i]]);
    return result;
};

let settleMilestoneRewards = (player, target) => {
    if (target.level != 0) {
        let route = getRewardRoute(target);
        let negativeRouteStage = getRewardRouteStage('negative');
        let positiveRouteStage = getRewardRouteStage('positive');
        if (!player.stages.has(negativeRouteStage) && !player.stages.has(positiveRouteStage)) {
            player.stages.add(getRewardRouteStage(route));
        }
    }
    getEligibleMilestones(player, target).forEach(difficulty => {
        settleDifficultyReward(player, difficulty);
    });
};

let syncDifficultyModifiers = player => {
    if (!isRealPlayer(player)) return;
    let difficulty = getPlayerDifficulty(player);
    Object.keys(modifierCatalog).forEach(key => {
        let definition = modifierCatalog[key];
        let instance = player.getAttribute(definition.attributeInstance);
        if (!instance) return;
        instance.removePermanentModifier(definition.javaUuid);
        let modifier = definition.instances[difficulty.id];
        if (modifier) instance.addPermanentModifier(modifier);
    });
};

let resetPlayerDifficulty = player => {
    let stagesToRemove = [];
    player.stages.getAll().forEach(stage => {
        let stageId = String(stage);
        if (stageId.indexOf('sdbf_difficulty_') == 0) stagesToRemove.push(stageId);
    });
    stagesToRemove.forEach(stage => player.stages.remove(stage));

    setPlayerDifficultyStage(player, difficultyById[DEFAULT_DIFFICULTY_ID]);
    settleDifficultyReward(player, difficultyById[DEFAULT_DIFFICULTY_ID]);
    syncDifficultyModifiers(player);
};

let initializePlayerDifficulty = player => {
    if (!isRealPlayer(player)) return;
    let difficulty = getPlayerDifficulty(player);
    if (difficulty.id == DEFAULT_DIFFICULTY_ID) settleDifficultyReward(player, difficulty);
    syncDifficultyModifiers(player);
};

let copyDifficultyDataAfterRespawn = (oldPlayer, player) => {
    if (!oldPlayer || !player) return;
    let oldDifficulty = getPlayerDifficulty(oldPlayer);
    oldPlayer.stages.getAll().forEach(stage => {
        let stageId = String(stage);
        if (stageId.indexOf('sdbf_difficulty_') == 0 && !player.stages.has(stageId)) {
            player.stages.add(stageId);
        }
    });
    setPlayerDifficultyStage(player, oldDifficulty);
};

let isDifficultyLocked = (player, target) => {
    let current = getPlayerDifficulty(player);
    if (player.stages.has(DIFFICULTY_LOCK_STAGE)) return target.id != current.id;
    if (current.level < 0) return target.level >= current.level;
    if (current.level > 0) return target.level <= current.level;
    return false;
};

let formatReward = stack => {
    return Text.of(`${stack.getCount()}x `).color(Color.GREEN)
        .append(stack.displayName);
};

let getDifficultyColumnPadding = difficulty => {
    let labelLength = `N ${difficulty.level}`.length;
    let padding = '';
    while (labelLength + padding.length < 5) padding += ' ';
    return padding;
};

let appendDifficultyRules = (hover, player, difficulty) => {
    if (difficulty.eventRules.entityDropMultiplier > 1) {
        hover.append('\n').append(Text.translatable(
            'kubejs.difficulty.entity_drop_mult',
            difficulty.eventRules.entityDropMultiplier
        ).color(Color.GREEN));
    }
    if (difficulty.starterItems.length > 0) {
        hover.append('\n').append(Text.translatable('kubejs.difficulty.rewards').color(Color.AQUA));
        difficulty.starterItems.forEach(reward => {
            hover.append('\n').append(Text.of('  - ')).append(formatReward(reward));
        });
    }

    let pendingRewards = [];
    getEligibleMilestones(player, difficulty).forEach(milestone => {
        if (player.stages.has(getRewardStage(milestone.id))) return;
        milestone.starterItems.forEach(reward => pendingRewards.push(reward));
    });
    if (pendingRewards.length > 0) {
        hover.append('\n').append(Text.translatable('kubejs.difficulty.pending_rewards').color(Color.YELLOW));
        pendingRewards.forEach(reward => {
            hover.append('\n').append(Text.of('  - ')).append(formatReward(reward));
        });
    }

    if (difficulty.playerModifiers.length > 0) {
        hover.append('\n').append(Text.translatable('kubejs.difficulty.modifiers').color(Color.AQUA));
        difficulty.playerModifiers.forEach(modifier => {
            let definition = modifierCatalog[modifier.key];
            hover.append('\n').append(Text.of(`  - ${definition.attribute}: ${modifier.amount} (${definition.operation})`));
        });
    }
};

let renderDifficultyConfirmation = (player, difficulty, commandIndex) => {
    let difficultyName = Text.translatable(`kubejs.difficulty.${difficulty.id}`);
    let warningKey = difficulty.level < 0
        ? 'kubejs.difficulty.confirm_warning_negative'
        : 'kubejs.difficulty.confirm_warning_positive';
    let warning = Text.translatable(warningKey, difficultyName)
        .color(Color.RED);
    let confirmButton = Text.of('[ ').color(Color.WHITE)
        .append(Text.translatable('kubejs.difficulty.confirm_button', difficultyName).color(Color.YELLOW))
        .append(Text.of(' ]').color(Color.WHITE))
        .hover(warning)
        .click(new $ClickEvent(
            $ClickEventAction.RUN_COMMAND,
            `/sdbf_difficulty_menu confirm ${commandIndex}`
        ));

    player.tell(warning);
    player.tell(confirmButton);
};

global.getDifficultyById = getDifficultyById;
global.getPlayerDifficulty = getPlayerDifficulty;
global.syncDifficultyModifiers = syncDifficultyModifiers;
global.getHighestNearbyDifficulty = entity => {
    let selected = difficultyById[DEFAULT_DIFFICULTY_ID];
    let foundPlayer = false;
    entity.level.server.players.forEach(player => {
        if (!isRealPlayer(player) || player.isCreative() || player.isSpectator()) return;
        if (String(player.level.dimension) != String(entity.level.dimension)) return;
        if (Math.abs(player.x - entity.x) > 64) return;
        if (Math.abs(player.y - entity.y) > 64) return;
        if (Math.abs(player.z - entity.z) > 64) return;
        let difficulty = getPlayerDifficulty(player);
        if (!foundPlayer || difficulty.level > selected.level) selected = difficulty;
        foundPlayer = true;
    });
    return selected;
};

ServerEvents.commandRegistry(event => {
    let { commands: Commands, arguments: Arguments } = event;
    event.register(
        Commands.literal('sdbf_difficulty_menu')
            .executes(c => {
                let player = c.source.player;
                if (!isRealPlayer(player)) {
                    c.source.sendFailure(Text.translatable('kubejs.difficulty.player_only'));
                    return 0;
                }
                initializePlayerDifficulty(player);
                global.renderDifficulty(player);
                return 1;
            })
            .then(Commands.literal('confirm')
                .then(Commands.argument('index', Arguments.INTEGER.create(event))
                    .executes(c => global.setDifficultyFromCmd(c, Arguments, true))
                )
            )
            .then(Commands.argument('index', Arguments.INTEGER.create(event))
                .executes(c => global.setDifficultyFromCmd(c, Arguments, false))
            )
    );

    if (global.difficultyResetCommandEnabled) {
        event.register(
            Commands.literal('sdbf_difficulty_reset')
                .requires(source => source.hasPermission(2))
                .executes(c => {
                    let player = c.source.player;
                    if (!isRealPlayer(player)) {
                        c.source.sendFailure(Text.translatable('kubejs.difficulty.player_only'));
                        return 0;
                    }
                    resetPlayerDifficulty(player);
                    player.tell(Text.translatable('kubejs.difficulty.reset_success').color(Color.GREEN));
                    global.renderDifficulty(player);
                    return 1;
                })
        );
    }
});

global.renderDifficulty = player => {
    if (!isRealPlayer(player)) return;
    let current = getPlayerDifficulty(player);
    let rewardRoute = player.stages.has(getRewardRouteStage('negative'))
        ? 'negative'
        : (player.stages.has(getRewardRouteStage('positive')) ? 'positive' : '');

    player.tell(Text.translatable('kubejs.difficulty.title').color(Color.AQUA));

    for (let displayIndex = 0; displayIndex < difficultyDisplayOrder.length; displayIndex++) {
        let difficulty = difficultyById[difficultyDisplayOrder[displayIndex]];
        let commandIndex = difficultyIndexById[difficulty.id];
        let isCurrent = difficulty.id == current.id;
        let locked = !isCurrent && isDifficultyLocked(player, difficulty);
        let color = isCurrent ? Color.LIGHT_PURPLE : (locked ? Color.DARK_GRAY : Color.GRAY);
        let multipliers = difficulty.multipliers;

        let hover = Text.translatable(`kubejs.difficulty.${difficulty.id}.desc`).color(Color.WHITE)
            .append('\n')
            .append(Text.translatable('kubejs.difficulty.hp_mult', multipliers.health).color(Color.RED))
            .append('\n')
            .append(Text.translatable('kubejs.difficulty.atk_mult', multipliers.attack).color(Color.GOLD))
            .append('\n')
            .append(Text.translatable('kubejs.difficulty.armor_mult', multipliers.armor).color(Color.BLUE));

        appendDifficultyRules(hover, player, difficulty);
        if (locked) {
            let lockedKey = player.stages.has(DIFFICULTY_LOCK_STAGE)
                ? 'kubejs.difficulty.permanently_locked'
                : 'kubejs.difficulty.locked';
            hover.append('\n').append(Text.translatable(lockedKey).color(Color.RED));
        }
        let targetRoute = getRewardRoute(difficulty);
        if (difficulty.level != 0 && rewardRoute && rewardRoute != targetRoute) {
            hover.append('\n').append(Text.translatable('kubejs.difficulty.reward_route_locked').color(Color.YELLOW));
        }

        let difficultyColumn = Text.translatable(`kubejs.difficulty.${difficulty.id}`)
            .color(color)
            .append(Text.of(getDifficultyColumnPadding(difficulty)))
            .hover(hover);
        let actionButton = Text.of('[ ').color(Color.WHITE);
        if (isCurrent) {
            actionButton.append(Text.translatable('kubejs.difficulty.current').color(Color.GREEN));
        } else if (locked) {
            let lockedShortKey = player.stages.has(DIFFICULTY_LOCK_STAGE)
                ? 'kubejs.difficulty.permanently_locked_short'
                : 'kubejs.difficulty.locked_short';
            actionButton.append(Text.translatable(lockedShortKey).color(Color.RED));
        } else {
            actionButton.append(Text.translatable('kubejs.difficulty.click_to_switch').color(Color.YELLOW));
            actionButton.click(new $ClickEvent(
                $ClickEventAction.RUN_COMMAND,
                `/sdbf_difficulty_menu ${commandIndex}`
            ));
        }
        actionButton.append(Text.of(' ]').color(Color.WHITE)).hover(hover);

        player.tell(Text.of('- ')
            .append(difficultyColumn)
            .append(Text.of('    '))
            .append(actionButton));
    }
};

global.setDifficultyFromCmd = (c, Arguments, confirmed) => {
    let player = c.source.player;
    if (!isRealPlayer(player)) {
        c.source.sendFailure(Text.translatable('kubejs.difficulty.player_only'));
        return 0;
    }
    initializePlayerDifficulty(player);

    let index = Arguments.INTEGER.getResult(c, 'index');
    if (index < 0 || index >= difficulty_list.length) {
        player.tell(Text.translatable('kubejs.difficulty.invalid_index').color(Color.RED));
        return 0;
    }

    let target = difficulty_list[index];
    let current = getPlayerDifficulty(player);
    if (target.id == current.id) {
        global.renderDifficulty(player);
        return 1;
    }
    if (isDifficultyLocked(player, target)) {
        player.tell(Text.translatable('kubejs.difficulty.cannot_increase').color(Color.RED));
        return 0;
    }
    if (target.level != 0 && !confirmed) {
        renderDifficultyConfirmation(player, target, index);
        return 1;
    }

    setPlayerDifficultyStage(player, target);
    settleMilestoneRewards(player, target);
    syncDifficultyModifiers(player);

    player.server.players.forEach(receiver => {
        receiver.tell(Text.translatable(
            'kubejs.difficulty.set_success',
            player.displayName,
            Text.translatable(`kubejs.difficulty.${target.id}`)
        ).color(Color.GREEN));
    });
    global.renderDifficulty(player);
    return 1;
};

PlayerEvents.loggedIn(event => {
    initializePlayerDifficulty(event.player);
});

PlayerEvents.respawned(event => {
    let player = event.player;
    if (!isRealPlayer(player)) return;
    copyDifficultyDataAfterRespawn(event.oldPlayer, player);
    initializePlayerDifficulty(player);
});

ItemEvents.rightClicked('kubejs:difficulty_selector', event => {
    let player = event.player;
    if (!isRealPlayer(player)) return;
    initializePlayerDifficulty(player);
    global.renderDifficulty(player);
    player.cooldowns.addCooldown(event.item, 10);
});

ItemEvents.rightClicked('kubejs:difficulty_locker', event => {
    let player = event.player;
    if (!isRealPlayer(player)) return;
    initializePlayerDifficulty(player);
    player.cooldowns.addCooldown(event.item, 10);
    if (player.stages.has(DIFFICULTY_LOCK_STAGE)) {
        player.tell(Text.translatable('kubejs.difficulty.lock_already').color(Color.YELLOW));
        return;
    }

    player.stages.add(DIFFICULTY_LOCK_STAGE);
    player.tell(Text.translatable(
        'kubejs.difficulty.lock_success',
        Text.translatable(`kubejs.difficulty.${getPlayerDifficulty(player).id}`)
    ).color(Color.RED));
});

NativeEvents.onEvent($PlayerNameFormatEvent, event => {
    let player = event.entity;
    if (!isRealPlayer(player)) return;
    let difficulty = getPlayerDifficulty(player);
    let displayName = Text.of('[').color(Color.GRAY)
        .append(Text.translatable(`kubejs.difficulty.${difficulty.id}`).color(Color.AQUA))
        .append(Text.of('] ').color(Color.GRAY))
        .append(event.username);
    event.setDisplayname(displayName);
});
