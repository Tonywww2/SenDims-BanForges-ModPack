// priority: 100
// 深四为 4_2 阶段；以原版、灾变、热力与暮色的普通生物融合四条陆地股。
ServerEvents.highPriorityData(event => {
    let bosses = [
        { branch: "arid", entity: "minecraft:husk", size: [0.65, 1.95], health: 0.45, attack: 0.05, speed: 0.05, armor: 12, knockback: 0.95 },
        { branch: "arid", entity: "cataclysm:koboleton", size: [0.7, 2.0], health: 0.35, attack: 0.08, speed: 0.10, armor: 10, knockback: 0.90 },
        { branch: "infernal", entity: "minecraft:wither_skeleton", size: [0.7, 2.4], health: 0.30, attack: 0.10, speed: 0.12, armor: 4, knockback: 0.85 },
        { branch: "infernal", entity: "thermal:basalz", size: [0.7, 1.8], health: 0.25, attack: 0.08, speed: 0.04, armor: 14, knockback: 1.0 },
        { branch: "woodland", entity: "minecraft:vindicator", size: [0.7, 1.95], health: 0.35, attack: 0.08, speed: 0.12, armor: 8, knockback: 0.90 },
        { branch: "woodland", entity: "twilightforest:redcap_sapper", size: [0.7, 1.1], health: 0.25, attack: 0.06, speed: 0.14, armor: 12, knockback: 0.85 },
        { branch: "oceanic", entity: "minecraft:drowned", size: [0.65, 1.95], health: 0.50, attack: 0.05, speed: 0.06, armor: 14, knockback: 0.95 },
        { branch: "oceanic", entity: "cataclysm:deepling", size: [1.0, 2.3], health: 0.35, attack: 0.09, speed: 0.10, armor: 10, knockback: 0.90 }
    ];
    bosses.forEach(config => {
        let boss = bossMaterialBuilder(event, config.entity, `deep_realm_4/${config.branch}`)
            .setWeight(75).setQuality(2.75).setSize(config.size[0], config.size[1])
            .addValidGearSet("#the_end").addDimension("deeprealm_4th:fourth_layer")
            .setMinRarity("mythic").setMaxRarity("mythic");
        boss.forRarity("mythic")
            .setEnchantChance(1.0).setEnchantmentLevels([64, 64, 32, 16])
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", config.health, 10, 0.015)
            .addAttributeRange("minecraft:generic.attack_damage", "MULTIPLY_BASE", config.attack, 10, 0.004)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", config.speed, 10, 0.005)
            .addAttribute("minecraft:generic.armor", "ADDITION", config.armor)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", config.knockback);
        if (config.branch === "infernal") boss.addEffect("minecraft:fire_resistance", 1.0);
        boss.build();
    });
});
