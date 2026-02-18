ServerEvents.recipes(event => {

    event.smelting('slashblade_sendims:estus_flask_0', ['kubejs:garden_lighter'])
        .id("sdbf:estus_flask_0_s1");

    // event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
    //     "ABC",
    //     "DEF",
    //     "GHI"
    // ], {
    //     "A": "minecraft:diamond_block",
    //     "B": 'thermal_shock:helion_slag',
    //     "C": 'thermal_shock:stratosilver',
    //     "D": 'thermal_shock:ferrum_ingot',
    //     "E": "slashblade:slashblade_wood",
    //     "F": "minecraft:diamond",
    //     "G": "minecraft:iron_ingot",
    //     "H": 'thermal_shock:stratus_alloy',
    //     "I": 'thermal_shock:corrial_ingot'
    // }, "pseudoedge_break_dawn:kumasakura")
    //     .id("sdbf:kumasakura_s1");

    event.shaped($StructureQuill.forStructure("cavernous:lush_village"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'minecraft:paper',
        B: '#minecraft:dirt'
    }).id('sdbf:sq_lush_village_s1');

    event.shaped($StructureQuill.forStructure("cavernous:stone_village"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'minecraft:paper',
        B: '#forge:cobblestone'
    }).id('sdbf:sq_stone_village_s1');

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