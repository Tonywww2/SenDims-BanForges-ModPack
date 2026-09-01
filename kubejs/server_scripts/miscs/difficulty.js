// priority: 80

let DIFFICULTY_SCHEMA_STAGE = 'sdbf_difficulty_schema_v5';
let DIFFICULTY_STAGE_PREFIX = 'sdbf_difficulty_axis_';
let DIFFICULTY_SUB_STAGE_PREFIX = 'sdbf_difficulty_sub_';
let DIFFICULTY_LOCK_STAGE = 'sdbf_difficulty_locked';
let DIFFICULTY_UI_PATH = 'screens/difficulty.html';
let DIFFICULTY_DATA_CHANNEL = 'sdbf_difficulty_data';
let DIFFICULTY_PROBE_CHANNEL = 'sdbf_difficulty_probe';
let DEFAULT_DIFFICULTY_ID = 'n_0';
let DEFAULT_X_PAGE = 1;
let DEFAULT_Y_PAGE = 0;
let SUB_ROWS_PER_PAGE = 6;
let GRID_CELL_WIDTH = 6;
let UNIFORM_FONT = ResourceLocation.parse('minecraft:uniform');

let AXIS_WINDOW_SIZE = 11;
let AXIS_WINDOW_STEP = 5;
let axisWindows = [];
let lastAxisWindowStart = Math.max(0, axisDefinitions.length - AXIS_WINDOW_SIZE);
for (let start = 0; start <= lastAxisWindowStart; start += AXIS_WINDOW_STEP) {
    axisWindows.push(axisDefinitions.slice(start, start + AXIS_WINDOW_SIZE));
}
if (axisWindows.length == 0 || axisWindows[axisWindows.length - 1][0] != axisDefinitions[lastAxisWindowStart]) {
    axisWindows.push(axisDefinitions.slice(lastAxisWindowStart));
}
let axisById = {};
let axisByLevel = {};
axisDefinitions.forEach(axis => {
    axis.items = axis.items || [];
    axisById[axis.id] = axis;
    axisByLevel[axis.level] = axis;
});

let subCategoryById = {};
subCategories.forEach(category => subCategoryById[category.id] = category);

let subModifierById = {};
let attributeSubModifiers = [];
let dropSubModifiers = [];
let enemySubModifiers = [];
subModifierDefinitions.forEach(modifier => {
    subModifierById[modifier.id] = modifier;
    if (modifier.effect.type == 'attribute') attributeSubModifiers.push(modifier);
    if (modifier.effect.type == 'drop') dropSubModifiers.push(modifier);
    if (modifier.effect.type == 'enemy') enemySubModifiers.push(modifier);
});

let buildSubRows = () => {
    let rows = [];
    subCategories.slice().sort((left, right) => left.order - right.order).forEach(category => {
        let modifiersByLevel = {};
        let maxRows = 0;
        subModifierDefinitions.forEach(modifier => {
            if (modifier.category != category.id) return;
            let levelKey = String(modifier.requiredLevel);
            if (!modifiersByLevel[levelKey]) modifiersByLevel[levelKey] = [];
            modifiersByLevel[levelKey].push(modifier);
            maxRows = Math.max(maxRows, modifiersByLevel[levelKey].length);
        });

        for (let lane = 0; lane < maxRows; lane++) {
            let cells = {};
            Object.keys(modifiersByLevel).forEach(levelKey => {
                let modifier = modifiersByLevel[levelKey][lane];
                if (modifier) cells[levelKey] = modifier;
            });
            rows.push({ category: category.id, lane: lane, cells: cells });
        }
    });
    return rows;
};

let compiledSubRows = buildSubRows();
let visibleSubRowsByPage = axisWindows.map(window => {
    let levels = {};
    window.forEach(axis => levels[String(axis.level)] = true);
    return compiledSubRows.filter(row => {
        for (let levelKey in row.cells) {
            if (levels[levelKey]) return true;
        }
        return false;
    });
});

