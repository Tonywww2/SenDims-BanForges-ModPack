// priority: 150
// 攻击， 生命， 护甲
/**
 * 生物对应的模板
 */
const mobTypes = {
    'tofucraft:shudofuspider': typeB,
    'tofucraft:fukumame_thower': typeA,
    'tofucraft:zundamite': typeB,
    'tofucraft:tofunian': typeA,
    'tofucraft:traveler_tofunian': typeA,
    'tofucraft:tofuslime': typeSlime,
    'tofucraft:tofucreeper': typeB,
    'tofucraft:tofuspider': typeB,

    'tofucraft:tofu_gandlem': bossType1,

    "minecraft:zombie": typeA,
    "minecraft:skeleton": typeA,
    "minecraft:spider": typeB,
    "minecraft:creeper": typeB,
    "minecraft:enderman": typeC,
    "minecraft:iron_golem": typeC,
    "minecraft:warden": typeCEX2,

    "twilightforest:towerwood_borer": typeB,
    "twilightforest:carminite_broodling": typeB,
    "twilightforest:fire_beetle": typeA,
    "twilightforest:slime_beetle": typeC,
    "twilightforest:pinch_beetle": typeA,
    "twilightforest:blockchain_goblin": typeA,
    "twilightforest:lower_goblin_knight": typeD,
    "twilightforest:skeleton_druid": typeB,
    "twilightforest:redcap_sapper": typeA,
    "twilightforest:redcap": typeA,
    "twilightforest:pinch_beetle": typeB,
    "twilightforest:kobold": typeA,
    "twilightforest:king_spider": bossType1,
    "twilightforest:hostile_wolf": typeB,
    "twilightforest:helmet_crab": typeB,
    "twilightforest:hedge_spider": typeB,
    "twilightforest:death_tome": typeA,
    "twilightforest:wraith": typeA,
    "twilightforest:swarm_spider": typeB,
    "twilightforest:mist_wolf": typeB,

    "twilightforest:minotaur": typeAEX2,
    "twilightforest:maze_slime": typeSlime,
    "twilightforest:carminite_golem": typeCEX2,
    "twilightforest:carminite_ghastling": typeB,
    "twilightforest:carminite_ghastguard": typeB,
    "twilightforest:stable_ice_core": typeAEX2,
    "twilightforest:snow_guardian": typeAEX2,
    "twilightforest:ice_crystal": typeB,
    "twilightforest:giant_miner": typeCEX2,
    "twilightforest:armored_giant": typeCEX2,
    "twilightforest:yeti": typeAEX2,
    "twilightforest:winter_wolf": typeB,
    "twilightforest:unstable_ice_core": typeB,
    "twilightforest:troll": typeAEX2,
    "twilightforest:adherent": typeAEX2,
    "twilightforest:harbinger_cube": typeCEX2,

    "twilightforest:naga": bossType1,
    "twilightforest:lich": bossType2,
    "twilightforest:knight_phantom": bossType1,
    "twilightforest:ur_ghast": bossType1,
    "twilightforest:minoshroom": bossType1EX1,
    "twilightforest:hydra": bossType2EX2,
    "twilightforest:alpha_yeti": bossType2EX2,
    "twilightforest:snow_queen": bossType2EX2,

    "ad_astra:star_crawler": typeA,
    "ad_astra:corrupted_lunarian": typeC,
    "minecraft:stray": typeC,

    "aether:aechor_plant": typeB,
    "aether:blue_swet": typeSlime,
    "aether:cockatrice": typeB,
    "aether:fire_minion": typeD,
    "aether:golden_swet": typeSlime,
    "aether:mimic": typeA,
    "aether:sentry": typeD,
    "aether:valkyrie": typeC,
    "aether:zephyr": typeC,
    "deep_aether:venomite": typeB,
    "aether_redux:vanilla_swet": typeSlime,

    "aether:valkyrie_queen": bossType1,
    "aether:slider": bossType2,
    "aether:sun_spirit": bossType2,
    "aether:valkyrie_queen": bossType1,
    "lost_aether_content:aerwhale_king": bossType2,
    "deep_aether:eots_segment": bossType1,
    "deep_aether:eots_controller": bossType2,

    "terra_entity:blue_slime": typeSlime,
    "terra_entity:purple_slime": typeSlime,
    "terra_entity:green_slime": typeSlime,
    "terra_entity:red_slime": typeSlime,
    "terra_entity:yellow_slime": typeSlime,
    "terra_entity:honey_slime": typeSlime,
    "terra_entity:black_slime": typeSlime,
    "terra_entity:pink_slime": typeSlime,
    "terra_entity:dungeon_slime": typeSlime,
    "terra_entity:desert_slime": typeSlime,
    "terra_entity:green_dumpling_slime": typeSlime,
    "terra_entity:swamp_slime": typeSlime,
    "terra_entity:jungle_slime": typeSlime,
    "terra_entity:golden_slime": typeSlime,
    "terra_entity:jungle_bat": typeB,
    "terra_entity:snatcher": typeA,
    "terra_entity:man_eater": typeB,
    "terra_entity:hornet": typeB,
    "terra_entity:ice_slime": typeSlime,
    "terra_entity:ice_bat": typeB,
    "terra_entity:lava_slime": typeSlime,
    "terra_entity:hell_bat": typeB,
    "terra_entity:crimslime": typeSlime,
    "terra_entity:corrupt_slime": typeSlime,
    "terra_entity:tropic_slime": typeSlime,
    "terra_entity:evil_slime": typeSlime,
    "terra_entity:demon_eye": typeSlime,
    "terra_entity:blood_crawler": typeB,
    "terra_entity:bloody_spore": typeB,
    "terra_entity:spore_skeleton": typeA,
    "terra_entity:spore_zombie": typeA,
    "terra_entity:hat_spore_zombie": typeA,
    "terra_entity:decayeder": typeA,
    
    "terra_entity:giant_shelly": typeC,
    "terra_entity:giant_worm": typeD,
    "terra_entity:dark_caster": typeB,
    "terra_entity:undead_viking": typeA,
    "terra_entity:goblin_sorcerer": typeA,
    "terra_entity:goblin_archer": typeB,
    "terra_entity:goblin_peon": typeD,
    "terra_entity:goblin_warrior": typeC,
    "terra_entity:goblin_thief": typeB,
    "terra_entity:goblin_scout": typeB,
    "terra_entity:anger_goblin": typeC,
    "terra_entity:nymph": typeC,
    "terra_entity:cave_bat": typeB,
    "terra_entity:spore_bat": typeB,
    "terra_entity:tomb_crawler": typeD,
    "terra_entity:antlion_swarmer": typeA,
    "terra_entity:giant_antlion": typeC,
    "terra_entity:harpy": typeB,
    "terra_entity:demon": typeA,
    "terra_entity:voodoo_demon": typeA,
    "terra_entity:drippler": typeB,
    "terra_entity:blood_zombie": typeA,
    "terra_entity:wandering_eye_fish": typeA,
    "terra_entity:ghost": typeA,
    "terra_entity:crimson_kemera": typeB,
    "terra_entity:eater_of_souls": typeA,
    "terra_entity:face_monster": typeA,
    "terra_entity:fire_imp": typeB,
    "terra_entity:snow_flinx": typeB,
    "terra_entity:anger_bones": typeA,
    "terra_entity:short_bones": typeB,
    "terra_entity:big_bones": typeD,
    "terra_entity:big_anger_bones": typeD,
    "terra_entity:big_muscle_anger_bones": typeC,
    "terra_entity:big_helmet_anger_bones": typeC,
    "terra_entity:cursed_skull": typeB,

    "terra_entity:king_slime": bossType1,
    "terra_entity:eye_of_cthulhu": bossType1,
    "terra_entity:eater_of_worlds": bossType2,
    "terra_entity:brain_of_cthulhu": bossType1,
    "terra_entity:queen_bee": bossType1,
    "terra_entity:skeletron": bossType1,
    "terra_entity:dungeon_guardian": bossType2EX2,
    "terra_entity:wall_of_flesh": bossType1EX1,

    "minecraft:wither": bossType2,

    "minecraft:piglin": typeA,
    "minecraft:piglin_brute": typeAEX1,
    "minecraft:zombified_piglin": typeA,
    "minecraft:wither_skeleton": typeA,
    "minecraft:blaze": typeA,
    "minecraft:ghast": typeA,
    "minecraft:hoglin": typeC,
    "minecraft:zoglin": typeC,
    "minecraft:magma_cube": typeSlime,

    "cataclysm:netherite_monstrosity": bossType2,

    "ad_astra:martian_raptor": typeC,

    "minecraft:ender_dragon": bossType2,

    "ad_astra:pygro": typeA,
    "ad_astra:pygro_brute": typeAEX1,
    "ad_astra:zombified_pygro": typeA,
    "ad_astra:zombified_mogler": typeC,

    "nuclearcraft:feral_ghoul": typeA,

    "nuclearcraft:feral_ghoul_boss": bossType1

};
/**
 * 黑名单
 */
const entityBlackList = new Set([
    "powerful_dummy:test_dummy",
    "terra_entity:summon_diamond_sword",
    "terra_entity:summon_golden_sword",
    "terra_entity:summon_imp",
    "terra_entity:summon_iron_sword",
    "terra_entity:summon_netherite_sword",
    "terra_entity:summon_snow_flinx",
    "terra_entity:summon_stone_sword",
    "terra_entity:summon_wooden_sword"
]);

ServerEvents.tags("entity_type", event => {
    for (let e in mobTypes) {
        // console.log(e);
        if (mobTypes[e].isBoss) {
            event.add("enderio:soul_vial_blacklist", e);
            // console.log(e);
        }

    }


});
