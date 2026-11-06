// priority: 100
// S5 初期：在土卫六本地生态与失控勘探设备上生成神话首领。
ServerEvents.highPriorityData(event => {
    let titanBosses = [
        {
            entity: "titan_moon:cryo_scavenger", size: [0.9, 0.5], weight: 90,
            health: 0.55, attack: 0.04, speed: 0.04, armor: 20, knockback: 0.95
        },
        {
            entity: "titan_moon:ammonia_stalker", size: [0.9, 1.2], weight: 75,
            health: 0.25, attack: 0.08, speed: 0.20, armor: 0, knockback: 0.80
        },
        {
            entity: "titan_moon:corrupted_probe", size: [0.8, 0.8], weight: 75,
            health: 0.35, attack: 0.06, speed: 0.06, armor: 12, knockback: 1.0
        },
        {
            entity: "titan_moon:tholin_weaver", size: [1.4, 0.7], weight: 90,
            health: 0.35, attack: 0.06, speed: 0.12, armor: 8, knockback: 0.80
        }
    ];

    titanBosses.forEach(config => {
        let boss = bossMaterialBuilder(event, config.entity, "titan")
            .setWeight(config.weight).setQuality(2.5)
            .setSize(config.size[0], config.size[1])
            .addValidGearSet("#the_end")
            .addDimension("titan_moon:titan")
            .setMinRarity("mythic").setMaxRarity("mythic");

        // 全局难度脚本已经提供 4_1 基础属性，这里只作适度的角色区分。
        boss.forRarity("mythic")
            .setEnchantChance(1.0)
            .setEnchantmentLevels([64, 64, 32, 16])
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", config.health, 10, 0.015)
            .addAttributeRange("minecraft:generic.attack_damage", "MULTIPLY_BASE", config.attack, 10, 0.004)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", config.speed, 10, 0.005)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", config.knockback);
        if (config.armor > 0) boss.addAttribute("minecraft:generic.armor", "ADDITION", config.armor);
        boss.build();
    });
});
