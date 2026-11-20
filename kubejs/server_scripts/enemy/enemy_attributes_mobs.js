// priority: 150
// 攻击， 生命， 护甲
/**
 * 生物对应的模板，按怪物所在区域分组，区域按维度档从低到高排。
 * 一种怪出现在多个区域时放在最早遇到的地方；实际数值按怪物所在维度的档位取，与分在哪组无关。
 * 暮色森林分区表里的怪（twilightRegionTypes）不在这里登记。
 */
let mobTypes = new Map([
    // ===== 主世界：原版。minecraft:overworld，0_1，激活主世界阶段后 3_3 =====
    ["minecraft:zombie", typeA],
    ["minecraft:drowned", typeA],
    ["minecraft:zombie_villager", typeA],
    ["minecraft:husk", typeA],
    ["minecraft:skeleton", typeA],
    ["minecraft:stray", typeC],
    ["minecraft:skeleton_horse", typeA],
    ["minecraft:spider", typeB],
    ["minecraft:cave_spider", typeB],
    ["minecraft:creeper", typeB],
    ["minecraft:enderman", typeEnderman],
    ["minecraft:witch", typeA],
    ["minecraft:slime", typeSlime],
    ["minecraft:silverfish", typeSlime],
    ["minecraft:phantom", typeB],
    ["minecraft:warden", typeCEX2],

    // 灾厄村民
    ["minecraft:pillager", typeA],
    ["minecraft:vindicator", typeA],
    ["minecraft:evoker", typeA],
    ["minecraft:vex", typeSlime],
    ["minecraft:ravager", typeC],
    ["minecraft:illusioner", typeA],

    // 海洋
    ["minecraft:guardian", typeGuardian],
    ["minecraft:elder_guardian", bossType1],

    // 中立与被动
    ["minecraft:iron_golem", typeC],
    ["minecraft:villager", typeA],
    ["minecraft:wandering_trader", typeA],
    ["minecraft:trader_llama", typeA],
    ["minecraft:polar_bear", typeC],
    ["minecraft:wolf", type0],
    ["minecraft:horse", typeA],
    ["minecraft:donkey", typeA],
    ["minecraft:ocelot", typeA],
    ["minecraft:cat", type0],
    ["minecraft:rabbit", type0],
    ["minecraft:bat", type0],
    ["minecraft:pig", type0],
    ["minecraft:sheep", type0],
    ["minecraft:cow", type0],
    ["minecraft:goat", type0],
    ["minecraft:chicken", type0],
    ["minecraft:parrot", type0],
    ["minecraft:fox", type0],
    ["minecraft:panda", typeC],
    ["minecraft:camel", typeC],
    ["minecraft:bee", type0],
    ["minecraft:axolotl", type0],
    ["minecraft:dolphin", typeC],
    ["minecraft:turtle", typeD],
    ["minecraft:cod", type0],
    ["minecraft:salmon", type0],
    ["minecraft:pufferfish", type0],
    ["minecraft:squid", type0],
    ["minecraft:glow_squid", type0],
    ["minecraft:tropical_fish", type0],
    ["minecraft:armor_stand", type0],

    // ===== 主世界：泰拉生物（terra_entity 自带的主世界刷怪；深境一层也会刷其中一部分） =====
    // 史莱姆
    ["terra_entity:blue_slime", typeSlime],
    ["terra_entity:purple_slime", typeSlime],
    ["terra_entity:green_slime", typeSlime],
    ["terra_entity:red_slime", typeSlime],
    ["terra_entity:yellow_slime", typeSlime],
    ["terra_entity:black_slime", typeSlime],
    ["terra_entity:pink_slime", typeSlime],
    ["terra_entity:green_dumpling_slime", typeSlime],
    ["terra_entity:honey_slime", typeSlime],
    ["terra_entity:golden_slime", typeSlime],
    ["terra_entity:swamp_slime", typeSlime],
    ["terra_entity:jungle_slime", typeSlime],
    ["terra_entity:desert_slime", typeSlime],
    ["terra_entity:ice_slime", typeSlime],
    ["terra_entity:tropic_slime", typeSlime],
    ["terra_entity:spiked_slime", typeSlime],

    // 地表与洞穴
    ["terra_entity:demon_eye", typeSlime],
    ["terra_entity:cave_bat", typeB],
    ["terra_entity:giant_shelly", typeC],
    ["terra_entity:giant_worm", typeD],
    ["terra_entity:nymph", typeC],
    ["terra_entity:flying_fish", typeSlime],
    ["terra_entity:wraith", typeB],
    ["terra_entity:harpy", typeB],

    // 丛林、沙漠、冰雪
    ["terra_entity:jungle_bat", typeB],
    ["terra_entity:snatcher", typeA],
    ["terra_entity:man_eater", typeB],
    ["terra_entity:hornet", typeB],
    ["terra_entity:piranha", typeB],
    ["terra_entity:antlion_swarmer", typeA],
    ["terra_entity:giant_antlion_swarmer", typeAE],
    ["terra_entity:tomb_crawler", typeD],
    ["terra_entity:ice_bat", typeB],
    ["terra_entity:snow_flinx", typeB],
    ["terra_entity:undead_viking", typeA],

    // 哥布林军队
    ["terra_entity:goblin_sorcerer", typeA],
    ["terra_entity:goblin_archer", typeB],
    ["terra_entity:goblin_peon", typeD],
    ["terra_entity:goblin_warrior", typeC],
    ["terra_entity:goblin_thief", typeB],
    ["terra_entity:goblin_scout", typeB],
    ["terra_entity:anger_goblin", typeC],

    // 骷髅
    ["terra_entity:dark_caster", typeB],
    ["terra_entity:anger_bones", typeA],
    ["terra_entity:short_bones", typeB],
    ["terra_entity:big_bones", typeD],
    ["terra_entity:big_anger_bones", typeD],
    ["terra_entity:big_muscle_anger_bones", typeC],
    ["terra_entity:big_helmet_anger_bones", typeC],
    ["terra_entity:cursed_skull", typeB],

    // 动物与城镇 NPC
    ["terra_entity:blue_jay", type0],
    ["terra_entity:bird", type0],
    ["terra_entity:bunny", type0],
    ["terra_entity:cardinal", type0],
    ["terra_entity:duck", typeA],
    ["terra_entity:jewel_bunny", typeA],
    ["terra_entity:squirrel", type0],
    ["terra_entity:guide", type0],
    ["terra_entity:clothier", type0],
    ["terra_entity:traveling_merchant", type0],
    ["terra_entity:demolitionist", typeA],
    ["terra_entity:goblin_tinkerer", type0],

    // ===== 主世界：其他模组 =====
    ["species:wicked", typeC],
    ["species:cliff_hanger", typeB],
    ["species:limpet", typeA],
    ["species:quake", typeD],
    ["species:ghoul", typeC],
    ["species:stackatick", typeA],
    ["species:leaf_hanger", typeA],
    ["quark:forgotten", typeB],
    ["artifacts:mimic", typeAEX1],
    ["strongerwanderer:phantom", typeCEX2],
    ["biomemakeover:ghost", typeA],
    ["bagusmob:tengu", typeB],
    ["bagusmob:ninjar", typeB],
    ["thermal:basalz", typeA],
    ["thermal:blizz", typeA],
    ["thermal:blitz", typeA],

    // 下界人（netherman）：结构只生成在主世界
    ["netherman:believer", typeA],
    ["netherman:totemus_puzzle", typeA],
    ["netherman:piglin_prisoner", typeA],
    ["netherman:believer_villager", typeA],
    ["netherman:welcomer", typeA],
    ["netherman:blacksmith", typeA],
    ["netherman:doctor", typeA],
    ["netherman:statue_entity", typeC],
    ["netherman:bell_guardian", typeC],
    ["netherman:manipulator", typeC],
    ["netherman:guardian", typeD],
    ["netherman:statue_bossunit", typeC],
    ["netherman:gilded_golem", typeAEX1],
    ["netherman:azazel_human", bossType2],
    ["netherman:azazel", bossType2],
    ["netherman:villager_prisoner", type0],
    ["netherman:ghastly", type0],
    ["netherman:trader", type0],

    // 被动
    ["quark:crab", type0],
    ["quark:shiba", type0],
    ["quark:stoneling", type0],
    ["quark:toretoise", typeD],
    ["biomemakeover:helmit_crab", type0],
    ["biomemakeover:scuttler", type0],
    ["biomemakeover:mushroom_trader", type0],
    ["biomemakeover:glowfish", type0],
    ["species:deepfish", type0],

    // 蜜蜂
    ["productivebees:configurable_bee", type0],
    ["productivebees:sweat_bee", type0],
    ["productivebees:digger_bee", type0],
    ["productivebees:mason_bee", type0],
    ["productivebees:green_carpenter_bee", type0],
    ["productivebees:yellow_black_carpenter_bee", type0],
    ["productivebees:bumble_bee", type0],
    ["productivebees:reed_bee", type0],
    ["productivebees:ashy_mining_bee", type0],
    ["productivebees:chocolate_mining_bee", type0],
    ["productivebees:resin_bee", type0],

    // ===== 豆腐世界。tofucraft:tofu_world，0_1 =====
    ["tofucraft:shudofuspider", typeB],
    ["tofucraft:fukumame_thower", typeA],
    ["tofucraft:zundamite", typeB],
    ["tofucraft:tofunian", typeA],
    ["tofucraft:traveler_tofunian", typeA],
    ["tofucraft:tofuslime", typeSlime],
    ["tofucraft:tofucreeper", typeB],
    ["tofucraft:tofuspider", typeB],
    ["tofucraft:tofu_gandlem", bossType1],

    // 被动
    ["tofucraft:tofupig", type0],
    ["tofucraft:tofufish", type0],
    ["tofucraft:tofucow", type0],

    // ===== 深境一层。sdbf:deep_realm_level_1，1_1 =====
    // 孢子、地牢：只在深境一层的群系里刷
    ["terra_entity:spore_skeleton", typeA],
    ["terra_entity:spore_zombie", typeA],
    ["terra_entity:hat_spore_zombie", typeA],
    ["terra_entity:spore_bat", typeB],
    ["terra_entity:ghost", typeA],
    ["terra_entity:dungeon_slime", typeSlime],

    // 洞穴群系（Darker Depths、YUNG's Cave Biomes）
    ["darkerdepths:body_snatcher", typeB],
    ["darkerdepths:void_soul", typeA],
    ["darkerdepths:void_soul_knight", typeAE],
    ["yungscavebiomes:ice_cube", typeSlime],

    // 灾变：远古工厂
    ["cataclysm:the_watcher", type0],
    ["cataclysm:the_prowler", typeAE],
    ["cataclysm:the_harbinger", bossType1],

    // ===== 暮色森林。twilightforest:twilight_forest，1_2。分区表里的 36 种怪见下方 twilightRegionTypes，这里只有动物、终焉城堡的怪和暮刃守卫 =====
    // 终焉城堡（暮色第一段）
    ["twilightforest:death_tome", typeA],
    ["twilightforest:wraith", typeA],
    ["twilightforest:kobold", typeA],
    ["twilightforest:redcap", typeA],
    ["twilightforest:redcap_sapper", typeA],
    ["twilightforest:fire_beetle", typeA],
    ["twilightforest:adherent", typeB],
    ["twilightforest:skeleton_druid", typeB],
    ["twilightforest:harbinger_cube", typeC],
    ["slashblade_sendims:twilight_blade_warden", bossType1],

    // 动物
    ["twilightforest:squirrel", type0],
    ["twilightforest:tiny_bird", type0],
    ["twilightforest:bighorn_sheep", type0],
    ["twilightforest:deer", type0],
    ["twilightforest:dwarf_rabbit", type0],
    ["twilightforest:boar", type0],
    ["twilightforest:raven", type0],
    ["twilightforest:penguin", type0],

    // ===== 天境。aether:the_aether，1_2 =====
    ["aether:aechor_plant", typeB],
    ["aether:blue_swet", typeSlime],
    ["aether:golden_swet", typeSlime],
    ["ancient_aether:festive_swet", typeSlime],
    ["aether_redux:vanilla_swet", typeSlime],
    ["aether:cockatrice", typeB],
    ["aether:fire_minion", typeD],
    ["aether:mimic", typeA],
    ["aether:sentry", typeD],
    ["aether:valkyrie", typeC],
    ["aether:zephyr", typeC],
    ["aether:aerwhale", typeC],
    ["deep_aether:venomite", typeB],
    ["aether:whirlwind", type0],
    ["aether:evil_whirlwind", type0],

    // 首领
    ["aether:valkyrie_queen", bossType1],
    ["aether:slider", bossType2],
    ["aether:sun_spirit", bossType2],
    ["lost_aether_content:aerwhale_king", bossType2],
    ["deep_aether:eots_segment", bossType1],
    ["deep_aether:eots_controller", bossType2],
    ["ancient_aether:fluffalo", bossType1],

    // 被动
    ["aether:sheepuff", type0],
    ["aether:phyg", type0],
    ["aether:moa", type0],
    ["aether:aerbunny", type0],
    ["aether:flying_cow", type0],
    ["deep_aether:aerglow_fish", type0],
    ["deep_aether:quail", type0],

    // ===== 月球。ad_astra:moon，1_2 =====
    ["ad_astra:star_crawler", typeA],
    ["ad_astra:corrupted_lunarian", typeC],
    ["ad_astra:lunarian", type0],
    ["ad_astra:lunarian_wandering_trader", type0],

    // ===== 下界。minecraft:the_nether，1_3 =====
    ["minecraft:piglin", typeA],
    ["minecraft:piglin_brute", typeAEX1],
    ["minecraft:zombified_piglin", typeA],
    ["minecraft:wither_skeleton", typeA],
    ["minecraft:blaze", typeA],
    ["minecraft:ghast", typeA],
    ["minecraft:hoglin", typeC],
    ["minecraft:zoglin", typeAE],
    ["minecraft:magma_cube", typeSlime],
    ["minecraft:strider", type0],
    ["quark:foxhound", typeB],
    ["quark:wraith", typeA],
    ["species:wraptor", type0],

    // 泰拉生物：地狱
    ["terra_entity:demon", typeA],
    ["terra_entity:voodoo_demon", typeA],
    ["terra_entity:fire_imp", typeB],
    ["terra_entity:hell_bat", typeB],
    ["terra_entity:lava_slime", typeSlime],

    // 泰拉生物：腐化与猩红（crimera 和三种史莱姆没在刷怪表里找到，按同类放在这里）
    ["terra_entity:eater_of_souls", typeA],
    ["terra_entity:devourer", typeA],
    ["terra_entity:decayeder", typeA],
    ["terra_entity:face_monster", typeA],
    ["terra_entity:blood_crawler", typeB],
    ["terra_entity:bloody_spore", typeB],
    ["terra_entity:blood_zombie", typeA],
    ["terra_entity:drippler", typeB],
    ["terra_entity:wandering_eye_fish", typeA],
    ["terra_entity:crimera", typeC],
    ["terra_entity:corrupt_slime", typeSlime],
    ["terra_entity:crimson_slime", typeSlime],
    ["terra_entity:evil_slime", typeSlime],

    // 灾变：灵魂铁匠铺
    ["cataclysm:netherite_monstrosity", bossType2],
    ["cataclysm:netherite_ministrosity", typeAE],

    // ===== 火星。ad_astra:mars，1_4 =====
    ["ad_astra:martian_raptor", typeC],

    // 方块工厂：冥界竞技场
    ["block_factorys_bosses:soul_skeleton", typeA],
    ["block_factorys_bosses:soul_knight_wither_skeleton", typeD],
    ["block_factorys_bosses:pile_of_bones", typeD],
    ["block_factorys_bosses:underworld_knight", bossType2],

    // ===== 深境二层（世界树之海）。sdbf:deep_realm_level_2，2_1 =====
    ["terra_entity:arapaima", typeC],
    ["terra_entity:shark", typeA],
    ["terra_entity:green_jellyfish", typeSlime],
    ["terra_entity:blue_jellyfish", typeSlime],
    ["terra_entity:pink_jellyfish", typeA],
    ["terra_entity:granite_elemental", typeD],
    ["terra_entity:pixie", typeB],
    ["terra_entity:possess_armor", typeC],
    ["cataclysm:amethyst_crab", typeAE],

    // 灾变：沉没之城
    ["cataclysm:lionfish", type0],
    ["cataclysm:deepling", typeA],
    ["cataclysm:deepling_angler", typeB],
    ["cataclysm:deepling_brute", typeD],
    ["cataclysm:deepling_priest", typeA],
    ["cataclysm:deepling_warlock", typeA],
    ["cataclysm:drowned_host", typeA],
    ["cataclysm:symbiocto", typeB],
    ["cataclysm:coral_golem", typeAE],
    ["cataclysm:coralssus", typeAE],
    ["cataclysm:the_baby_leviathan", typeA],
    ["cataclysm:the_leviathan", bossType2],

    // 方块工厂：海怪船
    ["block_factorys_bosses:crossbow_pirate", typeB],
    ["block_factorys_bosses:pirate_rook", typeA],
    ["block_factorys_bosses:pirate_captain", typeC],
    ["block_factorys_bosses:kraken_tentacle", typeAE],
    ["block_factorys_bosses:kraken", bossType1],

    // ===== 金星、水星。ad_astra:venus、ad_astra:mercury，2_1 =====
    // 金星
    ["ad_astra:pygro", typeA],
    ["ad_astra:pygro_brute", typeAEX1],
    ["ad_astra:zombified_pygro", typeA],
    ["ad_astra:mogler", typeA],
    ["ad_astra:zombified_mogler", typeC],
    ["ad_astra:sulfur_creeper", typeA],

    // 灾变：诅咒金字塔（金星）
    ["cataclysm:koboleton", typeC],
    ["cataclysm:wadjet", typeA],
    ["cataclysm:kobolediator", typeAE],
    ["cataclysm:ancient_remnant", bossType1],

    // 灾变：燃烧竞技场（水星）
    ["cataclysm:ignited_berserker", typeD],
    ["cataclysm:ignited_revenant", typeAE],
    ["cataclysm:ignis", bossType1],

    // ===== 午夜。midnight:the_midnight，2_2 =====
    ["midnight:rifter", typeA],
    ["midnight:nightshade", typeC],
    ["midnight:slink", typeD],
    ["midnight:nightstag", typeD],
    ["midnight:nova", typeB],
    ["midnight:stinger", typeB],
    ["midnight:crystal_bug", typeB],

    // 方块工厂：龙塔
    ["block_factorys_bosses:flaming_skeleton_guard_sword", typeA],
    ["block_factorys_bosses:dragon_guard_sword", typeA],
    ["block_factorys_bosses:flaming_skeleton_guard_fireball", typeB],
    ["block_factorys_bosses:infernal_dragon", bossType1],

    // 上古首领：玛莱妮亚
    ["elder_bosses:malenia", bossType3],

    // ===== 地下花园。undergarden:undergarden，2_2 =====
    ["undergarden:rotbeast", typeC],
    ["undergarden:rotling", typeB],
    ["undergarden:rotwalker", typeA],
    ["undergarden:forgotten", typeD],
    ["undergarden:minion", typeD],
    ["undergarden:sploogie", typeSlime],
    ["undergarden:nargoyle", typeB],
    ["undergarden:muncher", typeA],
    ["undergarden:scintling", typeSlime],
    ["undergarden:stoneborn", typeA],
    ["undergarden:forgotten_guardian", bossType1],
    ["final_samurai:samurai", bossType1EX1],

    // 核废土群系
    ["nuclearcraft:feral_ghoul", typeA],
    ["nuclearcraft:feral_ghoul_boss", typeAE],

    // 被动
    ["undergarden:brute", type0],
    ["undergarden:gwib", type0],
    ["undergarden:gwibling", type0],
    ["undergarden:mog", type0],
    ["undergarden:dweller", type0],

    // ===== 末地。minecraft:the_end，2_3 =====
    ["minecraft:shulker", typeD],
    ["minecraft:endermite", typeSlime],
    ["minecraft:ender_dragon", bossTypeDragon],

    // 灾变：废墟要塞
    ["cataclysm:endermaptera", typeB],
    ["cataclysm:ender_golem", typeAE],
    ["cataclysm:ender_guardian", bossType1],

    // ===== 小行星带。sdbf:asteroid_belt，3_1 =====
    ["terra_entity:meteor_head", typeD],
    ["terra_entity:wyvern", typeA],

    // 灾变：卫城
    ["cataclysm:urchinkin", type0],
    ["cataclysm:hippocamtus", typeD],
    ["cataclysm:cindaria", typeC],
    ["cataclysm:clawdian", typeAE],
    ["cataclysm:scylla", bossType1],

    // ===== 蜂巢。the_bumblezone:the_bumblezone，3_2 =====
    ["the_bumblezone:rootmin", typeA],
    ["the_bumblezone:variant_bee", typeA],
    ["the_bumblezone:honey_slime", typeSlime],
    ["the_bumblezone:beehemoth", typeC],
    ["the_bumblezone:cosmic_crystal_entity", typeCosmicCrystal],
    ["the_bumblezone:bee_queen", bossType2EX2],

    // ===== 土星环。slashblade_sendims:saturn_ring，3_3 =====
    ["block_factorys_bosses:sandworm", bossType2],

    // ===== 里末地。sdbf:inside_the_end，3_3 =====
    ["draconicevolution:draconic_guardian", bossTypeDragon],

    // ===== 霜原星。ad_astra:glacio，4_1 =====
    ["ad_astra:glacian_ram", type0],

    // 灾变：冰霜监狱
    ["cataclysm:draugr", typeA],
    ["cataclysm:royal_draugr", typeB],
    ["cataclysm:elite_draugr", typeC],
    ["cataclysm:aptrgangr", typeAE],
    ["cataclysm:maledictus", bossType1],

    // ===== 土卫六。titan_moon:titan，4_1 =====
    ["titan_moon:methane_midge", type0],
    ["titan_moon:aero_jelly", type0],
    ["titan_moon:cryo_scavenger", typeC],
    ["titan_moon:hydrotroph_grazer", type0],
    ["titan_moon:ammonia_stalker", typeA],
    ["titan_moon:corrupted_probe", typeC],
    ["titan_moon:tholin_weaver", typeC],
    ["titan_moon:native_ice_worm", bossType1],

    // ===== 深境四层。deeprealm_4th:fourth_layer，4_2 =====
    ["elder_bosses:promised_consort", bossType4],
    ["elder_bosses:promised_consort_clone", bossType4],

    // ===== 召唤出来的首领和怪：按召唤处的维度档 =====
    ["minecraft:wither", bossType2],
    ["botania:pixie", typeA],
    ["botania:doppleganger", bossTypeGaia],

    // 泰拉首领
    ["terra_entity:king_slime", bossType1],
    ["terra_entity:eye_of_cthulhu", bossType1],
    ["terra_entity:eater_of_worlds", bossType2],
    ["terra_entity:eater_of_worlds_segment", typeAE],
    ["terra_entity:brain_of_cthulhu", bossType1],
    ["terra_entity:queen_bee", bossType1],
    ["terra_entity:skeletron", bossType1],
    ["terra_entity:dungeon_guardian", bossType2EX2],
    ["terra_entity:deerclops", bossType2],

    // 血肉之墙与它召出的怪
    ["terra_entity:wall_of_flesh", bossType2],
    ["terra_entity:hill_of_flesh", bossType2],
    ["terra_entity:the_hungry", typeB],
    ["terra_entity:hill_hungry", typeB],
    ["terra_entity:leech", typeC],

    // ===== 位置未确认：没在本包的刷怪表和结构里找到 =====
    ["species:cruncher", typeA],
    ["species:birt", type0],
    ["bagusmob:hunter_boar", typeA],
    ["bagusmob:burner_hog", typeA],
    ["dog:devourer_head", typeAE],
    ["dog:devourer_segment", typeAE],
    ["dog:devourer_tail", typeAE],

    // 方块工厂雪怪：雪怪藏身处的群系标签为空，结构不生成
    ["block_factorys_bosses:yeti", bossType1],
]);