let compileModifierCatalog = () => {
    Object.keys(modifierCatalog).forEach(key => {
        let definition = modifierCatalog[key];
        definition.javaUuid = $UUID.fromString(definition.uuid);
        definition.javaOperation = $AttributeModifierOperation.valueOf(String(definition.operation).toUpperCase());
        definition.attributeInstance = $ForgeRegistries.ATTRIBUTES.getValue(ResourceLocation.parse(definition.attribute));
        definition.instance = new $AttributeModifier(
            definition.javaUuid,
            `sdbf.difficulty.${key}`,
            definition.amount,
            definition.javaOperation
        );
    });
};

compileModifierCatalog();

let isRealPlayer = player => {
    return player && !(player.isFake && player.isFake());
};

let getDifficultyById = id => {
    return axisById[String(id)] || axisById[DEFAULT_DIFFICULTY_ID];
};

let getDifficultyStage = id => `${DIFFICULTY_STAGE_PREFIX}${id}`;
let getSubModifierStage = id => `${DIFFICULTY_SUB_STAGE_PREFIX}${id}`;

let syncDifficultyStages = player => {
    if (isRealPlayer(player) && player.stages && player.stages.sync) player.stages.sync();
};

let refreshDifficultyDisplayName = player => {
    if (!isRealPlayer(player)) return;
    if (player.refreshDisplayName) player.refreshDisplayName();
    if (player.refreshTabListName) player.refreshTabListName();
};

let clearDifficultyStages = player => {
    let stagesToRemove = [];
    player.stages.getAll().forEach(stage => {
        let stageId = String(stage);
        if (stageId.indexOf('sdbf_difficulty_') == 0) stagesToRemove.push(stageId);
    });
    stagesToRemove.forEach(stage => player.stages.remove(stage));
};

let ensureDifficultySchema = player => {
    if (player.stages.has(DIFFICULTY_SCHEMA_STAGE)) return;
    clearDifficultyStages(player);
    player.stages.add(DIFFICULTY_SCHEMA_STAGE);
    player.stages.add(getDifficultyStage(DEFAULT_DIFFICULTY_ID));
};

let setPlayerDifficultyStage = (player, difficulty) => {
    let stagesToRemove = [];
    player.stages.getAll().forEach(stage => {
        let stageId = String(stage);
        if (stageId.indexOf(DIFFICULTY_STAGE_PREFIX) == 0) stagesToRemove.push(stageId);
    });
    stagesToRemove.forEach(stage => player.stages.remove(stage));
    player.stages.add(getDifficultyStage(difficulty.id));
    syncDifficultyStages(player);
    refreshDifficultyDisplayName(player);
};

let getPlayerDifficulty = player => {
    if (!isRealPlayer(player)) return axisById[DEFAULT_DIFFICULTY_ID];
    ensureDifficultySchema(player);
    let current = null;
    player.stages.getAll().forEach(stage => {
        let stageId = String(stage);
        if (stageId.indexOf(DIFFICULTY_STAGE_PREFIX) != 0) return;
        let difficultyId = stageId.substring(DIFFICULTY_STAGE_PREFIX.length);
        if (axisById[difficultyId]) current = axisById[difficultyId];
    });

    if (!current) {
        current = axisById[DEFAULT_DIFFICULTY_ID];
        setPlayerDifficultyStage(player, current);
    }
    return current;
};

let getAxisState = (player, target, current) => {
    if (!current) current = getPlayerDifficulty(player);
    if (target.id == current.id) return 'selected';
    if (player.stages.has(DIFFICULTY_LOCK_STAGE)) return 'locked';
    if (current.level < 0) return target.level < current.level ? 'available' : 'locked';
    if (current.level > 0) return target.level > current.level ? 'available' : 'locked';
    return target.level == 0 ? 'selected' : 'available';
};

let isSubModifierSelected = (player, modifier) => {
    return player.stages.has(getSubModifierStage(modifier.id));
};

