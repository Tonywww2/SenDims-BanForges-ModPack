ServerEvents.recipes(event => {

    event.shaped('kubejs:anchor_shard', [
        'ABC',
        'DED',
        ' D '
    ], {
        B: Item.of('productivebees:configurable_comb', '{EntityTag:{type:"productivebees:diamond"}}').weakNBT(),
        A: 'kubejs:multifaceted_ambrosia',
        C: 'ae2things:disk_housing',
        D: 'nuclearcraft:plate_basic',
        E: '#the_bumblezone:essence_items'
    }).keepIngredient('#the_bumblezone:essence_items')
        .id('sdbf:anchor_shard_s4')

})