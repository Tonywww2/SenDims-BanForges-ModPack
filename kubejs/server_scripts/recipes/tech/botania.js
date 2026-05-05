ServerEvents.recipes(event => {

    event.shaped('botania:alfheim_portal', [
        'ABA',
        'ACA',
        'ABA'
    ], {
        A: "#botania:livingwood_logs",
        B: "#forge:nuggets/terrasteel",
        C: "kubejs:ml_computing_ingot"
    }).id('sdbf:alfheim_portal')

    event.shaped('botania:terra_plate', [
        'LNL',
        '0M1',
        '283'
    ], {
        L: 'minecraft:lapis_block',
        0: 'botania:rune_water',
        M: '#botania:manasteel_blocks',
        1: 'botania:rune_fire',
        2: 'botania:rune_earth',
        8: 'botania:rune_mana',
        3: 'botania:rune_air',
        N: "kubejs:bizarre_matter_dust"
    }).id('sdbf:terra_plate')


})