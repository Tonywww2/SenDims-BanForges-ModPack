ServerEvents.recipes(event => {

    event.shaped('pneumaticcraft:refinery', [
        'ABA',
        'CDC',
        'EFE'
    ], {
        A: 'pneumaticcraft:small_tank',
        B: 'ad_astra:fuel_refinery',
        C: '#forge:gears/compressed_iron',
        D: 'thermal:machine_refinery',
        E: '#pneumaticcraft:reinforced_stone',
        F: 'thermal:dynamo_magmatic',
    }).id('sdbf:refinery')

    event.shaped('pneumaticcraft:refinery_output', [
        'ABA',
        'ACA',
        'ADA'
    ], {
        A: '#pneumaticcraft:reinforced_stone',
        B: 'ae2:cell_component_16k',
        C: 'pneumaticcraft:small_tank',
        D: 'nuclearcraft:centrifuge'
    }).id('sdbf:refinery_output')

    event.shaped('pneumaticcraft:thermopneumatic_processing_plant', [
        'ABA',
        'DCD',
        'ABA'
    ], {
        A: '#pneumaticcraft:reinforced_stone',
        B: '#forge:plates/calorite',
        C: 'nuclearcraft:chemical_reactor',
        D: 'pneumaticcraft:small_tank'
    }).id('sdbf:thermopneumatic_processing_plant')

    event.custom({
        "type": "pneumaticcraft:explosion_crafting",
        "input": {
            "item": 'kubejs:saturn_ring_alloy_ingot'
        },
        "loss_rate": 20,
        "results": [
            {
                "item": "pneumaticcraft:ingot_iron_compressed"
            }
        ]
    }).id("sdbf:ingot_iron_compressed");

    event.custom({
        "type": "pneumaticcraft:pressure_chamber",
        "inputs": [
            {
                "tag": "forge:storage_blocks/steel"
            }
        ],
        "pressure": 2.0,
        "results": [
            {
                "item": "pneumaticcraft:compressed_iron_block"
            }
        ]
    }).id("sdbf:compressed_iron_block");

    event.custom({
        "type": "pneumaticcraft:pressure_chamber",
        "inputs": [
            {
                "tag": "forge:ingots/steel"
            }
        ],
        "pressure": 2.0,
        "results": [
            {
                "item": "pneumaticcraft:ingot_iron_compressed"
            }
        ]
    }).id("sdbf:ingot_iron_compressed_pressure");

    event.custom({
        "type": "pneumaticcraft:thermo_plant",
        "exothermic": false,
        "fluid_input": {
            "type": "pneumaticcraft:fluid",
            "amount": 1000,
            "tag": "forge:lpg"
        },
        "fluid_output": {
            "amount": 500,
            "fluid": "pneumaticcraft:plastic"
        },
        "item_input": {
            "tag": 'forge:dusts/silicon_carbide'
        },
        "temperature": {
            "min_temp": 373
        }
    }).id("sdbf:thermo_plant_1");

    event.custom({
        "type": "pneumaticcraft:fluid_mixer",
        "fluid_output": {
            "amount": 200,
            "fluid": "pneumaticcraft:plastic"
        },
        "input1": {
            "type": "pneumaticcraft:fluid",
            "amount": 50,
            "tag": "forge:biodiesel"
        }, "input2": {
            "type": "pneumaticcraft:fluid",
            "amount": 50,
            "tag": "forge:lpg"
        },
        "item_output": {
            "item": 'dustandash:ash'
        },
        "pressure": 2.0,
        "time": 300
    }).id("sdbf:fluid_plastic_1");

    event.custom({
        "type": "nuclearcraft:chemical_reactor",
        "inputFluids": [
            {
                "amount": 250,
                "tag": "forge:sulfuric_acid"
            },
            {
                "amount": 250,
                "tag": "forge:hydrochloric_acid"
            }
        ],
        "outputFluids": [
            {
                "amount": 500,
                "fluid": "kubejs:sulfochloric_acid"
            }
        ],
        "powerModifier": 1.0,
        "radiation": 0.0,
        "timeModifier": 1.0
    }).id("sdbf:sulfochloric_acid");

    event.custom({
        "type": "nuclearcraft:chemical_reactor",
        "inputFluids": [
            {
                "amount": 5000,
                "fluid": "kubejs:sulfochloric_acid"
            },
            {
                "amount": 1000,
                "fluid": "pneumaticcraft:plastic"
            }
        ],
        "outputFluids": [
            {
                "amount": 1000,
                "fluid": "pneumaticcraft:etching_acid"
            }
        ],
        "powerModifier": 3.0,
        "radiation": 0.0,
        "timeModifier": 2.0
    }).id("sdbf:etching_acid");

    // 液态耀魂精炼线 / Liquid proudsoul refining line
    let PROUDSOUL_FLUIDS = {
        melted: "kubejs:melted_proudsoul",
        light: "kubejs:light_distilled_proudsoul",
        active: "kubejs:active_distilled_proudsoul",
        condensed: "kubejs:condensed_distilled_proudsoul",
        heavy: "kubejs:heavy_distilled_proudsoul",
        stabilizedLight: "kubejs:stabilized_light_proudsoul",
        bufferedActive: "kubejs:buffered_active_proudsoul",
        pressurizedCondensed: "kubejs:pressurized_condensed_proudsoul",
        crackedHeavy: "kubejs:cracked_heavy_proudsoul",
        volatileBlend: "kubejs:volatile_proudsoul_blend",
        denseBlend: "kubejs:dense_proudsoul_blend",
        purifiedFuel: "kubejs:purified_proudsoul_fuel"
    };

    let PROUDSOUL_ITEMS = {
        filterMatrix: "kubejs:soul_filter_matrix",
        chargedFilter: "kubejs:charged_soul_filter",
        condensedCake: "kubejs:condensed_proudsoul_cake",
        compressedCake: "kubejs:compressed_proudsoul_cake"
    };

    event.custom({
        "type": "pneumaticcraft:refinery",
        "input": {
            "type": "pneumaticcraft:fluid",
            "amount": 10,
            "fluid": PROUDSOUL_FLUIDS.melted
        },
        "results": [
            {
                "amount": 2,
                "fluid": PROUDSOUL_FLUIDS.heavy
            },
            {
                "amount": 3,
                "fluid": PROUDSOUL_FLUIDS.condensed
            },
            {
                "amount": 3,
                "fluid": PROUDSOUL_FLUIDS.active
            },
            {
                "amount": 2,
                "fluid": PROUDSOUL_FLUIDS.light
            }
        ],
        "temperature": {
            "max_temp": 173
        }
    }).id("sdbf:proudsoul_distillation");

    event.custom({
        "type": "pneumaticcraft:thermo_plant",
        "air_use_multiplier": 1.5,
        "exothermic": false,
        "fluid_input": {
            "type": "pneumaticcraft:fluid",
            "amount": 200,
            "fluid": PROUDSOUL_FLUIDS.light
        },
        "fluid_output": {
            "amount": 150,
            "fluid": PROUDSOUL_FLUIDS.stabilizedLight
        },
        "item_input": {
            "item": PROUDSOUL_ITEMS.chargedFilter
        },
        "item_output": {
            "item": PROUDSOUL_ITEMS.filterMatrix
        },
        "pressure": 2.5,
        "speed": 0.5,
        "temperature": {
            "max_temp": 333
        }
    }).id("sdbf:stabilized_light_proudsoul");

    event.custom({
        "type": "nuclearcraft:chemical_reactor",
        "inputFluids": [
            {
                "amount": 300,
                "fluid": PROUDSOUL_FLUIDS.active
            },
            {
                "amount": 100,
                "fluid": "nuclearcraft:boric_acid"
            }
        ],
        "outputFluids": [
            {
                "amount": 250,
                "fluid": PROUDSOUL_FLUIDS.bufferedActive
            }
        ],
        "powerModifier": 4.0,
        "radiation": 0.25,
        "timeModifier": 2.0
    }).id("sdbf:buffered_active_proudsoul");

    event.custom({
        "type": "thermal:crystallizer",
        "ingredients": [
            {
                "amount": 300,
                "fluid": PROUDSOUL_FLUIDS.condensed
            },
            {
                "tag": "forge:dusts/quartz"
            }
        ],
        "result": [
            {
                "item": PROUDSOUL_ITEMS.condensedCake
            }
        ],
        "energy": 24000
    }).id("sdbf:condensed_proudsoul_cake");

    event.custom({
        "type": "pneumaticcraft:pressure_chamber",
        "inputs": [
            {
                "item": PROUDSOUL_ITEMS.condensedCake
            }
        ],
        "pressure": 4.5,
        "results": [
            {
                "item": PROUDSOUL_ITEMS.compressedCake
            }
        ]
    }).id("sdbf:compressed_proudsoul_cake");

    event.custom({
        "type": "nuclearcraft:melter",
        "input": [
            {
                "item": PROUDSOUL_ITEMS.compressedCake
            }
        ],
        "outputFluids": [
            {
                "amount": 250,
                "fluid": PROUDSOUL_FLUIDS.pressurizedCondensed
            }
        ],
        "powerModifier": 5.0,
        "radiation": 0.5,
        "timeModifier": 2.5
    }).id("sdbf:pressurized_condensed_proudsoul");

    event.custom({
        "type": "pneumaticcraft:thermo_plant",
        "air_use_multiplier": 2.0,
        "exothermic": false,
        "fluid_input": {
            "type": "pneumaticcraft:fluid",
            "amount": 200,
            "fluid": PROUDSOUL_FLUIDS.heavy
        },
        "fluid_output": {
            "amount": 150,
            "fluid": PROUDSOUL_FLUIDS.crackedHeavy
        },
        "item_input": {
            "tag": "forge:dusts/sulfur"
        },
        "item_output": {
            "item": "dustandash:ash"
        },
        "pressure": 3.0,
        "speed": 0.5,
        "temperature": {
            "min_temp": 523
        }
    }).id("sdbf:cracked_heavy_proudsoul");

    event.custom({
        "type": "pneumaticcraft:fluid_mixer",
        "fluid_output": {
            "amount": 350,
            "fluid": PROUDSOUL_FLUIDS.volatileBlend
        },
        "input1": {
            "type": "pneumaticcraft:fluid",
            "amount": 150,
            "fluid": PROUDSOUL_FLUIDS.stabilizedLight
        },
        "input2": {
            "type": "pneumaticcraft:fluid",
            "amount": 250,
            "fluid": PROUDSOUL_FLUIDS.bufferedActive
        },
        "pressure": 3.5,
        "time": 400
    }).id("sdbf:volatile_proudsoul_blend");

    event.custom({
        "type": "pneumaticcraft:fluid_mixer",
        "fluid_output": {
            "amount": 350,
            "fluid": PROUDSOUL_FLUIDS.denseBlend
        },
        "input1": {
            "type": "pneumaticcraft:fluid",
            "amount": 250,
            "fluid": PROUDSOUL_FLUIDS.pressurizedCondensed
        },
        "input2": {
            "type": "pneumaticcraft:fluid",
            "amount": 150,
            "fluid": PROUDSOUL_FLUIDS.crackedHeavy
        },
        "pressure": 4.0,
        "time": 500
    }).id("sdbf:dense_proudsoul_blend");

    event.custom({
        "type": "pneumaticcraft:fluid_mixer",
        "fluid_output": {
            "amount": 500,
            "fluid": PROUDSOUL_FLUIDS.purifiedFuel
        },
        "input1": {
            "type": "pneumaticcraft:fluid",
            "amount": 350,
            "fluid": PROUDSOUL_FLUIDS.volatileBlend
        },
        "input2": {
            "type": "pneumaticcraft:fluid",
            "amount": 350,
            "fluid": PROUDSOUL_FLUIDS.denseBlend
        },
        "pressure": 4.5,
        "time": 600
    }).id("sdbf:purified_proudsoul_fuel");

    [
        "light_distilled_proudsoul",
        "active_distilled_proudsoul",
        "condensed_distilled_proudsoul",
        "heavy_distilled_proudsoul"
    ].forEach(fluid => {
        event.custom({
            "type": "thermal:crystallizer",
            "ingredients": [
                {
                    "amount": 1000,
                    "fluid": `kubejs:${fluid}`
                },
                {
                    "tag": "forge:dusts/quartz"
                }
            ],
            "result": [
                {
                    "item": "slashblade:proudsoul"
                }
            ]
        }).id(`sdbf:${fluid}_recovery`);
    });

    event.custom({
        "type": "thermal:crystallizer",
        "ingredients": [
            {
                "amount": 200,
                "fluid": PROUDSOUL_FLUIDS.purifiedFuel
            },
            {
                "tag": "forge:dusts/quartz"
            }
        ],
        "result": [
            {
                "item": "slashblade:proudsoul"
            }
        ]
    }).id("sdbf:proudsoul_from_purified_fuel");

    event.recipes.thermal.compression_fuel([
        Fluid.of(PROUDSOUL_FLUIDS.purifiedFuel, 1000)
    ], 6400000).id("sdbf:purified_proudsoul_compression_fuel");

    event.custom({
        "type": "pneumaticcraft:fuel_quality",
        "air_per_bucket": 1800000,
        "burn_rate": 1.0,
        "fluid": {
            "type": "pneumaticcraft:fluid",
            "amount": 1000,
            "fluid": PROUDSOUL_FLUIDS.purifiedFuel
        }
    }).id("sdbf:purified_proudsoul_pneumatic_fuel");

    event.custom({
        "type": "pneumaticcraft:thermo_plant",
        "air_use_multiplier": 2.0,
        "exothermic": false,
        "fluid_input": {
            "type": "pneumaticcraft:fluid",
            "amount": 600,
            "fluid": PROUDSOUL_FLUIDS.purifiedFuel
        },
        "item_input": {
            "tag": "forge:ingots/steel"
        },
        "item_output": {
            "item": "slashblade:proudsoul_ingot"
        },
        "pressure": 3.0,
        "speed": 0.5,
        "temperature": {
            "min_temp": 573
        }
    }).id("sdbf:proudsoul_ingot_from_purified_fuel");

    // event.custom({
    //     "type": "pneumaticcraft:fluid_mixer",
    //     "fluid_output": {
    //         "amount": 200,
    //         "fluid": "pneumaticcraft:plastic"
    //     },
    //     "input1": {
    //         "type": "pneumaticcraft:fluid",
    //         "amount": 100,
    //         "tag": "forge:biodiesel"
    //     }, "input2": {
    //         "type": "pneumaticcraft:fluid",
    //         "amount": 200,
    //         "tag": "forge:lpg"
    //     },
    //     "item_output": {
    //         "item": 'minecraft:light_gray_dye'
    //     },
    //     "pressure": 2.0,
    //     "time": 300
    // }).id("sdbf:fluid_plastic_2");

    event.custom({
        "type": "pneumaticcraft:pressure_chamber",
        "inputs": [
            { "type": "pneumaticcraft:stacked_item", "count": 2, "item": "pneumaticcraft:smooth_plastic_brick_lime" },
            { "type": "pneumaticcraft:stacked_item", "count": 2, "item": "ae2:engineering_processor" },
            { "type": "pneumaticcraft:stacked_item", "count": 2, "item": "minecraft:comparator" },
            { "type": "pneumaticcraft:stacked_item", "count": 3, "tag": "forge:ingots/copper_alloy" },
            { "item": 'nuclearcraft:silicon_wafer' }
        ],
        "pressure": 1.5,
        "results": [
            { "count": 2, "item": "pneumaticcraft:empty_pcb" }
        ]
    }).id("sdbf:empty_pcb");

    event.custom({
        "type": "pneumaticcraft:pressure_chamber",
        "inputs": [
            { "type": "pneumaticcraft:stacked_item", "count": 4, "item": "pneumaticcraft:pressure_tube" },
            { "type": "pneumaticcraft:stacked_item", "count": 3, "item": "pneumaticcraft:pressure_chamber_glass" },
            { "type": "pneumaticcraft:stacked_item", "count": 4, "item": "pneumaticcraft:ingot_iron_compressed" },
            { "type": "pneumaticcraft:stacked_item", "count": 1, "item": "pneumaticcraft:pressure_gauge" },
            { "type": "pneumaticcraft:stacked_item", "count": 1, "item": "pneumaticcraft:printed_circuit_board" }
        ],
        "pressure": 4.0,
        "results": [
            { "item": "appliedpneumatics:air_cell_shell" }
        ]
    }).id("sdbf:air_cell_shell");

})