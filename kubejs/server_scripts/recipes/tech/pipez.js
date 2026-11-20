// Pipez 管道配方：移除原配方后重新添加，降低单次产量。
// 物品管道中心的红石换成漏斗，产量 4；流体、能量管道沿用原图案，产量 6；通用管道沿用原图案，产量 3。
ServerEvents.recipes(event => {
    ['item_pipe', 'fluid_pipe', 'energy_pipe', 'universal_pipe'].forEach(pipe => event.remove({ id: `pipez:${pipe}` }));

    event.shaped(Item.of('pipez:item_pipe', 4), [
        'III',
        'DHD',
        'III'
    ], {
        I: '#forge:ingots/iron',
        D: 'minecraft:dropper',
        H: 'minecraft:hopper'
    }).id('sdbf:pipez/item_pipe');

    event.shaped(Item.of('pipez:fluid_pipe', 6), [
        'III',
        'BRB',
        'III'
    ], {
        I: '#forge:ingots/iron',
        B: 'minecraft:bucket',
        R: '#forge:dusts/redstone'
    }).id('sdbf:pipez/fluid_pipe');

    event.shaped(Item.of('pipez:energy_pipe', 6), [
        'III',
        'BRB',
        'III'
    ], {
        I: '#forge:ingots/iron',
        B: '#forge:storage_blocks/redstone',
        R: '#forge:dusts/redstone'
    }).id('sdbf:pipez/energy_pipe');

    event.shaped(Item.of('pipez:universal_pipe', 3), [
        'IEF',
        'MRM',
        'IEF'
    ], {
        I: 'pipez:item_pipe',
        E: 'pipez:energy_pipe',
        F: 'pipez:fluid_pipe',
        R: '#forge:storage_blocks/redstone',
        M: '#forge:ingots/iron'
    }).id('sdbf:pipez/universal_pipe');
});