let getSubModifierState = (player, modifier, current) => {
    if (isSubModifierSelected(player, modifier)) return 'selected';
    if (player.stages.has(DIFFICULTY_LOCK_STAGE)) return 'locked';

    let currentLevel = current ? current.level : getPlayerDifficulty(player).level;
    if (modifier.requiredLevel == 0) return 'available';
    if (modifier.requiredLevel < 0) {
        if (currentLevel > 0) return 'locked';
        return currentLevel <= modifier.requiredLevel ? 'available' : 'unmet';
    }
    if (currentLevel < 0) return 'locked';
    return currentLevel >= modifier.requiredLevel ? 'available' : 'unmet';
};

let applySubModifier = (player, modifier) => {
    player.stages.add(getSubModifierStage(modifier.id));
    if (modifier.effect.type == 'item') player.give(modifier.effect.stack.copy());
    if (modifier.effect.type == 'attribute') syncDifficultyModifiers(player);
};

let syncDifficultyModifiers = player => {
    if (!isRealPlayer(player)) return;
    Object.keys(modifierCatalog).forEach(key => {
        let definition = modifierCatalog[key];
        let instance = player.getAttribute(definition.attributeInstance);
        if (!instance) return;
        instance.removePermanentModifier(definition.javaUuid);
    });

    attributeSubModifiers.forEach(modifier => {
        if (!isSubModifierSelected(player, modifier)) return;
        let definition = modifierCatalog[modifier.effect.modifierKey];
        let instance = player.getAttribute(definition.attributeInstance);
        if (instance) instance.addPermanentModifier(definition.instance);
    });
};

let getPlayerDropMultiplier = player => {
    let multiplier = 1;
    dropSubModifiers.forEach(modifier => {
        if (isSubModifierSelected(player, modifier)) multiplier += modifier.effect.bonus;
    });
    return multiplier;
};

let getPlayerEnemyBonuses = player => {
    let bonuses = { health: 0, attack: 0, armor: 0 };
    enemySubModifiers.forEach(modifier => {
        if (!isSubModifierSelected(player, modifier)) return;
        let stat = modifier.effect.stat;
        if (bonuses[stat] != undefined) bonuses[stat] += modifier.effect.bonus;
    });
    return bonuses;
};

let resetPlayerDifficulty = player => {
    clearDifficultyStages(player);
    player.stages.add(DIFFICULTY_SCHEMA_STAGE);
    player.stages.add(getDifficultyStage(DEFAULT_DIFFICULTY_ID));
    syncDifficultyModifiers(player);
    syncDifficultyStages(player);
    refreshDifficultyDisplayName(player);
};

let initializePlayerDifficulty = player => {
    if (!isRealPlayer(player)) return;
    ensureDifficultySchema(player);
    getPlayerDifficulty(player);
    syncDifficultyModifiers(player);
};

let copyDifficultyDataAfterRespawn = (oldPlayer, player) => {
    if (!oldPlayer || !player) return;
    ensureDifficultySchema(oldPlayer);
    clearDifficultyStages(player);
    oldPlayer.stages.getAll().forEach(stage => {
        let stageId = String(stage);
        if (stageId.indexOf('sdbf_difficulty_') == 0 && !player.stages.has(stageId)) {
            player.stages.add(stageId);
        }
    });
};

let formatDifficultyAdjustment = multiplier => {
    let percentage = Math.round((multiplier - 1) * 100);
    if (percentage > 0) return `+${percentage}%`;
    return `${percentage}%`;
};

let appendAdjustment = (text, labelKey, multiplier) => {
    text.append(Text.translatable(labelKey).color(Color.GRAY))
        .append(Text.of(' ').color(Color.DARK_GRAY))
        .append(Text.of(formatDifficultyAdjustment(multiplier)).color(Color.WHITE));
};

let getStateColor = state => {
    if (state == 'selected') return Color.WHITE;
    if (state == 'available') return Color.AQUA;
    if (state == 'locked') return Color.RED;
    return Color.DARK_GRAY;
};

