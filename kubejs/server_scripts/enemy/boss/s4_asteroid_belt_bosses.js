// priority: 100
ServerEvents.highPriorityData(event => {
    const abBoss = (id) => {
        let boss = bossMaterialBuilder(event, id, "asteroid_belt")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#moon").addDimension("sdbf:asteroid_belt")
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
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.9);
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

    abBoss('terra_entity:demon_eye');
    abBoss('terra_entity:meteor_head');
    abBoss('terra_entity:wandering_eye_fish');
    abBoss('terra_entity:wyvern');
    abBoss('minecraft:zombie');
    abBoss('minecraft:skeleton');
    abBoss('minecraft:creeper');
    abBoss('ad_astra:sulfur_creeper');
    abBoss('minecraft:cave_spider');
    abBoss('minecraft:spider');

})