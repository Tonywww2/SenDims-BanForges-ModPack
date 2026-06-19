ServerEvents.recipes(event => {

    sqRecipe(event, "the_bumblezone:throne_pillar", 'the_bumblezone:honey_compass', 0, "s4");

    event.shaped('slashblade_sendims:the_nectar_quest', [
        'ABA',
        'CDC',
        'ACA'
    ], {
        B: 'cataclysm:void_assault_shoulder_weapon',
        A: '#forge:storage_blocks/regalium',
        C: 'kubejs:coil_of_sorrow',
        D: 'cataclysm:ignitium_elytra_chestplate'
    }).id('sdbf:the_nectar_quest_s4')

    event.shaped('kubejs:multifaceted_ambrosia', [
        'ABA',
        'CDC',
        'AEA'
    ], {
        B: 'umapyoi:sweet_cupcake',
        A: 'kubejs:gamma_dust',
        C: 'the_bumblezone:glistering_honey_crystal',
        D: 'the_bumblezone:royal_jelly_bottle',
        E: 'umapyoi:hachimi_big'
    }).id('sdbf:multifaceted_ambrosia_s4')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "HPH",
        "DUD",
        "DED"
    ], {
        "D": "minecraft:diamond_block",
        "P": 'the_bumblezone:essence_raging',
        "H": 'the_bumblezone:honey_crystal',
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:nihilex")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(75)
                .build()
        ),
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:nihil")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(25)
                .build()
        )
    }, "slashblade_addon:crimsoncherry")
        .keepIngredient('the_bumblezone:essence_raging')
        .id("sdbf:crimsoncherry_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "GCG",
        "ABD",
        "EKF"
    ], {
        "A": 'the_bumblezone:essence_knowing',
        "B": 'minecraft:heart_of_the_sea',
        "D": 'the_bumblezone:essence_calming',
        "G": "minecraft:beacon",
        "K": 'minecraft:sea_lantern',
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("blades_derby:uma_hishi")
                .killCount(2500)
                .proudSoul(30000)
                .refineCount(50)
                .build()
        ),
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:green_mist")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(75)
                .build()
        ),
        // 核心原料 3：Fluorescent Bar (荧光)
        "F": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:egg_lan")
                .killCount(2500)
                .proudSoul(30000)
                .refineCount(50)
                .build()
        )
    }, "sjap_adder:blue_dream")
        .keepIngredient(['the_bumblezone:essence_knowing', 'the_bumblezone:essence_calming'])
        .id("sdbf:blue_dream_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABA",
        "CKD",
        "EFE"
    ], {
        "A": 'the_bumblezone:crystalline_flower',
        "B": 'botania:pure_daisy',
        "C": 'the_bumblezone:essence_life',
        "D": 'the_bumblezone:essence_radiance',
        "E": 'minecraft:torchflower',
        "K": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kamuy_none")
                .killCount(2500)
                .proudSoul(50000)
                .refineCount(25)
                .build()
        ),
        "F": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:dragonblade")
                .killCount(7500)
                .proudSoul(80000)
                .refineCount(75)
                .build()
        )
    }, "sjap_adder:kamuy_life")
        .keepIngredient(['the_bumblezone:essence_life', 'the_bumblezone:essence_radiance'])
        .id("sdbf:kamuy_life_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABA",
        "CKD",
        "EFE"
    ], {
        "A": 'last_smith:sakura_full',
        "B": 'last_smith:scroll_sharpness',
        "C": 'constructionwand:core_angel',
        "D": 'twilightforest:magic_map_focus',
        "E": 'slashblade_sendims:principle_of_sword_arts',
        "F": 'the_bumblezone:essence_continuity',
        "K": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:nagasada")
                .killCount(15000)
                .proudSoul(150000)
                .refineCount(100)
                .build()
        )
    }, "last_smith:amagumo_kaze")
        .keepIngredient('the_bumblezone:essence_continuity')
        .id("sdbf:amagumo_kaze_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " BE",
        "BDB",
        "EB "
    ], {
        "B": 'slashblade:proudsoul_crystal',
        "E": 'kubejs:multifaceted_ambrosia',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:kanze_masamune") // 对应 request.name
                .killCount(2500)                    // 对应 request.kill
                .proudSoul(30000)                   // 对应 request.proud_soul
                .refineCount(50)                    // 对应 request.refine
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:power", 5)) // 对应 enchantments
                .build()
        )
    }, "slashblade:wakizashi")
        .id("sdbf:wakizashi_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AWB",
        "CXD",
        "YEZ"
    ], {
        "A": '#forge:ingots/neutronium',
        "B": '#forge:ingots/yttrium',
        "C": '#forge:ingots/osmiridium',
        "D": '#forge:ingots/nichrome',
        "E": 'last_smith:scroll_exorcism',
        "W": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_bone_ice")
                .killCount(25000)                    // 对应 request.kill
                .proudSoul(150000)                   // 对应 request.proud_soul
                .refineCount(100)                    // 对应 request.refine
                .build()
        ),
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:yamato_neo")
                .killCount(5000)                    // 对应 request.kill
                .proudSoul(50000)                   // 对应 request.proud_soul
                .refineCount(100)                    // 对应 request.refine
                .build()
        ),
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:wakizashi")
                .killCount(5000)                    // 对应 request.kill
                .proudSoul(30000)                   // 对应 request.proud_soul
                .refineCount(50)                    // 对应 request.refine
                .build()
        ),
        "Z": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:clothesline")
                .killCount(5000)                    // 对应 request.kill
                .proudSoul(30000)                   // 对应 request.proud_soul
                .refineCount(50)                    // 对应 request.refine
                .build()
        )
    }, "slashblade:mahakala_black")
        .id("sdbf:mahakala_black_s4")

})

