ServerEvents.recipes(event => {

    event.shaped('kubejs:delta_dust', [
        'ABA',
        'CDC',
        'AEA'
    ], {
        A: 'thermal:earth_charge',
        B: 'kubejs:bizarre_matter_dust',
        C: 'slashblade:proudsoul',
        D: 'slashblade:proudsoul_sphere',
        E: '#forge:storage_blocks/cobalt'
    }).id('sdbf:delta_dust_s4')

    event.custom({
        "type": "nuclearcraft:assembler",
        "input": [
            Item.of('kubejs:bizarre_matter_dust').toJson(),
            Item.of('slashblade:proudsoul_sphere').toJson(),
            Item.of('nuclearcraft:fusion_reactor_casing').toJson(),
            Item.of('slashblade:proudsoul_tiny').toJson(),
            Item.of('minecraft:gunpowder').toJson(),
        ],
        "output": [Item.of('kubejs:delta_dust').toJson()],
        "powerModifier": 10.0, "radiation": 1.0, "timeModifier": 2.0
    }).id('sdbf:delta_dust_s4_acc')

})