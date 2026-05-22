ServerEvents.recipes(event => {

    event.shapeless('2x kubejs:ml_computing_ingot', [
        'kubejs:ml_computing_ingot',
        'computercraft:computer_advanced',
        '3x slashblade:proudsoul_crystal',
        '4x #forge:ingots/enderium'
    ]).id("sdbf:ml_computing_ingot_s4")

    event.shaped('kubejs:anchor_shard', [
        'ABC',
        'DED',
        ' D '
    ], {
        B: Item.of('productivebees:configurable_comb', '{EntityTag:{type:"productivebees:diamond"}}').weakNBT(),
        A: 'kubejs:multifaceted_ambrosia',
        C: 'ae2things:disk_housing',
        D: 'nuclearcraft:plate_basic',
        E: '#the_bumblezone:essence_items'
    }).keepIngredient('#the_bumblezone:essence_items')
        .id('sdbf:anchor_shard_s4')

    event.recipes.thermal.smelter('2x kubejs:ml_computing_ingot', [
        'kubejs:ml_computing_ingot',
        '2x slashblade:proudsoul_crystal',
        '4x #forge:ingots/enderium'
    ])
        .energy(16384)
        .id("sdbf:ml_computing_ingot_acc_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "EBE",
        "KAD",
        "ECE"
    ], {
        "A": "minecraft:diamond_block", // 钻石块 (Diamond Block)
        "E": 'kubejs:ml_computing_ingot',
        "C": "minecraft:obsidian",     // 黑曜石 (Obsidian)
        "B": "minecraft:glowstone",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("foxextra:foxex_white")
                .killCount(10000)             // 要求：1000 击杀 (Kill Count)
                .proudSoul(100000)            // 要求：30000 耀魂 (Proud Soul)
                .refineCount(100)             // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "K": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("foxextra:foxex_black")
                .killCount(10000)             // 要求：1000 击杀 (Kill Count)
                .proudSoul(100000)            // 要求：30000 耀魂 (Proud Soul)
                .refineCount(100)             // 要求：20 锻造 (Refine Count)
                .build()
        )
    }, "foxextra:foxexfinal")
        .id("sdbf:foxexfinal_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "BZB",
        "XWY",
        "CDC"
    ], {
        "B": 'kubejs:anchor_shard',
        "C": "minecraft:netherite_ingot",           // 下界合金锭
        "D": "minecraft:totem_of_undying",          // 不死图腾
        "W": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:nihilex")
                .killCount(5000)                        // 要求：3000 击杀 (Kill Count)
                .proudSoul(50000)                       // 要求：30000 耀魂 (Proud Soul)
                .refineCount(100)                        // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:hakurouken_nether")
                .killCount(5000)                        // 要求：3000 击杀 (Kill Count)
                .proudSoul(50000)                       // 要求：30000 耀魂 (Proud Soul)
                .refineCount(100)                        // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("lastsmith:roukanken_nether")
                .killCount(20000)                        // 要求：3000 击杀 (Kill Count)
                .proudSoul(150000)                       // 要求：30000 耀魂 (Proud Soul)
                .refineCount(100)                        // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Z": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:rivers_of_blood")
                .killCount(5000)                        // 要求：3000 击杀 (Kill Count)
                .proudSoul(50000)                       // 要求：30000 耀魂 (Proud Soul)
                .refineCount(50)                        // 要求：20 锻造 (Refine Count)
                .build()
        )
    }, "sjap_adder:nihilulex")
        .id("sdbf:nihilulex_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "BWC",
        "XYZ",
        "DAE"
    ], {
        "A": 'kubejs:anchor_shard',
        "B": '#forge:storage_blocks/invar',
        "C": '#forge:storage_blocks/lumium',
        "D": '#forge:storage_blocks/signalum',
        "E": '#forge:storage_blocks/enderium',
        "W": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kamuy_none")
                .killCount(5000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("lastsmith:roukanken")
                .killCount(10000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(80000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:oboro_muramasa")
                .killCount(10000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(80000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Z": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashbladee_addon:green_mist")
                .killCount(5000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(10000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
    }, "slashblade_addon:kamuy_lightning")
        .id("sdbf:kamuy_lightning_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "CAC",
        "BWE",
        "XYZ"
    ], {
        "A": 'kubejs:anchor_shard',
        "B": "minecraft:sculk_sensor",                // 潜声传感器 (Sculk Sensor)
        "C": "minecraft:echo_shard",                  // 回响碎片 (Echo Shard)
        "E": "minecraft:calibrated_sculk_sensor",     // 校准潜声传感器 (Calibrated Sculk Sensor)
        "W": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kamuy_none")
                .killCount(5000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:hand_of_malenia")
                .killCount(5000)                           // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                          // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                          // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:yamato_neo")
                .killCount(5000)                           // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                          // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                          // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Z": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ssa_raye")
                .killCount(5000)                           // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                          // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                          // 要求：20 锻造 (Refine Count)
                .build()
        ),
    }, "sjap_adder:kamuy_dark")
        .id("sdbf:kamuy_dark_s4")

})