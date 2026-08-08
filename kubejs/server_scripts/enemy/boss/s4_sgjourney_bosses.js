// priority: 100
ServerEvents.highPriorityData(event => {
    let sgJourneyBoss = (id, dimension, path) => {
        let boss = bossMaterialBuilder(event, id, `sgjourney/${path}`)
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#the_end").addDimension(dimension)
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

    let bossPools = {
        abydos: [
            "minecraft:husk",
            "minecraft:spider",
            "cataclysm:koboleton",
            "undergarden:sploogie",
            "cataclysm:wadjet"
        ],
        athos: [
            "minecraft:zombie",
            "minecraft:skeleton",
            "twilightforest:hostile_wolf",
            "species:leaf_hanger",
            "minecraft:witch"
        ],
        chulak: [
            "minecraft:zombie",
            "twilightforest:redcap",
            "minecraft:pillager",
            "twilightforest:lower_goblin_knight",
            "species:ghoul"
        ],
        lantea: [
            "minecraft:drowned",
            "cataclysm:deepling",
            "minecraft:guardian",
            "cataclysm:deepling_angler",
            "cataclysm:deepling_brute"
        ],
        rima: [
            "minecraft:skeleton",
            "minecraft:enderman",
            "species:cliff_hanger",
            "darkerdepths:body_snatcher",
            "species:quake"
        ],
        tollan: [
            "minecraft:magma_cube",
            "minecraft:blaze",
            "aether:fire_minion",
            "minecraft:wither_skeleton",
            "thermal:basalz",
            "ad_astra:sulfur_creeper"
        ],
        unitas: [
            "minecraft:husk",
            "ad_astra:sulfur_creeper",
            "midnight:nova",
            "midnight:crystal_bug",
            "species:quake"
        ]
    };

    for (let [path, entities] of Object.entries(bossPools)) {
        let dimension = `sgjourney:${path}`;
        for (let entity of entities) {
            sgJourneyBoss(entity, dimension, path);
        }
    }
})