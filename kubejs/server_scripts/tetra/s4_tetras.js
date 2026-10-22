ServerEvents.highPriorityData(event => withTetraMaterialStage(4, () => {

    // 1. 硅小行星岩 / Silica-rich Asteroid Rock
    tetraMaterialBuilder(event, "silica_rich_asteroid_rock").setCategory("stone")
        .setPrimary(28).setSecondary(12).setTertiary(15)
        .setDurability(130).setIntegrityCost(6).setIntegrityGain(6)
        .setMagicCapacity(50).setToolLevel(2).setToolEfficiency(4)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 20).addAttributes("slashblade_sendims:ap_gain_percentage", 0.1)
        .setTints("a0a0a0", "8080c0")
        .addTexture("stone").addTexture("crude")
        .addItemMaterial('kubejs:silica_rich_asteroid_rock')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:fortune", 1)
        .setCountFactor(4)
        .build();

    // 2. 奇异尘 / Bizarre Matter Dust
    tetraMaterialBuilder(event, "bizarre_matter_dust").setCategory("scale")
        .setPrimary(32).setSecondary(25).setTertiary(20)
        .setDurability(180).setIntegrityCost(6).setIntegrityGain(8)
        .setMagicCapacity(120).setToolLevel(3).setToolEfficiency(5)
        .addAttributes("**minecraft:generic.attack_damage", 0.02).addAttributes("slashblade_sendims:frenzy_damage", 0.07)
        .setTints("4b0082", "00ff00")
        .addTexture("shiny").addTexture("crude")
        .addItemMaterial('kubejs:bizarre_matter_dust')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:sharpness", 1)
        .build();

    // 3. 泪石 / Lacrima
    tetraMaterialBuilder(event, "lacrima").setCategory("gem")
        .setPrimary(30).setSecondary(30).setTertiary(20)
        .setDurability(240).setIntegrityCost(7).setIntegrityGain(9)
        .setMagicCapacity(90).setToolLevel(3).setToolEfficiency(6)
        .addAttributes("attributeslib:armor_pierce", 2).addAttributes("minecraft:generic.armor_toughness", 1)
        .setTints("00ffff", "4682b4")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('cataclysm:lacrima')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:unbreaking", 1)
        .build();

    // 4. 闪耀蜜蜂结晶 / Glistering Honey Crystal
    tetraMaterialBuilder(event, "glistering_honey_crystal").setCategory("gem")
        .setPrimary(30).setSecondary(32).setTertiary(19)
        .setDurability(200).setIntegrityCost(4).setIntegrityGain(7)
        .setMagicCapacity(110).setToolLevel(2).setToolEfficiency(5)
        .addAttributes("attributeslib:armor_shred", 0.02)
        .setTints("ffb700", "ffcc00")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('the_bumblezone:glistering_honey_crystal')
        .setRequiredTool("hammer_dig", 1)
        .addEffects("mana_resonance", [1, 0])
        .setCountFactor(4)
        .build();

    // 5. 红石蜜蜂网 / Redstone Honey Web
    tetraMaterialBuilder(event, "redstone_honey_web").setCategory("fibre")
        .setPrimary(26).setSecondary(35).setTertiary(20)
        .setDurability(90).setIntegrityCost(4).setIntegrityGain(7)
        .setMagicCapacity(80).setToolLevel(1).setToolEfficiency(4)
        .addAttributes("slashblade_sendims:magic_penetration", 2).addAttributes("minecraft:generic.knockback_resistance", 0.05).addAttributes("slashblade_sendims:madness_reduce", 10)
        .setTints("ff4500", "ff0000")
        .addTexture("crude").addTexture("default")
        .addItemMaterial('the_bumblezone:redstone_honey_web')
        .setRequiredTool("hammer_dig", 1)
        .setCountFactor(4)
        .build();

    // 6. delta尘 / Delta Dust
    tetraMaterialBuilder(event, "delta_dust").setCategory("scale")
        .setPrimary(36).setSecondary(30).setTertiary(22.5)
        .setDurability(210).setIntegrityCost(6).setIntegrityGain(9)
        .setMagicCapacity(130).setToolLevel(3).setToolEfficiency(6)
        .addAttributes("attributeslib:crit_chance", 0.02).addAttributes("attributeslib:crit_damage", 0.05)
        .setTints("708090", "4682b4")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('kubejs:delta_dust')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:power", 1)
        .setCountFactor(0.7)
        .build();

    // 7. 风暴精华 / Essence of the Storm
    tetraMaterialBuilder(event, "essence_of_the_storm").setCategory("fibre")
        .setPrimary(35).setSecondary(26).setTertiary(22)
        .setDurability(250).setIntegrityCost(6).setIntegrityGain(10)
        .setMagicCapacity(150).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("attributeslib:cold_damage", 18).addAttributes("slashblade_sendims:frenzy_damage", 0.06).addAttributes("minecraft:generic.max_health", -0.02)
        .setTints("40e0d0", "000080")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('cataclysm:essence_of_the_storm')
        .setRequiredTool("hammer_dig", 1)
        .setCountFactor(0.5)
        .build();

    // 8. 泰拉钢 / Terrasteel
    tetraMaterialBuilder(event, "terrasteel").setCategory("metal")
        .setPrimary(50).setSecondary(40).setTertiary(29)
        .setDurability(300).setIntegrityCost(7).setIntegrityGain(13)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("slashblade_sendims:madness_reduce", 20)
        .addAttributes("slashblade_sendims:magic_penetration", 2)
        .addAttributes("slashblade_sendims:magic_resistance", 2)
        .addAttributes("slashblade_sendims:ap_gain_percentage", 0.1)
        .setTints("00ff66", "6bfa8f")
        .addTexture("metal").addTexture("heavy")
        .setTagMaterial('forge:ingots/terrasteel')
        .setRequiredTool("hammer_dig", 1)
        .addEffects("mana_resonance", [1, 0])
        .addImprovements("mana_repair", 1)
        .build();

    // 9. 古蜡砖 / Ancient Wax Blocks
    tetraMaterialBuilder(event, "full_blocks").setCategory("wood")
        .setPrimary(39).setSecondary(24).setTertiary(24)
        .setDurability(140).setIntegrityCost(7).setIntegrityGain(7)
        .setMagicCapacity(70).setToolLevel(2).setToolEfficiency(3)
        .addAttributes("minecraft:generic.armor_toughness", 1).addAttributes("slashblade_sendims:magic_resistance", 3).addAttributes("slashblade_sendims:ap_gain_percentage", 0.1)
        .setTints("8b5a2b", "cd853f")
        .addTexture("crude").addTexture("default")
        // .setTagMaterial('the_bumblezone:ancient_wax/full_blocks')
        .addItemMaterial('the_bumblezone:ancient_wax_compound_eyes')
        .setRequiredTool("hammer_dig", 1)
        .setCountFactor(4)
        .build();

    // 1. 循环框架 / Galactic Cycle Component
    tetraMaterialBuilder(event, "galatic_cycle_component").setCategory("metal")
        .setPrimary(52).setSecondary(35).setTertiary(29)
        .setDurability(280).setIntegrityCost(4).setIntegrityGain(16)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("attributeslib:crit_chance", 0.03)
        .addAttributes("attributeslib:armor_pierce", 2)
        .addAttributes("minecraft:generic.armor_toughness", 1)
        .setTints("4b4b7a", "1a1a3a")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('kubejs:galatic_cycle_component')
        .setRequiredTool("hammer_dig", 1)
        .addEffects("fot:fe_store", 64000)
        .setCountFactor(0.5)
        .build();

    // 2. 蜂王浆 / Royal Jelly Bottle
    tetraMaterialBuilder(event, "royal_jelly").setCategory("gem")
        .setPrimary(46).setSecondary(50).setTertiary(29)
        .setDurability(120).setIntegrityCost(6).setIntegrityGain(8)
        .setMagicCapacity(150).setToolLevel(2).setToolEfficiency(4)
        .addAttributes("attributeslib:experience_gained", 0.2).addAttributes("attributeslib:cold_damage", 14).addAttributes("slashblade_sendims:magic_penetration", 2)
        .setTints("ffaa00", "ffdd00")
        .addTexture("shiny")
        .addItemMaterial('the_bumblezone:royal_jelly_bottle')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3. 多面酒 / Multifaceted Ambrosia
    tetraMaterialBuilder(event, "multifaceted_ambrosia").setCategory("gem")
        .setPrimary(52).setSecondary(50).setTertiary(30.5)
        .setDurability(160).setIntegrityCost(6).setIntegrityGain(12)
        .setMagicCapacity(160).setToolLevel(3).setToolEfficiency(5)
        .addAttributes("minecraft:generic.armor", 1).addAttributes("**minecraft:generic.max_health", 0.01).addAttributes("**minecraft:generic.attack_damage", 0.01)
        .setTints("e5c158", "f7e7ad")
        .addTexture("shiny")
        .addItemMaterial('kubejs:multifaceted_ambrosia')
        .setRequiredTool("hammer_dig", 1)
        .setCountFactor(0.5)
        .build();

    // 4. 阿尔法尘 / Alpha Dust
    tetraMaterialBuilder(event, "alpha_dust").setCategory("scale")
        .setPrimary(58).setSecondary(45).setTertiary(31)
        .setDurability(200).setIntegrityCost(6).setIntegrityGain(12)
        .setMagicCapacity(130).setToolLevel(3).setToolEfficiency(6)
        .addAttributes("minecraft:generic.attack_damage", 0.5).addAttributes("slashblade_sendims:ap_reduce_amount", 15).addAttributes("attributeslib:crit_damage", 0.01)
        .setTints("ff5555", "ffaaaa")
        .addTexture("crude")
        .addItemMaterial('kubejs:alpha_dust')
        .setRequiredTool("hammer_dig", 1)
        .setCountFactor(4)
        .build();

    // 5. ML锭 / ML Computing Ingot
    tetraMaterialBuilder(event, "ml_computing_ingot").setCategory("metal")
        .setPrimary(64).setSecondary(50).setTertiary(33)
        .setDurability(300).setIntegrityCost(8).setIntegrityGain(14)
        .setMagicCapacity(150).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:armor_pierce", 3).addAttributes("slashblade_sendims:magic_penetration", 2).addAttributes("attributeslib:crit_chance", 0.02)
        .setTints("b30fff", "8e24ff")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('kubejs:ml_computing_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 6. 锚碎片 / Anchor Shard
    tetraMaterialBuilder(event, "anchor_shard").setCategory("metal")
        .setPrimary(68).setSecondary(60).setTertiary(32)
        .setDurability(290).setIntegrityCost(8).setIntegrityGain(14)
        .setMagicCapacity(110).setToolLevel(4).setToolEfficiency(6)
        .addAttributes("minecraft:generic.knockback_resistance", 0.1)
        .addAttributes("minecraft:generic.armor", 1)
        .addAttributes("attributeslib:cold_damage", 16)
        .setTints("4a5d6e", "2c3e50")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('kubejs:anchor_shard')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 7. 奇点合金 / Basepoint Alloy
    tetraMaterialBuilder(event, "basepoint_alloy").setCategory("metal")
        .setPrimary(74).setSecondary(45).setTertiary(34)
        .setDurability(300).setIntegrityCost(8).setIntegrityGain(12)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("slashblade_sendims:madness_reduce", 20)
        .addAttributes("slashblade_sendims:frenzy_resistance", 0.02)
        .addAttributes("slashblade_sendims:magic_resistance", 2)
        .setTints("7f00ff", "cc99ff")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('kubejs:basepoint_alloy')
        .setRequiredTool("hammer_dig", 1)
        .addEnchantment("minecraft:protection", 0.5)
        .setCountFactor(0.7)
        .build();

    // 8. 混沌真理 / Chaotic Truth
    tetraMaterialBuilder(event, "chaotic_truth").setCategory("fabric")
        .setPrimary(64).setSecondary(72).setTertiary(34)
        .setDurability(260).setIntegrityCost(10).setIntegrityGain(16)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("slashblade_sendims:frenzy_damage", 0.07).addAttributes("**minecraft:generic.attack_damage", 0.01).addAttributes("attributeslib:fire_damage", 20)
        .setTints("ff00ff", "000000")
        .addTexture("shiny")
        .addItemMaterial('kubejs:chaotic_truth')
        .setRequiredTool("hammer_dig", 1)
        .setCountFactor(2)
        .build();

    // 9. 辐射零件 / Radiation Components
    tetraMaterialBuilder(event, "radiation_components").setCategory("metal")
        .setPrimary(73).setSecondary(57).setTertiary(35)
        .setDurability(300).setIntegrityCost(8).setIntegrityGain(16)
        .setMagicCapacity(90).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("minecraft:generic.attack_damage", -1.5).addAttributes("attributeslib:crit_damage", 0.08).addAttributes("attributeslib:crit_chance", 0.02)
        .setTints("99cc00", "336600")
        .addTexture("metal")
        .addItemMaterial('kubejs:radiation_components')
        .setRequiredTool("hammer_dig", 1)
        .setCountFactor(0.6)
        .build();

    // 3.x 后期材料归入整合包阶段 4；已存在的五种材料在上方原位维护。
    // 辅助参数按材料定位与阶段独立配置；颜色对应原物品的主色。
    // ap_reduce_amount 为负表示增加消耗；单个 * 为最大生命的基础倍率加算。

    // 3.3.2 古代灵魂
    tetraMaterialBuilder(event, "ancient_soul").setCategory("gem")
        .setPrimary(64).setSecondary(50).setTertiary(34)
        .setDurability(180).setIntegrityCost(7).setIntegrityGain(10)
        .setMagicCapacity(230).setToolLevel(4).setToolEfficiency(4.5)
        .addAttributes("slashblade_sendims:magic_resistance", 4)
        .setTints("b88655", "d6b179")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('kubejs:ancient_soul')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.2 土星环合金锭
    tetraMaterialBuilder(event, "saturn_ring_alloy_ingot").setCategory("metal")
        .setPrimary(62).setSecondary(55).setTertiary(34)
        .setDurability(340).setIntegrityCost(8).setIntegrityGain(15)
        .setMagicCapacity(145).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:armor_shred", 0.02)
        .addAttributes("attributeslib:crit_damage", 0.04)
        .addAttributes("slashblade_sendims:ap_gain_percentage", 0.04)
        .setTints("d9ae5a", "f1d38e")
        .addTexture("metal").addTexture("shiny")
        .addItemMaterial('kubejs:saturn_ring_alloy_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.2 龙锭
    tetraMaterialBuilder(event, "draconium_ingot").setCategory("metal")
        .setPrimary(68).setSecondary(40).setTertiary(33)
        .setDurability(360).setIntegrityCost(9).setIntegrityGain(12)
        .setMagicCapacity(170).setToolLevel(4).setToolEfficiency(8.5)
        .addAttributes("attributeslib:fire_damage", 14)
        .addAttributes("attributeslib:armor_pierce", 2)
        .addAttributes("minecraft:generic.attack_damage", 0.5)
        .setTints("8c48bd", "b781e5")
        .addTexture("metal").addTexture("shiny")
        .addItemMaterial('draconicevolution:draconium_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.2 压缩铁锭
    tetraMaterialBuilder(event, "ingot_iron_compressed").setCategory("metal")
        .setPrimary(58).setSecondary(65).setTertiary(33)
        .setDurability(420).setIntegrityCost(9).setIntegrityGain(16)
        .setMagicCapacity(80).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("minecraft:generic.armor", 1)
        .addAttributes("minecraft:generic.armor_toughness", 1.5)
        .addAttributes("minecraft:generic.knockback_resistance", 0.025)
        .setTints("888888", "a1a1a1")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('pneumaticcraft:ingot_iron_compressed')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.3 塑料片
    tetraMaterialBuilder(event, "plastic").setCategory("fabric")
        .setPrimary(50).setSecondary(100).setTertiary(32)
        .setDurability(200).setIntegrityCost(4).setIntegrityGain(10)
        .setMagicCapacity(60).setToolLevel(4).setToolEfficiency(4)
        .addAttributes("attributeslib:dodge_chance", 0.015)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 4)
        .addAttributes("minecraft:generic.armor", -1)
        .setTints("a9b6b6", "e1e5e5")
        .addTexture("default")
        .addItemMaterial('pneumaticcraft:plastic')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.3 遗弃青铜锭
    tetraMaterialBuilder(event, "forsaken_bronze_ingot").setCategory("metal")
        .setPrimary(60).setSecondary(80).setTertiary(33)
        .setDurability(360).setIntegrityCost(7).setIntegrityGain(15)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("minecraft:generic.armor", 1)
        .addAttributes("slashblade_sendims:parry_heal_amount", 60)
        .addAttributes("slashblade_sendims:madness_reduce", 15)
        .setTints("916952", "b39072")
        .addTexture("metal").addTexture("crude")
        .addItemMaterial('darkerdepths:forsaken_bronze_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.3 硅岩锭
    tetraMaterialBuilder(event, "naquadah_ingot").setCategory("metal")
        .setPrimary(72).setSecondary(50).setTertiary(33)
        .setDurability(340).setIntegrityCost(10).setIntegrityGain(11)
        .setMagicCapacity(155).setToolLevel(4).setToolEfficiency(8.5)
        .addAttributes("slashblade_sendims:magic_penetration", 3)
        .addAttributes("attributeslib:fire_damage", 12)
        .addAttributes("attributeslib:healing_received", -0.03)
        .setTints("676764", "898983")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('sgjourney:naquadah_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.4 压实耀魂滤饼
    tetraMaterialBuilder(event, "compressed_proudsoul_cake").setCategory("scale")
        .setPrimary(52).setSecondary(105).setTertiary(33)
        .setDurability(180).setIntegrityCost(8).setIntegrityGain(10)
        .setMagicCapacity(220).setToolLevel(4).setToolEfficiency(4.5)
        .addAttributes("slashblade_sendims:ap_gain_percentage", 0.06)
        .addAttributes("slashblade_sendims:parry_heal_amount", 100)
        .addAttributes("minecraft:generic.attack_damage", -1)
        .setTints("6f4c8d", "9470b2")
        .addTexture("shiny").addTexture("crude")
        .addItemMaterial('kubejs:compressed_proudsoul_cake')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.4 硅岩铁合金
    tetraMaterialBuilder(event, "naquadah_iron_alloy").setCategory("metal")
        .setPrimary(82).setSecondary(30).setTertiary(33)
        .setDurability(480).setIntegrityCost(10).setIntegrityGain(18)
        .setMagicCapacity(95).setToolLevel(4).setToolEfficiency(9)
        .addAttributes("attributeslib:armor_pierce", 3)
        .addAttributes("minecraft:generic.armor_toughness", 1)
        .addAttributes("slashblade_sendims:ap_reduce_amount", -20)
        .setTints("5d6c8c", "8a9bbf")
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('sgjourney:naquadah_iron_alloy')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.5 武器级硅岩
    tetraMaterialBuilder(event, "naquadah").setCategory("metal")
        .setPrimary(84).setSecondary(30).setTertiary(33.5)
        .setDurability(320).setIntegrityCost(12).setIntegrityGain(10)
        .setMagicCapacity(110).setToolLevel(4).setToolEfficiency(10)
        .addAttributes("attributeslib:armor_shred", 0.025)
        .addAttributes("attributeslib:fire_damage", 20)
        .addAttributes("minecraft:generic.armor_toughness", -1)
        .setTints("575050", "756d6d")
        .addTexture("metal").addTexture("shiny")
        .addItemMaterial('sgjourney:naquadah')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.5 凯金锭
    tetraMaterialBuilder(event, "trinium_ingot").setCategory("metal")
        .setPrimary(68).setSecondary(70).setTertiary(33)
        .setDurability(380).setIntegrityCost(6).setIntegrityGain(16)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(8.5)
        .addAttributes("slashblade_sendims:sprint_cd", 0.015)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 4)
        .addAttributes("attributeslib:crit_damage", 0.04)
        .setTints("c8c8c8", "eaeaea")
        .addTexture("metal").addTexture("shiny")
        .addItemMaterial('sgjourney:trinium_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.5 合一碎片
    tetraMaterialBuilder(event, "unity_shard").setCategory("gem")
        .setPrimary(70).setSecondary(64).setTertiary(32)
        .setDurability(280).setIntegrityCost(7).setIntegrityGain(14)
        .setMagicCapacity(190).setToolLevel(4).setToolEfficiency(6)
        .addAttributes("minecraft:generic.armor", 1)
        .addAttributes("slashblade_sendims:magic_resistance", 2)
        .addAttributes("attributeslib:healing_received", 0.03)
        .setTints("576ffa", "a7b3ff")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('sgjourney:unity_shard')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.6 飞龙核心
    tetraMaterialBuilder(event, "wyvern_core").setCategory("gem")
        .setPrimary(71).setSecondary(63).setTertiary(33)
        .setDurability(320).setIntegrityCost(9).setIntegrityGain(13)
        .setMagicCapacity(180).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:crit_chance", 0.02)
        .addAttributes("attributeslib:crit_damage", 0.06)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 4)
        .setTints("ad7bcb", "be92d9")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('draconicevolution:wyvern_core')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.6 高级控制水晶
    tetraMaterialBuilder(event, "advanced_control_crystal").setCategory("gem")
        .setPrimary(68).setSecondary(70).setTertiary(33)
        .setDurability(220).setIntegrityCost(6).setIntegrityGain(12)
        .setMagicCapacity(210).setToolLevel(4).setToolEfficiency(5.5)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 6)
        .addAttributes("slashblade_sendims:sprint_cd", 0.01)
        .addAttributes("slashblade_sendims:magic_resistance", 1)
        .setTints("20c4b5", "a1fbe9")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('sgjourney:advanced_control_crystal')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.7 补天合金锭
    tetraMaterialBuilder(event, "celestial_filling_alloy_ingot").setCategory("metal")
        .setPrimary(50).setSecondary(115).setTertiary(33)
        .setDurability(440).setIntegrityCost(9).setIntegrityGain(20)
        .setMagicCapacity(180).setToolLevel(4).setToolEfficiency(6.5)
        .addAttributes("*minecraft:generic.max_health", 0.01)
        .addAttributes("attributeslib:healing_received", 0.04)
        .addAttributes("slashblade_sendims:madness_reduce", 15)
        .setTints("d784c5", "f0a1d6")
        .addTexture("metal").addTexture("shiny")
        .addItemMaterial('kubejs:celestial_filling_alloy_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.7 大型控制水晶
    tetraMaterialBuilder(event, "large_control_crystal").setCategory("gem")
        .setPrimary(65).setSecondary(77).setTertiary(33)
        .setDurability(260).setIntegrityCost(8).setIntegrityGain(14)
        .setMagicCapacity(240).setToolLevel(4).setToolEfficiency(6)
        .addAttributes("slashblade_sendims:ap_gain_percentage", 0.08)
        .addAttributes("slashblade_sendims:sprint_cd", 0.015)
        .addAttributes("minecraft:generic.attack_damage", -1)
        .setTints("c7021f", "eb7180")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('sgjourney:large_control_crystal')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.8 神龙核心（觉醒核心）
    tetraMaterialBuilder(event, "awakened_core").setCategory("gem")
        .setPrimary(72).setSecondary(65).setTertiary(34.5)
        .setDurability(380).setIntegrityCost(10).setIntegrityGain(14)
        .setMagicCapacity(205).setToolLevel(4).setToolEfficiency(9)
        .addAttributes("attributeslib:crit_damage", 0.1)
        .addAttributes("attributeslib:armor_pierce", 3)
        .addAttributes("slashblade_sendims:ap_reduce_amount", -20)
        .setTints("ff921c", "ffd17f")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('draconicevolution:awakened_core')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3.3.9 混沌核心
    tetraMaterialBuilder(event, "chaotic_core").setCategory("gem")
        .setPrimary(74).setSecondary(70).setTertiary(36)
        .setDurability(320).setIntegrityCost(12).setIntegrityGain(11)
        .setMagicCapacity(235).setToolLevel(4).setToolEfficiency(10)
        .addAttributes("slashblade_sendims:frenzy_damage", 0.08)
        .addAttributes("attributeslib:crit_damage", 0.08)
        .addAttributes("*minecraft:generic.max_health", -0.01)
        .setTints("e0e0e0", "9b9b9b")
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('draconicevolution:chaotic_core')
        .setRequiredTool("hammer_dig", 1)
        .build();

}));
