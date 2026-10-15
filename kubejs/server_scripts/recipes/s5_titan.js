ServerEvents.recipes(event => {

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
