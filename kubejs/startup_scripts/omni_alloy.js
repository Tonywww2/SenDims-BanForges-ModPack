// priority: 50
// Generated material catalog: python -X utf8 kubejs/tools/implement_omni_alloy.py
global.sdbfOmniAlloy = JsonIO.read('kubejs/config/omni_alloy.json');
if (!global.sdbfOmniAlloy) throw new Error('Missing kubejs/config/omni_alloy.json');

StartupEvents.registry('block', event => {
    let catalog = global.sdbfOmniAlloy.registrations.blocks;
    Object.keys(catalog).forEach(id => {
        event.create(id).soundType('stone').hardness(1.5).resistance(3.0)
            .textureAll('minecraft:block/amethyst_block');
    });
});

StartupEvents.registry('item', event => {
    let registry = global.sdbfOmniAlloy.registrations;
    Object.keys(registry.items).forEach(id => {
        event.create(id).fireResistant().rarity(id.indexOf('omni_') === -1 ? 'epic' : 'rare');
    });
});

StartupEvents.registry('fluid', event => {
    let catalog = global.sdbfOmniAlloy.registrations.fluids;
    Object.keys(catalog).forEach(id => {
        let color = parseInt(catalog[id].color, 16);
        event.create(id).thickTexture(color).bucketColor(color);
    });
});
