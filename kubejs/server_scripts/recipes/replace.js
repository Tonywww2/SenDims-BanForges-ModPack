ServerEvents.recipes(event => {
    event.replaceInput({id : 'storagedrawers:copper_storage_upgrade'}, 
        'storagedrawers:upgrade_template',
        'storagedrawers:obsidian_storage_upgrade'
    );
    
    event.replaceInput({id : 'storagedrawers:iron_storage_upgrade'}, 
        'storagedrawers:upgrade_template',
        'storagedrawers:copper_storage_upgrade'
    );
    
    event.replaceInput({id : 'storagedrawers:gold_storage_upgrade'}, 
        'storagedrawers:upgrade_template',
        'storagedrawers:iron_storage_upgrade'
    );
    
    event.replaceInput({id : 'storagedrawers:emerald_storage_upgrade'}, 
        'storagedrawers:upgrade_template',
        'storagedrawers:gold_storage_upgrade'
    );
    
    event.replaceInput({id : 'storagedrawers:diamond_storage_upgrade'}, 
        'storagedrawers:upgrade_template',
        'storagedrawers:emerald_storage_upgrade'
    );
    
    event.replaceInput({id : 'storagedrawers:netherite_storage_upgrade'}, 
        'storagedrawers:upgrade_template',
        'storagedrawers:diamond_storage_upgrade'
    );
    
    event.replaceInput({id : 'ae2:network/blocks/crystal_processing_charger'}, 
        '#forge:ingots/copper',
        '#forge:gems/certus_quartz'
    );
    
    event.replaceInput({id : 'nuclearcraft:manufactory'}, 
        "minecraft:redstone",
        'integrateddynamics:energy_battery'
    );
    
    event.replaceInput({id : 'apotheosis:simple_reforging_table'}, 
        'apotheosis:gem_dust',
        'apotheosis:epic_material'
    );
    
    event.replaceInput({id : 'apotheosis:reforging_table'}, 
        'apotheosis:epic_material',
        'apotheosis:mythic_material'
    );
    // TODO 替换为最终材料
    event.replaceInput({id : 'apotheosis:augmenting_table'}, 
        'apotheosis:mythic_material',
        "minecraft:bedrock"
    );
    
    event.replaceInput({}, 
        'minecraft:enchanting_table',
        'ad_astra:moon_globe'
    );

})