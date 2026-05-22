ServerEvents.recipes(event => {

    event.shapeless('cataclysm:burning_ashes', [
        'cataclysm:flame_eye'
    ]).id("sdbf:burning_ashes_s3")

    event.shaped('kubejs:mercury_refractory_structural_component', [
        'ABA',
        'BCB',
        'ADA'
    ], {
        A: 'ad_astra:mercury_stone',
        B: 'nuclearcraft:target_chamber_casing',
        C: 'ad_astra:calorite_tank',
        D: 'ad_astra:calorite_engine'
    }).id('sdbf:mercury_refractory_structural_component_s3')

    event.shaped('terra_curio:workshop', [
        'ABA',
        'CDC',
        'EFE'
    ], {
        A: 'thermal:red_rockwool',
        B: 'kubejs:scoria_ingot',
        C: 'kubejs:mercury_refractory_structural_component',
        D: 'thermal:tinker_bench',
        E: 'minecraft:lectern',
        F: 'integrateddynamics:logic_programmer',
    }).id('sdbf:workshop_s3')

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

    event.recipes.slashblade.slashblade_shaped_recipe("energyblade:forge_energy_blade", [
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
        "ASA"
    ], {
        "A": '#forge:plates/calorite',
        "B": "minecraft:nether_star",
        "C": "minecraft:diamond_block",
        "S": 'cataclysm:ancient_spear',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:fox_white")
                .killCount(1500)
                .proudSoul(12000)
                .refineCount(20)
                .build()
        )
    }, "foxextra:foxex_white")
        .id("sdbf:foxex_white_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "BDB",
        "EBA"
    ], {
        "A": "minecraft:repeater",
        "B": "slashblade:proudsoul_ingot",
        "C": "minecraft:redstone_block",
        "E": 'kubejs:mercury_refractory_structural_component',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:kanze_masamune") // 要求：观世正宗 (Kanze Masamune)
                .killCount(1500)                  // 要求：1500 击杀 (Kill Count)
                .proudSoul(10000)                 // 要求：10000 耀魂 (Proud Soul)
                .refineCount(10)                  // 要求：10 锻造 (Refine Count)
                // 多个附魔要求 (Multiple Enchantments)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:smite", 2))      // 亡灵杀手 II
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:unbreaking", 3)) // 耐久 III
                .build()
        )
    }, "slashblade:ssa_raye")
        .id("sdbf:ssa_raye_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " ID",
        "SB ",
        "PQ "
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:sange")
                .killCount(1000)
                .refineCount(20)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_protection", 1))
                .build()
        ),
        "P": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:frostbane_moonveil")
                .killCount(1000)
                .refineCount(20)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_protection", 1))
                .build()
        ),
        "D": 'kubejs:mercury_refractory_structural_component',
        "I": '#forge:plates/calorite',
        "Q": 'minecraft:packed_ice',
        "S": "minecraft:snow_block"
    }, "slashblade_addon:frosty_cherry")
        .id('sdbf:frosty_cherry_s3')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "DEF",
        "CHA"
    ], {
        "A": 'kubejs:mercury_refractory_structural_component',
        "C": 'slashblade_sendims:blood_jade',
        // 核心原料 1：Nihilex (虚无)
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:nihilex")
                .killCount(2000)
                .proudSoul(15000)
                .refineCount(20)
                .build()
        ),
        // 核心原料 2：Moonlight Cherry (月光樱)
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:moonlight_cherry")
                .killCount(2000)
                .proudSoul(15000)
                .refineCount(20)
                .build()
        ),
        // 核心原料 3：Frosty Cherry (霜樱)
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:frosty_cherry")
                .killCount(2000)
                .proudSoul(15000)
                .refineCount(20)
                .build()
        ),
        // 核心原料 4：Yukari (紫)
        "F": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:yukari")
                .killCount(2000)
                .proudSoul(15000)
                .refineCount(20)
                .build()
        ),
        // 核心原料 5：Blue (苍蓝)
        "H": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:blue")
                .killCount(2000)
                .proudSoul(15000)
                .refineCount(20)
                .build()
        )
    }, "sjap_adder:nihil_soul")
        .id("sdbf:nihil_soul_s3")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": { "item": 'kubejs:mercury_refractory_structural_component' },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": { "enchantments": [{ "id": "minecraft:power" }], "kill": 250, "name": "last_smith:evil_kataware" }
        },
        "blade": "last_smith:evil_shura",
        "template": { "item": "last_smith:scroll_sakura_full" }
    }).id("sdbf:evil_shura_s3")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": { "item": 'cataclysm:ignitium_ingot' },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": { "enchantments": [{ "id": "minecraft:sharpness" }, { "id": "minecraft:sweeping" }], "kill": 1000, "name": "last_smith:nameless_odachi", "refine": 10 }
        },
        "blade": "last_smith:fushigiri",
        "template": { "item": "last_smith:scroll_shura" }
    }).id("sdbf:fushigiri_s3")

    event.custom({
        "type": "ad_astra:nasa_workbench",
        "ingredients": [
            Item.of('cataclysm:void_core').toJson(),

            Ingredient.of('#ad_astra:calorite_blocks').toJson(),
            Ingredient.of('#ad_astra:calorite_blocks').toJson(),
            Ingredient.of('kubejs:chorus_logic_composite_coil').toJson(),
            Ingredient.of('kubejs:chorus_logic_composite_coil').toJson(),
            Ingredient.of('#ad_astra:calorite_blocks').toJson(),
            Ingredient.of('#ad_astra:calorite_blocks').toJson(),

            Item.of('kubejs:mercury_refractory_structural_component').toJson(),
            Item.of('ad_astra:calorite_engine').toJson(),
            Item.of('ad_astra:calorite_engine').toJson(),
            Item.of('kubejs:mercury_refractory_structural_component').toJson(),

            Item.of('kubejs:mercury_refractory_structural_component').toJson(),
            Item.of('cataclysm:bulwark_of_the_flame').toJson(),
            Item.of('kubejs:mercury_refractory_structural_component').toJson()
        ],
        "result": {
            "count": 1,
            "id": "ad_astra:tier_4_rocket"
        }
    }).id("sdbf:tier_4_rocket_s3")

})