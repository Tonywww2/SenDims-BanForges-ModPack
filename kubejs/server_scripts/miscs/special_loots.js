LootJS.modifiers(event => {
    let chestModifier = event.addLootTypeModifier(LootType.CHEST);

    event.addEntityLootModifier('final_samurai:samurai')
        .pool(p => {
            p.addLoot(LootEntry.of('slashblade:proudsoul_ingot').limitCount([2, 4]));
        })
        .pool(p => {
            p.addLoot(LootEntry.of($BloodJade.withKillCount(64)).limitCount([1, 2]));
        })
        .pool(p => {
            p.randomChance(0.3);
            p.addLoot(LootEntry.of('slashblade_useful_addon:proud_soul_sampling').limitCount([0, 1]));
        });

    event.addEntityLootModifier("terra_entity:skeletron")
        .addLoot('midnight:rift_placer')

    event.addEntityLootModifier("twilightforest:lich")
        .addLoot("minecraft:cherry_sapling")


    event.addEntityLootModifier([
        'terra_entity:pixie',
        'terra_entity:possess_armor',
        'terra_entity:grantite_elemental',
        'terra_entity:pink_jellyfish'
    ])
    .anyDimension(['sdbf:deep_realm_level_2'])
    .pool(p => {
        p.rolls(2);
        p.addLoot('kubejs:gamma_dust').randomChance(0.1);
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

    chestModifier.replaceLoot("#forge:seeds", 'slashblade:proudsoul_tiny', true);


});

