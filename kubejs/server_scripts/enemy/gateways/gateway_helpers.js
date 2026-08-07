// ============================================================
// gateway_helpers.js — 传送门辅助函数
// 文件名以 g 开头确保在 s1_gw.js 之前加载（KubeJS 按字母序）
// ============================================================

/**
 * 按权重分配总奖励到5个波次。
 * 最后一波补齐舍入误差，确保总和精确匹配 total。
 *
 * @param {number} total   - 奖励总量
 * @param {number[]} weights - 5波权重数组
 * @returns {number[]} 每波分配数量 [w1, w2, w3, w4, w5]
 */
function _distReward(total, weights) {
    const tw = weights.reduce((a, b) => a + b, 0);
    const r = weights.map(w => Math.round(total * w / tw));
    const sum = r.reduce((a, b) => a + b, 0);
    r[4] += total - sum;
    return r;
}

/**
 * 解析 perWave 配置：
 *   - 单值 → 返回 [v, v, v, v, v]
 *   - 数组 → 原样返回（长度应为5）
 */
function _perWave(cfg) {
    return Array.isArray(cfg) ? cfg : [cfg, cfg, cfg, cfg, cfg];
}

/**
 * 向 wave 对象添加该波次的奖励（分配奖励 + 固定奖励）。
 * 数量为 0 的奖励自动跳过。
 */
function _addWR(wave, dist, wi, pw) {
    for (const [item, arr] of Object.entries(dist)) {
        if (arr[wi] > 0) wave.addReward(item, arr[wi]);
    }
    for (const [item, arr] of Object.entries(pw)) {
        if (arr[wi] > 0) wave.addReward(item, arr[wi]);
    }
}

/** bossId 非空则 addApotheosisBoss(id)，否则 addApotheosisBoss() */
function _addBoss(wave, bossId) {
    if (bossId) wave.addApotheosisBoss(bossId);
    else wave.addApotheosisBoss();
}

// ============================================================
// createMythicGateway — 神话传送门
// ============================================================
/**
 * 创建「神话传送门」：波次1-3为普通怪物递增 → 波次4(1×神话Boss) → 波次5(2×神话Boss)
 *
 * 固定属性（不可由用户配置）：
 *   Wave 1: HP×1.5  ATK+2   SPD×1.1  |  maxTime=1200  setup=60
 *   Wave 2: HP×2.0  ATK+3   SPD×1.1  |  maxTime=1400  setup=60
 *   Wave 3: HP×3.0  ATK+5   SPD×1.1  |  maxTime=1600  setup=60
 *   Wave 4: HP×2.0  ATK+3   SPD×1.1  |  maxTime=1800  setup=100
 *   Wave 5: HP×2.0  ATK+3   SPD×1.1  |  maxTime=2000  setup=100
 *
 * 奖励总量按权重 [1, 1, 2, 2, 4] 分配到各波次。
 *
 * @param {string}   id      - 传送门ID（不含 gateways: 前缀），如 "sdbf_dr1_g3"
 * @param {number}   color   - 十六进制颜色 0xRRGGBB，如 0x7B2D8B
 * @param {object}   o
 * @param {string}   [o.size="medium"]
 * @param {string[]} o.normals    - 波次1-3基础怪物实体ID，与 waveCounts 一一对应
 * @param {number[][]} o.waveCounts - [[w1数...], [w2数...], [w3数...]]
 * @param {object}   [o.extras]   - 波次2/3额外怪物
 *      { 2: [["entity_id", count], ...], 3: [["entity_id", count], ...] }
 * @param {string[]} [o.bossIds]  - 神话Boss ID（最多3个）
 *      [wave4Boss, wave5Boss1, wave5Boss2]，falsy 项使用默认随机Boss
 * @param {object}   o.rewards    - { "item_id": total, ... } 总量，自动按权重分配
 * @param {object}   [o.perWave]  - 每波固定奖励
 *      { "item_id": count } → 每波相同
 *      { "item_id": [c1,c2,c3,c4,c5] } → 逐波指定（0 表示该波不发）
 * @param {object}   o.completion - 完成奖励 { "item_id": count, ... }
 * @param {boolean}  [o.starChart=false] - 完成后随机奖励一个星图碎片
 *
 * @example
 *   createMythicGateway("sdbf_dr1_g1", 0x007013, {
 *       normals: ["minecraft:zombie", "minecraft:skeleton", "minecraft:spider"],
 *       waveCounts: [[5,3,2], [7,5,3], [10,7,4]],
 *       extras: {
 *           2: [["species:ghoul", 2]],
 *           3: [["species:ghoul", 3], ["minecraft:witch", 2]],
 *       },
 *       bossIds: ["boss1", "boss2", "boss3"],  // 可选，falsy 项随机
 *       rewards: {
 *           "minecraft:iron_ingot": 20,
 *           "minecraft:gold_ingot": 20,
 *           "minecraft:redstone": 20,
 *           "minecraft:diamond": 1,
 *       },
 *       perWave: { "tetra:geode": [1,1,1,1,0] },
 *       completion: { "slashblade:proudsoul": 2, "tetra:geode": 2 },
 *   });
 */
