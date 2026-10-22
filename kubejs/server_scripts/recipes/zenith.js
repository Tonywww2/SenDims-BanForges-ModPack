// 天顶配方逐项定义于本脚本，研究材料与成品配方不读取外部配置。
// LastSmith 原生研究保留刀本体；配方仅在加载或重载时注册。
ServerEvents.recipes(event => {

    // 移除旧版魔剑直接合成配方
    event.remove({
        'id': 'sdbf:dragon_steel_ice_s4'
    });

    // 研究：龙王铸「雷龙刀」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:dragon_steel_lightning',
                    'kill': 22500,
                    'proud_soul': 200000,
                    'refine': 100
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_sphere'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_dragon_steel_lightning'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_dragon_steel_lightning');

    // 研究：疾风（ssa_hayate）
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade:ssa_hayate',
                    'kill': 5000,
                    'proud_soul': 50000,
                    'refine': 50
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_sphere'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_ssa_hayate'
            }
        }
    ).id('sdbf:zenith/research/slashblade_ssa_hayate');

    // 研究：「大地之刃」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_addon:terra_blade',
                    'kill': 2500,
                    'proud_soul': 50000,
                    'refine': 50
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_sphere'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_addon_terra_blade'
            }
        }
    ).id('sdbf:zenith/research/slashblade_addon_terra_blade');

    // 研究：神威刀「乌卡」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_addon:kamuy_water',
                    'kill': 22500,
                    'proud_soul': 200000,
                    'refine': 100
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_sphere'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_addon_kamuy_water'
            }
        }
    ).id('sdbf:zenith/research/slashblade_addon_kamuy_water');

    // 研究：龙王铸「炎龙刀」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:dragon_steel_fire',
                    'kill': 22500,
                    'proud_soul': 200000,
                    'refine': 100
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_sphere'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_dragon_steel_fire'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_dragon_steel_fire');

    // 研究：「大黑天」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade:mahakala_black',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_mahakala_black'
            }
        }
    ).id('sdbf:zenith/research/slashblade_mahakala_black');

    // 研究：赫刀「魂灵影」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade:red_blade_black_soul',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_red_blade_black_soul'
            }
        }
    ).id('sdbf:zenith/research/slashblade_red_blade_black_soul');

    // 研究：终狱刀「绝念」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:nihilbxex',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_nihilbxex'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_nihilbxex');

    // 研究：红樱
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'redtassel:redtassel_slashblade',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_redtassel_redtassel_slashblade'
            }
        }
    ).id('sdbf:zenith/research/redtassel_redtassel_slashblade');

    // 研究：双役刀「碧玉四杠」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:yakuman_hekigyoku_suukantsu',
                    'kill': 30000,
                    'proud_soul': 300000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_yakuman_hekigyoku_suukantsu'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_yakuman_hekigyoku_suukantsu');

    // 研究：极神威「阿贝」·灼热影舞
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:kamuyex_fire',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_kamuyex_fire'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_kamuyex_fire');

    // 研究：极神威「乌卡」·惊涛碎岳
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:kamuyex_water',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_kamuyex_water'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_kamuyex_water');

    // 研究：极神威「坎那」·时序惊蛰
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:kamuyex_ligghtning',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_kamuyex_ligghtning'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_kamuyex_ligghtning');

    // 研究：极神威「莉芙」·至生颂魂
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:kamuyex_life',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_kamuyex_life'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_kamuyex_life');

    // 研究：极神威「帝斯陀」·冥灾帝陨
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:kamuyex_death',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_kamuyex_death'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_kamuyex_death');

    // 研究：双役刀「三元字敕」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:yakuman_sangen_jirei',
                    'kill': 30000,
                    'proud_soul': 300000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_yakuman_sangen_jirei'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_yakuman_sangen_jirei');

    // 研究：无名王者「无冠」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade:nameless_king',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_nameless_king'
            }
        }
    ).id('sdbf:zenith/research/slashblade_nameless_king');

    // 研究：「誓约胜利之剑」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:excalibur',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_excalibur'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_excalibur');

    // 研究：天云「无光」速子
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'last_smith:uma_tachyon',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_last_smith_uma_tachyon'
            }
        }
    ).id('sdbf:zenith/research/last_smith_uma_tachyon');

    // 研究：六役刀「四象归一」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:yakuman_shishou_kiitsu',
                    'kill': 100000,
                    'proud_soul': 1500000,
                    'refine': 200
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_yakuman_shishou_kiitsu'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_yakuman_shishou_kiitsu');

    // 研究：三役刀「天授国士」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:yakuman_tenju_kokushi',
                    'kill': 45000,
                    'proud_soul': 500000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_yakuman_tenju_kokushi'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_yakuman_tenju_kokushi');

    // 研究：三役刀「地生九莲」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:yakuman_chisei_chuuren',
                    'kill': 45000,
                    'proud_soul': 500000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_yakuman_chisei_chuuren'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_yakuman_chisei_chuuren');

    // 研究：咒王刀「御厨子」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:mizushi',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_mizushi'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_mizushi');

    // 研究：「永罚」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:greatsword_of_damnation_final',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_greatsword_of_damnation_final'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_greatsword_of_damnation_final');

    // 研究：极神威「诺克特」·暗轮破斩
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'sjap_adder:kamuyex_dark',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_sjap_adder_kamuyex_dark'
            }
        }
    ).id('sdbf:zenith/research/sjap_adder_kamuyex_dark');

    // 研究：「文始」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'last_smith:bunshi',
                    'kill': 20000,
                    'proud_soul': 200000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_last_smith_bunshi'
            }
        }
    ).id('sdbf:zenith/research/last_smith_bunshi');

    // 研究：双役刀「清老四刻」
    event.custom(
        {
            'type': 'last_smith:research',
            'blade': {
                'type': 'slashblade:blade',
                'item': 'slashblade:slashblade',
                'request': {
                    'name': 'slashblade_sendims:yakuman_chinrou_suukou',
                    'kill': 30000,
                    'proud_soul': 300000,
                    'refine': 150
                }
            },
            'paper': {
                'item': 'last_smith:scroll_named'
            },
            'ink': {
                'item': 'slashblade:proudsoul_crystal'
            },
            'output': {
                'item': 'kubejs:zenith_research_slashblade_sendims_yakuman_chinrou_suukou'
            }
        }
    ).id('sdbf:zenith/research/slashblade_sendims_yakuman_chinrou_suukou');

    // 魔剑：研究总卷
    event.shapeless(
        'kubejs:zenith_scroll_magic',
        [
            'kubejs:zenith_research_sjap_adder_dragon_steel_lightning',
            'kubejs:zenith_research_slashblade_ssa_hayate',
            'kubejs:zenith_research_slashblade_addon_terra_blade',
            'kubejs:zenith_research_slashblade_addon_kamuy_water',
            'kubejs:zenith_research_sjap_adder_dragon_steel_fire',
            'botania:gaia_ingot',
            'kubejs:basepoint_alloy',
            'slashblade:proudsoul_sphere'
        ]
    ).id('sdbf:zenith/master/magic');

    // 魔剑：成品
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'PSP',
            'ABA',
            'PMP'
        ],
        {
            'P': 'slashblade:proudsoul_crystal',
            'S': 'kubejs:zenith_scroll_magic',
            'A': 'botania:gaia_ingot',
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('sjap_adder:dragon_steel_lightning')
                    .killCount(22500)
                    .proudSoul(200000)
                    .refineCount(100)
                    .build()
            ),
            'M': 'kubejs:basepoint_alloy'
        },
        'sjap_adder:dragon_steel_ice'
    ).id('sdbf:zenith/blade/magic');

    // 黑冠：研究总卷
    event.shapeless(
        'kubejs:zenith_scroll_black_crown',
        [
            'kubejs:zenith_research_slashblade_mahakala_black',
            'kubejs:zenith_research_slashblade_red_blade_black_soul',
            'kubejs:zenith_research_sjap_adder_nihilbxex',
            'kubejs:zenith_research_redtassel_redtassel_slashblade',
            'kubejs:zenith_research_slashblade_sendims_yakuman_hekigyoku_suukantsu',
            'kubejs:epsilon_dust',
            'kubejs:unmelting_ice',
            'slashblade:proudsoul_trapezohedron'
        ]
    ).id('sdbf:zenith/master/black_crown');

    // 黑冠：成品
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'PSP',
            'ABA',
            'PMG'
        ],
        {
            'P': 'slashblade:proudsoul_trapezohedron',
            'S': 'kubejs:zenith_scroll_black_crown',
            'A': 'kubejs:unmelting_ice',
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:red_blade_black_soul')
                    .killCount(30000)
                    .proudSoul(300000)
                    .refineCount(150)
                    .build()
            ),
            'M': 'kubejs:epsilon_dust',
            'G': 'elder_bosses:gate_fragment'
        },
        'slashblade_sendims:zenith_false_black_crown'
    ).id('sdbf:zenith/blade/black_crown');

    // 神威：研究总卷
    event.shapeless(
        'kubejs:zenith_scroll_divine_might',
        [
            'kubejs:zenith_research_sjap_adder_kamuyex_fire',
            'kubejs:zenith_research_sjap_adder_kamuyex_water',
            'kubejs:zenith_research_sjap_adder_kamuyex_ligghtning',
            'kubejs:zenith_research_sjap_adder_kamuyex_life',
            'kubejs:zenith_research_sjap_adder_kamuyex_death',
            'kubejs:zenith_research_slashblade_sendims_yakuman_sangen_jirei',
            'kubejs:epsilon_dust',
            'kubejs:rainbowshift_entropy',
            'slashblade:proudsoul_trapezohedron'
        ]
    ).id('sdbf:zenith/master/divine_might');

    // 神威：成品
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'PSP',
            'ABA',
            'PMG'
        ],
        {
            'P': 'slashblade:proudsoul_trapezohedron',
            'S': 'kubejs:zenith_scroll_divine_might',
            'A': 'kubejs:epsilon_dust',
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('sjap_adder:kamuyex_water')
                    .killCount(30000)
                    .proudSoul(300000)
                    .refineCount(150)
                    .build()
            ),
            'M': 'elder_bosses:rune_fragment',
            'G': 'elder_bosses:gate_fragment'
        },
        'slashblade_sendims:zenith_false_divine_might'
    ).id('sdbf:zenith/blade/divine_might');

    // 王权：研究总卷
    event.shapeless(
        'kubejs:zenith_scroll_kingship',
        [
            'kubejs:zenith_research_slashblade_nameless_king',
            'kubejs:zenith_research_slashblade_sendims_excalibur',
            'kubejs:zenith_research_last_smith_uma_tachyon',
            'kubejs:zenith_research_slashblade_sendims_yakuman_shishou_kiitsu',
            'kubejs:zenith_research_slashblade_sendims_yakuman_tenju_kokushi',
            'kubejs:zenith_research_slashblade_sendims_yakuman_chisei_chuuren',
            'deeprealm_4th:star_slurry_crystal',
            'kubejs:rainbowshift_entropy',
            'slashblade:proudsoul_trapezohedron'
        ]
    ).id('sdbf:zenith/master/kingship');

    // 王权：成品
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'PSP',
            'ABA',
            'PMG'
        ],
        {
            'P': 'slashblade:proudsoul_trapezohedron',
            'S': 'kubejs:zenith_scroll_kingship',
            'A': 'deeprealm_4th:star_slurry_crystal',
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_king')
                    .killCount(30000)
                    .proudSoul(300000)
                    .refineCount(150)
                    .build()
            ),
            'M': 'kubejs:rainbowshift_entropy',
            'G': 'elder_bosses:gate_fragment'
        },
        'slashblade_sendims:zenith_false_kingship'
    ).id('sdbf:zenith/blade/kingship');

    // 暗咒：研究总卷
    event.shapeless(
        'kubejs:zenith_scroll_dark_curse',
        [
            'kubejs:zenith_research_slashblade_sendims_mizushi',
            'kubejs:zenith_research_slashblade_sendims_greatsword_of_damnation_final',
            'kubejs:zenith_research_sjap_adder_kamuyex_dark',
            'kubejs:zenith_research_last_smith_bunshi',
            'kubejs:zenith_research_slashblade_sendims_yakuman_chinrou_suukou',
            'kubejs:unmelting_ice',
            'kubejs:rainbowshift_entropy',
            'slashblade:proudsoul_trapezohedron'
        ]
    ).id('sdbf:zenith/master/dark_curse');

    // 暗咒：成品
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'PSP',
            'ABA',
            'PMG'
        ],
        {
            'P': 'slashblade:proudsoul_trapezohedron',
            'S': 'kubejs:zenith_scroll_dark_curse',
            'A': 'kubejs:unmelting_ice',
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:mizushi')
                    .killCount(30000)
                    .proudSoul(300000)
                    .refineCount(150)
                    .build()
            ),
            'M': 'kubejs:rainbowshift_entropy',
            'G': 'elder_bosses:gate_fragment'
        },
        'slashblade_sendims:zenith_false_dark_curse'
    ).id('sdbf:zenith/blade/dark_curse');
});
