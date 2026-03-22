// priority: 100
ServerEvents.highPriorityData(event => {
    const endBoss = (id, gearSet) => {
        let boss = bossMaterialBuilder(event, id, "the_end")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#the_end").addDimension("minecraft:the_end")
            .setMinRarity("rare").setMaxRarity("mythic");
        boss.forRarity("rare")
            .setEnchantChance(0.8)
            .setEnchantmentLevels([32, 16, 2, 2])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.1,
                10, 0.015)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 1,
                10, 0.75)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.15,
                10, 0.01)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.85);
        boss.forRarity("epic")
            .setEnchantChance(0.9)
            .setEnchantmentLevels([32, 24, 2, 50])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.2,
                10, 0.015)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 2,
                10, 0.75)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.2,
                10, 0.015)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.9);
        boss.forRarity("mythic")
            .setEnchantChance(1.0)
            .setEnchantmentLevels([32, 24, 50, 50])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.2,
                10, 0.02)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 2,
                10, 0.75)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.2,
                10, 0.02)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.95);
        boss.build();
    };

    endBoss("terra_entity:evil_slime");


})