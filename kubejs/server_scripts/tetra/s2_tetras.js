ServerEvents.highPriorityData(event => {

    tetraMaterialBuilder(event, "ironwood").setCategory("metal")
        .setPrimary(2.3).setSecondary(2.2).setTertiary(1.3)
        .setDurability(250).setIntegrityCost(3).setIntegrityGain(4)
        .setMagicCapacity(80).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("attributeslib:armor_pierce", 1)
        .setTints("4d4139", "7e8b72").addTexture("heavy").addTexture("metal")
        .addItemMaterial('twilightforest:ironwood_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "ambrosium_shard").setCategory("gem")
        .setPrimary(2.2).setSecondary(2.2).setTertiary(1.9)
        .setDurability(250).setIntegrityCost(2).setIntegrityGain(4)
        .setMagicCapacity(130).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("**attributeslib:armor_shred", 0.02)
        .setTints("f9f882", "d9db30").addTexture("shiny").addTexture("crude")
        .addItemMaterial('aether:ambrosium_shard')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "bio_crystal").setCategory("gem")
        .setPrimary(2.2).setSecondary(2.3).setTertiary(1.8)
        .setDurability(250).setIntegrityCost(2).setIntegrityGain(5)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(4)
        .setTints("c2d1db", "9eb0bb").addTexture("shiny").addTexture("crude")
        .addItemMaterial('deep_aether:bio_crystal')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("apotheosis:capturing", 1)
        .build();

    tetraMaterialBuilder(event, "steeleaf").setCategory("metal")
        .setPrimary(2.3).setSecondary(2.3).setTertiary(1.8)
        .setDurability(280).setIntegrityCost(3).setIntegrityGain(5)
        .setMagicCapacity(80).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("minecraft:generic.max_health", 2)
        .setTints("27401d", "416230").addTexture("heavy").addTexture("metal")
        .addItemMaterial('twilightforest:steeleaf_ingot')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:looting", 1)
        .build();

    tetraMaterialBuilder(event, "raven_feather").setCategory("fibre")
        .setPrimary(2.4).setSecondary(2.4).setTertiary(1.9)
        .setDurability(120).setIntegrityCost(2).setIntegrityGain(5)
        .setMagicCapacity(90).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("slashblade_sendims:parry_heal_amount", 2)
        .setTints("1b1b24", "252732").addTexture("vent").addTexture("metal")
        .addItemMaterial('twilightforest:raven_feather')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "zanite_gemstone").setCategory("gem")
        .setPrimary(2.5).setSecondary(2.5).setTertiary(2.0)
        .setDurability(220).setIntegrityCost(2).setIntegrityGain(5)
        .setMagicCapacity(130).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("**forge:entity_gravity", -0.02)
        .setTints("bd94f9", "5b1cb7").addTexture("heavy").addTexture("metal")
        .addItemMaterial('aether:zanite_gemstone')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "arctic_fur").setCategory("fibre")
        .setPrimary(2.8).setSecondary(2.8).setTertiary(2.0)
        .setDurability(140).setIntegrityCost(3).setIntegrityGain(4)
        .setMagicCapacity(90).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("minecraft:generic.armor_toughness", 0.25)
        .setTints("919ca1", "cbcfd2").addTexture("vent").addTexture("metal")
        .addItemMaterial('twilightforest:arctic_fur')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "blightbunny_fang").setCategory("metal")
        .setPrimary(2.8).setSecondary(2.9).setTertiary(2.0)
        .setDurability(220).setIntegrityCost(2).setIntegrityGain(4)
        .setMagicCapacity(50).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("attributeslib:armor_pierce", 1.5)
        .setTints("f7f7f7", "a8a8a8").addTexture("vent").addTexture("metal")
        .addItemMaterial('aether_redux:blightbunny_fang')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "sentry_chip").setCategory("metal")
        .setPrimary(3.0).setSecondary(2.5).setTertiary(2.1)
        .setDurability(290).setIntegrityCost(3).setIntegrityGain(3)
        .setMagicCapacity(50).setToolLevel(4).setToolEfficiency(4)
        .setTints("f7f7f7", "a8a8a8").addTexture("heavy").addTexture("metal")
        .addItemMaterial('aether_redux:sentry_chip')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:sharpness", 1)
        .build();

    tetraMaterialBuilder(event, "lightroot_clump").setCategory("metal")
        .setPrimary(3.0).setSecondary(3.0).setTertiary(2.0)
        .setDurability(220).setIntegrityCost(3).setIntegrityGain(3)
        .setMagicCapacity(100).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("attributeslib:mining_speed", 0.075)
        .setTints("4d4139", "7e8b72").addTexture("heavy").addTexture("metal")
        .addItemMaterial('aether_redux:lightroot_clump')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "refined_sentrite").setCategory("stone")
        .setPrimary(3.2).setSecondary(2.9).setTertiary(2.0)
        .setDurability(200).setIntegrityCost(4).setIntegrityGain(6)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(5)
        .addAttributes("minecraft:generic.max_health", 2)
        .setTints("f9f882", "d9db30").addTexture("heavy").addTexture("metal")
        .addItemMaterial('aether_redux:refined_sentrite')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("apotheosis:life_mending", 1)
        .build();

    tetraMaterialBuilder(event, "naga_scale").setCategory("metal")
        .setPrimary(3.3).setSecondary(3.3).setTertiary(2.2)
        .setDurability(240).setIntegrityCost(3).setIntegrityGain(3)
        .setMagicCapacity(110).setToolLevel(5).setToolEfficiency(5)
        .addAttributes("attributeslib:crit_damage", 0.025)
        .setTints("172b0f", "426737").addTexture("heavy").addTexture("metal")
        .addItemMaterial('twilightforest:naga_scale')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "veridium").setCategory("metal")
        .setPrimary(3.4).setSecondary(3.4).setTertiary(2.2)
        .setDurability(250).setIntegrityCost(4).setIntegrityGain(4)
        .setMagicCapacity(110).setToolLevel(5).setToolEfficiency(5)
        .setTints("49c2f2", "49b4f2").addTexture("heavy").addTexture("metal")
        .addItemMaterial('aether_redux:veridium_ingot')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:silk_touch", 1)
        .build();

    tetraMaterialBuilder(event, "mykapod_shell").setCategory("metal")
        .setPrimary(3.6).setSecondary(3.3).setTertiary(2.2)
        .setDurability(240).setIntegrityCost(4).setIntegrityGain(4)
        .setMagicCapacity(120).setToolLevel(4).setToolEfficiency(5)
        .addAttributes("minecreaft:generic.armor", 0.25)
        .setTints("91582f", "f3d296").addTexture("heavy").addTexture("crude")
        .addItemMaterial('aether_redux:mykapod_shell_chunk')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "desh").setCategory("metal")
        .setPrimary(2).setSecondary(9).setTertiary(2.3)
        .setDurability(260).setIntegrityCost(4).setIntegrityGain(4)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:cold_damage", 0.5)
        .setTints("FA944B", "CE5600").addTexture("heavy").addTexture("metal")
        .setTagMaterial('forge:ingots/desh')
        .setRequiredTool("hammer_dig", 1)
        .addEffects("fot:fe_store", 24000)
        .build();

    tetraMaterialBuilder(event, "metal_mixture").setCategory("metal")
        .setPrimary(3.5).setSecondary(3.5).setTertiary(2.3)
        .setDurability(250).setIntegrityCost(3).setIntegrityGain(3)
        .setMagicCapacity(130).setToolLevel(4).setToolEfficiency(5)
        .addAttributes("attributeslib:experience_gained", 0.1)
        .setTints("e5d944", "bda43b").addTexture("heavy").addTexture("metal")
        .addItemMaterial('deep_aether:metal_mixture')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "skyjade").setCategory("metal")
        .setPrimary(4.0).setSecondary(3.7).setTertiary(2.4)
        .setDurability(240).setIntegrityCost(2).setIntegrityGain(4)
        .setMagicCapacity(160).setToolLevel(5).setToolEfficiency(5)
        .setTints("b0e564", "759a51").addTexture("heavy").addTexture("metal")
        .addItemMaterial('deep_aether:skyjade')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("last_smith:spirit_absorption", 1)
        .build();

    tetraMaterialBuilder(event, "gravitite").setCategory("metal")
        .setPrimary(4.1).setSecondary(4.3).setTertiary(2.5)
        .setDurability(260).setIntegrityCost(4).setIntegrityGain(4)
        .setMagicCapacity(150).setToolLevel(5).setToolEfficiency(6)
        .addAttributes("**forge:entity_gravity", -0.05)
        .addAttributes("**minecraft:generic.movementg_speed", 0.05)
        .setTints("c041b6", "93318b").addTexture("heavy").addTexture("metal")
        .addItemMaterial('aether_redux:gravitite_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "carminite").setCategory("metal")
        .setPrimary(4.2).setSecondary(4.5).setTertiary(2.5)
        .setDurability(250).setIntegrityCost(3).setIntegrityGain(5)
        .setMagicCapacity(155).setToolLevel(5).setToolEfficiency(6)
        .addAttributes("**slashblade_sendims:ap_gain_percentage", 0.1)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 5)
        .setTints("ff0000", "9a0000").addTexture("heavy").addTexture("metal")
        .addItemMaterial('twilightforest:carminite')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "knightmetal").setCategory("metal")
        .setPrimary(4.6).setSecondary(4.5).setTertiary(2.5)
        .setDurability(280).setIntegrityCost(4).setIntegrityGain(4)
        .setMagicCapacity(160).setToolLevel(5).setToolEfficiency(6)
        .addAttributes("minecreaft:generic.armor", 0.5)
        .setTints("7b8771", "7b8677").addTexture("heavy").addTexture("metal")
        .addItemMaterial('twilightforest:knightmetal_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "squall_plate").setCategory("metal")
        .setPrimary(4.6).setSecondary(4.5).setTertiary(2.5)
        .setDurability(280).setIntegrityCost(4).setIntegrityGain(5)
        .setMagicCapacity(170).setToolLevel(5).setToolEfficiency(6)
        .addAttributes("minecreaft:generic.armor_toughness", 0.4)
        .setTints("dbfcfc", "c6d0db").addTexture("heavy").addTexture("metal")
        .addItemMaterial('deep_aether:squall_plate')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 海皇锭材料
    tetraMaterialBuilder(event, "neptune").setCategory("metal")
        .setPrimary(4.2).setSecondary(3.0).setTertiary(2.2)
        .setDurability(500).setIntegrityCost(4).setIntegrityGain(5)
        .setMagicCapacity(150).setToolLevel(5).setToolEfficiency(7)
        .addAttributes("attributeslib:cold_damage", 2.0)
        .setTints("4a8bb3", "5a9bc3")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('aether_treasure_reforging:neptune_mesh')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 武神锭材料
    tetraMaterialBuilder(event, "valkyrie").setCategory("metal")
        .setPrimary(6.0).setSecondary(3.0).setTertiary(2.6)
        .setDurability(600).setIntegrityCost(4).setIntegrityGain(5)
        .setMagicCapacity(140).setToolLevel(5).setToolEfficiency(8)
        .setTints("f0f0f0", "ffffff")
        .addTexture("shiny").addTexture("metal")
        .addItemMaterial('aether_treasure_reforging:valkyrum_ingot')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:fortune", 1.5)
        .build();

    // 凤凰锭材料
    tetraMaterialBuilder(event, "phoenix").setCategory("metal")
        .setPrimary(4.2).setSecondary(3.0).setTertiary(2.2)
        .setDurability(500).setIntegrityCost(4).setIntegrityGain(5)
        .setMagicCapacity(160).setToolLevel(5).setToolEfficiency(7)
        .addAttributes("attributeslib:fire_damage", 2.0)
        .addAttributes("slashblade_sendims:frenzy_damage", 0.05)
        .setTints("d84315", "ff5722")
        .addTexture("shiny").addTexture("metal")
        .addItemMaterial('aether_treasure_reforging:pyral_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 雪怪首领毛皮材料
    tetraMaterialBuilder(event, "alpha_yeti_fur").setCategory("skin")
        .setPrimary(5.4).setSecondary(5.4).setTertiary(2.8)
        .setDurability(350).setIntegrityCost(3).setIntegrityGain(4)
        .setMagicCapacity(120).setToolLevel(5).setToolEfficiency(5)
        .addAttributes("attributeslib:cold_damage", 0.5)
        .setTints("f0f0f0", "e8e8e8")
        .addTexture("crude").addTexture("default")
        .addItemMaterial('twilightforest:alpha_yeti_fur')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 炽铁锭材料
    tetraMaterialBuilder(event, "fiery_ingot").setCategory("metal")
        .setPrimary(5.4).setSecondary(5.5).setTertiary(2.9)
        .setDurability(450).setIntegrityCost(3).setIntegrityGain(4)
        .setMagicCapacity(130).setToolLevel(5).setToolEfficiency(7)
        .addAttributes("attributeslib:fire_damage", 1.0)
        .addAttributes("**slashblade_sendims:frenzy_resistance", 0.05)
        .setTints("ff4500", "ff6347")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('twilightforest:fiery_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 云母钢锭材料
    tetraMaterialBuilder(event, "stratus_ingot").setCategory("metal")
        .setPrimary(6.3).setSecondary(6.0).setTertiary(3.2)
        .setDurability(550).setIntegrityCost(4).setIntegrityGain(6)
        .setMagicCapacity(150).setToolLevel(5).setToolEfficiency(8)
        .addAttributes("**forge:entity_gravity", -0.05)
        .addAttributes("forge:entity_reach", 0.05)
        .setTints("87ceeb", "b0e2ff")
        .addTexture("shiny").addTexture("metal")
        .addItemMaterial('deep_aether:stratus_ingot')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("last_smith:spirit_slash", 1)
        .build();

    // 岩石裂骸材料
    tetraMaterialBuilder(event, "basalz_rod").setCategory("stone")
        .setPrimary(5.5).setSecondary(1.0).setTertiary(2.4)
        .setDurability(300).setIntegrityCost(2).setIntegrityGain(2)
        .setMagicCapacity(100).setToolLevel(4).setToolEfficiency(6)
        .addAttributes("minecraft:generic.armor", 0.5)
        .setTints("7f7f7f", "a0a0a0")
        .addTexture("grainy").addTexture("crude")
        .addItemMaterial('thermal:basalz_rod')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 垂悬耳灯果材料
    tetraMaterialBuilder(event, "hanging_earlight_fruit").setCategory("fibre")
        .setPrimary(3.0).setSecondary(6.0).setTertiary(3.0)
        .setDurability(180).setIntegrityCost(1).setIntegrityGain(1)
        .setMagicCapacity(120).setToolLevel(3).setToolEfficiency(5)
        .addAttributes("minecraft:generic.armor_toughness", 0.25)
        .addAttributes("minecraft:generic.max_health", 3.0)
        .setTints("ffcc99", "ffdbac")
        .addTexture("crude").addTexture("default")
        .addItemMaterial('regions_unexplored:hanging_earlight_fruit')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 下界合金材料
    tetraMaterialBuilder(event, "netherite").setCategory("metal")
        .setPrimary(7.5).setSecondary(5.5).setTertiary(3.3)
        .setDurability(500).setIntegrityCost(2).setIntegrityGain(8)
        .setMagicCapacity(90).setToolLevel(5).setToolEfficiency(9)
        .addAttributes("**minecraft:generic.knockback_resistance", 0.1)
        .setTints("806164", "695e5f")
        .addTexture("heavy").addTexture("metal")
        .setTagMaterial('forge:ingots/netherite')
        .setRequiredTool("hammer_dig", 3)
        .build();

    // 紫金材料
    tetraMaterialBuilder(event, "ostrum").setCategory("metal")
        .setPrimary(7.0).setSecondary(6.0).setTertiary(3.2)
        .setDurability(600).setIntegrityCost(3).setIntegrityGain(3)
        .setMagicCapacity(140).setToolLevel(5).setToolEfficiency(8)
        .addAttributes("attributeslib:cold_damage", 0.5)
        .setTints("9370db", "a987d4")
        .addTexture("shiny").addTexture("metal")
        .setTagMaterial('forge:ingots/ostrum')
        .addEffects("fot:fe_store", 12000)
        .setRequiredTool("hammer_dig", 3)
        .addEnchantment("minecraft:sweeping", 1)
        .build();

    tetraMaterialBuilder(event, "ancient_metal_ingot").setCategory("metal")
        .setPrimary(15).setSecondary(20).setTertiary(9)
        .setDurability(800).setIntegrityCost(6).setIntegrityGain(8)
        .setMagicCapacity(150).setToolLevel(6).setToolEfficiency(10)
        .addAttributes("slashblade_sendims:frenzy_resistance", 0.05)
        .addAttributes("slashblade_sendims:madness_reduce", 5)
        .setTints("d4af37", "c5a017")
        .addTexture("heavy").addTexture("metal")
        .addItemMaterial('cataclysm:ancient_metal_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    tetraMaterialBuilder(event, "ignitium_ingot").setCategory("metal")
        .setPrimary(21).setSecondary(20).setTertiary(10)
        .setDurability(1000).setIntegrityCost(6).setIntegrityGain(8)
        .setMagicCapacity(160).setToolLevel(6).setToolEfficiency(12)
        .addAttributes("slashblade_sendims:magic_penetration", 1.5)
        .addAttributes("attributeslib:fire_damage", 4)
        .setTints("ff4500", "cc3700")
        .addTexture("heavy").addTexture("metal").addTexture("shiny")
        .addItemMaterial('cataclysm:ignitium_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

})