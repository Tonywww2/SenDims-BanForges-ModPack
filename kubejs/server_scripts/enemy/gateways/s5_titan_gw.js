ServerEvents.highPriorityData(event => {
    let registerTitanGateway = config => {
        createS5Gateway({
            id: config.id, size: config.size, color: config.color,
            rewardTier: config.id.slice(-2),
            waves: config.waves.map(entry => ({
                entities: entry.entities ? entry.entities.map(([entity, count]) => [`titan_moon:${entity}`, count]) : null,
                boss: entry.boss ? `sdbf:titan/titan_moon_${entry.boss}` : null,
                health: entry.health, attack: entry.attack, time: entry.time
            }))
        });
    };

    // 五波巢群清剿：本地生物材料补给，最后一波为神话托林织体蛛。
    registerTitanGateway({
        id: "sdbf_titan_g1", size: "small", color: 0xb57c42,
        waves: [
            { entities: [["tholin_weaver", 3], ["ammonia_stalker", 2]], health: 0, attack: 0, time: 2200 },
            { entities: [["tholin_weaver", 4], ["cryo_scavenger", 2]], health: 0.05, attack: 0.025, time: 2400 },
            { entities: [["ammonia_stalker", 3], ["tholin_weaver", 3]], health: 0.10, attack: 0.05, time: 2600 },
            { entities: [["tholin_weaver", 4], ["ammonia_stalker", 3], ["cryo_scavenger", 2]], health: 0.15, attack: 0.075, time: 2800 },
            { boss: "tholin_weaver", health: 0.25, attack: 0.05, time: 3200 }
        ]
    });

    // 八波勘探远征：远近程混编，第 4 / 8 波为寄生探测器首领检查点。
    registerTitanGateway({
        id: "sdbf_titan_g2", size: "medium", color: 0x7a9f9b,
        waves: [
            { entities: [["corrupted_probe", 3], ["ammonia_stalker", 2]], health: 0.10, attack: 0.025, time: 2400 },
            { entities: [["corrupted_probe", 4], ["tholin_weaver", 2]], health: 0.15, attack: 0.025, time: 2600 },
            { entities: [["corrupted_probe", 4], ["ammonia_stalker", 3]], health: 0.20, attack: 0.05, time: 2800 },
            { boss: "corrupted_probe", health: 0.25, attack: 0.05, time: 3200 },
            { entities: [["corrupted_probe", 4], ["tholin_weaver", 3], ["cryo_scavenger", 2]], health: 0.30, attack: 0.075, time: 3000 },
            { entities: [["corrupted_probe", 5], ["ammonia_stalker", 3]], health: 0.35, attack: 0.075, time: 3200 },
            { entities: [["corrupted_probe", 5], ["tholin_weaver", 3], ["ammonia_stalker", 2]], health: 0.40, attack: 0.10, time: 3400 },
            { boss: "corrupted_probe", entities: [["ammonia_stalker", 2]], health: 0.50, attack: 0.10, time: 4000 }
        ]
    });

    // 四波神话猎杀：四类土卫六首领各一只，不叠加原生冰虫等世界首领。
    registerTitanGateway({
        id: "sdbf_titan_g3", size: "large", color: 0x8ecbd8,
        waves: [
            { boss: "cryo_scavenger", health: 0.25, attack: 0.05, time: 3200 },
            { boss: "tholin_weaver", health: 0.40, attack: 0.075, time: 3600 },
            { boss: "corrupted_probe", health: 0.55, attack: 0.10, time: 4000 },
            { boss: "ammonia_stalker", health: 0.75, attack: 0.125, time: 4400 }
        ]
    });
});
