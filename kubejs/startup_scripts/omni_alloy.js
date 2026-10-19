// priority: 50
// Generated material catalog: python -X utf8 kubejs/tools/implement_omni_alloy.py
global.sdbfOmniAlloy = JsonIO.read('kubejs/config/omni_alloy.json');
if (!global.sdbfOmniAlloy) throw new Error('Missing kubejs/config/omni_alloy.json');

StartupEvents.registry('block', event => {
    let catalog = global.sdbfOmniAlloy.registrations.blocks;
    Object.keys(catalog).forEach(id => {
        event.create(id).soundType('stone').hardness(1.5).resistance(3.0)
            .textureAll(catalog[id].texture);
    });
});

StartupEvents.registry('item', event => {
    let registry = global.sdbfOmniAlloy.registrations;
    Object.keys(registry.items).forEach(id => {
        event.create(id).fireResistant().rarity(id.indexOf('omni_') === -1 ? 'epic' : 'rare')
            .texture(registry.items[id].texture);
    });
});

StartupEvents.registry('fluid', event => {
    let catalog = global.sdbfOmniAlloy.registrations.fluids;
    Object.keys(catalog).forEach(id => {
        let spec = catalog[id];
        let fluid = event.create(id).stillTexture(spec.still_texture)
            .flowingTexture(spec.flowing_texture).color(0xFFFFFF).bucketColor(0xFFFFFF);
        fluid.bucketItem.parentModel('minecraft:item/generated').texture(spec.bucket_texture);
    });
});
