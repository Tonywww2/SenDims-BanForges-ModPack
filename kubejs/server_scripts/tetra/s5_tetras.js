// 4.x 材料归入整合包阶段 5；属性数值为单件材料加成。
// 辅助参数按材料定位与阶段独立配置；颜色对应原物品的主色。
// ap_reduce_amount 为负表示增加消耗；sprint_cd 为负表示延长冷却。
// 单个 * 使用 MULTIPLY_BASE，使最大生命百分比按基础倍率加算。
ServerEvents.highPriorityData(event => withTetraMaterialStage(5, () => {

    // 4.1.1 托林纤维
    tetraMaterialBuilder(event, "tholin_fibre").setCategory("fibre")
        .setPrimary(65).setSecondary(70).setTertiary(32)
        .setDurability(300).setIntegrityCost(5).setIntegrityGain(15)
        .setMagicCapacity(115).setToolLevel(4).setToolEfficiency(4.5)
        .addAttributes("attributeslib:dodge_chance", 0.015)
        .addAttributes("attributeslib:healing_received", 0.03)
        .addAttributes("*minecraft:generic.max_health", 0.005)
        .setTints("b88673", "ca9789")
        .addTexture("crude").addTexture("default")
        .addItemMaterial('titan_moon:tholin_fibre')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.1 强韧神经腺
    tetraMaterialBuilder(event, "tough_neural_gland").setCategory("skin")
        .setPrimary(67).setSecondary(65).setTertiary(32)
        .setDurability(260).setIntegrityCost(7).setIntegrityGain(11)
        .setMagicCapacity(180).setToolLevel(4).setToolEfficiency(5.5)
        .addAttributes("slashblade_sendims:sprint_cd", 0.02)
        .addAttributes("slashblade_sendims:ap_gain_percentage", 0.04)
        .addAttributes("slashblade_sendims:parry_heal_amount", 40)
        .setTints("804770", "b177c1")
        .addTexture("crude").addTexture("default")
        .addItemMaterial('titan_moon:tough_neural_gland')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.1 陨铁锭
    tetraMaterialBuilder(event, "meteoric_iron_ingot").setCategory("metal")
        .setPrimary(70).setSecondary(58).setTertiary(32)
        .setDurability(460).setIntegrityCost(9).setIntegrityGain(17)
        .setMagicCapacity(100).setToolLevel(4).setToolEfficiency(8.5)
        .addAttributes("attributeslib:armor_pierce", 2)
        .addAttributes("minecraft:generic.armor", 1)
        .addAttributes("minecraft:generic.knockback_resistance", 0.025)
        .setTints("8c8170", "c8c8c8")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('titan_moon:meteoric_iron_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.2 氮质体膜片
    tetraMaterialBuilder(event, "azotosome_sheet").setCategory("fabric")
        .setPrimary(69).setSecondary(65).setTertiary(33.5)
        .setDurability(280).setIntegrityCost(6).setIntegrityGain(14)
        .setMagicCapacity(190).setToolLevel(4).setToolEfficiency(4.5)
        .addAttributes("slashblade_sendims:magic_resistance", 2)
        .addAttributes("slashblade_sendims:frenzy_resistance", 0.02)
        .addAttributes("attributeslib:healing_received", 0.04)
        .setTints("3f8f7d", "76b9a9")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('titan_moon:azotosome_sheet')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.2 星浆晶体
    tetraMaterialBuilder(event, "star_slurry_crystal").setCategory("gem")
        .setPrimary(69).setSecondary(65).setTertiary(33.5)
        .setDurability(280).setIntegrityCost(9).setIntegrityGain(12)
        .setMagicCapacity(215).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:cold_damage", 18)
        .addAttributes("slashblade_sendims:magic_penetration", 2)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 4)
        .setTints("895cc3", "b282d9")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('deeprealm_4th:star_slurry_crystal')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.3 冰晶合金锭
    tetraMaterialBuilder(event, "cryo_alloy_ingot").setCategory("metal")
        .setPrimary(68).setSecondary(70).setTertiary(33)
        .setDurability(420).setIntegrityCost(8).setIntegrityGain(16)
        .setMagicCapacity(170).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:cold_damage", 18)
        .addAttributes("minecraft:generic.armor_toughness", 1)
        .addAttributes("slashblade_sendims:parry_heal_amount", 70)
        .setTints("8bacac", "acf3f3")
        .addTexture("metal").addTexture("shiny")
        .addItemMaterial('titan_moon:cryo_alloy_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.3 泰坦二型复合锭
    tetraMaterialBuilder(event, "titan-ii_composite_ingot").setCategory("metal")
        .setPrimary(82).setSecondary(40).setTertiary(34)
        .setDurability(560).setIntegrityCost(11).setIntegrityGain(20)
        .setMagicCapacity(125).setToolLevel(4).setToolEfficiency(9)
        .addAttributes("minecraft:generic.armor", 2)
        .addAttributes("minecraft:generic.armor_toughness", 2)
        .addAttributes("slashblade_sendims:ap_reduce_amount", -20)
        .setTints("c46ca9", "ffa6dc")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('kubejs:titan-ii_composite_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.3 ε尘
    tetraMaterialBuilder(event, "epsilon_dust").setCategory("scale")
        .setPrimary(77).setSecondary(53).setTertiary(34.5)
        .setDurability(240).setIntegrityCost(8).setIntegrityGain(10)
        .setMagicCapacity(225).setToolLevel(4).setToolEfficiency(9)
        .addAttributes("attributeslib:crit_chance", 0.01)
        .addAttributes("attributeslib:crit_damage", 0.05)
        .addAttributes("attributeslib:prot_pierce", 0.5)
        .setTints("ab9bf9", "e0c9f4")
        .addTexture("shiny").addTexture("crude")
        .addItemMaterial('kubejs:epsilon_dust')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.3 虹移之熵
    tetraMaterialBuilder(event, "rainbowshift_entropy").setCategory("fabric")
        .setPrimary(75).setSecondary(58).setTertiary(34.5)
        .setDurability(240).setIntegrityCost(10).setIntegrityGain(12)
        .setMagicCapacity(240).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("attributeslib:fire_damage", 12)
        .addAttributes("attributeslib:cold_damage", 12)
        .addAttributes("slashblade_sendims:magic_penetration", 2)
        .setTints("3cbc8a", "9dddc1")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('kubejs:rainbowshift_entropy')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.4 不融冰
    tetraMaterialBuilder(event, "unmelting_ice").setCategory("gem")
        .setPrimary(62).setSecondary(100).setTertiary(36)
        .setDurability(480).setIntegrityCost(10).setIntegrityGain(18)
        .setMagicCapacity(185).setToolLevel(4).setToolEfficiency(7.5)
        .addAttributes("attributeslib:cold_damage", 30)
        .addAttributes("minecraft:generic.knockback_resistance", 0.025)
        .addAttributes("slashblade_sendims:sprint_cd", -0.015)
        .setTints("85cdda", "b6e6e9")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('kubejs:unmelting_ice')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.4 风暴氢晶
    tetraMaterialBuilder(event, "storm_hydrogen_crystal").setCategory("gem")
        .setPrimary(77).setSecondary(62).setTertiary(36)
        .setDurability(300).setIntegrityCost(9).setIntegrityGain(13)
        .setMagicCapacity(220).setToolLevel(4).setToolEfficiency(9.5)
        .addAttributes("slashblade_sendims:sprint_cd", 0.015)
        .addAttributes("attributeslib:crit_damage", 0.06)
        .addAttributes("slashblade_sendims:magic_penetration", 2)
        .setTints("4b96c7", "b9c4f2")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('kubejs:storm_hydrogen_crystal')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.4 神门残片
    tetraMaterialBuilder(event, "gate_fragment").setCategory("gem")
        .setPrimary(95).setSecondary(18).setTertiary(36)
        .setDurability(520).setIntegrityCost(12).setIntegrityGain(16)
        .setMagicCapacity(230).setToolLevel(4).setToolEfficiency(10)
        .addAttributes("slashblade_sendims:frenzy_resistance", 0.03)
        .addAttributes("minecraft:generic.attack_damage", 2)
        .addAttributes("forge:entity_reach", 0.02)
        .setTints("c89e50", "dfd9bf")
        .addTexture("shiny").addTexture("crude")
        .addItemMaterial('elder_bosses:gate_fragment')
        .setRequiredTool("hammer_dig", 1)
        .build();

}));

