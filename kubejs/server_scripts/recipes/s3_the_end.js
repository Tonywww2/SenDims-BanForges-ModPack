ServerEvents.recipes(event => {

    event.shapeless("minecraft:ender_eye", [
        "minecraft:ender_pearl",
        '#forge:dusts/glowstone',
        'aether:ambrosium_shard'
    ]).id("sdbf:ender_eye_s3")

    event.shaped('apotheosis:ender_library', [
        'ACA',
        'CBC',
        'ACA'
    ], {
        A: '#forge:ingots/end_steel',
        B: 'ae2:controller',
        C: 'apotheosis:library'
    }).id('sdbf:ender_library_s3')

    event.shaped('kubejs:chorus_logic_composite_coil', [
        'ACB',
        'CAC',
        'BCA'
    ], {
        A: 'integrateddynamics:logic_director',
        B: 'thermal:rf_coil',
        C: 'nuclearcraft:coil_copper'
    }).id('sdbf:chorus_logic_composite_coil_s3')

    event.custom({
        "type": "nuclearcraft:assembler",
        "input": [
            Item.of('thermal:rf_coil', 1).toJson(),
            Item.of('integrateddynamics:logic_director', 2).toJson(),
            Item.of('nuclearcraft:coil_copper', 3).toJson(),
        ],
        "output": [Item.of('kubejs:chorus_logic_composite_coil', 1).toJson()],
        "powerModifier": 2.0,
        "radiation": 1.0,
        "timeModifier": 1.0
    }).id('sdbf:chorus_logic_composite_coil_acc_s3')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SNS",
        "IBI",
        "SDS"
    ], {
        "S": "slashblade:proudsoul",
        "N": 'minecraft:dragon_egg',
        "I": "slashblade:proudsoul_ingot",
        "D": 'cataclysm:void_core',
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .killCount(350)               // 要求：100 击杀
                .refineCount(50)               // 要求：1 锻造
                .build()
        )
    }, "slashblade_addon:kamuy_none")
        .id("sdbf:kamuy_none_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "GFD",
        "CSU",
        "DFG"
    ], {
        "D": 'kubejs:chorus_logic_composite_coil',
        "G": "slashblade:proudsoul_ingot",
        "F": "last_smith:sakura_full",      // 满樱 (Sakura Full)
        "S": "last_smith:scroll_muramasa",  // 村正之卷 (Scroll Muramasa)
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:muramasa_kagura")
                .killCount(1500)
                .proudSoul(5000)
                .refineCount(35)
                .build()
        ),
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:muramasa")
                .killCount(1500)
                .proudSoul(5000)
                .refineCount(35)
                .build()
        )
    }, "last_smith:oboro_muramasa")
        .id("sdbf:oboro_muramasa_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "FDF",
        "CGU",
        "FSF"
    ], {
        "D": 'last_smith:scroll_causality',
        "G": "slashblade:proudsoul_ingot",
        "F": "last_smith:sakura_full",      // 满樱 (Sakura Full)
        "S": "last_smith:scroll_exorcism",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:nameless_odachi")
                .killCount(1500)
                .proudSoul(5000)
                .refineCount(25)
                .build()
        ),
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:nameless_odachi")
                .killCount(1500)
                .proudSoul(5000)
                .refineCount(25)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:sharpness", 6))
                .build()
        )
    }, "last_smith:roukanken")
        .id("sdbf:roukanken_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "BGI",
        "DEG",
        "FDH"
    ], {
        "B": "minecraft:nether_star",     // 下界之星
        "D": "minecraft:obsidian",        // 黑曜石
        "F": 'kubejs:chorus_logic_composite_coil',
        "H": 'minecraft:dragon_head',
        "G": "minecraft:end_stone",       // 末地石
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:yamato")
                .refineCount(50)
                .addSwordType("broken")
                .build()
        ),
        "I": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:magicblade")
                .refineCount(10)
                .addSwordType("broken")
                .build()
        )
    }, "pseudoedge_break_dawn:dragonblade")
        .id("sdbf:dragonblade_s3")

})
