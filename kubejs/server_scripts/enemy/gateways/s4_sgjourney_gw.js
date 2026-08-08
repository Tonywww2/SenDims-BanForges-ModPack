ServerEvents.highPriorityData(event => {
    let bossId = (dimension, entity) => `sdbf:sgjourney/${dimension}/${entity.replace(':', '_')}`;

    let jade = count => {
        let stack = $BloodJade.withKillCount(200);
        stack.setCount(count);
        return stack;
    };

    let smallJades = () => [jade(1), jade(1), jade(2), jade(3), jade(4)];
    let mediumJades = () => [jade(1), jade(1), jade(1), jade(1), jade(1), jade(1), jade(1), jade(1), jade(1), jade(2)];

    let smallRewards = material => {
        let rewards = {
            "slashblade:proudsoul": [4, 6, 8, 10, 10],
            "tetra:geode": [4, 7, 9, 10, 10],
            "apotheosis:epic_material": [1, 1, 2, 2, 2],
            "apotheosis:mythic_material": [0, 0, 1, 1, 3]
        };
        rewards[material] = [2, 3, 4, 5, 6];
        return rewards;
    };

    let mediumRewards = material => {
        let rewards = {
            "slashblade:proudsoul": [3, 3, 4, 4, 4, 5, 5, 5, 6, 6],
            "tetra:geode": [2, 3, 3, 4, 4, 4, 5, 5, 5, 5],
            "apotheosis:epic_material": [0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            "apotheosis:mythic_material": [0, 0, 0, 0, 1, 0, 1, 0, 1, 2]
        };
        rewards[material] = [1, 2, 2, 2, 2, 2, 2, 2, 2, 3];
        return rewards;
    };

    let gatewayConfigs = [
        {
            id: "abydos",
            color: 0xd6a348,
            material: "sgjourney:raw_naquadah",
            small: [
                [["minecraft:husk", 4], ["minecraft:spider", 2]],
                [["minecraft:husk", 6], ["cataclysm:koboleton", 2], ["undergarden:sploogie", 2]]
            ],
            medium: [
                [["minecraft:husk", 4], ["minecraft:spider", 2]],
                [["minecraft:husk", 6], ["minecraft:spider", 3]],
                [["minecraft:husk", 7], ["cataclysm:koboleton", 2]],
                [["minecraft:husk", 8], ["undergarden:sploogie", 3]],
                [["minecraft:spider", 4], ["cataclysm:koboleton", 3]],
                [["minecraft:husk", 10], ["cataclysm:wadjet", 1]]
            ],
            smallBosses: ["minecraft:husk", "cataclysm:koboleton", "cataclysm:wadjet"],
            mediumBosses: ["minecraft:spider", "undergarden:sploogie", "cataclysm:koboleton", "cataclysm:wadjet"]
        },
        {
            id: "athos",
            color: 0x3b7d4a,
            material: "aether:ambrosium_shard",
            small: [
                [["minecraft:zombie", 4], ["minecraft:spider", 2]],
                [["minecraft:zombie", 6], ["minecraft:skeleton", 3], ["twilightforest:hostile_wolf", 2]]
            ],
            medium: [
                [["minecraft:zombie", 4], ["minecraft:spider", 2]],
                [["minecraft:zombie", 6], ["minecraft:skeleton", 3]],
                [["minecraft:zombie", 6], ["twilightforest:hostile_wolf", 3]],
                [["minecraft:skeleton", 5], ["species:leaf_hanger", 2]],
                [["minecraft:zombie", 7], ["minecraft:spider", 4]],
                [["twilightforest:hostile_wolf", 4], ["minecraft:witch", 1]]
            ],
            smallBosses: ["minecraft:skeleton", "twilightforest:hostile_wolf", "minecraft:witch"],
            mediumBosses: ["minecraft:zombie", "species:leaf_hanger", "twilightforest:hostile_wolf", "minecraft:witch"]
        },
        {
            id: "chulak",
            color: 0x547c36,
            material: "sgjourney:naquadah_nugget",
            small: [
                [["minecraft:zombie", 4], ["twilightforest:redcap", 2]],
                [["minecraft:zombie", 5], ["twilightforest:redcap", 3], ["minecraft:pillager", 2]]
            ],
            medium: [
                [["minecraft:zombie", 4], ["twilightforest:redcap", 2]],
                [["minecraft:zombie", 6], ["minecraft:spider", 3]],
                [["twilightforest:redcap", 4], ["minecraft:pillager", 2]],
                [["minecraft:zombie", 7], ["twilightforest:lower_goblin_knight", 1]],
                [["minecraft:pillager", 3], ["twilightforest:redcap", 4]],
                [["minecraft:zombie", 8], ["species:ghoul", 2]]
            ],
            smallBosses: ["twilightforest:redcap", "minecraft:pillager", "twilightforest:lower_goblin_knight"],
            mediumBosses: ["minecraft:zombie", "twilightforest:redcap", "minecraft:pillager", "twilightforest:lower_goblin_knight"]
        },
        {
            id: "lantea",
            color: 0x1a788a,
            material: "minecraft:prismarine_shard",
            small: [
                [["minecraft:drowned", 4], ["cataclysm:lionfish", 2]],
                [["minecraft:drowned", 6], ["cataclysm:deepling", 3], ["cataclysm:symbiocto", 2]]
            ],
            medium: [
                [["minecraft:drowned", 4], ["cataclysm:lionfish", 2]],
                [["minecraft:drowned", 6], ["cataclysm:deepling", 3]],
                [["cataclysm:deepling", 5], ["cataclysm:symbiocto", 3]],
                [["minecraft:drowned", 7], ["minecraft:guardian", 2]],
                [["cataclysm:lionfish", 5], ["cataclysm:deepling_angler", 2]],
                [["cataclysm:deepling", 6], ["cataclysm:deepling_brute", 1]]
            ],
            smallBosses: ["minecraft:drowned", "cataclysm:deepling", "minecraft:guardian"],
            mediumBosses: ["minecraft:drowned", "cataclysm:deepling", "cataclysm:deepling_angler", "cataclysm:deepling_brute"]
        },
        {
            id: "rima",
            color: 0x695c82,
            material: "sgjourney:raw_naquadah",
            small: [
                [["minecraft:skeleton", 4], ["minecraft:spider", 2]],
                [["minecraft:skeleton", 6], ["species:cliff_hanger", 2], ["darkerdepths:body_snatcher", 1]]
            ],
            medium: [
                [["minecraft:skeleton", 4], ["minecraft:spider", 2]],
                [["minecraft:skeleton", 6], ["minecraft:enderman", 1]],
                [["species:cliff_hanger", 4], ["darkerdepths:body_snatcher", 2]],
                [["minecraft:skeleton", 7], ["minecraft:spider", 4]],
                [["darkerdepths:body_snatcher", 3], ["species:cliff_hanger", 4]],
                [["minecraft:skeleton", 8], ["species:quake", 1]]
            ],
            smallBosses: ["minecraft:skeleton", "species:cliff_hanger", "species:quake"],
            mediumBosses: ["minecraft:skeleton", "minecraft:enderman", "species:cliff_hanger", "species:quake"]
        },
        {
            id: "tollan",
            color: 0xc34a24,
            material: "sgjourney:raw_trinium",
            small: [
                [["minecraft:magma_cube", 4], ["minecraft:blaze", 2]],
                [["minecraft:magma_cube", 6], ["aether:fire_minion", 2], ["minecraft:wither_skeleton", 2]]
            ],
            medium: [
                [["minecraft:magma_cube", 4], ["minecraft:blaze", 2]],
                [["minecraft:magma_cube", 6], ["minecraft:wither_skeleton", 2]],
                [["aether:fire_minion", 4], ["thermal:basalz", 2]],
                [["minecraft:blaze", 5], ["twilightforest:carminite_ghastling", 2]],
                [["minecraft:wither_skeleton", 4], ["minecraft:magma_cube", 5]],
                [["thermal:basalz", 3], ["ad_astra:sulfur_creeper", 3]]
            ],
            smallBosses: ["minecraft:magma_cube", "minecraft:blaze", "minecraft:wither_skeleton"],
            mediumBosses: ["minecraft:magma_cube", "aether:fire_minion", "minecraft:wither_skeleton", "thermal:basalz"]
        },
        {
            id: "unitas",
            color: 0xd2b347,
            material: "sgjourney:unity_shard",
            small: [
                [["minecraft:husk", 4], ["ad_astra:sulfur_creeper", 2]],
                [["minecraft:husk", 6], ["midnight:nova", 2], ["midnight:crystal_bug", 2]]
            ],
            medium: [
                [["minecraft:husk", 4], ["ad_astra:sulfur_creeper", 2]],
                [["minecraft:husk", 6], ["midnight:nova", 2]],
                [["midnight:crystal_bug", 4], ["undergarden:scintling", 3]],
                [["minecraft:husk", 7], ["species:quake", 1]],
                [["ad_astra:sulfur_creeper", 4], ["midnight:nova", 3]],
                [["midnight:crystal_bug", 5], ["minecraft:enderman", 2]]
            ],
            smallBosses: ["minecraft:husk", "midnight:nova", "species:quake"],
            mediumBosses: ["minecraft:husk", "ad_astra:sulfur_creeper", "midnight:nova", "species:quake"]
        }
    ];

    for (let config of gatewayConfigs) {
        let dimension = `sgjourney:${config.id}`;
        createS4SmallMythicGateway(`sdbf_sgj_${config.id}_g1`, config.color, {
            normalWaves: config.small,
            bossIds: config.smallBosses.map(entity => bossId(config.id, entity)),
            perWave: smallRewards(config.material),
            jadeRewards: smallJades(),
            completion: { "slashblade:proudsoul": 6 }
        });

        createS4MediumMythicGateway(`sdbf_sgj_${config.id}_g2`, config.color, {
            normalWaves: config.medium,
            bossIds: config.mediumBosses.map(entity => bossId(config.id, entity)),
            perWave: mediumRewards(config.material),
            jadeRewards: mediumJades(),
            completion: { "slashblade:proudsoul": 5 },
            starChart: true
        });
    }
})