global.getDifficultyById = getDifficultyById;
global.getPlayerDifficulty = getPlayerDifficulty;
global.syncDifficultyModifiers = syncDifficultyModifiers;
global.getPlayerDropMultiplier = getPlayerDropMultiplier;
global.getPlayerEnemyBonuses = getPlayerEnemyBonuses;
let forEachNearbyDifficultyPlayer = (entity, consumer) => {
    entity.level.server.players.forEach(player => {
        if (!isRealPlayer(player) || player.isCreative() || player.isSpectator()) return;
        if (String(player.level.dimension) != String(entity.level.dimension)) return;
        if (Math.abs(player.x - entity.x) > 64) return;
        if (Math.abs(player.y - entity.y) > 64) return;
        if (Math.abs(player.z - entity.z) > 64) return;
        consumer(player);
    });
};
global.getHighestNearbyDifficulty = entity => {
    let selected = axisById[DEFAULT_DIFFICULTY_ID];
    let foundPlayer = false;
    forEachNearbyDifficultyPlayer(entity, player => {
        let difficulty = getPlayerDifficulty(player);
        if (!foundPlayer || difficulty.level > selected.level) selected = difficulty;
        foundPlayer = true;
    });
    return selected;
};
global.getHighestNearbyEnemyBonuses = entity => {
    let highest = { health: 0, attack: 0, armor: 0 };
    forEachNearbyDifficultyPlayer(entity, player => {
        let bonuses = getPlayerEnemyBonuses(player);
        highest.health = Math.max(highest.health, bonuses.health);
        highest.attack = Math.max(highest.attack, bonuses.attack);
        highest.armor = Math.max(highest.armor, bonuses.armor);
    });
    return highest;
};

let makeSpaces = count => {
    let spaces = '';
    for (let i = 0; i < count; i++) spaces += ' ';
    return spaces;
};

let centerCell = (label, clickable) => {
    let value = clickable ? `[${label}]` : String(label);
    let padding = Math.max(0, GRID_CELL_WIDTH - value.length);
    let left = Math.floor(padding / 2);
    return makeSpaces(left) + value + makeSpaces(padding - left);
};

let withUniformFont = component => {
    return component.font(UNIFORM_FONT);
};

let getAxisLabel = level => {
    return `N${level > 0 ? '+' : ''}${level}`;
};

let clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
};

let getVisibleSubRows = xPage => {
    return visibleSubRowsByPage[xPage];
};

let normalizeView = (xPage, yPage) => {
    let normalizedX = clamp(xPage, 0, axisWindows.length - 1);
    let rows = getVisibleSubRows(normalizedX);
    let maxY = Math.max(0, Math.ceil(rows.length / SUB_ROWS_PER_PAGE) - 1);
    return {
        xPage: normalizedX,
        yPage: clamp(yPage, 0, maxY),
        rows: rows,
        maxY: maxY
    };
};

let getDefaultXPage = player => {
    let level = getPlayerDifficulty(player).level;
    let selectedPage = 0;
    let selectedDistance = Number.MAX_VALUE;
    axisWindows.forEach((window, page) => {
        if (!window.some(axis => axis.level == level)) return;
        let centerLevel = window[Math.floor(window.length / 2)].level;
        let distance = Math.abs(centerLevel - level);
        if (distance < selectedDistance) {
            selectedPage = page;
            selectedDistance = distance;
        }
    });
    return selectedPage;
};

let openDifficultyScreen = player => {
    syncDifficultyStages(player);
    let probePacket = new $CompoundTag();
    probePacket.putString('probe', 'ok');
    probePacket.putInt('expectedLength', difficultyDataJson.length);
    player.sendData(DIFFICULTY_PROBE_CHANNEL, probePacket);
    console.info(
        `[SDBF Difficulty] Sent probe to ${player.username}: ` +
        `class=${probePacket.getClass().getName()}, keys=${probePacket.getAllKeys()}, ` +
        `probeType=${probePacket.getTagType('probe')}, ` +
        `lengthType=${probePacket.getTagType('expectedLength')}`
    );
    let configPacket = new $CompoundTag();
    configPacket.putString('json', difficultyDataJson);
    player.sendData(DIFFICULTY_DATA_CHANNEL, configPacket);
    console.info(
        `[SDBF Difficulty] Sent config to ${player.username}: ` +
        `class=${configPacket.getClass().getName()}, keys=${configPacket.getAllKeys()}, ` +
        `length=${String(configPacket.getString('json')).length}, ` +
        `tagType=${configPacket.getTagType('json')}`
    );
    player.server.scheduleInTicks(1, callback => {
        if (!isRealPlayer(player)) return;
        console.info(`[SDBF Difficulty] Opening AUI for ${player.username}`);
        ApricityUI.openScreen(player, DIFFICULTY_UI_PATH);
    });
};
global.openDifficultyScreen = openDifficultyScreen;

