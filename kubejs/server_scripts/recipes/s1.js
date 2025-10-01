ServerEvents.recipes(event => {
    // event.shaped(Item.of('slashblade_sendims:deeprealm_certificate', '{deeprealm:{damage_rate_progress:0,health_progress:0,rank:0}}'), [
    //     'ACD',
    //     'BEF',
    //     'GBA'
    // ], {
    //     A: 'slashblade:proudsoul_tiny',
    //     B: 'blue_skies:charoite',
    //     C: 'blue_skies:falsite_ingot',
    //     D: 'slashblade:proudsoul_ingot',
    //     E: 'blue_skies:diopside_gem',
    //     F: 'blue_skies:horizonite_ingot',
    //     G: 'blue_skies:moonstone'
    // }).id('sdbf:deeprealm_certificate_s1')

    event.shaped('apotheosis:library', [
        'ACA',
        'CBC',
        'ACA'
    ], {
        A: 'minecraft:ender_chest',
        B: 'cataclysm:monstrous_horn',
        C: 'minecraft:netherite_ingot'
    }).id('sdbf:apotheosis_library_s1')

    // event.shaped($StructureQuill.forStructure("blue_skies:everdawn_blinding_dungeon"), [
    //     'AAA',
    //     'ABA',
    //     'AAA'
    // ], {
    //     A: 'blue_skies:lunar_stonebrick',
    //     B: 'minecraft:map'
    // }).id('sdbf:sq_everdawn_blinding_dungeon_s1')
})