ServerEvents.recipes(event => {
    event.shapeless('kubejs:difficulty_selector', [
        'minecraft:book',
        'minecraft:moss_block'
    ]).id('sdbf:difficulty_selector')

    event.shapeless('kubejs:difficulty_locker', [
        'kubejs:difficulty_selector'
    ]).id('sdbf:difficulty_locker')

    event.shapeless('kubejs:linear_quest_book',
        'ftbquests:book')
        .id('sdbf:linear_quest_book_from_quest_book')
        
    event.shapeless('ftbquests:book',
        'kubejs:linear_quest_book')
        .id('sdbf:quest_book_from_linear_quest_book')

    event.shaped('kubejs:star_chart', [
        'FFF',
        'FFF',
        'FFF'
    ], {
        F: 'kubejs:star_chart_fragment'
    })
        .modifyResult((grid, result) => {
            let targetDimension = '';

            for (let slot = 0; slot < 9; slot++) {
                let fragment = grid.get(slot);
                let dimension = fragment.nbt ? String(fragment.nbt.getString('dimension')) : '';
                if (!dimension) return Item.of('minecraft:air');

                if (!targetDimension) {
                    targetDimension = dimension;
                } else if (dimension !== targetDimension) {
                    return Item.of('minecraft:air');
                }
            }

            result.getOrCreateTag().putString('dimension', targetDimension);
            return result;
        })
        .id('sdbf:star_chart')

    event.shapeless('slashblade:proudsoul_tiny',
        [Item.of('slashblade_sendims:blood_jade')])
        .modifyResult((grid, result) => {
            let bloodJade = grid.find('slashblade_sendims:blood_jade');
            if (bloodJade && bloodJade.nbt) {
                let count = Math.floor(bloodJade.nbt.getInt('sbsd.bj.kill_count') / 15);
                count = Math.max(1, Math.min(56, count));
                return Item.of('slashblade:proudsoul_tiny', count);
            }

            return result;
        })
        .id("sdbf:jade_to_soul")

    event.shapeless('slashblade:proudsoul_sphere',
        ['slashblade_sendims:principle_of_sword_arts', 'slashblade:proudsoul_sphere'])
        .keepIngredient('slashblade_sendims:principle_of_sword_arts')
        .modifyResult((grid, result) => {
            let principle = grid.find('slashblade_sendims:principle_of_sword_arts');
            if (principle && principle.nbt &&
                principle.nbt.principle_of_sword_arts && principle.nbt.principle_of_sword_arts.item_list) {
                result.getOrCreateTag().item_list = principle.nbt.principle_of_sword_arts.item_list;
            }

            return result;
        })
        .id("sdbf:principle_of_sword_arts_copy_sas")

    event.shapeless('slashbladeskin:sheath_design_drawing',
        ['last_smith:scroll_basic', 'minecraft:writable_book', 'slashblade:proudsoul'])
        .id("sdbf:sheath_design_drawing")

    event.shaped('2x integrateddynamics:logic_director', [
        'ACA',
        'ABA',
        'ACA'
    ], {
        A: 'integrateddynamics:crystalized_chorus_chunk',
        B: 'slashblade:proudsoul_sphere',
        C: 'integrateddynamics:crystalized_menril_chunk'
    }).id('sdbf:logic_director')

    event.shaped('draconicevolution:advanced_dislocator', [
        'ACA',
        'BDB',
        'ABA'
    ], {
        A: 'wormhole:portal_stabilizer',
        B: 'wormhole:advanced_target_device',
        C: 'wormhole:advanced_target_cell',
        D: 'wormhole:advanced_energy_cell'
    }).id('sdbf:advanced_dislocator')

    event.shaped('minecraft:enchanting_table', [
        ' A ',
        'BCB',
        'DED'
    ], {
        A: 'apotheosis:hellshelf',
        B: 'kubejs:scoria_ingot',
        C: 'integrateddynamics:logic_programmer',
        D: 'minecraft:obsidian',
        E: 'minecraft:crying_obsidian'
    }).id('sdbf:enchanting_table')

    event.shaped('slashblade_sendims:principle_of_sword_arts', [
        'ABE',
        'ACF',
        'ADE'
    ], {
        A: 'akashictome:tome',
        B: 'last_smith:scroll_sakura',
        C: 'last_smith:scroll_blade',
        D: 'last_smith:scroll_basic',
        E: 'last_smith:sakura_sphere',
        F: Item.of('patchouli:guide_book', '{"patchouli:book":"last_smith:smith_guide"}').weakNBT()
    }).id('sdbf:principle_of_sword_arts')

    event.shaped('ae2:mysterious_cube', [
        'DAD',
        'BEC',
        'DAD'
    ], {
        A: 'ae2:charged_certus_quartz_crystal',
        B: 'computercraft:computer_normal',
        C: 'computercraft:disk_drive',
        D: '#forge:plates/steel',
        E: '#forge:obsidian'
    }).id('sdbf:mysterious_cube')

    // s3
    // Placbo 硬编码
    event.shaped('apotheosis:hellshelf', [
        'ESE',
        'ABC',
        'ESE'
    ], {
        E: 'minecraft:nether_bricks',
        B: '#forge:bookshelves',
        A: '#forge:rods/blaze',
        C: Item.of('minecraft:potion', '{Potion:"minecraft:regeneration"}').weakNBT(),
        S: 'slashblade:proudsoul_ingot'
    }).id('apotheosis:hellshelf')

    // s3-4
    // Placbo 硬编码
    event.shaped('apotheosis:seashelf', [
        'ESE',
        'ABC',
        'ESE'
    ], {
        E: 'minecraft:prismarine_bricks',
        B: '#forge:bookshelves',
        A: 'minecraft:pufferfish',
        C: 'minecraft:potion',
        S: 'slashblade:proudsoul_sphere'
    }).id('apotheosis:seashelf')

    // s4
    event.shaped('apotheosis:dormant_deepshelf', [
        'ESE',
        'BBB',
        'ESE'
    ], {
        E: '#apotheosis:deepslate',
        B: 'minecraft:book',
        S: 'kubejs:delta_dust'
    }).id('sdbf:dormant_deepshelf')

    // s4-5
    event.shaped('apotheosis:endshelf', [
        'ESE',
        'IBP',
        'ESE'
    ], {
        E: 'minecraft:end_stone_bricks',
        I: 'apotheosis:infused_breath',
        B: '#forge:bookshelves', // 标签使用 # 前缀 / Tags use the # prefix
        P: 'minecraft:ender_pearl',
        S: 'slashblade:proudsoul_crystal'
    }).id('sdbf:endshelf')

    event.shaped('slashblade_sendims:estus_flask_1', [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: '#forge:gems/amethyst',
        B: ['aether:ambrosium_shard', '#forge:ingots/ironwood', '#forge:ingots/desh'],
        C: 'slashblade_sendims:estus_flask_0'
    }).id('sdbf:estus_flask_1')

    event.shaped('slashblade_sendims:estus_flask_2', [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: 'minecraft:netherite_scrap',
        B: ['#forge:ingots/knightmetal', '#forge:gems/carminite', '#forge:ingots/ostrum'],
        C: 'slashblade_sendims:estus_flask_1'
    }).id('sdbf:estus_flask_2')

    event.shaped('slashblade_sendims:estus_flask_3', [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: ['kubejs:mysterious_alkali_crystal', 'enderio:end_steel_ingot'],
        B: ['kubejs:scoria_ingot', '#forge:ingots/forgotten_metal'],
        C: 'slashblade_sendims:estus_flask_2'
    }).id('sdbf:estus_flask_3')

    event.shaped('slashblade_sendims:estus_flask_4', [
        'ABA',
        'BCB',
        'ABA'
    ], {
        A: ["minecraft:dragon_head", '#forge:ingots/terrasteel'],
        B: ['minecraft:elytra', '#forge:storage_blocks/platinum'],
        C: 'slashblade_sendims:estus_flask_3'
    }).id('sdbf:estus_flask_4')

    event.custom({
        "type": "sophisticatedbackpacks:basic_backpack",
        "conditions": [
            {
                "type": "sophisticatedcore:item_enabled",
                "itemRegistryName": "sophisticatedbackpacks:backpack"
            }
        ],
        "key": {
            "C": {
                "item": "quark:crate"
            },
            "L": {
                "tag": "forge:leather"
            },
            "S": {
                "tag": "forge:string"
            }
        },
        "pattern": [
            "SLS",
            "SCS",
            "LLL"
        ],
        "result": {
            "item": "sophisticatedbackpacks:backpack"
        }
    }).id("sdbf:basic_backpack")

    event.custom({
        "type": "sophisticatedbackpacks:backpack_upgrade",
        "conditions": [
            {
                "type": "sophisticatedcore:item_enabled",
                "itemRegistryName": "sophisticatedbackpacks:iron_backpack"
            }
        ],
        "key": {
            "B": {
                "item": "sophisticatedbackpacks:copper_backpack"
            },
            "S": {
                "tag": 'forge:ingots/steel'
            }
        },
        "pattern": [
            "SSS",
            "SBS",
            "SSS"
        ],
        "result": {
            "item": "sophisticatedbackpacks:iron_backpack"
        }
    }).id("sdbf:backpack_c_i")

    event.custom({
        "type": "sophisticatedbackpacks:backpack_upgrade",
        "conditions": [
            {
                "type": "sophisticatedcore:item_enabled",
                "itemRegistryName": "sophisticatedbackpacks:gold_backpack"
            }
        ],
        "key": {
            "B": {
                "item": "sophisticatedbackpacks:iron_backpack"
            },
            "G": {
                "tag": 'forge:storage_blocks/gold'
            },
            "S": {
                "item": 'slashblade:proudsoul_ingot'
            }
        },
        "pattern": [
            "GSG",
            "SBS",
            "GSG"
        ],
        "result": {
            "item": "sophisticatedbackpacks:gold_backpack"
        }
    }).id("sdbf:backpack_i_g")

    event.custom({
        "type": "sophisticatedbackpacks:backpack_upgrade",
        "conditions": [
            {
                "type": "sophisticatedcore:item_enabled",
                "itemRegistryName": "sophisticatedbackpacks:diamond_backpack"
            }
        ],
        "key": {
            "B": {
                "item": "sophisticatedbackpacks:gold_backpack"
            },
            "D": {
                "tag": 'forge:storage_blocks/diamond'
            },
            "S": {
                "item": 'slashblade:proudsoul_sphere'
            }
        },
        "pattern": [
            "DSD",
            "SBS",
            "DSD"
        ],
        "result": {
            "item": "sophisticatedbackpacks:diamond_backpack"
        }
    }).id("sdbf:backpack_g_d")

    event.custom({
        "type": "sophisticatedbackpacks:smithing_backpack_upgrade",
        "addition": {
            "item": 'slashblade:proudsoul_crystal'
        },
        "base": {
            "item": "sophisticatedbackpacks:diamond_backpack"
        },
        "result": {
            "item": "sophisticatedbackpacks:netherite_backpack"
        },
        "template": {
            "item": "minecraft:netherite_upgrade_smithing_template"
        }
    }).id("sdbf:backpack_d_n")

    event.shapeless('kubejs:high_carbon_iron_dust', [
        'thermal:iron_dust',
        'nuclearcraft:charcoal_dust',
        'nuclearcraft:charcoal_dust'
    ]).id('sdbf:high_carbon_iron_dust')

    event.blasting('thermal:steel_ingot', 'kubejs:high_carbon_iron_dust', 0, 600)
        .id('sdbf:steel_ingot_from_high_carbon_iron_dust')

    event.blasting('slashblade:proudsoul_tiny', [
        'slashblade_useful_addon:proud_soul_log'
    ], 0, 1200).id("sdbf:proudsoul_tiny_from_log")

    event.recipes.thermal.refinery([
        'slashblade:proudsoul_tiny',
        Fluid.of("minecraft:water", 50),
        Fluid.of("thermal:resin", 50)
    ],
        Fluid.of("kubejs:melted_proudsoul", 250)
    ).id("sdbf:proudsoul_tiny_from_fluid")

    event.recipes.thermal.smelter([
        Item.of('slashblade:proudsoul'),
        Item.of('slashblade:proudsoul_tiny').withChance(0.95)
    ], [
        Item.of('thermal:florb', '{Fluid:{Amount:1000,FluidName:"kubejs:melted_proudsoul"}}').weakNBT(),
        '#forge:rosin',
        'nuclearcraft:dimensional_blend_dust'
    ])
        .energy(16384)
        .id("sdbf:proudsoul_from_smelter")

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_ingot', [
        '2x #forge:ingots/steel',
        '4x slashblade:proudsoul',
        '3x minecraft:blaze_powder'
    ]).id('sdbf:proudsoul_ingot')

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_sphere', [
        '2x integrateddynamics:proto_chorus',
        '3x slashblade:proudsoul_ingot',
        '4x nuclearcraft:borax_dust'
    ]).id("sdbf:proudsoul_sphere")

    // TODO 替换基岩为真正的材料
    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_crystal', [
        '3x the_bumblezone:glistering_honey_crystal',
        '3x slashblade:proudsoul_sphere',
        '3x productivebees:upgrade_base'
    ]).id("sdbf:proudsoul_crystal")

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_trapezohedron', [
        '6x slashblade:proudsoul_crystal',
        'minecraft:bedrock'
    ]).id("sdbf:proudsoul_trapezohedron")

    event.recipes.thermal.smelter('slashblade:proudsoul_ingot', [
        '2x #forge:ingots/steel',
        '3x slashblade:proudsoul',
        '3x minecraft:blaze_powder'
    ])
        .energy(8192)
        .id("sdbf:proudsoul_ingot_acc")

    event.recipes.thermal.smelter('slashblade:proudsoul_sphere', [
        'integrateddynamics:proto_chorus',
        '2x slashblade:proudsoul_ingot',
        '3x nuclearcraft:borax_dust'
    ])
        .energy(8192)
        .id("sdbf:proudsoul_sphere_acc")

    event.recipes.thermal.smelter('2x slashblade:proudsoul_crystal', [
        '5x slashblade:proudsoul_sphere',
        '4x the_bumblezone:glistering_honey_crystal',
        '3x productivebees:upgrade_base'
    ])
        .energy(16384)
        .id("sdbf:proudsoul_crystal_acc")

    event.recipes.thermal.smelter('slashblade:proudsoul_trapezohedron', [
        '5x slashblade:proudsoul_crystal',
        'slashblade_useful_addon:soul_crystal',
        'minecraft:bedrock'
    ])
        .energy(32768)
        .id("sdbf:proudsoul_trapezohedron_acc")

    event.custom({
        type: 'integrateddynamics:crafting_special_energycontainer_combination',
        item: 'integrateddynamics:energy_battery',
        maxCapacity: 128000000
    }).id("sdbf:combine_batteries");

})