let buildAxisHover = (player, axis, current) => {
    let hover = Text.of(axis.label).color(Color.AQUA)
        .append('\n')
        .append(Text.of(axis.description).color(Color.GRAY))
        .append('\n')
        .append(Text.translatable('kubejs.difficulty.adjustments').color(Color.WHITE))
        .append(Text.of('：').color(Color.DARK_GRAY));

    appendAdjustment(hover, 'kubejs.difficulty.hp_adjustment', axis.multipliers.health);
    hover.append(Text.of('  |  ').color(Color.DARK_GRAY));
    appendAdjustment(hover, 'kubejs.difficulty.atk_adjustment', axis.multipliers.attack);
    hover.append(Text.of('  |  ').color(Color.DARK_GRAY));
    appendAdjustment(hover, 'kubejs.difficulty.armor_adjustment', axis.multipliers.armor);

    if (axis.items.length > 0) {
        hover.append('\n').append(Text.translatable('kubejs.difficulty.axis_items').color(Color.WHITE));
        axis.items.forEach(stack => {
            hover.append('\n')
                .append(Text.of(`  · ${stack.getCount()}x `).color(Color.DARK_GRAY))
                .append(stack.displayName.copy().color(Color.GRAY));
        });
    }

    let state = getAxisState(player, axis, current);
    hover.append('\n').append(Text.translatable(`kubejs.difficulty.state.${state}`).color(getStateColor(state)));
    return hover;
};

let buildSubModifierHover = (player, modifier, current) => {
    let state = getSubModifierState(player, modifier, current);
    return Text.of(modifier.name).color(Color.AQUA)
        .append('\n')
        .append(Text.of(modifier.description).color(Color.GRAY))
        .append('\n')
        .append(Text.translatable(
            'kubejs.difficulty.sub.requirement',
            getAxisLabel(modifier.requiredLevel)
        ).color(Color.WHITE))
        .append('\n')
        .append(Text.translatable(`kubejs.difficulty.state.${state}`).color(getStateColor(state)));
};

let renderAxisRow = (player, view) => {
    let line = withUniformFont(Text.of('轴│').color(Color.GRAY));
    axisWindows[view.xPage].forEach(axis => {
        let state = getAxisState(player, axis, view.current);
        let clickable = state == 'available';
        let cell = withUniformFont(Text.of(centerCell(getAxisLabel(axis.level), clickable)))
            .color(getStateColor(state))
            .hover(buildAxisHover(player, axis, view.current));
        if (clickable) {
            cell.click(new $ClickEvent(
                $ClickEventAction.RUN_COMMAND,
                `/sdbf_difficulty_menu axis ${axis.level} ${view.xPage} ${view.yPage}`
            ));
        }
        line.append(cell);
    });
    player.tell(line);
};

let renderSubModifierRow = (player, row, view) => {
    let categoryLabel = subCategoryById[row.category].short;
    let line = withUniformFont(Text.of(`${categoryLabel}│`).color(Color.GRAY));
    axisWindows[view.xPage].forEach(axis => {
        let modifier = row.cells[String(axis.level)];
        if (!modifier) {
            line.append(withUniformFont(Text.of(makeSpaces(GRID_CELL_WIDTH))));
            return;
        }

        let state = getSubModifierState(player, modifier, view.current);
        let clickable = state == 'available';
        let cell = withUniformFont(Text.of(centerCell(modifier.short, clickable)))
            .color(getStateColor(state))
            .hover(buildSubModifierHover(player, modifier, view.current));
        if (clickable) {
            cell.click(new $ClickEvent(
                $ClickEventAction.RUN_COMMAND,
                `/sdbf_difficulty_menu sub ${modifier.id} ${view.xPage} ${view.yPage}`
            ));
        }
        line.append(cell);
    });
    player.tell(line);
};

