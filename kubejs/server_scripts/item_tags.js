ServerEvents.tags("item", event => {
    // event.removeAll('twilightforest:portal/activator')

    // event.add('twilightforest:portal/activator',
    //     'minecraft:nether_star'
    // )

    event.add("slashblade_sendims:blessing_petals_items", [
        '#minecraft:music_discs'

    ])

    // TODO 证章强化材料
    // 0-1
    event.add('slashblade_sendims:drc_rank_material_1',
        "cataclysm:witherite_ingot",
        "twilightforest:naga_scale",
        "deep_aether:skyjade",
        "ad_astra:solar_panel"

    )
    // 1-2
    event.add('slashblade_sendims:drc_rank_material_2',
        "ad_astra:energizer",
        "twilightforest:giant_obsidian",
        "integrateddynamics:delay",
        "ad_astra:calorite_sliding_door"

    )
    // 2-3
    event.add('slashblade_sendims:drc_rank_material_3',
        "cataclysm:void_core",
        "botania:terrasteel_ingot"

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
        'twilightforest:raw_meef',          // 牛头人肉 (生)
        'twilightforest:cooked_meef',       // 牛头人肉排 (熟)
        'cataclysm:ancient_metal_nugget',   // 远古金属粒
        'ae2:calculation_processor',        // 运算处理器
        "",                   // 天晶混合
        'twilightforest:carminite'          // 砷铅铁 (砷铅铁矿石)
    ])
    event.add("slashblade_sendims:drc_damage_material_0", [
        '#forge:ingots/gold',             // 金
        '#forge:gems/ambrosium',          // 神能晶
        '#forge:ingots/ostrum',           // 紫金
        '#forge:storage_blocks/sulfur',   // 硫磺块
        'yungscavebiomes:rare_ice',       // 魔幻冰
        '#forge:ingots/ironwood',         // 铁木锭
        'minecraft:ghast_tear',           // 恶魂泪
        'twilightforest:arctic_fur'       // 极地毛坯
    ])

    // 阶段1
    event.add("slashblade_sendims:drc_health_material_1", [
        "undergarden:utherium_crystal",                         // 御腐水晶
        "undergarden:cloggrum_ingot",                           // 厄瑟锭
        "enderio:double_layer_capacitor",                       // 双层电容
        "cataclysm:koboleton_bone",                             // 骸龙之骨
        "midnight:ebonite",                                     // 黯铁
        "undergarden:froststeel_ingot",                         // 霜钢
        "spartanshields:ingot_enderium",                        // 末影锭
        "cyclic:sprout_seed",                                   // 魔豆
        "kubejs:mercury_refractory_structural_component",       // 墨丘利组件
        "kubejs:menril-silicon_sic_sic_cmc_ingot"               // menril-silicon_sic_sic_cmc_ingot
    ])
    event.add("slashblade_sendims:drc_damage_material_1", [
        "midnight:corrupted_pearl",                 // 腐化珍珠
        "midnight:nagrilite_ingot",                 // 夜冥锭
        "midnight:bloomcrystal",                    // 紫菘结晶
        "kubejs:mysterious_alkali_crystal",         // 神秘碱晶
        "#forge:ingots/calorite",                   // 耐热金属
        "midnight:dark_pearl",                      // 黑暗珍珠
        "midnight:virilux",                         // 幽光
        "minecraft:netherite_scrap",                // 下界合金碎片
        "minecraft:wither_skeleton_skull",          // 凋零头
        "cataclysm:ancient_metal_ingot"             // 远古金属锭
    ])

    // 阶段2
    event.add("slashblade_sendims:drc_health_material_2", [
        "nuclearcraft:magnesium_ingot",                 // 镁锭
        "kubejs:bizarre_matter_dust",                   // 奇异物质尘
        "the_bumblezone:redstone_honey_web",            // 红石蜜蜂网
        "nuclearcraft:empty_sink",                      // 空散热器
        "enderio:end_steel_ingot",                      // 末地钢
        "kubejs:delta_dust",                            // 德尔塔尘
        "kubejs:multifaceted_ambrosia",                 // 多面蜜酒
        "undergarden:forgotten_ingot"                   // 遗忆锭
    ])
    event.add("slashblade_sendims:drc_damage_material_2", [
        "nuclearcraft:thorium_ingot",              // 钍锭
        "nuclearcraft:lithium_ingot",              // 锂锭
        "undergarden:regalium_crystal",            // 贵豪
        "integrateddynamics:logic_director",       // 逻辑导向
        "kubejs:alpha_dust",                       // alpha
    ])

    // 阶段3
    event.add("slashblade_sendims:drc_health_material_3", [
        "kubejs:ml_computing_ingot",               // ML计算锭
        "kubejs:chaotic_truth",                    // 混沌真理
        "kubejs:galatic_cycle_component"           // 星空循环组件
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
