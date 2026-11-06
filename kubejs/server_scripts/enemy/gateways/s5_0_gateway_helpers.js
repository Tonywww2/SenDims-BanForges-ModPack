// priority: 50
// 完整通关耀魂为 SG 同档门的 1.2 倍并四舍五入；深四复用整套补给。
let s5GatewayRewardProfile = tier => {
    let profiles = {
        g1: {
            waves: 5,
            rewards: {
                "slashblade:proudsoul_ingot": [2, 2, 2, 2, 0],
                "slashblade:proudsoul_sphere": [0, 0, 2, 3, 5],
                "apotheosis:mythic_material": [0, 0, 0, 0, 1],
                "apotheosis:epic_material": [1, 1, 1, 2, 2],
                "titan_moon:meteoric_iron_ingot": [2, 2, 3, 3, 4],
                "titan_moon:cryo_carapace": [1, 2, 2, 3, 4],
                "titan_moon:tholin_fibre": [2, 2, 2, 2, 4]
            },
            completion: {
                "slashblade:proudsoul_sphere": 4,
                "apotheosis:mythic_material": 1,
                "apotheosis:epic_material": 1,
                "apotheosis:gem_dust": 2
            }
        },
        g2: {
            waves: 8,
            rewards: {
                "slashblade:proudsoul_ingot": [1, 1, 2, 2, 1, 1, 2, 2],
                "slashblade:proudsoul_sphere": [0, 0, 0, 3, 2, 3, 5, 8],
                "apotheosis:mythic_material": [0, 0, 0, 1, 0, 0, 1, 1],
                "apotheosis:epic_material": [1, 1, 1, 2, 1, 1, 2, 2],
                "titan_moon:precision_components": [0, 1, 1, 1, 1, 1, 1, 2],
                "titan_moon:depleted_battery": [1, 1, 1, 1, 1, 1, 1, 1],
                "titan_moon:meteoric_iron_ingot": [1, 1, 1, 1, 2, 2, 2, 2]
            },
            completion: {
                "slashblade:proudsoul_sphere": 7,
                "apotheosis:mythic_material": 1,
                "apotheosis:epic_material": 1,
                "apotheosis:gem_dust": 3,
                "titan_moon:polyphosphazene_coenzyme": 2
            },
            starChart: true
        },
        g3: {
            waves: 4,
            rewards: {
                "slashblade:proudsoul_ingot": [3, 3, 3, 3],
                "slashblade:proudsoul_sphere": [3, 5, 6, 7],
                "apotheosis:mythic_material": [1, 1, 1, 1],
                "apotheosis:epic_material": [1, 1, 2, 2],
                "apotheosis:gem_dust": [0, 1, 1, 0],
                "titan_moon:cryo_alloy_ingot": [1, 1, 1, 1]
            },
            completion: {
                "slashblade:proudsoul_sphere": 7,
                "apotheosis:mythic_material": 2,
                "apotheosis:epic_material": 2,
                "apotheosis:gem_dust": 2,
                "titan_moon:azotosome_sheet": 2
            },
            starChart: true
        }
    };
    if (!profiles[tier]) throw new Error(`Unknown S5 gateway reward tier: ${tier}`);
    return profiles[tier];
};

let createS5Gateway = config => {
    let profile = s5GatewayRewardProfile(config.rewardTier);
    if (config.waves.length !== profile.waves) throw new Error(`S5 gateway wave/reward mismatch: ${config.id}`);
    let builder = Gateway.customBuilder(`gateways:${config.id}`)
        .size(config.size).color(config.color)
        .spawnRange(12).leashRange(48)
        .allowDiscarding(false).allowDimChange(false).playerDamageOnly(false)
        .removeMobsOnFailure(true).failOnOutOfBounds(false)
        .spacing(16).followRangeBoost(32).defaultDropChance(0)
        .addAttribute("minecraft:generic.knockback_resistance", 0.5);
    config.waves.forEach((entry, index) => {
        builder.addWave(wave => {
            if (entry.entities) entry.entities.forEach(([entity, count]) => wave.addEntity(entity, count));
            if (entry.boss) wave.addApotheosisBoss(entry.boss);
            if (entry.health > 0) wave.addAttribute("minecraft:generic.max_health", entry.health, "multiply_total");
            if (entry.attack > 0) wave.addAttribute("minecraft:generic.attack_damage", entry.attack, "multiply_base");
            wave.addAttribute("minecraft:generic.movement_speed", 0.05, "multiply_total");
            wave.maxTime(entry.time);
            wave.setupTime(entry.boss ? 120 : 80);
            Object.entries(profile.rewards).forEach(([item, counts]) => {
                if (counts[index] > 0) wave.addReward(item, counts[index]);
            });
            wave.addExperienceReward(entry.boss ? 300 : 120, 10);
        });
    });
    Object.entries(profile.completion).forEach(([item, count]) => builder.addReward(item, count));
    if (profile.starChart) builder.addLootTableReward("kubejs:rewards/star_chart_fragment", 1, "item.kubejs.star_chart_fragment");
    builder.register();
};
