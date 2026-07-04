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

    event.create('garden_lighter').fireResistant().rarity('rare')
    event.create('bedrock_breaker').fireResistant().rarity('rare').maxStackSize(16)

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

})

StartupEvents.registry('fluid', event => {
    event.create('melted_proudsoul')
        .thickTexture(0x5a30bf)
        .bucketColor(0x5a30bf)
})