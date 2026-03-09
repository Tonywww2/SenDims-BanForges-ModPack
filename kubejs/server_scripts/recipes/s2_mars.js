ServerEvents.recipes(event => {
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABH",
        "DEF",
        "CGK"
    ], {
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:doutanuki")
                .killCount(10)
                .refineCount(20)
                .build()
        ),
        "A": "minecraft:beetroot_soup",
        "B": ["minecraft:heart_of_the_sea", 'ad_astra:energizer'],
        "C": "minecraft:beetroot_soup",
        "D": "minecraft:rabbit_stew",
        "F": 'ad_astra:desh_tank',
        "G": '#forge:storage_blocks/ostrum',
        "H": 'ad_astra:ostrum_engine',
        "K": 'ad_astra:ostrum_tank'
    }, "cialloblade:ciallo")
        .id('sdbf:ciallo_s2')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SOS",
        "OBO",
        "SOS"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .proudSoul(10000)
                .refineCount(20)
                .build()
        ),
        "S": "slashblade:proudsoul",
        "O": '#forge:ingots/ostrum'
    }, "slashblade:muramasa")
        .id('sdbf:muramasa_s2')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "EBE",
        "AFC",
        " D "
    ], {
        "A": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:exorcism_ginkgo")
                .proudSoul(1000)
                .killCount(100)
                .refineCount(10)
                .build()
        ),
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:exorcism_sakura")
                .proudSoul(1000)
                .killCount(100)
                .refineCount(10)
                .build()
        ),
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:exorcism_yuki")
                .proudSoul(1000)
                .killCount(100)
                .refineCount(10)
                .build()
        ),
        "D": "last_smith:scroll_sakura_blade",
        "E": '#forge:ingots/ostrum',
        "F": 'last_smith:sakura_full',
    }, "last_smith:evil_kataware")
        .id('sdbf:exorcism_ginkgo_s2')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "BDB",
        "EBA"
    ], {
        "A": 'apotheosis:rare_material',
        "B": "slashblade:proudsoul_ingot",
        "C": "minecraft:diamond",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:aquablaze")
                .killCount(200)
                .proudSoul(10000)
                .refineCount(5)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:smite", 2))
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_aspect", 2))
                .build()
        ),
        "E": '#forge:storage_blocks/ostrum'
    }, "slashblade:ruined_sword")
        .id('sdbf:ruined_sword_s2')

})