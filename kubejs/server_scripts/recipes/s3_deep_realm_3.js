ServerEvents.recipes(event => {

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ASE",
        "BKD",
        "CBF"
    ], {
        "A": "minecraft:soul_lantern",
        "B": "slashblade:proudsoul_ingot",
        "C": "minecraft:fermented_spider_eye",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:sange")
                .killCount(666)         // 杀敌数 / Kill count
                .proudSoul(66666)        // 荣耀魂 / ProudSoul
                .refineCount(6)          // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:power", 1))    // 力量 I / Power I
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:sharpness", 1)) // 锋利 I / Sharpness I
                .build()
        ),
        "S": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:dojikiri_yasutsuna")
                .killCount(66)         // 杀敌数 / Kill count
                .proudSoul(666)        // 荣耀魂 / ProudSoul
                .refineCount(6)          // 锻造数 / Refine count
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:power", 5))    // 力量 I / Power I
                .build()
        ),
        "E": "minecraft:bone_block",
        "F": "minecraft:rotten_flesh",
        "K": 'terra_entity:artery'
    }, "slashblade:rivers_of_blood")
        .id("sdbf:rivers_of_blood_s3")

})