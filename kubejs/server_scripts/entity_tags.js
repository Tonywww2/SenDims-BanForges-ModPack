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

    addSpaceEntity("minecraft:stray");
    addSpaceEntity("powerful_dummy:test_dummy");

})
