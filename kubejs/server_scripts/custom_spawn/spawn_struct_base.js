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

// 仪式流程（设计见 docs/development/仪式与基岩破坏者特效设计-2026-11-03.md）：
// 右键 B → 校验 → 失败时标出问题方块；成功时蓄能 40 tick（每 10 tick 复查）→ 释放（此时才扣激活物）→ 余韵。
// 潜行 + 空手或手持激活物右键 B 只做预览。其他手持物不触发任何预览。
let RITUAL_CHARGE_TICKS = 40;
let RITUAL_MAX_DISTANCE_SQR = 36;
let RITUAL_FAIL_COOLDOWN = 10;
let RITUAL_RELEASE_COOLDOWN = 100;
let RITUAL_PREVIEW_THROTTLE = 20;

let registeredStructures = Utils.newMap();
let structuresByCore = {};
let ritualLocks = {};
let ritualPreviewStamp = {};

let ritualLockKey = (level, pos) => `${RitualFx.dimOf(level)}|${pos.x},${pos.y},${pos.z}`;
let ritualIsMainHand = hand => String(hand).toUpperCase() === 'MAIN_HAND';
let ritualHolds = (player, itemId) => String(player.mainHandItem.getId()) === itemId;
// 不要用 player.distanceToSqr(x, y, z)：KubeJS 把这个重载名解析成 distanceToSqr(Vec3)，三个数字的调用会直接报错。
let ritualDistanceSqr = (player, x, y, z) => {
    let dx = player.x - x, dy = player.y - y, dz = player.z - z;
    return dx * dx + dy * dy + dz * dz;
};

/**
 * 仪式结构
 * @param {Object} config
 * @param {string} config.activateItem - 激活物
 * @param {Object} config.blockMapping - 方块映射 {A: 'block_id', B: 'block_id', C: 'block_id'}，B 为核心方块
 * @param {Function} config.executeCommands - 释放时执行的函数 (level, centerPos, player) => void
 * @param {string} config.structureName - 结构名
 * @param {string} config.theme - 特效主题，见 ritual_fx.js 的 RITUAL_THEMES
 * @param {string} config.displayName - 召唤成功标题中显示的名称（语言键），传送门不需要
 * @param {boolean} config.destroyAfterSpawn - 召唤后是否拆除结构
 * @param {boolean} config.consumeActivateItem - 释放时是否消耗 1 个激活物
 * @param {boolean} config.weakMatch - 是否忽略 pattern 中的空格坐标
 * @param {string} config.from - 只能在该维度进行（传送门）
 * @param {Function} config.precheck - 可选，(level, centerPos, player) => 提示文本或 null；激活前和蓄能复查时调用，返回文本即不能进行
 */
