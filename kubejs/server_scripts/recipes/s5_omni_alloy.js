// priority: -50
// All omni-alloy recipes are written directly in this script.
// Native carriers keep their original item classes and state checks.
let omniValidCarrier = (stack, check) => {
    if (!stack || stack.isEmpty()) return false;
    let tag = stack.nbt;
    switch (check) {
        case 'none': return true;
        case 'uv_full': {
            let UV = Java.loadClass('me.desht.pneumaticcraft.common.block.entity.UVLightBoxBlockEntity');
            return UV.getExposureProgress(stack) >= 100;
        }
        case 'brew_absorption':
            return !!tag && String(tag.getString('brewKey')) === 'botania:absorption' && stack.getItem().getSwigsLeft(stack) >= 4;
        case 'strong_swiftness':
            return !!tag && String(tag.getString('Potion')) === 'minecraft:strong_swiftness';
        case 'developed_film': {
            let frames = stack.getItem().getStoredFrames(stack);
            if (frames.isEmpty()) return false;
            for (let i = 0; i < frames.size(); i++) {
                let identifier = frames.get(i).identifier();
                if (identifier.isEmpty() || !identifier.isId()) return false;
            }
            return true;
        }
        case 'photograph': {
            let identifier = stack.getItem().getIdentifier(stack);
            return !identifier.isEmpty() && identifier.isId();
        }
        case 'photo_stack': {
            let photos = stack.getItem().getPhotographs(stack);
            if (photos.size() < 2) return false;
            for (let i = 0; i < photos.size(); i++) {
                let pair = photos.get(i);
                let identifier = pair.getItem().getIdentifier(pair.getItemStack());
                if (identifier.isEmpty() || !identifier.isId()) return false;
            }
            return true;
        }
        default: throw new Error('Unknown omni carrier check: ' + check);
    }
};

