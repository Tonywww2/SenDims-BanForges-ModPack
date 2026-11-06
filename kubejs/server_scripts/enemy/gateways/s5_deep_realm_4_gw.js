ServerEvents.highPriorityData(event => {
    let branches = [
        {
            id: "arid", color: 0xd4a052,
            front: "minecraft:husk", support: "cataclysm:koboleton", reinforcement: "minecraft:skeleton",
            boss: "minecraft:husk", elite: "cataclysm:koboleton"
        },
        {
            id: "infernal", color: 0xd45b35,
            front: "minecraft:wither_skeleton", support: "thermal:basalz", reinforcement: "minecraft:blaze",
            boss: "minecraft:wither_skeleton", elite: "thermal:basalz"
        },
        {
            id: "woodland", color: 0x63a76a,
            front: "minecraft:vindicator", support: "twilightforest:redcap", reinforcement: "twilightforest:hostile_wolf",
            boss: "minecraft:vindicator", elite: "twilightforest:redcap_sapper"
        },
        {
            id: "oceanic", color: 0x46b1c8,
            front: "minecraft:drowned", support: "cataclysm:deepling", reinforcement: "cataclysm:deepling_priest",
            boss: "minecraft:drowned", elite: "cataclysm:deepling"
        }
    ];
    branches.forEach(branch => {
        let bossId = entity => `sdbf:deep_realm_4/${branch.id}/${entity.replace(':', '_')}`;
        // 四波混编清剿 + 一波神话首领。海洋线全部使用可在陆地行动的生物。
        createS5Gateway({
            id: `sdbf_dr4_${branch.id}_g1`, size: "small", color: branch.color, rewardTier: "g1",
            waves: [
                { entities: [[branch.front, 3], [branch.support, 2]], health: 0, attack: 0, time: 2400 },
                { entities: [[branch.front, 4], [branch.reinforcement, 2]], health: 0.05, attack: 0.025, time: 2600 },
                { entities: [[branch.support, 3], [branch.reinforcement, 3]], health: 0.10, attack: 0.05, time: 2800 },
                { entities: [[branch.front, 4], [branch.support, 3], [branch.reinforcement, 2]], health: 0.15, attack: 0.075, time: 3200 },
                { boss: bossId(branch.boss), health: 0.20, attack: 0.05, time: 3600 }
            ]
        });
        // 八波远征，第 4 / 8 波各一只本分支的神话首领；复用土卫六 G2 全套奖励。
        createS5Gateway({
            id: `sdbf_dr4_${branch.id}_g2`, size: "medium", color: branch.color, rewardTier: "g2",
            waves: [
                { entities: [[branch.front, 3], [branch.support, 2]], health: 0.10, attack: 0.025, time: 2600 },
                { entities: [[branch.support, 3], [branch.reinforcement, 3]], health: 0.15, attack: 0.025, time: 2800 },
                { entities: [[branch.front, 4], [branch.reinforcement, 3]], health: 0.20, attack: 0.05, time: 3000 },
                { boss: bossId(branch.elite), health: 0.25, attack: 0.05, time: 3600 },
                { entities: [[branch.front, 4], [branch.support, 3], [branch.reinforcement, 2]], health: 0.25, attack: 0.075, time: 3200 },
                { entities: [[branch.support, 4], [branch.reinforcement, 4]], health: 0.30, attack: 0.075, time: 3400 },
                { entities: [[branch.front, 4], [branch.support, 3], [branch.reinforcement, 3]], health: 0.35, attack: 0.10, time: 3800 },
                { boss: bossId(branch.boss), entities: [[branch.support, 2]], health: 0.40, attack: 0.10, time: 4400 }
            ]
        });
    });
});
