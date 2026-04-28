ServerEvents.recipes(event => {
    event.shapeless('slashblade:proudsoul_tiny',
        [Item.of('slashblade_sendims:blood_jade', '{sbsd.bj.kill_count:10}')])
        .modifyResult((grid, result) => {
            let bloodJade = grid.find('slashblade_sendims:blood_jade');
            if (bloodJade && bloodJade.nbt) {
                let count = Math.floor(bloodJade.nbt.getInt('sbsd.bj.kill_count') / 10);
                count = Math.max(1, Math.min(64, count));
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

    event.shaped('integrateddynamics:logic_director', [
        'ACA',
        'ABA',
        'ACA'
    ], {
        A: 'integrateddynamics:crystalized_chorus_chunk',
        B: '#forge:gems/diamond',
        C: 'integrateddynamics:crystalized_menril_chunk'
    }).id('sdbf:logic_director')

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

    event.shaped('apotheosis:dormant_deepshelf', [
        'ESE',
        'BBB',
        'ESE'
    ], {
        E: '#apotheosis:deepslate',
        B: 'minecraft:book',
        S: 'slashblade:proudsoul'
    }).id('sdbf:dormant_deepshelf')

    event.shaped('apotheosis:hellshelf', [
        'ESE',
        'ABC',
        'ESE'
    ], {
        E: 'minecraft:nether_bricks',
        B: Item.of('minecraft:potion', '{Potion:"minecraft:regeneration"}'),
        A: '#forge:rods/blaze',
        C: Item.of('minecraft:potion', '{Potion:"minecraft:regeneration"}').weakNBT(),
        S: 'slashblade:proudsoul_ingot'
    }).id('sdbf:hellshelf')

    event.shaped('apotheosis:endshelf', [
        'ESE',
        'IBP',
        'ESE'
    ], {
        E: 'minecraft:end_stone_bricks',
        I: 'apotheosis:infused_breath',
        B: '#forge:bookshelves', // 标签使用 # 前缀 / Tags use the # prefix
        P: 'minecraft:ender_pearl',
        S: 'slashblade:proudsoul_sphere'
    }).id('sdbf:endshelf')

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
            "I": {
                "item": 'slashblade:proudsoul_ingot'
            },
            "S": {
                "tag": 'forge:ingots/steel'
            }
        },
        "pattern": [
            "SIS",
            "IBI",
            "SIS"
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
                "item": 'slashblade:proudsoul_sphere'
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
                "item": 'slashblade:proudsoul_crystal'
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
            "item": 'slashblade:proudsoul_trapezohedron'
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

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_ingot', [
        '#forge:ingots/steel',
        '3x slashblade:proudsoul',
        '3x minecraft:blaze_powder'
    ]).id('sdbf:proudsoul_ingot')

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_sphere', [
        '2x integrateddynamics:proto_chorus',
        '3x slashblade:proudsoul_ingot',
        '4x nuclearcraft:borax_dust'
    ]).id("sdbf:proudsoul_sphere")

    // TODO 替换基岩为真正的材料
    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_crystal', [
        '3x slashblade:proudsoul_sphere',
        'minecraft:bedrock'
    ]).id("sdbf:proudsoul_crystal")

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_trapezohedron', [
        '3x slashblade:proudsoul_crystal',
        'minecraft:bedrock'
    ]).id("sdbf:proudsoul_trapezohedron")

    event.recipes.thermal.smelter('slashblade:proudsoul_sphere', [
        'integrateddynamics:proto_chorus',
        '2x slashblade:proudsoul_ingot',
        '3x nuclearcraft:borax_dust'
    ])
        .energy(8192)
        .id("sdbf:proudsoul_sphere_acc")

    event.recipes.thermal.smelter('2x slashblade:proudsoul_crystal', [
        '5x slashblade:proudsoul_sphere',
        'minecraft:bedrock'
    ])
        .energy(16384)
        .id("sdbf:proudsoul_crystal_acc")

    event.recipes.thermal.smelter('slashblade:proudsoul_trapezohedron', [
        '2x slashblade:proudsoul_crystal',
        'slashblade_useful_addon:soul_crystal',
        'minecraft:bedrock'
    ])
        .energy(32768)
        .id("sdbf:proudsoul_trapezohedron_acc")

})


