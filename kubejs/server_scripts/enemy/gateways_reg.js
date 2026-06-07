ServerEvents.highPriorityData(event => {
    // ============================================================
    // 深渊一层 - 传送门1 (gateways:sdbf_dr1_g1)
    // 波次1-3：普通怪物递增，无Boss
    // 波次4：1个神话Boss
    // 波次5：2个神话Boss（终战）
    // ============================================================
    Gateway.customBuilder("gateways:sdbf_dr1_g1")
        .size("medium")
        .color(0x7B2D8B)
        .spawnRange(16)
        .leashRange(32)
        .allowDiscarding(false)
        .allowDimChange(false)
        .playerDamageOnly(false)
        .removeMobsOnFailure(true)
        .failOnOutOfBounds(true)
        .spacing(16)
        .followRangeBoost(32)
        .defaultDropChance(0)
        // ── 波次1：基础亡灵 ──
        // 僵尸×5  骷髅×3  蜘蛛×2
        // 生命+50%  攻击+2  移速+10%
        .addWave(wave => {
            wave.addEntity("minecraft:zombie", 5);
            wave.addEntity("minecraft:skeleton", 3);
            wave.addEntity("minecraft:spider", 2);
            wave.addAttribute("minecraft:generic.max_health", 0.5, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 2);
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1200);
            wave.setupTime(60);
            wave.addReward("minecraft:iron_ingot", 2);
            wave.addReward("minecraft:gold_ingot", 2);
            wave.addReward("minecraft:redstone", 2);
        })
        // ── 波次2：怪物种类增加 ──
        // 僵尸×7  骷髅×5  蜘蛛×3 
        // 生命+100%  攻击+3  移速+10%
        .addWave(wave => {
            wave.addEntity("minecraft:zombie", 7);
            wave.addEntity("minecraft:skeleton", 5);
            wave.addEntity("minecraft:spider", 3);
            wave.addEntity("species:ghoul", 2);
            wave.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 3);
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1400);
            wave.setupTime(60);
            wave.addReward("minecraft:iron_ingot", 4);
            wave.addReward("minecraft:gold_ingot", 2);
            wave.addReward("minecraft:redstone", 2);
        })
        // ── 波次3：普通怪物巅峰 ──
        // 僵尸×10  骷髅×7  蜘蛛×4  苦力怕×3  女巫×1
        // 生命+200%  攻击+5  移速+10%
        .addWave(wave => {
            wave.addEntity("minecraft:zombie", 10);
            wave.addEntity("minecraft:skeleton", 7);
            wave.addEntity("minecraft:spider", 4);
            wave.addEntity("species:ghoul", 3);
            wave.addEntity("minecraft:witch", 2);
            wave.addAttribute("minecraft:generic.max_health", 2.0, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 5);
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1600);
            wave.setupTime(60);
            wave.addReward("minecraft:iron_ingot", 8);
            wave.addReward("minecraft:gold_ingot", 4);
            wave.addReward("minecraft:redstone", 4);
        })
        // ── 波次4：首个神话Boss登场 ──
        // 1×神话Boss  僵尸×6  骷髅×4  苦力怕×2
        // 生命+100%  攻击+3  移速+10%
        .addWave(wave => {
            wave.addApotheosisBoss();

            wave.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 3);
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1800);
            wave.setupTime(100);
            wave.addReward("minecraft:iron_ingot", 8);
            wave.addReward("minecraft:gold_ingot", 8);
            wave.addReward("minecraft:diamond", 1);
            wave.addReward("minecraft:redstone", 4);
        })
        // ── 波次5：双Boss终战 ──
        // 2×神话Boss  僵尸×6  骷髅×4  苦力怕×2
        // 生命+100%  攻击+3  移速+10%
        .addWave(wave => {
            wave.addApotheosisBoss();
            wave.addApotheosisBoss();

            wave.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 3);
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(2000);
            wave.setupTime(100);
            wave.addReward("minecraft:iron_ingot", 12);
            wave.addReward("minecraft:gold_ingot", 12);
            wave.addReward("minecraft:diamond", 2);
            wave.addReward("minecraft:redstone", 8);
        })
        // ── 完成奖励 ──
        .addReward("slashblade:proudsoul", 2)
        .register();
})
