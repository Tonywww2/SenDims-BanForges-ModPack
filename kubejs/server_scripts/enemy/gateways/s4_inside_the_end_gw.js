ServerEvents.highPriorityData(event => {
    let bossId = entity => `sdbf:inside_the_end/${entity.replace(':', '_')}`;
    let jadeReward = count => {
        let stack = $BloodJade.withKillCount(200);
        stack.setCount(count);
        return stack;
    };

    // S4 五波守军战：两波甲卫与末影螨，后三波依次挑战近战、突击与驻守首领。
    createS4SmallMythicGateway('sdbf_inside_end_g1', 0x8b74c6, {
        normalWaves: [
            [['terra_entity:possess_armor', 3], ['minecraft:endermite', 3]],
            [['terra_entity:possess_armor', 4], ['minecraft:endermite', 4]]
        ],
        bossIds: [
            'terra_entity:possess_armor', 'minecraft:vindicator', 'minecraft:shulker'
        ].map(bossId),
        perWave: {
            'slashblade:proudsoul_ingot': [3, 4, 0, 0, 0],
            'slashblade:proudsoul_sphere': [0, 0, 2, 3, 4],
            'tetra:geode': [4, 7, 9, 10, 10],
            'apotheosis:epic_material': [1, 1, 2, 2, 2],
            'apotheosis:mythic_material': [0, 0, 1, 1, 3],
            'apotheosis:gem_dust': [0, 0, 0, 1, 1],
            'draconicevolution:draconium_dust': [1, 1, 2, 2, 2],
            'minecraft:ender_pearl': [2, 3, 4, 5, 6]
        },
        jadeRewards: [1, 1, 2, 3, 4].map(jadeReward),
        completion: {
            'slashblade:proudsoul_sphere': 3,
            'minecraft:shulker_shell': 1
        }
    });

    // S4 十波远征：幽灵与甲卫混编，第 5/7/9/10 波依次为螨、幽灵、唤魔者、飞龙首领。
    createS4MediumMythicGateway('sdbf_inside_end_g2', 0x34c5ba, {
        normalWaves: [
            [['minecraft:endermite', 5], ['terra_entity:ghost', 2]],
            [['terra_entity:possess_armor', 4], ['terra_entity:ghost', 2]],
            [['minecraft:endermite', 6], ['terra_entity:ghost', 3]],
            [['terra_entity:possess_armor', 4], ['terra_entity:ghost', 4]],
            [['minecraft:endermite', 4], ['terra_entity:ghost', 3], ['minecraft:evoker', 1]],
            [['minecraft:endermite', 4], ['terra_entity:ghost', 4], ['minecraft:vindicator', 4]]
        ],
        bossIds: [
            'minecraft:endermite', 'terra_entity:ghost', 'minecraft:evoker', 'terra_entity:wyvern'
        ].map(bossId),
        perWave: {
            'slashblade:proudsoul_ingot': [2, 2, 3, 3, 0, 0, 0, 0, 0, 0],
            'slashblade:proudsoul_sphere': [0, 0, 0, 0, 2, 2, 3, 3, 4, 4],
            'tetra:geode': [2, 3, 3, 4, 4, 4, 5, 5, 5, 5],
            'apotheosis:epic_material': [0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            'apotheosis:mythic_material': [0, 0, 0, 0, 1, 0, 1, 0, 1, 2],
            'apotheosis:gem_dust': [0, 0, 0, 0, 1, 0, 0, 0, 1, 1],
            'draconicevolution:draconium_dust': [1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
            'minecraft:popped_chorus_fruit': [1, 2, 2, 2, 2, 2, 2, 2, 2, 3]
        },
        jadeRewards: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2].map(jadeReward),
        completion: {
            'slashblade:proudsoul_sphere': 5,
            'minecraft:shulker_shell': 2
        },
        starChart: true
    });
});