ServerEvents.recipes(event => {
    // 祭坛附魔加工 (aether_01)
    event.custom({
        "type": "aether:enchanting",
        "category": "enchanting_misc",
        "ingredient": {
            "item": "kubejs:omni_aether_feed"
        },
        "result": "kubejs:omni_aether_01",
        "cookingtime": 400,
        "experience": 0.1
    }).id('sdbf:omni_alloy/aether_01');

    // 冰冻器加工 (aether_02)
    event.custom({
        "type": "aether:freezing",
        "category": "freezable_blocks",
        "ingredient": {
            "item": "kubejs:omni_aether_01"
        },
        "result": "kubejs:omni_aether_02",
        "cookingtime": 400,
        "experience": 0.1
    }).id('sdbf:omni_alloy/aether_02');

    // 圣石碎片转化 (aether_03)
    event.custom({
        "type": "aether:ambrosium_enchanting",
        "ingredient": {
            "block": "kubejs:omni_aether_03_precursor"
        },
        "result": {
            "block": "kubejs:omni_aether_03_block"
        }
    }).id('sdbf:omni_alloy/aether_03');

    // aether_03_prepare (aether_03_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "aether:holystone"
            },
            {
                "item": "minecraft:amethyst_shard"
            }
        ],
        "result": {
            "item": "kubejs:omni_aether_03_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/aether_03_prepare');

    // 史维特球转化 (aether_04)
    event.custom({
        "type": "aether:swet_ball_conversion",
        "ingredient": {
            "block": "kubejs:omni_aether_03_block"
        },
        "result": {
            "block": "kubejs:omni_aether_04_block"
        }
    }).id('sdbf:omni_alloy/aether_04');

    // 冰石冻结 (aether_05)
    event.custom({
        "type": "aether:icestone_freezable",
        "ingredient": {
            "block": "kubejs:omni_aether_04_block"
        },
        "result": {
            "block": "kubejs:omni_aether_05_block"
        }
    }).id('sdbf:omni_alloy/aether_05');

    // 冰饰品冻结 (aether_06)
    event.custom({
        "type": "aether:accessory_freezable",
        "ingredient": {
            "block": "kubejs:omni_aether_05_block"
        },
        "result": {
            "block": "kubejs:omni_aether_06_block"
        }
    }).id('sdbf:omni_alloy/aether_06');

    // 群系放置转化 (aether_07)
    event.custom({
        "type": "aether:placement_conversion",
        "ingredient": {
            "block": "kubejs:omni_aether_06_block"
        },
        "result": {
            "block": "kubejs:omni_aether_07_block"
        },
        "biome": "#aether:ultracold"
    }).id('sdbf:omni_alloy/aether_07');

    // 枯萎孢子转化 (aether_09)
    event.custom({
        "type": "aether_redux:spore_blighting",
        "ingredient": {
            "block": "kubejs:omni_aether_09_precursor"
        },
        "result": {
            "block": "kubejs:omni_aether_09_block"
        }
    }).id('sdbf:omni_alloy/aether_09');

    // aether_09_prepare (aether_09_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "aether:holystone"
            },
            {
                "item": "minecraft:amethyst_shard"
            }
        ],
        "result": {
            "item": "kubejs:omni_aether_09_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/aether_09_prepare');

    // 深天境组合 (aether_10)
    event.custom({
        "type": "deep_aether:combining",
        "category": "combinable_misc",
        "experience": 0.1,
        "ingredients": [
            {
                "item": "kubejs:omni_aether_assembly_1"
            },
            {
                "item": "deep_aether:bio_crystal"
            },
            {
                "item": "aether:golden_amber"
            }
        ],
        "output": {
            "item": "kubejs:omni_aether_10",
            "count": 1
        },
        "processing_time": 200
    }).id('sdbf:omni_alloy/aether_10');

    // 毒液浸泡 (aether_11)
    event.custom({
        "type": "deep_aether:poison_recipe",
        "ingredient": {
            "item": "kubejs:omni_aether_10"
        },
        "result": {
            "item": "kubejs:omni_aether_11",
            "count": 1
        }
    }).id('sdbf:omni_alloy/aether_11');

    // 金色史维特球转化 (aether_12)
    event.custom({
        "type": "deep_aether:golden_swet_ball_recipe",
        "ingredient": {
            "block": "kubejs:omni_aether_12_precursor"
        },
        "result": {
            "block": "kubejs:omni_aether_12_block"
        }
    }).id('sdbf:omni_alloy/aether_12');

    // aether_12_prepare (aether_12_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "aether:holystone"
            },
            {
                "item": "minecraft:amethyst_shard"
            }
        ],
        "result": {
            "item": "kubejs:omni_aether_12_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/aether_12_prepare');

    // 发光孢子转化 (aether_13)
    event.custom({
        "type": "deep_aether:glowing_spores_recipe",
        "ingredient": {
            "block": "kubejs:omni_aether_12_block"
        },
        "result": {
            "block": "kubejs:omni_aether_13_block"
        }
    }).id('sdbf:omni_alloy/aether_13');

    // 瓦解号角 (aether_14)
    event.custom({
        "type": "twilightforest:crumble_horn",
        "from": "kubejs:omni_aether_13_block",
        "to": "kubejs:omni_aether_14_block"
    }).id('sdbf:omni_alloy/aether_14');

    // 极寒折射镜坯 (aether_assembly_1)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_aether_02"
            },
            "B": {
                "item": "kubejs:omni_aether_07_block"
            }
        },
        "result": {
            "item": "kubejs:omni_aether_assembly_1",
            "count": 1
        }
    }).id('sdbf:omni_alloy/aether_assembly_1');

    // 孢光镀层镜片 (aether_assembly_2)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_aether_11"
            },
            "B": {
                "item": "kubejs:omni_aether_08"
            },
            "C": {
                "item": "kubejs:omni_aether_09_block"
            }
        },
        "result": {
            "item": "kubejs:omni_aether_assembly_2",
            "count": 1
        }
    }).id('sdbf:omni_alloy/aether_assembly_2');

    // 苍穹晶格透镜 (aether_assembly_3)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_aether_assembly_2"
            },
            "B": {
                "item": "kubejs:omni_aether_14_block"
            }
        },
        "result": {
            "item": "kubejs:celestial_lattice_lens",
            "count": 1
        }
    }).id('sdbf:omni_alloy/aether_assembly_3');

    // 冰晶光学毛坯 (aether_feed)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "titan_moon:cryo_alloy_ingot"
            },
            {
                "item": "titan_moon:cryo_alloy_ingot"
            },
            {
                "item": "deeprealm_4th:star_slurry_blank"
            },
            {
                "item": "deeprealm_4th:star_slurry_crystal"
            }
        ],
        "result": {
            "item": "kubejs:omni_aether_feed",
            "count": 1
        }
    }).id('sdbf:omni_alloy/aether_feed');

    // 盐卤凝固 (bio_01)
    event.custom({
        "type": "tofucraft:bittern",
        "process": {
            "fluid": "kubejs:omni_bio_feed"
        },
        "ingredient": {
            "item": "tofucraft:bittern_bottle"
        },
        "result": {
            "item": "kubejs:omni_bio_01_block",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_01');

    // 豆腐锅 (bio_03)
    event.custom({
        "type": "tofucraft:tofu_pot_shapeless",
        "category": "misc",
        "cook_time": 200,
        "exp": 0.1,
        "fluid": {
            "fluid": "minecraft:water"
        },
        "ingredients": [
            {
                "item": "tofucraft:blocktofukinu"
            },
            {
                "item": "minecraft:kelp"
            }
        ],
        "result": {
            "item": "kubejs:omni_bio_03",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_03');

    // 石臼研磨 (bio_07)
    event.custom({
        "type": "sakura:stone_mortar",
        "experience": 0.1,
        "ingredients": [
            {
                "item": "kubejs:omni_bio_assembly_1"
            }
        ],
        "recipeTime": 200,
        "results": [
            {
                "item": "kubejs:omni_bio_07",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/bio_07');

    // 砧板切制 (bio_08)
    event.custom({
        "type": "sakura:chopping",
        "experience": 0.1,
        "ingredient": {
            "item": "kubejs:omni_bio_07"
        },
        "recipeTime": 40,
        "result": {
            "item": "kubejs:omni_bio_08",
            "count": 1
        },
        "tool": {
            "tag": "sakura:tools/knives/fish"
        },
        "byproducts": []
    }).id('sdbf:omni_alloy/bio_08');

    // 烹饪 (bio_09)
    event.custom({
        "type": "sakura:cooking",
        "experience": 0.1,
        "fluid": {
            "null_fluid": true
        },
        "ingredients": [
            {
                "item": "kubejs:omni_bio_08"
            }
        ],
        "recipeTime": 200,
        "result": {
            "item": "kubejs:omni_bio_09",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_09');

    // 发酵 (bio_10)
    event.custom({
        "type": "sakura:fermenting",
        "experience": 0.1,
        "fluid": {
            "fluidTag": "kubejs:omni_external/minecraft/water",
            "amount": 1000
        },
        "ingredients": [
            {
                "item": "minecraft:wheat"
            },
            {
                "item": "minecraft:sugar"
            }
        ],
        "recipeTime": 600,
        "results": [],
        "result_fluid": {
            "fluid": "kubejs:omni_bio_10_fluid",
            "amount": 1000
        }
    }).id('sdbf:omni_alloy/bio_10');

    // 蒸馏 (bio_11)
    event.custom({
        "type": "sakura:distillation",
        "experience": 0.1,
        "fluid": {
            "fluidTag": "kubejs:omni_bio_10_fluid",
            "amount": 1000
        },
        "ingredients": [
            {
                "item": "minecraft:wheat"
            },
            {
                "item": "minecraft:sugar"
            }
        ],
        "recipeTime": 600,
        "results": [],
        "result_fluid": {
            "fluid": "kubejs:omni_bio_11_fluid",
            "amount": 1000
        }
    }).id('sdbf:omni_alloy/bio_11');

    // 蜜蜂方块转化 (bio_13)
    event.custom({
        "type": "productivebees:block_conversion",
        "bee": "productivebees:water",
        "from": {
            "Name": "kubejs:omni_bio_13_precursor"
        },
        "to": {
            "Name": "kubejs:omni_bio_13_block"
        }
    }).id('sdbf:omni_alloy/bio_13');

    // bio_13_prepare (bio_13_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "tofucraft:blocktofukinu"
            },
            {
                "item": "minecraft:honeycomb"
            }
        ],
        "result": {
            "item": "kubejs:omni_bio_13_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_13_prepare');

    // 蜜蜂物品转化 (bio_14)
    event.custom({
        "type": "productivebees:item_conversion",
        "bee": "productivebees:rancher_bee",
        "ingredients": [
            {
                "item": "kubejs:omni_bio_13_block"
            }
        ],
        "result": {
            "item": "kubejs:omni_bio_14",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_14');

    // 蜂蜜离心 (bio_15)
    event.custom({
        "type": "productivebees:centrifuge",
        "ingredient": {
            "item": "kubejs:omni_bio_15_precursor"
        },
        "outputs": [
            {
                "item": {
                    "item": "kubejs:omni_bio_15",
                    "count": 1
                },
                "chance": 1.0
            }
        ]
    }).id('sdbf:omni_alloy/bio_15');

    // bio_15_prepare (bio_15_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "minecraft:honeycomb"
            },
            {
                "item": "minecraft:slime_ball"
            }
        ],
        "result": {
            "item": "kubejs:omni_bio_15_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_15_prepare');

    // 蜂蜜灌装 (bio_16)
    event.custom({
        "type": "productivebees:bottler",
        "fluid": {
            "tag": "forge:honey",
            "amount": 250
        },
        "input": {
            "item": "kubejs:omni_bio_15"
        },
        "output": {
            "item": "kubejs:omni_bio_16",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_16');

    // 陶瓷承压膜 (bio_assembly_1)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_bio_01_block"
            },
            "B": {
                "item": "kubejs:omni_bio_03"
            }
        },
        "result": {
            "item": "kubejs:omni_bio_assembly_1",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_assembly_1');

    // 代谢催化膜 (bio_assembly_2)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_bio_09"
            },
            "B": {
                "item": "kubejs:omni_bio_11_fluid_bucket"
            }
        },
        "result": {
            "item": "kubejs:omni_bio_assembly_2",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_assembly_2');

    // 星浆仿生隔膜 (bio_assembly_3)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_bio_assembly_2"
            },
            "B": {
                "item": "kubejs:omni_bio_14"
            },
            "C": {
                "item": "kubejs:omni_bio_16"
            }
        },
        "result": {
            "item": "kubejs:astral_biomembrane",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_assembly_3');

    // 星浆培养液 (bio_feed)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "titan_moon:azotosome_sheet"
            },
            {
                "item": "titan_moon:azotosome_sheet"
            },
            {
                "item": "titan_moon:polyphosphazene_coenzyme"
            },
            {
                "item": "deeprealm_4th:star_slurry"
            },
            {
                "item": "minecraft:bucket"
            },
            {
                "item": "minecraft:oak_log"
            },
            {
                "item": "minecraft:oak_log"
            },
            {
                "item": "minecraft:honeycomb"
            }
        ],
        "result": {
            "item": "kubejs:omni_bio_feed_bucket",
            "count": 1
        }
    }).id('sdbf:omni_alloy/bio_feed');

    // 机械挤压 (engineering_03)
    event.custom({
        "type": "integrateddynamics:mechanical_squeezer",
        "item": {
            "item": "kubejs:omni_engineering_feed"
        },
        "result": {
            "fluid": {
                "fluid": "kubejs:omni_engineering_03_fluid",
                "amount": 1000
            },
            "items": []
        },
        "duration": 100
    }).id('sdbf:omni_alloy/engineering_03');

    // 机械烘干 (engineering_04)
    event.custom({
        "type": "integrateddynamics:mechanical_drying_basin",
        "fluid": {
            "fluid": "kubejs:omni_engineering_03_fluid",
            "amount": 1000
        },
        "result": {
            "item": "kubejs:omni_engineering_04",
            "count": 1
        },
        "duration": 100
    }).id('sdbf:omni_alloy/engineering_04');

    // 尘烬整合 (engineering_05)
    event.custom({
        "type": "dustandash:integrate",
        "ingredients": [
            {
                "item": "integrateddynamics:crystalized_menril_chunk"
            },
            {
                "item": "dustandash:order_dust"
            }
        ],
        "level": 1,
        "output": {
            "item": "kubejs:omni_engineering_05",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_05');

    // 铣床装配 (engineering_06)
    event.custom({
        "type": "dustandash:milling",
        "key": {
            "A": {
                "item": "kubejs:omni_menril_foil"
            },
            "catalyst": {
                "item": "dustandash:seep_dust"
            }
        },
        "pattern": [
            "AAAAA",
            "AAAAA",
            "AAAAA",
            "AAAAA",
            "AAAAA"
        ],
        "output": {
            "item": "kubejs:omni_engineering_06",
            "count": 1
        },
        "step1": false
    }).id('sdbf:omni_alloy/engineering_06');

    // engineering_06_sheet (engineering_06_sheet)
    event.custom({
        "type": "dustandash:milling",
        "ingredients": [
            {
                "item": "kubejs:omni_engineering_05"
            }
        ],
        "output": {
            "item": "kubejs:omni_menril_foil",
            "count": 25
        },
        "step1": true
    }).id('sdbf:omni_alloy/engineering_06_sheet');

    // 尘烬离心 (engineering_07)
    event.custom({
        "type": "dustandash:centrifuge",
        "ingredients": [
            {
                "item": "kubejs:omni_engineering_06"
            },
            {
                "item": "dustandash:glass_container"
            }
        ],
        "outputs": [
            {
                "item": "kubejs:omni_engineering_07",
                "count": 1
            },
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            }
        ],
        "tick": 200
    }).id('sdbf:omni_alloy/engineering_07');

    // 万用电解 (engineering_08)
    event.custom({
        "type": "dustandash:ionizer",
        "cost": 1,
        "costElectrodes": true,
        "ingredients": [
            {
                "item": "dustandash:mantle_mixture"
            },
            {
                "item": "dustandash:oxygen"
            },
            {
                "item": "dustandash:earth_dust"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "dustandash:graphite_electrode"
            }
        ],
        "inputBlock": "kubejs:omni_engineering_08_precursor",
        "outputBlock": "kubejs:omni_engineering_08_block",
        "outputs": [
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            },
            {
                "item": "dustandash:empty"
            }
        ],
        "tick": 200
    }).id('sdbf:omni_alloy/engineering_08');

    // engineering_08_prepare (engineering_08_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:quartz"
            }
        ],
        "result": {
            "item": "kubejs:omni_engineering_08_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_08_prepare');

    // 合金炉 (engineering_09)
    event.custom({
        "type": "enderio:alloy_smelting",
        "inputs": [
            {
                "ingredient": {
                    "item": "kubejs:omni_engineering_assembly_1"
                },
                "count": 1
            },
            {
                "ingredient": {
                    "item": "enderio:conductive_alloy_ingot"
                },
                "count": 1
            }
        ],
        "result": {
            "item": "kubejs:omni_engineering_09",
            "count": 1
        },
        "energy": 16000,
        "experience": 0.1
    }).id('sdbf:omni_alloy/engineering_09');

    // SAG 磨粉 (engineering_10)
    event.custom({
        "type": "enderio:sag_milling",
        "input": {
            "item": "kubejs:omni_engineering_09"
        },
        "outputs": [
            {
                "item": {
                    "item": "kubejs:omni_engineering_10",
                    "count": 1
                },
                "chance": 1.0,
                "optional": false
            }
        ],
        "energy": 8000
    }).id('sdbf:omni_alloy/engineering_10');

    // 切片加工 (engineering_11)
    event.custom({
        "type": "enderio:slicing",
        "inputs": [
            {
                "item": "kubejs:omni_engineering_10"
            },
            {
                "item": "minecraft:slime_ball"
            },
            {
                "item": "minecraft:quartz"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:redstone"
            },
            {
                "item": "minecraft:amethyst_shard"
            }
        ],
        "output": {
            "item": "kubejs:omni_engineering_11",
            "count": 1
        },
        "energy": 16000
    }).id('sdbf:omni_alloy/engineering_11');

    // 流体罐加工 (engineering_14)
    event.custom({
        "type": "enderio:tank",
        "fluid": {
            "fluid": "enderio:xp_juice",
            "amount": 250
        },
        "input": {
            "item": "kubejs:omni_engineering_14_precursor"
        },
        "output": {
            "item": "kubejs:omni_engineering_14",
            "count": 1
        },
        "is_emptying": false
    }).id('sdbf:omni_alloy/engineering_14');

    // engineering_14_prepare (engineering_14_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "minecraft:glass_bottle"
            },
            {
                "item": "minecraft:redstone"
            }
        ],
        "result": {
            "item": "kubejs:omni_engineering_14_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_14_prepare');

    // 燃油精炼 (engineering_19)
    event.custom({
        "type": "ad_astra:refining",
        "input": {
            "ingredient": {
                "tag": "ad_astra:oil"
            },
            "millibuckets": 1000
        },
        "result": {
            "fluid": "kubejs:omni_engineering_19_fluid",
            "millibuckets": 1000
        },
        "cookingtime": 100,
        "energy": 80
    }).id('sdbf:omni_alloy/engineering_19');

    // 低温燃料制备 (engineering_20)
    event.custom({
        "type": "ad_astra:cryo_freezing",
        "ingredient": {
            "item": "minecraft:blue_ice"
        },
        "result": {
            "fluid": "kubejs:omni_engineering_20_fluid",
            "millibuckets": 1000
        },
        "cookingtime": 200,
        "energy": 80
    }).id('sdbf:omni_alloy/engineering_20');

    // NASA 工作台 (engineering_22)
    event.custom({
        "type": "ad_astra:nasa_workbench",
        "ingredients": [
            {
                "item": "kubejs:omni_engineering_assembly_2"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "ad_astra:steel_tank"
            },
            {
                "item": "ad_astra:steel_tank"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "minecraft:copper_ingot"
            },
            {
                "item": "titan_moon:precision_components"
            },
            {
                "item": "minecraft:copper_ingot"
            }
        ],
        "result": {
            "id": "kubejs:omni_engineering_22",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_22');

    // 星门高级结晶 (engineering_24)
    event.custom({
        "type": "sgjourney:advanced_crystallizing",
        "crystal_base": {
            "item": "kubejs:omni_engineering_assembly_3",
            "amount": 1
        },
        "primary_ingredient": {
            "item": "minecraft:quartz",
            "amount": 1
        },
        "secondary_ingredient": {
            "item": "minecraft:amethyst_shard",
            "amount": 1
        },
        "deplete_primary": true,
        "deplete_secondary": true,
        "input_fluid": {
            "id": "kubejs:omni_engineering_26_fluid",
            "amount": 1000
        },
        "output": {
            "item": "kubejs:omni_engineering_24",
            "count": 1
        },
        "progress": 200
    }).id('sdbf:omni_alloy/engineering_24');

    // Naquadah 重液制备 (engineering_26)
    event.custom({
        "type": "sgjourney:naquadah_heavy_liquidizing",
        "ingredient": {
            "item": "sgjourney:pure_naquadah"
        },
        "input_fluid": {
            "id": "kubejs:omni_engineering_19_fluid",
            "amount": 1000
        },
        "output_fluid": {
            "id": "kubejs:omni_engineering_26_fluid",
            "amount": 1000
        },
        "progress": 200
    }).id('sdbf:omni_alloy/engineering_26');

    // 门瑞欧导电骨架 (engineering_assembly_1)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_engineering_04"
            },
            "B": {
                "item": "kubejs:omni_engineering_07"
            },
            "C": {
                "item": "kubejs:omni_engineering_08_block"
            }
        },
        "result": {
            "item": "kubejs:omni_engineering_assembly_1",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_assembly_1');

    // 灵魂绝缘绕组 (engineering_assembly_2)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_engineering_11"
            },
            "B": {
                "item": "kubejs:omni_engineering_12"
            },
            "C": {
                "item": "kubejs:omni_engineering_14"
            }
        },
        "result": {
            "item": "kubejs:omni_engineering_assembly_2",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_assembly_2');

    // 航天供能线组 (engineering_assembly_3)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_engineering_22"
            },
            "B": {
                "item": "kubejs:omni_engineering_20_fluid_bucket"
            }
        },
        "result": {
            "item": "kubejs:omni_engineering_assembly_3",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_assembly_3');

    // 星门耦合线圈 (engineering_assembly_4)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "A  ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_engineering_24"
            }
        },
        "result": {
            "item": "kubejs:stargate_coupling_coil",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_assembly_4');

    // 星浆导电基材 (engineering_feed)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "titan_moon:precision_components"
            },
            {
                "item": "titan_moon:precision_components"
            },
            {
                "item": "titan_moon:cryo_alloy_ingot"
            },
            {
                "item": "kubejs:rainbowshift_entropy"
            },
            {
                "item": "enderio:grains_of_infinity"
            },
            {
                "item": "enderio:grains_of_infinity"
            }
        ],
        "result": {
            "item": "kubejs:omni_engineering_feed",
            "count": 1
        }
    }).id('sdbf:omni_alloy/engineering_feed');

    // 白雏菊转化 (mana_01)
    event.custom({
        "type": "botania:pure_daisy",
        "input": {
            "type": "block",
            "block": "kubejs:omni_mana_feed"
        },
        "output": {
            "name": "kubejs:omni_mana_01_block"
        },
        "time": 200
    }).id('sdbf:omni_alloy/mana_01');

    // 凝矿兰 (mana_02)
    event.custom({
        "type": "botania:orechid",
        "input": {
            "type": "block",
            "block": "kubejs:omni_mana_01_block"
        },
        "output": {
            "type": "block",
            "block": "kubejs:omni_mana_02_block"
        },
        "weight": 1
    }).id('sdbf:omni_alloy/mana_02');

    // 狱火凝矿兰 (mana_03)
    event.custom({
        "type": "botania:orechid_ignem",
        "input": {
            "type": "block",
            "block": "kubejs:omni_mana_02_block"
        },
        "output": {
            "type": "block",
            "block": "kubejs:omni_mana_03_block"
        },
        "weight": 1
    }).id('sdbf:omni_alloy/mana_03');

    // 石莲转化 (mana_04)
    event.custom({
        "type": "botania:marimorphosis",
        "input": {
            "type": "block",
            "block": "kubejs:omni_mana_03_block"
        },
        "output": {
            "type": "block",
            "block": "kubejs:omni_mana_04_block"
        },
        "weight": 1,
        "biome_bonus": 0,
        "biome_bonus_tag": "botania:marimorphosis_desert_bonus"
    }).id('sdbf:omni_alloy/mana_04');

    // 花瓣药剂台 (mana_05)
    event.custom({
        "type": "botania:petal_apothecary",
        "ingredients": [
            {
                "item": "kubejs:omni_mana_assembly_1"
            },
            {
                "item": "botania:mana_diamond"
            }
        ],
        "output": {
            "item": "kubejs:omni_mana_05",
            "count": 1
        },
        "reagent": {
            "tag": "botania:seed_apothecary_reagent"
        }
    }).id('sdbf:omni_alloy/mana_05');

    // 魔力池注入 (mana_06)
    event.custom({
        "type": "botania:mana_infusion",
        "input": {
            "item": "kubejs:omni_mana_05"
        },
        "output": {
            "item": "kubejs:omni_mana_06",
            "count": 1
        },
        "mana": 20000
    }).id('sdbf:omni_alloy/mana_06');

    // 符文祭坛 (mana_07)
    event.custom({
        "type": "botania:runic_altar",
        "ingredients": [
            {
                "item": "kubejs:omni_mana_06"
            },
            {
                "item": "botania:mana_diamond"
            }
        ],
        "output": {
            "item": "kubejs:omni_mana_07",
            "count": 1
        },
        "mana": 20000
    }).id('sdbf:omni_alloy/mana_07');

    // 泰拉凝聚板 (mana_08)
    event.custom({
        "type": "botania:terra_plate",
        "ingredients": [
            {
                "item": "kubejs:omni_mana_07"
            },
            {
                "item": "botania:mana_diamond"
            }
        ],
        "result": {
            "item": "kubejs:omni_mana_08",
            "count": 1
        },
        "mana": 500000
    }).id('sdbf:omni_alloy/mana_08');

    // 精灵门交易 (mana_09)
    event.custom({
        "type": "botania:elven_trade",
        "ingredients": [
            {
                "item": "kubejs:omni_mana_08"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_mana_09",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/mana_09');

    // 神化附魔 (mana_11)
    event.custom({
        "type": "apotheosis:enchanting",
        "input": {
            "item": "kubejs:omni_mana_11_precursor"
        },
        "requirements": {
            "eterna": 30,
            "quanta": 0,
            "arcana": 0
        },
        "max_requirements": {
            "eterna": -1,
            "quanta": -1,
            "arcana": -1
        },
        "display_level": 30,
        "result": {
            "item": "kubejs:omni_mana_11",
            "count": 1
        }
    }).id('sdbf:omni_alloy/mana_11');

    // mana_11_prepare (mana_11_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "minecraft:lapis_lazuli"
            },
            {
                "item": "minecraft:amethyst_shard"
            }
        ],
        "result": {
            "item": "kubejs:omni_mana_11_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/mana_11_prepare');

    // 神化分解 (mana_12)
    event.custom({
        "type": "apotheosis:salvaging",
        "input": {
            "item": "kubejs:omni_mana_12_precursor"
        },
        "outputs": [
            {
                "min_count": 1,
                "max_count": 1,
                "stack": {
                    "item": "kubejs:omni_mana_12",
                    "count": 1
                }
            }
        ]
    }).id('sdbf:omni_alloy/mana_12');

    // mana_12_prepare (mana_12_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "apotheosis:gem_dust"
            },
            {
                "item": "minecraft:amethyst_shard"
            }
        ],
        "result": {
            "item": "kubejs:omni_mana_12_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/mana_12_prepare');

    // 武器融合 (mana_14)
    event.custom({
        "type": "cataclysm:weapon_fusion",
        "base": {
            "item": "kubejs:omni_mana_assembly_2"
        },
        "addition": {
            "item": "botania:terrasteel_ingot"
        },
        "result": {
            "item": "kubejs:omni_mana_14",
            "count": 1
        }
    }).id('sdbf:omni_alloy/mana_14');

    // 紫晶祝福 (mana_15)
    event.custom({
        "type": "cataclysm:amethyst_bless",
        "ingredients": {
            "item": "kubejs:omni_mana_14"
        },
        "result": {
            "item": "kubejs:omni_mana_15",
            "count": 1
        },
        "time": 200
    }).id('sdbf:omni_alloy/mana_15');

    // 四相活石腔壁 (mana_assembly_1)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "A  ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_mana_04_block"
            }
        },
        "result": {
            "item": "kubejs:omni_mana_assembly_1",
            "count": 1
        }
    }).id('sdbf:omni_alloy/mana_assembly_1');

    // 符文谐振内衬 (mana_assembly_2)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "A  ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_mana_09"
            }
        },
        "result": {
            "item": "kubejs:omni_mana_assembly_2",
            "count": 1
        }
    }).id('sdbf:omni_alloy/mana_assembly_2');

    // 虹移共振腔 (mana_assembly_3)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "D  ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_mana_15"
            },
            "B": {
                "item": "kubejs:omni_mana_10"
            },
            "C": {
                "item": "kubejs:omni_mana_11"
            },
            "D": {
                "item": "kubejs:omni_mana_12"
            }
        },
        "result": {
            "item": "kubejs:iridescent_resonance_chamber",
            "count": 1
        }
    }).id('sdbf:omni_alloy/mana_assembly_3');

    // 虹移腔室基座 (mana_feed)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "kubejs:storm_hydrogen_crystal"
            },
            {
                "item": "kubejs:rainbowshift_entropy"
            },
            {
                "item": "deeprealm_4th:star_slurry_crystal"
            }
        ],
        "result": {
            "item": "kubejs:omni_mana_feed",
            "count": 1
        }
    }).id('sdbf:omni_alloy/mana_feed');

    // 核工制造 (nuclear_01)
    event.custom({
        "type": "nuclearcraft:manufactory",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_feed"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_01",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_01');

    // 核工碎岩 (nuclear_02)
    event.custom({
        "type": "nuclearcraft:rock_crusher",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_01"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_02",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_02');

    // 核工合金熔炼 (nuclear_03)
    event.custom({
        "type": "nuclearcraft:alloy_smelter",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_02"
            },
            {
                "item": "nuclearcraft:boron_ingot"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_03",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_03');

    // 核工加压 (nuclear_04)
    event.custom({
        "type": "nuclearcraft:pressurizer",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_03"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_04",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_04');

    // 核工熔融 (nuclear_05)
    event.custom({
        "type": "nuclearcraft:melter",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_04"
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_05_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_05');

    // 核工铸锭 (nuclear_06)
    event.custom({
        "type": "nuclearcraft:ingot_former",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_05_fluid",
                "amount": 1000
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_06",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_06');

    // 核工提取 (nuclear_07)
    event.custom({
        "type": "nuclearcraft:extractor",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_07_precursor"
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_07_fluid",
                "amount": 1000
            }
        ],
        "output": [
            {
                "item": "minecraft:iron_nugget"
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_07');

    // nuclear_07_prepare (nuclear_07_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "nuclearcraft:boron_ingot"
            },
            {
                "item": "minecraft:quartz"
            }
        ],
        "result": {
            "item": "kubejs:omni_nuclear_07_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_07_prepare');

    // 核工电解 (nuclear_08)
    event.custom({
        "type": "nuclearcraft:electrolyzer",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_07_fluid",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_08_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_08');

    // 同位素分离 (nuclear_09)
    event.custom({
        "type": "nuclearcraft:isotope_separator",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_assembly_1"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_09",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_09');

    // 核工化学反应 (nuclear_10)
    event.custom({
        "type": "nuclearcraft:chemical_reactor",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_external/nuclearcraft/hydrochloric_acid",
                "amount": 1000
            },
            {
                "tag": "kubejs:omni_external/nuclearcraft/sodium_hydroxide_solution",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_10_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_10');

    // 核工流体灌注 (nuclear_11)
    event.custom({
        "type": "nuclearcraft:fluid_infuser",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "minecraft:iron_ingot"
            }
        ],
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_10_fluid",
                "amount": 1000
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_11",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_11');

    // 核工流体富集 (nuclear_12)
    event.custom({
        "type": "nuclearcraft:fluid_enricher",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_12_precursor"
            }
        ],
        "inputFluids": [
            {
                "tag": "kubejs:omni_external/minecraft/water",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_12_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_12');

    // nuclear_12_prepare (nuclear_12_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "minecraft:redstone"
            },
            {
                "item": "minecraft:quartz"
            }
        ],
        "result": {
            "item": "kubejs:omni_nuclear_12_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_12_prepare');

    // 核工离心 (nuclear_13)
    event.custom({
        "type": "nuclearcraft:centrifuge",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_12_fluid",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_13_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_13');

    // 核工浸出 (nuclear_14)
    event.custom({
        "type": "nuclearcraft:leacher",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "minecraft:quartz"
            }
        ],
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_13_fluid",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_14_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_14');

    // 核工结晶 (nuclear_15)
    event.custom({
        "type": "nuclearcraft:crystallizer",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_14_fluid",
                "amount": 1000
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_15",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_15');

    // 核工组装 (nuclear_16)
    event.custom({
        "type": "nuclearcraft:assembler",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_15"
            },
            {
                "item": "minecraft:redstone"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_16",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_16');

    // 气体洗涤 (nuclear_17)
    event.custom({
        "type": "nuclearcraft:gas_scrubber",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_external/nuclearcraft/borax_solution",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_17_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_17');

    // 核工超冷 (nuclear_18)
    event.custom({
        "type": "nuclearcraft:supercooler",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_17_fluid",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_18_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_18');

    // 亚原子液化 (nuclear_19)
    event.custom({
        "type": "nuclearcraft:subatomic_liquifier",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_20_melt",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_19_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_19');

    // nuclear_19_melt (nuclear_19_melt)
    event.custom({
        "type": "nuclearcraft:melter",
        "input": [
            {
                "item": "kubejs:omni_nuclear_20"
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_20_melt",
                "amount": 1000
            }
        ],
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0
    }).id('sdbf:omni_alloy/nuclear_19_melt');

    // 衰变加速 (nuclear_20)
    event.custom({
        "type": "nuclearcraft:decay_hastener",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_assembly_2"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_20",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_20');

    // 核工辐照 (nuclear_21)
    event.custom({
        "type": "nuclearcraft:irradiator",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_19_fluid",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_21_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_21');

    // 核聚变 (nuclear_24)
    event.custom({
        "type": "nuclearcraft:fusion_core",
        "powerModifier": 50000.0,
        "timeModifier": 20.0,
        "radiation": 1.0,
        "temperature": 1200.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_fusion_feed",
                "amount": 1000
            },
            {
                "tag": "kubejs:omni_external/nuclearcraft/helium_3",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_24_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_24');

    // nuclear_24_prepare (nuclear_24_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "nuclearcraft:deuterium_bucket"
            },
            {
                "item": "minecraft:amethyst_shard"
            }
        ],
        "result": {
            "item": "kubejs:omni_fusion_feed_bucket",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_24_prepare');

    // 燃料后处理 (nuclear_25)
    event.custom({
        "type": "nuclearcraft:fuel_reprocessor",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_22"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_25",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_25');

    // 核工换热 (nuclear_26)
    event.custom({
        "type": "nuclearcraft:heat_exchanger_controller",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "heat": 100.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_external/nuclearcraft/high_pressure_steam",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_26_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_26');

    // 裂变沸腾 (nuclear_27)
    event.custom({
        "type": "nuclearcraft:fission_boiling",
        "heatRequired": 400.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_26_fluid",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_27_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_27');

    // 大型涡轮 (nuclear_28)
    event.custom({
        "type": "nuclearcraft:turbine_controller",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_27_fluid",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_28_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_28');

    // 小型蒸汽涡轮 (nuclear_29)
    event.custom({
        "type": "nuclearcraft:steam_turbine",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "inputFluids": [
            {
                "tag": "kubejs:omni_nuclear_28_fluid",
                "amount": 1000
            }
        ],
        "outputFluids": [
            {
                "tag": "kubejs:omni_nuclear_29_fluid",
                "amount": 1000
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_29');

    // 球状闪电加工 (nuclear_30)
    event.custom({
        "type": "nuclearcraft:kugelblitz_chamber",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_assembly_5"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_30",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_30');

    // 靶室 (nuclear_31)
    event.custom({
        "type": "nuclearcraft:target_chamber",
        "powerModifier": 2.0,
        "timeModifier": 2.0,
        "radiation": 0.0,
        "input": [
            {
                "item": "kubejs:omni_nuclear_30"
            }
        ],
        "output": [
            {
                "item": "kubejs:omni_nuclear_31",
                "count": 1
            }
        ],
        "crossSection": 0.064,
        "energyReleased": -20500,
        "maxEnergy": 145000,
        "inputParticles": [
            {
                "amount": 15625000,
                "focus": 1.0,
                "meanEnergy": 100000,
                "particle": "alpha"
            }
        ],
        "outputParticles": [
            {
                "amount": 1,
                "focus": 1.0,
                "meanEnergy": 1,
                "particle": "neutron"
            }
        ]
    }).id('sdbf:omni_alloy/nuclear_31');

    // 致密承束环 (nuclear_assembly_1)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "A  ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_nuclear_06"
            }
        },
        "result": {
            "item": "kubejs:omni_nuclear_assembly_1",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_assembly_1');

    // 同位素过滤层 (nuclear_assembly_2)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "D  ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_nuclear_09"
            },
            "B": {
                "item": "kubejs:omni_nuclear_08_fluid_bucket"
            },
            "C": {
                "item": "kubejs:omni_nuclear_11"
            },
            "D": {
                "item": "kubejs:omni_nuclear_16"
            }
        },
        "result": {
            "item": "kubejs:omni_nuclear_assembly_2",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_assembly_2');

    // 辐照吸收层 (nuclear_assembly_3)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_nuclear_21_fluid_bucket"
            },
            "B": {
                "item": "kubejs:omni_nuclear_18_fluid_bucket"
            }
        },
        "result": {
            "item": "kubejs:omni_nuclear_assembly_3",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_assembly_3');

    // 燃料闭锁环 (nuclear_assembly_4)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "D  ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_nuclear_assembly_3"
            },
            "B": {
                "item": "kubejs:omni_nuclear_25"
            },
            "C": {
                "item": "kubejs:omni_nuclear_23"
            },
            "D": {
                "item": "kubejs:omni_nuclear_24_fluid_bucket"
            }
        },
        "result": {
            "item": "kubejs:omni_nuclear_assembly_4",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_assembly_4');

    // 多级换热环套 (nuclear_assembly_5)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_nuclear_assembly_4"
            },
            "B": {
                "item": "kubejs:omni_nuclear_29_fluid_bucket"
            }
        },
        "result": {
            "item": "kubejs:omni_nuclear_assembly_5",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_assembly_5');

    // 中子约束环 (nuclear_assembly_6)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "A  ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_nuclear_31"
            }
        },
        "result": {
            "item": "kubejs:neutron_confinement_ring",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_assembly_6');

    // 氦封约束环胚 (nuclear_feed)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "titan_moon:cryo_alloy_ingot"
            },
            {
                "item": "titan_moon:cryo_alloy_ingot"
            },
            {
                "item": "kubejs:epsilon_dust"
            },
            {
                "item": "deeprealm_4th:star_slurry_blank"
            },
            {
                "item": "nuclearcraft:helium_bucket"
            }
        ],
        "result": {
            "item": "kubejs:omni_nuclear_feed",
            "count": 1
        }
    }).id('sdbf:omni_alloy/nuclear_feed');

    // 万象合金锭 (omni_alloy_ingot)
    event.custom({
        "type": "deeprealm_4th:combination_forging",
        "result": {
            "item": "kubejs:omni_alloy_ingot",
            "count": 1
        },
        "ingredients": [
            {
                "stack": {
                    "item": "kubejs:omni_billet",
                    "count": 1
                }
            },
            {
                "stack": {
                    "item": "elder_bosses:rune_fragment",
                    "count": 2
                }
            },
            {
                "stack": {
                    "item": "deeprealm_4th:star_slurry_blank",
                    "count": 1
                }
            },
            {
                "stack": {
                    "item": "deeprealm_4th:star_slurry_crystal",
                    "count": 1
                }
            }
        ],
        "clicks": 12,
        "cooldown": 4,
        "levels": 50
    }).id('sdbf:omni_alloy/omni_alloy_ingot');

    // 万象锻坯 (omni_billet)
    event.custom({
        "type": "draconicevolution:fusion_crafting",
        "result": {
            "item": "kubejs:omni_billet",
            "count": 1
        },
        "catalyst": {
            "item": "kubejs:omni_seed"
        },
        "ingredients": [
            {
                "item": "kubejs:epsilon_dust"
            },
            {
                "item": "kubejs:basepoint_alloy"
            },
            {
                "item": "kubejs:chaotic_truth"
            },
            {
                "item": "kubejs:rainbowshift_entropy"
            }
        ],
        "tier": "CHAOTIC",
        "total_energy": 200000000
    }).id('sdbf:omni_alloy/omni_billet');

    // 万象原核 (omni_seed)
    event.custom({
        "type": "deeprealm_4th:projection_combining",
        "result": {
            "item": "kubejs:omni_seed",
            "count": 1
        },
        "steps": [
            {
                "stack": {
                    "item": "kubejs:astral_biomembrane",
                    "count": 1
                },
                "direction": "material_on_frame"
            },
            {
                "stack": {
                    "item": "kubejs:celestial_lattice_lens",
                    "count": 1
                },
                "direction": "frame_on_material"
            },
            {
                "stack": {
                    "item": "kubejs:iridescent_resonance_chamber",
                    "count": 1
                },
                "direction": "material_on_frame"
            },
            {
                "stack": {
                    "item": "kubejs:cryogenic_phase_housing",
                    "count": 1
                },
                "direction": "frame_on_material"
            },
            {
                "stack": {
                    "item": "kubejs:stargate_coupling_coil",
                    "count": 1
                },
                "direction": "material_on_frame"
            },
            {
                "stack": {
                    "item": "kubejs:hydrogen_logic_valve_bank",
                    "count": 1
                },
                "direction": "frame_on_material"
            },
            {
                "stack": {
                    "item": "kubejs:neutron_confinement_ring",
                    "count": 1
                },
                "direction": "material_on_frame"
            },
            {
                "stack": {
                    "item": "kubejs:omni_calibration_grating",
                    "count": 1
                },
                "direction": "frame_on_material"
            }
        ]
    }).id('sdbf:omni_alloy/omni_seed');

    // 压力室 (pneumatic_02)
    event.custom({
        "type": "pneumaticcraft:pressure_chamber",
        "inputs": [
            {
                "item": "kubejs:omni_pneumatic_feed"
            },
            {
                "item": "minecraft:redstone"
            }
        ],
        "pressure": 4.0,
        "results": [
            {
                "item": "kubejs:omni_pneumatic_02",
                "count": 1
            }
        ]
    }).id('sdbf:omni_alloy/pneumatic_02');

    // 装配钻床 (pneumatic_03)
    event.custom({
        "type": "pneumaticcraft:assembly_drill",
        "input": {
            "item": "kubejs:omni_pneumatic_02"
        },
        "program": "drill",
        "result": {
            "item": "kubejs:omni_pneumatic_03",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_03');

    // 装配激光 (pneumatic_04)
    event.custom({
        "type": "pneumaticcraft:assembly_laser",
        "input": {
            "item": "kubejs:omni_pneumatic_03"
        },
        "program": "laser",
        "result": {
            "item": "kubejs:omni_pneumatic_04",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_04');

    // 气动炼油 (pneumatic_05)
    event.custom({
        "type": "pneumaticcraft:refinery",
        "input": {
            "type": "pneumaticcraft:fluid",
            "tag": "forge:crude_oil",
            "amount": 1000
        },
        "results": [
            {
                "fluid": "kubejs:omni_pneumatic_05_fluid",
                "amount": 1000
            }
        ],
        "temperature": {
            "min_temp": 373
        }
    }).id('sdbf:omni_alloy/pneumatic_05');

    // 热气动处理 (pneumatic_06)
    event.custom({
        "type": "pneumaticcraft:thermo_plant",
        "fluid_input": {
            "type": "pneumaticcraft:fluid",
            "fluid": "kubejs:omni_pneumatic_05_fluid",
            "amount": 1000
        },
        "item_input": {
            "item": "minecraft:slime_ball"
        },
        "fluid_output": {
            "fluid": "kubejs:omni_pneumatic_06_fluid",
            "amount": 1000
        },
        "pressure": 3.0,
        "temperature": {
            "min_temp": 423
        },
        "speed": 0.2,
        "exothermic": false
    }).id('sdbf:omni_alloy/pneumatic_06');

    // 流体混合 (pneumatic_07)
    event.custom({
        "type": "pneumaticcraft:fluid_mixer",
        "input1": {
            "type": "pneumaticcraft:fluid",
            "fluid": "kubejs:omni_pneumatic_06_fluid",
            "amount": 1000
        },
        "input2": {
            "type": "pneumaticcraft:fluid",
            "fluid": "minecraft:water",
            "amount": 250
        },
        "fluid_output": {
            "fluid": "kubejs:omni_pneumatic_07_fluid",
            "amount": 1000
        },
        "pressure": 3.0,
        "time": 200
    }).id('sdbf:omni_alloy/pneumatic_07');

    // 热处理架冷却 (pneumatic_08)
    event.custom({
        "type": "pneumaticcraft:heat_frame_cooling",
        "input": {
            "type": "pneumaticcraft:fluid",
            "fluid": "kubejs:omni_pneumatic_07_fluid",
            "amount": 1000
        },
        "result": {
            "item": "kubejs:omni_pneumatic_08",
            "count": 1
        },
        "max_temp": 273
    }).id('sdbf:omni_alloy/pneumatic_08');

    // AE 充能 (pneumatic_11)
    event.custom({
        "type": "ae2:charger",
        "ingredient": {
            "item": "kubejs:omni_pneumatic_assembly_2"
        },
        "result": {
            "item": "kubejs:omni_pneumatic_11",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_11');

    // AE 压印 (pneumatic_12)
    event.custom({
        "type": "ae2:inscriber",
        "ingredients": {
            "middle": {
                "item": "kubejs:omni_pneumatic_11"
            },
            "top": {
                "item": "ae2:calculation_processor_press"
            }
        },
        "mode": "inscribe",
        "result": {
            "item": "kubejs:omni_pneumatic_12",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_12');

    // AE 水中转化 (pneumatic_13)
    event.custom({
        "type": "ae2:transform",
        "ingredients": [
            {
                "item": "kubejs:omni_pneumatic_12"
            },
            {
                "item": "minecraft:redstone"
            }
        ],
        "result": {
            "item": "kubejs:omni_pneumatic_13",
            "count": 1
        },
        "circumstance": {
            "type": "fluid",
            "tag": "minecraft:water"
        }
    }).id('sdbf:omni_alloy/pneumatic_13');

    // AE 爆炸转化 (pneumatic_14)
    event.custom({
        "type": "ae2:transform",
        "ingredients": [
            {
                "item": "kubejs:omni_pneumatic_13"
            },
            {
                "item": "minecraft:redstone"
            }
        ],
        "result": {
            "item": "kubejs:omni_pneumatic_14",
            "count": 1
        },
        "circumstance": {
            "type": "explosion"
        }
    }).id('sdbf:omni_alloy/pneumatic_14');

    // AE 熵变 (pneumatic_15)
    event.custom({
        "type": "ae2:entropy",
        "input": {
            "block": {
                "id": "kubejs:omni_pneumatic_15_precursor"
            }
        },
        "output": {
            "block": {
                "id": "kubejs:omni_pneumatic_15_block"
            }
        },
        "mode": "heat"
    }).id('sdbf:omni_alloy/pneumatic_15');

    // pneumatic_15_prepare (pneumatic_15_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "minecraft:blue_ice"
            },
            {
                "item": "ae2:certus_quartz_crystal"
            }
        ],
        "result": {
            "item": "kubejs:omni_pneumatic_15_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_15_prepare');

    // 钻刻耐压阀体 (pneumatic_assembly_1)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "A  ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_pneumatic_04"
            }
        },
        "result": {
            "item": "kubejs:omni_pneumatic_assembly_1",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_assembly_1');

    // 热控密封阀座 (pneumatic_assembly_2)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_pneumatic_assembly_1"
            },
            "B": {
                "item": "kubejs:omni_pneumatic_08"
            }
        },
        "result": {
            "item": "kubejs:omni_pneumatic_assembly_2",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_assembly_2');

    // 熵变信号阀片 (pneumatic_assembly_3)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_pneumatic_14"
            },
            "B": {
                "item": "kubejs:omni_pneumatic_15_block"
            }
        },
        "result": {
            "item": "kubejs:omni_pneumatic_assembly_3",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_assembly_3');

    // 氢压逻辑阀组 (pneumatic_assembly_4)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_pneumatic_assembly_3"
            },
            "B": {
                "item": "kubejs:omni_pneumatic_16"
            },
            "C": {
                "item": "kubejs:omni_pneumatic_17"
            }
        },
        "result": {
            "item": "kubejs:hydrogen_logic_valve_bank",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_assembly_4');

    // 氢压阀体毛坯 (pneumatic_feed)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "titan_moon:precision_components"
            },
            {
                "item": "kubejs:storm_hydrogen_crystal"
            },
            {
                "item": "deeprealm_4th:star_slurry_blank"
            }
        ],
        "result": {
            "item": "kubejs:omni_pneumatic_feed",
            "count": 1
        }
    }).id('sdbf:omni_alloy/pneumatic_feed');

    // 耀魂加工 (precision_01)
    event.custom({
        "type": "slashblade:proudsoul",
        "ingredients": [
            {
                "item": "slashblade:proudsoul"
            },
            {
                "item": "slashblade:proudsoul"
            },
            {
                "item": "minecraft:iron_ingot"
            },
            {
                "item": "kubejs:omni_process_liner"
            }
        ],
        "result": {
            "item": "kubejs:omni_precision_01",
            "count": 1
        }
    }).id('sdbf:omni_alloy/precision_01');

    // 刀卷研究 (precision_04)
    event.custom({
        "type": "last_smith:research",
        "blade": {
            "item": "slashblade:slashblade_wood"
        },
        "ink": {
            "item": "minecraft:ink_sac"
        },
        "paper": {
            "item": "minecraft:paper"
        },
        "output": {
            "item": "kubejs:omni_precision_04",
            "count": 1
        }
    }).id('sdbf:omni_alloy/precision_04');

    // 泰拉工坊 (precision_05)
    event.custom({
        "type": "terra_curio:workshop",
        "ingredients": [
            {
                "item": "kubejs:omni_precision_05_precursor"
            },
            {
                "item": "terra_curio:honey_balloon"
            }
        ],
        "result": {
            "item": "kubejs:omni_precision_05",
            "count": 1
        }
    }).id('sdbf:omni_alloy/precision_05');

    // precision_05_prepare (precision_05_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "terra_curio:lucky_horseshoe"
            },
            {
                "item": "minecraft:amethyst_shard"
            }
        ],
        "result": {
            "item": "kubejs:omni_precision_05_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/precision_05_prepare');

    // 定向刻线刀组 (precision_assembly_1)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "DE ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_precision_feed"
            },
            "B": {
                "item": "kubejs:omni_precision_01"
            },
            "C": {
                "item": "kubejs:omni_precision_04"
            },
            "D": {
                "item": "kubejs:omni_precision_05"
            },
            "E": {
                "item": "kubejs:omni_precision_15"
            }
        },
        "result": {
            "item": "kubejs:omni_precision_assembly_1",
            "count": 1
        }
    }).id('sdbf:omni_alloy/precision_assembly_1');

    // 多层成像标尺 (precision_assembly_2)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "ABC",
            "DE ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_precision_assembly_1"
            },
            "B": {
                "item": "kubejs:omni_precision_08"
            },
            "C": {
                "item": "kubejs:omni_precision_16"
            },
            "D": {
                "item": "kubejs:omni_precision_10"
            },
            "E": {
                "item": "kubejs:omni_precision_17"
            }
        },
        "result": {
            "item": "kubejs:omni_precision_assembly_2",
            "count": 1
        }
    }).id('sdbf:omni_alloy/precision_assembly_2');

    // 万象校准光栅 (precision_assembly_3)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_precision_assembly_2"
            },
            "B": {
                "item": "kubejs:omni_precision_12"
            }
        },
        "result": {
            "item": "kubejs:omni_calibration_grating",
            "count": 1
        }
    }).id('sdbf:omni_alloy/precision_assembly_3');

    // 星浆光栅基板 (precision_feed)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "titan_moon:precision_components"
            },
            {
                "item": "titan_moon:precision_components"
            },
            {
                "item": "titan_moon:silicon_dust"
            },
            {
                "item": "titan_moon:silicon_dust"
            },
            {
                "item": "deeprealm_4th:star_slurry_crystal"
            }
        ],
        "result": {
            "item": "kubejs:omni_precision_feed",
            "count": 1
        }
    }).id('sdbf:omni_alloy/precision_feed');

    // process_liner (process_liner)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "minecraft:iron_nugget"
            },
            {
                "item": "minecraft:iron_nugget"
            },
            {
                "item": "minecraft:iron_nugget"
            },
            {
                "item": "minecraft:iron_nugget"
            },
            {
                "item": "minecraft:paper"
            }
        ],
        "result": {
            "item": "kubejs:omni_process_liner",
            "count": 4
        }
    }).id('sdbf:omni_alloy/process_liner');

    // 有序工作台 (thermal_01)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            " A ",
            "ABA",
            " A "
        ],
        "key": {
            "A": {
                "item": "minecraft:iron_nugget"
            },
            "B": {
                "item": "kubejs:omni_thermal_feed"
            }
        },
        "result": {
            "item": "kubejs:omni_thermal_01",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_01');

    // 无序工作台 (thermal_02)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "kubejs:omni_thermal_01"
            },
            {
                "item": "minecraft:coal"
            }
        ],
        "result": {
            "item": "kubejs:omni_thermal_02",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_02');

    // 熔炉 (thermal_03)
    event.custom({
        "type": "minecraft:smelting",
        "ingredient": {
            "item": "kubejs:omni_thermal_02"
        },
        "result": "kubejs:omni_thermal_03",
        "experience": 0.1,
        "cookingtime": 200
    }).id('sdbf:omni_alloy/thermal_03');

    // 高炉 (thermal_04)
    event.custom({
        "type": "minecraft:blasting",
        "ingredient": {
            "item": "kubejs:omni_thermal_03"
        },
        "result": "kubejs:omni_thermal_04",
        "experience": 0.1,
        "cookingtime": 200
    }).id('sdbf:omni_alloy/thermal_04');

    // 烟熏炉 (thermal_05)
    event.custom({
        "type": "minecraft:smoking",
        "ingredient": {
            "item": "kubejs:omni_thermal_assembly_2"
        },
        "result": "kubejs:omni_thermal_05",
        "experience": 0.1,
        "cookingtime": 200
    }).id('sdbf:omni_alloy/thermal_05');

    // 营火 (thermal_06)
    event.custom({
        "type": "minecraft:campfire_cooking",
        "ingredient": {
            "item": "kubejs:omni_thermal_05"
        },
        "result": "kubejs:omni_thermal_06",
        "experience": 0.1,
        "cookingtime": 600
    }).id('sdbf:omni_alloy/thermal_06');

    // 切石机 (thermal_07)
    event.custom({
        "type": "minecraft:stonecutting",
        "ingredient": {
            "item": "kubejs:omni_thermal_04"
        },
        "result": "kubejs:omni_thermal_07",
        "count": 1
    }).id('sdbf:omni_alloy/thermal_07');

    // 锻造台 (thermal_08)
    event.custom({
        "type": "minecraft:smithing_transform",
        "template": {
            "item": "minecraft:netherite_upgrade_smithing_template"
        },
        "base": {
            "item": "kubejs:omni_thermal_07"
        },
        "addition": {
            "item": "titan_moon:cryo_alloy_ingot"
        },
        "result": {
            "item": "kubejs:omni_thermal_08",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_08');

    // 红石熔炉 (thermal_09)
    event.custom({
        "type": "thermal:furnace",
        "ingredient": {
            "item": "kubejs:omni_thermal_assembly_1"
        },
        "result": [
            {
                "item": "kubejs:omni_thermal_09",
                "count": 1
            }
        ],
        "energy": 8000
    }).id('sdbf:omni_alloy/thermal_09');

    // 锯木机 (thermal_10)
    event.custom({
        "type": "thermal:sawmill",
        "ingredient": {
            "item": "kubejs:omni_thermal_09"
        },
        "result": [
            {
                "item": "kubejs:omni_thermal_10",
                "count": 1
            }
        ],
        "energy": 8000
    }).id('sdbf:omni_alloy/thermal_10');

    // 磨粉机 (thermal_11)
    event.custom({
        "type": "thermal:pulverizer",
        "ingredient": {
            "item": "kubejs:omni_thermal_10"
        },
        "result": [
            {
                "item": "kubejs:omni_thermal_11",
                "count": 1
            }
        ],
        "energy": 8000
    }).id('sdbf:omni_alloy/thermal_11');

    // 感应炉 (thermal_12)
    event.custom({
        "type": "thermal:smelter",
        "ingredients": [
            {
                "item": "kubejs:omni_thermal_11"
            },
            {
                "item": "minecraft:copper_ingot"
            }
        ],
        "result": [
            {
                "item": "kubejs:omni_thermal_12",
                "count": 1
            }
        ],
        "energy": 16000
    }).id('sdbf:omni_alloy/thermal_12');

    // 冲压机 (thermal_13)
    event.custom({
        "type": "thermal:press",
        "ingredients": [
            {
                "item": "kubejs:omni_thermal_12"
            }
        ],
        "result": [
            {
                "item": "kubejs:omni_thermal_13",
                "count": 1
            }
        ],
        "energy": 8000
    }).id('sdbf:omni_alloy/thermal_13');

    // 熔岩炉 (thermal_14)
    event.custom({
        "type": "thermal:crucible",
        "ingredient": {
            "item": "kubejs:omni_thermal_13"
        },
        "result": [
            {
                "fluid": "kubejs:omni_thermal_14_fluid",
                "amount": 1000
            }
        ],
        "energy": 20000
    }).id('sdbf:omni_alloy/thermal_14');

    // 急速冷冻机 (thermal_15)
    event.custom({
        "type": "thermal:chiller",
        "ingredients": [
            {
                "fluid": "kubejs:omni_thermal_14_fluid",
                "amount": 1000
            }
        ],
        "result": [
            {
                "item": "kubejs:omni_thermal_15",
                "count": 1
            }
        ],
        "energy": 12000
    }).id('sdbf:omni_alloy/thermal_15');

    // 离心分离机 (thermal_16)
    event.custom({
        "type": "thermal:centrifuge",
        "ingredient": {
            "item": "kubejs:omni_thermal_16_precursor"
        },
        "result": [
            {
                "item": "kubejs:omni_thermal_16",
                "count": 1
            }
        ],
        "energy": 8000
    }).id('sdbf:omni_alloy/thermal_16');

    // thermal_16_prepare (thermal_16_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "thermal:bitumen"
            },
            {
                "item": "minecraft:kelp"
            }
        ],
        "result": {
            "item": "kubejs:omni_thermal_16_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_16_prepare');

    // 热解炉 (thermal_17)
    event.custom({
        "type": "thermal:pyrolyzer",
        "ingredient": {
            "item": "kubejs:omni_thermal_16"
        },
        "result": [
            {
                "fluid": "kubejs:omni_thermal_17_fluid",
                "amount": 1000
            }
        ],
        "energy": 16000
    }).id('sdbf:omni_alloy/thermal_17');

    // 分馏精炼机 (thermal_18)
    event.custom({
        "type": "thermal:refinery",
        "ingredient": {
            "fluid": "kubejs:omni_thermal_17_fluid",
            "amount": 1000
        },
        "result": [
            {
                "fluid": "kubejs:omni_thermal_18_fluid",
                "amount": 1000
            }
        ],
        "energy": 12000
    }).id('sdbf:omni_alloy/thermal_18');

    // 流体灌装机 (thermal_19)
    event.custom({
        "type": "thermal:bottler",
        "ingredients": [
            {
                "item": "minecraft:glass_bottle"
            },
            {
                "fluid": "kubejs:omni_thermal_18_fluid",
                "amount": 1000
            }
        ],
        "result": [
            {
                "item": "kubejs:omni_thermal_19",
                "count": 1
            }
        ],
        "energy": 8000
    }).id('sdbf:omni_alloy/thermal_19');

    // 药水酿造机 (thermal_20)
    event.custom({
        "type": "thermal:brewer",
        "ingredients": [
            {
                "item": "kubejs:omni_thermal_20_precursor"
            },
            {
                "fluid": "minecraft:water",
                "amount": 1000
            }
        ],
        "result": [
            {
                "fluid": "kubejs:omni_thermal_20_brew",
                "amount": 1000
            }
        ],
        "energy": 16000
    }).id('sdbf:omni_alloy/thermal_20');

    // thermal_20_bottle (thermal_20_bottle)
    event.custom({
        "type": "thermal:bottler",
        "ingredients": [
            {
                "item": "minecraft:glass_bottle"
            },
            {
                "fluid": "kubejs:omni_thermal_20_brew",
                "amount": 1000
            }
        ],
        "result": [
            {
                "item": "kubejs:omni_thermal_20",
                "count": 1
            }
        ],
        "energy": 4000
    }).id('sdbf:omni_alloy/thermal_20_bottle');

    // thermal_20_prepare (thermal_20_prepare)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "minecraft:blaze_powder"
            },
            {
                "item": "minecraft:ghast_tear"
            }
        ],
        "result": {
            "item": "kubejs:omni_thermal_20_precursor",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_20_prepare');

    // 结晶器 (thermal_21)
    event.custom({
        "type": "thermal:crystallizer",
        "ingredients": [
            {
                "item": "kubejs:omni_thermal_assembly_3"
            },
            {
                "fluid": "minecraft:water",
                "amount": 1000
            }
        ],
        "result": [
            {
                "item": "kubejs:omni_thermal_21",
                "count": 1
            }
        ],
        "energy": 16000
    }).id('sdbf:omni_alloy/thermal_21');

    // 有机灌注机 (thermal_22)
    event.custom({
        "type": "thermal:insolator",
        "ingredient": {
            "item": "kubejs:omni_thermal_21"
        },
        "result": [
            {
                "item": "kubejs:omni_thermal_22",
                "count": 1
            }
        ],
        "energy": 16000,
        "water_mod": 1.0
    }).id('sdbf:omni_alloy/thermal_22');

    // 锻制承压骨架 (thermal_assembly_1)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "A  ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_thermal_08"
            }
        },
        "result": {
            "item": "kubejs:omni_thermal_assembly_1",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_assembly_1');

    // 相变金属外壳 (thermal_assembly_2)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "A  ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_thermal_15"
            }
        },
        "result": {
            "item": "kubejs:omni_thermal_assembly_2",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_assembly_2');

    // 热解隔热夹层 (thermal_assembly_3)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_thermal_06"
            },
            "B": {
                "item": "kubejs:omni_thermal_19"
            }
        },
        "result": {
            "item": "kubejs:omni_thermal_assembly_3",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_assembly_3');

    // 冰晶相变壳体 (thermal_assembly_4)
    event.custom({
        "type": "minecraft:crafting_shaped",
        "pattern": [
            "AB ",
            "   ",
            "   "
        ],
        "key": {
            "A": {
                "item": "kubejs:omni_thermal_22"
            },
            "B": {
                "item": "kubejs:omni_thermal_20"
            }
        },
        "result": {
            "item": "kubejs:cryogenic_phase_housing",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_assembly_4');

    // 冰晶矿质复合坯 (thermal_feed)
    event.custom({
        "type": "minecraft:crafting_shapeless",
        "ingredients": [
            {
                "item": "titan_moon:cryo_alloy_ingot"
            },
            {
                "item": "titan_moon:cryo_alloy_ingot"
            },
            {
                "item": "deeprealm_4th:star_slurry_blank"
            },
            {
                "item": "minecraft:basalt"
            },
            {
                "item": "minecraft:basalt"
            },
            {
                "item": "minecraft:basalt"
            },
            {
                "item": "minecraft:basalt"
            },
            {
                "item": "thermal:latex_bucket"
            },
            {
                "item": "minecraft:honeycomb"
            }
        ],
        "result": {
            "item": "kubejs:omni_thermal_feed",
            "count": 1
        }
    }).id('sdbf:omni_alloy/thermal_feed');

    // Native-carrier packaging: each recipe consumes its checked native item.

    // aether_08: 消耗原生注入后的维瑞迪姆斧；沿用 Redux 注入配方。
    if (Item.of("aether_redux:infused_veridium_axe").isEmpty() || Item.of("kubejs:omni_aether_08").isEmpty()) {
        throw new Error('Missing omni carrier or output: aether_08');
    }
    event.shapeless("kubejs:omni_aether_08", ["aether_redux:infused_veridium_axe", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("aether_redux:infused_veridium_axe");
            return omniValidCarrier(carrier, "none") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/aether_08_pack");

    // mana_10: 吸收效果的完整植物酿造药水瓶，至少四口剩余次数。
    if (Item.of("botania:brew_vial").isEmpty() || Item.of("kubejs:omni_mana_10").isEmpty()) {
        throw new Error('Missing omni carrier or output: mana_10');
    }
    event.shapeless("kubejs:omni_mana_10", ["botania:brew_vial", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("botania:brew_vial");
            return omniValidCarrier(carrier, "brew_absorption") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/mana_10_pack");

    // engineering_12: 沿用原生加工产物，装配时消耗实物。
    if (Item.of("kubejs:charged_soul_filter").isEmpty() || Item.of("kubejs:omni_engineering_12").isEmpty()) {
        throw new Error('Missing omni carrier or output: engineering_12');
    }
    event.shapeless("kubejs:omni_engineering_12", ["kubejs:charged_soul_filter", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("kubejs:charged_soul_filter");
            return omniValidCarrier(carrier, "none") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/engineering_12_pack");

    // pneumatic_16: 必须在紫外灯箱曝光至 100%，未曝光或部分曝光板不能封装。
    if (Item.of("pneumaticcraft:unassembled_pcb").isEmpty() || Item.of("kubejs:omni_pneumatic_16").isEmpty()) {
        throw new Error('Missing omni carrier or output: pneumatic_16');
    }
    event.shapeless("kubejs:omni_pneumatic_16", ["pneumaticcraft:unassembled_pcb", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("pneumaticcraft:unassembled_pcb");
            return omniValidCarrier(carrier, "uv_full") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/pneumatic_16_pack");

    // pneumatic_17: 消耗原生蚀刻成功的空白 PCB；完全曝光后蚀刻避免失败。
    if (Item.of("pneumaticcraft:empty_pcb").isEmpty() || Item.of("kubejs:omni_pneumatic_17").isEmpty()) {
        throw new Error('Missing omni carrier or output: pneumatic_17');
    }
    event.shapeless("kubejs:omni_pneumatic_17", ["pneumaticcraft:empty_pcb", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("pneumaticcraft:empty_pcb");
            return omniValidCarrier(carrier, "none") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/pneumatic_17_pack");

    // nuclear_22: 消耗固体裂变的原生乏燃料，后续在燃料后处理机继续处理。
    if (Item.of("nuclearcraft:depleted_fuel_americium_hea_242").isEmpty() || Item.of("kubejs:omni_nuclear_22").isEmpty()) {
        throw new Error('Missing omni carrier or output: nuclear_22');
    }
    event.shapeless("kubejs:omni_nuclear_22", ["nuclearcraft:depleted_fuel_americium_hea_242", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("nuclearcraft:depleted_fuel_americium_hea_242");
            return omniValidCarrier(carrier, "none") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/nuclear_22_pack");

    // nuclear_23: 消耗熔盐反应堆的原生乏燃料载体。
    if (Item.of("nuclearcraft:depleted_fuel_americium_hea_242_tr").isEmpty() || Item.of("kubejs:omni_nuclear_23").isEmpty()) {
        throw new Error('Missing omni carrier or output: nuclear_23');
    }
    event.shapeless("kubejs:omni_nuclear_23", ["nuclearcraft:depleted_fuel_americium_hea_242_tr", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("nuclearcraft:depleted_fuel_americium_hea_242_tr");
            return omniValidCarrier(carrier, "none") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/nuclear_23_pack");

    // precision_15: 单件刀胚在有水炼药锅中淬火，消耗一层水后封装。
    if (Item.of("last_smith:blade_unfinished_4").isEmpty() || Item.of("kubejs:omni_precision_15").isEmpty()) {
        throw new Error('Missing omni carrier or output: precision_15');
    }
    event.shapeless("kubejs:omni_precision_15", ["last_smith:blade_unfinished_4", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("last_smith:blade_unfinished_4");
            return omniValidCarrier(carrier, "none") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/precision_15_pack");

    // precision_08: 显影胶卷至少保留一帧真实拍摄数据，空胶卷不能封装。
    if (Item.of("exposure:developed_black_and_white_film").isEmpty() || Item.of("kubejs:omni_precision_08").isEmpty()) {
        throw new Error('Missing omni carrier or output: precision_08');
    }
    event.shapeless("kubejs:omni_precision_08", ["exposure:developed_black_and_white_film", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("exposure:developed_black_and_white_film");
            return omniValidCarrier(carrier, "developed_film") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/precision_08_pack");

    // precision_16: 打印的照片必须具有有效拍摄标识，空白照片不能封装。
    if (Item.of("exposure:photograph").isEmpty() || Item.of("kubejs:omni_precision_16").isEmpty()) {
        throw new Error('Missing omni carrier or output: precision_16');
    }
    event.shapeless("kubejs:omni_precision_16", ["exposure:photograph", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("exposure:photograph");
            return omniValidCarrier(carrier, "photograph") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/precision_16_pack");

    // precision_10: 老化照片必须保留有效拍摄数据。
    if (Item.of("exposure:aged_photograph").isEmpty() || Item.of("kubejs:omni_precision_10").isEmpty()) {
        throw new Error('Missing omni carrier or output: precision_10');
    }
    event.shapeless("kubejs:omni_precision_10", ["exposure:aged_photograph", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("exposure:aged_photograph");
            return omniValidCarrier(carrier, "photograph") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/precision_10_pack");

    // precision_17: 照片叠至少包含两张具有有效拍摄标识的照片，整叠消耗。
    if (Item.of("exposure:stacked_photographs").isEmpty() || Item.of("kubejs:omni_precision_17").isEmpty()) {
        throw new Error('Missing omni carrier or output: precision_17');
    }
    event.shapeless("kubejs:omni_precision_17", ["exposure:stacked_photographs", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("exposure:stacked_photographs");
            return omniValidCarrier(carrier, "photo_stack") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/precision_17_pack");

    // precision_12: 使用原生酿造的迅捷 II 药水，按 Potion 字段检查。
    if (Item.of("minecraft:potion").isEmpty() || Item.of("kubejs:omni_precision_12").isEmpty()) {
        throw new Error('Missing omni carrier or output: precision_12');
    }
    event.shapeless("kubejs:omni_precision_12", ["minecraft:potion", 'kubejs:omni_process_liner'])
        .modifyResult((grid, result) => {
            let carrier = grid.find("minecraft:potion");
            return omniValidCarrier(carrier, "strong_swiftness") ? result : Item.of('minecraft:air');
        }).id("sdbf:omni_alloy/precision_12_pack");
});