let createBossStructure = (config) => {
    let activateItem = String(config.activateItem);
    let blockMapping = config.blockMapping;
    let coreBlockId = String(blockMapping['B']);
    let patterns = config.patterns || BASE_STRUCTURE_PATTERNS;
    let destroyAfterSpawn = config.destroyAfterSpawn === undefined ? true : config.destroyAfterSpawn;
    let consumeActivateItem = config.consumeActivateItem === undefined ? true : config.consumeActivateItem;
    let weakMatch = config.weakMatch === undefined ? false : config.weakMatch;
    let isPortal = !!config.isPortal;
    let theme = RitualFx.theme(config.theme);

    // 每个位置：[dx, dy, dz, Block, blockId]；空位：[dx, dy, dz]
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
                if (expectedChar === ' ') {
                    emptyPositions.push([col - 1, yOffset, zOffset]);
                } else {
                    let id = String(blockMapping[expectedChar]);
                    configuredPositions.push([col - 1, yOffset, zOffset, Block.getBlock(id), id]);
                }
            }
        }
    }
    let shellPositions = configuredPositions.filter(p => !(p[0] === 0 && p[1] === 0 && p[2] === 0));

    // 返回 {ok, problems: [{pos, blockId, block, wrong}]}；wrong 表示该位置放了别的方块。
    let inspect = (level, centerPos) => {
        let problems = [];
        for (let position of configuredPositions) {
            let pos = centerPos.offset(position[0], position[1], position[2]);
            let state = level.getBlockState(pos);
            if (!state.getBlock().equals(position[3])) {
                problems.push({ pos: pos, blockId: position[4], block: position[3], wrong: !state.isAir() });
            }
        }
        if (!weakMatch) {
            for (let position of emptyPositions) {
                let pos = centerPos.offset(position[0], position[1], position[2]);
                if (!level.getBlockState(pos).isAir()) {
                    problems.push({ pos: pos, blockId: 'minecraft:barrier', block: null, wrong: true });
                }
            }
        }
        return { ok: problems.length === 0, problems: problems };
    };

    let checkStructure = (level, centerPos) => inspect(level, centerPos).ok;

    let destroyStructure = (level, centerPos) => {
        for (let position of configuredPositions) {
            level.destroyBlock(centerPos.offset(position[0], position[1], position[2]), false);
        }
    };

    // 由外到内分 3 批崩解：角 → 边 → 中心列。
    let crumble = (level, centerPos, batch) => {
        for (let position of configuredPositions) {
            let ring = Math.abs(position[0]) + Math.abs(position[2]);
            if ((batch === 0 && ring === 2) || (batch === 1 && ring === 1) || (batch === 2 && ring === 0)) {
                level.destroyBlock(centerPos.offset(position[0], position[1], position[2]), false);
            }
        }
    };

    let missingSummary = problems => {
        let counts = {};
        let order = [];
        for (let problem of problems) {
            if (counts[problem.blockId] === undefined) {
                counts[problem.blockId] = 0;
                order.push(problem);
            }
            counts[problem.blockId]++;
        }
        let list = Text.of('');
        order.forEach((problem, index) => {
            if (index > 0) list.append(Text.of('、'));
            let name = problem.block ? problem.block.getName() : Text.translatable('info.kubejs.ritual.empty_slot');
            list.append(name).append(Text.of(` ×${counts[problem.blockId]}`));
        });
        return Text.translatable('info.kubejs.ritual.missing', String(problems.length), list).yellow();
    };

    let diagnose = (level, centerPos, player, report) => {
        for (let problem of report.problems) {
            if (problem.block) RitualFx.ghost(level, player, problem.pos, problem.blockId);
            if (problem.wrong) {
                RitualFx.particle(level, 'minecraft:dust 1 0.15 0.15 1.2', problem.pos.x + 0.5, problem.pos.y + 0.5, problem.pos.z + 0.5, 0.3, 0.3, 0.3, 0, 8, player);
            }
        }
        RitualFx.actionbar(player, missingSummary(report.problems));
        RitualFx.sound(level, 'minecraft:block.note_block.bass', centerPos.x + 0.5, centerPos.y + 0.5, centerPos.z + 0.5, 0.8, 0.5, player);
    };

    let preview = (level, centerPos, player) => {
        let report = inspect(level, centerPos);
        if (report.ok) {
            for (let position of configuredPositions) {
                let pos = centerPos.offset(position[0], position[1], position[2]);
                RitualFx.particle(level, 'minecraft:happy_villager', pos.x + 0.5, pos.y + 0.8, pos.z + 0.5, 0.25, 0.1, 0.25, 0, 2, player);
            }
            RitualFx.actionbar(player, Text.translatable('info.kubejs.ritual.complete').green());
            RitualFx.sound(level, 'minecraft:block.amethyst_block.chime', centerPos.x + 0.5, centerPos.y + 0.5, centerPos.z + 0.5, 0.8, 1.4, player);
            return;
        }
        for (let position of configuredPositions) {
            let pos = centerPos.offset(position[0], position[1], position[2]);
            RitualFx.ghost(level, player, pos, position[4]);
        }
        for (let problem of report.problems) {
            if (problem.wrong) {
                RitualFx.particle(level, 'minecraft:dust 1 0.15 0.15 1.2', problem.pos.x + 0.5, problem.pos.y + 0.5, problem.pos.z + 0.5, 0.3, 0.3, 0.3, 0, 8, player);
            }
        }
        RitualFx.actionbar(player, missingSummary(report.problems));
    };

    let fizzle = (level, centerPos, player, message) => {
        RitualFx.particle(level, 'minecraft:smoke', centerPos.x + 0.5, centerPos.y + 1.1, centerPos.z + 0.5, 0.2, 0.1, 0.2, 0.01, 8, null);
        RitualFx.sound(level, 'minecraft:block.note_block.bass', centerPos.x + 0.5, centerPos.y + 0.5, centerPos.z + 0.5, 0.8, 0.5, player);
        RitualFx.actionbar(player, message);
    };

    // 蓄能期间每 tick 的表现
    let chargeTick = (level, centerPos, t) => {
        let cx = centerPos.x + 0.5, cy = centerPos.y + 1.1, cz = centerPos.z + 0.5;
        if (t === 0) RitualFx.sound(level, 'minecraft:block.beacon.activate', cx, cy, cz, 1, 1.1, null);
        if (t === 0 || t === 13 || t === 26) {
            let stage = t === 0 ? 0 : t === 13 ? 1 : 2;
            RitualFx.sound(level, 'minecraft:block.respawn_anchor.charge', cx, cy, cz, 0.9, [0.8, 1.0, 1.2][stage], null);
            RitualFx.sound(level, theme.chime, cx, cy, cz, 0.6, 1 + stage * 0.15, null);
            RitualFx.particle(level, RitualFx.dust(theme), cx, cy, cz, 0.25, 0.25, 0.25, 0, 10, null);
        }
        if (t % 2 === 0) {
            let height = t < 13 ? 1 : t < 26 ? 2 : 3;
            RitualFx.column(level, theme.accent, cx, cy, cz, height, 3);
            // 每次轮流从 4 个外围方块各飞出一缕汇聚粒子
            let count = shellPositions.length;
            for (let k = 0; k < 4 && count > 0; k++) {
                let p = shellPositions[(t / 2 * 4 + k) % count];
                RitualFx.fly(level, theme.converge, centerPos.x + p[0] + 0.5, centerPos.y + p[1] + 0.7, centerPos.z + p[2] + 0.5, cx, cy + 0.4, cz, null);
                RitualFx.particle(level, RitualFx.dust(theme), centerPos.x + p[0] + 0.5, centerPos.y + p[1] + 1.05, centerPos.z + p[2] + 0.5, 0.15, 0.05, 0.15, 0, 1, null);
            }
        }
        if (t >= 30 && t % 2 === 0) {
            RitualFx.ring(level, RitualFx.dust(theme), cx, cy, cz, 1.3, 10, t * 0.15, null);
            if (t === 30) RitualFx.sound(level, 'minecraft:block.amethyst_block.resonate', cx, cy, cz, 1, 0.9, null);
        }
    };

    let interrupt = (level, centerPos, player, messageKey) => {
        let cx = centerPos.x + 0.5, cy = centerPos.y + 1.1, cz = centerPos.z + 0.5;
        RitualFx.particle(level, 'minecraft:smoke', cx, cy + 1, cz, 0.15, 0.8, 0.15, 0.01, 20, null);
        RitualFx.particle(level, 'minecraft:electric_spark', cx, cy + 1, cz, 0.3, 0.8, 0.3, 0.05, 12, null);
        RitualFx.sound(level, 'minecraft:block.beacon.deactivate', cx, cy, cz, 1, 1, null);
        if (!player.hasDisconnected()) RitualFx.actionbar(player, Text.translatable(messageKey).red());
    };

    // 释放：扣激活物、执行召唤/传送、播放释放特效
    let release = (level, centerPos, player, item) => {
        let cx = centerPos.x + 0.5, cy = centerPos.y + 1.1, cz = centerPos.z + 0.5;
        if (consumeActivateItem) player.mainHandItem.shrink(1);
        player.cooldowns.addCooldown(item, RITUAL_RELEASE_COOLDOWN);
        if (isPortal) {
            RitualFx.shockwave(level, 'minecraft:reverse_portal', player.x, player.y + 0.2, player.z, 20, 0.25);
            RitualFx.sound(level, 'minecraft:entity.enderman.teleport', player.x, player.y, player.z, 1, 0.8, null);
            RitualFx.sound(level, 'minecraft:block.portal.travel', player.x, player.y, player.z, 0.25, 1.2, player);
            config.executeCommands(level, centerPos, player);
            return;
        }
        RitualFx.shockwave(level, theme.accent, cx, cy - 0.5, cz, 24, 0.35);
        RitualFx.shockwave(level, 'minecraft:cloud', cx, cy - 0.8, cz, 16, 0.25);
        RitualFx.lightning(level, cx, centerPos.y + 1, cz);
        RitualFx.sound(level, 'minecraft:entity.evoker.prepare_summon', cx, cy, cz, 1, 0.9, null);
        RitualFx.sound(level, 'minecraft:item.trident.thunder', cx, cy, cz, 0.7, 1.1, null);
        RitualFx.shake(level, cx, cy, cz, 16, 0.12, 15, 10);
        let server = level.server;
        if (destroyAfterSpawn) {
            crumble(level, centerPos, 0);
            server.scheduleInTicks(2, callback => crumble(level, centerPos, 1));
            server.scheduleInTicks(4, callback => crumble(level, centerPos, 2));
        }
        server.scheduleInTicks(6, callback => {
            RitualFx.particle(level, 'minecraft:large_smoke', cx, cy, cz, 0.3, 1.2, 0.3, 0.02, 30, null);
            RitualFx.particle(level, theme.extra, cx, cy, cz, 0.6, 0.8, 0.6, 0.02, 20, null);
            RitualFx.sound(level, 'minecraft:block.end_portal.spawn', cx, cy, cz, 0.6, 1.2, null);
            config.executeCommands(level, centerPos, player);
            if (config.displayName && !player.hasDisconnected()) {
                RitualFx.subtitle(player, JSON.stringify({ translate: 'info.kubejs.ritual.summoned', with: [{ translate: config.displayName }], color: 'gold' }));
            }
        });
        // 余韵：3 秒主题微光
        for (let k = 1; k <= 6; k++) {
            server.scheduleInTicks(6 + k * 10, callback => {
                RitualFx.particle(level, theme.extra, cx, cy, cz, 1.2, 0.6, 1.2, 0.01, 4, null);
                RitualFx.particle(level, RitualFx.dust(theme), cx, cy, cz, 1.2, 0.6, 1.2, 0, 3, null);
            });
        }
    };

    // 激活：校验 → 蓄能 → 释放
    let activate = (level, centerPos, player) => {
        let item = player.mainHandItem.getItem();
        let key = ritualLockKey(level, centerPos);
        if (ritualLocks[key]) {
            RitualFx.actionbar(player, Text.translatable('info.kubejs.ritual.busy').gray());
            return;
        }
        if (config.from && RitualFx.dimOf(level) !== String(config.from)) {
            fizzle(level, centerPos, player, Text.translatable('info.kubejs.wrong_dimension').red());
            player.cooldowns.addCooldown(item, RITUAL_FAIL_COOLDOWN);
            return;
        }
        if (config.precheck) {
            let refusal = config.precheck(level, centerPos, player);
            if (refusal) {
                fizzle(level, centerPos, player, refusal);
                player.cooldowns.addCooldown(item, RITUAL_FAIL_COOLDOWN);
                return;
            }
        }
        let report = inspect(level, centerPos);
        if (!report.ok) {
            diagnose(level, centerPos, player, report);
            player.cooldowns.addCooldown(item, RITUAL_FAIL_COOLDOWN);
            return;
        }

        let chargeTicks = RitualFx.cfg().charge ? RITUAL_CHARGE_TICKS : 0;
        ritualLocks[key] = true;
        player.swing();
        if (chargeTicks > 0) {
            // 蓄能期间激活物进入冷却：快捷栏上的冷却动画就是进度条，也避免重复触发。
            player.cooldowns.addCooldown(item, chargeTicks + 2);
            RitualFx.actionbar(player, Text.translatable('info.kubejs.ritual.charging').aqua());
        }
        let dimension = RitualFx.dimOf(level);
        let stillValid = () => {
            if (player.hasDisconnected() || !player.isAlive()) return 'info.kubejs.ritual.interrupted';
            if (RitualFx.dimOf(player.level) !== dimension) return 'info.kubejs.ritual.interrupted';
            if (ritualDistanceSqr(player, centerPos.x + 0.5, centerPos.y + 0.5, centerPos.z + 0.5) > RITUAL_MAX_DISTANCE_SQR) return 'info.kubejs.ritual.interrupted';
            if (!ritualHolds(player, activateItem)) return 'info.kubejs.ritual.item_left';
            if (config.precheck && config.precheck(level, centerPos, player)) return 'info.kubejs.ritual.item_left';
            if (!checkStructure(level, centerPos)) return 'info.kubejs.ritual.interrupted';
            return null;
        };
        RitualFx.timeline(level.server, chargeTicks, t => {
            if (t > 0 && (t % 10 === 0 || t === chargeTicks)) {
                let reason = stillValid();
                if (reason) {
                    delete ritualLocks[key];
                    interrupt(level, centerPos, player, reason);
                    if (!player.hasDisconnected()) player.cooldowns.addCooldown(item, RITUAL_FAIL_COOLDOWN);
                    return false;
                }
            }
            if (t < chargeTicks) {
                chargeTick(level, centerPos, t);
                if (isPortal && t === chargeTicks - 10) RitualFx.darkness(player, 30);
                return true;
            }
            delete ritualLocks[key];
            release(level, centerPos, player, item);
            return false;
        }, error => {
            // 脚本出错时也要解锁并提示，否则这个位置会一直显示"仪式进行中"。
            delete ritualLocks[key];
            player.cooldowns.addCooldown(item, RITUAL_FAIL_COOLDOWN);
            interrupt(level, centerPos, player, 'info.kubejs.ritual.interrupted');
        });
    };

    return {
        activateItem: activateItem,
        coreBlockId: coreBlockId,
        blockMapping: blockMapping,
        executeCommands: config.executeCommands,
        structureName: config.structureName || 'Boss',
        destroyAfterSpawn: destroyAfterSpawn,
        patterns: patterns,
        weakMatch: weakMatch,
        theme: theme,

        inspect: inspect,
        checkStructure: checkStructure,
        destroyStructure: destroyStructure,
        preview: preview,
        activate: activate
    };
};

