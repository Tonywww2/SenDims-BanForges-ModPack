ServerEvents.recipes(event => {

    event.shaped($StructureQuill.forStructure("sdbf:ae_lab"), [
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

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ISI",
        "SBS",
        "ISI"
    ], {
        "I": 'slashblade:proudsoul',
        "S": '#forge:storage_blocks/diamond',
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:yuzukitukumo") // 要求：付丧 (Yuzukitukumo)
                .killCount(500)                // 要求：1000 击杀 (Kill Count)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:fire_aspect", 1))
                .build()
        )
    }, "slashblade_addon:yukari")
        .id("sdbf:yukari_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " AA",
        "ABA",
        "CA "
    ], {
        "A": 'minecraft:sculk_vein',
        "B": 'minecraft:iron_sword',
        "C": 'minecraft:sculk_catalyst'
    }, "sjap_adder:break_moon")
        .id("sdbf:break_moon_s2")

})