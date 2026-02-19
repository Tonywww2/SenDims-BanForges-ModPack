ServerEvents.recipes(event => {

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": 'kubejs:mysterious_alkali_crystal'
        },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": {
                "enchantments": [
                    {
                        "id": "minecraft:sharpness"
                    }
                ],
                "kill": 1000,
                "name": "last_smith:silverbamboo_top",
                "refine": 20
            }
        },
        "blade": "last_smith:silverbamboo_blood",
        "template": {
            "item": "last_smith:scroll_sakura_full"
        }
    }).id("sdbf:bloodybamboo_s3")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": 'kubejs:mysterious_alkali_crystal'
        },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": {
                "enchantments": [
                    {
                        "id": "minecraft:smite"
                    }
                ],
                "kill": 1000,
                "name": "last_smith:silverbamboo_top",
                "refine": 20
            }
        },
        "blade": "last_smith:goldenbamboo",
        "template": {
            "item": 'last_smith:scroll_blood'
        }
    }).id("sdbf:goldenbamboo_s3")

})