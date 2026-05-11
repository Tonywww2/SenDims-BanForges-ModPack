ServerEvents.recipes(event => {
    event.replaceInput({ id: 'storagedrawers:copper_storage_upgrade' },
        'storagedrawers:upgrade_template',
        'storagedrawers:obsidian_storage_upgrade'
    );

    event.replaceInput({ id: 'storagedrawers:iron_storage_upgrade' },
        'storagedrawers:upgrade_template',
        'storagedrawers:copper_storage_upgrade'
    );

    event.replaceInput({ id: 'storagedrawers:gold_storage_upgrade' },
        'storagedrawers:upgrade_template',
        'storagedrawers:iron_storage_upgrade'
    );

    event.replaceInput({ id: 'storagedrawers:emerald_storage_upgrade' },
        'storagedrawers:upgrade_template',
        'storagedrawers:gold_storage_upgrade'
    );

    event.replaceInput({ id: 'storagedrawers:diamond_storage_upgrade' },
        'storagedrawers:upgrade_template',
        'storagedrawers:emerald_storage_upgrade'
    );

    event.replaceInput({ id: 'storagedrawers:netherite_storage_upgrade' },
        'storagedrawers:upgrade_template',
        'storagedrawers:diamond_storage_upgrade'
    );

    event.replaceInput({ id: 'ae2:network/blocks/crystal_processing_charger' },
        '#forge:ingots/copper',
        '#forge:gems/certus_quartz'
    );

    event.replaceInput({ id: 'nuclearcraft:manufactory' },
        "minecraft:redstone",
        'integrateddynamics:energy_battery'
    );

    event.replaceInput({ id: 'apotheosis:simple_reforging_table' },
        'apotheosis:gem_dust',
        'apotheosis:epic_material'
    );

    event.replaceInput({ id: 'apotheosis:reforging_table' },
        'apotheosis:epic_material',
        'apotheosis:mythic_material'
    );

    event.replaceInput({ id: 'botania:apothecary_default' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_forest' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_plains' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_mountain' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_fungal' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_swamp' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_desert' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_taiga' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_mesa' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_livingrock' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_deepslate' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'botania:apothecary_mossy' },
        "#botania:petals",
        'ad_astra:calorite_engine'
    );

    event.replaceInput({ id: 'apotheosis:augmenting_table' },
        'apotheosis:mythic_material',
        'kubejs:ml_computing_ingot'
    );

    event.replaceInput({ id: 'rehooked:blaze_hook' },
        "minecraft:glowstone_dust",
        "slashblade:proudsoul_crystal"
    );

    event.replaceInput({ id: 'rehooked:ender_hook' },
        "minecraft:ender_pearl",
        "slashblade:proudsoul_crystal"
    );

    event.replaceInput({ id: 'ad_astra_giselle_addon:crafting/enchanted_book_space_fire_proof' },
        "ad_astra:mercury_stone",
        'ad_astra:calorite_ingot'
    );

    event.replaceInput({ id: 'nuclearcraft:fusion_core' },
        'nuclearcraft:chassis',
        'kubejs:delta_dust'
    );

})