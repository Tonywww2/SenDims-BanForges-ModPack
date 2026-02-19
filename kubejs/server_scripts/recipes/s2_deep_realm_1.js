ServerEvents.recipes(event => {

    event.shaped($StructureQuill.forStructure("gods_ember:ae_lab"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: '#forge:ingots/iron',
        B: 'minecraft:map'
    }).id('sdbf:ae_lab_s2')

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

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ESD",
        "RBL",
        "ISG"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_aspect", 1))
                .build()
        ),
        "D": "#forge:storage_blocks/diamond",
        "E": "#forge:storage_blocks/emerald",
        "G": "#forge:storage_blocks/gold",
        "I": "#forge:storage_blocks/iron",
        "L": "#forge:storage_blocks/lapis",
        "R": "#forge:storage_blocks/redstone",
        "S": 'slashblade:proudsoul'
    }, "slashblade:yuzukitukumo")
        .id("sdbf:yuzukitukumo_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SLJ",
        "LBL",
        "JLS"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .proudSoul(10000)
                .refineCount(20)
                .build()
        ),
        "J": "umapyoi:jewel",
        "L": "#forge:dyes/blue",
        "S": 'slashblade:proudsoul'
    }, "blades_derby:uma_hishi")
        .id("sdbf:uma_hishi_s2")

})