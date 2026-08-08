ServerEvents.recipes(event => {

    event.shaped('#forge:gears/copper', [
        ' A ',
        'ABA',
        ' A '
    ], {
        A: '#forge:ingots/copper',
        B: '#forge:storage_blocks/copper'
    }).id('sdbf:copper_gear')

    event.shaped('#forge:gears/constantan', [
        ' A ',
        'ABA',
        ' A '
    ], {
        A: '#forge:ingots/constantan',
        B: '#forge:storage_blocks/constantan'
    }).id('sdbf:copper_constantan')

    event.shaped('#forge:gears/invar', [
        ' A ',
        'ABA',
        ' A '
    ], {
        A: '#forge:ingots/invar',
        B: '#forge:storage_blocks/invar'
    }).id('sdbf:copper_invar')

    event.shaped('#forge:gears/diamond', [
        ' A ',
        'ABA',
        ' A '
    ], {
        A: '#forge:gems/diamond',
        B: '#forge:storage_blocks/diamond'
    }).id('sdbf:copper_diamond')

    event.shaped('thermal:machine_frame', [
        'CAC',
        'ABA',
        'CAC'
    ], {
        A: '#forge:glass',
        B: 'ad_astra:photovoltaic_etrium_cell',
        C: '#forge:ingots/steel'
    }).id('sdbf:thermal_machine_frame')

    event.shaped('thermal:rf_coil', [
        ' AB',
        'ACA',
        'BA '
    ], {
        A: 'ad_astra:desh_cable',
        B: '#forge:storage_blocks/redstone',
        C: '#forge:ingots/gold'
    }).id('sdbf:thermal_rf_coil')

    event.recipes.thermal.smelter('thermal:rich_slag', [
        '6x thermal:slag',
        '3x ae2:certus_quartz_dust',
        '2x thermal:niter'])
        .energy(8192)
        .id("sdbf:rich_slag")

    let thermalPlateRecipes = [
        ['aluminum', 'forge:ingots/aluminum', 'nuclearcraft:aluminum_plate'],
        ['beryllium', 'forge:ingots/beryllium', 'nuclearcraft:beryllium_plate'],
        ['boron', 'forge:ingots/boron', 'nuclearcraft:boron_plate'],
        ['cobalt', 'forge:ingots/cobalt', 'nuclearcraft:cobalt_plate'],
        ['extreme', 'forge:ingots/extreme', 'nuclearcraft:extreme_plate'],
        ['ferroboron', 'forge:ingots/ferroboron', 'nuclearcraft:ferroboron_plate'],
        ['graphite', 'forge:dusts/graphite', 'nuclearcraft:graphite_plate'],
        ['hard_carbon', 'forge:ingots/hard_carbon', 'nuclearcraft:hard_carbon_plate'],
        ['hsla_steel', 'forge:ingots/hsla_steel', 'nuclearcraft:hsla_steel_plate'],
        ['lithium', 'forge:ingots/lithium', 'nuclearcraft:lithium_plate'],
        ['lithium_manganese_dioxide', 'forge:ingots/lithium_manganese_dioxide', 'nuclearcraft:lithium_manganese_dioxide_plate'],
        ['magnesium', 'forge:ingots/magnesium', 'nuclearcraft:magnesium_plate'],
        ['manganese', 'forge:ingots/manganese', 'nuclearcraft:manganese_plate'],
        ['palladium', 'forge:ingots/palladium', 'nuclearcraft:palladium_plate'],
        ['platinum', 'forge:ingots/platinum', 'nuclearcraft:platinum_plate'],
        ['sic_sic_cmc', 'forge:ingots/sic_sic_cmc', 'nuclearcraft:sic_sic_cmc_plate'],
        ['thermoconducting', 'forge:ingots/thermoconducting', 'nuclearcraft:thermoconducting_plate'],
        ['thorium', 'forge:ingots/thorium', 'nuclearcraft:thorium_plate'],
        ['tough_alloy', 'forge:ingots/tough_alloy', 'nuclearcraft:tough_alloy_plate'],
        ['uranium', 'forge:ingots/uranium', 'nuclearcraft:uranium_plate'],
        ['zinc', 'forge:ingots/zinc', 'nuclearcraft:zinc_plate'],
        ['zirconium', 'forge:ingots/zirconium', 'nuclearcraft:zirconium_plate']
    ]

    thermalPlateRecipes.forEach(([material, input, output]) => {
        event.custom({
            type: 'thermal:press',
            ingredient: { tag: input },
            result: [{ item: output }]
        }).id(`sdbf:thermal_press/${material}_plate`)
    })

    event.custom({
        type: 'thermal:press',
        ingredient: { item: 'ad_astra:etrium_ingot' },
        result: [{ item: 'ad_astra:etrium_plate' }]
    }).id('sdbf:thermal_press/etrium_plate')

})