function createMythicGateway(id, color, o) {
    const W = [1, 1, 2, 2, 4]; // 神话传送门奖励权重，总和10

    // 解析 perWave 和 rewards 预计算
    const pw = {};
    if (o.perWave) for (const [k, v] of Object.entries(o.perWave)) pw[k] = _perWave(v);
    const rd = {};
    if (o.rewards) for (const [k, v] of Object.entries(o.rewards)) rd[k] = _distReward(v, W);

    const b = Gateway.customBuilder("gateways:" + id)
        .size(o.size || "medium").color(color)
        .spawnRange(16).leashRange(48)
        .allowDiscarding(false).allowDimChange(false).playerDamageOnly(false)
        .removeMobsOnFailure(true).failOnOutOfBounds(false)
        .spacing(16).followRangeBoost(32).defaultDropChance(0)
        .addAttribute("minecraft:generic.knockback_resistance", 0.9);

    // ── 波次1：HP×1.5  ATK+2 ──
    b.addWave(w => {
        for (let i = 0; i < o.normals.length; i++) w.addEntity(o.normals[i], o.waveCounts[0][i]);
        w.addAttribute("minecraft:generic.max_health", 0.5, "multiply_total");
        w.addAttribute("minecraft:generic.attack_damage", 2);
        w.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
        w.addAttribute("minecraft:generic.knockback_resistance", 1);
        w.maxTime(1600); w.setupTime(100);
        _addWR(w, rd, 0, pw);
    });

    // ── 波次2：HP×2.0  ATK+3 ──
    b.addWave(w => {
        for (let i = 0; i < o.normals.length; i++) w.addEntity(o.normals[i], o.waveCounts[1][i]);
        if (o.extras && o.extras[2]) for (const [e, c] of o.extras[2]) w.addEntity(e, c);
        w.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
        w.addAttribute("minecraft:generic.attack_damage", 3);
        w.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
        w.addAttribute("minecraft:generic.knockback_resistance", 1);
        w.maxTime(2000); w.setupTime(100);
        _addWR(w, rd, 1, pw);
    });

    // ── 波次3：HP×3.0  ATK+5 ──
    b.addWave(w => {
        for (let i = 0; i < o.normals.length; i++) w.addEntity(o.normals[i], o.waveCounts[2][i]);
        if (o.extras && o.extras[3]) for (const [e, c] of o.extras[3]) w.addEntity(e, c);
        w.addAttribute("minecraft:generic.max_health", 2.0, "multiply_total");
        w.addAttribute("minecraft:generic.attack_damage", 5);
        w.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
        w.maxTime(2400); w.setupTime(100);
        _addWR(w, rd, 2, pw);
    });

    // ── 波次4：1×神话Boss  HP×2.0  ATK+3 ──
    b.addWave(w => {
        _addBoss(w, o.bossIds && o.bossIds[0]);
        w.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
        w.addAttribute("minecraft:generic.attack_damage", 3);
        w.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
        w.maxTime(2400); w.setupTime(120);
        _addWR(w, rd, 3, pw);
    });

    // ── 波次5：2×神话Boss  HP×2.0  ATK+3 ──
    b.addWave(w => {
        _addBoss(w, o.bossIds && o.bossIds[1]);
        _addBoss(w, o.bossIds && o.bossIds[2]);
        w.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
        w.addAttribute("minecraft:generic.attack_damage", 3);
        w.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
        w.maxTime(3000); w.setupTime(120);
        _addWR(w, rd, 4, pw);
    });

    if (o.completion) for (const [k, v] of Object.entries(o.completion)) b.addReward(k, v);
    if (o.starChart) b.addLootTableReward("kubejs:rewards/star_chart_fragment", 1, "item.kubejs.star_chart_fragment");
    b.register();
}

