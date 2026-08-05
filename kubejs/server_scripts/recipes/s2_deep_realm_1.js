ServerEvents.recipes(event => {

    sqRecipe(event, "sdbf:ae_lab", '#forge:ingots/iron', 0, "s2");
    sqRecipe(event, "cavernous:lush_village", '#minecraft:dirt', 0, "s2");
    sqRecipe(event, "cavernous:stone_village", '#forge:cobblestone', 0, "s2");
    sqRecipe(event, "dungeons_arise:plague_asylum", 'ad_astra:etrionic_capacitor', 0, "s2");

    event.shaped(Item.of('gateways:gate_pearl', '{gateway:"gateways:sdbf_dr1_g1"}'), [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: 'minecraft:bone',
        B: 'minecraft:rotten_flesh',
        C: '#forge:gems/lapis'
    }).id('sdbf:sdbf_dr1_g1_s2')

    event.shaped(Item.of('gateways:gate_pearl', '{gateway:"gateways:sdbf_dr1_g2"}'), [
        'ADA',
        'BCB',
        'ABA'
    ], {
        A: '#forge:ingots/iron',
        B: '#forge:dusts/redstone',
        C: 'cataclysm:mech_eye',
        D: 'cataclysm:witherite_ingot'
    }).id('sdbf:sdbf_dr1_g2_s2')

    event.shaped('integratedterminals:part_terminal_storage', [
        'ABA',
        'BCB',
        'ADA'
    ], {
        A: 'minecraft:hopper',
        B: '#quark:framed_glasses',
        C: 'cataclysm:mech_eye',
        D: 'cataclysm:witherite_ingot'
    }).id('sdbf:part_terminal_storage_s2')

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

    event.custom({
        "type": "sakura:stone_mortar",
        "experience": 0.0,
        "ingredients": [
            { "item": 'minecraft:stone' }
        ],
        "recipeTime": 200,
        "results": [
            { "item": "minecraft:cobblestone" },
            { "count": 2, "item": "sakura:alkaline" }
        ]
    }).id("sdbf:alkaline_s2")

})