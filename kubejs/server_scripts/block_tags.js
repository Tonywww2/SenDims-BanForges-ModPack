ServerEvents.tags("block", event => {
    // event.removeAll('aether:aether_portal_blocks')

    event.add('forge:ores', [
        '#c:ores',
        'ad_astra:moon_cheese_ore',
        'aether_redux:veridium_ore',
        'deep_aether:skyjade_ore',
        'tofucraft:tofuslate_tofu_diamond_ore'
    ])

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

    // 暮色荆棘可以手动破坏，斧子挖得快（docs/development/暮色森林流程重做-调查与设计-2026-11-18.md 6.7）
    event.add('minecraft:mineable/axe', [
        'twilightforest:brown_thorns',
        'twilightforest:green_thorns'
    ])

})