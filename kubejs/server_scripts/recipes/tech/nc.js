ServerEvents.recipes(event => {

    event.shaped('3x nuclearcraft:plate_basic', [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: '#forge:dusts/graphite',
        B: '#forge:ingots/lead',
        C: 'integrateddynamics:crystalized_menril_block_slab'
    }).id('sdbf:plate_basic')

    event.custom({
        "type": "nuclearcraft:manufactory",
        "input": [
            Item.of('tofucraft:salt_block').toJson()
        ],
        "output": [
            Item.of('#forge:ingots/lithium').toJson()
        ],
        "powerModifier": 1.0, "radiation": 1.0, "timeModifier": 1.0
    }).id("sdbf:salt_lithium")

    event.custom({
        "type": "nuclearcraft:alloy_smelter",
        "input": [
            {
                "tag": 'forge:ingots/ostrum'
            },
            {
                "tag": "forge:ingots/lithium"
            }
        ],
        "output": [
            {
                "count": 2,
                "item": "nuclearcraft:tough_alloy_ingot"
            }
        ],
        "powerModifier": 1.5,
        "radiation": 1.0,
        "timeModifier": 1.7
    }).id("sdbf:tough_alloy_ingot")
})