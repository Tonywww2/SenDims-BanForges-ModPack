ServerEvents.recipes(event => {

    event.shapeless('6x twilightforest:naga_scale', [
        "twilightforest:naga_trophy"
    ]).id("sdbf:naga_scale_s2")

    event.shapeless("5x twilightforest:alpha_yeti_fur", [
        "twilightforest:alpha_yeti_trophy"
    ]).id("sdbf:alpha_yeti_fur_s2")

    event.recipes.thermal.smelter('twilightforest:carminite', [
        '6x #forge:dusts/arsenic',
        '2x #forge:ingots/lead',
        '3x #forge:ingots/iron'
    ])
        .energy(8192)
        .id('sdbf:carminite_s2')

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": 'twilightforest:steeleaf_ingot'
        },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": {
                "enchantments": [
                    {
                        "id": "minecraft:smite"
                    }
                ],
                "name": "last_smith:nagasada"
            }
        },
        "blade": "last_smith:exorcism_sakura",
        "template": {
            "item": "last_smith:scroll_named"
        }
    }).id("sdbf:exorcism_sakura_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABG",
        "CDC",
        "EFH"
    ], {
        "A": '#forge:storage_blocks/diamond',
        "B": "twilightforest:naga_trophy",
        "C": "twilightforest:naga_scale",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:agito")
                .killCount(2000)
                .proudSoul(20000)
                .refineCount(15)
                .build()
        ),
        "E": "twilightforest:ironwood_ingot",
        "F": ["twilightforest:lifedrain_scepter", "twilightforest:twilight_scepter", "twilightforest:zombie_scepter"],
        "G": "twilightforest:magic_map_focus",
        "H": 'slashblade:proudsoul'
    }, "sjap_adder:agito_ex")
        .id("sdbf:agito_ex_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "PIP",
        "IBI",
        "PIP"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:sabigatana")
                .killCount(100)
                .proudSoul(1000)
                .refineCount(10)
                .build()
        ),
        "P": 'slashblade:proudsoul',
        "I": '#forge:ingots/iron'
    }, "slashblade:doutanuki")
        .id("sdbf:doutanuki_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "  P",
        " P ",
        "B  "
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:sabigatana")
                .addSwordType("broken")
                .addSwordType("sealed")
                .build()
        ),
        "P": '#forge:ingots/iron'
    }, "slashblade:sabigatana")
        .id("sdbf:sabigatana_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "PSP",
        "SBS",
        "PSP"
    ], {
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:orotiagito_sealed")
                .killCount(1000)
                .proudSoul(1000)
                .refineCount(10)
                .build()
        ),
        "P": "slashblade:proudsoul",
        "S": '#forge:gems/diamond'
    }, "slashblade:orotiagito")
        .id("sdbf:orotiagito_s2")

    // Boss 掉落刀的保底配方：Boss 奖杯 + 无铭「无名」（精炼 10 以上）+ 铁木锭、钢叶 + Boss 特色材料
    let twilightBossBlade = (blade, trophy, material, id) => {
        event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
            "ITS",
            "MBM",
            "SMI"
        ], {
            "T": trophy,
            "B": SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .refineCount(10)
                    .build()
            ),
            "I": "twilightforest:ironwood_ingot",
            "S": "twilightforest:steeleaf_ingot",
            "M": material
        }, blade)
            .id(id)
    }

    twilightBossBlade("slashblade:agito_rust", "twilightforest:naga_trophy", "twilightforest:naga_scale", "sdbf:agito_rust_s2")
    twilightBossBlade("slashblade:yasha_true", "twilightforest:minoshroom_trophy", "minecraft:mushroom_stew", "sdbf:yasha_true_s2")
    twilightBossBlade("slashblade:orotiagito_rust", "twilightforest:hydra_trophy", "twilightforest:fiery_ingot", "sdbf:orotiagito_rust_s2")
    twilightBossBlade("slashblade_addon:murakumo", "twilightforest:ur_ghast_trophy", "twilightforest:fiery_ingot", "sdbf:murakumo_s2")
    twilightBossBlade("sjap_adder:frostbane_moonveil", "twilightforest:snow_queen_trophy", "twilightforest:aurora_block", "sdbf:frostbane_moonveil_s2")

    // 暮色流程重做（docs/development/暮色森林流程重做-调查与设计-2026-11-18.md）：
    // 迷宫破坏者由巨人镐合成，材料只用高地、巨魔洞穴与云上城堡里拿得到的东西（此时普通群系还没开放）。
    event.shaped('twilightforest:mazebreaker_pickaxe', [
        'OTO',
        'TGT',
        'OTO'
    ], {
        O: 'twilightforest:giant_obsidian',
        T: 'twilightforest:trollsteinn',
        G: 'twilightforest:giant_pickaxe'
    }).id('sdbf:mazebreaker_pickaxe_s2')

    // 终焉城堡的召唤材料（docs/development/终焉城堡内容设计-2026-11-18.md 第 5 节）
    event.shaped('kubejs:finale_rune_core', [
        ' Y ',
        'BCP',
        ' V '
    ], {
        Y: 'kubejs:castle_rune_shard_yellow',
        B: 'kubejs:castle_rune_shard_blue',
        P: 'kubejs:castle_rune_shard_pink',
        V: 'kubejs:castle_rune_shard_violet',
        C: 'twilightforest:violet_castle_rune_brick'
    }).id('sdbf:finale_rune_core_s2')

    event.shaped('kubejs:finale_sigil', [
        'EEE',
        'ESE',
        'EEE'
    ], {
        E: 'kubejs:castle_echo',
        S: 'slashblade:proudsoul'
    }).id('sdbf:finale_sigil_s2')

    // 转色：任意 2 块碎片 + 1 块该颜色的城堡符文砖 -> 1 块该颜色的碎片
    let castleShardBricks = [
        ['yellow', 'twilightforest:yellow_castle_rune_brick'],
        ['blue', 'twilightforest:blue_castle_rune_brick'],
        ['pink', 'twilightforest:pink_castle_rune_brick'],
        ['violet', 'twilightforest:violet_castle_rune_brick']
    ]
    castleShardBricks.forEach(pair => {
        event.shapeless(`kubejs:castle_rune_shard_${pair[0]}`, [
            '#kubejs:castle_rune_shards',
            '#kubejs:castle_rune_shards',
            pair[1]
        ]).id(`sdbf:castle_rune_shard_${pair[0]}_s2`)
    })

})