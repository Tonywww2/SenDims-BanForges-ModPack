ServerEvents.recipes(event => {

    event.shaped('kubejs:delta_dust', [
        'BAB',
        'CDC',
        'AEA'
    ], {
        A: 'thermal:earth_charge',
        B: 'kubejs:bizarre_matter_dust',
        C: "#forge:dusts/lead_platinum",
        D: 'slashblade:proudsoul_sphere',
        E: '#forge:storage_blocks/cobalt'
    }).id('sdbf:delta_dust_s4')

    event.shapeless('kubejs:bizarre_matter_dust', [
        ['kubejs:menril-silicon_sic_sic_cmc_ingot', 'slashblade:proudsoul_sphere', "nuclearcraft:xenorium_298"],
        '2x kubejs:asteroid_rock',
        '3x kubejs:carbon_rich_asteroid_rock',
        '3x kubejs:silica_rich_asteroid_rock'
    ]).id('sdbf:bizarre_matter_dust_s4')

    event.recipes.thermal.pulverizer(
        Item.of('kubejs:bizarre_matter_dust').withChance(0.01), [
        'kubejs:asteroid_rock',
        'kubejs:carbon_rich_asteroid_rock'
    ]
    ).id('sdbf:bizarre_matter_dust_acc1_s4')

    event.recipes.thermal.pulverizer(
        Item.of('kubejs:bizarre_matter_dust').withChance(0.015), [
        'kubejs:asteroid_rock',
        'kubejs:silica_rich_asteroid_rock'
    ]
    ).energy(16384)
        .id('sdbf:bizarre_matter_dust_acc2_s4')

    event.custom({
        "type": "nuclearcraft:assembler",
        "input": [
            Item.of('kubejs:bizarre_matter_dust').toJson(),
            Item.of('slashblade:proudsoul_sphere').toJson(),
            Item.of('nuclearcraft:fusion_reactor_casing').toJson(),
            Item.of("forge:dusts/lead_platinum").toJson(),
            Item.of('minecraft:gunpowder').toJson(),
        ],
        "output": [Item.of('kubejs:delta_dust').toJson()],
        "powerModifier": 10.0, "radiation": 1.0, "timeModifier": 2.0
    }).id('sdbf:delta_dust_s4_acc')

})