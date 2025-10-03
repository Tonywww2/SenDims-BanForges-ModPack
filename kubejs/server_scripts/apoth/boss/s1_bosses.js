// priority: 100
ServerEvents.highPriorityData(event => {
    const demon_eye = bossMaterialBuilder(event, "terra_entity:demon_eye", "overworld")
        .setWeight(75).setQuality(2).setSize(1, 1)
        .addValidGearSet("#overworld").addDimension("minecraft:overworld")
        .setMinRarity("uncommon").setMaxRarity("rare");
    demon_eye.forRarity("uncommon")
        .setEnchantChance(0.25)
        .setEnchantmentLevels([12, 8, 20, 14])
        .addEffect("minecraft:fire_resistance", 1.0)
        .addAttributeRange("minecraft:generic.max_health", "ADDITION", 8,
            10, 1)
        .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 5,
            10, 0.25)
        .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.1,
            10, 0.01)
        .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.7);
    demon_eye.forRarity("rare")
        .setEnchantChance(0.35)
        .setEnchantmentLevels([15, 10, 23, 17])
        .addEffect("minecraft:fire_resistance", 1.0)
        .addAttributeRange("minecraft:generic.max_health", "ADDITION", 16,
            10, 1.5)
        .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 6,
            10, 0.3)
        .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.15,
            10, 0.015)
        .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.7);
    demon_eye.build();

})