// 目的地返回平台：先放下脚下的哭泣的黑曜石和其下的黑曜石，外圈 8 块黑曜石逐 tick 凝结。
let buildReturnPlatform = (targetLevel, destPos, theme) => {
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = 0; dy <= 6; dy++) {
            for (let dz = -2; dz <= 2; dz++) {
                targetLevel.setBlock(destPos.offset(dx, dy, dz), Blocks.AIR.defaultBlockState(), 2);
            }
        }
    }
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            targetLevel.setBlock(destPos.offset(dx, 7, dz), Blocks.COBBLESTONE.defaultBlockState(), 2);
        }
    }
    targetLevel.setBlock(destPos.offset(0, -1, 0), Blocks.OBSIDIAN.defaultBlockState(), 2);
    targetLevel.setBlock(destPos, Blocks.CRYING_OBSIDIAN.defaultBlockState(), 2);
    let ringOrder = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]];
    ringOrder.forEach((offset, index) => {
        targetLevel.server.scheduleInTicks(1 + index, callback => {
            let pos = destPos.offset(offset[0], -1, offset[1]);
            targetLevel.setBlock(pos, Blocks.OBSIDIAN.defaultBlockState(), 2);
            RitualFx.particle(targetLevel, RitualFx.dust(theme), pos.x + 0.5, pos.y + 1.05, pos.z + 0.5, 0.25, 0.05, 0.25, 0, 4, null);
            RitualFx.sound(targetLevel, 'minecraft:block.stone.place', pos.x + 0.5, pos.y + 0.5, pos.z + 0.5, 0.6, 0.8 + index * 0.05, null);
        });
    });
};

