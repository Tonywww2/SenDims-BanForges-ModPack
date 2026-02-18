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
    
    event.replaceInput({}, 
        'minecraft:enchanting_table',
        'ad_astra:moon_globe'
    );

})