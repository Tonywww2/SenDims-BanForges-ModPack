ServerEvents.recipes(event => {
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "EBE",
        "BDB",
        "EBE"
    ], {
        "E": 'kubejs:gamma_dust',
        "B": "minecraft:cobblestone",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:slashblade")
                .killCount(7)      // 杀敌数 / Kill count
                .proudSoul(7)      // 荣耀魂 / ProudSoul
                .refineCount(0)    // 锻造数 / Refine count
                .build()
        )
    }, "slashblade:air_sword")
        .id("sdbf:air_sword_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABA",
        "CDC",
        "ACA"
    ], {
        "A": 'kubejs:gamma_dust',
        "B": "minecraft:nether_star",
        "C": "minecraft:diamond_block",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:fox_black")
                .killCount(1500)
                .proudSoul(12000)
                .refineCount(6)
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
            SlashBladeRequestDefinition.newInstance().name("slashblade:slashblade")
                .killCount(7)      // 杀敌数 / Kill count
                .proudSoul(7)      // 荣耀魂 / ProudSoul
                .refineCount(0)    // 锻造数 / Refine count
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
                .killCount(777)        // 杀敌数 / Kill count
                .proudSoul(7777)       // 荣耀魂 / ProudSoul
                .refineCount(7)         // 锻造数 / Refine count
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
                .killCount(1437)          // 杀敌数 / Kill count
                .proudSoul(77777)         // 荣耀魂 / ProudSoul
                .refineCount(14)          // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_aspect", 2)) // 火焰附加 II / Fire Aspect II
                .build()
        ),
        "E": "minecraft:diamond",
        "S": 'last_smith:sakura_full'
    }, "slashblade:bizen_osafune_nagamitsu")
        .id("sdbf:bizen_osafune_nagamitsu_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SPJ",
        "LBL",
        "JAS"
    ], {
        "S": "slashblade:proudsoul_sphere",
        "L": "#forge:storage_blocks/iron",     // 铁块标签 / Iron block tag
        "J": "#forge:storage_blocks/redstone", // 红石块标签 / Redstone block tag
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade_addon:tboen")
                .killCount(150)
                .refineCount(15)
                .build()
        ),
        "A": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:kanze_masamune")
                .killCount(350)
                .refineCount(15)
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
        "E": 'kubejs:scoria_ingot',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("energyblade:hf_blade") // 前置：观世正宗
                .killCount(750)         // 杀敌数 / Kill count
                .proudSoul(15000)        // 荣耀魂 / ProudSoul
                .refineCount(20)         // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:unbreaking", 3)) // 耐久 III / Unbreaking III
                .build()
        ),
        "A": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:ruined_sword")
                .killCount(250)
                .refineCount(10)
                .build()
        ),
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:kanze_masamune")
                .killCount(250)
                .refineCount(10)
                .build()
        ),
    }, "slashblade:dissociator")
        .id("sdbf:dissociator_s3")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": 'kubejs:mysterious_alkali_crystal'
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
            "item": 'kubejs:mysterious_alkali_crystal'
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