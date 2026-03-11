ServerEvents.recipes(event => {

    event.smelting('ad_astra:moon_cobblestone', ['dustandash:cobblestone_with_moss'], 0, 200).id("sdbf:moon_cobblestone_s2")

    event.shapeless('slashblade_sendims:estus_flask_2', ['slashblade_sendims:estus_flask_1', "ad_astra:desh_engine"]).id('sdbf:estus_flask_2_s2')

    event.shaped('confluence:obsidian_rose', [
        'ADA',
        'BEB',
        ' C '
    ], {
        A: 'ad_astra:ice_shard',
        B: 'minecraft:poppy',
        C: '#forge:obsidian',
        D: 'minecraft:lava_bucket',
        E: 'ad_astra:moon_globe',
    }).keepIngredient('ad_astra:moon_globe')
        .id('sdbf:obsidian_rose_s2')

    event.shaped('2x kubejs:bedrock_breaker', [
        ' BA',
        'BCB',
        'AB '
    ], {
        A: 'tetra:metal_scrap',
        B: 'ad_astra:ice_shard',
        C: 'confluence:obsidian_rose'
    }).id('sdbf:bedrock_breaker_s2')

    event.shaped('ad_astra:desh_engine', [
        'AEA',
        'ABA',
        ' C '
    ], {
        A: '#forge:storage_blocks/desh',
        B: 'ad_astra:steel_engine',
        C: 'ad_astra:fan',
        E: '#ad_astra:desh_plates'
    }).id('sdbf:desh_engine_1_s2')

    event.shaped('ad_astra:desh_engine', [
        'AEA',
        'ABA',
        ' C '
    ], {
        A: '#ad_astra:desh_plates',
        B: 'ad_astra:steel_engine',
        C: 'ad_astra:fan',
        E: 'thermal:enderium_gear'
    }).id('sdbf:desh_engine_2_s2')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "  I",
        "QI ",
        "BC "
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:doutanuki")
                .build()
        ),
        "C": "minecraft:clock",
        "I": "slashblade:proudsoul_ingot",
        "Q": '#forge:ingots/desh'
    }, "slashblade_addon:wanderer")
        .id('sdbf:wanderer_s2')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "DEC",
        "FBC"
    ], {
        "A": 'tetra:forged_bolt',
        "B": "slashblade:proudsoul",
        "C": 'tetra:metal_scrap',
        "D": 'tetra:planar_stabilizer',
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
        "A": 'ad_astra:moon_sand',
        "B": 'ad_astra:rocket_nose_cone',
        "D": 'ad_astra:moon_stone',
        "E": 'confluence:rocket_boots',
        "F": "minecraft:obsidian",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:xblades") // 要求：X-Blades
                .killCount(100)                       // 要求：100 击杀 (Kill Count)
                .proudSoul(20000)                      // 要求：20000 耀魂 (Proud Soul)
                .refineCount(10)                       // 要求：10 锻造 (Refine Count)
                .build()
        )
    }, "pseudoedge_break_dawn:latent")
        .id("sdbf:latent_s2")

    event.shaped($StructureQuill.forStructure("ad_astra:moon_dungeon"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'ad_astra:moon_stone',
        B: 'minecraft:map'
    }).id('sdbf:sq_moon_dungeon_s2')

    event.shaped($StructureQuill.forStructure("tetra:regular_ruin"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: "ad_astra:desh_ingot",
        B: 'minecraft:map'
    }).id('sdbf:sq_regular_ruin_s2')

    event.custom({
        "type": "ad_astra:compressing",
        "cookingtime": 4000,
        "energy": 100,
        "ingredient": {
            "item": 'minecraft:lava_bucket'
        },
        "result": {
            "count": 1,
            "id": 'ad_astra:oil_bucket'
        }
    }).id('sdbf:oil_bucket_s2')

})