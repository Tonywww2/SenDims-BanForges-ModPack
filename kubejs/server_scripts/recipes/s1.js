ServerEvents.recipes(event => {
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

    event.shaped($StructureQuill.forStructure("blue_skies:everbright_blinding_dungeon"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'blue_skies:turquoise_stonebrick',
        B: 'minecraft:map'
    }).id('sdbf:sq_everbright_blinding_dungeon_s1')

    event.shaped($StructureQuill.forStructure("blue_skies:everdawn_blinding_dungeon"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'blue_skies:lunar_stonebrick',
        B: 'minecraft:map'
    }).id('sdbf:sq_everdawn_blinding_dungeon_s1')
})