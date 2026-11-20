// priority: 0
// 终焉城堡：召唤暮刃守卫的材料，以及可以手动破坏的荆棘。
// 设计见 docs/development/终焉城堡内容设计-2026-11-18.md 第 5 节、暮色森林流程重做-调查与设计-2026-11-18.md 6.7。
// 贴图由 docs/tools/draw_final_castle_textures.py 生成。

StartupEvents.registry('item', event => {
    ['yellow', 'blue', 'pink', 'violet'].forEach(color => {
        event.create(`castle_rune_shard_${color}`).rarity('uncommon');
    });
    event.create('castle_echo').rarity('uncommon');
    event.create('finale_sigil').rarity('rare').maxStackSize(16);
});

StartupEvents.registry('block', event => {
    event.create('finale_rune_core')
        .soundType('stone')
        .hardness(3.0)
        .resistance(6.0)
        .lightLevel(0.5)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe');
});

// 原版荆棘硬度 50；破坏时不再长新荆棘由特供模组处理（ThornsBlockMixin）。
let FINAL_CASTLE_THORN_HARDNESS = 3.0;

BlockEvents.modification(event => {
    ['twilightforest:brown_thorns', 'twilightforest:green_thorns'].forEach(id => {
        event.modify(id, block => {
            block.destroySpeed = FINAL_CASTLE_THORN_HARDNESS;
        });
    });
});
