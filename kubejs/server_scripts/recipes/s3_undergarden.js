ServerEvents.recipes(event => {

    event.shaped('undergarden:catalyst', [
        'ACA',
        'CBC',
        'ACA'
    ], {
        A: '#forge:gems/carminite',
        B: 'twilightforest:lamp_of_cinders',
        C: '#forge:gems/diamond'
    }).keepIngredient('twilightforest:lamp_of_cinders')
        .id('sdbf:catalyst_s3')

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "GAB",
        "CDC",
        "BAF"
    ], {
        "A": 'kubejs:coil_of_sorrow',
        "B": 'nuclearcraft:plutonium_rtg',
        "F": 'nuclearcraft:americium_rtg',
        "C": '#forge:ingots/neutronium',
        "G": 'last_smith:scroll_exorcism',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:muramasa_kagura")
                .killCount(1000)                      // 要求：1000 击杀 (Kill Count)
                .proudSoul(3000)                       // 要求：3000 耀魂 (Proud Soul)
                .refineCount(10)                       // 要求：10 锻造 (Refine Count)
                .build()
        )
    }, "sjap_adder:black_soul")
        .id("sdbf:black_soul_s3")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "FEF",
        "CAD",
        "GBG"
    ], {
        "A": 'quark:soul_bead',
        "B": 'minecraft:soul_campfire',
        "C": 'last_smith:scroll_sakura_full',
        "D": 'last_smith:scroll_exorcism',
        "E": Item.of('enderio:filled_soul_vial', '{BlockEntityTag:{EntityStorage:{Entity:{id:"minecraft:ghast"}}}}').weakNBT(),
        "F": 'nuclearcraft:xenorium_298',
        "G": 'nuclearcraft:radaway'
    }, "last_smith:hakurouken")
        .id("sdbf:hakurouken_s3")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": { "item": 'kubejs:coil_of_sorrow' },
        "base": {
            "type": "slashblade:blade", "item": "slashblade:slashblade",
            "request": { "name": "pseudoedge_break_dawn:latent", "proud_soul": 50000, "refine": 50 }
        },
        "blade": "last_smith:nameless_odachi",
        "template": { "item": "last_smith:scroll_odachi" }
    }).id('sdbf:nameless_odachi_s3')

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": { "tag": 'forge:storage_blocks/regalium' },
        "base": {
            "type": "slashblade:blade", "item": "slashblade:slashblade",
            "request": { "name": "last_smith:nameless_odachi", "proud_soul": 100000, "refine": 100 }
        },
        "blade": "last_smith:muramasa_kagura",
        "template": { "item": "last_smith:scroll_muramasa" }
    }).id('sdbf:muramasa_kagura_s3')

})