let makeNavigationButton = (label, enabled, command) => {
    let button = Text.of(`[${label}]`).color(enabled ? Color.AQUA : Color.DARK_GRAY);
    if (enabled) {
        button.click(new $ClickEvent($ClickEventAction.RUN_COMMAND, command));
    }
    return button;
};

let renderNavigation = (player, view) => {
    let left = view.xPage > 0;
    let right = view.xPage < axisWindows.length - 1;
    let up = view.yPage > 0;
    let down = view.yPage < view.maxY;
    let line = Text.of('  ')
        .append(makeNavigationButton('←', left, `/sdbf_difficulty_menu view ${view.xPage - 1} ${view.yPage}`))
        .append(Text.of(' '))
        .append(makeNavigationButton('↑', up, `/sdbf_difficulty_menu view ${view.xPage} ${view.yPage - 1}`))
        .append(Text.of(' '))
        .append(makeNavigationButton('↓', down, `/sdbf_difficulty_menu view ${view.xPage} ${view.yPage + 1}`))
        .append(Text.of(' '))
        .append(makeNavigationButton('→', right, `/sdbf_difficulty_menu view ${view.xPage + 1} ${view.yPage}`));
    player.tell(line);
};

let renderConfirmation = (player, kind, targetId, targetName, xPage, yPage) => {
    let warning = Text.translatable('kubejs.difficulty.confirm_permanent', targetName).color(Color.RED);
    let button = Text.of('[ ').color(Color.WHITE)
        .append(Text.translatable('kubejs.difficulty.confirm_button', targetName).color(Color.AQUA))
        .append(Text.of(' ]').color(Color.WHITE))
        .hover(warning)
        .click(new $ClickEvent(
            $ClickEventAction.RUN_COMMAND,
            `/sdbf_difficulty_menu confirm ${kind} ${targetId} ${xPage} ${yPage}`
        ));
    player.tell(warning);
    player.tell(button);
};

ServerEvents.commandRegistry(event => {
    let { commands: Commands, arguments: Arguments } = event;
    let intArgument = name => Commands.argument(name, Arguments.INTEGER.create(event));
    let wordArgument = name => Commands.argument(name, $StringArgumentType.word());
    let greedyArgument = name => Commands.argument(name, $StringArgumentType.greedyString());
    event.register(
        Commands.literal('sdbf_difficulty_menu')
            .executes(c => {
                let player = c.source.player;
                if (!isRealPlayer(player)) {
                    c.source.sendFailure(Text.translatable('kubejs.difficulty.player_only'));
                    return 0;
                }
                initializePlayerDifficulty(player);
                openDifficultyScreen(player);
                return 1;
            })
            .then(Commands.literal('view')
                .then(intArgument('xPage')
                    .then(intArgument('yPage')
                        .executes(c => {
                            global.renderDifficulty(
                                c.source.player,
                                Arguments.INTEGER.getResult(c, 'xPage'),
                                Arguments.INTEGER.getResult(c, 'yPage')
                            );
                            return 1;
                        })
                    )
                )
            )
            .then(Commands.literal('axis')
                .then(intArgument('level')
                    .then(intArgument('xPage')
                        .then(intArgument('yPage')
                            .executes(c => global.setAxisFromCmd(c, Arguments, false))
                        )
                    )
                )
            )
            .then(Commands.literal('sub')
                .then(wordArgument('subId')
                    .then(intArgument('xPage')
                        .then(intArgument('yPage')
                            .executes(c => global.setSubModifierFromCmd(c, Arguments, false))
                        )
                    )
                )
            )
            .then(Commands.literal('apply')
                .then(intArgument('level')
                    .then(greedyArgument('subIds')
                        .executes(c => global.applyDifficultySelectionFromCmd(c, Arguments))
                    )
                )
            )
            .then(Commands.literal('confirm')
                .then(Commands.literal('axis')
                    .then(intArgument('level')
                        .then(intArgument('xPage')
                            .then(intArgument('yPage')
                                .executes(c => global.setAxisFromCmd(c, Arguments, true))
                            )
                        )
                    )
                )
                .then(Commands.literal('sub')
                    .then(wordArgument('subId')
                        .then(intArgument('xPage')
                            .then(intArgument('yPage')
                                .executes(c => global.setSubModifierFromCmd(c, Arguments, true))
                            )
                        )
                    )
                )
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
                    openDifficultyScreen(player);
                    return 1;
                })
        );
    }
});

