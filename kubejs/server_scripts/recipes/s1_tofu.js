ServerEvents.recipes(event => {

    event.smelting('slashblade_sendims:estus_flask_0', ['kubejs:garden_lighter'])
        .id("sdbf:estus_flask_0_s1");

    event.smelting('tofucraft:blocktofugrilled', ['kubejs:moss_stone_tofu'])
        .id("sdbf:blocktofugrilled_s1");

    event.smelting('tofucraft:blocktofumomen', ['tofucraft:tofu_terrain', 'tofucraft:blocktofuzunda'])
        .id("sdbf:blocktofumomen_s1");

    event.shapeless('kubejs:moss_stone_tofu', [
        '2x #forge:seeds',
        'minecraft:moss_block',
        'dustandash:cobblestone_with_moss'
    ]).id("sdbf:moss_stone_tofu_s1")

    event.shapeless('tofucraft:tofustick', [
        'kubejs:garden_lighter',
        'tofucraft:blocktofugrilled'
    ]).id("sdbf:tofustick_s1")

    event.shapeless('tofucraft:tofumomen', [
        'tofucraft:tofukinu'
    ]).id("sdbf:tofumomen_s1")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "DEF",
        "GHI"
    ], {
        "A": 'tofucraft:oage',
        "B": 'tofucraft:tofuzunda',
        "C": 'tofucraft:tofu_core',
        "D": 'tofucraft:tofumetal',
        "E": "slashblade:slashblade_wood",
        "F": 'tofucraft:tofu_chikuwa',
        "G": 'tofucraft:tofu_metal_sword',
        "H": 'tofucraft:tofugrilled',
        "I": 'tofucraft:tofudiamond'
    }, "pseudoedge_break_dawn:kumasakura")
        .id("sdbf:kumasakura_s1");

    event.shaped($StructureQuill.forStructure("tofucraft:tofu_castle"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'minecraft:paper',
        B: 'tofucraft:tofugem'
    }).id('sdbf:sq_tofu_castle_s1');

    event.custom({
        "type": "minecraft:smithing_transform",
        "addition": { "item": 'slashblade:proudsoul' },
        "base": { "tag": "forge:ingots/iron" },
        "result": { "item": "last_smith:blade_unfinished_1" },
        "template": { "item": "last_smith:scroll_basic" }
    }).id("sdbf:blade_unfinished_1_s1");

    event.custom({
        "type": "minecraft:smithing_transform",
        "addition": { "item": "last_smith:sakura_full" },
        "base": { "tag": "forge:ingots/iron" },
        "result": { "item": "last_smith:sakura_steel_ingot" },
        "template": { "item": "last_smith:scroll_sakura" }
    }).id("sdbf:sakura_steel_ingot_s1")

})