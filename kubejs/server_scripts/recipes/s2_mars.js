ServerEvents.recipes(event => {
    event.shaped(Item.of('gateways:gate_pearl', '{gateway:"gateways:sdbf_mars_g1"}'), [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: 'ad_astra:mars_sand',
        B: 'ad_astra:mars_stone',
        C: Item.of('enderio:filled_soul_vial', '{BlockEntityTag:{EntityStorage:{Entity:{id:"ad_astra:martian_raptor"}}}}').weakNBT(),
    }).id('sdbf:sdbf_mars_g1_s2')

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

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "DID",
        "SBS",
        "IDI"
    ], {
        "D": "minecraft:music_disc_13",    // 音乐唱片 13
        "I": "minecraft:golden_apple",     // 金苹果
        "S": 'ad_astra:ostrum_engine',
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("cialloblade:ciallo")
                .killCount(1003)
                .proudSoul(10003)
                .refineCount(1)
                .addSwordType("broken")
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:sharpness", 3)) // 锋利 III
                .build()
        )
    }, "slashblade_addon:kirisaya")
        .id("sdbf:kirisaya_s2")

    sqRecipe(event,
        "dungeons_arise:coliseum",
        "ad_astra:conglomerate",
        1,
        's2');

    sqRecipe(event,
        "dungeons_arise:heavenly_rider",
        "ad_astra:mars_stone",
        1,
        's2');

})