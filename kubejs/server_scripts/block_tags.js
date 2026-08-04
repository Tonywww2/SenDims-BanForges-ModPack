ServerEvents.tags("block", event => {
    // event.removeAll('aether:aether_portal_blocks')

    // event.add('aether:aether_portal_blocks',
    //     'aether:ambrosium_block'
    // )
        
    event.remove('minecraft:logs', 
        'slashblade_useful_addon:proud_soul_ore',
        'slashblade_useful_addon:deep_proud_soul_ore'
    )

    event.remove('minecraft:needs_stone_tool', 
        'aether:carved_stone'
    )

    event.add("kubejs:mining_tier_5", 
        'aether:carved_stone',
        'ancient_aether:valkyrum_ore'
    )

})