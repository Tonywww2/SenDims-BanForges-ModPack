ServerEvents.recipes(event => {

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SNJ",
        "LBD",
        "JDS"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()

                .proudSoul(10000)
                .refineCount(10)
                .build()
        ),
        "D": "#forge:dyes/black",
        "J": "umapyoi:jewel",
        "L": "#forge:dyes/lime",
        "N": '#forge:ingots/netherite',
        "S": "slashblade:proudsoul"
    }, "blades_derby:uma_black")
        .id("sdbf:uma_black_s2");

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ADA",
        "BCB",
        "AAA"
    ], {
        "A": "minecraft:diamond_block",
        "B": "minecraft:obsidian",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()

                .proudSoul(5000)
                .refineCount(10)
                .build()
        ),
        "D": '#forge:ingots/netherite'
    }, "pseudoedge_break_dawn:kingblade")
        .id("sdbf:kingblade_s2");

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SIS",
        "SBS",
        "SIS"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:kingblade")
                .proudSoul(5000)
                .refineCount(10)
                .build()
        ),
        "I": '#forge:ingots/netherite',
        "S": "slashblade:proudsoul"
    }, "slashblade_addon:nihil")
        .id("sdbf:nihil_s2");

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "SIS",
        "NBN",
        "SDS"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:nihil")
                .killCount(1000)
                .proudSoul(100)
                .refineCount(1)
                .build()
        ),
        "D": "minecraft:diamond_block",
        "I": '#forge:ingots/netherite',
        "N": "minecraft:nether_star",
        "S": "slashblade:proudsoul"
    }, "slashblade_addon:nihilex")
        .id("sdbf:nihilex_s2");

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AAA",
        "BCB",
        "FFF"
    ], {
        "A": "minecraft:nether_star",
        "B": "minecraft:nether_brick",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:slashblade")
                .killCount(100)
                .proudSoul(20000)
                .refineCount(10)
                .build()
        ),
        "F": "slashblade:proudsoul"
    }, "pseudoedge_break_dawn:xblades")
        .id("sdbf:xblades_s2");

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABF",
        "BCB",
        "DBE"
    ], {
        "A": "slashblade:proudsoul",
        "B": "minecraft:nether_star",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("pseudoedge_break_dawn:xblades")
                .killCount(100)
                .proudSoul(20000)
                .refineCount(10)
                .build()
        ),
        "D": "minecraft:obsidian",
        "E": "slashblade:proudsoul",
        "F": 'terra_entity:flamarang'
    }, "pseudoedge_break_dawn:magicblade")
        .id("sdbf:magicblade_s2");

    sqRecipe(event, 
        "cataclysm:soul_black_smith",
        "cataclysm:monstrous_eye",
        0,
        "s2");


})