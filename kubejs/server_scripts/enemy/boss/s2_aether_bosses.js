// priority: 100
ServerEvents.highPriorityData(event => {
    const aetherBoss = (id) => {
        let boss = bossMaterialBuilder(event, id, "aether")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#aether").addDimension("aether:the_aether")
            .setMinRarity("uncommon").setMaxRarity("epic");
        boss.forRarity("uncommon")
            .setEnchantChance(0.55)
            .setEnchantmentLevels([4, 2, 2, 4])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.15,
                10, 0.01)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 1,
                10, 0.1)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.1,
                10, 0.01)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.7);
        boss.forRarity("rare")
            .setEnchantChance(0.65)
            .setEnchantmentLevels([6, 4, 4, 6])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.2,
                10, 0.01)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 2,
                10, 0.1)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.15,
                10, 0.01)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.8);
        boss.forRarity("epic")
            .setEnchantChance(0.85)
            .setEnchantmentLevels([12, 6, 6, 12])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.25,
                10, 0.01)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 3,
                10, 0.1)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.2,
                10, 0.015)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.85);
        boss.build();
    };

    aetherBoss("aether:aechor_plant");
    aetherBoss("aether:blue_swet");
    aetherBoss("aether:cockatrice");
    aetherBoss("aether:fire_minion");
    aetherBoss("aether:golden_swet");
    aetherBoss("aether:mimic");
    aetherBoss("aether:sentry");
    aetherBoss("aether:valkyrie");
    aetherBoss("aether:zephyr");
    aetherBoss("deep_aether:venomite");
    aetherBoss("aether_redux:vanilla_swet");

})