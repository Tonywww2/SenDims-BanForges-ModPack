ServerEvents.tags("item", event => {
    event.removeAll('twilightforest:portal/activator')    

    event.add('twilightforest:portal/activator',
        'minecraft:nether_star'
    )    

    event.add("slashblade_sendims:drc_health_material_0",
        'twilightforest:steeleaf_ingot'
    )

    event.add("slashblade_sendims:drc_damage_material_0",
        'minecraft:diamond'
    )

})

ServerEvents.tags("block", event => {
    event.removeAll('aether:aether_portal_blocks')

    event.add('aether:aether_portal_blocks',
        'aether:ambrosium_block'
    )

})