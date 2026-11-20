// 异格材料配方。设计见 docs/development/异格材料设计草案-2026-11-17.md。
// 只用低科技工序：工作台有序合成、锻造台、锻造皮革垫组合锻打（deeprealm_4th:combination_forging）。
// 融合型：有序合成 → 异格坯 → 组合锻打（加耀魂媒介）→ 成品。
// 突变型：有序合成 → 异格坯 → 锻造台（模板槽放诱变剂，附加槽放第二诱变剂）→ 不稳定异格坯 → 组合锻打（加耀魂媒介）→ 成品。
// 终式（百炼钢）：组合锻打一步完成。
// 合坯用量（2026-11-18 起）：2×2 有序合成，本体 ×2 + 催化 ×1 + 辅料 ×1；没有辅料的为一行「本体 + 催化 + 本体」。原为本体 ×4（羽毛、紫颂果、神能晶片 ×8）+ 催化 + 辅料 ×4。
// 组合锻造按 NBT 精确匹配物品，带剑技或特效的耀魂宝珠、耀魂结晶不会被当作媒介消耗。
// 组合锻造的限制：最多 12 格输入，锻打次数 1～64，冷却 0～1200 tick。
ServerEvents.recipes(event => {
    let SOUL = 'slashblade:proudsoul';                        // 耀魂碎片（2.1、2.2）
    let INGOT = 'slashblade:proudsoul_ingot';                 // 耀魂铁锭（2.3）
    let SPHERE = 'slashblade:proudsoul_sphere';               // 耀魂宝珠
    let CRYSTAL = 'slashblade:proudsoul_crystal';             // 耀魂结晶
    let TRAPEZOHEDRON = 'slashblade:proudsoul_trapezohedron'; // 耀偏方三八面魂
    let rid = name => `sdbf:alter/${name}`;
    let stack = (item, count) => Item.of(item, count || 1).toJson();

    // 组合锻打。inputs 为 [物品, 数量] 列表
    let forge = (name, inputs, clicks, levels, cooldown) => {
        event.custom({
            "type": "deeprealm_4th:combination_forging",
            "result": stack(`kubejs:${name}`),
            "ingredients": inputs.map(input => ({ "stack": stack(input[0], input[1]) })),
            "clicks": clicks,
            "cooldown": cooldown || 5,
            "levels": levels
        }).id(rid(name));
    };

    // 融合：合坯 → 锻打
    let fusion = (name, pattern, keys, media, clicks, levels) => {
        event.shaped(`kubejs:${name}_blank`, pattern, keys).id(rid(`${name}_blank`));
        forge(name, [[`kubejs:${name}_blank`, 1]].concat(media), clicks, levels);
    };

    // 突变：合坯 → 锻造台诱变 → 锻打稳定
    let mutation = (name, pattern, keys, template, addition, media, clicks, levels) => {
        event.shaped(`kubejs:${name}_blank`, pattern, keys).id(rid(`${name}_blank`));
        event.custom({
            "type": "minecraft:smithing_transform",
            "template": { "item": template },
            "base": { "item": `kubejs:${name}_blank` },
            "addition": { "item": addition },
            "result": stack(`kubejs:${name}_unstable`)
        }).id(rid(`${name}_unstable`));
        forge(name, [[`kubejs:${name}_unstable`, 1]].concat(media), clicks, levels);
    };

    // ---- 2.3.0 幻金：金 + 幻境石水晶 ----
    fusion('alter_gold', [
        'GC',
        'PG'
    ], {
        P: 'minecraft:ender_pearl',
        G: '#forge:ingots/gold',
        C: 'quark:myalite_crystal'
    }, [[INGOT, 1]], 8, 15);

    // ---- 3.1.3 怒涛海皇锭：海皇锭 + 风暴精华 ----
    fusion('alter_neptune', [
        'NS',
        'PN'
    ], {
        P: 'minecraft:prismarine_shard',
        N: 'aether_treasure_reforging:neptune_mesh',
        S: 'cataclysm:essence_of_the_storm'
    }, [[SPHERE, 2]], 10, 20);

    // ---- 3.2.2 世界树铁木：铁木锭 + 泰拉钢 ----
    fusion('alter_ironwood', [
        'IT',
        'LI'
    ], {
        L: 'botania:livingwood_log',
        I: 'twilightforest:ironwood_ingot',
        T: '#forge:ingots/terrasteel'
    }, [[CRYSTAL, 1]], 12, 25);

    // ---- 3.3.2 涅槃凤凰锭：凤凰锭 + 龙锭，锻打时加龙心 ----
    fusion('alter_phoenix', [
        'PD',
        'RP'
    ], {
        R: 'minecraft:blaze_rod',
        P: 'aether_treasure_reforging:pyral_ingot',
        D: 'draconicevolution:draconium_ingot'
    }, [['draconicevolution:dragon_heart', 1], [CRYSTAL, 1]], 16, 30);

    // ---- 3.3.4 辐变萎天獠牙：萎天兔獠牙 + 辐射零件组；突变「锯齿」 ----
    mutation('alter_blightbunny_fang', [
        'FRF'
    ], {
        F: 'aether_redux:blightbunny_fang',
        R: 'kubejs:radiation_components'
    }, 'minecraft:fermented_spider_eye', 'minecraft:pointed_dripstone', [[CRYSTAL, 1]], 16, 30);

    // ---- 3.3.8 觉醒钻石：钻石 + 神龙核心 ----
    fusion('alter_diamond', [
        'BAB'
    ], {
        B: 'minecraft:diamond_block',
        A: 'draconicevolution:awakened_core'
    }, [[CRYSTAL, 2]], 16, 30);

    // ---- 3.3.9 混沌紫颂：爆裂紫颂果 + 混沌核心；突变「跃迁」 ----
    mutation('alter_chorus', [
        'PCP'
    ], {
        P: 'minecraft:popped_chorus_fruit',
        C: 'draconicevolution:chaotic_core'
    }, 'minecraft:ender_eye', 'minecraft:shulker_shell', [[CRYSTAL, 2]], 16, 30);

    // ---- 4.1.3 陨星合金：下界合金 + 陨铁锭 + 生物电池（土卫六）；突变「陨击」。2026-11-18 由 4.1.1 上调（原与陨铁锭同值，贴着土卫六最低） ----
    mutation('alter_netherite', [
        'NM',
        'BN'
    ], {
        N: 'minecraft:netherite_ingot',
        M: 'titan_moon:meteoric_iron_ingot',
        B: 'titan_moon:bio_battery'
    }, 'minecraft:fire_charge', 'minecraft:ancient_debris', [[CRYSTAL, 3]], 24, 40);

    // ---- 4.1.1 夜鸦神经羽：渡鸦羽毛 + 强韧神经腺；突变「夜鸦」 ----
    mutation('alter_raven_feather', [
        'FGF'
    ], {
        F: 'twilightforest:raven_feather',
        G: 'titan_moon:tough_neural_gland'
    }, 'minecraft:phantom_membrane', 'minecraft:echo_shard', [[CRYSTAL, 2]], 24, 40);

    // ---- 4.1.2 深渊铼骨：铼碎片 + 星浆晶体 ----
    fusion('alter_rendium', [
        'RSR'
    ], {
        R: 'midnight:rendium_shard',
        S: 'deeprealm_4th:star_slurry_crystal'
    }, [[CRYSTAL, 2]], 24, 40);

    // ---- 4.1.3 双星岩：金星石 + 水星石 + 虹移之熵 ----
    fusion('alter_twin_star_stone', [
        'VEM'
    ], {
        V: 'ad_astra:venus_stone',
        M: 'ad_astra:mercury_stone',
        E: 'kubejs:rainbowshift_entropy'
    }, [[CRYSTAL, 3]], 24, 40);

    // ---- 4.1.4 千冻豆腐核心：豆腐能剑核心 + 不融冰；突变「千冻」「千孔」 ----
    mutation('alter_tofu_core', [
        'TU',
        'DT'
    ], {
        T: 'tofucraft:tofu_core',
        D: 'tofucraft:tofudried',
        U: 'kubejs:unmelting_ice'
    }, 'minecraft:blue_ice', 'tofucraft:tofudried', [[TRAPEZOHEDRON, 1]], 24, 40);

    // ---- 4.2 百炼钢（终式）：钢 + 泰坦二型复合锭，锻打 64 次（组合锻造上限） ----
    forge('alter_steel', [
        ['thermal:steel_block', 4],
        ['kubejs:titan-ii_composite_ingot', 1],
        [TRAPEZOHEDRON, 1]
    ], 64, 60, 2);

    // ======== 2.x 扩充（设计见设计草案第 8 节）。耀魂媒介：2.1、2.2 用耀魂碎片，2.3 用耀魂铁锭 ========

    // ---- 2.2.1 蕴魔钢叶：钢叶 + 门瑞欧结晶 + 神秘碱晶（深境二层）。2026-11-18 由 2.1.0 上调，落在深境二层震动合金与 M3SC 之间 ----
    fusion('alter_steeleaf', [
        'SM',
        'AS'
    ], {
        S: 'twilightforest:steeleaf_ingot',
        M: 'integrateddynamics:crystalized_menril_chunk',
        A: 'kubejs:mysterious_alkali_crystal'
    }, [[SOUL, 2]], 6, 12);

    // ---- 2.2.2 豆腐逻辑电路板：豆腐能电路板 + 门瑞欧结晶 + 神秘碱晶（深境二层）。2026-11-18 去掉逻辑导向零件（要用末地的紫颂结晶），由 2.1.2 上调 ----
    fusion('alter_tf_circuit', [
        'CM',
        'AC'
    ], {
        C: 'tofucraft:tf_circuit',
        M: 'integrateddynamics:crystalized_menril_chunk',
        A: 'kubejs:mysterious_alkali_crystal'
    }, [[SOUL, 2]], 6, 12);

    // ---- 2.1.2 熔核炽铁：炽铁锭 + 耐热金属（金星）；突变「熔核」 ----
    mutation('alter_fiery', [
        'FCF'
    ], {
        F: 'twilightforest:fiery_ingot',
        C: 'ad_astra:calorite_ingot'
    }, 'minecraft:magma_block', 'minecraft:blaze_powder', [[SOUL, 1]], 4, 8);

    // ---- 2.2.1 炎狱玄武岩：岩石裂骸 + 炎狱尖塔块 + 骸龙之骨（金星）。2026-11-18 由 2.1.0 上调（原贴着金星最低） ----
    fusion('alter_basalz', [
        'RI',
        'KR'
    ], {
        R: 'thermal:basalz_rod',
        I: 'ad_astra:infernal_spire_block',
        K: 'cataclysm:koboleton_bone'
    }, [[SOUL, 2]], 6, 12);

    // ---- 2.1.1 汞霜钻石豆腐：钻石豆腐 + 水星石（水星） ----
    fusion('alter_tofu_diamond', [
        'TM',
        'PT'
    ], {
        P: 'minecraft:packed_ice',
        T: 'tofucraft:tofudiamond',
        M: 'ad_astra:mercury_stone'
    }, [[SOUL, 1]], 4, 8);

    // ---- 2.2.0 夜冥骑士金属：骑士金属 + 夜冥（深境三层·午夜） ----
    fusion('alter_knightmetal', [
        'KN',
        'IK'
    ], {
        I: 'minecraft:ink_sac',
        K: 'twilightforest:knightmetal_ingot',
        N: 'midnight:nagrilite_ingot'
    }, [[SOUL, 2]], 6, 12);

    // ---- 2.2.1 幽光紫水晶：紫水晶 + 幽光（深境三层·午夜） ----
    fusion('alter_amethyst', [
        'AV',
        'GA'
    ], {
        G: 'minecraft:glowstone_dust',
        A: 'minecraft:amethyst_block',
        V: 'midnight:virilux'
    }, [[SOUL, 2]], 6, 12);

    // ---- 2.2.2 铼霜雪鬃：雪怪首领毛皮 + 铼碎片（深境三层·午夜） ----
    fusion('alter_yeti_fur', [
        'FR',
        'BF'
    ], {
        B: 'minecraft:blue_ice',
        F: 'twilightforest:alpha_yeti_fur',
        R: 'midnight:rendium_shard'
    }, [[SOUL, 2]], 6, 12);

    // ---- 2.2.2 王权神能晶：神能晶片 + 贵豪（深园） ----
    fusion('alter_ambrosium', [
        'ARA'
    ], {
        A: 'aether:ambrosium_shard',
        R: 'undergarden:regalium_crystal'
    }, [[SOUL, 2]], 6, 12);

    // ---- 2.2.1 霜钢娜迦鳞：娜迦鳞片 + 霜钢（深园） ----
    fusion('alter_naga_scale', [
        'NF',
        'IN'
    ], {
        I: 'minecraft:ice',
        N: 'twilightforest:naga_scale',
        F: 'undergarden:froststeel_ingot'
    }, [[SOUL, 2]], 6, 12);

    // ---- 2.2.2 遗忆骸骨：骨块 + 遗忆锭（深园）；突变「守望」 ----
    mutation('alter_bone', [
        'BFB'
    ], {
        B: 'minecraft:bone_block',
        F: 'undergarden:forgotten_ingot'
    }, 'minecraft:observer', 'minecraft:iron_block', [[SOUL, 2]], 6, 12);

    // ---- 2.3.1 末影紫晶石：紫晶石 + 末地钢（末地） ----
    fusion('alter_zanite', [
        'ZE',
        'CZ'
    ], {
        C: 'minecraft:chorus_fruit',
        Z: 'aether:zanite_gemstone',
        E: 'enderio:end_steel_ingot'
    }, [[INGOT, 1]], 8, 15);
});
