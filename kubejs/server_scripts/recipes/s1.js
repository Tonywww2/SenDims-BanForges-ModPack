ServerEvents.recipes(event => {
    event.smelting('2x dustandash:sharpen_flint', ['minecraft:flint'], 0, 100).id("sdbf:sharpen_flint_s1")

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