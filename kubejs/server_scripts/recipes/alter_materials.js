// 异格材料配方。设计见 docs/development/异格材料设计草案-2026-11-17.md。
// 只用低科技工序：工作台有序合成、锻造台、锻造皮革垫组合锻打（deeprealm_4th:combination_forging）。
// 融合型：有序合成 → 异格坯 → 组合锻打（加耀魂媒介）→ 成品。
// 突变型：有序合成 → 异格坯 → 锻造台（模板槽放诱变剂，附加槽放第二诱变剂）→ 不稳定异格坯 → 组合锻打（加耀魂媒介）→ 成品。
// 终式（百炼钢）：组合锻打一步完成。
// 组合锻造按 NBT 精确匹配物品，带剑技或特效的耀魂宝珠、耀魂结晶不会被当作媒介消耗。
// 组合锻造的限制：最多 12 格输入，锻打次数 1～64，冷却 0～1200 tick。
ServerEvents.recipes(event => {
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
        'PGP',
        'GCG',
        'PGP'
    ], {
        P: 'minecraft:ender_pearl',
        G: '#forge:ingots/gold',
        C: 'quark:myalite_crystal'
    }, [[SPHERE, 1]], 8, 15);

    // ---- 3.1.3 怒涛海皇锭：海皇锭 + 风暴精华 ----
    fusion('alter_neptune', [
        'PNP',
        'NSN',
        'PNP'
    ], {
        P: 'minecraft:prismarine_shard',
        N: 'aether_treasure_reforging:neptune_mesh',
        S: 'cataclysm:essence_of_the_storm'
    }, [[SPHERE, 2]], 10, 20);

    // ---- 3.2.2 世界树铁木：铁木锭 + 泰拉钢 ----
    fusion('alter_ironwood', [
        'LIL',
        'ITI',
        'LIL'
    ], {
        L: 'botania:livingwood_log',
        I: 'twilightforest:ironwood_ingot',
        T: '#forge:ingots/terrasteel'
    }, [[CRYSTAL, 1]], 12, 25);

    // ---- 3.3.2 涅槃凤凰锭：凤凰锭 + 龙锭，锻打时加龙心 ----
    fusion('alter_phoenix', [
        'RPR',
        'PDP',
        'RPR'
    ], {
        R: 'minecraft:blaze_rod',
        P: 'aether_treasure_reforging:pyral_ingot',
        D: 'draconicevolution:draconium_ingot'
    }, [['draconicevolution:dragon_heart', 1], [CRYSTAL, 1]], 16, 30);

    // ---- 3.3.4 辐变萎天獠牙：萎天兔獠牙 + 辐射零件组；突变「锯齿」 ----
    mutation('alter_blightbunny_fang', [
        ' F ',
        'FRF',
        ' F '
    ], {
        F: 'aether_redux:blightbunny_fang',
        R: 'kubejs:radiation_components'
    }, 'minecraft:fermented_spider_eye', 'minecraft:pointed_dripstone', [[CRYSTAL, 1]], 16, 30);

    // ---- 3.3.8 觉醒钻石：钻石 + 神龙核心 ----
    fusion('alter_diamond', [
        ' B ',
        'BAB',
        ' B '
    ], {
        B: 'minecraft:diamond_block',
        A: 'draconicevolution:awakened_core'
    }, [[CRYSTAL, 2]], 16, 30);

    // ---- 3.3.9 混沌紫颂：爆裂紫颂果 + 混沌核心；突变「跃迁」 ----
    mutation('alter_chorus', [
        'PPP',
        'PCP',
        'PPP'
    ], {
        P: 'minecraft:popped_chorus_fruit',
        C: 'draconicevolution:chaotic_core'
    }, 'minecraft:ender_eye', 'minecraft:shulker_shell', [[CRYSTAL, 2]], 16, 30);

    // ---- 4.1.1 陨星合金：下界合金 + 陨铁锭；突变「陨击」 ----
    mutation('alter_netherite', [
        ' N ',
        'NMN',
        ' N '
    ], {
        N: 'minecraft:netherite_ingot',
        M: 'titan_moon:meteoric_iron_ingot'
    }, 'minecraft:fire_charge', 'minecraft:ancient_debris', [[CRYSTAL, 2]], 24, 40);

    // ---- 4.1.1 夜鸦神经羽：渡鸦羽毛 + 强韧神经腺；突变「夜鸦」 ----
    mutation('alter_raven_feather', [
        'FFF',
        'FGF',
        'FFF'
    ], {
        F: 'twilightforest:raven_feather',
        G: 'titan_moon:tough_neural_gland'
    }, 'minecraft:phantom_membrane', 'minecraft:echo_shard', [[CRYSTAL, 2]], 24, 40);

    // ---- 4.1.2 深渊铼骨：铼碎片 + 星浆晶体 ----
    fusion('alter_rendium', [
        ' R ',
        'RSR',
        ' R '
    ], {
        R: 'midnight:rendium_shard',
        S: 'deeprealm_4th:star_slurry_crystal'
    }, [[CRYSTAL, 2]], 24, 40);

    // ---- 4.1.3 双星岩：金星石 + 水星石 + 虹移之熵 ----
    fusion('alter_twin_star_stone', [
        'VMV',
        'MEM',
        'VMV'
    ], {
        V: 'ad_astra:venus_stone',
        M: 'ad_astra:mercury_stone',
        E: 'kubejs:rainbowshift_entropy'
    }, [[CRYSTAL, 3]], 24, 40);

    // ---- 4.1.4 千冻豆腐核心：豆腐能剑核心 + 不融冰；突变「千冻」「千孔」 ----
    mutation('alter_tofu_core', [
        'TDT',
        'DUD',
        'TDT'
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
});
