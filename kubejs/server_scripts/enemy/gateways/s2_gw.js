ServerEvents.highPriorityData(event => {
    createMythicGateway("sdbf_dr1_g1", 0x007013, {
        normals: ["minecraft:zombie", "minecraft:skeleton", "minecraft:spider"],
        waveCounts: [[5, 3, 2], [7, 5, 3], [10, 7, 4]],
        extras: {
            2: [["species:ghoul", 2]],
            3: [["species:ghoul", 3], ["minecraft:witch", 2]],
        },
        bossIds: ["sdbf:deep_realm_1/terra_entity_giant_shelly", "sdbf:deep_realm_1/terra_entity_giant_shelly", "sdbf:deep_realm_1/terra_entity_tomb_crawler"],
        rewards: {
            "minecraft:iron_ingot": 20,    // 总量20，自动分配 → [2,2,4,4,8]
            "minecraft:gold_ingot": 20,
            "minecraft:redstone": 20,
            "minecraft:diamond": 1,        // 总量1  → [0,0,0,0,1]（仅波次5）
        },
        perWave: { 'slashblade:proudsoul_tiny': [1, 2, 3, 3, 0] },  // 波次5不发
        completion: { "slashblade:proudsoul": 2, "tetra:geode": 2, 'apotheosis:gem_dust': 2 },
    });

    createBossGateway("sdbf_dr1_g2", 0x4d0000, {
        waves: [
            [["terra_entity:possess_armor", 6], ["cataclysm:the_watcher", 5]],
            [["terra_entity:possess_armor", 9], ["cataclysm:the_watcher", 8]],
            [["cataclysm:the_watcher", 8], ["cataclysm:the_prowler", 1]],
            [["cataclysm:the_watcher", 9], ["cataclysm:the_prowler", 3]],
        ],
        boss: ["cataclysm:the_harbinger", 1],
        rewards: { "minecraft:iron_ingot": 34 },   // → [2,4,8,8,12]
        perWave: { 'slashblade:proudsoul_tiny': [2, 3, 4, 4, 4] },
        completion: { "slashblade:proudsoul": 2, "tetra:geode": 3, 'apotheosis:gem_dust': 2 },
    });

    createMythicGateway("sdbf_moon_g1", 0x8c8c8c, {
        normals: ['minecraft:zombie', 'ad_astra:corrupted_lunarian', 'minecraft:stray'],
        waveCounts: [[5, 3, 2], [7, 5, 3], [10, 7, 4]],
        extras: {
            2: [["minecraft:spider", 2]],
            3: [["minecraft:spider", 3], ['ad_astra:star_crawler', 2]],
        },
        bossIds: ["sdbf:moon/ad_astra_corrupted_lunarian", "sdbf:moon/ad_astra_corrupted_lunarian", "sdbf:moon/ad_astra_star_crawler"],
        rewards: {
            'ad_astra:desh_ingot': 10,    // 总量20，自动分配 → [2,2,4,4,8]
            "minecraft:iron_ingot": 20,
            "minecraft:redstone": 20,
            "minecraft:diamond": 1,        // 总量1  → [0,0,0,0,1]（仅波次5）
        },
        perWave: { 'slashblade:proudsoul_tiny': [2, 3, 4, 4, 4] },  // 波次5不发
        completion: { "slashblade:proudsoul": 4, "tetra:geode": 2, 'apotheosis:gem_dust': 2 },
    });

    createMythicGateway("sdbf_nether_g1", 0xb01a1a, {
        normals: ['minecraft:zombified_piglin', 'terra_entity:demon_eye', 'minecraft:blaze'],
        waveCounts: [[5, 3, 2], [7, 5, 3], [10, 7, 4]],
        extras: {
            2: [['minecraft:zoglin', 2]],
            3: [['minecraft:zoglin', 3], ['minecraft:wither_skeleton', 2]],
        },
        bossIds: ["apotheosis:the_nether/piglin_brute", "apotheosis:the_nether/wither_skeleton", "apotheosis:the_nether/zombified_piglin"],
        rewards: {
            'minecraft:gold_ingot': 20,    // 总量20，自动分配 → [2,2,4,4,8]
            'minecraft:quartz': 40,
            'minecraft:blaze_rod': 10,
            'thermal:sulfur_block': 2,        // 总量1  → [0,0,0,0,1]（仅波次5）
        },
        perWave: { 'slashblade:proudsoul_tiny': [2, 3, 4, 4, 4] },  // 波次5不发
        completion: { "slashblade:proudsoul": 8, 'minecraft:netherite_scrap': 2, 'apotheosis:gem_dust': 2 },
    });

    createMythicGateway("sdbf_mars_g1", 0xff7070, {
        normals: ['ad_astra:martian_raptor', 'minecraft:husk', 'minecraft:phantom'],
        waveCounts: [[5, 3, 2], [7, 5, 3], [10, 7, 4]],
        extras: {
            2: [['minecraft:zoglin', 2]],
            3: [['minecraft:zoglin', 3], ['minecraft:wither_skeleton', 2]],
        },
        bossIds: ["sdbf:mars/ad_astra_martian_raptor", "sdbf:mars/ad_astra_martian_raptor", "sdbf:mars/ad_astra_star_crawler"],
        rewards: {
            'minecraft:gold_ingot': 20,    // 总量20，自动分配 → [2,2,4,4,8]
            'ad_astra:ostrum_ingot': 10,
            'minecraft:diamond': 10
        },
        perWave: { 'slashblade:proudsoul': [2, 3, 4, 4, 4] },  // 波次5不发
        completion: { "slashblade:proudsoul": 10, 'slashblade:proudsoul_ingot': 1, 'apotheosis:gem_dust': 2 },
    });

    // // ============================================================
    // // 深渊一层 - 传送门1 (gateways:sdbf_dr1_g1)
    // // 波次1-3：普通怪物递增，无Boss
    // // 波次4：1个神话Boss
    // // 波次5：2个神话Boss（终战）
    // // ============================================================
    // Gateway.customBuilder("gateways:sdbf_dr1_g1")
    //     .size("medium")
    //     .color(0x007013)
    //     .spawnRange(16)
    //     .leashRange(48)
    //     .allowDiscarding(false)
    //     .allowDimChange(false)
    //     .playerDamageOnly(false)
    //     .removeMobsOnFailure(true)
    //     .failOnOutOfBounds(true)
    //     .spacing(16)
    //     .followRangeBoost(32)
    //     .defaultDropChance(0)
    //     // ── 波次1：基础亡灵 ──
    //     // 僵尸×5  骷髅×3  蜘蛛×2
    //     // 生命+50%  攻击+2  移速+10%
    //     .addWave(wave => {
    //         wave.addEntity("minecraft:zombie", 5);
    //         wave.addEntity("minecraft:skeleton", 3);
    //         wave.addEntity("minecraft:spider", 2);
    //         wave.addAttribute("minecraft:generic.max_health", 0.5, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 2);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(1200);
    //         wave.setupTime(60);
    //         wave.addReward("minecraft:iron_ingot", 2);
    //         wave.addReward("minecraft:gold_ingot", 2);
    //         wave.addReward("minecraft:redstone", 2);
    //         wave.addReward('tetra:geode', 1);
    //     })
    //     // ── 波次2：怪物种类增加 ──
    //     // 僵尸×7  骷髅×5  蜘蛛×3 
    //     // 生命+100%  攻击+3  移速+10%
    //     .addWave(wave => {
    //         wave.addEntity("minecraft:zombie", 7);
    //         wave.addEntity("minecraft:skeleton", 5);
    //         wave.addEntity("minecraft:spider", 3);
    //         wave.addEntity("species:ghoul", 2);
    //         wave.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 3);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(1400);
    //         wave.setupTime(60);
    //         wave.addReward("minecraft:iron_ingot", 2);
    //         wave.addReward("minecraft:gold_ingot", 2);
    //         wave.addReward("minecraft:redstone", 2);
    //         wave.addReward('tetra:geode', 1);
    //     })
    //     // ── 波次3：普通怪物巅峰 ──
    //     // 僵尸×10  骷髅×7  蜘蛛×4  苦力怕×3  女巫×1
    //     // 生命+200%  攻击+5  移速+10%
    //     .addWave(wave => {
    //         wave.addEntity("minecraft:zombie", 10);
    //         wave.addEntity("minecraft:skeleton", 7);
    //         wave.addEntity("minecraft:spider", 4);
    //         wave.addEntity("species:ghoul", 3);
    //         wave.addEntity("minecraft:witch", 2);
    //         wave.addAttribute("minecraft:generic.max_health", 2.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 5);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(1600);
    //         wave.setupTime(60);
    //         wave.addReward("minecraft:iron_ingot", 4);
    //         wave.addReward("minecraft:gold_ingot", 4);
    //         wave.addReward("minecraft:redstone", 4);
    //         wave.addReward('tetra:geode', 1);
    //     })
    //     // ── 波次4：首个神话Boss登场 ──
    //     // 1×神话Boss  僵尸×6  骷髅×4  苦力怕×2
    //     // 生命+100%  攻击+3  移速+10%
    //     .addWave(wave => {
    //         wave.addApotheosisBoss();

    //         wave.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 3);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(1800);
    //         wave.setupTime(100);
    //         wave.addReward("minecraft:iron_ingot", 4);
    //         wave.addReward("minecraft:gold_ingot", 4);
    //         wave.addReward("minecraft:redstone", 4);
    //         wave.addReward('tetra:geode', 1);
    //     })
    //     // ── 波次5：双Boss终战 ──
    //     // 2×神话Boss  僵尸×6  骷髅×4  苦力怕×2
    //     // 生命+100%  攻击+3  移速+10%
    //     .addWave(wave => {
    //         wave.addApotheosisBoss();
    //         wave.addApotheosisBoss();

    //         wave.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 3);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(2000);
    //         wave.setupTime(100);
    //         wave.addReward("minecraft:iron_ingot", 8);
    //         wave.addReward("minecraft:gold_ingot", 8);
    //         wave.addReward("minecraft:diamond", 1);
    //         wave.addReward("minecraft:redstone", 8);
    //     })
    //     // ── 完成奖励 ──
    //     .addReward("slashblade:proudsoul", 2)
    //     .addReward('tetra:geode', 2)
    //     .register();

    // Gateway.customBuilder("gateways:sdbf_dr1_g2")
    //     .size("medium")
    //     .color(0x4d0000)
    //     .spawnRange(16)
    //     .leashRange(48)
    //     .allowDiscarding(false)
    //     .allowDimChange(false)
    //     .playerDamageOnly(false)
    //     .removeMobsOnFailure(true)
    //     .failOnOutOfBounds(true)
    //     .spacing(16)
    //     .followRangeBoost(32)
    //     .defaultDropChance(0)
    //     // ── 波次1：基础亡灵 ──
    //     // 僵尸×5  骷髅×3  蜘蛛×2
    //     // 生命+50%  攻击+2  移速+10%
    //     .addWave(wave => {
    //         wave.addEntity('terra_entity:possess_armor', 6);
    //         wave.addEntity('cataclysm:the_watcher', 5);

    //         wave.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 2);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(1200);
    //         wave.setupTime(60);
    //         wave.addReward("minecraft:iron_ingot", 2);
    //         wave.addReward('tetra:geode', 1);
    //     })
    //     // ── 波次2：怪物种类增加 ──
    //     // 僵尸×7  骷髅×5  蜘蛛×3 
    //     // 生命+100%  攻击+3  移速+10%
    //     .addWave(wave => {
    //         wave.addEntity('terra_entity:possess_armor', 9);
    //         wave.addEntity('cataclysm:the_watcher', 8);

    //         wave.addAttribute("minecraft:generic.max_health", 2.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 3);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(1400);
    //         wave.setupTime(60);
    //         wave.addReward("minecraft:iron_ingot", 4);
    //         wave.addReward('tetra:geode', 1);
    //     })
    //     // ── 波次3：普通怪物巅峰 ──
    //     // 僵尸×10  骷髅×7  蜘蛛×4  苦力怕×3  女巫×1
    //     // 生命+200%  攻击+5  移速+10%
    //     .addWave(wave => {
    //         wave.addEntity('cataclysm:the_watcher', 8);
    //         wave.addEntity('cataclysm:the_prowler', 1);

    //         wave.addAttribute("minecraft:generic.max_health", 2.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 5);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(1600);
    //         wave.setupTime(60);
    //         wave.addReward("minecraft:iron_ingot", 8);
    //         wave.addReward('tetra:geode', 2);
    //     })
    //     // ── 波次4：首个神话Boss登场 ──
    //     // 1×神话Boss  僵尸×6  骷髅×4  苦力怕×2
    //     // 生命+100%  攻击+3  移速+10%
    //     .addWave(wave => {
    //         wave.addEntity('cataclysm:the_watcher', 9);
    //         wave.addEntity('cataclysm:the_prowler', 3);

    //         wave.addAttribute("minecraft:generic.max_health", 2.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 3);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(1800);
    //         wave.setupTime(100);
    //         wave.addReward("minecraft:iron_ingot", 8);
    //         wave.addReward('tetra:geode', 2);
    //     })
    //     // ── 波次5：双Boss终战 ──
    //     // 2×神话Boss  僵尸×6  骷髅×4  苦力怕×2
    //     // 生命+100%  攻击+3  移速+10%
    //     .addWave(wave => {
    //         wave.addEntity('cataclysm:the_harbinger', 1);

    //         wave.addAttribute("minecraft:generic.max_health", 2.0, "multiply_total");
    //         wave.addAttribute("minecraft:generic.attack_damage", 3);
    //         wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
    //         wave.maxTime(2000);
    //         wave.setupTime(100);
    //         wave.addReward("minecraft:iron_ingot", 12);
    //         wave.addReward('tetra:geode', 3);
    //     })
    //     // ── 完成奖励 ──
    //     .addReward("slashblade:proudsoul", 2)
    //     .addReward('tetra:geode', 3)
    //     .register();
})
