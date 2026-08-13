// priority: 100
ServerEvents.highPriorityData(event => {
    let deepRealm1Boss = (id) => {
        let boss = bossMaterialBuilder(event, id, "deep_realm_1")
            .setWeight(75).setQuality(2).setSize(1, 1)
            .addValidGearSet("#none").addDimension("sdbf:deep_realm_level_1")
            .setMinRarity("uncommon").setMaxRarity("rare");
        boss.forRarity("uncommon")
            .setEnchantChance(0.25)
            .setEnchantmentLevels([0, 0, 0, 0])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.1,
                10, 0.05)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 1,
                10, 0.1)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.05,
                10, 0.01)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.5);
        boss.forRarity("rare")
            .setEnchantChance(0.35)
            .setEnchantmentLevels([0, 0, 0, 0])
            .addEffect("minecraft:fire_resistance", 1.0)
            .addAttributeRange("minecraft:generic.max_health", "MULTIPLY_TOTAL", 0.15,
                10, 0.05)
            .addAttributeRange("minecraft:generic.attack_damage", "ADDITION", 1,
                10, 0.1)
            .addAttributeRange("minecraft:generic.movement_speed", "MULTIPLY_TOTAL", 0.1,
                10, 0.01)
            .addAttribute("minecraft:generic.knockback_resistance", "ADDITION", 0.6);
        boss.build();
    };

    deepRealm1Boss("terra_entity:blue_slime");
    deepRealm1Boss("terra_entity:purple_slime");
    deepRealm1Boss("terra_entity:green_slime");
    deepRealm1Boss("terra_entity:red_slime");
    deepRealm1Boss("terra_entity:yellow_slime");
    deepRealm1Boss("terra_entity:honey_slime");
    deepRealm1Boss("terra_entity:black_slime");
    deepRealm1Boss("terra_entity:pink_slime");
    deepRealm1Boss("terra_entity:dungeon_slime");
    deepRealm1Boss("terra_entity:desert_slime");
    deepRealm1Boss("terra_entity:green_dumpling_slime");
    deepRealm1Boss("terra_entity:swamp_slime");
    deepRealm1Boss("terra_entity:jungle_slime");
    deepRealm1Boss("terra_entity:golden_slime");
    // deepRealm1Boss("terra_entity:jungle_bat");
    deepRealm1Boss("terra_entity:snatcher");
    deepRealm1Boss("terra_entity:man_eater");
    deepRealm1Boss("terra_entity:hornet");
    deepRealm1Boss("terra_entity:ice_slime");
    // deepRealm1Boss("terra_entity:ice_bat");
    deepRealm1Boss("terra_entity:lava_slime");
    // deepRealm1Boss("terra_entity:hell_bat");
    deepRealm1Boss("terra_entity:crimson_slime");
    deepRealm1Boss("terra_entity:corrupt_slime");
    deepRealm1Boss("terra_entity:tropic_slime");
    deepRealm1Boss("terra_entity:evil_slime");
    // deepRealm1Boss("terra_entity:demon_eye");
    deepRealm1Boss("terra_entity:blood_crawler");
    deepRealm1Boss("terra_entity:bloody_spore");
    deepRealm1Boss("terra_entity:spore_skeleton");
    deepRealm1Boss("terra_entity:spore_zombie");
    deepRealm1Boss("terra_entity:hat_spore_zombie");
    deepRealm1Boss("terra_entity:decayeder");
    deepRealm1Boss("terra_entity:devourer");
    deepRealm1Boss("terra_entity:giant_shelly");
    deepRealm1Boss("terra_entity:giant_worm");
    deepRealm1Boss("terra_entity:dark_caster");
    deepRealm1Boss("terra_entity:undead_viking");
    deepRealm1Boss("terra_entity:goblin_sorcerer");
    deepRealm1Boss("terra_entity:goblin_archer");
    deepRealm1Boss("terra_entity:goblin_peon");
    deepRealm1Boss("terra_entity:goblin_warrior");
    deepRealm1Boss("terra_entity:goblin_thief");
    deepRealm1Boss("terra_entity:goblin_scout");
    deepRealm1Boss("terra_entity:anger_goblin");
    deepRealm1Boss("terra_entity:nymph");
    // deepRealm1Boss("terra_entity:cave_bat");
    // deepRealm1Boss("terra_entity:spore_bat");
    deepRealm1Boss("terra_entity:tomb_crawler");
    deepRealm1Boss("terra_entity:antlion_swarmer");
    deepRealm1Boss("terra_entity:giant_antlion_swarmer");
    deepRealm1Boss("terra_entity:harpy");
    // deepRealm1Boss("terra_entity:demon");
    deepRealm1Boss("terra_entity:voodoo_demon");
    // deepRealm1Boss("terra_entity:drippler");
    deepRealm1Boss("terra_entity:blood_zombie");
    // deepRealm1Boss("terra_entity:wandering_eye_fish");
    // deepRealm1Boss("terra_entity:ghost");
    deepRealm1Boss("terra_entity:crimera");
    // deepRealm1Boss("terra_entity:eater_of_souls");
    deepRealm1Boss("terra_entity:face_monster");
    deepRealm1Boss("terra_entity:fire_imp");
    deepRealm1Boss("terra_entity:snow_flinx");
    deepRealm1Boss("terra_entity:anger_bones");
    deepRealm1Boss("terra_entity:short_bones");
    deepRealm1Boss("terra_entity:big_bones");
    deepRealm1Boss("terra_entity:big_anger_bones");
    deepRealm1Boss("terra_entity:big_muscle_anger_bones");
    deepRealm1Boss("terra_entity:big_helmet_anger_bones");
    // deepRealm1Boss("terra_entity:cursed_skull");

})