// Passive floor debris used by buried asteroid bases.
StartupEvents.registry('block', event => {
    event.create('asteroid_glass_shards')
        .displayName('Broken Glass Fragments')
        .soundType('glass').hardness(0.1).resistance(0.1)
        .noCollision().notSolid().box(0, 0, 0, 16, 2, 16)
        .renderType('translucent')
        .model('kubejs:block/asteroid_glass_shards');
});
