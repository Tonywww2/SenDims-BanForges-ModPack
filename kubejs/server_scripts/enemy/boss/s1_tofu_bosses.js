// priority: 100
ServerEvents.highPriorityData(event => {
    const tofuBoss = (id) => {
        let boss = bossMaterialBuilder(event, id, "tofu")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#none").addDimension("tofucraft:tofu_world")
            .setMinRarity("uncommon").setMaxRarity("rare");
        boss.forRarity("uncommon")
            .setEnchantChance(0.25)
            .setEnchantmentLevels([2, 0, 0, 2])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.1,
                10, 0.05)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 1,
                10, 0.1)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.1,
                10, 0.01)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.7);
        boss.forRarity("rare")
            .setEnchantChance(0.35)
            .setEnchantmentLevels([4, 2, 2, 4])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.2,
                10, 0.05)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 2,
                10, 0.15)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.15,
                10, 0.015)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.8);
        boss.build();
    };

    tofuBoss('tofucraft:tofuspider');
    tofuBoss('tofucraft:shudofuspider');
    tofuBoss('tofucraft:fukumame_thower');
    tofuBoss('tofucraft:zundamite');
    tofuBoss('tofucraft:tofu_gandlem');
    tofuBoss('tofucraft:tofuslime');
    tofuBoss('tofucraft:tofucreeper');


})