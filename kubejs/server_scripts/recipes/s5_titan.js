ServerEvents.recipes(event => {

    // 土卫六三种传送门珍珠：材料清剿、勘探远征、四类神话首领猎杀。
    let titanGatewayRecipe = (id, outer, inner, center) => {
        event.shaped(Item.of('gateways:gate_pearl', `{gateway:"gateways:${id}"}`), [
            'ABA',
            'BCB',
            'ABA'
        ], {
            A: outer,
            B: inner,
            C: center
        }).id(`sdbf:${id}_s5`)
    };

    titanGatewayRecipe('sdbf_titan_g1', 'titan_moon:cryo_carapace', 'titan_moon:tholin_fibre', 'slashblade:proudsoul_sphere');
    titanGatewayRecipe('sdbf_titan_g2', 'titan_moon:cryo_alloy_ingot', 'titan_moon:precision_components', 'slashblade:proudsoul_crystal');
    titanGatewayRecipe('sdbf_titan_g3', 'titan_moon:cryo_alloy_ingot', 'apotheosis:mythic_material', 'slashblade:proudsoul_crystal');

    // 树枝状结晶以氢为生长流体；显式 fluid_tag 会替代灌注机配方的默认水。
    event.custom({
        type: 'thermal:insolator',
        ingredients: [
            { item: 'titan_moon:branch_crystal' },
            { fluid_tag: 'forge:hydrogen', amount: 1000 }
        ],
        result: [{ item: 'titan_moon:branch_crystal', chance: 2.0 }],
        energy: 16000
    }).id('sdbf:branch_crystal_hydrogen_propagation_s5')

    // 泰坦二型复合锭：指环座作骨架，以冰晶合金、膜片和辅酶复合，每批 4 锭。
    event.shaped(Item.of('kubejs:titan-ii_composite_ingot'), [
        'AMA',
        'CRC',
        'AMA'
    ], {
        A: 'titan_moon:cryo_alloy_ingot',
        M: 'titan_moon:azotosome_sheet',
        C: 'titan_moon:polyphosphazene_coenzyme',
        R: 'titan_moon:cryo_alloy_ring_mount'
    }).id('sdbf:titan_ii_composite_ingot_s5')

    // 神威刀「虎杖丸」→ 神威刀「帝斯陀」（土卫六）。
    // 保留原配方的末地水晶、恶魂之泪、下界疣与床，并使用本阶段的复合材料。
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "IPE",
        "SUG",
        "IWB"
    ], {
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kamuy_none")
                .killCount(10000)
                .proudSoul(100000)
                .refineCount(100)
                .build()
        ),
        "I": 'kubejs:titan-ii_composite_ingot',
        "P": 'slashblade:proudsoul_crystal',
        "E": 'minecraft:end_crystal',
        "S": 'last_smith:scroll_named',
        "G": 'minecraft:ghast_tear',
        "W": 'minecraft:nether_wart',
        "B": '#minecraft:beds'
    }, "sjap_adder:kamuy_death")
        .id("sdbf:kamuy_death_s5")

    event.shaped('kubejs:storm_hydrogen_crystal', [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: 'titan_moon:cryo_alloy_ingot',
        B: 'titan_moon:hydrogen_capsule',
        C: 'titan_moon:bio_battery'
    }).id('sdbf:storm_hydrogen_crystal_s5')

    // 土卫六后期：「大黑天」+ 宝刀「山吹」露台 + 圣幸刀「绿乃雾」→ 宝刀「大黑天」。
    // 三枚泰坦二型复合锭、名刀之书、风暴氢晶与耀魂结晶完成重铸。
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ISI",
        "GBM",
        "IHP"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:mahakala_black")
                .killCount(25000)
                .proudSoul(250000)
                .refineCount(125)
                .build()
        ),
        "G": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:rodai_golden")
                .killCount(1000)
                .proudSoul(10000)
                .refineCount(50)
                .build()
        ),
        "M": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:green_mist")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "I": 'kubejs:titan-ii_composite_ingot',
        "S": 'last_smith:scroll_named',
        "H": 'kubejs:storm_hydrogen_crystal',
        "P": 'slashblade:proudsoul_crystal'
    }, "slashblade:mahakala_fortune")
        .id("sdbf:mahakala_fortune_s5")

    // 圣剑系列：必胜黄金之剑 + 大地之刃 → 誓约胜利之剑（阶段五初期·土卫六）
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "CHC",
        "BET",
        "HPW"
    ], {
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_sendims:caliburn")
                .build()
        ),
        "T": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:terra_blade")
                .build()
        ),
        "C": 'titan_moon:cryo_alloy_ingot',
        "H": 'kubejs:storm_hydrogen_crystal',
        "W": 'minecraft:heart_of_the_sea',
        "B": 'last_smith:scroll_sharpness',
        "P": 'slashblade:proudsoul_crystal'
    }, "slashblade_sendims:excalibur")
        .id("sdbf:excalibur_s5")

    event.shaped('dog:cosmic_worm', [
        'ABA',
        'CDC',
        'EAE'
    ], {
        A: 'kubejs:storm_hydrogen_crystal',
        B: 'minecraft:dragon_egg',
        C: 'slashblade:proudsoul_crystal',
        D: 'dog:draconic_soul_fragment',
        E: 'minecraft:nether_star',
    }).id('sdbf:cosmic_worm_s5')

    // 土卫六星图碎片：任意星图碎片 + 耀魂结晶 + 3 神铸珍珠 + 合一碎片 + 凯金虹膜，工作台无序合成。
    event.shapeless(Item.of('kubejs:star_chart_fragment', '{dimension:"titan_moon:titan"}'), [
        'kubejs:star_chart_fragment',
        'slashblade:proudsoul_crystal',
        '3x apotheosis:mythic_material',
        'sgjourney:unity_shard',
        'sgjourney:trinium_iris'
    ]).id('sdbf:star_chart_fragment_titan_s5')

})
