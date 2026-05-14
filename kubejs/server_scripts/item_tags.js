ServerEvents.tags("item", event => {
    // event.removeAll('twilightforest:portal/activator')

    // event.add('twilightforest:portal/activator',
    //     'minecraft:nether_star'
    // )

    event.add("itemfilters:check_nbt", [
        "slashblade:slashblade"

    ])

    event.add("slashblade_sendims:the_nectar_quest_items", [
        "the_bumblezone:essence_calming",
        "the_bumblezone:essence_radiance",
        "the_bumblezone:essence_continuity",
        "the_bumblezone:essence_knowing",
        "the_bumblezone:essence_life",
        "the_bumblezone:essence_raging",
        "the_bumblezone:essence_of_the_bees"

    ])

    event.add("slashblade_sendims:blessing_petals_items", [
        '#minecraft:music_discs'

    ])

    // TODO 证章强化材料
    // 0-1
    event.add('slashblade_sendims:drc_rank_material_1',
        "cataclysm:witherite_ingot",
        "twilightforest:naga_scale",
        "deep_aether:skyjade"

    )
    // 1-2
    event.add('slashblade_sendims:drc_rank_material_2',
        "ad_astra:energizer",
        "twilightforest:giant_obsidian",
        "integrateddynamics:delay",
        "ad_astra:solar_panel"

    )
    // 2-3
    event.add('slashblade_sendims:drc_rank_material_3',
        "cataclysm:void_core",
        "botania:terrasteel_ingot",
        "ad_astra:calorite_sliding_door"

    )
    // 3-4
    event.add('slashblade_sendims:drc_rank_material_4',


    )
    // 4-5
    event.add('slashblade_sendims:drc_rank_material_5',


    )

    // 阶段0
    event.add("slashblade_sendims:drc_health_material_0", [
        '#forge:ingots/desh',               // 戴斯
        '#forge:gems/diamond',              // 钻石
        '#forge:rods/blaze',                // 烈焰棒
        'ae2:calculation_processor',        // 运算处理器
        'deep_aether:metal_mixture',                   // 天晶混合
    ])
    event.add("slashblade_sendims:drc_damage_material_0", [
        '#forge:gems/ambrosium',          // 神能晶
        'yungscavebiomes:rare_ice',       // 魔幻冰
        '#forge:ingots/ironwood',         // 铁木锭
        'minecraft:ghast_tear',           // 恶魂泪
        "minecraft:wither_skeleton_skull",          // 凋零头
    ])

    // 阶段1
    event.add("slashblade_sendims:drc_health_material_1", [
        "minecraft:netherite_ingot",                // 下界合金锭
        'ad_astra:cryo_freezer',
        'twilightforest:alpha_yeti_fur',
        'twilightforest:knightmetal_ring',
        "undergarden:utherium_crystal",                         // 御腐水晶
        "undergarden:cloggrum_ingot",                           // 厄瑟锭
        "enderio:double_layer_capacitor",                       // 双层电容

        "midnight:ebonite",                                     // 黯铁
        "undergarden:froststeel_ingot",                         // 霜钢
        "cyclic:sprout_seed",                                   // 魔豆

    ])
    event.add("slashblade_sendims:drc_damage_material_1", [
        'twilightforest:carminite',          // 砷铅铁 (砷铅铁矿石)
        "midnight:corrupted_pearl",                 // 腐化珍珠
        "midnight:nagrilite_ingot",                 // 夜冥锭
        "#forge:ingots/calorite",                   // 耐热金属
        "midnight:dark_pearl",                      // 黑暗珍珠
        "forge:ingots/ostrum"
      ])

    // 阶段2
    event.add("slashblade_sendims:drc_health_material_2", [
        "cataclysm:koboleton_bone",                             // 骸龙之骨
        "kubejs:mysterious_alkali_crystal",         // 神秘碱晶
        "midnight:virilux",                         // 幽光
        "nuclearcraft:magnesium_ingot",                 // 镁锭
        "kubejs:bizarre_matter_dust",                   // 奇异物质尘
        "kubejs:gamma_dust",
        "the_bumblezone:redstone_honey_web",            // 红石蜜蜂网
        "nuclearcraft:empty_heat_sink",                      // 空散热器
        "enderio:end_steel_ingot",                      // 末地钢
        "kubejs:delta_dust",                            // 德尔塔尘
        "undergarden:forgotten_ingot",                   // 遗忆锭
        "kubejs:mercury_refractory_structural_component",       // 墨丘利组件
        "kubejs:menril-silicon_sic_sic_cmc_ingot"               // menril-silicon_sic_sic_cmc_ingot
    ])
    event.add("slashblade_sendims:drc_damage_material_2", [
        "slashblade:proudsoul_sphere",
        "cataclysm:ancient_metal_ingot",             // 远古金属锭
        "nuclearcraft:thorium_ingot",              // 钍锭
        "nuclearcraft:lithium_ingot",              // 锂锭
        "undergarden:regalium_crystal",            // 贵豪
        "integrateddynamics:logic_director",       // 逻辑导向

    ])

    // 阶段3
    event.add("slashblade_sendims:drc_health_material_3", [
        "kubejs:multifaceted_ambrosia",                 // 多面蜜酒
        "kubejs:ml_computing_ingot",               // ML计算锭
        "kubejs:chaotic_truth",                    // 混沌真理
        "kubejs:galatic_cycle_component",           // 星空循环组件
        "kubejs:alpha_dust",                       // alpha
        "enderio:end_steel_block",
        "nuclearcraft:xenorium_298",
        "tetra:dragon_sinew"
    ])
    event.add("slashblade_sendims:drc_damage_material_3", [
        "cataclysm:essence_of_the_storm",          // 风暴精华
        "kubejs:titan-ii_composite_ingot",         // 泰坦II复合锭
        "kubejs:ancient_soul",                     // 古代灵魂
        "kubejs:epsilon_dust"                      // 艾普塞隆尘
    ])

    // 阶段4
    event.add("slashblade_sendims:drc_health_material_4", [
        "kubejs:virtual_gold_ingot",               // 虚金
        "kubejs:rainbowshift_entropy"              // 虹移之熵
    ])
    event.add("slashblade_sendims:drc_damage_material_4", [
        "kubejs:basepoint_alloy",                  // 奇点合金
        "kubejs:radiation_components"              // 辐射零件组
    ])


})
