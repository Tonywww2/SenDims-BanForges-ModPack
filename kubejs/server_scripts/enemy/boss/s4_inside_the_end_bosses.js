// priority: 100
ServerEvents.highPriorityData(event => {
    const iEndBoss = (id) => {
        let boss = bossMaterialBuilder(event, id, "inside_the_end")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#the_end").addDimension("sdbf:inside_the_end")
            .setMinRarity("epic").setMaxRarity("mythic");
        boss.forRarity("epic")
            .setEnchantChance(0.7)
            .setEnchantmentLevels([48, 48, 12, 12])
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
            .setEnchantmentLevels([64, 64, 32, 16])
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

    iEndBoss('terra_entity:wyvern');
    iEndBoss('terra_entity:possess_armor');
    iEndBoss('terra_entity:ghost');
    iEndBoss('minecraft:shulker');
    iEndBoss('minecraft:evoker');
    iEndBoss('minecraft:vindicator');
    iEndBoss('minecraft:enderman');
    iEndBoss('minecraft:phantom');
    iEndBoss('minecraft:endermite');

})