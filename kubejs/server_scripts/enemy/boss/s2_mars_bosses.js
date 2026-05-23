// priority: 100
ServerEvents.highPriorityData(event => {
    const marsBoss = (id) => {
        let boss = bossMaterialBuilder(event, id, "mars")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#the_nether").addDimension("ad_astra:mars")
            .setMinRarity("rare").setMaxRarity("rare");
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
        boss.build();
    };

    marsBoss('ad_astra:martian_raptor');
    marsBoss('ad_astra:star_crawler');

})