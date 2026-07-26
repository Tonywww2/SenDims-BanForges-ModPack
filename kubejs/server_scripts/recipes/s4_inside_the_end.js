ServerEvents.recipes(event => {

    event.shaped('kubejs:basepoint_alloy', [
        'ABA',
        'CDE',
        'AFA'
    ], {
        A: 'kubejs:alpha_dust',
        B: 'slashblade:proudsoul_crystal',
        C: 'kubejs:scoria_ingot',
        D: 'nuclearcraft:niobium_titanium_electromagnet',
        E: 'kubejs:menril-silicon_sic_sic_cmc_ingot',
        F: 'kubejs:chorus_logic_composite_coil'
    }).id('sdbf:basepoint_alloy_s4')


    event.custom({
        "type": "ad_astra:nasa_workbench",
        "ingredients": [
            Item.of('kubejs:anchor_shard').toJson(),

            Ingredient.of('nuclearcraft:plate_extreme').toJson(),
            Ingredient.of('nuclearcraft:plate_extreme').toJson(),
            Ingredient.of('nuclearcraft:dps').toJson(),
            Ingredient.of('nuclearcraft:dps').toJson(),
            Ingredient.of('nuclearcraft:linear_accelerator_controller').toJson(),
            Ingredient.of('nuclearcraft:em_calorimeter').toJson(),

            Item.of('kubejs:delta_dust').toJson(),
            Item.of('nuclearcraft:plate_extreme').toJson(),
            Item.of('nuclearcraft:plate_extreme').toJson(),
            Item.of('kubejs:delta_dust').toJson(),

            Item.of('kubejs:delta_dust').toJson(),
            Item.of('ad_astra:tier_4_rocket').toJson(),
            Item.of('kubejs:delta_dust').toJson()
        ],
        "result": {
            "count": 1,
            "id": "ad_astra_rocketed:tier_5_rocket"
        }
    }).id("sdbf:tier_5_rocket_s4")

    event.custom({
        "type": "botania:runic_altar",
        "ingredients": [
            Item.of('computercraft:computer_advanced').toJson(),
            Item.of('nuclearcraft:dps').toJson(),
            Item.of('nuclearcraft:plutonium_rtg').toJson(),
            Item.of('nuclearcraft:lithium_ion_cell').toJson(),
            Item.of('nuclearcraft:accelerator_ion_source_port').toJson(),
            Item.of('productivebees:gene_indexer').toJson(),
            Item.of('slashblade:proudsoul_crystal').toJson(),
            Item.of('thermal:energy_limiter_attachment').toJson(),
            Item.of('computercraft:computer_advanced').toJson(),
            Item.of('kubejs:alpha_dust').toJson(),
            Item.of('nuclearcraft:quantite').toJson(),
            Item.of('thermal:enderium_glass').toJson(),
            Item.of('thermal:enderium_glass').toJson()
        ],
        "mana": 50000,
        "output": {
            "count": 1,
            "item": 'kubejs:radiation_components'
        }
    }).id("sdbf:radiation_components_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AWB",
        "XCY",
        "DZE"
    ], {
        "A": 'minecraft:blue_ice',
        "B": 'slashblade:proudsoul_crystal',
        "C": 'kubejs:chaotic_truth',
        "D": 'nuclearcraft:cryotheum_heat_sink',
        "E": 'aether:icestone',
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
                .killCount(5000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ssa_hayate")
                .killCount(5000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Z": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:bizen_osafune_nagamitsu")
                .killCount(5000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
    }, "slashblade_addon:kamuy_water")
        .id("sdbf:kamuy_water_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AYB",
        "CXW",
        "BYA"
    ], {
        "A": 'kubejs:radiation_components',
        "B": 'slashblade:proudsoul_crystal',
        "C": 'last_smith:scroll_yamato',
        "W": 'last_smith:scroll_blood',
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:roukanken")
                .killCount(10000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(75000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:rivers_of_blood")
                .killCount(5000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(50000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(50)                    // 要求：20 锻造 (Refine Count)
                .build()
        )
    }, "last_smith:roukanken_nether")
        .id("sdbf:roukanken_nether_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "BAC",
        "AXA",
        "DAB"
    ], {
        "A": 'kubejs:basepoint_alloy',
        "B": 'draconicevolution:chaotic_core',
        "C": Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"pseudoedge_break_dawn:kingblade"}').weakNBT(),
        "D": Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:void_slash"}').weakNBT(),
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:amagumo_kumo")
                .killCount(20000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(125000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        )
    }, "last_smith:amagumo_munin")
        .id("sdbf:amagumo_munin_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "DBD",
        "XYZ",
        "CAC"
    ], {
        "A": 'nuclearcraft:californium_rtg',
        "B": 'nuclearcraft:fusion_core',
        "C": 'slashblade:proudsoul_crystal',
        "D": 'nuclearcraft:dense_nitrogen_collector',
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:roukanken_nether")
                .killCount(25000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(80000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:black_soul")
                .killCount(7500)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(80000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
        "Z": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:red_blade_raye")
                .killCount(17500)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(150000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
    }, "slashblade:red_blade_black_soul")
        .id("sdbf:red_blade_black_soul_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AVA",
        "WXW",
        "BZB"
    ], {
        "A": 'apotheosis:draconic_endshelf',
        "B": 'draconicevolution:awakened_core',
        "V": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:greatsword_of_damnation")
                .killCount(2500)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "W": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ruined_sword")
                .killCount(2500)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:greatsword_of_damnation_plus")
                .killCount(10000)
                .proudSoul(100000)
                .refineCount(100)
                .build()
        ),
        "Z": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:dragonblade")
                .killCount(10000)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(100000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
    }, "slashblade:greatsword_of_damnation_full")
        .id("sdbf:greatsword_of_damnation_full_s4")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AVA",
        "WXY",
        "BZB"
    ], {
        "A": 'botania:gaia_ingot',
        "B": 'kubejs:basepoint_alloy',
        "V": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_steel_lightning")
                .killCount(22500)
                .proudSoul(200000)
                .refineCount(100)
                .build()
        ),
        "W": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ssa_hayate")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "X": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:terra_blade")
                .killCount(2500)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "Y": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kamuy_water")
                .killCount(22500)
                .proudSoul(200000)
                .refineCount(100)
                .build()
        ),
        "Z": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:dragon_steel_fire")
                .killCount(22500)                     // 要求：500 击杀 (Kill Count)
                .proudSoul(200000)                    // 要求：5000 耀魂 (Proud Soul)
                .refineCount(100)                    // 要求：20 锻造 (Refine Count)
                .build()
        ),
    }, "sjap_adder:dragon_steel_ice")
        .id("sdbf:dragon_steel_ice_s4")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": { "item": 'kubejs:basepoint_alloy' },
        "base": {
            "type": "slashblade:blade", "item": "slashblade:slashblade",
            "request": {
                "kill": 10000,
                "name": "last_smith:nagasada",
                "refine": 100
            }
        },
        "blade": "last_smith:amagumo_kumo",
        "template": { "item": "last_smith:scroll_bewitched" }
    }).id("sdbf:amagumo_kumo_s4")
    
    event.custom({
        "type": "draconicevolution:fusion_crafting",
        "catalyst": {
            "item": 'slashblade:proudsoul_crystal'
        },
        "ingredients": [
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),

            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:judgement_cut"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:judgement_cut"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:judgement_cut"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:judgement_cut"}').weakNBT().toJson(),

            Item.of('draconicevolution:awakened_core').toJson(),
            Item.of('draconicevolution:awakened_core').toJson(),

            Item.of('draconicevolution:draconic_energy_core').toJson(),
            Item.of('draconicevolution:draconic_energy_core').toJson(),
            Item.of('draconicevolution:draconic_energy_core').toJson(),
            Item.of('draconicevolution:draconic_energy_core').toJson(),
            
            Item.of('draconicevolution:awakened_core').toJson(),
            Item.of('draconicevolution:awakened_core').toJson(),

            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:judgement_cut"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:judgement_cut"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:judgement_cut"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade:judgement_cut"}').weakNBT().toJson(),

            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
        ],
        "result": Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_sendims:chaotic_judgement_cut"}').toJson(),
        "tier": "DRACONIC",
        "total_energy": 100000000
    }).id("sdbf:chaotic_judgement_cut_s4")
    
    event.custom({
        "type": "draconicevolution:fusion_crafting",
        "catalyst": {
            "item": 'slashblade:proudsoul_crystal'
        },
        "ingredients": [
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),

            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_addon:rapid_blistering_swords"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_addon:rapid_blistering_swords"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_addon:rapid_blistering_swords"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_addon:rapid_blistering_swords"}').weakNBT().toJson(),

            Item.of('draconicevolution:awakened_core').toJson(),
            Item.of('draconicevolution:awakened_core').toJson(),

            Item.of('draconicevolution:draconic_energy_core').toJson(),
            Item.of('draconicevolution:draconic_energy_core').toJson(),
            Item.of('draconicevolution:draconic_energy_core').toJson(),
            Item.of('draconicevolution:draconic_energy_core').toJson(),
            
            Item.of('draconicevolution:awakened_core').toJson(),
            Item.of('draconicevolution:awakened_core').toJson(),

            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_addon:rapid_blistering_swords"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_addon:rapid_blistering_swords"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_addon:rapid_blistering_swords"}').weakNBT().toJson(),
            Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_addon:rapid_blistering_swords"}').weakNBT().toJson(),

            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
            Item.of('draconicevolution:infused_obsidian').toJson(),
        ],
        "result": Item.of('slashblade:proudsoul_sphere', '{SpecialAttackType:"slashblade_sendims:chaotic_rapid_blistering_swords"}').toJson(),
        "tier": "DRACONIC",
        "total_energy": 100000000
    }).id("sdbf:chaotic_rapid_blistering_swords_s4")

})