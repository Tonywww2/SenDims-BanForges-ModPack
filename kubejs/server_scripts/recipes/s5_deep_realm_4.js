ServerEvents.recipes(event => {
    event.custom({
        "type": "deeprealm_4th:projection_combining",
        "result": Item.of("kubejs:rainbowshift_entropy").toJson(),
        "steps": [
            { "stack": Item.of("deeprealm_4th:star_slurry").toJson(), "direction": "material_on_frame" },
            { "stack": Item.of("minecraft:glow_berries").toJson(), "direction": "frame_on_material" },
            { "stack": Item.of("minecraft:shroomlight").toJson(), "direction": "frame_on_material" },
            { "stack": Item.of("minecraft:glow_ink_sac").toJson(), "direction": "material_on_frame" }
        ]
    }).id("sdbf:rainbowshift_entropy_s5");

    event.custom({
        "type": "deeprealm_4th:combination_forging",
        "result": Item.of("kubejs:epsilon_dust").toJson(),
        "ingredients": [
            { "stack": Item.of("slashblade:proudsoul_trapezohedron").toJson() },
            { "stack": Item.of('kubejs:delta_dust').toJson() },
        ],
        "clicks": 8,
        "cooldown": 5,
        "levels": 45
    }).id("sdbf:epsilon_dust_s5");

})