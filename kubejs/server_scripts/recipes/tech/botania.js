ServerEvents.recipes(event => {

    event.shaped('botania:alfheim_portal', [
        'ABA',
        'ACA',
        'ABA'
    ], {
        A: "#botania:livingwood_logs",
        B: "#forge:nuggets/terrasteel",
        C: "kubejs:ml_computing_ingot"
    }).id('sdbf:alfheim_portal')

    event.shaped('botania:terra_plate', [
        'LNL',
        '0M1',
        '283'
    ], {
        L: 'minecraft:lapis_block',
        0: 'botania:rune_water',
        M: '#botania:manasteel_blocks',
        1: 'botania:rune_fire',
        2: 'botania:rune_earth',
        8: 'botania:rune_mana',
        3: 'botania:rune_air',
        N: "kubejs:delta_dust"
    }).id('sdbf:terra_plate')

    event.custom({
        "type": "botania:petal_apothecary",
        "ingredients": [
            { "tag": "botania:petals/red" },
            { "tag": "botania:petals/red" },
            { "tag": "botania:petals/gray" },
            { "tag": "forge:ingots/terrasteel" },
            { "tag": "botania:petals/white" },
            { "item": "botania:spawnermover" },
            { "item": "botania:rune_wrath" },
            { "item": "botania:rune_fire" }],
        "output": { "item": "botania:entropinnyum" },
        "reagent": { "tag": "botania:seed_apothecary_reagent" }
    }).id('sdbf:entropinnyum')

    event.custom({
        "type": "botania:terra_plate",
        "ingredients": [
            {
                "item": "botania:manasteel_block"
            },
            {
                "item": "botania:mana_pearl"
            },
            {
                "item": "botania:mana_diamond"
            },
            {
                "item": "slashblade:proudsoul_sphere"
            }
        ],
        "mana": 500000,
        "result": {
            "item": "botania:terrasteel_ingot"
        }
    }).id("sdbf:terrasteel_ingot")


})