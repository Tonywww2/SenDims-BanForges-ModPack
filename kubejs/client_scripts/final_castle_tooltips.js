// 终焉城堡召唤材料的说明（设计见 docs/development/终焉城堡内容设计-2026-11-18.md 第 5 节）
ItemEvents.tooltip(event => {
    ['yellow', 'blue', 'pink', 'violet'].forEach(color => {
        event.add(`kubejs:castle_rune_shard_${color}`, Text.translatable('tooltip.kubejs.castle_rune_shard').gray());
    });
    event.add('kubejs:castle_echo', Text.translatable('tooltip.kubejs.castle_echo').gray());
    event.add('kubejs:finale_sigil', Text.translatable('tooltip.kubejs.finale_sigil').gray());
    event.add('kubejs:finale_rune_core', Text.translatable('tooltip.kubejs.finale_rune_core').gray());
});
