// 深境4层（deeprealm_4th:fourth_layer）内所有战利品箱子追加宝石加工剂。
// 按维度和容器类型判定，与战利品表来源无关：任何模组结构里的箱子、木桶、运输矿车等，在深4首次打开生成战利品时追加。
// 每箱期望：初阶 0.75 × 2 = 1.5 份，中阶 0.5 × 1 = 0.5 份。说明见 docs/kubejs/deep-realm-4-chest-agents-2026-11-13.md。
LootJS.modifiers(event => {
    event.addLootTypeModifier(LootType.CHEST)
        .anyDimension('deeprealm_4th:fourth_layer')
        // 初阶宝石加工剂：75% 出现，每次 1～3 份
        .pool(p => {
            p.randomChance(0.75);
            p.addLoot(LootEntry.of('kubejs:astral_gem_agent_low')
                .customFunction({ function: 'minecraft:set_count', count: { type: 'minecraft:uniform', min: 1, max: 3 } }));
        })
        // 中阶宝石加工剂：50% 出现，每次 1 份
        .pool(p => {
            p.randomChance(0.5);
            p.addLoot('kubejs:astral_gem_agent_mid');
        });
});
