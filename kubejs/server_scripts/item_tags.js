ServerEvents.tags("item", event => {
    // event.removeAll('twilightforest:portal/activator')

    // event.add('twilightforest:portal/activator',
    //     'minecraft:nether_star'
    // )

    event.add("slashblade_sendims:blessing_petals_items", [
        '#minecraft:music_discs'

    ])

    // TODO 证章强化材料
    event.add('slashblade_sendims:drc_rank_material_1',
        'minecraft:diamond_block'

    )
    event.add('slashblade_sendims:drc_rank_material_2',
        'deep_aether:stratus_ingot',
        'minecraft:nether_star',

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
        'ae2:fluix_dust',                   // 天晶混合 (通常指福鲁伊克斯粉/混合材料)
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
        // 'quark:blaze_lantern',
        // 'apotheosis:epic_material'
        // "minecraft:bedrock"

    ])
    event.add("slashblade_sendims:drc_damage_material_2", [
        // 'minecraft:netherite_ingot'

    ])
    // 阶段3


})
