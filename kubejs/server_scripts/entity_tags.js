ServerEvents.tags("entity_type", event => {
    let addSpaceEntity = (entity) => {
        event.add("ad_astra:can_survive_extreme_cold",
            entity
        )
        event.add("ad_astra:can_survive_extreme_heat",
            entity
        )
        event.add("ad_astra:can_survive_in_acid_rain",
            entity
        )
        event.add("ad_astra:can_survive_in_space",
            entity
        )
        event.add("ad_astra:ignores_air_vortex",
            entity
        )
        event.add("ad_astra:lives_without_oxygen",
            entity
        )
    };

    addSpaceEntity([
        "minecraft:stray",
        "minecraft:armor_stand",
        "powerful_dummy:test_dummy",
        "cataclysm:urchinkin",
        "cataclysm:drowned_host",
        "cataclysm:symbiocto",
        "cataclysm:hippocamtus",
        "cataclysm:cindaria",
        "cataclysm:scylla",
        "cataclysm:clawdian",
        "cataclysm:koboleton",
        "cataclysm:wadjet",
        "cataclysm:kobolediator",
        "cataclysm:ancient_remnant",
        "cataclysm:ignited_revenant",
        "cataclysm:ignis",
        "terra_entity:king_slime",
        "minecraft:villager",
        "minecraft:camel",
        "minecraft:skeleton",
        "minecraft:phantom",
        "minecraft:wither_skeleton",
        "minecraft:husk",
        "minecraft:hoglin",
        "minecraft:zoglin",
        "terra_entity:demon_eye",
        "terra_entity:meteor_head",
        "terra_entity:wandering_eye_fish",
        "terra_entity:wyvern",
        "minecraft:zombie",
        "minecraft:creeper",
        "ad_astra:sulfur_creeper",
        "minecraft:cave_spider",
        "minecraft:spider",
        "twilightforest:yeti",
        "twilightforest:alpha_yeti",
        "twilightforest:lower_goblin_knight",
        "twilightforest:upper_goblin_knight",
        "twilightforest:pinch_beetle",
        "twilightforest:helmet_crab",
        "twilightforest:blockchain_goblin",
        "twilightforest:knight_phantom",
        "block_factorys_bosses:crossbow_pirate",
        "block_factorys_bosses:pirate_rook",
        "block_factorys_bosses:pirate_captain",
        "block_factorys_bosses:soul_knight_wither_skeleton",
        "block_factorys_bosses:soul_skeleton",
        "block_factorys_bosses:pile_of_bones",
        "block_factorys_bosses:kraken_tentacle",
        "block_factorys_bosses:kraken",
        "block_factorys_bosses:yeti",
        "block_factorys_bosses:underworld_knight",
        "block_factorys_bosses:sandworm",
    ]);

    event.add("forge:bosses", [
        "terra_entity:eater_of_worlds_segment"
    ])


    event.add("enderio:soul_vial_blacklist", [
        "#forge:bosses",
        "#productivebees:solitary_bees",
        "minecraft:warden"
    ]);

    event.add("enderio:spawner_blacklist", [
        "#forge:bosses",
        "#enderio:soul_vial_blacklist"
    ]);

})
