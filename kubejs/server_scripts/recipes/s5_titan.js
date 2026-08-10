ServerEvents.recipes(event => {

    event.shaped('kubejs:storm_hydrogen_crystal', [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: 'titan_moon:cryo_alloy_ingot',
        B: 'titan_moon:hydrogen_capsule',
        C: 'titan_moon:bio_battery'
    }).id('sdbf:storm_hydrogen_crystal_s5')

    event.shaped('dog:cosmic_worm', [
        'ABA',
        'CDC',
        'EAE'
    ], {
        A: 'kubejs:storm_hydrogen_crystal',
        B: 'minecraft:dragon_egg',
        C: 'slashblade:proudsoul_crystal',
        D: 'dog:cosmic_larva',
        E: 'minecraft:nether_star',
    }).id('sdbf:cosmic_worm_s5')

})