global.renderDifficulty = (player, xPage, yPage) => {
    if (!isRealPlayer(player)) return;
    initializePlayerDifficulty(player);
    let view = normalizeView(xPage, yPage);
    view.current = getPlayerDifficulty(player);
    player.tell(Text.translatable('kubejs.difficulty.title').color(Color.WHITE));
    renderAxisRow(player, view);
    let rowStart = view.yPage * SUB_ROWS_PER_PAGE;
    view.rows.slice(rowStart, rowStart + SUB_ROWS_PER_PAGE)
        .forEach(row => renderSubModifierRow(player, row, view));
    renderNavigation(player, view);
};

global.setAxisFromCmd = (c, Arguments, confirmed) => {
    let player = c.source.player;
    if (!isRealPlayer(player)) {
        c.source.sendFailure(Text.translatable('kubejs.difficulty.player_only'));
        return 0;
    }
    initializePlayerDifficulty(player);
    let level = Arguments.INTEGER.getResult(c, 'level');
    let xPage = Arguments.INTEGER.getResult(c, 'xPage');
    let yPage = Arguments.INTEGER.getResult(c, 'yPage');
    let target = axisByLevel[level];
    if (!target) {
        player.tell(Text.translatable('kubejs.difficulty.invalid_index').color(Color.RED));
        return 0;
    }

    let state = getAxisState(player, target);
    if (state == 'selected') {
        global.renderDifficulty(player, xPage, yPage);
        return 1;
    }
    if (state != 'available') {
        player.tell(Text.translatable('kubejs.difficulty.cannot_increase').color(Color.RED));
        global.renderDifficulty(player, xPage, yPage);
        return 0;
    }
    if (!confirmed) {
        renderConfirmation(
            player,
            'axis',
            String(target.level),
            Text.of(target.label),
            xPage,
            yPage
        );
        return 1;
    }

    setPlayerDifficultyStage(player, target);
    target.items.forEach(stack => player.give(stack.copy()));
    syncDifficultyModifiers(player);
    player.server.players.forEach(receiver => {
        receiver.tell(Text.translatable(
            'kubejs.difficulty.set_success',
            player.displayName,
            Text.translatable(`kubejs.difficulty.${target.id}`)
        ).color(Color.GREEN));
    });
    global.renderDifficulty(player, xPage, yPage);
    return 1;
};

global.setSubModifierFromCmd = (c, Arguments, confirmed) => {
    let player = c.source.player;
    if (!isRealPlayer(player)) {
        c.source.sendFailure(Text.translatable('kubejs.difficulty.player_only'));
        return 0;
    }
    initializePlayerDifficulty(player);
    let subId = $StringArgumentType.getString(c, 'subId');
    let xPage = Arguments.INTEGER.getResult(c, 'xPage');
    let yPage = Arguments.INTEGER.getResult(c, 'yPage');
    let modifier = subModifierById[subId];
    if (!modifier) {
        player.tell(Text.translatable('kubejs.difficulty.invalid_sub').color(Color.RED));
        return 0;
    }

    let state = getSubModifierState(player, modifier);
    if (state == 'selected') {
        player.tell(Text.translatable('kubejs.difficulty.sub_already_selected').color(Color.GRAY));
        global.renderDifficulty(player, xPage, yPage);
        return 1;
    }
    if (state != 'available') {
        player.tell(Text.translatable('kubejs.difficulty.sub_unavailable').color(Color.RED));
        global.renderDifficulty(player, xPage, yPage);
        return 0;
    }
    if (!confirmed) {
        renderConfirmation(
            player,
            'sub',
            modifier.id,
            Text.of(modifier.name),
            xPage,
            yPage
        );
        return 1;
    }

    applySubModifier(player, modifier);
    player.tell(Text.translatable(
        'kubejs.difficulty.sub_selected',
        Text.of(modifier.name)
    ).color(Color.WHITE));
    global.renderDifficulty(player, xPage, yPage);
    return 1;
};

