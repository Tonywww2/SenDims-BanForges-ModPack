ServerEvents.recipes(event => {

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABD",
        "EFG",
        "IHA"
    ], {
        "A": "twilightforest:knightmetal_ring",
        "D": '#forge:storage_blocks/fiery',
        "F": "twilightforest:hydra_trophy",
        "I": 'ad_astra:infernal_spire_block',
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:murakumo")
                .killCount(500)
                .proudSoul(5000)
                .refineCount(10)
                .build()
        ),
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:orotiagito")
                .killCount(200)
                .proudSoul(2000)
                .refineCount(10)
                .build()
        ),
        "G": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:yasha_true")
                .killCount(200)
                .proudSoul(2000)
                .refineCount(10)
                .build()
        ),
        "H": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:koseki")
                .killCount(200)
                .proudSoul(2000)
                .refineCount(10)
                .build()
        )
    }, "sjap_adder:agito_true_ex")
        .id("sdbf:agito_true_ex_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "EBC",
        "CDB",
        "GCE"
    ], {
        "B": "slashblade:proudsoul_ingot",
        "C": 'ad_astra:venus_sand',
        "E": "minecraft:redstone_block",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:wanderer_hf")
                .killCount(1000)                  // 要求：1500 击杀 (Kill Count)
                .proudSoul(10000)                 // 要求：10000 耀魂 (Proud Soul)
                .refineCount(10)                  // 要求：10 锻造 (Refine Count)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:bane_of_arthropods", 2)) // 节肢杀手 II
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:unbreaking", 3))         // 耐久 III
                .build()
        ),
        "G": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:yasha_true")
                .killCount(200)
                .proudSoul(2000)
                .refineCount(10)
                .build()
        )
    }, "slashblade:ssa_roze")
        .id("sdbf:ssa_roze_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABA",
        "CDC",
        "ACA"
    ], {
        "A": '#forge:plates/calorite',
        "B": "minecraft:nether_star",
        "C": "minecraft:diamond_block",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:fox_white")
                .killCount(1500)
                .proudSoul(12000)
                .refineCount(20)
                .build()
        )
    }, "foxextra:foxex_white")
        .id("sdbf:foxex_white_s3")

})