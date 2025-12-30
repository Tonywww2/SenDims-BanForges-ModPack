ServerEvents.highPriorityData(event => {

    // 1. 炎狱尖塔块
    tetraMaterialBuilder(event, "infernal_spire_block").setCategory("stone")
        .setPrimary(9).setSecondary(6).setTertiary(4)
        .setDurability(140).setIntegrityCost(4).setIntegrityGain(4)
        .setMagicCapacity(80).setToolLevel(5).setToolEfficiency(8)
        .addAttributes("attributeslib:fire_damage", 1.5)
        .setTints("b03a2e", "78281f")
        .addTexture("grainy").addTexture("crude").addTexture("default")
        .addItemMaterial('ad_astra:infernal_spire_block')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 2. 震动合金
    tetraMaterialBuilder(event, "vibrant_alloy_ingot").setCategory("metal")
        .setPrimary(9.6).setSecondary(7).setTertiary(4.8)
        .setDurability(220).setIntegrityCost(5).setIntegrityGain(4)
        .setMagicCapacity(90).setToolLevel(3).setToolEfficiency(5.5)
        .addAttributes("minecraft:generic.armor", 1.0)
        .setTints("a3fb66", "7dbd4a") // 经典的震动合金亮绿色
        .addTexture("metal").addTexture("shiny")
        .addItemMaterial('enderio:vibrant_alloy_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 3. 门瑞欧结晶
    tetraMaterialBuilder(event, "crystalized_menril_chunk").setCategory("gem")
        .setPrimary(8).setSecondary(12).setTertiary(4)
        .setDurability(200).setIntegrityCost(5).setIntegrityGain(4)
        .setMagicCapacity(100).setToolLevel(2).setToolEfficiency(6)
        .addAttributes("minecraft:generic.armor_toughness", 0.75)
        .setTints("1abc9c", "d1f2eb") // 青绿色调
        .addTexture("shiny").addTexture("crude")
        .addItemMaterial('integrateddynamics:crystalized_menril_chunk')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 4. 爆裂紫颂果
    tetraMaterialBuilder(event, "popped_chorus_fruit").setCategory("misc")
        .setPrimary(9).setSecondary(12).setTertiary(6)
        .setDurability(120).setIntegrityCost(4).setIntegrityGain(5)
        .setMagicCapacity(110).setToolLevel(2).setToolEfficiency(4.5)
        .addAttributes("attributeslib:armor_shred", 2.0)
        .setTints("8e44ad", "2e113d") // 紫色
        .addTexture("crude").addTexture("default")
        .addItemMaterial('minecraft:popped_chorus_fruit')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 5. 耐热金属 (Calorite)
    tetraMaterialBuilder(event, "calorite").setCategory("metal")
        .setPrimary(12).setSecondary(5).setTertiary(6.5)
        .setDurability(260).setIntegrityCost(4).setIntegrityGain(5)
        .setMagicCapacity(120).setToolLevel(4).setToolEfficiency(7)
        .addAttributes("slashblade_sendims:frenzy_resistance", 0.05)
        .addAttributes("slashblade_sendims:frenzy_damage", 0.05)
        .addAttributes("minecraft:generic.max_health", 4.0)
        .setTints("e74c3c", "922b21") // 鲜红/金属红
        .addTexture("metal").addTexture("heavy")
        .setTagMaterial('forge:ingots/calorite')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 6. 逻辑导向零件
    tetraMaterialBuilder(event, "logic_director").setCategory("metal")
        .setPrimary(14).setSecondary(6).setTertiary(7)
        .setDurability(240).setIntegrityCost(6).setIntegrityGain(5)
        .setMagicCapacity(130).setToolLevel(3).setToolEfficiency(6.5)
        .addAttributes("slashblade_sendims:ap_gain_percentage", 0.1)
        .addAttributes("attributeslib:experience_gained", 0.1)
        .setTints("3498db", "21618c") // 科技蓝
        .addTexture("metal").addTexture("default")
        .addItemMaterial('integrateddynamics:logic_director')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 7. 紫菘玻璃
    tetraMaterialBuilder(event, "chorus_glass").setCategory("gem")
        .setPrimary(17).setSecondary(2).setTertiary(7)
        .setDurability(180).setIntegrityCost(6).setIntegrityGain(6)
        .setMagicCapacity(115).setToolLevel(3).setToolEfficiency(8)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 10.0)
        .addAttributes("attributeslib:armor_pierce", 2.0)
        .setTints("d7bde2", "633974") // 浅紫透明色调
        .addTexture("shiny").addTexture("crude")
        .addItemMaterial('integratedterminals:chorus_glass')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 8. 虚金
    tetraMaterialBuilder(event, "virtual_gold_ingot").setCategory("metal")
        .setPrimary(15.5).setSecondary(6).setTertiary(8)
        .setDurability(200).setIntegrityCost(6).setIntegrityGain(6)
        .setMagicCapacity(140).setToolLevel(3).setToolEfficiency(7.5)
        .addAttributes("attributeslib:crit_chance", 0.05)
        .addAttributes("minecraft:generic.knockback_resistance", 0.1)
        .setTints("f1c40f", "d4ac0d") // 金色调
        .addTexture("metal").addTexture("shiny")
        .addItemMaterial('kubejs:virtual_gold_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 9. 御腐 (Utherium)
    tetraMaterialBuilder(event, "utherium").setCategory("metal")
        .setPrimary(14).setSecondary(5).setTertiary(7.5)
        .setDurability(250).setIntegrityCost(6).setIntegrityGain(7)
        .setMagicCapacity(100).setToolLevel(3).setToolEfficiency(6.5)
        .setTints("1e8449", "145a32") // 墨绿色
        .addTexture("metal").addTexture("heavy")
        .setTagMaterial('forge:ingots/utherium')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 10. 霜钢 (Frost Steel)
    tetraMaterialBuilder(event, "frost_steel").setCategory("metal")
        .setPrimary(17).setSecondary(7).setTertiary(9.5)
        .setDurability(280).setIntegrityCost(7).setIntegrityGain(7)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(7.5)
        .addAttributes("attributeslib:cold_damage", 6.0)
        .setTints("85c1e9", "2e86c1") // 冰蓝色
        .addTexture("metal").addTexture("heavy")
        .setTagMaterial('forge:ingots/extreme') // 注意：此处对应表中ID
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 11. 极限合金
    tetraMaterialBuilder(event, "extreme_alloy").setCategory("metal")
        .setPrimary(18).setSecondary(10).setTertiary(9.8)
        .setDurability(300).setIntegrityCost(7).setIntegrityGain(7)
        .setMagicCapacity(150).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("attributeslib:armor_shred", 0.05)
        .addAttributes("minecraft:generic.armor_toughness", 0.25)
        .setTints("566573", "2c3e50") // 深钢灰色
        .addTexture("metal").addTexture("heavy")
        .setTagMaterial('forge:ingots/extreme')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 12. 贵豪 (Regalium)
    tetraMaterialBuilder(event, "regalium").setCategory("metal")
        .setPrimary(20).setSecondary(10).setTertiary(10)
        .setDurability(290).setIntegrityCost(8).setIntegrityGain(8)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(7.5)
        .addAttributes("attributeslib:experience_gained", 0.15)
        .addAttributes("attributeslib:crit_damage", 0.05)
        .setTints("f39c12", "e67e22") // 橙金/高贵色调
        .addTexture("metal").addTexture("shiny")
        .setTagMaterial('forge:ingots/regalium')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 13. 遗忆 (Forgotten Metal)
    tetraMaterialBuilder(event, "forgotten").setCategory("metal")
        .setPrimary(23).setSecondary(8).setTertiary(11)
        .setDurability(300).setIntegrityCost(8).setIntegrityGain(8)
        .setMagicCapacity(140).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("minecraft:generic.armor", 1.0)
        .addAttributes("attributeslib:armor_pierce", 1.0)
        .setTints("d5dbdb", "808b96") // 古旧的银灰色
        .addTexture("metal").addTexture("crude")
        .setTagMaterial('forge:ingots/forgotten_metal')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 14. 中子 (Neutronium)
    tetraMaterialBuilder(event, "neutronium").setCategory("metal")
        .setPrimary(17).setSecondary(18).setTertiary(10)
        .setDurability(300).setIntegrityCost(8).setIntegrityGain(8)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(5)
        .addAttributes("**minecraft:generic.movement_speed", -0.05)
        .addAttributes("**minecraft:generic.attack_damage", 0.03)
        .setTints("17202a", "000000") // 极深黑色
        .addTexture("metal").addTexture("heavy")
        .setTagMaterial('forge:ingots/neutronium')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 15. 三项合金
    tetraMaterialBuilder(event, "trinity_alloy").setCategory("metal")
        .setPrimary(25).setSecondary(9).setTertiary(11.5)
        .setDurability(300).setIntegrityCost(8).setIntegrityGain(9)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("**minecraft:generic.max_health", 0.03)
        .addAttributes("attributeslib:armor_shred", 0.03)
        .addAttributes("slashblade_sendims:parry_heal_amount", 333)
        .setTints("ecf0f1", "95a5a6") // 亮合金色
        .addTexture("metal").addTexture("shiny").addTexture("heavy")
        .addItemMaterial('kubejs:trinity_alloy_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 16. 铍青铜合金
    tetraMaterialBuilder(event, "beryllium_bronze_alloy").setCategory("metal")
        .setPrimary(27).setSecondary(14).setTertiary(12)
        .setDurability(300).setIntegrityCost(8).setIntegrityGain(9)
        .setMagicCapacity(150).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("minecraft:generic.armor_toughness", 1.0)
        .addAttributes("slashblade_sendims:frenzy_resistance", 0.1)
        .addAttributes("slashblade_sendims:madness_reduce", 1.0)
        .addAttributes("attributeslib:crit_chance", 0.035)
        .setTints("d35400", "a04000") // 青铜/深橙色
        .addTexture("metal").addTexture("heavy")
        .addItemMaterial('kubejs:beryllium_bronze_alloy_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 17. 幻境石水晶
    tetraMaterialBuilder(event, "myalite_crystal").setCategory("gem")
        .setPrimary(12).setSecondary(30).setTertiary(10.5)
        .setDurability(280).setIntegrityCost(9).setIntegrityGain(9)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(7)
        .setTints("d2b4de", "7d3c98") // 梦幻紫
        .addTexture("shiny").addTexture("default")
        .addItemMaterial('quark:myalite_crystal')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 18. 紫颂果结晶
    tetraMaterialBuilder(event, "crystalized_chorus").setCategory("gem")
        .setPrimary(10).setSecondary(15).setTertiary(7)
        .setDurability(220).setIntegrityCost(9).setIntegrityGain(10)
        .setMagicCapacity(140).setToolLevel(3).setToolEfficiency(6)
        .addAttributes("attributeslib:cold_damage", 3.0)
        .addAttributes("attributeslib:fire_damage", 3.0)
        .setTints("bb8fce", "5b2c6f") // 结晶紫
        .addTexture("shiny").addTexture("crude")
        .addItemMaterial('integrateddynamics:crystalized_chorus_chunk')
        .setRequiredTool("hammer_dig", 1)
        .build();

    // 19. 末地钢锭
    tetraMaterialBuilder(event, "end_steel").setCategory("metal")
        .setPrimary(25).setSecondary(13).setTertiary(12.7)
        .setDurability(300).setIntegrityCost(9).setIntegrityGain(10)
        .setMagicCapacity(160).setToolLevel(4).setToolEfficiency(8)
        .addAttributes("slashblade_sendims:sprint_cd", 0.05)
        .addAttributes("slashblade_sendims:ap_reduce_amount", 8.0)
        .addAttributes("minecraft:generic.attack_damage", 1.0)
        .setTints("273746", "1d8348") // 末地风格的黑绿色
        .addTexture("metal").addTexture("heavy").addTexture("shiny")
        .addItemMaterial('enderio:end_steel_ingot')
        .setRequiredTool("hammer_dig", 1)
        .build();


})
