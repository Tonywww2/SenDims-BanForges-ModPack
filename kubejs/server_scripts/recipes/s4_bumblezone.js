ServerEvents.recipes(event => {
    
    event.shaped('slashblade_sendims:the_nectar_quest', [
        'ABA',
        'CDC',
        'ACA'
    ], {
        B: 'cataclysm:void_assault_shoulder_weapon',
        A: '#forge:storage_blocks/regalium',
        C: 'kubejs:coil_of_sorrow',
        D: 'cataclysm:ignitium_elytra_chestplate'
    }).id('sdbf:the_nectar_quest_s4')
    
    event.shaped('kubejs:multifaceted_ambrosia', [
        'ABA',
        'CDC',
        'AEA'
    ], {
        B: 'umapyoi:sweet_cupcake',
        A: 'kubejs:gamma_dust',
        C: 'the_bumblezone:glistering_honey_crystal',
        D: 'the_bumblezone:royal_jelly_bottle',
        E: 'umapyoi:hachimi_big'
    }).id('sdbf:multifaceted_ambrosia_s4')

})