// 参考下界神话首领门：三波，每波一个 Apotheosis 首领。
ServerEvents.highPriorityData(event => {
    let registerBossGateway = (id, color, waves, completion) => {
        let builder = Gateway.customBuilder(`gateways:${id}`)
            .size("medium").color(color)
            .spawnRange(16).leashRange(48)
            .allowDiscarding(false).allowDimChange(false).playerDamageOnly(false)
            .removeMobsOnFailure(true).failOnOutOfBounds(false)
            .spacing(16).followRangeBoost(32).defaultDropChance(0)
            .addAttribute("minecraft:generic.knockback_resistance", 0.9);

        waves.forEach(config => {
            builder.addWave(wave => {
                wave.addApotheosisBoss(config.boss);
                if (config.health > 0) wave.addAttribute("minecraft:generic.max_health", config.health, "multiply_total");
                if (config.attack > 0) wave.addAttribute("minecraft:generic.attack_damage", config.attack);
                wave.maxTime(config.maxTime);
                wave.setupTime(config.setupTime);
                Object.entries(config.rewards).forEach(([item, count]) => wave.addReward(item, count));
                wave.addExperienceReward(config.experience, 10);
            });
        });

        Object.entries(completion).forEach(([item, count]) => builder.addReward(item, count));
        builder.register();
    };

    // S3 末地：沿用末地首领池，直接宝石尘总计 2 个。
    registerBossGateway("sdbf_end_g1", 0x8054a3, [
        {
            boss: "apotheosis:the_end/endermite",
            health: 0, attack: 0, maxTime: 2200, setupTime: 100,
            rewards: { "slashblade:proudsoul_ingot": 1, "minecraft:ender_pearl": 4 },
            experience: 90
        },
        {
            boss: "sdbf:the_end/minecraft_husk",
            health: 0.25, attack: 1, maxTime: 2600, setupTime: 100,
            rewards: { "slashblade:proudsoul_ingot": 2, "minecraft:popped_chorus_fruit": 4, "apotheosis:gem_dust": 1 },
            experience: 120
        },
        {
            boss: "apotheosis:the_end/enderman",
            health: 0.5, attack: 2, maxTime: 3000, setupTime: 120,
            rewards: { "slashblade:proudsoul_sphere": 1, "minecraft:shulker_shell": 1 },
            experience: 150
        }
    ], { "tetra:geode": 2, "apotheosis:gem_dust": 1 });

    // S4 小行星带：该阶段已有钴、铂和奇异物质加工路线，直接宝石尘总计 3 个。
    registerBossGateway("sdbf_asteroid_g1", 0x718b9a, [
        {
            boss: "sdbf:asteroid_belt/minecraft_zombie",
            health: 0.25, attack: 1, maxTime: 2400, setupTime: 100,
            rewards: { "slashblade:proudsoul_ingot": 2, "nuclearcraft:cobalt_ingot": 2 },
            experience: 120
        },
        {
            boss: "sdbf:asteroid_belt/terra_entity_meteor_head",
            health: 0.5, attack: 2, maxTime: 2800, setupTime: 120,
            rewards: { "slashblade:proudsoul_ingot": 3, "nuclearcraft:platinum_ingot": 1, "apotheosis:gem_dust": 1 },
            experience: 180
        },
        {
            boss: "sdbf:asteroid_belt/terra_entity_wyvern",
            health: 0.75, attack: 3, maxTime: 3200, setupTime: 120,
            rewards: { "slashblade:proudsoul_sphere": 2, "kubejs:bizarre_matter_dust": 1, "apotheosis:gem_dust": 1 },
            experience: 240
        }
    ], { "tetra:geode": 3, "apotheosis:gem_dust": 1 });
});
