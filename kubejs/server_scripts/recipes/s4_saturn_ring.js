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

    event.shaped(Item.of('gateways:gate_pearl', '{gateway:"gateways:sdbf_sr_ayeti"}'), [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: 'kubejs:saturn_regolith',
        B: 'apotheosis:epic_material',
        C: 'slashblade:proudsoul_sphere',
    }).id('sdbf:sdbf_sr_ayeti_s4')

    event.shaped(Item.of('gateways:gate_pearl', '{gateway:"gateways:sdbf_sr_kp"}'), [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: 'kubejs:irradiated_saturn_dust',
        B: 'apotheosis:epic_material',
        C: 'slashblade:proudsoul_sphere',
    }).id('sdbf:sdbf_sr_kp_s4')

    // 狱界剑 白楼剑: 白楼剑 + 斩断不死之录 + 补天合金锭
    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": { "item": 'kubejs:celestial_filling_alloy_ingot' },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": {
                "kill": 3000,
                "name": "last_smith:hakurouken",
                "proud_soul": 30000,
                "refine": 100
            }
        },
        "blade": "last_smith:hakurouken_nether",
        "template": { "item": "last_smith:scroll_mortal" }
    }).id("sdbf:hakurouken_nether_s4")

    // 狱刀 似蛭: 五把材料刀 + 古代灵魂 + 土星环合金锭
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AYA",
        "RNS",
        "BYB"
    ], {
        "A": 'kubejs:ancient_soul',
        "B": CORE,
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:yamato")
                .killCount(3000)
                .proudSoul(30000)
                .refineCount(50)
                .build()
        ),
        "R": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:rivers_of_blood")
                .killCount(4500)
                .proudSoul(50000)
                .refineCount(75)
                .build()
        ),
        "N": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:nihilex")
                .killCount(4000)
                .proudSoul(30100)
                .refineCount(100)
                .build()
        ),
        "S": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:silverbamboo_blood")
                .killCount(4000)
                .proudSoul(30000)
                .refineCount(75)
                .build()
        )
    }, "slashblade_addon:nihilul")
        .id("sdbf:nihilul_s4")

    // 炼狱刀 死念: 狱界双剑 + 狱刀 似蛭
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SGS",
        "HNR",
        "MGM"
    ], {
        "G": 'ad_astra:gravity_normalizer',
        "M": Item.of('thermal:florb', '{Fluid:{Amount:1000,FluidName:"kubejs:purified_proudsoul_fuel"}}').weakNBT(),
        "S": 'last_smith:sakura_sphere',
        "H": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:hakurouken_nether")
                .killCount(6000)
                .proudSoul(60000)
                .refineCount(100)
                .build()
        ),
        "N": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:nihilul")
                .killCount(21500)
                .proudSoul(200100)
                .refineCount(100)
                .build()
        ),
        "R": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:roukanken_nether")
                .killCount(18000)
                .proudSoul(155000)
                .refineCount(100)
                .build()
        )
    }, "slashblade_addon:nihilbx")
        .id("sdbf:nihilbx_s4")

    // ========================================================================
    //  crimsoncherryex  炼狱刀 血雨红樱  -- 血樱刀系列 S4 究极进化
    //  合成前体:
    //    slashblade_addon:crimsoncherry   妖刀 红樱        (同名直接前体, 次核心)
    //    slashblade_addon:murakumo        神剑 天丛云       (次核心)
    //    sjap_adder:nihil_soul            妖刀 血桑轮结月    (S3 五刀合成产物, 主核心)
    //  数值设计: 材料刀的材料门槛总和 + 3000 kill / 30000 proud soul.
    //    crimsoncherry = (nihilex 5000/50000 + nihil 5000/50000) + 3000/30000.
    //    nihil_soul = (2000+1000+3000+1500+1000) / (15000+15000+20000+15000+10000) + 3000/30000.
    //    murakumo is an entity-drop blade (ur-ghast), so it keeps the original 3000/30000 gate.
    //  辅材: 古魂四角 + 补天合金锭上下.
    // ========================================================================
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "PJX",
        "RNM",
        "XJP"
    ], {
        "P": "kubejs:ancient_soul",
        "X": Item.of('thermal:florb', '{Fluid:{Amount:1000,FluidName:"kubejs:dense_proudsoul_blend"}}').weakNBT(),
        "J": "kubejs:celestial_filling_alloy_ingot",
        "N": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:nihil_soul")
                .killCount(11500)
                .proudSoul(105000)
                .refineCount(100)
                .build()
        ),
        // 次核心: 妖刀 红樱 -- 同名直接前体
        "R": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:crimsoncherry")
                .killCount(13000)
                .proudSoul(130000)
                .refineCount(100)
                .build()
        ),
        // 次核心: 神剑 天丛云
        "M": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:murakumo")
                .killCount(3000)
                .proudSoul(30000)
                .refineCount(50)
                .build()
        )
    }, "sjap_adder:crimsoncherryex")
        .id("sdbf:crimsoncherryex_s4")

})
