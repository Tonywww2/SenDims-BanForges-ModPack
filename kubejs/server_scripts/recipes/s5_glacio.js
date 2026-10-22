ServerEvents.recipes(event => {

    event.custom({
        "type": "ad_astra:nasa_workbench",
        "ingredients": [
            Item.of('kubejs:celestial_filling_alloy_ingot').toJson(),

            Item.of('kubejs:radiation_components').toJson(),
            Item.of('kubejs:radiation_components').toJson(),
            Item.of('ae2:cell_component_256k').toJson(),
            Item.of('ae2:cell_component_256k').toJson(),
            Item.of('appflux:core_256k').toJson(),
            Item.of('appflux:core_256k').toJson(),

            Item.of('kubejs:celestial_filling_alloy_ingot').toJson(),
            Item.of('ae2:spatial_anchor').toJson(),
            Item.of('ae2:spatial_anchor').toJson(),
            Item.of('kubejs:celestial_filling_alloy_ingot').toJson(),

            Item.of('kubejs:celestial_filling_alloy_ingot').toJson(),
            Item.of('ad_astra_rocketed:tier_5_rocket').toJson(),
            Item.of('kubejs:celestial_filling_alloy_ingot').toJson()
        ],
        "result": {
            "count": 1,
            "id": "ad_astra_rocketed:tier_6_rocket"
        }
    }).id("sdbf:tier_6_rocket_s5")


    // 霜原星的永冻层，经研磨、寒髓定形及耀魂结晶制成不融冰。
    event.custom({
        "type": "thermal:pulverizer",
        "ingredient": {
            "value": [{ "item": "ad_astra:permafrost" }],
            "count": 2
        },
        "result": [{ "item": "kubejs:permafrost_crystal_dust", "count": 2 }],
        "energy": 8000
    }).id("sdbf:permafrost_crystal_dust_s5");

    event.shaped(Item.of("kubejs:frost_crystal_embryo", 2), [
        "DID",
        "ASA",
        "DID"
    ], {
        "D": "kubejs:permafrost_crystal_dust",
        "I": "minecraft:blue_ice",
        "A": "titan_moon:cryo_alloy_ingot",
        "S": "kubejs:ancient_soul"
    }).id("sdbf:frost_crystal_embryo_s5");

    event.custom({
        "type": "thermal:crystallizer",
        "ingredients": [
            { "item": "kubejs:frost_crystal_embryo" },
            { "fluid": "kubejs:dense_proudsoul_blend", "amount": 250 }
        ],
        "result": [{ "item": "kubejs:unmelting_ice", "count": 1 }],
        "energy": 64000
    }).id("sdbf:unmelting_ice_s5");

    // 仅在配方加载时构造材料条件，不添加运行时事件。
    let bladeRequirement = (name, kills, souls, refine) => SlashBladeIngredient.of(
        SlashBladeRequestDefinition.newInstance()
            .name(name)
            .killCount(kills)
            .proudSoul(souls)
            .refineCount(refine)
            .build()
    );

    // 阿贝 → 极神威「阿贝」·灼热影舞
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "IBF",
        "PUS",
        "IDN"
    ], {
        "U": bladeRequirement("slashblade_addon:kamuy_fire", 20000, 200000, 150),
        "I": "kubejs:unmelting_ice",
        "B": "last_smith:scroll_sharpness",
        "F": "minecraft:fire_charge",
        "P": "slashblade:proudsoul_trapezohedron",
        "S": "cataclysm:ignitium_ingot",
        "D": "minecraft:diamond_block",
        "N": "minecraft:nether_star"
    }, "sjap_adder:kamuyex_fire").id("sdbf:kamuyex_fire_s5");

    // 莉芙 → 极神威「莉芙」·至生颂魂
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "IBG",
        "PUT",
        "IAD"
    ], {
        "U": bladeRequirement("sjap_adder:kamuy_life", 20000, 200000, 150),
        "I": "kubejs:unmelting_ice",
        "B": "last_smith:scroll_bewitched",
        "G": "botania:life_essence",
        "P": "slashblade:proudsoul_trapezohedron",
        "T": "minecraft:totem_of_undying",
        "A": "quark:golden_apple_crate",
        "D": "minecraft:diamond_block"
    }, "sjap_adder:kamuyex_life").id("sdbf:kamuyex_life_s5");

    // 帝斯陀 + 空之境界 + 死念 + 耀魂似蛭 → 极神威「帝斯陀」·冥灾帝陨
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "IBD",
        "UTP",
        "IAX"
    ], {
        "U": bladeRequirement("sjap_adder:kamuy_death", 20000, 200000, 150),
        "T": bladeRequirement("slashblade_addon:tboen", 5000, 50000, 100),
        "D": bladeRequirement("slashblade_addon:nihilbx", 10000, 100000, 150),
        "X": bladeRequirement("sjap_adder:nihilulex", 10000, 100000, 150),
        "I": "kubejs:unmelting_ice",
        "B": "last_smith:scroll_bewitched",
        "P": "slashblade:proudsoul_trapezohedron",
        "A": "minecraft:respawn_anchor"
    }, "sjap_adder:kamuyex_death").id("sdbf:kamuyex_death_s5");

    // 妖刀「红樱」 + 莉芙 → 红樱
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "IRP",
        "BLS",
        "IRN"
    ], {
        "B": bladeRequirement("slashblade_addon:crimsoncherry", 20000, 200000, 150),
        "L": bladeRequirement("sjap_adder:kamuy_life", 10000, 100000, 125),
        "I": "kubejs:unmelting_ice",
        "R": "minecraft:redstone_block",
        "P": "slashblade:proudsoul_trapezohedron",
        "S": "slashblade:proudsoul_sphere",
        "N": "minecraft:netherite_block"
    }, "redtassel:redtassel_slashblade").id("sdbf:redtassel_slashblade_s5");

    // 死念 + 血雨红樱 + 耀魂似蛭 + 似蛭 → 终狱刀「绝念」
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "IDC",
        "ABP",
        "IES"
    ], {
        "D": bladeRequirement("slashblade_addon:nihilbx", 30000, 300000, 150),
        "C": bladeRequirement("sjap_adder:crimsoncherryex", 15000, 150000, 150),
        "A": bladeRequirement("sjap_adder:nihilulex", 15000, 150000, 150),
        "B": bladeRequirement("slashblade_addon:nihilul", 15000, 150000, 150),
        "I": "kubejs:unmelting_ice",
        "E": "minecraft:diamond_block",
        "P": "slashblade:proudsoul_trapezohedron",
        "S": "slashblade:proudsoul_sphere"
    }, "sjap_adder:nihilbxex").id("sdbf:nihilbxex_s5");

    // 永罚大剑 + 阿贝 → 「永罚」：保留金色逆刺、黄金穿刺与癫火主题。
    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "IBN",
        "FAP",
        "ICG"
    ], {
        "F": bladeRequirement("slashblade:greatsword_of_damnation_full", 30000, 300000, 150),
        "A": bladeRequirement("slashblade_addon:kamuy_fire", 10000, 100000, 150),
        "I": "kubejs:unmelting_ice",
        "B": "last_smith:scroll_sharpness",
        "N": "minecraft:nether_star",
        "P": "slashblade:proudsoul_trapezohedron",
        "C": "draconicevolution:awakened_core",
        "G": "cataclysm:ignitium_ingot"
    }, "slashblade_sendims:greatsword_of_damnation_final").id("sdbf:greatsword_of_damnation_final_s5");
})
