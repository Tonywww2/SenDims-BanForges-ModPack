ServerEvents.recipes(event => {

    event.recipes.thermal.smelter('draconicevolution:draconium_ingot', [
        '3x draconicevolution:draconium_dust',
        '2x #forge:ingots/end_steel',
        'draconicevolution:infused_obsidian'])
        .energy(16384)
        .id("sdbf:draconium_ingot")


    event.custom({
        "type": "draconicevolution:fusion_crafting",
        "catalyst": {
            "tag": "forge:nether_stars"
        },
        "ingredients": [
            {
                "item": 'draconicevolution:draconium_core'
            },
            {
                "item": 'draconicevolution:draconium_core'
            },
            {
                "tag": 'forge:ingots/draconium'
            },
            {
                "tag": 'forge:ingots/draconium'
            },
            Item.of('kubejs:alpha_dust').toJson(),
            Item.of('kubejs:alpha_dust').toJson(),
            {
                "tag": 'forge:ingots/draconium'
            },
            {
                "tag": 'forge:ingots/draconium'
            },
            {
                "item": 'draconicevolution:draconium_core'
            },
            {
                "item": 'draconicevolution:draconium_core'
            }
        ],
        "result": {
            "item": 'draconicevolution:wyvern_core'
        },
        "tier": "DRACONIUM",
        "total_energy": 1000000
    }).id("sdbf:wyvern_core")

    event.custom({
        "type": "draconicevolution:fusion_crafting",
        "catalyst": {
            "tag": "forge:nether_stars"
        },
        "ingredients": [
            {
                "item": "draconicevolution:wyvern_core"
            },
            {
                "item": "draconicevolution:wyvern_core"
            },
            {
                "tag": "forge:ingots/draconium_awakened"
            },
            {
                "tag": "forge:ingots/draconium_awakened"
            },
            Item.of('kubejs:basepoint_alloy').toJson(),
            Item.of('kubejs:basepoint_alloy').toJson(),
            {
                "tag": "forge:ingots/draconium_awakened"
            },
            {
                "tag": "forge:ingots/draconium_awakened"
            },
            {
                "item": "draconicevolution:wyvern_core"
            },
            {
                "item": "draconicevolution:wyvern_core"
            }
        ],
        "result": {
            "item": "draconicevolution:awakened_core"
        },
        "tier": "WYVERN",
        "total_energy": 8000000
    }).id("sdbf:awakened_core")

    event.custom({
        "type": "draconicevolution:fusion_crafting",
        "catalyst": {
            "item": "draconicevolution:large_chaos_frag"
        },
        "ingredients": [
            {
                "tag": "forge:ingots/draconium_awakened"
            },
            {
                "tag": "forge:ingots/draconium_awakened"
            },
            {
                "item": "draconicevolution:awakened_core"
            },
            {
                "item": "draconicevolution:awakened_core"
            },
            {
                "item": "draconicevolution:large_chaos_frag"
            },
            {
                "item": "draconicevolution:large_chaos_frag"
            },
            {
                "tag": "forge:ingots/draconium_awakened"
            },
            {
                "item": "draconicevolution:awakened_core"
            },
            {
                "item": "draconicevolution:awakened_core"
            },
            {
                "item": "draconicevolution:large_chaos_frag"
            },
            {
                "item": "draconicevolution:large_chaos_frag"
            },
            {
                "tag": "forge:ingots/draconium_awakened"
            }
        ],
        "result": {
            "item": "draconicevolution:chaotic_core"
        },
        "tier": "DRACONIC",
        "total_energy": 400000000
    }).id("sdbf:chaotic_core")

})