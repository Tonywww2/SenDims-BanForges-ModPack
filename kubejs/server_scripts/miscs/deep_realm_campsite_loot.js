// 深境1层的宝箱怪营地（sdbf:deep_realm_1/campsite）：箱子额外加入大量粗矿（原版与热力）和破碎的耀魂。
// 只作用于深境1层的营地箱子，主世界营地不变。最终分布表见 docs/kubejs/deep-realm-campsite-loot-2026-11-10.md。
let deepRealmCampsiteStack = (id, weight, min, max) => LootEntry.of(id)
    .customFunction({ function: 'minecraft:set_count', count: { type: 'minecraft:uniform', min: min, max: max } })
    .withWeight(weight);

LootJS.modifiers(event => {
    event.addLootTableModifier('artifacts:chests/campsite_chest')
        .anyDimension('sdbf:deep_realm_level_1')
        // 粗矿：4～6 次加权抽取，可重复
        .addWeightedLoot([4, 6], true, [
            deepRealmCampsiteStack('minecraft:raw_iron', 3, 8, 24),
            deepRealmCampsiteStack('minecraft:raw_copper', 3, 8, 24),
            deepRealmCampsiteStack('minecraft:raw_gold', 2, 6, 16),
            deepRealmCampsiteStack('thermal:raw_tin', 2, 8, 20),
            deepRealmCampsiteStack('thermal:raw_lead', 2, 8, 20),
            deepRealmCampsiteStack('thermal:raw_silver', 2, 6, 16),
            deepRealmCampsiteStack('thermal:raw_nickel', 2, 6, 16)
        ])
        // 破碎的耀魂：每箱必出 4～12 个
        .addLoot(deepRealmCampsiteStack('slashblade:proudsoul_tiny', 1, 4, 12));
});
