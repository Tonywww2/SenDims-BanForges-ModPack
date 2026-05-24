ServerEvents.recipes(event => {

    event.shapeless('nuclearcraft:carbon_manganese_ingot', [
        '#forge:ingots/manganese',
        'minecraft:sugar'
    ]).id("sdbf:carbon_manganese_ingot_s3")

    event.shapeless('nuclearcraft:sic_sic_cmc_ingot', [
        'minecraft:ancient_debris',
        'nuclearcraft:carbon_manganese_ingot',
        '3x minecraft:fire_charge'
    ]).id("sdbf:sic_sic_cmc_ingot_s3")

    event.shapeless('kubejs:menril-silicon_sic_sic_cmc_ingot', [
        'integrateddynamics:crystalized_menril_block',
        'nuclearcraft:bronze_ingot',
        'nuclearcraft:sic_sic_cmc_ingot',
        '3x minecraft:fire_charge',
        '3x minecraft:andesite'
    ]).id("sdbf:menril-silicon_sic_sic_cmc_ingot_s3")
        
    event.shaped(Item.of('midnight:rift_placer', `{${MIDNIGHT_STAGE}: true}`), [
        'ABA',
        'BDB',
        'AFA'
    ], {
        A: 'slashblade:proudsoul',
        B: 'kubejs:mysterious_alkali_crystal',
        D: 'midnight:rift_placer',
        F: 'nuclearcraft:sulfuric_acid_bucket'
    }).id('sdbf:rift_placer_s3')

    event.shaped('undergarden:catalyst', [
        'ACA',
        'CBC',
        'ACA'
    ], {
        A: "kubejs:scoria_ingot",
        B: 'midnight:rendium_shard',
        C: "#forge:ingots/netherite"
    }).keepIngredient('twilightforest:lamp_of_cinders')
        .id('sdbf:catalyst_s3')

    event.shaped(Item.of(
        'integrateddynamics:variable',
        16,
        '{AttributeModifiers:[{Amount:0.1d,AttributeName:"generic.movement_speed",Name:"generic.movement_speed",Operation:2,Slot:"mainhand",UUID:[I;909331771,1706297431,1562908780,610199584]}],HideFlags:3}'
    ).enchant('minecraft:protection', 1)
        ,
        [
            'AMA',
            'EDE',
            'AFA'
        ], {
        A: '#forge:gems/lapis',
        D: '#forge:paper',
        E: ['aether_treasure_reforging:neptune_mesh', 'aether_treasure_reforging:valkyrum_ingot', 'aether_treasure_reforging:pyral_ingot'],
        F: 'deep_aether:stratus_ingot',
        M: 'twilightforest:lamp_of_cinders'
    }).keepIngredient('twilightforest:lamp_of_cinders')
        .id('sdbf:variable_s3')

    event.custom({
        "type": "nuclearcraft:assembler",
        "input": [
            Item.of('integrateddynamics:crystalized_menril_block').toJson(),
            Item.of('nuclearcraft:sic_sic_cmc_ingot').toJson(),
            Item.of('nuclearcraft:bronze_ingot', 2).toJson(),
            Item.of('nuclearcraft:beryllium_dust', 2).toJson()
        ],
        "output": [
            Item.of('2x kubejs:menril-silicon_sic_sic_cmc_ingot').toJson()
        ],
        "powerModifier": 2.0, "radiation": 1.0, "timeModifier": 2.0
    }).id("sdbf:menril-silicon_sic_sic_cmc_ingot_acc_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "EBE",
        "BDB",
        "EBE"
    ], {
        "E": 'kubejs:gamma_dust',
        "B": "minecraft:cobblestone",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .killCount(7)      // 杀敌数 / Kill count
                .refineCount(5)    // 锻造数 / Refine count
                .build()
        )
    }, "slashblade:air_sword")
        .id("sdbf:air_sword_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABA",
        "CDC",
        "AKA"
    ], {
        "A": 'kubejs:gamma_dust',
        "B": "minecraft:nether_star",
        "C": "minecraft:diamond_block",
        "K": 'cataclysm:tidal_claws',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:fox_black")
                .killCount(1500)
                .proudSoul(12000)
                .refineCount(10)
                .build()
        )
    }, "foxextra:foxex_black")
        .id("sdbf:foxex_black_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "EBE",
        "BDB",
        "SBE"
    ], {
        "B": "slashblade:proudsoul_ingot",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .killCount(20)      // 杀敌数 / Kill count
                .refineCount(10)    // 锻造数 / Refine count
                .build()
        ),
        "E": 'kubejs:gamma_dust',
        "S": "minecraft:diamond_sword"
    }, "slashblade:kanze_masamune")
        .id("sdbf:kanze_masamune_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABE",
        "BDB",
        "EBA"
    ], {
        "A": 'kubejs:gamma_dust',
        "B": "slashblade:proudsoul_ingot",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:air_sword") // 前置：观世正宗
                .killCount(1000)        // 杀敌数 / Kill count
                .proudSoul(10000)       // 荣耀魂 / ProudSoul
                .refineCount(10)         // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:power", 3)) // 力量 III / Power III
                .build()
        ),
        "E": "minecraft:amethyst_shard"
    }, "slashblade:moonveil")
        .id("sdbf:moonveil_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SBE",
        "BDB",
        "EBS"
    ], {
        "B": "slashblade:proudsoul_ingot",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:moonveil")
                .killCount(2500)          // 杀敌数 / Kill count
                .proudSoul(10000)         // 荣耀魂 / ProudSoul
                .refineCount(25)          // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_aspect", 2)) // 火焰附加 II / Fire Aspect II
                .build()
        ),
        "E": 'cataclysm:blessed_amethyst_crab_meat',
        "S": 'last_smith:sakura_full'
    }, "slashblade:bizen_osafune_nagamitsu")
        .id("sdbf:bizen_osafune_nagamitsu_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SPJ",
        "LBL",
        "JAS"
    ], {
        "S": 'kubejs:mysterious_alkali_crystal',
        "L": "#forge:storage_blocks/iron",     // 铁块标签 / Iron block tag
        "J": "#forge:storage_blocks/redstone", // 红石块标签 / Redstone block tag
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade_addon:tboen")
                .killCount(1500)
                .refineCount(25)
                .build()
        ),
        "A": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:kanze_masamune")
                .killCount(1000)
                .refineCount(25)
                .build()
        ),
        "P": 'thermal:rf_potato'
    }, "energyblade:hf_blade")
        .id("sdbf:hf_blade_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "EBC",
        "BDB",
        "ABE"
    ], {
        "B": "slashblade:proudsoul_ingot",
        "E": "kubejs:menril-silicon_sic_sic_cmc_ingot",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("energyblade:hf_blade") // 前置：观世正宗
                .killCount(4000)         // 杀敌数 / Kill count
                .proudSoul(15000)        // 荣耀魂 / ProudSoul
                .refineCount(25)         // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:unbreaking", 3)) // 耐久 III / Unbreaking III
                .build()
        ),
        "A": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:ruined_sword")
                .killCount(1000)
                .refineCount(25)
                .build()
        ),
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:kanze_masamune")
                .killCount(500)
                .refineCount(10)
                .build()
        ),
    }, "slashblade:dissociator")
        .id("sdbf:dissociator_s3")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": "kubejs:menril-silicon_sic_sic_cmc_ingot"
        },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": {
                "enchantments": [
                    {
                        "id": "minecraft:sharpness"
                    }
                ],
                "kill": 1000,
                "name": "last_smith:silverbamboo_top",
                "refine": 20
            }
        },
        "blade": "last_smith:silverbamboo_blood",
        "template": {
            "item": "last_smith:scroll_sakura_full"
        }
    }).id("sdbf:bloodybamboo_s3")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": "kubejs:menril-silicon_sic_sic_cmc_ingot"
        },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": {
                "enchantments": [
                    {
                        "id": "minecraft:smite"
                    }
                ],
                "kill": 1000,
                "name": "last_smith:silverbamboo_top",
                "refine": 20
            }
        },
        "blade": "last_smith:goldenbamboo",
        "template": {
            "item": 'last_smith:scroll_blood'
        }
    }).id("sdbf:goldenbamboo_s3")

})