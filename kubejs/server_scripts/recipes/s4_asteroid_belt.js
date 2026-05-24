ServerEvents.recipes(event => {

    event.shaped('kubejs:delta_dust', [
        'BAB',
        'CDC',
        'AEA'
    ], {
        B: 'thermal:earth_charge',
        A: 'kubejs:bizarre_matter_dust',
        C: "#forge:dusts/lead_platinum",
        D: 'slashblade:proudsoul_sphere',
        E: '#forge:storage_blocks/cobalt'
    }).id('sdbf:delta_dust_s4')

    event.shaped('kubejs:galatic_cycle_component', [
        'ABA',
        'CDE',
        'AFA'
    ], {
        A: 'nuclearcraft:turbine_casing',
        B: 'nuclearcraft:niobium_titanium_rf_amplifier',
        C: 'nuclearcraft:compact_helium_collector',
        D: 'nuclearcraft:electrolyzer',
        E: 'nuclearcraft:nuclear_furnace',
        F: 'nuclearcraft:niobium_titanium_electromagnet'
    }).id('sdbf:galatic_cycle_component_s4')

    event.shapeless('kubejs:bizarre_matter_dust', [
        ['kubejs:menril-silicon_sic_sic_cmc_ingot', 'slashblade:proudsoul_sphere', "nuclearcraft:xenorium_298"],
        '2x kubejs:asteroid_rock',
        '3x kubejs:carbon_rich_asteroid_rock',
        '3x kubejs:silica_rich_asteroid_rock'
    ]).id('sdbf:bizarre_matter_dust_s4')

    event.recipes.thermal.pulverizer([
        Item.of('kubejs:bizarre_matter_dust').withChance(0.01),
        Item.of('#forge:dusts/lapis').withChance(0.02),
        Item.of('#forge:dusts/nickel').withChance(0.04),
        Item.of('#forge:dusts/iron').withChance(0.07),
    ], [
        'kubejs:asteroid_rock'
    ]).energy(16384)
        .id('sdbf:bizarre_matter_dust_acc1_s4')

    event.recipes.thermal.pulverizer([
        Item.of('kubejs:bizarre_matter_dust').withChance(0.01),
        Item.of('#forge:dusts/graphite').withChance(0.05),
        Item.of('#forge:dusts/coal').withChance(0.08),
        Item.of('minecraft:sand').withChance(0.1),
    ], [
        'kubejs:carbon_rich_asteroid_rock'
    ]).energy(16384)
        .id('sdbf:bizarre_matter_dust_acc2_s4')

    event.recipes.thermal.pulverizer([
        Item.of('kubejs:bizarre_matter_dust').withChance(0.012),
        Item.of('#forge:silicon').withChance(0.04),
        Item.of('#forge:dusts/certus_quartz').withChance(0.06),
        Item.of('#forge:dusts/quartz').withChance(0.08),
    ], [
        'kubejs:silica_rich_asteroid_rock'
    ]).energy(16384)
        .id('sdbf:bizarre_matter_dust_acc3_s4')

    event.custom({
        "type": "nuclearcraft:assembler",
        "input": [
            Item.of('kubejs:bizarre_matter_dust', 2).toJson(),
            Item.of('slashblade:proudsoul_sphere').toJson(),
            Ingredient.of('#forge:storage_blocks/cobalt').toJson(),
            Ingredient.of("#forge:dusts/lead_platinum").toJson(),
            Item.of('minecraft:gunpowder').toJson(),
        ],
        "output": [Item.of('kubejs:delta_dust').toJson()],
        "powerModifier": 10.0, "radiation": 1.0, "timeModifier": 2.0
    }).id('sdbf:delta_dust_acc_s4')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SBS",
        "CNE",
        "SFS"
    ], {
        "S": "slashblade:proudsoul_sphere",     // 耀魂宝珠
        "N": 'kubejs:galatic_cycle_component',
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kamuy_none") // 前置刀剑：神威·无
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_protection", 7))
                .killCount(5000)                     // 要求：500 击杀
                .proudSoul(5000)                    // 要求：5000 耀魂
                .refineCount(50)                    // 要求：20 锻造
                .build()
        ),
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("blades_derby:uma_black") // 前置刀剑：神威·无
                .killCount(2500)                     // 要求：500 击杀
                .proudSoul(5000)                    // 要求：5000 耀魂
                .refineCount(50)                    // 要求：20 锻造
                .build()
        ),
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ssa_kagari") // 前置刀剑：神威·无
                .killCount(2500)                     // 要求：500 击杀
                .proudSoul(5000)                    // 要求：5000 耀魂
                .refineCount(50)                    // 要求：20 锻造
                .build()
        ),
        "F": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:clothesline") // 前置刀剑：神威·无
                .killCount(2500)                     // 要求：500 击杀
                .proudSoul(5000)                    // 要求：5000 耀魂
                .refineCount(50)                    // 要求：20 锻造
                .build()
        )
    }, "slashblade_addon:kamuy_fire")
        .id("sdbf:kamuy_fire_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("energyblade:forge_energy_blade", [
        "SBS",
        "DND",
        "FSE"
    ], {
        "S": "slashblade:proudsoul_sphere",
        "D": 'kubejs:delta_dust',
        "N": 'last_smith:scroll_sharpness',
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:roukanken")
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:sharpness", 7))
                .killCount(10000)                     // 要求：500 击杀
                .proudSoul(100000)                    // 要求：5000 耀魂
                .refineCount(50)                    // 要求：20 锻造
                .build()
        ),
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ssa_roze") // 前置刀剑：神威·无
                .killCount(5000)                     // 要求：500 击杀
                .proudSoul(50000)                    // 要求：5000 耀魂
                .refineCount(50)                    // 要求：20 锻造
                .build()
        ),
        "F": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:dissociator") // 前置刀剑：神威·无
                .killCount(7500)                     // 要求：500 击杀
                .proudSoul(50000)                    // 要求：5000 耀魂
                .refineCount(50)                    // 要求：20 锻造
                .build()
        )
    }, "last_smith:bunshi")
        .id("sdbf:bunshi_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("energyblade:forge_energy_blade", [
        " RI",
        "RBG",
        "SL "
    ], {
        "R": 'cataclysm:essence_of_the_storm',
        "I": 'cataclysm:astrape',             // 铁锭 (Iron Ingot Tag)
        "G": 'slashblade_sendims:blood_jade',               // 火药 (Gunpowder Tag)
        "L": 'undergarden:blood_globule',                // 拉杆 (Lever - 对应高周波刀鞘的扳机)
        "S": Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"sjap_adder:super_blood_cuts"}').weakNBT(),
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:muramasa")       // 要求：村正 (Muramasa)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:unbreaking", 7))
                .killCount(5000)
                .refineCount(50)
                .build()
        )
    }, "slashblade_addon:hf_murasama")
        .id("sdbf:hf_murasama_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABF",
        "CDB",
        "ECA"
    ], {
        "A": 'slashblade:proudsoul_sphere',
        "B": 'cataclysm:ignitium_ingot',
        "C": 'aether_treasure_reforging:pyral_ingot',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_bone_fire")
                .killCount(7500)
                .proudSoul(100000)
                .refineCount(50)
                .build()
        ),
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:terra_blade")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "F": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_bone_ice")
                .killCount(7500)               // 要求：100 击杀
                .proudSoul(100000)
                .refineCount(50)               // 要求：1 锻造
                .build()
        )
    }, "sjap_adder:dragon_steel_fire")
        .id("sdbf:dragon_steel_fire_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABF",
        "CDB",
        "ECA"
    ], {
        "A": 'slashblade:proudsoul_sphere',
        "B": 'aether:lightning_knife',
        "C": 'enderio:double_layer_capacitor',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_bone_lightning")
                .killCount(7500)
                .proudSoul(100000)
                .refineCount(50)
                .build()
        ),
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:terra_blade")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "F": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_bone_ice")
                .killCount(7500)
                .proudSoul(100000)
                .refineCount(50)
                .build()
        )
    }, "sjap_adder:dragon_steel_lightning")
        .id("sdbf:dragon_steel_lightning_s4")


    event.recipes.slashblade.slashblade_shaped_recipe("energyblade:forge_energy_blade", [
        "ABA",
        "CDC",
        "AEA"
    ], {
        "A": 'slashblade:proudsoul_sphere',
        "B": 'nuclearcraft:active_enderium_heat_sink',
        "C": 'nuclearcraft:active_redstone_heat_sink',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:hf_murasama")
                .killCount(7500)
                .proudSoul(100000)
                .refineCount(50)
                .build()
        ),
        "E": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ssa_raye")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(25)
                .build()
        )
    }, "slashblade:red_blade_raye")
        .id("sdbf:red_blade_raye_s4")

})