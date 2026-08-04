ServerEvents.recipes(event => {

    event.shapeless('6x twilightforest:naga_scale', [
        "twilightforest:naga_trophy"
    ]).id("sdbf:naga_scale_s2")

    event.shapeless("5x twilightforest:alpha_yeti_fur", [
        "twilightforest:alpha_yeti_trophy"
    ]).id("sdbf:alpha_yeti_fur_s2")

    event.recipes.thermal.smelter('twilightforest:carminite', [
        '6x #forge:dusts/arsenic',
        '2x #forge:ingots/lead',
        '3x #forge:ingots/iron'
    ])
        .energy(8192)
        .id('sdbf:carminite_s2')

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": 'twilightforest:steeleaf_ingot'
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
                "name": "last_smith:nagasada"
            }
        },
        "blade": "last_smith:exorcism_sakura",
        "template": {
            "item": "last_smith:scroll_named"
        }
    }).id("sdbf:exorcism_sakura_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABG",
        "CDC",
        "EFH"
    ], {
        "A": '#forge:storage_blocks/diamond',
        "B": "twilightforest:naga_trophy",
        "C": "twilightforest:naga_scale",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:agito")
                .killCount(2000)
                .proudSoul(20000)
                .refineCount(15)
                .build()
        ),
        "E": "twilightforest:ironwood_ingot",
        "F": ["twilightforest:lifedrain_scepter", "twilightforest:twilight_scepter", "twilightforest:zombie_scepter"],
        "G": "twilightforest:magic_map_focus",
        "H": 'slashblade:proudsoul'
    }, "sjap_adder:agito_ex")
        .id("sdbf:agito_ex_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "PIP",
        "IBI",
        "PIP"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:sabigatana")
                .killCount(100)
                .proudSoul(1000)
                .refineCount(10)
                .build()
        ),
        "P": 'slashblade:proudsoul',
        "I": '#forge:ingots/iron'
    }, "slashblade:doutanuki")
        .id("sdbf:doutanuki_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "  P",
        " P ",
        "B  "
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:sabigatana")
                .addSwordType("broken")
                .addSwordType("sealed")
                .build()
        ),
        "P": '#forge:ingots/iron'
    }, "slashblade:sabigatana")
        .id("sdbf:sabigatana_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "PSP",
        "SBS",
        "PSP"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:orotiagito_sealed")
                .killCount(1000)
                .proudSoul(1000)
                .refineCount(10)
                .build()
        ),
        "P": "slashblade:proudsoul",
        "S": '#forge:gems/diamond'
    }, "slashblade:orotiagito")
        .id("sdbf:orotiagito_s2")

})