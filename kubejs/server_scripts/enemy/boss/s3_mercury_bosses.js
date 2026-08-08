// priority: 100
ServerEvents.highPriorityData(event => {
    let mercuryBoss = (id) => {
        let boss = bossMaterialBuilder(event, id, "mercury")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#the_nether").addDimension("ad_astra:mercury")
            .setMinRarity("rare").setMaxRarity("epic");
        boss.forRarity("rare")
            .setEnchantChance(0.5)
            .setEnchantmentLevels([16, 16, 2, 2])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.1,
                10, 0.015)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 1,
                10, 0.75)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.15,
                10, 0.01)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.85);
        boss.forRarity("epic")
            .setEnchantChance(0.7)
            .setEnchantmentLevels([24, 24, 2, 2])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.2,
                10, 0.015)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 2,
                10, 0.75)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.2,
                10, 0.015)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.9);
        boss.build();
    };

    mercuryBoss("minecraft:magma_cube");
    mercuryBoss("ad_astra:zombified_mogler");

})