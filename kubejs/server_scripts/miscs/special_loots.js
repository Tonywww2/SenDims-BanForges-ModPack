LootJS.modifiers(event => {
    let chestModifier = event.addLootTypeModifier(LootType.CHEST);

    event.addLootTypeModifier(
        LootType.UNKNOWN,
        LootType.BLOCK,
        LootType.ENTITY,
        LootType.CHEST,
        LootType.FISHING,
        LootType.GIFT,
        LootType.PIGLIN_BARTER,
        LootType.ADVANCEMENT_ENTITY,
        LootType.ADVANCEMENT_REWARD
    ).removeLoot(ItemFilter.POTION);

    event.addEntityLootModifier('final_samurai:samurai')
        .pool(p => {
            p.addLoot(LootEntry.of('slashblade:proudsoul_ingot').limitCount([2, 4]));
        })
        .pool(p => {
            p.addLoot(LootEntry.of($BloodJade.withKillCount(128)).limitCount([1, 2]));
        })
        .pool(p => {
            p.randomChance(0.4);
            p.addLoot(LootEntry.of('slashblade_useful_addon:proud_soul_sampling').limitCount([1, 2]));
        });

    event.addEntityLootModifier("terra_entity:skeletron")
        .addLoot('midnight:rift_placer')

    event.addEntityLootModifier("twilightforest:lich")
        .addLoot("minecraft:cherry_sapling")

    event.addEntityLootModifier("block_factorys_bosses:underworld_knight")
        .addLoot('block_factorys_bosses:underworld_arena_door')

    event.addEntityLootModifier("block_factorys_bosses:kraken")
        .addLoot('3x kubejs:mysterious_alkali_crystal')

    event.addEntityLootModifier("dog:devourer_head")
        .addLoot('deeprealm_4th:mimetic_star_slurry')

    event.addEntityLootModifier('nuclearcraft:feral_ghoul')
        .anyDimension(["undergarden:undergarden"])
        .pool(p => {
            p.randomChance(0.15);
            p.addLoot(LootEntry.of('nuclearcraft:uranium_nugget').limitCount([1, 2]));
        });
        
    event.addEntityLootModifier("minecraft:enderman")
        .anyDimension(["minecraft:the_end"])
        .pool(p => {
            p.randomChance(0.05);
            p.addLoot(LootEntry.of("minecraft:chorus_fruit").limitCount([1, 2]));
        });
        
    event.addEntityLootModifier("block_factorys_bosses:sandworm")
        .pool(p => {
            p.addLoot(LootEntry.of('kubejs:ancient_soul').limitCount([1, 2]));
        });


    event.addEntityLootModifier([
        'terra_entity:pixie',
        'terra_entity:possess_armor',
        'terra_entity:granite_elemental',
        'terra_entity:pink_jellyfish'
    ])
        .anyDimension(['sdbf:deep_realm_level_2'])
        .pool(p => {
            p.rolls(2);
            p.addLoot('kubejs:gamma_dust').randomChance(0.1);
        });

    event.addEntityLootModifier([
        "minecraft:enderman"
    ])
        .anyDimension(['sdbf:inside_the_end'])
        .pool(p => {
            p.rolls(2);
            p.addLoot('kubejs:alpha_dust').randomChance(0.02);
        });

    event.addLootTableModifier('dungeons_arise:chests/plague_asylum/plague_asylum_treasure')
        .randomChance(0.5)
        .addLoot('minecraft:structure_block')
        .modifyLoot('minecraft:structure_block', (stack) => {
            return getBladeStack(Utils.server.registryAccess(), "slashblade:diamond_sword")
        });

    event.addLootTableModifier('midnight:chests/forgotten_library')
        .randomChance(0.5)
        .addLoot('minecraft:structure_block')
        .modifyLoot('minecraft:structure_block', (stack) => {
            return getBladeStack(Utils.server.registryAccess(), "slashblade:winchester")
        });

    event.addLootTableModifier('midnight:chests/wetland_ruin_chest')
        .randomChance(0.5)
        .addLoot('minecraft:structure_block')
        .modifyLoot('minecraft:structure_block', (stack) => {
            return getBladeStack(Utils.server.registryAccess(), "slashblade:dojikiri_yasutsuna")
        });

    event.addLootTableModifier('apotheosis:chests/tome_tower')
        .addLoot('kubejs:ml_computing_ingot');

    event.addEntityLootModifier("netherman:guardian")
        .removeLoot(ItemFilter.ALWAYS_TRUE);

    event.addEntityLootModifier('netherman:manipulator')
        .removeLoot(ItemFilter.ALWAYS_TRUE);

    chestModifier.replaceLoot("#forge:seeds", 'slashblade:proudsoul_tiny', true);

    // 基础信息饰品、魔镜、幸运围巾及两件豆腐饰品按各箱子的概率独立判定，时运 II 附魔书使用三倍概率。
    let infoCurioLoot = [
        'terra_curio:compass', 'terra_curio:depth_meter', 'terra_curio:radar', 'terra_curio:dps_meter',
        'terra_curio:tally_counter', 'terra_curio:life_form_analyzer', 'terra_curio:metal_detector',
        'terra_curio:sextant', 'terra_curio:weather_radio', 'terra_curio:fishermans_pocket_guide',
        'terra_curio:stopwatch', 'terra_curio:magic_mirror', 'artifacts:lucky_scarf',
        'slashblade_sendims:tofu_miner_lantern', 'slashblade_sendims:tofu_hunter_knife'
    ];
    let tofuChestChances = [
        ['tofucraft:chests/tofu_village/tofu_village_chest', 0.030],
        ['tofucraft:chests/tofu_village/soyworker_chest', 0.030],
        ['tofucraft:chests/tofu_village/tofusmith_chest', 0.030],
        ['tofucraft:chests/tofu_ruins_chest', 0.045],
        ['tofucraft:chests/tofu_castle/tofu_castle_hidden_bridge', 0.060],
        ['tofucraft:chests/tofu_castle/tofu_castle_chest', 0.075]
    ];
    let fortuneBook = () => LootEntry.of(Item.of('minecraft:enchanted_book', '{StoredEnchantments:[{id:"minecraft:fortune",lvl:2s}]}'));
    tofuChestChances.forEach(entry => {
        let modifier = event.addLootTableModifier(entry[0]);
        infoCurioLoot.forEach(id => {
            modifier = modifier.pool(p => {
                p.randomChance(entry[1]);
                p.addLoot(id);
            });
        });
        modifier = modifier.pool(p => {
            p.randomChance(entry[1] * 3);
            p.addLoot(fortuneBook());
        });
    });

});

