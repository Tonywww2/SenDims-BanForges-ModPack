ServerEvents.recipes(event => {

    sqRecipe(event, "midnight:forgotten_library", 'midnight:ebonite', 1, "s3");

    event.shaped('kubejs:scoria_ingot', [
        'DBA',
        'BCB',
        'ABD'
    ], {
        A: 'midnight:dark_pearl',
        B: 'midnight:tenebrum_ingot',
        C: 'midnight:virilux',
        D: 'minecraft:lava_bucket'
    }).id('sdbf:scoria_ingot_s3')

    event.shaped("slashblade_sendims:blessing_petals", [
        'ACA',
        'EDE',
        'AFA'
    ], {
        A: "slashblade:proudsoul_ingot",
        D: 'last_smith:sakura',
        E: ["kubejs:scoria_ingot", 'ad_astra:calorite_tank'],
        C: 'deep_aether:stratus_ingot',
        F: 'minecraft:ender_eye'
    }).id('sdbf:blessing_petals_s3')

    event.recipes.thermal.smelter('kubejs:scoria_ingot', [
        'midnight:virilux',
        '2x midnight:dark_pearl',
        '3x midnight:tenebrum_ingot'
    ])
        .energy(10240)
        .id("sdbf:scoria_ingot_s3_acce")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ASE",
        "BKD",
        "CBF"
    ], {
        "A": "minecraft:soul_lantern",
        "B": "slashblade:proudsoul_ingot",
        "C": "minecraft:fermented_spider_eye",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:sange")
                .killCount(1000)         // 杀敌数 / Kill count
                .proudSoul(10000)        // 荣耀魂 / ProudSoul
                .refineCount(25)          // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:power", 1))    // 力量 I / Power I
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:sharpness", 1)) // 锋利 I / Sharpness I
                .build()
        ),
        "S": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:dojikiri_yasutsuna")
                .killCount(500)         // 杀敌数 / Kill count
                .proudSoul(10000)        // 荣耀魂 / ProudSoul
                .refineCount(5)          // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:power", 5))    // 力量 I / Power I
                .build()
        ),
        "E": "minecraft:bone_block",
        "F": "minecraft:rotten_flesh",
        "K": 'midnight:nagrilite_ingot'
    }, "slashblade:rivers_of_blood")
        .id("sdbf:rivers_of_blood_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " BE",
        "BDB",
        "EB "
    ], {
        "B": "slashblade:proudsoul_ingot",
        "E": 'midnight:tenebrum_ingot',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:kanze_masamune") // 对应 request.name
                .killCount(500)                    // 对应 request.kill
                .proudSoul(10000)                   // 对应 request.proud_soul
                .refineCount(10)                    // 对应 request.refine
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:bane_of_arthropods", 2)) // 对应 enchantments
                .build()
        )
    }, "slashblade:clothesline") // 对应 JSON 中的 "blade" 字段
        .id("sdbf:clothesline_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "PRQ",
        "RL ",
        "BGC"
    ], {
        "P": 'slashblade:proudsoul_ingot',
        "R": "minecraft:redstone_block",
        "Q": 'midnight:corrupted_pearl',
        "L": 'integrateddynamics:portable_logic_programmer',
        "G": "minecraft:gold_block",
        "C": "minecraft:cherry_leaves",
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:muramasa")     // 对应村正 (Muramasa)
                .killCount(500)                // 1000 斩
                .proudSoul(10000)               // 10000 耀魂
                .refineCount(25)                // 25 锻
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:thorns", 1)) // 荆棘 (Thorns)
                .build()
        )
    }, "slashblade_addon:moonlight_cherry")
        .id("sdbf:moonlight_cherry_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "PRE",
        "RE ",
        "BGC"
    ], {
        "P": 'slashblade:proudsoul_ingot',
        "R": 'kubejs:mysterious_alkali_crystal',
        "E": "minecraft:emerald_block",
        "G": "minecraft:gold_block",
        "C": 'kubejs:gamma_dust',
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:moonlight_cherry")
                .killCount(1500)                // 要求：1000 击杀 (Kill Count)
                .proudSoul(20000)               // 要求：10000 耀魂 (Proud Soul)
                .refineCount(25)                // 要求：25 锻造 (Refine Count)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:power", 3)) // 要求：力量 III (Power 3)
                .build()
        )
    }, "slashblade_addon:green_mist")
        .id("sdbf:green_mist_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AAA",
        "CDE",
        "GGG"
    ], {
        "A": 'midnight:crystalotus',
        "C": "minecraft:ender_eye",
        "E": "minecraft:axolotl_bucket",
        "G": 'slashblade:proudsoul_ingot',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:kanze_masamune") // 要求：观世正宗 (Kanze Masamune)
                .killCount(1000)                  // 要求：2000 击杀 (Kill Count)
                .proudSoul(20000)                 // 要求：40000 耀魂 (Proud Soul)
                .refineCount(25)                  // 要求：30 锻造 (Refine Count)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:unbreaking", 3)) // 要求：耐久 III (Unbreaking 3)
                .build()
        )
    }, "slashblade:hand_of_malenia")
        .id("sdbf:hand_of_malenia_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "BDB",
        "CBA"
    ], {
        "A": "minecraft:blaze_rod",
        "B": "slashblade:proudsoul_ingot",
        "C": 'kubejs:scoria_ingot',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:kingblade")
                .killCount(1000)                  // 要求：1500 击杀 (Kill Count)
                .proudSoul(10000)                 // 要求：10000 耀魂 (Proud Soul)
                .refineCount(25)                  // 要求：10 锻造 (Refine Count)
                // 多个附魔要求 (Multiple Enchantments)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_aspect", 2)) // 火焰附加 II
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:unbreaking", 3))  // 耐久 III
                .build()
        )
    }, "slashblade:ssa_kagari")
        .id("sdbf:ssa_kagari_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABF",
        "BEB",
        "DBA"
    ], {
        "A": 'kubejs:scoria_ingot',
        "B": "slashblade:proudsoul_ingot",
        "E": "minecraft:apple",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kirisaya")
                .killCount(2000)                  // 要求：1500 击杀 (Kill Count)
                .proudSoul(10000)                 // 要求：10000 耀魂 (Proud Soul)
                .refineCount(25)                  // 要求：10 锻造 (Refine Count)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:unbreaking", 3)) // 耐久 III (Unbreaking III)
                .build()
        ),
        "F": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:snow_crow")
                .killCount(500)                  // 要求：1500 击杀 (Kill Count)
                .proudSoul(5000)                 // 要求：10000 耀魂 (Proud Soul)
                .refineCount(10)                  // 要求：10 锻造 (Refine Count)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:knockback", 2)) // 击退 II (Knockback II)
                .build()
        )
    }, "slashblade:ssa_hayate")
        .id("sdbf:ssa_hayate_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "KES",
        "GHI"
    ], {
        "A": "midnight:rendium_block",
        "C": "minecraft:beacon",
        "E": "minecraft:wither_rose",
        "G": "minecraft:wither_skeleton_skull",
        "I": "slashblade:proudsoul_ingot",
        // 核心原料 1：付丧 (Yuzukitukumo)
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:yuzukitukumo")
                .killCount(1000)
                .proudSoul(5000)
                .refineCount(10)
                .build()
        ),
        // 核心原料 2：紫 (Yukari)
        "H": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:yukari")
                .killCount(1000)
                .proudSoul(5000)
                .refineCount(10)
                .build()
        ),
        "K": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ssa_kagari")
                .killCount(3000)
                .proudSoul(20000)
                .refineCount(25)
                .build()
        ),
        "S": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ssa_hayate")
                .killCount(3500)
                .proudSoul(20000)
                .refineCount(25)
                .build()
        )
    }, "sjap_adder:toyoko")
        .id("sdbf:toyoko_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "EDF",
        "GHI"
    ], {
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .killCount(20)      // 杀敌数 / Kill count
                .refineCount(25)    // 锻造数 / Refine count
                .build()
        ),
        "A": 'midnight:stinger_egg',
        "B": 'midnight:tall_mistshroom',
        "C": 'midnight:mangledrake',
        "E": 'midnight:bloodstem',
        "F": 'midnight:ghost_plant',
        "G": 'midnight:fingered_grass',
        "H": 'midnight:rockshroom',
        "I": 'midnight:rifter_flesh'
    }, "slashblade:dojikiri_yasutsuna")
        .id("sdbf:dojikiri_yasutsuna_s3")

})