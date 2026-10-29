ServerEvents.recipes(event => {
    event.custom({
        "type": "deeprealm_4th:projection_combining",
        "result": Item.of("kubejs:rainbowshift_entropy").toJson(),
        "steps": [
            { "stack": Item.of("deeprealm_4th:star_slurry").toJson(), "direction": "material_on_frame" },
            { "stack": Item.of("minecraft:glow_berries").toJson(), "direction": "frame_on_material" },
            { "stack": Item.of("minecraft:shroomlight").toJson(), "direction": "frame_on_material" },
            { "stack": Item.of("minecraft:glow_ink_sac").toJson(), "direction": "material_on_frame" }
        ]
    }).id("sdbf:rainbowshift_entropy_s5");

    event.custom({
        "type": "deeprealm_4th:combination_forging",
        "result": Item.of("kubejs:epsilon_dust").toJson(),
        "ingredients": [
            { "stack": Item.of("slashblade:proudsoul_trapezohedron").toJson() },
            { "stack": Item.of('kubejs:delta_dust').toJson() },
        ],
        "clicks": 8,
        "cooldown": 5,
        "levels": 45
    }).id("sdbf:epsilon_dust_s5");

    event.custom({
        "type": "deeprealm_4th:combination_forging",
        "result": Item.of("elder_bosses:rune_fragment").toJson(),
        "ingredients": [
            { "stack": Item.of("minecraft:nether_star", 4).toJson() },
            { "stack": Item.of("quark:golden_apple_crate", 4).toJson() },
            { "stack": Item.of("kubejs:rainbowshift_entropy").toJson() },
            { "stack": Item.of("deeprealm_4th:star_slurry_blank").toJson() },
            { "stack": Item.of("deeprealm_4th:star_slurry_crystal").toJson() }
        ],
        "clicks": 7,
        "cooldown": 2,
        "levels": 30
    }).id("sdbf:rune_fragment_s5");

    // 无名系列：天罚 → 无冠（深境四层）
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "AEC",
        "RBP",
        "CEA"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:nameless_judgement")
                .killCount(20000)
                .proudSoul(200000)
                .refineCount(115)
                .build()
        ),
        "A": 'deeprealm_4th:star_slurry_blank',
        "E": 'kubejs:rainbowshift_entropy',
        "R": 'elder_bosses:rune_fragment',
        "P": 'slashblade:proudsoul_trapezohedron',
        "C": 'deeprealm_4th:star_slurry_crystal'
    }, "slashblade:nameless_king")
        .id("sdbf:nameless_king_s5")

    // 神威系列：坎那 + 绿乃雾 → 极神威「坎那」·时序惊蛰
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ENE",
        "CUL",
        "KBR"
    ], {
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kamuy_lightning")
                .killCount(20000)
                .proudSoul(200000)
                .refineCount(100)
                .build()
        ),
        "K": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:green_mist")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "B": 'last_smith:scroll_sharpness',
        "E": 'kubejs:epsilon_dust',
        "N": 'minecraft:nether_star',
        "C": 'enderio:octadic_capacitor',
        "L": 'thermal:lightning_charge',
        "R": 'thermal:rf_coil'
    }, "sjap_adder:kamuyex_ligghtning")
        .id("sdbf:kamuyex_ligghtning_s5")

    // 神威系列：乌卡 + 无刃 → 极神威「乌卡」·惊涛碎岳
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ENE",
        "TUH",
        "KBD"
    ], {
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kamuy_water")
                .killCount(20000)
                .proudSoul(200000)
                .refineCount(100)
                .build()
        ),
        "K": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:kirisaya")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "B": 'last_smith:scroll_bewitched',
        "E": 'kubejs:epsilon_dust',
        "N": 'minecraft:nether_star',
        "D": 'minecraft:diamond_block',
        "T": 'cataclysm:tidal_claws',
        "H": 'minecraft:heart_of_the_sea'
    }, "sjap_adder:kamuyex_water")
        .id("sdbf:kamuyex_water_s5")

    // 天云系列：无念 → 天云「无光」速子
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "CBC",
        "TUV",
        "PQG"
    ], {
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("last_smith:amagumo_munin")
                .killCount(20000)
                .proudSoul(200000)
                .refineCount(100)
                .build()
        ),
        "C": 'deeprealm_4th:star_slurry_crystal',
        "G": 'elder_bosses:gate_fragment',
        // 沿用原配方的马娘魂类型与角色限定。
        "T": Ingredient.of({
            "type": "umapyoi:umasoul",
            "item": "umapyoi:uma_soul",
            "request": {
                "name": "umapyoi:agnus_tachyon"
            }
        }),
        "B": 'last_smith:scroll_named',
        "P": Item.of('minecraft:potion', '{Potion:"minecraft:strong_swiftness"}').weakNBT(),
        "Q": 'ae2:singularity',
        "V": 'minecraft:dragon_breath'
    }, "last_smith:uma_tachyon")
        .id("sdbf:uma_tachyon_s5")

    // 神威系列：诺克特 + 暗鸦 → 极神威「诺克特」·暗轮破斩
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ENE",
        "VUR",
        "KBS"
    ], {
        "U": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:kamuy_dark")
                .killCount(20000)
                .proudSoul(200000)
                .refineCount(100)
                .build()
        ),
        "K": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade_addon:dark_raven")
                .killCount(5000)
                .proudSoul(50000)
                .refineCount(50)
                .build()
        ),
        "B": 'last_smith:scroll_sharpness',
        "E": 'kubejs:rainbowshift_entropy',
        "N": 'minecraft:nether_star',
        "V": 'cataclysm:void_core',
        "R": 'minecraft:echo_shard',
        "S": 'minecraft:sculk_shrieker'
    }, "sjap_adder:kamuyex_dark")
        .id("sdbf:kamuyex_dark_s5")

})
