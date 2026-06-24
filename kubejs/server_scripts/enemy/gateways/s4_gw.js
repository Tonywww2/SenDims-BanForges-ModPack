ServerEvents.highPriorityData(event => {
    let jade = $BloodJade.withKillCount(200);
    let jade2 = $BloodJade.withKillCount(200);
    jade2.setCount(2);
    let jade4 = $BloodJade.withKillCount(200);
    jade4.setCount(4);
    let jade8 = $BloodJade.withKillCount(200);
    jade8.setCount(8);

    Gateway.customBuilder("gateways:sdbf_sr_ayeti")
        .size("large")
        .color(0xF0FFFE)
        .spawnRange(16)
        .leashRange(64)
        .allowDiscarding(false)
        .allowDimChange(false)
        .playerDamageOnly(false)
        .removeMobsOnFailure(true)
        .failOnOutOfBounds(false)
        .spacing(16)
        .followRangeBoost(32)
        .defaultDropChance(0)
        .addAttribute("minecraft:generic.knockback_resistance", 0.9)
        .addWave(wave => {
            wave.addEntity("twilightforest:yeti", 5);
            wave.addAttribute("minecraft:generic.max_health", -0.5, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", -0.45, "multiply_total");
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1200);
            wave.setupTime(60);
            wave["addStackListReward(java.util.List)"]([jade]);
            wave.addReward('tetra:geode', 12);
        })
        .addWave(wave => {
            wave.addEntity("twilightforest:yeti", 12);
            wave.addAttribute("minecraft:generic.max_health", -0.4, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", -0.4, "multiply_total");
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1400);
            wave.setupTime(20);
            wave["addStackListReward(java.util.List)"]([jade2]);
            wave.addReward('tetra:geode', 24);
        })
        .addWave(wave => {
            wave.addEntity("twilightforest:alpha_yeti", 1);
            wave.addAttribute("minecraft:generic.max_health", -0.5, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", -0.1, "multiply_total");
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1600);
            wave.setupTime(20);
            wave["addStackListReward(java.util.List)"]([jade4]);
            wave.addReward('tetra:geode', 36);
        })
        .addWave(wave => {
            wave.addEntity("twilightforest:alpha_yeti", 1);
            wave.addAttribute("minecraft:generic.max_health", 0.5, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 0.1, "multiply_total");
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(3200);
            wave.setupTime(60);
            wave["addStackListReward(java.util.List)"]([jade8]);
            wave.addReward('tetra:geode', 36);
        })
        // ── 完成奖励 ──
        .addReward("slashblade:proudsoul", 24)
        .register();

    Gateway.customBuilder("gateways:sdbf_sr_kp")
        .size("large")
        .color(0xCFCFCF)
        .spawnRange(16)
        .leashRange(64)
        .allowDiscarding(false)
        .allowDimChange(false)
        .playerDamageOnly(false)
        .removeMobsOnFailure(true)
        .failOnOutOfBounds(false)
        .spacing(16)
        .followRangeBoost(32)
        .defaultDropChance(0)
        .addAttribute("minecraft:generic.knockback_resistance", 0.9)
        .addWave(wave => {
            wave.addEntity("twilightforest:lower_goblin_knight", 5);
            wave.addEntity("twilightforest:pinch_beetle", 3);
            wave.addAttribute("minecraft:generic.max_health", 0.5, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 0.1, "multiply_total");
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1200);
            wave.setupTime(60);
            wave["addStackListReward(java.util.List)"]([jade]);
            wave.addReward('tetra:geode', 12);
        })
        .addWave(wave => {
            wave.addEntity("twilightforest:lower_goblin_knight", 6);
            wave.addEntity("twilightforest:pinch_beetle", 3);
            wave.addEntity("twilightforest:helmet_crab", 4);
            wave.addEntity("twilightforest:blockchain_goblin", 4);
            wave.addAttribute("minecraft:generic.max_health", 1.0, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 0.2, "multiply_total");
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1400);
            wave.setupTime(20);
            wave["addStackListReward(java.util.List)"]([jade2]);
            wave.addReward('tetra:geode', 24);
        })
        .addWave(wave => {
            wave.addEntity("twilightforest:knight_phantom", 3);
            wave.addAttribute("minecraft:generic.max_health", -0.5, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", -0.1, "multiply_total");
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(1600);
            wave.setupTime(20);
            wave["addStackListReward(java.util.List)"]([jade4]);
            wave.addReward('tetra:geode', 36);
        })
        .addWave(wave => {
            wave.addEntity("twilightforest:knight_phantom", 6);
            wave.addAttribute("minecraft:generic.max_health", 0.1, "multiply_total");
            wave.addAttribute("minecraft:generic.attack_damage", 0.1, "multiply_total");
            wave.addAttribute("minecraft:generic.movement_speed", 0.1, "multiply_total");
            wave.maxTime(3200);
            wave.setupTime(60);
            wave["addStackListReward(java.util.List)"]([jade8]);
            wave.addReward('tetra:geode', 36);
        })
        // ── 完成奖励 ──
        .addReward("slashblade:proudsoul", 24)
        .register();

})