// ============================================================
// createBossGateway — Boss传送门
// ============================================================
/**
 * 创建「Boss传送门」：波次1-4实体战斗 → 波次5关底Boss
 *
 * 固定属性（不可由用户配置）：
 *   Wave 1: HP×2.0  ATK+2   SPD×1.1  |  maxTime=1200  setup=60
 *   Wave 2: HP×3.0  ATK+3   SPD×1.1  |  maxTime=1400  setup=60
 *   Wave 3: HP×3.0  ATK+5   SPD×1.1  |  maxTime=1600  setup=60
 *   Wave 4: HP×3.0  ATK+3   SPD×1.1  |  maxTime=1800  setup=100
 *   Wave 5: HP×3.0  ATK+3   SPD×1.1  |  maxTime=2000  setup=100
 *
 * 奖励总量按权重 [1, 2, 4, 4, 6] 分配到各波次。
 *
 * @param {string}   id      - 传送门ID（不含 gateways: 前缀）
 * @param {number}   color   - 十六进制颜色 0xRRGGBB
 * @param {object}   o
 * @param {string}   [o.size="medium"]
 * @param {[string, number][][]} o.waves - 波次1-4实体
 *      [ [[entity, count], ...], [[entity, count], ...], [[entity, count], ...], [[entity, count], ...] ]
 * @param {[string, number]} o.boss     - 波次5关底Boss [entity, count]
 * @param {object}   o.rewards    - { "item_id": total, ... } 总量，自动按权重分配
 * @param {object}   [o.perWave]  - 每波固定奖励（同 createMythicGateway）
 * @param {object}   o.completion - 完成奖励 { "item_id": count, ... }
 * @param {boolean}  [o.starChart=false] - 完成后随机奖励一个星图碎片
 *
 * @example
 *   createBossGateway("sdbf_dr1_g2", 0x4d0000, {
 *       waves: [
 *           [["terra_entity:possess_armor", 6], ["cataclysm:the_watcher", 5]],
 *           [["terra_entity:possess_armor", 9], ["cataclysm:the_watcher", 8]],
 *           [["cataclysm:the_watcher", 8],   ["cataclysm:the_prowler", 1]],
 *           [["cataclysm:the_watcher", 9],   ["cataclysm:the_prowler", 3]],
 *       ],
 *       boss: ["cataclysm:the_harbinger", 1],
 *       rewards: { "minecraft:iron_ingot": 34 },
 *       perWave: { "tetra:geode": [1, 1, 2, 2, 3] },
 *       completion: { "slashblade:proudsoul": 2, "tetra:geode": 3 },
 *   });
 */
function createBossGateway(id, color, o) {
    const W = [1, 2, 4, 4, 6]; // Boss传送门奖励权重，总和17

    const pw = {};
    if (o.perWave) for (const [k, v] of Object.entries(o.perWave)) pw[k] = _perWave(v);
    const rd = {};
    if (o.rewards) for (const [k, v] of Object.entries(o.rewards)) rd[k] = _distReward(v, W);

    // 5波属性：[HP乘数, ATK加值]
    const attr = [[1.0, 2], [2.0, 3], [2.0, 5], [2.0, 3], [2.0, 3]];
    const mt   = [1200, 1400, 1600, 1800, 2000];
    const st   = [60, 60, 60, 100, 100];

    const b = Gateway.customBuilder("gateways:" + id)
        .size(o.size || "medium").color(color)
        .spawnRange(16).leashRange(48)
        .allowDiscarding(false).allowDimChange(false).playerDamageOnly(false)
        .removeMobsOnFailure(true).failOnOutOfBounds(false)
        .spacing(16).followRangeBoost(32).defaultDropChance(0)
        .addAttribute("minecraft:generic.knockback_resistance", 0.9);

    // ── 波次1-4 ──
    for (let wi = 0; wi < 4; wi++) {
        b.addWave(w => {
            for (const [e, c] of o.waves[wi]) w.addEntity(e, c);
            w.addAttribute("minecraft:generic.max_health", attr[wi][0], "multiply_total");
            w.addAttribute("minecraft:generic.attack_damage", attr[wi][1]);
            w.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            w.maxTime(mt[wi]); w.setupTime(st[wi]);
            _addWR(w, rd, wi, pw);
        });
    }

    // ── 波次5：关底Boss ──
    b.addWave(w => {
        w.addEntity(o.boss[0], o.boss[1]);
        w.addAttribute("minecraft:generic.max_health", attr[4][0], "multiply_total");
        w.addAttribute("minecraft:generic.attack_damage", attr[4][1]);
        w.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
        w.maxTime(mt[4]); w.setupTime(st[4]);
        _addWR(w, rd, 4, pw);
    });

    if (o.completion) for (const [k, v] of Object.entries(o.completion)) b.addReward(k, v);
    if (o.starChart) b.addLootTableReward("kubejs:rewards/star_chart_fragment", 1, "item.kubejs.star_chart_fragment");
    b.register();
}
