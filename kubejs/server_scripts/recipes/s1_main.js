ServerEvents.recipes(event => {
    event.smelting('2x dustandash:sharpen_flint', ['minecraft:flint'], 0, 100).id("sdbf:sharpen_flint_s1")
    event.smelting("minecraft:diamond", ['yungscavebiomes:rare_ice'], 0, 200).id("sdbf:ice_diamond_s1")

    event.shaped('apotheosis:library', [
        'ACA',
        'CBC',
        'ACA'
    ], {
        A: 'minecraft:ender_chest',
        B: 'cataclysm:monstrous_horn',
        C: 'minecraft:netherite_ingot'
    }).id('sdbf:apotheosis_library_s1')
    
    event.shaped('slashblade_sendims:deeprealm_certificate', [
        ' BB',
        'BAB',
        'CB '
    ], {
        A: 'kubejs:garden_lighter',
        B: 'slashblade:proudsoul_tiny',
        C: 'tofucraft:tofu_core'
    }).id('sdbf:deeprealm_certificate_s1')

    event.shaped('kubejs:garden_lighter', [
        'A  ',
        ' B ',
        ' CD'
    ], {
        A: 'dustandash:bloody_flint',
        B: 'dustandash:sharpen_flint',
        C: 'minecraft:flowering_azalea',
        D: 'minecraft:flint'
    }).id('sdbf:garden_lighter_s1')

})