// priority: 0

StartupEvents.registry('item', event => {

    // event.create('neptune_ingot').fireResistant().rarity('rare')
    // event.create('valkyrie_ingot').fireResistant().rarity('rare')
    // event.create('phoenix_ingot').fireResistant().rarity('rare')

    event.create('alpha_dust').fireResistant()
    event.create('beta_dust').fireResistant().rarity('rare')
    event.create('gamma_dust').fireResistant().rarity('rare')
    event.create('delta_dust').fireResistant().rarity('epic')
    event.create('epsilon_dust').fireResistant().rarity('epic')
    event.create('high_carbon_iron_dust').fireResistant()

    event.create('garden_lighter').fireResistant().rarity('rare')
    event.create('bedrock_breaker').fireResistant().rarity('rare').maxStackSize(16)
    event.create('apoth_boss_remover').fireResistant().rarity('epic').maxStackSize(16)

    event.create('gem_ticket').fireResistant().rarity('epic').maxStackSize(8)

    event.create('scoria_ingot').fireResistant().rarity('rare')
    event.create('mysterious_alkali_crystal').fireResistant().rarity('rare')
    event.create('menril-silicon_sic_sic_cmc_ingot').fireResistant().rarity('epic')
    event.create('mercury_refractory_structural_component').fireResistant().rarity('epic')
    event.create('coil_of_sorrow').fireResistant().rarity('rare')
    event.create('chorus_logic_composite_coil').fireResistant().rarity('rare')

    event.create('galatic_cycle_component').fireResistant().rarity('epic')
    event.create('bizarre_matter_dust').fireResistant().rarity('rare')
    event.create('storm_hydrogen_crystal').fireResistant().rarity('rare')
    event.create('celestial_filling_alloy_ingot').fireResistant().rarity('rare')
    // 土星环加工线中间产物 / Saturn ring processing intermediates
    event.create('saturn_regolith').fireResistant()
    event.create('irradiated_saturn_dust').fireResistant().rarity('rare')
    event.create('saturn_ring_alloy_ingot').fireResistant().rarity('rare')
    event.create('ancient_soul').fireResistant().rarity('rare')
    event.create('titan-ii_composite_ingot').fireResistant().rarity('rare')
    event.create('multifaceted_ambrosia').fireResistant().rarity('rare')
    event.create('anchor_shard').fireResistant().rarity('epic')

    // 液态耀魂精炼线中间产物 / Liquid proudsoul refining intermediates
    event.create('soul_filter_matrix').fireResistant().maxStackSize(16)
    event.create('charged_soul_filter').fireResistant().rarity('rare').maxStackSize(16)
    event.create('condensed_proudsoul_cake').fireResistant()
    event.create('compressed_proudsoul_cake').fireResistant().rarity('rare')

    event.create('ml_computing_ingot').fireResistant().rarity('epic')
    event.create('cognitio').fireResistant().rarity('rare')
    event.create('chaotic_truth').fireResistant().rarity('rare')
    event.create('radiation_components').fireResistant().rarity('rare')

    event.create('basepoint_alloy').fireResistant().rarity('epic')
    event.create('virtual_gold_ingot').fireResistant().rarity('rare')
    event.create('trinity_alloy_ingot').fireResistant().rarity('rare')
    event.create('rainbowshift_entropy').fireResistant().rarity('rare')

    // Special Materials
    event.create('sdbf:fantasy_bubble').fireResistant().rarity('epic')
    event.create('sdbf:chaos_anchor').fireResistant().rarity('epic')
    event.create('sdbf:dream_cat').fireResistant().rarity('epic')
    event.create('sdbf:stationary_matter').fireResistant().rarity('epic')
    event.create('sdbf:flammable_ingot').fireResistant().rarity('epic')

})

StartupEvents.registry('block', event => {
    event.create('moss_stone_tofu')
        .soundType('stone')
        .hardness(1.0)
        .resistance(2.0)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')

    event.create('asteroid_rock')
        .soundType('stone')
        .hardness(2.0)
        .resistance(6.0)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')

    event.create('carbon_rich_asteroid_rock')
        .soundType('stone')
        .hardness(2.0)
        .resistance(6.0)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')

    event.create('silica_rich_asteroid_rock')
        .soundType('stone')
        .hardness(2.0)
        .resistance(6.0)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')

    event.create('alkaline_crystal_cluster')
        .soundType('amethyst_cluster')
        .noCollision()
        .hardness(1.5)
        .resistance(1.5)
        .requiresTool(true)
        .waterlogged()
        .renderType('cutout')
        .tagBlock('minecraft:mineable/pickaxe')

    // event.create('soul_crystal_cluster')
    //     .soundType('amethyst_cluster')
    //     .noCollision()
    //     .hardness(12.0)
    //     .resistance(12.0)
    //     .requiresTool(true)
    //     .renderType('cutout')
    //     .tagBlock('minecraft:mineable/pickaxe')

})

StartupEvents.registry('fluid', event => {
    event.create('sulfochloric_acid')
        .thickTexture(0xc9dc72)
        .bucketColor(0xc9dc72)

    event.create('melted_proudsoul')
        .thickTexture(0x5a30bf)
        .bucketColor(0x5a30bf)

    event.create('light_distilled_proudsoul')
        .thickTexture(0xa98cff)
        .bucketColor(0xa98cff)

    event.create('active_distilled_proudsoul')
        .thickTexture(0x7b55e7)
        .bucketColor(0x7b55e7)

    event.create('condensed_distilled_proudsoul')
        .thickTexture(0x5231b8)
        .bucketColor(0x5231b8)

    event.create('heavy_distilled_proudsoul')
        .thickTexture(0x30196f)
        .bucketColor(0x30196f)

    event.create('stabilized_light_proudsoul')
        .thickTexture(0xc5b2ff)
        .bucketColor(0xc5b2ff)

    event.create('buffered_active_proudsoul')
        .thickTexture(0x916ff2)
        .bucketColor(0x916ff2)

    event.create('pressurized_condensed_proudsoul')
        .thickTexture(0x6642c7)
        .bucketColor(0x6642c7)

    event.create('cracked_heavy_proudsoul')
        .thickTexture(0x422582)
        .bucketColor(0x422582)

    event.create('volatile_proudsoul_blend')
        .thickTexture(0xb48cff)
        .bucketColor(0xb48cff)

    event.create('dense_proudsoul_blend')
        .thickTexture(0x4a2a9e)
        .bucketColor(0x4a2a9e)

    event.create('purified_proudsoul_fuel')
        .thickTexture(0xd8c7ff)
        .bucketColor(0xd8c7ff)
})