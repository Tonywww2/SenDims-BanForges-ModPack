ServerEvents.recipes(event => {

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
        D: 'dog:cosmic_larva',
        E: 'minecraft:nether_star',
    }).id('sdbf:cosmic_worm_s5')

})
