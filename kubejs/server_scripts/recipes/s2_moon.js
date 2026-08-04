ServerEvents.recipes(event => {

    event.shapeless('2x slashblade:proudsoul', [
        'terra_entity:king_slime_spawn_egg'
    ]).id("sdbf:king_slime_spawn_egg_to_proudsoul_s2")

    event.smelting('ad_astra:moon_cobblestone', ['dustandash:cobblestone_with_moss'], 0, 200).id("sdbf:moon_cobblestone_s2")

    event.shaped(Item.of('gateways:gate_pearl', '{gateway:"gateways:sdbf_moon_g1"}'), [
        'ABA',
        'BEB',
        'ABA'
    ], {
        A: '#forge:ingots/desh',
        B: 'ad_astra:moon_stone',
        E: 'ad_astra:moon_globe',
    }).keepIngredient('ad_astra:moon_globe')
        .id('sdbf:sdbf_moon_g1_s2')

    event.shaped('ad_astra:desh_engine', [
        'ADA',
        'TBT',
        'ECE'
    ], {
        A: 'ad_astra:photovoltaic_etrium_cell',
        B: 'ad_astra:steel_engine',
        C: ['thermal:dynamo_magmatic', '#forge:storage_blocks/netherite'],
        D: 'minecraft:nether_star',
        E: ['#forge:gears/signalum', '#forge:ingots/netherite'],
        T: 'ad_astra:desh_tank'
    }).id('sdbf:desh_engine_2_s2')

    event.shaped('terra_entity:slime_crown', [
        'A A',
        'AAA',
        'BCB'
    ], {
        A: ['#forge:ingots/desh', 'undergarden:goo_ball'],
        B: 'minecraft:slime_ball',
        C: ['kubejs:bedrock_breaker', 'undergarden:utherium_crystal']
    }).id('sdbf:slime_crown_s2')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " II",
        "QII",
        "BC "
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:doutanuki")
                .build()
        ),
        "C": "minecraft:clock",
        "I": 'slashblade:proudsoul',
        "Q": ['#forge:ingots/desh', 'kubejs:chorus_logic_composite_coil']
    }, "slashblade_addon:wanderer")
        .id('sdbf:wanderer_s2')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "DEC",
        "FBC"
    ], {
        "A": ['tetra:forged_bolt', 'nuclearcraft:neutronium_ingot'],
        "B": "slashblade:proudsoul",
        "C": ['tetra:metal_scrap', 'nuclearcraft:wasteland_earth'],
        "D": ['tetra:planar_stabilizer', 'nuclearcraft:glowing_mushroom'],
        "F": "minecraft:obsidian",
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:xblades") // 要求：X-Blades
                .killCount(200)                       // 要求：200 击杀 (Kill Count)
                .proudSoul(20000)                      // 要求：20000 耀魂 (Proud Soul)
                .refineCount(10)                       // 要求：10 锻造 (Refine Count)
                .build()
        )
    }, "pseudoedge_break_dawn:pseudosword")
        .id("sdbf:pseudosword_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "DED",
        "BCB",
        "DAD"
    ], {
        "A": "minecraft:diamond_block",
        "B": 'ad_astra:wheel',
        "D": 'ad_astra:airlock',
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:tboen") // 要求：拟刃·黎明破晓 (Pseudosword)
                .killCount(100)                          // 要求：300 击杀 (Kill Count)
                .proudSoul(5000)                         // 要求：20000 耀魂 (Proud Soul)
                .refineCount(5)                          // 要求：10 锻造 (Refine Count)
                .build()
        ),
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:pseudosword") // 要求：拟刃·黎明破晓 (Pseudosword)
                .killCount(350)                          // 要求：300 击杀 (Kill Count)
                .proudSoul(20000)                         // 要求：20000 耀魂 (Proud Soul)
                .refineCount(10)                          // 要求：10 锻造 (Refine Count)
                .build()
        )
    }, "pseudoedge_break_dawn:blackpixie")
        .id("sdbf:blackpixie_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABA",
        "ACA",
        "DEF"
    ], {
        "A": ['ad_astra:moon_sand', 'nuclearcraft:wasteland_earth'],
        "B": 'ad_astra:rocket_nose_cone',
        "D": 'ad_astra:moon_stone',
        "E": 'confluence:rocket_boots',
        "F": "minecraft:obsidian",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:blackpixie") // 要求：X-Blades
                .killCount(100)                       // 要求：100 击杀 (Kill Count)
                .proudSoul(20000)                      // 要求：20000 耀魂 (Proud Soul)
                .refineCount(10)                       // 要求：10 锻造 (Refine Count)
                .build()
        )
    }, "pseudoedge_break_dawn:latent")
        .id("sdbf:latent_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("energyblade:forge_energy_blade", [
        " QI",
        "QI ",
        "BC "
    ], {
        "I": "#forge:dusts/redstone",             // 红石粉 (Redstone Dust Tag)
        "Q": 'slashblade:proudsoul',                // 石英 (Quartz Tag)
        "C": ['ad_astra:desh_tank', 'kubejs:chorus_logic_composite_coil'],
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:wanderer")    // 要求：浪人 (Wanderer)
                .build()
        )
    }, "slashblade_addon:wanderer_hf")
        .id("sdbf:wanderer_hf_s2")

    sqRecipe(event,
        "ad_astra:moon_dungeon",
        "ad_astra:moon_stone",
        1,
        's2');

    sqRecipe(event,
        "tetra:regular_ruin",
        "ad_astra:desh_ingot",
        1,
        's2');

    event.smithing('ad_astra:oil_bucket',
        'nuclearcraft:sulfuric_acid_bucket',
        'minecraft:lava_bucket',
        'tofucraft:tofudiamond'
    ).id('sdbf:oil_bucket_s2')

})