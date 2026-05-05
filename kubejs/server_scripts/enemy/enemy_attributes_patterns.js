// priority: 200
const $TargetingConditions = Java.loadClass('net.minecraft.world.entity.ai.targeting.TargetingConditions')

const diffLevelPrefix = "dl_";
const health = "minecraft:generic.max_health"
const attack = "minecraft:generic.attack_damage"
const armor = "minecraft:generic.armor"
const magic_resist = "slashblade_sendims:magic_resistance"
const frenzy_resistance = "slashblade_sendims:frenzy_resistance"
// 攻击， 生命， 护甲， 魔抗
/**
 * 均衡模板
 */
const typeA = {
    isBoss: false,
    "0_1": [4, 20, 2, 0],

    "1_1": [8, 45, 2, 0],
    "1_2": [15.5, 140, 2, 10],
    "1_3": [32, 210, 6, 10],
    "1_4": [47, 300, 10, 15],

    "2_1": [87, 800, 20, 15],
    "2_2": [145, 1100, 40, 20],
    "2_3": [215, 4000, 60, 20],

    "3_1": [325, 4500, 80, 25],
    "3_2": [460, 8000, 110, 25],
    "3_3": [700, 13000, 145, 30],

    "4_1": [945, 19000, 180, 35],
    "4_2": [1300, 38000, 220, 40]
};
/**
 * 均衡模板 EX1
 */
const typeAEX1 = {
    isBoss: false,
    "0_1": [8, 45, 2, 0],

    "1_1": [15.5, 140, 2, 10],
    "1_2": [32, 210, 6, 10],
    "1_3": [47, 300, 10, 15],
    "1_4": [87, 800, 20, 15],

    "2_1": [145, 1100, 40, 20],
    "2_2": [215, 4000, 60, 20],
    "2_3": [325, 4500, 80, 25],

    "3_1": [460, 8000, 110, 25],
    "3_2": [700, 13000, 145, 30],
    "3_3": [945, 19000, 180, 35],

    "4_1": [1300, 38000, 220, 40],
    "4_2": [1700, 74000, 260, 45]
};
/**
 * 均衡模板 EX2
 */
const typeAEX2 = {
    isBoss: false,
    "0_1": [15.5, 140, 2, 10],

    "1_1": [32, 210, 6, 10],
    "1_2": [47, 300, 10, 15],
    "1_3": [87, 800, 20, 15],
    "1_4": [145, 1100, 40, 20],

    "2_1": [215, 4000, 60, 20],
    "2_2": [325, 4500, 80, 25],
    "2_3": [460, 8000, 110, 25],

    "3_1": [700, 13000, 145, 30],
    "3_2": [945, 19000, 180, 35],
    "3_3": [1300, 38000, 220, 40],

    "4_1": [1700, 74000, 260, 45],
    "4_2": [2100, 108000, 300, 50]
};

const deriveTemplate = (baseTemplate, isBoss, mults, adds) => {
    let result = { isBoss: isBoss };
    for (let key in baseTemplate) {
        if (key !== "isBoss") {
            let v = baseTemplate[key];
            result[key] = [
                Math.round(v[0] * mults[0] + adds[0]),
                Math.round(v[1] * mults[1] + adds[1]),
                Math.round(v[2] * mults[2] + adds[2]),
                Math.round(v[3] * mults[3] + adds[3])
            ];
        }
    }
    return result;
}

/**
 * 脆皮模板
 */
const typeB = deriveTemplate(typeA,
    false,
    [1.2, 0.6, 0.6, 1],
    [0, 0, 0, 10]
);

/**·
 * 坦克模板
 */
const typeC = deriveTemplate(typeA,
    false,
    [0.8, 1.8, 0.8, 1],
    [0, 0, 0, 10]
);

/**
 * 重甲模板
 */
const typeD = deriveTemplate(typeA,
    false,
    [0.9, 0.9, 1.75, 1],
    [0, 0, 0, -10]
);

/**
 * 史莱姆模板
 */
const typeSlime = deriveTemplate(typeA,
    false,
    [0.9, 1, 0.5, 0],
    [0, 0, 0, -10]
);

/**
 * 中立/默认模板
 */
