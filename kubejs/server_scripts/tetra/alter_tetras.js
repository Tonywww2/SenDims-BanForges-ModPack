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

    // 3.2.2 世界树铁木：铁木锭 + 泰拉钢（融合）。2026-11-18 由 50/48 下调，压回小行星带的材料区间（最高 164.5）
    tetraMaterialBuilder(event, "alter_ironwood", 4).setCategory("metal")
        .setPrimary(46).setSecondary(44).setTertiary(29)
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

    // 4.1.3 陨星合金：下界合金 + 陨铁锭 + 生物电池（突变）。2026-11-18 由 4.1.1 上调（原与陨铁锭同值，贴着土卫六最低）
    tetraMaterialBuilder(event, "alter_netherite", 5).setCategory("metal")
        .setPrimary(79).setSecondary(59).setTertiary(34)
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

    // ======== 2.x 扩充（设计草案第 8 节）。数值规则同上；韧性、耐久、魔力容量、完整度、工具等级取催化材料 ========

    // 2.2.1 蕴魔钢叶：钢叶 + 门瑞欧结晶 + 神秘碱晶（融合，深境二层）。2026-11-18 由 2.1.0 上调；韧性等取 2.2.1 的霜钢
    tetraMaterialBuilder(event, "alter_steeleaf", 3).setCategory("metal")
        .setPrimary(16).setSecondary(17).setTertiary(9)
        .setDurability(480).setIntegrityCost(7).setIntegrityGain(7)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(7.5)
        .addAttributes("minecraft:generic.max_health", 3)
        .addAttributes("minecraft:generic.armor_toughness", 0.4)
        .addEnchantment("minecraft:looting", 1)
        .setTints("25faf3", "416230").addTexture("heavy").addTexture("metal")
        .addItemMaterial('kubejs:alter_steeleaf')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.2.2 豆腐逻辑电路板：豆腐能电路板 + 门瑞欧结晶 + 神秘碱晶（融合，深境二层）。2026-11-18 去掉逻辑导向零件，由 2.1.2 上调；韧性等取 2.2.2 的遗忆
    tetraMaterialBuilder(event, "alter_tf_circuit", 3).setCategory("metal")
        .setPrimary(20).setSecondary(19).setTertiary(11)
        .setDurability(720).setIntegrityCost(8).setIntegrityGain(8)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("slashblade_sendims:ap_gain_percentage", 0.05)
        .addAttributes("attributeslib:experience_gained", 0.05)
        .setTints("8e44ad", "fffede").addTexture("shiny").addTexture("metal")
        .addItemMaterial('kubejs:alter_tf_circuit')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.1.2 熔核炽铁：炽铁锭 + 耐热金属（突变「熔核」，金星）
    tetraMaterialBuilder(event, "alter_fiery", 3).setCategory("metal")
        .setPrimary(11).setSecondary(10).setTertiary(7.5)
        .setDurability(660).setIntegrityCost(4).setIntegrityGain(5)
        .setMagicCapacity(120).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("attributeslib:fire_damage", 3.2)
        .addAttributes("slashblade_sendims:frenzy_resistance", 0.05)
        .addAttributes("minecraft:generic.max_health", 2)
        .addAttributes("slashblade_sendims:frenzy_damage", 0.03)
        .setTints("e74c3c", "ff4500").addTexture("metal").addTexture("heavy")
        .addItemMaterial('kubejs:alter_fiery')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.2.1 炎狱玄武岩：岩石裂骸 + 炎狱尖塔块 + 骸龙之骨（融合，金星）。2026-11-18 由 2.1.0 上调，元素占比不变
    tetraMaterialBuilder(event, "alter_basalz", 3).setCategory("stone")
        .setPrimary(19).setSecondary(3.6).setTertiary(9)
        .setDurability(300).setIntegrityCost(6).setIntegrityGain(6)
        .setMagicCapacity(120).setToolLevel(5).setToolEfficiency(8)
        .addAttributes("attributeslib:fire_damage", 1.8)
        .addAttributes("minecraft:generic.armor", 1)
        .setTints("b03a2e", "7f7f7f").addTexture("grainy").addTexture("crude")
        .addItemMaterial('kubejs:alter_basalz')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.1.1 汞霜钻石豆腐：钻石豆腐 + 水星石（融合，水星）
    tetraMaterialBuilder(event, "alter_tofu_diamond", 3).setCategory("gem")
        .setPrimary(11).setSecondary(9).setTertiary(6)
        .setDurability(230).setIntegrityCost(4).setIntegrityGain(4)
        .setMagicCapacity(80).setToolLevel(2).setToolEfficiency(5)
        .addAttributes("attributeslib:cold_damage", 1.3)
        .addAttributes("**attributeslib:cold_damage", 0.05)
        .setTints("85929e", "e0ffff").addTexture("shiny").addTexture("heavy")
        .addItemMaterial('kubejs:alter_tofu_diamond')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.2.0 夜冥骑士金属：骑士金属 + 夜冥（融合，深境三层·午夜）
    tetraMaterialBuilder(event, "alter_knightmetal", 3).setCategory("metal")
        .setPrimary(13).setSecondary(13).setTertiary(8)
        .setDurability(360).setIntegrityCost(3).setIntegrityGain(5)
        .setMagicCapacity(100).setToolLevel(3).setToolEfficiency(6)
        .addAttributes("minecraft:generic.armor", 1)
        .addEnchantment("last_smith:spirit_absorption", 0.75)
        .setTints("5b2c6f", "7b8771").addTexture("heavy").addTexture("metal")
        .addItemMaterial('kubejs:alter_knightmetal')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.2.1 幽光紫水晶：紫水晶 + 幽光（融合，深境三层·午夜）
    tetraMaterialBuilder(event, "alter_amethyst", 3).setCategory("gem")
        .setPrimary(15).setSecondary(15).setTertiary(10)
        .setDurability(400).setIntegrityCost(3).setIntegrityGain(6)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(7.5)
        .addAttributes("attributeslib:armor_pierce", 1.5)
        .addAttributes("minecraft:generic.max_health", 3)
        .setTints("d4a5ff", "9966cc").addTexture("shiny").addTexture("crude")
        .addItemMaterial('kubejs:alter_amethyst')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.2.2 铼霜雪鬃：雪怪首领毛皮 + 铼碎片（融合，深境三层·午夜）
    tetraMaterialBuilder(event, "alter_yeti_fur", 3).setCategory("skin")
        .setPrimary(14).setSecondary(13).setTertiary(9)
        .setDurability(340).setIntegrityCost(4).setIntegrityGain(6)
        .setMagicCapacity(130).setToolLevel(3).setToolEfficiency(6)
        .addAttributes("attributeslib:cold_damage", 7.7)
        .addEnchantment("apotheosis:miners_fervor", 1)
        .setTints("5dade2", "f0f0f0").addTexture("crude").addTexture("default")
        .addItemMaterial('kubejs:alter_yeti_fur')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.2.2 王权神能晶：神能晶片 + 贵豪（融合，深园）
    tetraMaterialBuilder(event, "alter_ambrosium", 3).setCategory("gem")
        .setPrimary(19).setSecondary(20).setTertiary(10)
        .setDurability(640).setIntegrityCost(8).setIntegrityGain(8)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(7.5)
        .addAttributes("**attributeslib:armor_shred", 0.02)
        .addAttributes("attributeslib:crit_damage", 0.025)
        .addAttributes("attributeslib:experience_gained", 0.075)
        .setTints("f39c12", "f9f882").addTexture("shiny").addTexture("crude")
        .addItemMaterial('kubejs:alter_ambrosium')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.2.1 霜钢娜迦鳞：娜迦鳞片 + 霜钢（融合，深园）
    tetraMaterialBuilder(event, "alter_naga_scale", 3).setCategory("metal")
        .setPrimary(15).setSecondary(14).setTertiary(9)
        .setDurability(480).setIntegrityCost(7).setIntegrityGain(7)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(7.5)
        .addAttributes("attributeslib:cold_damage", 2)
        .addAttributes("attributeslib:crit_damage", 0.04)
        .setTints("85c1e9", "426737").addTexture("heavy").addTexture("metal")
        .addItemMaterial('kubejs:alter_naga_scale')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.2.2 遗忆骸骨：骨块 + 遗忆锭（突变「守望」，深园）
    tetraMaterialBuilder(event, "alter_bone", 3).setCategory("bone")
        .setPrimary(17).setSecondary(22).setTertiary(11)
        .setDurability(720).setIntegrityCost(8).setIntegrityGain(8)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("minecraft:generic.armor", 0.5)
        .addAttributes("attributeslib:armor_pierce", 0.5)
        .addAttributes("attributeslib:armor_shred", 0.02)
        .setTints("d5dbdb", "e8e4d0").addTexture("bone").addTexture("crude")
        .addItemMaterial('kubejs:alter_bone')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2.3.1 末影紫晶石：紫晶石 + 末地钢（融合，末地）
    tetraMaterialBuilder(event, "alter_zanite", 3).setCategory("gem")
        .setPrimary(23).setSecondary(23).setTertiary(12)
        .setDurability(700).setIntegrityCost(9).setIntegrityGain(10)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("minecraft:generic.attack_damage", 0.5)
        .addAttributes("slashblade_sendims:sprint_cd", 0.025)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 7.5)
        .setTints("1d8348", "bd94f9").addTexture("heavy").addTexture("metal")
        .addItemMaterial('kubejs:alter_zanite')
        .setRequiredTool("hammer_dig", 1)
        .build();

});
