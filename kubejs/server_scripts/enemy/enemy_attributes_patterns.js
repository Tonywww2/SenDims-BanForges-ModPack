// priority: 200

let diffLevelPrefix = "dl_";
let health = "minecraft:generic.max_health"
let attack = "minecraft:generic.attack_damage"
let armor = "minecraft:generic.armor"
let magic_resist = "slashblade_sendims:magic_resistance"
let frenzy_resistance = "slashblade_sendims:frenzy_resistance"
// 攻击， 生命， 护甲， 魔抗
/**
 * 均衡模板
 */
let typeA = {
    isBoss: false,
    "0_1": [4, 20, 2, 0],

    "1_1": [8, 45, 2, 0],
    "1_2": [15.5, 140, 2, 10],
    "1_3": [32, 210, 6, 10],
    "1_4": [47, 300, 10, 20],

    "2_1": [87, 800, 20, 35],
    "2_2": [145, 1100, 40, 35],
    "2_3": [215, 4000, 60, 40],

    "3_1": [325, 4500, 80, 45],
    "3_2": [460, 8000, 110, 45],
    "3_3": [700, 13000, 145, 50],

    "4_1": [945, 19000, 180, 50],
    "4_2": [1200, 38000, 220, 55]
};
/**
 * 均衡模板 EX1
 */
let typeAEX1 = {
    isBoss: false,
    "0_1": [8, 45, 2, 0],

    "1_1": [15.5, 140, 2, 10],
    "1_2": [32, 210, 6, 10],
    "1_3": [47, 300, 10, 20],
    "1_4": [87, 800, 20, 35],

    "2_1": [145, 1100, 40, 35],
    "2_2": [215, 4000, 60, 40],
    "2_3": [325, 4500, 80, 45],

    "3_1": [460, 8000, 110, 45],
    "3_2": [700, 13000, 145, 50],
    "3_3": [945, 19000, 180, 50],

    "4_1": [1200, 38000, 220, 55],
    "4_2": [1600, 74000, 260, 55]
};
/**
 * 均衡模板 EX2
 */
let typeAEX2 = {
    isBoss: false,
    "0_1": [12, 140, 2, 5],

    "1_1": [24, 210, 4, 10],
    "1_2": [36, 300, 8, 15],
    "1_3": [65, 800, 15, 25],
    "1_4": [116, 1100, 30, 35],

    "2_1": [180, 4000, 50, 35],
    "2_2": [270, 4500, 70, 45],
    "2_3": [393, 8000, 95, 45],

    "3_1": [580, 13000, 128, 50],
    "3_2": [823, 19000, 163, 50],
    "3_3": [1073, 38500, 200, 55],

    "4_1": [1400, 74000, 240, 55],
    "4_2": [1750, 108000, 280, 60]
};

