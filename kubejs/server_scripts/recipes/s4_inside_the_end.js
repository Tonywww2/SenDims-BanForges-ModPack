ServerEvents.recipes(event => {

    event.custom({
        "type": "ad_astra:nasa_workbench",
        "ingredients": [
            Item.of('kubejs:anchor_shard').toJson(),

            Ingredient.of('nuclearcraft:plate_extreme').toJson(),
            Ingredient.of('nuclearcraft:plate_extreme').toJson(),
            Ingredient.of('nuclearcraft:dps').toJson(),
            Ingredient.of('nuclearcraft:dps').toJson(),
            Ingredient.of('nuclearcraft:linear_accelerator_controller').toJson(),
            Ingredient.of('nuclearcraft:em_calorimeter').toJson(),

            Item.of('kubejs:delta_dust').toJson(),
            Item.of('nuclearcraft:plate_extreme').toJson(),
            Item.of('nuclearcraft:plate_extreme').toJson(),
            Item.of('kubejs:delta_dust').toJson(),

            Item.of('kubejs:delta_dust').toJson(),
            Item.of('ad_astra:tier_4_rocket').toJson(),
            Item.of('kubejs:delta_dust').toJson()
        ],
        "result": {
            "count": 1,
            "id": "ad_astra_rocketed:tier_5_rocket"
        }
    }).id("sdbf:tier_5_rocket_s5")

})