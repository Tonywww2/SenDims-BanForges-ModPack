ServerEvents.recipes(event => {

    event.custom({
        "type": "ad_astra:nasa_workbench",
        "ingredients": [
            Item.of('kubejs:celestial_filling_alloy_ingot').toJson(),

            Item.of('kubejs:radiation_components').toJson(),
            Item.of('kubejs:radiation_components').toJson(),
            Item.of('ae2:cell_component_256k').toJson(),
            Item.of('ae2:cell_component_256k').toJson(),
            Item.of('appflux:core_256k').toJson(),
            Item.of('appflux:core_256k').toJson(),

            Item.of('kubejs:celestial_filling_alloy_ingot').toJson(),
            Item.of('ae2:spatial_anchor').toJson(),
            Item.of('ae2:spatial_anchor').toJson(),
            Item.of('kubejs:celestial_filling_alloy_ingot').toJson(),

            Item.of('kubejs:celestial_filling_alloy_ingot').toJson(),
            Item.of('ad_astra_rocketed:tier_5_rocket').toJson(),
            Item.of('kubejs:celestial_filling_alloy_ingot').toJson()
        ],
        "result": {
            "count": 1,
            "id": "ad_astra_rocketed:tier_6_rocket"
        }
    }).id("sdbf:tier_6_rocket_s5")


})