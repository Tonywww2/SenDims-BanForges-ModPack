// 异格材料的 Tetra 定义。数值规则见 docs/development/异格材料设计草案-2026-11-17.md：
// 实得攻击 + 元素设计价值 + 攻击类特效等效 = 目标子档攻击参考 × 1.05；元素伤害已乘目标阶段的元素放大系数。
ServerEvents.highPriorityData(event => {

    // 2.3.0 幻金：金 + 幻境石水晶（融合）
    tetraMaterialBuilder(event, "alter_gold", 3).setCategory("metal")
        .setPrimary(18).setSecondary(19).setTertiary(10)
        .setDurability(360).setIntegrityCost(9).setIntegrityGain(9)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("attributeslib:crit_damage", 0.05)
        .addEnchantment("last_smith:spirit_slash", 0.5)
        .addEnchantment("last_smith:spirit_absorption", 0.5)
        .setTints("b98cff", "e0b040").addTexture("shiny").addTexture("metal")
        .addItemMaterial('kubejs:alter_gold')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.1.3 怒涛海皇锭：海皇锭 + 风暴精华（融合）
    tetraMaterialBuilder(event, "alter_neptune", 4).setCategory("metal")
        .setPrimary(27).setSecondary(20).setTertiary(22)
        .setDurability(500).setIntegrityCost(6).setIntegrityGain(10)
        .setMagicCapacity(150).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("attributeslib:cold_damage", 22)
        .addAttributes("slashblade_sendims:frenzy_damage", 0.03)
        .setTints("4fe0ff", "1f8fd0").addTexture("metal").addTexture("heavy")
        .addItemMaterial('kubejs:alter_neptune')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.2.2 世界树铁木：铁木锭 + 泰拉钢（融合）
    tetraMaterialBuilder(event, "alter_ironwood", 4).setCategory("metal")
        .setPrimary(50).setSecondary(48).setTertiary(29)
        .setDurability(760).setIntegrityCost(7).setIntegrityGain(13)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:armor_pierce", 3)
        .addAttributes("slashblade_sendims:magic_penetration", 1)
        .addEffects("mana_resonance", [1, 0])
        .addImprovements("mana_repair", 1)
        .setTints("6bfa8f", "5a8f3c").addTexture("heavy").addTexture("metal")
        .addItemMaterial('kubejs:alter_ironwood')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.2 涅槃凤凰锭：凤凰锭 + 龙锭（融合）
    tetraMaterialBuilder(event, "alter_phoenix", 4).setCategory("metal")
        .setPrimary(53).setSecondary(39).setTertiary(33)
        .setDurability(580).setIntegrityCost(9).setIntegrityGain(12)
        .setMagicCapacity(170).setToolLevel(4).setToolEfficiency(8.5)
        .addAttributes("attributeslib:fire_damage", 36)
        .addAttributes("slashblade_sendims:frenzy_damage", 0.07)
        .addAttributes("attributeslib:armor_pierce", 1)
        .addAttributes("minecraft:generic.attack_damage", 0.25)
        .setTints("b07cff", "c8462a").addTexture("shiny").addTexture("metal")
        .addItemMaterial('kubejs:alter_phoenix')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.4 辐变萎天獠牙：萎天兔獠牙 + 辐射零件组（突变）
    tetraMaterialBuilder(event, "alter_blightbunny_fang", 4).setCategory("metal")
        .setPrimary(71).setSecondary(73).setTertiary(35)
        .setDurability(460).setIntegrityCost(8).setIntegrityGain(16)
        .setMagicCapacity(90).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:armor_pierce", 3)
        .addAttributes("attributeslib:crit_chance", 0.01)
        .addAttributes("minecraft:generic.attack_damage", -0.75)
        .addEffects("bleeding", 3)
        .setTints("b6ff2e", "8fae3a").addTexture("vent").addTexture("metal")
        .addItemMaterial('kubejs:alter_blightbunny_fang')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.8 觉醒钻石：钻石 + 神龙核心（融合）
    tetraMaterialBuilder(event, "alter_diamond", 4).setCategory("gem")
        .setPrimary(68).setSecondary(68).setTertiary(34.5)
        .setDurability(800).setIntegrityCost(10).setIntegrityGain(14)
        .setMagicCapacity(205).setToolLevel(4).setToolEfficiency(9)
        .addAttributes("slashblade:slashblade_damage", 0.02)
        .addAttributes("attributeslib:crit_damage", 0.05)
        .addAttributes("attributeslib:armor_pierce", 1.5)
        .setTints("ffb833", "3fd0c8").addTexture("shiny").addTexture("crude")
        .addItemMaterial('kubejs:alter_diamond')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.9 混沌紫颂：爆裂紫颂果 + 混沌核心（突变）
    tetraMaterialBuilder(event, "alter_chorus", 4).setCategory("misc")
        .setPrimary(71).setSecondary(93).setTertiary(36)
        .setDurability(880).setIntegrityCost(12).setIntegrityGain(11)
        .setMagicCapacity(235).setToolLevel(4).setToolEfficiency(10)
        .addAttributes("attributeslib:armor_pierce", 4)
        .addAttributes("slashblade_sendims:frenzy_damage", 0.04)
        .addAttributes("forge:entity_reach", 0.1)
        .addAttributes("*minecraft:generic.max_health", -0.01)
        .setTints("ff2a4a", "8a3a6e").addTexture("crude").addTexture("default")
        .addItemMaterial('kubejs:alter_chorus')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.1 陨星合金：下界合金 + 陨铁锭（突变）
    tetraMaterialBuilder(event, "alter_netherite", 5).setCategory("metal")
        .setPrimary(74).setSecondary(55).setTertiary(32)
        .setDurability(740).setIntegrityCost(9).setIntegrityGain(17)
        .setMagicCapacity(100).setToolLevel(4).setToolEfficiency(9)
        .addAttributes("attributeslib:armor_shred", 0.03)
        .addAttributes("attributeslib:armor_pierce", 1)
        .addAttributes("**minecraft:generic.knockback_resistance", 0.1)
        .setTints("ff7a2e", "4d4f5c").addTexture("heavy").addTexture("metal")
        .addItemMaterial('kubejs:alter_netherite')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.1 夜鸦神经羽：渡鸦羽毛 + 强韧神经腺（突变）
    tetraMaterialBuilder(event, "alter_raven_feather", 5).setCategory("fibre")
        .setPrimary(71).setSecondary(71).setTertiary(32)
        .setDurability(480).setIntegrityCost(7).setIntegrityGain(11)
        .setMagicCapacity(180).setToolLevel(4).setToolEfficiency(5.5)
        .addAttributes("slashblade_sendims:parry_heal_amount", 40)
        .addAttributes("attributeslib:dodge_chance", 0.015)
        .addAttributes("slashblade_sendims:sprint_cd", 0.01)
        .addAttributes("slashblade_sendims:ap_gain_percentage", 0.02)
        .setTints("ff6fa3", "5b3550").addTexture("vent").addTexture("metal")
        .addItemMaterial('kubejs:alter_raven_feather')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.2 深渊铼骨：铼碎片 + 星浆晶体（融合）
    tetraMaterialBuilder(event, "alter_rendium", 5).setCategory("bone")
        .setPrimary(61).setSecondary(6.1).setTertiary(33.5)
        .setDurability(560).setIntegrityCost(9).setIntegrityGain(12)
        .setMagicCapacity(215).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:cold_damage", 75)
        .addAttributes("slashblade_sendims:magic_penetration", 1)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 2)
        .setTints("d0ecff", "3a5be0").addTexture("metal").addTexture("crude")
        .addItemMaterial('kubejs:alter_rendium')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.3 双星岩：金星石、水星石 + 虹移之熵（融合）
    tetraMaterialBuilder(event, "alter_twin_star_stone", 5).setCategory("stone")
        .setPrimary(69).setSecondary(42).setTertiary(34.5)
        .setDurability(520).setIntegrityCost(10).setIntegrityGain(12)
        .setMagicCapacity(240).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("attributeslib:fire_damage", 18)
        .addAttributes("attributeslib:cold_damage", 18)
        .addAttributes("**attributeslib:fire_damage", 0.1)
        .addAttributes("**attributeslib:cold_damage", 0.1)
        .addAttributes("slashblade_sendims:magic_penetration", 1)
        .setTints("ffb347", "85929e").addTexture("grainy").addTexture("crude")
        .addItemMaterial('kubejs:alter_twin_star_stone')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.1.4 千冻豆腐核心：豆腐能剑核心 + 不融冰（突变）
    tetraMaterialBuilder(event, "alter_tofu_core", 5).setCategory("gem")
        .setPrimary(52).setSecondary(50).setTertiary(36)
        .setDurability(720).setIntegrityCost(10).setIntegrityGain(18)
        .setMagicCapacity(185).setToolLevel(4).setToolEfficiency(7.5)
        .addAttributes("attributeslib:cold_damage", 73)
        .addAttributes("slashblade_sendims:parry_heal_amount", 50)
        .setTints("d6f8ff", "a8e6ff").addTexture("shiny").addTexture("heavy")
        .addItemMaterial('kubejs:alter_tofu_core')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4.2 百炼钢：钢 + 泰坦二型复合锭（终式）
    tetraMaterialBuilder(event, "alter_steel", 5).setCategory("metal")
        .setPrimary(75).setSecondary(72).setTertiary(36)
        .setDurability(1200).setIntegrityCost(12).setIntegrityGain(20)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(9)
        .addAttributes("minecraft:generic.armor", 1)
        .addAttributes("minecraft:generic.armor_toughness", 1)
        .addAttributes("slashblade_sendims:ap_reduce_amount", -10)
        .addEffects("RefineStrengthening", 4)
        .setTints("ffcf6b", "6f84b8").addTexture("heavy").addTexture("metal")
        .addItemMaterial('kubejs:alter_steel')
        .setRequiredTool("hammer_dig", 1)
        .build();

});