// 抵达特效：脚下主题粒子涌起，配重生锚设定音效。
let ritualArrival = (targetLevel, x, y, z, theme) => {
    RitualFx.column(targetLevel, theme.accent, x, y, z, 2.5, 6);
    RitualFx.shockwave(targetLevel, theme.extra, x, y + 0.2, z, 16, 0.2);
    RitualFx.particle(targetLevel, RitualFx.dust(theme), x, y + 1, z, 0.6, 0.8, 0.6, 0, 20, null);
    RitualFx.sound(targetLevel, 'minecraft:block.respawn_anchor.set_spawn', x, y, z, 0.8, 1, null);
};

/**
 * 注册一个传送结构
 * @param {Object} config
 */
let registerPortal = (config) => {
    let xf = config.x;
    let yf = config.y;
    let zf = config.z;
    let toDim = config.to;
    let clearDestinationBlocks = config.clearDestinationBlocks;
    let theme = RitualFx.theme(config.theme);

    let executePortalCommands = (level, centerPos, player) => {
        let position = config.position ? config.position(player, centerPos) : null;
        let x = position ? position.x : xf(player);
        let y = position ? position.y : yf(player);
        let z = position ? position.z : zf(player);

        let targetX = x != null ? x : centerPos.x;
        let targetY = y != null ? y : centerPos.y;
        let targetZ = z != null ? z : centerPos.z;

        let server = level.getServer();
        let targetLevel = server.getLevel(toDim);
        if (clearDestinationBlocks && targetLevel) {
            buildReturnPlatform(targetLevel, new BlockPos(targetX, targetY, targetZ), theme);
        }
        server.runCommandSilent(`/execute in ${toDim} run tp ${player.name.string} ${targetX + 0.5} ${targetY + 1} ${targetZ + 0.5}`);
        if (targetLevel) {
            server.scheduleInTicks(1, callback => ritualArrival(targetLevel, targetX + 0.5, targetY + 1, targetZ + 0.5, theme));
        }
    };

    let portalConfig = Object.assign({}, config, { executeCommands: executePortalCommands, isPortal: true });
    return registerStructure(portalConfig);
};

