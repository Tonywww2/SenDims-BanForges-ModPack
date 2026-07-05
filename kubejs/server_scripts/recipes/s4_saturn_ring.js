// ============================================================================
//  补天合金锭 合成树 —— 土星环材料加工线 (Stage 4)
//  Celestial Filling Alloy Ingot — Saturn Ring processing line
//
//  主题：女娲炼五色石以补苍天。
//  土星环地壳(风化砂) → 核电熔铸成合金核 → 植物魔法魔力灌注 → 补天合金锭。
//  混入小行星环的「奇异物质尘」，并借用热力膨胀 / 核电工艺 / 末影接口 / 植物魔法 的材料。
// ============================================================================
ServerEvents.recipes(event => {

    // ---- 便捷别名 / shortcuts -------------------------------------------------
    const REGOLITH = 'kubejs:saturn_regolith'               // 土星风化砂 (新增)
    const IRRAD = 'kubejs:irradiated_saturn_dust'        // 辐照土星砂 (新增)
    const CORE = 'kubejs:saturn_ring_alloy_ingot'       // 土星环合金锭 (新增)
    const RESULT = 'kubejs:celestial_filling_alloy_ingot' // 补天合金锭 (已注册)

    // ==========================================================================
    // T1 · 破碎：土星地表方块 → 土星风化砂
    //      廉价土星岩靠「耗电」增加成本：软岩走热力粉碎机，致密深板岩走核电碎岩机。
    //      [热力膨胀 · 粉碎机] + [核电工艺 · 碎岩机]
    // ==========================================================================

    // 疏松土星岩：软，主要出砂，微量奇异物质
    event.recipes.thermal.pulverizer([
        Item.of(REGOLITH),
        Item.of('minecraft:sand').withChance(0.20),
        Item.of('kubejs:bizarre_matter_dust').withChance(0.01),
    ], ['slashblade_sendims:porous_saturn_stone'])
        .energy(16384).id('sdbf:saturn_regolith_from_porous_s4')

    // 土星砂岩：出砂 + 硅 + 石英
    event.recipes.thermal.pulverizer([
        Item.of(REGOLITH),
        Item.of('minecraft:sand'),
        Item.of('#forge:silicon').withChance(0.15),
        Item.of('#forge:dusts/quartz').withChance(0.08),
    ], ['slashblade_sendims:saturn_sandstone'])
        .energy(16384).id('sdbf:saturn_regolith_from_sandstone_s4')

    // 土星石：出铁镍粉 + 微量奇异物质
    event.recipes.thermal.pulverizer([
        Item.of(REGOLITH),
        Item.of('#forge:dusts/iron').withChance(0.12),
        Item.of('#forge:dusts/nickel').withChance(0.08),
        Item.of('kubejs:bizarre_matter_dust').withChance(0.01),
    ], ['slashblade_sendims:saturn_stone'])
        .energy(16384).id('sdbf:saturn_regolith_from_stone_s4')

    // 土星圆石：低配版
    event.recipes.thermal.pulverizer([
        Item.of(REGOLITH),
        Item.of('#forge:dusts/iron').withChance(0.10),
    ], ['slashblade_sendims:saturn_cobblestone'])
        .energy(16384).id('sdbf:saturn_regolith_from_cobblestone_s4')

    // 土星深板岩：致密 —— 核电碎岩机，产量 ×3 + 保底铁粉，耗电更高
    event.custom({
        "type": "nuclearcraft:rock_crusher",
        "input": [{ "count": 1, "item": "slashblade_sendims:saturn_deepslate" }],
        "output": [
            { "count": 3, "item": REGOLITH },
            { "tag": "forge:dusts/iron" }
        ],
        "powerModifier": 4.0, "radiation": 1.0, "timeModifier": 2.5
    }).id('sdbf:saturn_regolith_from_deepslate_s4')

    // 土星深板岩圆石：核电碎岩机，产量 ×2
    event.custom({
        "type": "nuclearcraft:rock_crusher",
        "input": [{ "count": 1, "item": "slashblade_sendims:saturn_cobbled_deepslate" }],
        "output": [{ "count": 2, "item": REGOLITH }],
        "powerModifier": 3.5, "radiation": 1.0, "timeModifier": 2.0
    }).id('sdbf:saturn_regolith_from_cobbled_deepslate_s4')

    // ==========================================================================
    // T2 · 辐照活化：土星风化砂 → 辐照土星砂   [核电工艺 · 辐照仓]
    //      核心耗电门槛：辐照仓需并入运行中的裂变反应堆(辐照室)。
    //      8 份廉价风化砂 → 1 份辐照土星砂，超高耗电 + 超长耗时 + 强辐射。
    // ==========================================================================
    event.custom({
        "type": "nuclearcraft:irradiator",
        "input": [{ "count": 8, "item": REGOLITH }],
        "output": [{ "item": IRRAD }],
        "powerModifier": 20.0, "radiation": 6.0, "timeModifier": 12.0
    }).id('sdbf:irradiated_saturn_dust_s4')

    // ==========================================================================
    // T3 · 熔铸合金：辐照土星砂 → 土星环合金锭   [核电工艺 · 装配机]
    //      汇入小行星环「奇异物质尘」+ 核电坚韧合金 + 末影接口无尽之尘。
    // ==========================================================================
    // event.custom({
    //     "type": "nuclearcraft:assembler",
    //     "input": [
    //         Item.of(IRRAD, 4).toJson(),                           // 辐照土星砂 ×4
    //         Item.of('kubejs:bizarre_matter_dust').toJson(),       // 奇异物质尘 (小行星环)
    //         Ingredient.of('#forge:ingots/tough_alloy').toJson(),  // 坚韧合金 (核电工艺)
    //         Ingredient.of('enderio:grains_of_infinity').toJson(), // 无尽之尘 (末影接口)
    //         Ingredient.of('#forge:dusts/graphite').toJson(),      // 石墨粉 (碳源)
    //     ],
    //     "output": [Item.of(CORE).toJson()],
    //     "powerModifier": 10.0, "radiation": 2.0, "timeModifier": 4.0
    // }).id('sdbf:saturn_ring_alloy_ingot_s4')

    // T3 自动化备选线：热力膨胀 · 感应熔炉 (高耗电等价产出，便于流水线)
    event.recipes.thermal.smelter(CORE, [
        '4x ' + IRRAD,
        'kubejs:bizarre_matter_dust',
        '#forge:ingots/tough_alloy'
    ]).energy(65536).id('sdbf:saturn_ring_alloy_ingot_acc_s4')

    // ==========================================================================
    // T4 · 补天：土星环合金锭 → 补天合金锭   [植物魔法 · 陆地凝聚板 / 魔力灌注]
    //      「炼五色石以补苍天」——以百万魔力收束宇宙物质，凝为补天合金。
    // ==========================================================================
    event.custom({
        "type": "botania:terra_plate",
        "ingredients": [
            { "item": CORE },                        // 土星环合金锭 ×2
            { "item": CORE },
            { "item": 'enderio:end_steel_ingot' },   // 末地钢 (末影接口)
            { "item": 'botania:gaia_ingot' },        // 盖亚魂钢 (植物魔法)
            { "tag": 'forge:ingots/enderium' },      // 末影锭 (热力膨胀)
            { "item": 'kubejs:delta_dust' }          // δ 尘 (s4 高阶催化)
        ],
        "mana": 1000000,
        "result": { "item": RESULT }
    }).id('sdbf:celestial_filling_alloy_ingot_s4')


    event.shaped('slashblade_sendims:integral_component_5', [
        'ABA',
        'DCD',
        'ABA'
    ], {
        A: CORE,
        B: 'ae2:singularity',
        C: 'kubejs:basepoint_alloy',
        D: 'thermal:upgrade_augment_3'
    }).id('sdbf:integral_component_5_s4')

})
