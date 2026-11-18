// 异格材料：前期材料（本体）与后期材料（催化）合成的升级版。
// 设计与数值见 docs/development/异格材料设计草案-2026-11-17.md；Tetra 材料在 server_scripts/tetra/alter_tetras.js，配方在 server_scripts/recipes/alter_materials.js。
StartupEvents.registry('item', event => {
    // 成品
    let alterMaterials = ['alter_gold', 'alter_neptune', 'alter_ironwood', 'alter_phoenix', 'alter_blightbunny_fang', 'alter_diamond', 'alter_chorus', 'alter_netherite', 'alter_raven_feather', 'alter_rendium', 'alter_twin_star_stone', 'alter_tofu_core', 'alter_steel'];
    // 有序合成产出的异格坯（融合型直接锻打，突变型先在锻造台诱变）
    let alterBlanks = ['alter_gold_blank', 'alter_neptune_blank', 'alter_ironwood_blank', 'alter_phoenix_blank', 'alter_blightbunny_fang_blank', 'alter_diamond_blank', 'alter_chorus_blank', 'alter_netherite_blank', 'alter_raven_feather_blank', 'alter_rendium_blank', 'alter_twin_star_stone_blank', 'alter_tofu_core_blank'];
    // 突变型在锻造台诱变后的中间物，组合锻打后稳定为成品
    let alterUnstable = ['alter_blightbunny_fang_unstable', 'alter_chorus_unstable', 'alter_netherite_unstable', 'alter_raven_feather_unstable', 'alter_tofu_core_unstable'];
    alterMaterials.forEach(id => event.create(id).fireResistant().rarity('epic'));
    alterBlanks.forEach(id => event.create(id).fireResistant().rarity('rare'));
    alterUnstable.forEach(id => event.create(id).fireResistant().rarity('rare'));
});