global.applyDifficultySelectionFromCmd = (c, Arguments) => {
    let player = c.source.player;
    if (!isRealPlayer(player)) {
        c.source.sendFailure(Text.translatable('kubejs.difficulty.player_only'));
        return 0;
    }
    initializePlayerDifficulty(player);

    let level = Arguments.INTEGER.getResult(c, 'level');
    let target = axisByLevel[level];
    if (!target) {
        c.source.sendFailure(Text.translatable('kubejs.difficulty.invalid_index'));
        return 0;
    }

    let rawSubIds = String($StringArgumentType.getString(c, 'subIds')).trim();
    let requestedIds = rawSubIds == 'none' ? [] : rawSubIds.split(/[\s,]+/);
    let requestedModifiers = [];
    let seenIds = {};
    for (let index = 0; index < requestedIds.length; index++) {
        let subId = String(requestedIds[index]);
        if (!subId || seenIds[subId]) continue;
        let modifier = subModifierById[subId];
        if (!modifier) {
            c.source.sendFailure(Text.translatable('kubejs.difficulty.invalid_sub'));
            return 0;
        }
        seenIds[subId] = true;
        requestedModifiers.push(modifier);
    }

    let current = getPlayerDifficulty(player);
    let axisState = getAxisState(player, target, current);
    if (axisState != 'selected' && axisState != 'available') {
        c.source.sendFailure(Text.translatable('kubejs.difficulty.cannot_increase'));
        return 0;
    }

    for (let index = 0; index < requestedModifiers.length; index++) {
        let modifier = requestedModifiers[index];
        let state = getSubModifierState(player, modifier, target);
        if (state != 'selected' && state != 'available') {
            c.source.sendFailure(Text.translatable('kubejs.difficulty.sub_unavailable'));
            return 0;
        }
    }

    if (axisState == 'available') {
        setPlayerDifficultyStage(player, target);
        target.items.forEach(stack => player.give(stack.copy()));
        player.server.players.forEach(receiver => {
            receiver.tell(Text.translatable(
                'kubejs.difficulty.set_success',
                player.displayName,
                Text.of(target.label)
            ).color(Color.GREEN));
        });
    }

    requestedModifiers.forEach(modifier => {
        if (isSubModifierSelected(player, modifier)) return;
        applySubModifier(player, modifier);
        player.tell(Text.translatable(
            'kubejs.difficulty.sub_selected',
            Text.of(modifier.name)
        ).color(Color.WHITE));
    });
    syncDifficultyModifiers(player);
    syncDifficultyStages(player);
    return 1;
};

PlayerEvents.loggedIn(event => {
    initializePlayerDifficulty(event.player);
    refreshDifficultyDisplayName(event.player);
});

PlayerEvents.respawned(event => {
    let player = event.player;
    if (!isRealPlayer(player)) return;
    copyDifficultyDataAfterRespawn(event.oldPlayer, player);
    initializePlayerDifficulty(player);
    syncDifficultyStages(player);
    refreshDifficultyDisplayName(player);
});

ItemEvents.rightClicked('kubejs:difficulty_selector', event => {
    let player = event.player;
    if (!isRealPlayer(player)) return;
    initializePlayerDifficulty(player);
    openDifficultyScreen(player);
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
        Text.of(getPlayerDifficulty(player).label)
    ).color(Color.RED));
});

NativeEvents.onEvent($PlayerNameFormatEvent, event => {
    let player = event.entity;
    if (!isRealPlayer(player)) return;
    let difficulty = getPlayerDifficulty(player);
    let displayName = Text.of('[').color(Color.GRAY)
        .append(Text.of(difficulty.label).color(Color.AQUA))
        .append(Text.of('] ').color(Color.GRAY))
        .append(event.username);
    event.setDisplayname(displayName);
});
