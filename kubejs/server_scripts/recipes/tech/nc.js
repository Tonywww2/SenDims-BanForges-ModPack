ServerEvents.recipes(event => {

    event.shapeless("tofucraft:salt_block", [
        '9x #forge:salt'
    ]).id("sdbf:salt_block")

    event.shapeless('nuclearcraft:glowing_mushroom', [
        '#forge:mushrooms',
        '2x #forge:dusts/glowstone'
    ]).id("sdbf:glowing_mushroom")

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

    event.shaped('nuclearcraft:decay_hastener', [
        'TBT',
        'TCT',
        'TAT'
    ], {
        B: '#forge:storage_blocks/diamond',  // 标签使用 # 前缀 / Tags use the # prefix
        T: '#forge:ingots/tough_alloy',    // 标签使用 # 前缀 / Tags use the # prefix
        C: '#forge:ingots/tin_silver',     // 标签使用 # 前缀 / Tags use the # prefix
        A: 'nuclearcraft:actuator'
    }).id('sdbf:decay_hastener')

    event.custom({
        "type": "nuclearcraft:alloy_smelter",
        "input": [
            {
                "tag": 'forge:ingots/ostrum'
            },
            {
                "tag": "forge:ingots/steel"
            }
        ],
        "output": [
            {
                "count": 2,
                "item": "nuclearcraft:ferroboron_ingot"
            }
        ],
        "powerModifier": 1.5,
        "radiation": 1.0,
        "timeModifier": 1.7
    }).id("sdbf:tough_alloy_ingot")

    event.custom({
        "type": "nuclearcraft:alloy_smelter",
        "input": [
            {
                "tag": 'forge:storage_blocks/ostrum'
            },
            {
                "tag": 'forge:ingots/extreme'
            }
        ],
        "output": [
            {
                "count": 2,
                "item": 'nuclearcraft:thermoconducting_ingot'
            }
        ],
        "powerModifier": 1.5,
        "radiation": 1.0,
        "timeModifier": 1.7
    }).id("sdbf:thermoconducting_ingot")

    event.custom({
        "type": "nuclearcraft:pump",
        "input": [
            {
                "item": "nuclearcraft:lava_collector"
            }
        ],
        "outputFluids": [
            {
                "amount": 1000,
                "tag": "minecraft:lava"
            }
        ],
        "powerModifier": 6.0,
        "radiation": 1.0,
        "timeModifier": 0.5
    }).id("sdbf:lava_collect")

    event.custom({
        "type": "nuclearcraft:kugelblitz_chamber",
        "input": [{ "item": 'nuclearcraft:upgrade_quantum' }],
        "output": [{ "item": 'nuclearcraft:upgrade_quantum' }],
        "powerModifier": 1.0, "radiation": 1.0, "timeModifier": 1.0
    }).id("sdbf:upgrade_quantum")

    event.custom({
        "type": "nuclearcraft:kugelblitz_chamber",
        "input": [{ "item": 'slashblade:proudsoul_tiny' }],
        "output": [{ "item": 'slashblade:proudsoul_tiny' }],
        "powerModifier": 1.0, "radiation": 1.0, "timeModifier": 1.0
    }).id("sdbf:proudsoul_tiny_quantum")

})