const type0 = deriveTemplate(typeA,
    false,
    [0.6, 0.8, 0.4, 1],
    [0, 0, 0, 0]
);

/**·
 * 坦克模板 EX2
 */
const typeCEX2 = deriveTemplate(typeAEX2,
    false,
    [0.8, 1.8, 0.8, 1],
    [0, 0, 0, 10]
);

/**
 * 精英怪模板
 */
const typeAE = deriveTemplate(typeA,
    true,
    [1.15, 2, 1, 1],
    [0, 0, 0, 20]
);

/**
 * BOSS1
 */
const bossType1 = deriveTemplate(typeA,
    true,
    [1.15, 6, 1, 1],
    [0, 0, 0, 20]
);

/**
 * BOSS2
 */
const bossType2 = deriveTemplate(typeA,
    true,
    [1.1, 9, 1.1, 1],
    [0, 0, 0, 25]
);

/**
 * BOSS1Weak
 */
const bossType1W = deriveTemplate(typeA,
    true,
    [1, 4, 1, 1],
    [0, 0, 0, 0]
);

/**
 * BOSS EX1
 */
const bossType1EX1 = deriveTemplate(typeAEX1,
    true,
    [1.15, 6, 1, 1],
    [0, 0, 0, 20]
);

/**
 * BOSS EX2
 */
const bossType2EX2 = deriveTemplate(typeAEX2,
    true,
    [1.1, 9, 1.1, 1],
    [0, 0, 0, 25]
);
/**
 * BOSS 九头蛇
 */
const bossTypeHydra = deriveTemplate(typeAEX2,
    true,
    [1.1, 6, 0, 1],
    [0, 0, 0, 20]
);
/**
 * BOSS 九头蛇
 */
const bossTypeAlphaYeti = deriveTemplate(typeAEX2,
    true,
    [0.8, 7, 1, 1],
    [0, 0, 0, 20]
);

// 攻击， 生命， 护甲，魔抗
const additionalStageScale = {
    "0_1": [1, 1, 1, 1],

    "1_1": [1, 1, 1, 1],
    "1_2": [1, 1, 1, 1],
    "1_3": [1, 1, 1, 1],
    "1_4": [1, 1, 1, 1],

    "2_1": [1, 1, 1, 1],
    "2_2": [1, 1, 1, 1],
    "2_3": [1, 1, 1, 1],

    "3_1": [1, 1, 1, 1],
    "3_2": [1, 1, 1, 1],
    "3_3": [1, 1, 1, 1],

    "4_1": [1, 1, 1, 1],
    "4_2": [1, 1, 1, 1]
}

const hpFloat = 0.15;
const atkFloat = 0.05;
const armorFloat = 0.05;
/**
 * 维度对应的难度等级
 */
const dimensionStages = new Map([
    ["tofucraft:tofu_world", "0_1"],

    ["sdbf:deep_realm_level_1", "1_1"],

    ["twilightforest:twilight_forest", "1_2"],
    ["aether:the_aether", "1_2"],
    ["ad_astra:moon", "1_2"],

    ["minecraft:the_nether", "1_3"],

    ["ad_astra:mars", "1_4"],

    ["sdbf:deep_realm_level_2", "2_1"],
    ["ad_astra:venus", "2_1"],
    ["ad_astra:mercury", "2_1"],

    ["midnight:the_midnight", "2_2"],
    ["undergarden:undergarden", "2_2"],

    ["minecraft:the_end", "2_3"],

    ["sdbf:asteroid_belt", "3_1"],

    ["sdbf:saturn", "3_2"],
    ["the_bumblezone:the_bumblezone", "3_2"],

    ["sdbf:saturn_orbit", "3_3"],
    ["sdbf:inside_the_end", "3_3"],
    ["minecraft:overworld", "0_1"],

    ["sdbf:pluto", "4_1"],
    ["ad_astra:glacio", "4_1"],

    ["sdbf:deep_realm_level_4", "4_2"]

]);

const dimensionSpecialRule = new Map([
    ["minecraft:overworld", {
        stageID: OVERWORLD_STAGE,
        normalDifficulty: "0_1",
        activateDifficulty: "3_3"
    }]
]);

