ServerEvents.recipes(event => {

    sqRecipe(event, "minecraft:end_city", 'minecraft:shulker_shell', 1, "s3");

    event.shapeless("minecraft:ender_eye", [
        "minecraft:ender_pearl",
        '#forge:dusts/glowstone',
        'aether:ambrosium_shard'
    ]).id("sdbf:ender_eye_s3")

    event.shapeless('2x tetra:dragon_sinew', [
        '2x minecraft:dragon_breath',
        '2x minecraft:cobweb',
        'quark:dragon_scale'
    ]).id("sdbf:dragon_sinew_s3")

    event.shapeless("minecraft:dragon_egg", [
        '2x minecraft:dragon_breath',
        '2x tetra:dragon_sinew',
        "#forge:eggs"
    ]).id("sdbf:dragon_egg_s3")

    event.shapeless('nuclearcraft:borax_dust', [
        '8x #forge:end_stones'
    ]).id("sdbf:borax_dust_s3")

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
                .killCount(1000)               // 要求：100 击杀
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
                .killCount(2000)
                .proudSoul(30000)
                .refineCount(50)
                .build()
        ),
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:muramasa")
                .killCount(1500)
                .proudSoul(20000)
                .refineCount(25)
                .build()
        )
    }, "last_smith:oboro_muramasa")
        .id("sdbf:oboro_muramasa_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "FDF",
        "GCG",
        "FSF"
    ], {
        "D": 'last_smith:scroll_causality',
        "G": "slashblade:proudsoul_ingot",
        "F": "last_smith:sakura_full",      // 满樱 (Sakura Full)
        "S": "last_smith:scroll_exorcism",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:murakumo")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(50)
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
                .killCount(2000)
                .refineCount(50)
                .addSwordType("broken")
                .build()
        ),
        "I": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:magicblade")
                .killCount(2000)
                .refineCount(25)
                .addSwordType("broken")
                .build()
        )
    }, "pseudoedge_break_dawn:dragonblade")
        .id("sdbf:dragonblade_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "DED",
        "CBA"
    ], {
        "A": "tofucraft:inferno_nether_fukumame",
        "B": 'apotheosis:infused_breath',
        "C": 'slashblade:proudsoul_sphere',
        "D": 'minecraft:dragon_breath',
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:dragonblade")
                .killCount(7500)               // 要求：100 击杀
                .refineCount(50)               // 要求：1 锻造
                .build()
        )
    }, "sjap_adder:dragon_bone_fire")
        .id("sdbf:dragon_bone_fire_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "DED",
        "CBF"
    ], {
        "A": 'botania:ender_air_bottle',
        "B": 'apotheosis:infused_breath',
        "C": 'slashblade:proudsoul_sphere',
        "D": 'minecraft:dragon_breath',
        "F": 'enderio:double_layer_capacitor',
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:dragonblade")
                .killCount(7500)               // 要求：100 击杀
                .refineCount(50)               // 要求：1 锻造
                .build()
        )
    }, "sjap_adder:dragon_bone_lightning")
        .id("sdbf:dragon_bone_lightning_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABA",
        "EFG",
        "ABA"
    ], {
        "A": 'apotheosis:sightshelf_t2',
        "B": 'slashblade:proudsoul_sphere',
        "F": 'botania:mana_pylon',
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_bone_fire")
                .killCount(10000)               // 要求：100 击杀
                .refineCount(50)               // 要求：1 锻造
                .build()
        ),
        "G": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_bone_lightning")
                .killCount(10000)               // 要求：100 击杀
                .refineCount(50)               // 要求：1 锻造
                .build()
        )
    }, "sjap_adder:dragon_bone_ice")
        .id("sdbf:dragon_bone_ice_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ZCO",
        " BG",
        "Q X"
    ], {
        "Z": "botania:vine_ball",          // 藤蔓球
        "C": "botania:thorn_chakram",      // 带刺环刃
        "O": "botania:terrasteel_ingot",
        "G": "slashblade:proudsoul",       // 耀魂值
        "Q": "botania:terra_sword",        // 泰拉之刃
        "X": "slashblade:proudsoul_sphere", // 耀魂宝珠
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:slashblade")
                .build()
        )
    }, "slashblade_addon:terra_blade")
        .id("sdbf:terra_blade_s3")

})
