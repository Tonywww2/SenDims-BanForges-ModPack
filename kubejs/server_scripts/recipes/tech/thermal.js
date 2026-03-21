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

})