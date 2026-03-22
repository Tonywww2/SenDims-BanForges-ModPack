// priority: 100
ServerEvents.highPriorityData(event => {
    const marsBoss = (id) => {
        let boss = bossMaterialBuilder(event, id, "mars")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#the_nether").addDimension("ad_astra:mars")
            .setMinRarity("rare").setMaxRarity("epic");
        boss.forRarity("rare")
            .setEnchantChance(0.5)
            .setEnchantmentLevels([24, 16, 4, 4])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.1,
                10, 0.02)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 5,
                10, 0.5)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.15,
                10, 0.015)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.85);
        boss.forRarity("epic")
            .setEnchantChance(0.7)
            .setEnchantmentLevels([32, 32, 8, 8])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.2,
                10, 0.02)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 8,
                10, 0.75)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.2,
                10, 0.02)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.9);
        boss.build();
    };

    marsBoss('ad_astra:martian_raptor');
    marsBoss('ad_astra:star_crawler');

})