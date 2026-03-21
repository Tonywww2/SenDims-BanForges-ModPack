ServerEvents.recipes(event => {

    event.shaped('enderio:void_chassis', [
        'ABA',
        'CDC',
        'AEA'
    ], {
        A: '#forge:dusts/grains_of_infinity',
        B: '#forge:gears/steel',
        C: 'kubejs:gamma_dust',
        D: 'thermal:machine_frame',
        E: 'thermal:energy_cell',
    }).id('sdbf:void_chassis')

    event.replaceInput({id : "enderio:alloy_smelter"},
        "minecraft:furnace",
        'enderio:primitive_alloy_smelter'
    )

    event.replaceInput({id : "enderio:primitive_alloy_smelter"},
        "enderio:grains_of_infinity",
        'enderio:void_chassis'
    )

    event.replaceInput({id : "enderio:ensouled_chassis"},
        "minecraft:quartz",
        'enderio:void_chassis'
    )

    event.replaceInput({id : "enderio:basic_capacitor"},
        "#forge:ingots/copper",
        'ad_astra:etrionic_capacitor'
    )

    event.replaceInput({id : "enderio:basic_capacitor"},
        "minecraft:gold_nugget",
        '#forge:ingots/energetic_alloy'
    )

})