/**
 * 暮色森林的怪按新流程分区（docs/development/暮色森林敌人与首领数值模板-2026-11-18.md）。
 * 暮色是 1.2 + 1.3 的维度：前半段在 1.2，后半段是 1.3（EX 模板的定位）。
 * [模板, 档位偏移]：偏移 1 等于高一档（1_2 → 1_3，即 EX1），非整数在两档之间插值。
 * 表里的怪在所有维度都按这张表：模板用这里的，档位取当地维度档再加偏移（星门星球、试炼之门里也一样）。
 * 它们不在 mobTypes 里登记；没列出的暮色怪（动物、终焉城堡的怪、暮刃守卫）按 mobTypes。
 */
let twilightRegionTypes = new Map([
    // 段 2：荆棘高地、巨魔洞穴、云上城堡
    ["twilightforest:troll", [typeC, 1 / 5]],
    ["twilightforest:giant_miner", [typeA, 2 / 5]],
    ["twilightforest:armored_giant", [typeA, 2 / 5]],
    // 段 3：普通群系、沼泽、迷宫
    ["twilightforest:pinch_beetle", [typeB, 1 / 4]],
    ["twilightforest:slime_beetle", [typeC, 1 / 4]],
    ["twilightforest:king_spider", [bossType1W, 1 / 4]],
    ["twilightforest:minotaur", [typeA, 1 / 4]],
    ["twilightforest:maze_slime", [typeSlime, 1 / 4]],
    ["twilightforest:minoshroom", [bossType1, 1 / 4]],
    
    ["twilightforest:hostile_wolf", [typeB, 1 / 3]],
    ["twilightforest:mist_wolf", [typeB, 1 / 3]],
    ["twilightforest:swarm_spider", [typeB, 1 / 3]],
    ["twilightforest:hedge_spider", [typeB, 1 / 3]],
    ["twilightforest:mosquito_swarm", [typeB, 1 / 3]],
    // 段 4、5：火焰沼泽、娜迦庭院
    ["twilightforest:hydra", [bossTypeHydraA, 1 / 2]],
    ["twilightforest:naga", [bossType1, 1 / 2]],
    // 段 6：黑暗森林、骑士要塞
    ["twilightforest:helmet_crab", [typeB, 1 / 2]],
    ["twilightforest:blockchain_goblin", [typeA, 1 / 2]],
    ["twilightforest:lower_goblin_knight", [typeD, 1 / 2]],
    ["twilightforest:upper_goblin_knight", [typeB, 1 / 2]],
    ["twilightforest:knight_phantom", [bossType1W, 1 / 2]],
    // 段 7：幽冥高塔
    ["twilightforest:towerwood_borer", [typeB, 2 / 3]],
    ["twilightforest:carminite_broodling", [typeB, 2 / 3]],
    ["twilightforest:carminite_ghastling", [typeB, 2 / 3]],
    ["twilightforest:carminite_ghastguard", [typeB, 2 / 3]],
    ["twilightforest:carminite_golem", [typeC, 2 / 3]],
    ["twilightforest:ur_ghast", [bossType2, 2 / 3]],
    // 段 8：巫妖塔。偏移 1 即 EX1，进入 1.3 部分（打完可经暮色去下界）
    ["twilightforest:lich", [bossType2, 1]],
    // 段 9、10：积雪森林、冰川、极光宫殿，暮色里 1.3 的上沿（EX2）
    ["twilightforest:yeti", [typeAEX2, 0]],
    ["twilightforest:winter_wolf", [typeB, 1.2]],
    ["twilightforest:alpha_yeti", [bossType1, 1.1]],
    ["twilightforest:snow_guardian", [typeAEX2, 0]],
    ["twilightforest:stable_ice_core", [typeAEX2, 0]],
    ["twilightforest:unstable_ice_core", [typeB, 1.2]],
    ["twilightforest:ice_crystal", [typeB, 1.2]],
    ["twilightforest:snow_queen", [bossType2, 1.2]]
]);

/**
 * 黑名单
 */
let entityBlackList = new Set([
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
    let addBoss = (type, e) => {
        if (type.isBoss) {
            event.add("sdbf:bosses", e);
            event.add("enderio:soul_vial_blacklist", e);
        }
    };
    mobTypes.forEach((type, e) => addBoss(type, e));
    twilightRegionTypes.forEach((entry, e) => addBoss(entry[0], e));
});
