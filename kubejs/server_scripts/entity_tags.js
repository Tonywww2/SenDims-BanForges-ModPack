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
        "minecraft:spider"
    ]);


    event.add("enderio:soul_vial_blacklist", [
        "#productivebees:solitary_bees",
        "minecraft:warden"
    ]);

    event.add("enderio:spawner_blacklist", [
        "#forge:bosses",
        "#enderio:soul_vial_blacklist"
    ]);

})
