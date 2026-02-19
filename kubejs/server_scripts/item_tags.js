ServerEvents.tags("item", event => {
    // event.removeAll('twilightforest:portal/activator')

    // event.add('twilightforest:portal/activator',
    //     'minecraft:nether_star'
    // )

    // TODO 证章强化材料
    // 阶段0
    event.add("slashblade_sendims:drc_health_material_0", [
        '#forge:ingots/iron',
        'tofucraft:tofugem'

    ])

    event.add("slashblade_sendims:drc_damage_material_0", [
        '#forge:ingots/gold',
        'tofucraft:tofudiamondnugget'

    ])
    // 阶段1
    event.add('slashblade_sendims:drc_rank_material_1',
        'minecraft:diamond_block'

    )

    event.add("slashblade_sendims:drc_health_material_1", [
        'twilightforest:steeleaf_ingot',
        'deep_aether:skyjade',
        'kubejs:bedrock_breaker',
        'apotheosis:rare_material',

    ])

    event.add("slashblade_sendims:drc_damage_material_1", [
        'minecraft:diamond',
        'aether_redux:gravitite_ingot',
        'ad_astra:desh_sliding_door',

    ])
    // 阶段2
    event.add('slashblade_sendims:drc_rank_material_2',
        'deep_aether:stratus_ingot',
        'minecraft:nether_star',

    )

    event.add("slashblade_sendims:drc_health_material_2", [
        // 'quark:blaze_lantern',
        // 'apotheosis:epic_material'
        "minecraft:bedrock"

    ])

    event.add("slashblade_sendims:drc_damage_material_2", [
        'minecraft:netherite_ingot'

    ])
    // 阶段3
    

})