let deriveTemplate = (baseTemplate, isBoss, mults, adds) => {
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
let typeB = deriveTemplate(typeA,
    false,
    [1.2, 0.5, 0.5, 1],
    [0, 0, 0, 10]
);

/**·
 * 坦克模板
 */
let typeC = deriveTemplate(typeA,
    false,
    [0.8, 1.8, 0.8, 1],
    [0, 0, 0, 10]
);

/**
 * 重甲模板
 */
let typeD = deriveTemplate(typeA,
    false,
    [0.9, 0.9, 1.75, 1],
    [0, 0, 0, -10]
);

/**
 * 史莱姆模板
 */
let typeSlime = deriveTemplate(typeA,
    false,
    [0.9, 1, 0.5, 0],
    [0, 0, 0, -10]
);

/**
 * 中立/默认模板
 */
let type0 = deriveTemplate(typeA,
    false,
    [0.6, 0.8, 0.4, 1],
    [0, 0, 0, 0]
);

/**·
 * 坦克模板 EX2
 */
let typeCEX2 = deriveTemplate(typeAEX2,
    false,
    [0.8, 1.8, 0.8, 1],
    [0, 0, 0, 10]
);

/**
 * 精英怪模板
 */
let typeAE = deriveTemplate(typeA,
    true,
    [1.15, 4, 1, 1],
    [0, 0, 0, 20]
);

/**
 * BOSS1
 */
let bossType1 = deriveTemplate(typeA,
    true,
    [1.15, 12, 1, 1],
    [0, 0, 0, 20]
);

/**
 * BOSS2
 */
let bossType2 = deriveTemplate(typeA,
    true,
    [1.1, 19, 1.1, 1],
    [0, 0, 0, 25]
);

/**
 * BOSS1Weak
 */
let bossType1W = deriveTemplate(typeA,
    true,
    [1.15, 3, 1, 1],
    [0, 0, 0, 10]
);

/**
 * BOSS EX1
 */
let bossType1EX1 = deriveTemplate(typeAEX1,
    true,
    [1.15, 6, 1, 1],
    [0, 0, 0, 20]
);

/**
 * BOSS EX2
 */
let bossType2EX2 = deriveTemplate(typeAEX2,
    true,
    [1.1, 9, 1.1, 1],
    [0, 0, 0, 25]
);
/**
 * BOSS 九头蛇
 */
let bossTypeHydra = deriveTemplate(typeAEX2,
    true,
    [1.1, 3, 0, 1],
    [0, 0, 0, 5]
);
/**
 * BOSS 雪怪王
 */
let bossTypeAlphaYeti = deriveTemplate(typeAEX2,
    true,
    [0.7, 3, 0.4, 1],
    [0, 0, 0, 20]
);
/**
 * BOSS 末影龙
 */
let bossTypeDragon = deriveTemplate(bossType2,
    true,
    [1, 1, 0.8, 1],
    [0, 0, 0, 0]
);
/**
 * BOSS 盖亚
 */
let bossTypeGaia = deriveTemplate(bossType2,
    true,
    [1, 2, 1, 1],
    [0, 0, 0, 10]
);

/**·
 * 末影人模板
 */
let typeEnderman = deriveTemplate(typeC,
    false,
    [1.0, 1.0, 1.0, 1.0],
    [0, 0, 0, 0]
);

typeEnderman["2_3"][0] = typeEnderman["2_3"][0] * 0.95
typeEnderman["2_3"][2] = typeEnderman["2_3"][2] * 0.75

/**·
 * 鱼雷模板
 */
let typeGuardian = deriveTemplate(typeA,
    false,
    [0.5, 1.0, 1.0, 1.0],
    [0, 0, 0, 0]
);
/**·
 * 宇宙水晶模板
 */
let typeCosmicCrystal = deriveTemplate(typeA,
    false,
    [1.0, 0.1, 0.0, 1.0],
    [0, 0, 0, 0]
);


// 攻击， 生命， 护甲，魔抗
let additionalStageScale = {
    "0_1": [1, 1, 1, 1],

    "1_1": [1, 1, 1, 1],
    "1_2": [1, 1, 1, 1],
    "1_3": [1, 1, 1, 1],
    "1_4": [1, 1, 1, 1],

    "2_1": [1, 1, 1, 1],
    "2_2": [1, 1, 1, 1],
    "2_3": [0.9, 1, 1, 1],

    "3_1": [1, 1, 1, 1],
    "3_2": [1, 1.1, 1, 1],
    "3_3": [1, 1.15, 1, 1],

    "4_1": [1, 1.2, 1, 1],
    "4_2": [1, 1.3, 1, 1]
}

let hpFloat = 0.15;
let atkFloat = 0.025;
let armorFloat = 0.05;
/**
 * 维度对应的难度等级
 */
let dimensionStages = new Map([
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

    ["the_bumblezone:the_bumblezone", "3_2"],

    ["slashblade_sendims:saturn_ring", "3_3"],
    ["sdbf:inside_the_end", "3_3"],
    ["minecraft:overworld", "0_1"], // Special

    ["sgjourney:abydos", "3_3"],
    ["sgjourney:athos", "3_3"],
    ["sgjourney:cavum_tenebrae", "3_3"],
    ["sgjourney:chulak", "3_3"],
    ["sgjourney:destiny", "3_3"],
    ["sgjourney:lantea", "3_3"],
    ["sgjourney:rima", "3_3"],
    ["sgjourney:tollan", "3_3"],
    ["sgjourney:unitas", "3_3"],

    ["titan_moon:titan", "4_1"],
    ["ad_astra:glacio", "4_1"],

    ["sdbf:deep_realm_level_4", "4_2"]

]);

let dimensionSpecialRule = new Map([
    ["minecraft:overworld", {
        stageID: OVERWORLD_STAGE,
        normalDifficulty: "0_1",
        activateDifficulty: "3_3"
    }]
]);

