ServerEvents.recipes(event => {

    sqRecipe(event, "sdbf:ae_lab", '#forge:ingots/iron', 0, "s2");
    sqRecipe(event, "cavernous:lush_village", '#minecraft:dirt', 0, "s2");
    sqRecipe(event, "cavernous:stone_village", '#forge:cobblestone', 0, "s2");
    sqRecipe(event, "dungeons_arise:plague_asylum", 'ad_astra:etrionic_capacitor', 0, "s2");
    
    event.shaped(Item.of('midnight:rift_placer', `{${MIDNIGHT_STAGE}: true}`), [
        'ABA',
        ' D ',
        'AFA'
    ], {
        A: 'slashblade:proudsoul',
        B: 'kubejs:menril-silicon_sic_sic_cmc_ingot',
        D: 'midnight:rift_placer',
        F: 'nuclearcraft:sulfuric_acid_bucket'
    }).id('sdbf:rift_placer_s3')

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