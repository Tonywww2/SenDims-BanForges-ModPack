// priority: 0
StartupEvents.registry('item', event => {
    event.create('yakuman_forging_soul')
        .rarity('rare')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_forging_soul')
        .tag('kubejs:yakuman_materials');
});
