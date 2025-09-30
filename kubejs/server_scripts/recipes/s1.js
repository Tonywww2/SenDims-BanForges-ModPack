ServerEvents.recipes(event => {
    event.shapeless('blue_skies:lunar_stonebrick', ['blue_skies:turquoise_stonebrick', '#forge:dyes/black'])
        .id("sdbf:lunar_stonebrick_s1")
    event.shapeless('4x blue_skies:turquoise_cobblestone', ['#forge:cobblestone', 'minecraft:moss_block', '#forge:gravel', 'minecraft:bone_meal'])
        .id("sdbf:turquoise_cobblestone_s1")

    event.shaped('blue_skies:zeal_lighter', [
        'A  ',
        ' B ',
        ' CD'
    ], {
        A: 'dustandash:bloody_flint',
        B: 'dustandash:sharpen_flint',
        C: 'minecraft:flowering_azalea',
        D: 'minecraft:flint'
    }).id('sdbf:zeal_lighter_s1')

    event.shaped('blue_skies:blue_journal', [
        'AA',
        'AB',
        'AA'
    ], {
        A: '#forge:rods',
        B: 'blue_skies:turquoise_cobblestone'
    }).id('sdbf:blue_journal_s1')

    event.shaped(Item.of('slashblade_sendims:deeprealm_certificate', '{deeprealm:{damage_rate_progress:0,health_progress:0,rank:0}}'), [
        'ACD',
        'BEF',
        'GBA'
    ], {
        A: 'slashblade:proudsoul_tiny',
        B: 'blue_skies:charoite',
        C: 'blue_skies:falsite_ingot',
        D: 'slashblade:proudsoul_ingot',
        E: 'blue_skies:diopside_gem',
        F: 'blue_skies:horizonite_ingot',
        G: 'blue_skies:moonstone'
    }).id('sdbf:deeprealm_certificate_s1')

    // event.shaped($StructureQuill.forStructure("blue_skies:everbright_blinding_dungeon"), [
    //     'AAA',
    //     'ABA',
    //     'AAA'
    // ], {
    //     A: 'blue_skies:turquoise_stonebrick',
    //     B: 'minecraft:map'
    // }).id('sdbf:sq_everbright_blinding_dungeon_s1')

    // event.shaped($StructureQuill.forStructure("blue_skies:everdawn_blinding_dungeon"), [
    //     'AAA',
    //     'ABA',
    //     'AAA'
    // ], {
    //     A: 'blue_skies:lunar_stonebrick',
    //     B: 'minecraft:map'
    // }).id('sdbf:sq_everdawn_blinding_dungeon_s1')
})