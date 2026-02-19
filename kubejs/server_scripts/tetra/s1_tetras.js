// priority: 100
ServerEvents.highPriorityData(event => {
    // 石豆腐
    tetraMaterialBuilder(event, "tofuishi").setCategory("stone")
        .setPrimary(1.3).setSecondary(1.3).setTertiary(0.8)
        .setDurability(120).setIntegrityCost(1).setIntegrityGain(1)
        .setMagicCapacity(60).setToolLevel(3).setToolEfficiency(4)
        .addAttributes("minecraft:generic.attack_damage", 0.15)
        .setTints("f5f5dc", "fff8dc")  // 豆腐白色调
        .addTexture("crude").addTexture("grainy")
        .addItemMaterial('tofucraft:tofuishi')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 深层豆腐岩
    tetraMaterialBuilder(event, "tofuslate").setCategory("stone")
        .setPrimary(1.4).setSecondary(1.3).setTertiary(0.9)
        .setDurability(180).setIntegrityCost(1).setIntegrityGain(3)
        .setMagicCapacity(70).setToolLevel(5).setToolEfficiency(5)
        .setTints("2f4f4f", "708090")  // 深灰色
        .addTexture("grainy").addTexture("crude")
        .addItemMaterial('tofucraft:tofuslate')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 钢豆腐
    tetraMaterialBuilder(event, "tofumetal").setCategory("metal")
        .setPrimary(1.4).setSecondary(1.4).setTertiary(1.1)
        .setDurability(200).setIntegrityCost(1).setIntegrityGain(2)
        .setMagicCapacity(65).setToolLevel(5).setToolEfficiency(5)
        .setTints("c0c0c0", "d3d3d3")  // 银白金属色
        .addTexture("metal").addTexture("default")
        .addItemMaterial('tofucraft:tofumetal')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 毛豆豆腐
    tetraMaterialBuilder(event, "tofuzunda").setCategory("skin")
        .setPrimary(1.4).setSecondary(1.5).setTertiary(1.2)
        .setDurability(220).setIntegrityCost(1).setIntegrityGain(2)
        .setMagicCapacity(75).setToolLevel(5).setToolEfficiency(6)
        .setTints("9acd32", "adff2f")  // 淡绿色
        .addTexture("metal").addTexture("default")
        .addItemMaterial('tofucraft:tofuzunda')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 豆腐宝石
    tetraMaterialBuilder(event, "tofugem").setCategory("gem")
        .setPrimary(1.8).setSecondary(1.5).setTertiary(1.2)
        .setDurability(250).setIntegrityCost(1).setIntegrityGain(2)
        .setMagicCapacity(90).setToolLevel(3).setToolEfficiency(5)
        .addAttributes("minecraft:generic.max_health", 1.0)
        .setTints("87ceeb", "b0e0e6")  // 天蓝色宝石
        .addTexture("shiny").addTexture("crude")
        .addItemMaterial('tofucraft:tofugem')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 钻石豆腐
    tetraMaterialBuilder(event, "tofudiamond").setCategory("gem")
        .setPrimary(2.6).setSecondary(2.2).setTertiary(1.5)
        .setDurability(300).setIntegrityCost(1).setIntegrityGain(3)
        .setMagicCapacity(100).setToolLevel(5).setToolEfficiency(6)
        .addAttributes("attributeslib:cold_damage", 0.15)
        .setTints("e0ffff", "f0ffff")  // 钻石豆腐的冰蓝色
        .addTexture("shiny").addTexture("heavy")
        .addItemMaterial('tofucraft:tofudiamond')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 豆腐电路板
    tetraMaterialBuilder(event, "tf_circuit").setCategory("metal")
        .setPrimary(2.3).setSecondary(2.2).setTertiary(1.4)
        .setDurability(350).setIntegrityCost(1).setIntegrityGain(3)
        .setMagicCapacity(110).setToolLevel(4).setToolEfficiency(7)
        .setTints("32cd32", "90ee90")  // 电路绿色
        .addTexture("shiny").addTexture("metal")
        .addItemMaterial('tofucraft:tf_circuit')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 豆腐核心
    tetraMaterialBuilder(event, "tofu_core").setCategory("gem")
        .setPrimary(2.6).setSecondary(2.5).setTertiary(1.6)
        .setDurability(400).setIntegrityCost(1).setIntegrityGain(3)
        .setMagicCapacity(130).setToolLevel(5).setToolEfficiency(8)
        .addAttributes("attributeslib:cold_damage", 0.25)
        .setTints("8a2be2", "9370db")  // 紫色核心
        .addTexture("shiny").addTexture("heavy")
        .addItemMaterial('tofucraft:tofu_core')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 铜材料
    tetraMaterialBuilder(event, "copper").setCategory("metal")
        .setPrimary(0.8).setSecondary(0.9).setTertiary(0.8)
        .setDurability(200).setIntegrityCost(1).setIntegrityGain(3)
        .setMagicCapacity(60).setToolLevel(3).setToolEfficiency(4)
        .addAttributes("minecraft:generic.armor", 0.25)
        .setTints("b4684d", "d0805a")
        .addTexture("metal").addTexture("default")
        .addItemMaterial('minecraft:copper_ingot')
        .setTagMaterial('forge:ingots/copper')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // bone
    tetraMaterialBuilder(event, "bone").setCategory("bone")
        .setPrimary(0.8).setSecondary(1.1).setTertiary(0.85)
        .setDurability(140).setIntegrityCost(1).setIntegrityGain(5)
        .setMagicCapacity(108).setToolLevel(2).setToolEfficiency(5)
        .setTints("bone_glyph", "bone")
        .addTexture("bone").addTexture("crude")
        .addItemMaterial('minecraft:bone')
        .setRequiredTool("hammer_dig", 1)
        .build();
    // obsidian
    tetraMaterialBuilder(event, "obsidian").setCategory("stone")
        .setPrimary(1.7).setSecondary(0.5).setTertiary(0.95)
        .setDurability(350).setIntegrityCost(3).setIntegrityGain(1)
        .setMagicCapacity(90).setToolLevel(4).setToolEfficiency(9)
        .setTints("obsidian_glyph", "obsidian")
        .addTexture("obsidian").addTexture("grainy").addTexture("crude").addTexture("default")
        .setTagMaterial('forge:obsidian')
        .setRequiredTool("hammer_dig", 3)
        .addImprovements("arrested", 0)
        .setFeatures(["crying"])
        .build();

    // 锡材料
    tetraMaterialBuilder(event, "tin").setCategory("metal")
        .setPrimary(1.1).setSecondary(1.1).setTertiary(0.9)
        .setDurability(180).setIntegrityCost(1).setIntegrityGain(3)
        .setMagicCapacity(55).setToolLevel(3).setToolEfficiency(4)
        .addAttributes("minecraft:generic.armor_toughness", 0.25)
        .setTints("c0c0c0", "d8d8d8")
        .addTexture("metal").addTexture("default")
        .setTagMaterial('forge:ingots/tin')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 铁材料
    tetraMaterialBuilder(event, "iron").setCategory("metal")
        .setPrimary(1.6).setSecondary(1.4).setTertiary(1.2)
        .setDurability(250).setIntegrityCost(1).setIntegrityGain(2)
        .setMagicCapacity(70).setToolLevel(4).setToolEfficiency(6)
        .setTints("a8a8a8", "c8c8c8")
        .addTexture("metal").addTexture("default")
        .setTagMaterial('forge:ingots/iron')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 银材料
    tetraMaterialBuilder(event, "silver").setCategory("metal")
        .setPrimary(1.3).setSecondary(1.2).setTertiary(0.9)
        .setDurability(220).setIntegrityCost(1).setIntegrityGain(2)
        .setMagicCapacity(90).setToolLevel(4).setToolEfficiency(5)
        .addAttributes("attributeslib:crit_chance", 0.025)
        .setTints("d8d8d8", "f0f0f0")
        .addTexture("shiny").addTexture("metal")
        .setTagMaterial('forge:ingots/silver')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 金材料
    tetraMaterialBuilder(event, "gold").setCategory("metal")
        .setPrimary(1.2).setSecondary(1.3).setTertiary(0.8)
        .setDurability(100).setIntegrityCost(1).setIntegrityGain(2)
        .setMagicCapacity(120).setToolLevel(3).setToolEfficiency(8)
        .addAttributes("attributeslib:crit_damage", 0.025)
        .setTints("ffd700", "fff8dc")
        .addTexture("shiny").addTexture("metal")
        .setTagMaterial('forge:ingots/gold')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 铅材料
    tetraMaterialBuilder(event, "lead").setCategory("metal")
        .setPrimary(1.5).setSecondary(1.5).setTertiary(1.0)
        .setDurability(280).setIntegrityCost(0).setIntegrityGain(2)
        .setMagicCapacity(50).setToolLevel(3).setToolEfficiency(3)
        .addAttributes("minecraft:generic.attack_damage", 0.25)
        .addAttributes("**minecraft:generic.movement_speed", -0.1)
        .setTints("404040", "606060")
        .addTexture("heavy").addTexture("metal")
        .setTagMaterial('forge:ingots/lead')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 镍材料
    tetraMaterialBuilder(event, "nickel").setCategory("metal")
        .setPrimary(1.6).setSecondary(1.6).setTertiary(1.1)
        .setDurability(240).setIntegrityCost(1).setIntegrityGain(2)
        .setMagicCapacity(75).setToolLevel(3).setToolEfficiency(6)
        .addAttributes("attributeslib:mining_speed", 0.05)
        .setTints("c8b4a0", "e0ccb8")
        .addTexture("metal").addTexture("default")
        .setTagMaterial('forge:ingots/nickel')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 赛特斯石英材料
    tetraMaterialBuilder(event, "certus_quartz").setCategory("gem")
        .setPrimary(1.8).setSecondary(1.5).setTertiary(1.2)
        .setDurability(350).setIntegrityCost(1).setIntegrityGain(3)
        .setMagicCapacity(140).setToolLevel(3).setToolEfficiency(5)
        .addAttributes("minecraft:generic.max_health", 1.5)
        .setTints("e0e0e0", "f8f8f8")
        .addTexture("shiny").addTexture("crude")
        .setTagMaterial('forge:gems/certus_quartz')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 紫水晶材料
    tetraMaterialBuilder(event, "amethyst").setCategory("gem")
        .setPrimary(2.0).setSecondary(2.0).setTertiary(1.2)
        .setDurability(400).setIntegrityCost(1).setIntegrityGain(3)
        .setMagicCapacity(160).setToolLevel(3).setToolEfficiency(5)
        .addAttributes("minecraft:generic.max_health", 1.5)
        .setTints("9966cc", "c8a2c8")
        .addTexture("shiny").addTexture("crude")
        .setTagMaterial('forge:gems/amethyst')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 青铜材料
    tetraMaterialBuilder(event, "bronze").setCategory("metal")
        .setPrimary(2.1).setSecondary(2.1).setTertiary(1.3)
        .setDurability(300).setIntegrityCost(1).setIntegrityGain(4)
        .setMagicCapacity(80).setToolLevel(3).setToolEfficiency(7)
        .addAttributes("attributeslib:mining_speed", 0.05)
        .setTints("cd7f32", "b08d57")
        .addTexture("metal").addTexture("heavy")
        .setTagMaterial('forge:ingots/bronze')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 钢材料
    tetraMaterialBuilder(event, "steel").setCategory("metal")
        .setPrimary(2.3).setSecondary(2.2).setTertiary(1.4)
        .setDurability(450).setIntegrityCost(2).setIntegrityGain(4)
        .setMagicCapacity(70).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("minecraft:generic.armor", 0.3)
        .setTints("808080", "a0a0a0")
        .addTexture("heavy").addTexture("metal")
        .setTagMaterial('forge:ingots/steel')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 钻石材料
    tetraMaterialBuilder(event, "diamond").setCategory("gem")
        .setPrimary(2.5).setSecondary(2.5).setTertiary(1.5)
        .setDurability(500).setIntegrityCost(2).setIntegrityGain(4)
        .setMagicCapacity(100).setToolLevel(5).setToolEfficiency(8)
        .addAttributes("slashblade:slashblade_damage", 0.015)
        .setTints("4af2ff", "a6faff")
        .addTexture("shiny").addTexture("crude")
        .setTagMaterial('forge:gems/diamond')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 绿宝石材料
    tetraMaterialBuilder(event, "emerald").setCategory("gem")
        .setPrimary(2.6).setSecondary(2.4).setTertiary(1.6)
        .setDurability(500).setIntegrityCost(2).setIntegrityGain(4)
        .setMagicCapacity(130).setToolLevel(5).setToolEfficiency(7)
        .addAttributes("minecraft:generic.attack_damage", 0.25)
        .setTints("50c878", "90ee90")
        .addTexture("shiny").addTexture("crude")
        .setTagMaterial('forge:gems/emerald')
        .setRequiredTool("hammer_dig", 1)
        .build();

})