/**
 * 注册一个召唤结构
 * @param {Object} config
 */
let registerStructure = (config) => {
    let structure = createBossStructure(config);
    registeredStructures.put(structure.activateItem, structure);
    if (!structuresByCore[structure.coreBlockId]) structuresByCore[structure.coreBlockId] = [];
    structuresByCore[structure.coreBlockId].push(structure);

    let triggers = global.sdbfRitualTriggers;
    let listed = triggers && triggers.rituals.some(pair => String(pair[0]) === structure.activateItem && String(pair[1]) === structure.coreBlockId);
    if (!listed) {
        console.warn(`[ritual] ${structure.activateItem} + ${structure.coreBlockId} 不在 startup_scripts/ritual_triggers.js 中，客户端不会取消本地交互`);
    }
    return structure;
};

BlockEvents.rightClicked(event => {
    let { block, level, player } = event;
    if (!ritualIsMainHand(event.hand)) return;

    let centerPos = block.pos;
    let blockId = String(block.id);
    let itemId = String(event.item.getId());
    let sneaking = player.isShiftKeyDown();

    // 手持激活物右键核心：潜行预览，否则激活
    if (registeredStructures.containsKey(itemId)) {
        let structure = registeredStructures.get(itemId);
        if (blockId === structure.coreBlockId) {
            if (sneaking) structure.preview(level, centerPos, player);
            else structure.activate(level, centerPos, player);
            event.cancel();
        }
        return;
    }

    // 潜行空手右键核心：预览与该核心方块对应的结构（有多个时取问题最少的一个）
    if (sneaking && event.item.isEmpty() && structuresByCore[blockId]) {
        let key = String(player.uuid);
        let now = player.server.getTickCount();
        if (ritualPreviewStamp[key] !== undefined && now - ritualPreviewStamp[key] < RITUAL_PREVIEW_THROTTLE) {
            event.cancel();
        }
        ritualPreviewStamp[key] = now;
        let best = null;
        let bestCount = 0;
        for (let structure of structuresByCore[blockId]) {
            let count = structure.inspect(level, centerPos).problems.length;
            if (best === null || count < bestCount) {
                best = structure;
                bestCount = count;
            }
        }
        best.preview(level, centerPos, player);
        event.cancel();
    }
});
