// priority: 100
ServerEvents.highPriorityData(event => {
    const netherBoss = (id, is_terra) => {
        let boss = bossMaterialBuilder(event, id, "the_nether")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#the_nether").addDimension("minecraft:the_nether")
            .setMinRarity("rare").setMaxRarity("rare");
        boss.forRarity("rare")
            .setEnchantChance(0.5)
            .setEnchantmentLevels([16, 16, 2, 2])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", is_terra ? 0 : 0.1,
                is_terra ? 5 : 10, 0.01)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", is_terra ? 0 : 1,
                is_terra ? 5 : 10, 0.5)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", is_terra ? 0 : 0.15,
                is_terra ? 5 : 10, 0.01)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", is_terra ? 0 : 0.8);
        boss.build();
    };

    netherBoss("terra_entity:hell_bat", true);
    netherBoss("terra_entity:crimson_kemera", true);
    netherBoss("terra_entity:fire_imp", true);
    netherBoss("terra_entity:drippler", true);
    netherBoss("terra_entity:wandering_eye_fish", true);

})