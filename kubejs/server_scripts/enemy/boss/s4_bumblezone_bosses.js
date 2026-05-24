// priority: 100
ServerEvents.highPriorityData(event => {
    const bumblezoneBoss = (id) => {
        let boss = bossMaterialBuilder(event, id, "the_bumblezone")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#the_end").addDimension("the_bumblezone:the_bumblezone")
            .setMinRarity("epic").setMaxRarity("mythic");
        boss.forRarity("epic")
            .setEnchantChance(0.7)
            .setEnchantmentLevels([32, 32, 4, 4])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.1,
                10, 0.015)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 1,
                10, 0.75)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.1,
                10, 0.015)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 1.0);
        boss.forRarity("mythic")
            .setEnchantChance(0.9)
            .setEnchantmentLevels([48, 48, 12, 12])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.2,
                10, 0.015)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 2,
                10, 0.75)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.15,
                10, 0.015)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 1.0);
        boss.build();
    };

    bumblezoneBoss('the_bumblezone:rootmin');
    bumblezoneBoss('the_bumblezone:honey_slime');
    bumblezoneBoss('the_bumblezone:beehemoth');
    bumblezoneBoss('minecraft:evoker_spawn');

})