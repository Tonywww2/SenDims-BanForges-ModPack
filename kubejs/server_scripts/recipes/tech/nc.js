// 硼砂湿法提硼用到的两个自定义流体标签（流体本体在 startup_scripts/reg.js 注册）
ServerEvents.tags('fluid', event => {
    event.add('forge:molten_borax', 'kubejs:molten_borax')
    event.add('forge:molten_nickel', 'kubejs:molten_nickel')
})

ServerEvents.recipes(event => {

    event.shapeless("tofucraft:salt_block", [
        '9x #forge:salt'
    ]).id("sdbf:salt_block")

    // event.shapeless('nuclearcraft:rhodochrosite_dust', [
    //     '9x minecraft:granite'
    // ]).id("sdbf:rhodochrosite_dust")

    event.shapeless('nuclearcraft:glowing_mushroom', [
        '#forge:mushrooms',
        '2x #forge:dusts/glowstone'
    ]).id("sdbf:glowing_mushroom")

    event.shaped('3x nuclearcraft:plate_basic', [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: ['#forge:dusts/graphite', '#forge:storage_blocks/charcoal', '#forge:storage_blocks/coal'],
        B: '#forge:ingots/lead',
        C: 'integrateddynamics:crystalized_menril_block_slab'
    }).id('sdbf:plate_basic')

    let pressurizerPlateRecipes = [
        ['calorite', 'ad_astra:calorite_plate'],
        ['constantan', 'thermal:constantan_plate'],
        ['desh', 'ad_astra:desh_plate'],
        ['enderium', 'thermal:enderium_plate'],
        ['gold', 'thermal:gold_plate'],
        ['invar', 'thermal:invar_plate'],
        ['nickel', 'thermal:nickel_plate'],
        ['ostrum', 'ad_astra:ostrum_plate'],
        ['rose_gold', 'thermal:rose_gold_plate']
    ]

    pressurizerPlateRecipes.forEach(([material, output]) => {
        event.custom({
            type: 'nuclearcraft:pressurizer',
            input: [{ tag: `forge:ingots/${material}` }],
            output: [{ item: output }],
            powerModifier: 1.0,
            radiation: 1.0,
            timeModifier: 1.0
        }).id(`sdbf:nuclearcraft_pressurizer/${material}_plate`)
    })

    event.custom({
        type: 'nuclearcraft:pressurizer',
        input: [{ item: 'ad_astra:etrium_ingot' }],
        output: [{ item: 'ad_astra:etrium_plate' }],
        powerModifier: 1.0,
        radiation: 1.0,
        timeModifier: 1.0
    }).id('sdbf:nuclearcraft_pressurizer/etrium_plate')

    event.custom({
        "type": "nuclearcraft:manufactory",
        "input": [
            Item.of('tofucraft:salt_block').toJson()
        ],
        "output": [
            Item.of('#forge:ingots/lithium').toJson()
        ],
        "powerModifier": 1.0, "radiation": 1.0, "timeModifier": 1.0
    }).id("sdbf:salt_lithium")

    event.shaped('nuclearcraft:decay_hastener', [
        'TBT',
        'TCT',
        'TAT'
    ], {
        B: '#forge:storage_blocks/diamond',  // 标签使用 # 前缀 / Tags use the # prefix
        T: '#forge:ingots/tough_alloy',    // 标签使用 # 前缀 / Tags use the # prefix
        C: '#forge:ingots/tin_silver',     // 标签使用 # 前缀 / Tags use the # prefix
        A: 'nuclearcraft:actuator'
    }).id('sdbf:decay_hastener')

    event.custom({
        "type": "nuclearcraft:alloy_smelter",
        "input": [
            {
                "tag": 'forge:ingots/ostrum'
            },
            {
                "tag": "forge:ingots/steel"
            }
        ],
        "output": [
            {
                "count": 2,
                "item": "nuclearcraft:ferroboron_ingot"
            }
        ],
        "powerModifier": 1.5,
        "radiation": 1.0,
        "timeModifier": 1.7
    }).id("sdbf:tough_alloy_ingot")

    event.custom({
        "type": "nuclearcraft:alloy_smelter",
        "input": [
            {
                "tag": 'forge:storage_blocks/ostrum'
            },
            {
                "tag": 'forge:ingots/extreme'
            }
        ],
        "output": [
            {
                "count": 2,
                "item": 'nuclearcraft:thermoconducting_ingot'
            }
        ],
        "powerModifier": 1.5,
        "radiation": 1.0,
        "timeModifier": 1.7
    }).id("sdbf:thermoconducting_ingot")

    event.custom({
        "type": "nuclearcraft:pump",
        "input": [
            {
                "item": "nuclearcraft:lava_collector"
            }
        ],
        "outputFluids": [
            {
                "amount": 1000,
                "tag": "minecraft:lava"
            }
        ],
        "powerModifier": 6.0,
        "radiation": 1.0,
        "timeModifier": 0.5
    }).id("sdbf:lava_collect")

    // 球状闪电室：量子升级 → 神铸珍珠，参数同 nuclearcraft:kugelblitz_chamber/upgrade_stack
    event.custom({
        "type": "nuclearcraft:kugelblitz_chamber",
        "input": [{ "item": 'nuclearcraft:upgrade_quantum' }],
        "output": [{ "item": 'apotheosis:mythic_material' }],
        "powerModifier": 1.0, "radiation": 1.0, "timeModifier": 2.0
    }).id("sdbf:kugelblitz_chamber/mythic_material")

    event.custom({
        "type": "nuclearcraft:kugelblitz_chamber",
        "input": [{ "item": 'slashblade:proudsoul_tiny' }],
        "output": [{ "item": 'slashblade:proudsoul_tiny' }],
        "powerModifier": 1.0, "radiation": 1.0, "timeModifier": 1.0
    }).id("sdbf:proudsoul_tiny_quantum")

    // 暮色森林紫色城堡符文砖（终焉高原城堡）：4 个粉碎为硫酸钙粉、氟石粉和镁粉
    event.custom({
        "type": "nuclearcraft:rock_crusher",
        "input": [{ "count": 4, "item": "twilightforest:violet_castle_rune_brick" }],
        "output": [
            { "item": "nuclearcraft:calcium_sulfate_dust" },
            { "item": "nuclearcraft:fluorite_dust" },
            { "item": "nuclearcraft:magnesium_dust" }
        ],
        "powerModifier": 1.0, "radiation": 1.0, "timeModifier": 1.0
    }).id("sdbf:nuclearcraft_rock_crusher/violet_castle_rune_brick")

    // ==========================================================================
    // 硼砂湿法提硼（可选获取方式，不改动原硼矿主线）
    //
    //   末地石 --(岩石粉碎机 3:1，原有)--> 硼砂
    //   硼砂 --(熔化机)--> 熔融硼砂（kubejs:molten_borax）
    //   镍锭/镍粉 --(熔化机)--> 熔融镍（kubejs:molten_nickel）
    //   熔融硼砂 + 熔融镍 --(化工反应堆)--> 熔融硼（forge:molten_boron）
    //   熔融硼 --(铸锭机 90mB)--> 硼锭                                  [原有配方]
    //   熔融硼 --(结晶器 180mB)--> 粗硼（硼碎块） --(制造机)--> 2 硼粉   [旁支]
    //
    //   产率：2 硼砂 + 1 镍锭 --> 2 硼锭
    //         即 1 硼锭 ≈ 3 末地石 + 半块镍矿，另付熔化/化工的电力与时间成本。
    // ==========================================================================

    // 硼砂 --熔化机--> 熔融硼砂
    event.custom({
        "type": "nuclearcraft:melter",
        "input": [{ "tag": "forge:dusts/borax" }],
        "outputFluids": [{ "amount": 180, "tag": "forge:molten_borax" }],
        "powerModifier": 2.0, "radiation": 1.0, "timeModifier": 1.5
    }).id('sdbf:nuclearcraft_melter/molten_borax_from_borax')

    // 镍锭 --熔化机--> 熔融镍
    event.custom({
        "type": "nuclearcraft:melter",
        "input": [{ "tag": "forge:ingots/nickel" }],
        "outputFluids": [{ "amount": 90, "tag": "forge:molten_nickel" }],
        "powerModifier": 1.5, "radiation": 1.0, "timeModifier": 1.0
    }).id('sdbf:nuclearcraft_melter/molten_nickel_from_ingot')

    // 镍粉 --熔化机--> 熔融镍（给直接用粉的玩家）
    event.custom({
        "type": "nuclearcraft:melter",
        "input": [{ "tag": "forge:dusts/nickel" }],
        "outputFluids": [{ "amount": 90, "tag": "forge:molten_nickel" }],
        "powerModifier": 1.5, "radiation": 1.0, "timeModifier": 1.0
    }).id('sdbf:nuclearcraft_melter/molten_nickel_from_dust')

    // 熔融硼砂 + 熔融镍 --化工反应堆--> 熔融硼
    // 镍在硼砂熔体里作助熔/捕集剂，把硼还原出来后镍留渣（游戏内只保留硼产出）
    event.custom({
        "type": "nuclearcraft:chemical_reactor",
        "inputFluids": [
            { "amount": 360, "tag": "forge:molten_borax" },
            { "amount": 90, "tag": "forge:molten_nickel" }
        ],
        "outputFluids": [{ "amount": 180, "tag": "forge:molten_boron" }],
        "powerModifier": 4.0, "radiation": 1.0, "timeModifier": 3.0
    }).id('sdbf:nuclearcraft_chemical_reactor/molten_boron_from_molten_borax')

    // 熔融硼 --结晶器--> 粗硼（给不想走铸锭机、想直接做粉的玩家）
    event.custom({
        "type": "nuclearcraft:crystallizer",
        "inputFluids": [{ "amount": 180, "tag": "forge:molten_boron" }],
        "output": [{ "item": "nuclearcraft:boron_chunk" }],
        "powerModifier": 2.0, "radiation": 1.0, "timeModifier": 2.0
    }).id('sdbf:nuclearcraft_crystallizer/boron_chunk_from_molten_boron')

    // 小制造机：赛特斯石英水晶 / 福鲁伊克斯水晶 → 对应粉，参数同 nuclearcraft:manufactory/quartz
    let manufactoryAeDustRecipes = [
        ['certus_quartz', 'forge:gems/certus_quartz', 'ae2:certus_quartz_dust'],
        ['fluix', 'forge:gems/fluix', 'ae2:fluix_dust']
    ]

    manufactoryAeDustRecipes.forEach(([material, input, output]) => {
        event.custom({
            "type": "nuclearcraft:manufactory",
            "input": [{ "tag": input }],
            "output": [{ "item": output }],
            "powerModifier": 1.0, "radiation": 1.0, "timeModifier": 1.0
        }).id(`sdbf:nuclearcraft_manufactory/${material}_dust`)
    })

})
