# SDBF 2026-11-08 更新包：服务端手动安装清单

对应 `SDBF-Update-2026-11-08.zip`（659 个文件，服务端需要其中 651 个）。下文路径都相对于**服务端根目录**（含 `mods`、`config`、`kubejs`、`server.properties` 的文件夹）；包内文件在压缩包的 `SDBF-Update-2026-11-08/files/` 下，目录结构与服务端根目录相同。

前提：服务端已装 2026-11-05 更新包。按顺序操作，全部完成后再开服。

## 第 1 步：完全停止服务端

## 第 2 步：删除 `mods/` 里的旧版本模组

下表每一行：`mods/` 里文件名符合"旧版本"规则、且**不等于**新文件名的 jar 全部删除（文件名等于新文件名的不用删，第 4 步会覆盖）。

| 新文件名（第 4 步上传） | 删除的旧版本（`*` 代表任意版本号） |
| --- | --- |
| `ultraterraforged-1.0.3+1.20.1-forge.jar` | `ultraterraforged-*.jar` |
| `c2meforge-0.2.0-forge.9.9.6-all.jar` | `c2meforge-*.jar` |
| `slashblade_sendims-1.1.1.jar` | `slashblade_sendims-*.jar` |
| `elder_bosses-forge-0.1.4+1.20.1.jar` | `elder_bosses-forge-*.jar` |
| `deeprealm_4th-forge-0.1.9+1.20.1.jar` | `deeprealm_4th-forge-*.jar` |
| `noisiumed-forge-3.0.6+mc1.20-1.20.1.jar` | `noisiumed-forge-*.jar` |
| `structure_layout_optimizer-forge-1.0.11.jar` | `structure_layout_optimizer-forge-*.jar` |
| `alltheleaks-1.1.5-1.20.1-forge.jar` | `alltheleaks-*.jar` |
| `damagestats-1.2.0-1.20.1.jar` | `damagestats-*.jar` |
| `NuclearCraft-1.20.1-1.2.37.jar` | `NuclearCraft-1.20.1-*.jar` |

另外删除这几个（存在才删）：

- `mods/auratip-forge-1.20.1-1.1.1-beta.jar`
- `mods/tectonic-3.0.17-forge-1.20.1.jar`
- `mods/damagestats-1.2.0-1.20.1.jar.disabled`

## 第 3 步：检查 HotAI 冲突补丁

同一个类在 `hotai/` 里只能有一个补丁。对下面每一行：如果服务端存在左边的 `.class`，把它移到 `hotai_backup/` 下的相同相对位置（例如 `hotai/net/minecraft/x/Y.class` → `hotai_backup/net/minecraft/x/Y.class`）；不存在就跳过。

| 服务端若存在则移走 | 第 4 步上传的补丁 |
| --- | --- |
| `hotai/com/dinzeer/slashblade_useful_addon/events/WitherEdgeRiseUp.class` | `hotai/com/dinzeer/slashblade_useful_addon/events/WitherEdgeRiseUp.badiff` |
| `hotai/com/ishland/c2me/base/common/AdaptiveWorldGenController.class` | `hotai/com/ishland/c2me/base/common/AdaptiveWorldGenController.badiff` |
| `hotai/com/ishland/c2me/opts/scheduling/mixin/idle_tasks/autosave/enhanced_autosave/MixinThreadedAnvilChunkStorage.class` | `hotai/com/ishland/c2me/opts/scheduling/mixin/idle_tasks/autosave/enhanced_autosave/MixinThreadedAnvilChunkStorage.badiff` |
| `hotai/com/pandaismyname1/ultraterraforged/world/worldgen/cave/LayerCaves.class` | `hotai/com/pandaismyname1/ultraterraforged/world/worldgen/cave/LayerCaves.badiff` |
| `hotai/com/pandaismyname1/ultraterraforged/world/worldgen/landform/Skerries.class` | `hotai/com/pandaismyname1/ultraterraforged/world/worldgen/landform/Skerries.badiff` |
| `hotai/net/minecraft/util/profiling/ActiveProfiler.class` | `hotai/net/minecraft/util/profiling/ActiveProfiler.badiff` |
| `hotai/se/mickelus/tetra/items/modular/impl/shield/ModularShieldItem$1.class` | `hotai/se/mickelus/tetra/items/modular/impl/shield/ModularShieldItem$1.badiff` |

## 第 4 步：上传 651 个文件（覆盖同名文件）

最简单的做法：把包内 `files/` 下的 `config`、`hotai`、`kubejs`、`mods` 四个文件夹整体上传到服务端根目录，与原有文件夹**合并并覆盖同名文件**（不要先删除服务端原来的文件夹）。然后执行第 5 步。

需要逐个核对时，完整列表如下（按文件夹分组）：

**`config/`**（5）

- `alltheleaks.json`
- `c2me.toml`
- `dog-common.toml`
- `elder_bosses-common.toml`
- `structure_layout_optimizer.jsonc`

**`config/ftbquests/quests/`**（1）

- `chapter_groups.snbt`

**`config/ftbquests/quests/chapters/`**（25）

- `aether.snbt`
- `asteroid_belt.snbt`
- `bee.snbt`
- `begin.snbt`
- `deep_1.snbt`
- `deep_2.snbt`
- `deep_3.snbt`
- `deep_4.snbt`
- `end_1.snbt`
- `end_2.snbt`
- `glacio.snbt`
- `mars.snbt`
- `moon.snbt`
- `nether.snbt`
- `overworld.snbt`
- `saturn_ring.snbt`
- `slashblade.snbt`
- `storage.snbt`
- `tech_1.snbt`
- `the_bumblezone.snbt`
- `titan.snbt`
- `tofu.snbt`
- `twilightforest.snbt`
- `undergarden.snbt`
- `venus.snbt`

**`config/serverconfigs/`**（1）

- `deeprealm_4th-server.toml`

**`config/skyblockbuilder/`**（1）

- `templates.json5`

**`config/skyblockbuilder/templates/`**（3）

- `classic_moss.nbt`
- `otto.nbt`
- `small_flat.nbt`

**`config/ultraterraforged/modpack-presets/`**（1）

- `SDBF_Continental.json`

**`config/ultraterraforged/`**（2）

- `modpack.json`
- `server-preset.json`

**`hotai/com/dinzeer/slashblade_useful_addon/events/`**（1）

- `WitherEdgeRiseUp.badiff`

**`hotai/com/ishland/c2me/base/common/`**（1）

- `AdaptiveWorldGenController.badiff`

**`hotai/com/ishland/c2me/opts/scheduling/mixin/idle_tasks/autosave/enhanced_autosave/`**（1）

- `MixinThreadedAnvilChunkStorage.badiff`

**`hotai/com/pandaismyname1/ultraterraforged/world/worldgen/cave/`**（1）

- `LayerCaves.badiff`

**`hotai/com/pandaismyname1/ultraterraforged/world/worldgen/landform/`**（1）

- `Skerries.badiff`

**`hotai/net/minecraft/util/profiling/`**（1）

- `ActiveProfiler.badiff`

**`hotai/se/mickelus/tetra/items/modular/impl/shield/`**（1）

- `ModularShieldItem$1.badiff`

**`kubejs/assets/kubejs/lang/`**（2）

- `en_us.json`
- `zh_cn.json`

**`kubejs/assets/kubejs/textures/item/`**（1）

- `map_teleport_powder.png`

**`kubejs/assets/nuclearcraft/lang/`**（1）

- `zh_cn.json`

**`kubejs/assets/sdbf_astral/lang/`**（1）

- `zh_cn.json`

**`kubejs/assets/sjap_adder/lang/`**（1）

- `zh_cn.json`

**`kubejs/assets/slashblade_sendims/lang/`**（2）

- `en_us.json`
- `zh_cn.json`

**`kubejs/assets/tetra/models/item/`**（3）

- `modular_shield.json`
- `modular_shield_blocking.json`
- `modular_shield_throwing.json`

**`kubejs/assets/tetra/textures/item/`**（1）

- `modular_shield_flat.png`

**`kubejs/assets/xaerominimap/lang/`**（2）

- `en_us.json`
- `zh_cn.json`

**`kubejs/assets/xaeroworldmap/lang/`**（2）

- `en_us.json`
- `zh_cn.json`

**`kubejs/assets/yungscavebiomes/lang/`**（2）

- `en_us.json`
- `zh_cn.json`

**`kubejs/client_scripts/`**（2）

- `astral_gem_tooltips.js`
- `map_teleport_powder.js`

**`kubejs/data/ae2/worldgen/structure_set/`**（1）

- `meteorite.json`

**`kubejs/data/cataclysm/tags/worldgen/biome/has_structure/`**（1）

- `ancient_factory_biomes.json`

**`kubejs/data/cataclysm/worldgen/structure/`**（1）

- `ancient_factory.json`

**`kubejs/data/cavernous/worldgen/biome/`**（8）

- `crystal_caves.json`
- `desert_caves.json`
- `icy_caves.json`
- `marble_caves.json`
- `marshy_caves.json`
- `painted_caves.json`
- `tropical_caves.json`
- `volcanic_caves.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/desert/`**（1）

- `ground_patch.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/desert/painted/`**（1）

- `petrified_log.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/ice/icy/`**（2）

- `ice_pillar_hang.json`
- `mammoth.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/lush/honey/`**（1）

- `beehive.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/lush/marshy/`**（4）

- `flower_patch.json`
- `grass_patch.json`
- `ground_patch.json`
- `pools.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/lush/marshy/roots/`**（7）

- `init.json`
- `step1.json`
- `step2.json`
- `step3.json`
- `step4.json`
- `step5.json`
- `step6.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/lush/tropical/`**（6）

- `bamboo_patch.json`
- `coarse_dirt_patch.json`
- `ground_patch.json`
- `mud_pool.json`
- `red_tree.json`
- `tree.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/lush/tropical/vine/`**（4）

- `e.json`
- `n.json`
- `s.json`
- `w.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/stone/crystal/`**（7）

- `amethyst_ceiling.json`
- `amethyst_east.json`
- `amethyst_ground.json`
- `amethyst_north.json`
- `amethyst_south.json`
- `amethyst_west.json`
- `budding_ore.json`

**`kubejs/data/cavernous/worldgen/placed_feature/biomes/thermal/volcanic/`**（1）

- `basalt_patch.json`

**`kubejs/data/cavernous/worldgen/placed_feature/generic/`**（4）

- `big_geode.json`
- `gem_tree.json`
- `leviathan.json`
- `silverfish_nest.json`

**`kubejs/data/cavernous/worldgen/structure/`**（7）

- `dungeon.json`
- `husk_spawner.json`
- `lush_village.json`
- `overgrown_temple.json`
- `sandstone_temple.json`
- `stone_village.json`
- `thermal_plant.json`

**`kubejs/data/darkerdepths/worldgen/biome/`**（2）

- `glowshroom_forest.json`
- `sandy_catacombs.json`

**`kubejs/data/darkerdepths/worldgen/placed_feature/`**（1）

- `sand.json`

**`kubejs/data/dungeons_arise/worldgen/structure/`**（1）

- `plague_asylum.json`

**`kubejs/data/gearsaw_palace/loot_tables/chests/`**（3）

- `aurora_banner.json`
- `aurora_farm.json`
- `aurora_swamp.json`

**`kubejs/data/gearsaw_palace/structures/`**（39）

- `blue_bridge_1.nbt`
- `blue_bridge_2.nbt`
- `blue_bridge_3.nbt`
- `blue_bridge_4.nbt`
- `blue_bridge_5.nbt`
- `blue_bridge_6.nbt`
- `blue_side_1.nbt`
- `blue_side_2.nbt`
- `blue_side_3.nbt`
- `blue_side_4.nbt`
- `blue_tower_1.nbt`
- `blue_tower_2.nbt`
- `blue_tower_3.nbt`
- `boss_1.nbt`
- `boss_2.nbt`
- `boss_3.nbt`
- `entrance_1.nbt`
- `entrance_2.nbt`
- `entrance_connector_1.nbt`
- `entrance_connector_2.nbt`
- `entrance_connector_3.nbt`
- `pink_bridge_1.nbt`
- `pink_bridge_2.nbt`
- `pink_bridge_3.nbt`
- `pink_bridge_4.nbt`
- `pink_bridge_5.nbt`
- `pink_bridge_6.nbt`
- `pink_tower_1.nbt`
- `pink_tower_2.nbt`
- `yellow_bridge_1.nbt`
- `yellow_bridge_2.nbt`
- `yellow_bridge_3.nbt`
- `yellow_bridge_4.nbt`
- `yellow_bridge_5.nbt`
- `yellow_bridge_6.nbt`
- `yellow_tower_1.nbt`
- `yellow_tower_2.nbt`
- `yellow_tower_3.nbt`
- `yellow_tower_4.nbt`

**`kubejs/data/gearsaw_palace/structures/mobs/`**（8）

- `deer.nbt`
- `minotaur.nbt`
- `snow_guardian.nbt`
- `snow_guardian_supreme.nbt`
- `stable_ice_core.nbt`
- `unstable_ice_core.nbt`
- `winter_wolf.nbt`
- `yeti.nbt`

**`kubejs/data/gearsaw_palace/worldgen/processor_list/`**（2）

- `compat.json`
- `compat_and_ice.json`

**`kubejs/data/gearsaw_palace/worldgen/structure/`**（1）

- `aurora_palace.json`

**`kubejs/data/gearsaw_palace/worldgen/template_pool/`**（11）

- `blue_bridge.json`
- `blue_side.json`
- `blue_tower.json`
- `boss.json`
- `entrance.json`
- `entrance_connector.json`
- `mobs.json`
- `pink_bridge.json`
- `pink_tower.json`
- `yellow_bridge.json`
- `yellow_tower.json`

**`kubejs/data/last_smith/slashblade/named_blades/`**（5）

- `amagumo_kaze.json`
- `amagumo_kumo.json`
- `amagumo_munin.json`
- `roukanken_nether.json`
- `uma_tachyon.json`

**`kubejs/data/minecraft/dimension_type/`**（1）

- `overworld.json`

**`kubejs/data/minecraft/tags/blocks/`**（1）

- `overworld_carver_replaceables.json`

**`kubejs/data/minecraft/tags/worldgen/biome/`**（1）

- `all.json`

**`kubejs/data/minecraft/worldgen/biome/`**（2）

- `deep_dark.json`
- `lush_caves.json`

**`kubejs/data/minecraft/worldgen/configured_feature/`**（17）

- `acacia.json`
- `birch.json`
- `birch_bees_005.json`
- `dark_oak.json`
- `disk_clay.json`
- `disk_gravel.json`
- `disk_sand.json`
- `fancy_oak.json`
- `fancy_oak_bees_005.json`
- `jungle_tree_no_vine.json`
- `mega_jungle_tree.json`
- `mega_pine.json`
- `mega_spruce.json`
- `oak.json`
- `oak_bees_005.json`
- `pine.json`
- `spruce.json`

**`kubejs/data/minecraft/worldgen/noise_settings/`**（1）

- `overworld.json`

**`kubejs/data/regions_unexplored/worldgen/biome/`**（2）

- `ancient_delta.json`
- `bioshroom_caves.json`

**`kubejs/data/regions_unexplored/worldgen/placed_feature/`**（5）

- `bladed_grass.json`
- `corpse_flower.json`
- `dropleaf.json`
- `duskmelon.json`
- `dusktrap.json`

**`kubejs/data/sdbf/dimension/`**（1）

- `deep_realm_level_1.json`

**`kubejs/data/sdbf/forge/biome_modifier/`**（11）

- `deep_realm_1_campsite.json`
- `deep_realm_1_monster_box.json`
- `ore_add_coal.json`
- `ore_add_copper.json`
- `ore_add_diamond.json`
- `ore_add_emerald.json`
- `ore_add_gold.json`
- `ore_add_iron.json`
- `ore_add_lapis.json`
- `ore_add_redstone.json`
- `utf_remove_rocky_mountains_forced_snow.json`

**`kubejs/data/sdbf/loot_tables/deep_realm_1/structures/`**（5）

- `amethyst_geode.json`
- `deep_dark_temple.json`
- `dinosaur.json`
- `knuckle_trap.json`
- `sulfide_huts.json`

**`kubejs/data/sdbf/structures/deep_realm_1/`**（6）

- `amethyst_altar.nbt`
- `amethyst_geode.nbt`
- `deep_dark_temple.nbt`
- `dinosaur.nbt`
- `knuckle_trap.nbt`
- `sulfide_huts.nbt`

**`kubejs/data/sdbf/tags/blocks/deep_realm_1/`**（4）

- `all_but_base.json`
- `all_but_lava.json`
- `all_but_unbreakable.json`
- `pillar_go_through.json`

**`kubejs/data/sdbf/tags/worldgen/biome/`**（1）

- `in_deep_realm_1.json`

**`kubejs/data/sdbf/tags/worldgen/biome/productivebees/`**（3）

- `eligible.json`
- `mountain_or_hill.json`
- `snowy.json`

**`kubejs/data/sdbf/worldgen/biome/deep_realm_1/`**（5）

- `amethyst_caves.json`
- `deep_dark.json`
- `deeprock_caverns.json`
- `molten_caves.json`
- `sulfide_caves.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/amethyst_caves/`**（4）

- `calcite_rim.json`
- `hanging_crystals.json`
- `patch_ceiling.json`
- `patch_floor.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/ancient_delta/`**（3）

- `delta.json`
- `patch_floor.json`
- `vegetation.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/deep_dark/`**（1）

- `patch_floor.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/deeprock_caverns/`**（3）

- `cobwebs.json`
- `patch_ceiling.json`
- `patch_floor.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/`**（2）

- `depths.json`
- `monster_box.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/generic/`**（7）

- `big_pillar.json`
- `ceiling.json`
- `delta.json`
- `pile.json`
- `pillar.json`
- `rock.json`
- `small_pillar.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/generic/ores/`**（5）

- `copper.json`
- `diamond.json`
- `emerald.json`
- `iron.json`
- `redstone.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/molten_caves/`**（3）

- `delta.json`
- `patch_ceiling.json`
- `patch_floor.json`

**`kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/sulfide_caves/`**（8）

- `bush.json`
- `delta.json`
- `patch_ceiling.json`
- `patch_ceiling2.json`
- `patch_floor.json`
- `replace.json`
- `tree.json`
- `vegetation.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/amethyst_caves/`**（5）

- `calcite_rim.json`
- `hanging_crystals.json`
- `patch_ceiling.json`
- `patch_floor.json`
- `patches.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/ancient_delta/`**（8）

- `delta.json`
- `patch_floor.json`
- `ru_bladed_grass.json`
- `ru_corpse_flower.json`
- `ru_dropleaf.json`
- `ru_duskmelon.json`
- `ru_dusktrap.json`
- `vegetation.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/`**（10）

- `campsite.json`
- `depths_111.json`
- `depths_127.json`
- `depths_15.json`
- `depths_31.json`
- `depths_47.json`
- `depths_63.json`
- `depths_79.json`
- `depths_95.json`
- `monster_box.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/deep_dark/`**（1）

- `patch_floor.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/deeprock_caverns/`**（7）

- `cobwebs.json`
- `patch_ceiling.json`
- `patch_floor.json`
- `patches.json`
- `patches_2.json`
- `patches_3.json`
- `pillar.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/generic/`**（7）

- `big_pillar.json`
- `ceiling.json`
- `delta.json`
- `pile.json`
- `pillar.json`
- `rock.json`
- `small_pillar.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/generic/ores/`**（5）

- `copper.json`
- `diamond.json`
- `emerald.json`
- `iron.json`
- `redstone.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/molten_caves/`**（5）

- `basalt_pillar.json`
- `delta.json`
- `patch_ceiling.json`
- `patch_floor.json`
- `patches_2.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/sulfide_caves/`**（10）

- `bush.json`
- `delta.json`
- `patch_ceiling.json`
- `patch_ceiling2.json`
- `patch_floor.json`
- `patches.json`
- `patches_2.json`
- `replace.json`
- `tree.json`
- `vegetation.json`

**`kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/upper/`**（3）

- `amethyst_geode.json`
- `glow_lichen.json`
- `lost_caves_cactus_patch.json`

**`kubejs/data/sdbf/worldgen/processor_list/deep_realm_1/`**（4）

- `amethyst_altar.json`
- `dinosaur.json`
- `knuckle_trap.json`
- `sulfide_huts.json`

**`kubejs/data/sdbf/worldgen/structure/`**（3）

- `ae_lab.json`
- `apron_1.json`
- `broken_wither.json`

**`kubejs/data/sdbf/worldgen/structure/deep_realm_1/`**（6）

- `amethyst_altar.json`
- `amethyst_geode.json`
- `deep_dark_temple.json`
- `dinosaur.json`
- `knuckle_trap.json`
- `sulfide_huts.json`

**`kubejs/data/sdbf/worldgen/structure_set/deep_realm_1/`**（6）

- `amethyst_altar.json`
- `amethyst_geode.json`
- `deep_dark_temple.json`
- `dinosaur.json`
- `knuckle_trap.json`
- `sulfide_huts.json`

**`kubejs/data/sdbf/worldgen/template_pool/`**（1）

- `apron_1.json`

**`kubejs/data/sdbf/worldgen/template_pool/deep_realm_1/`**（6）

- `amethyst_altar.json`
- `amethyst_geode.json`
- `deep_dark_temple.json`
- `dinosaur.json`
- `knuckle_trap.json`
- `sulfide_huts.json`

**`kubejs/data/sjap_adder/slashblade/named_blades/`**（1）

- `nihilulex.json`

**`kubejs/data/slashblade_addon/slashblade/named_blades/`**（2）

- `nihilbx.json`
- `nihilul.json`

**`kubejs/data/slashblade_sendims/slashblade/named_blades/`**（2）

- `caliburn.json`
- `excalibur.json`

**`kubejs/data/terrablender/worldgen/density_function/`**（1）

- `uniqueness.json`

**`kubejs/data/twilightforest/worldgen/structure_set/`**（1）

- `aurora_palace.json`

**`kubejs/data/ultraterraforged/tags/blocks/`**（8）

- `clay.json`
- `deep_rock.json`
- `erodible.json`
- `ore_compatible_rock.json`
- `rock.json`
- `sediment.json`
- `soil.json`
- `strata_excluded.json`

**`kubejs/data/ultraterraforged/tags/worldgen/biome/features/`**（29）

- `has_badlands_trees.json`
- `has_birch_forest_trees.json`
- `has_birch_grass.json`
- `has_cold_steppe_bushes.json`
- `has_cold_taiga_scrub_bushes.json`
- `has_dark_forest_trees.json`
- `has_fern_grass.json`
- `has_fir_forest_trees.json`
- `has_flower_forest_trees.json`
- `has_forest_grass.json`
- `has_forest_trees.json`
- `has_grove_trees.json`
- `has_jungle_edge_trees.json`
- `has_jungle_trees.json`
- `has_marsh_bushes.json`
- `has_meadow_grass.json`
- `has_meadow_trees.json`
- `has_pine_forest_trees.json`
- `has_plains_bushes.json`
- `has_plains_trees.json`
- `has_redwood_forest_trees.json`
- `has_savanna_trees.json`
- `has_spruce_forest_trees.json`
- `has_spruce_tundra_trees.json`
- `has_steppe_bushes.json`
- `has_swamp_surface.json`
- `has_swamp_trees.json`
- `has_windswept_hills_trees.json`
- `has_wooded_badlands_trees.json`

**`kubejs/data/ultraterraforged/tags/worldgen/biome/surface/`**（1）

- `erosion_blacklist.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/biome_modifier/modification/`**（1）

- `erode_snow.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/biome_modifier/vegetation/bushes/`**（5）

- `cold_steppe.json`
- `marsh.json`
- `plains.json`
- `steppe.json`
- `taiga_scrub.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/biome_modifier/vegetation/grass/`**（4）

- `birch.json`
- `fern.json`
- `forest.json`
- `meadow.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/biome_modifier/vegetation/trees/`**（19）

- `badlands.json`
- `birch.json`
- `dark_forest.json`
- `fir.json`
- `fir_windswept_hills.json`
- `flower_forest.json`
- `forest.json`
- `grove.json`
- `jungle.json`
- `jungle_edge.json`
- `meadow.json`
- `pine.json`
- `plains.json`
- `redwood.json`
- `savanna.json`
- `spruce.json`
- `spruce_tundra.json`
- `swamp.json`
- `wooded_badlands.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/noise/climate/`**（1）

- `biome_edge_shape.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/noise/features/`**（1）

- `meadow_trees.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/noise/strata/`**（3）

- `offset.json`
- `selector.json`
- `thickness.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/noise/surface/`**（15）

- `coral.json`
- `desert.json`
- `eroded_dirt.json`
- `eroded_rock.json`
- `forest.json`
- `glacial_debris.json`
- `height_variance.json`
- `lava_fields.json`
- `random.json`
- `river_bank.json`
- `river_bed.json`
- `salt_flat.json`
- `steepness_variance.json`
- `swamp.json`
- `volcanic_rock.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/noise/surface/iceberg/deep/`**（7）

- `down.json`
- `fade_down.json`
- `fade_up.json`
- `mask.json`
- `shape.json`
- `top.json`
- `up.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/noise/surface/iceberg/shallow/`**（7）

- `down.json`
- `fade_down.json`
- `fade_up.json`
- `mask.json`
- `shape.json`
- `top.json`
- `up.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/preset/`**（1）

- `preset.json`

**`kubejs/data/ultraterraforged/ultraterraforged/worldgen/structure_rule/`**（1）

- `cell_test.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/acacia/`**（3）

- `bush.json`
- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/`**（21）

- `badlands_trees.json`
- `birch_grass.json`
- `birch_trees.json`
- `dark_forest_trees.json`
- `erode_snow.json`
- `fern_grass.json`
- `fir_trees.json`
- `flower_forest_trees.json`
- `forest_grass.json`
- `forest_trees.json`
- `grove_trees.json`
- `jungle_edge_trees.json`
- `jungle_trees.json`
- `meadow_grass.json`
- `meadow_trees.json`
- `plains_trees.json`
- `redwood_trees.json`
- `savanna_trees.json`
- `swamp_surface.json`
- `swamp_trees.json`
- `wooded_badlands_trees.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/birch/`**（3）

- `forest.json`
- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/dark_oak/`**（2）

- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/jungle/`**（3）

- `huge.json`
- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/meadow/`**（2）

- `normal.json`
- `variant.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/mushrooms/`**（2）

- `huge_brown_mushroom.json`
- `huge_red_mushroom.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/oak/`**（3）

- `forest.json`
- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/pine/`**（1）

- `pine.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/redwood/`**（2）

- `huge.json`
- `large.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/shrubs/`**（5）

- `cold_steppe_bush.json`
- `marsh_bush.json`
- `plains_bush.json`
- `steppe_bush.json`
- `taiga_scrub_bush.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/spruce/`**（4）

- `large.json`
- `large_on_snow.json`
- `small.json`
- `small_on_snow.json`

**`kubejs/data/ultraterraforged/worldgen/configured_feature/willow/`**（2）

- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/density_function/overworld/`**（10）

- `base_3d_noise.json`
- `continents.json`
- `depth.json`
- `erosion.json`
- `factor.json`
- `jaggedness.json`
- `offset.json`
- `ridges.json`
- `ridges_folded.json`
- `sloped_cheese.json`

**`kubejs/data/ultraterraforged/worldgen/density_function/overworld/caves/`**（3）

- `entrances.json`
- `noodle.json`
- `spaghetti_2d.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/acacia/`**（3）

- `bush.json`
- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/`**（25）

- `badlands_trees.json`
- `birch_grass.json`
- `birch_trees.json`
- `dark_forest_trees.json`
- `erode_snow.json`
- `fern_grass.json`
- `fir_trees.json`
- `flower_forest_trees.json`
- `forest_grass.json`
- `forest_trees.json`
- `grove_trees.json`
- `jungle_edge_trees.json`
- `jungle_trees.json`
- `meadow_grass.json`
- `meadow_trees.json`
- `pine_trees.json`
- `plains_trees.json`
- `redwood_trees.json`
- `savanna_trees.json`
- `spruce_trees.json`
- `spruce_tundra_trees.json`
- `swamp_surface.json`
- `swamp_trees.json`
- `windswept_hills_fir_trees.json`
- `wooded_badlands_trees.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/birch/`**（3）

- `forest.json`
- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/dark_oak/`**（2）

- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/jungle/`**（3）

- `huge.json`
- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/meadow/`**（2）

- `normal.json`
- `variant.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/mushrooms/`**（2）

- `huge_brown_mushroom.json`
- `huge_red_mushroom.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/oak/`**（3）

- `forest.json`
- `large.json`
- `small.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/pine/`**（1）

- `pine.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/redwood/`**（2）

- `huge.json`
- `large.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/shrubs/`**（5）

- `cold_steppe_bush.json`
- `marsh_bush.json`
- `plains_bush.json`
- `steppe_bush.json`
- `taiga_scrub_bush.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/spruce/`**（4）

- `large.json`
- `large_on_snow.json`
- `small.json`
- `small_on_snow.json`

**`kubejs/data/ultraterraforged/worldgen/placed_feature/willow/`**（2）

- `large.json`
- `small.json`

**`kubejs/data/yungscavebiomes/worldgen/biome/`**（2）

- `frosted_caves.json`
- `lost_caves.json`

**`kubejs/server_scripts/custom_spawn/`**（3）

- `map_teleport_ritual.js`
- `ritual_fx.js`
- `spawn_struct_base.js`

**`kubejs/server_scripts/enemy/`**（2）

- `deep_realm_carried_materials.js`
- `enemy_attributes_patterns.js`

**`kubejs/server_scripts/enemy/gateways/`**（2）

- `limit_gateway_dimension.js`
- `s4_inside_the_end_gw.js`

**`kubejs/server_scripts/miscs/`**（4）

- `artifacts_gamerules.js`
- `deep_realm_campsite_loot.js`
- `sa_ap_cost.js`
- `special_loots.js`

**`kubejs/server_scripts/recipes/`**（4）

- `general.js`
- `mahjong.js`
- `s4_inside_the_end.js`
- `zenith.js`

**`kubejs/server_scripts/recipes/tech/`**（2）

- `ender_io.js`
- `nc.js`

**`kubejs/server_scripts/tetra/`**（2）

- `s2_tetras.js`
- `s3_tetras.js`

**`kubejs/startup_scripts/astral_gems/`**（1）

- `20_bridge.js`

**`kubejs/startup_scripts/`**（2）

- `reg.js`
- `ritual_triggers.js`

**`mods/`**（10）

- `NuclearCraft-1.20.1-1.2.37.jar`
- `alltheleaks-1.1.5-1.20.1-forge.jar`
- `c2meforge-0.2.0-forge.9.9.6-all.jar`
- `damagestats-1.2.0-1.20.1.jar`
- `deeprealm_4th-forge-0.1.9+1.20.1.jar`
- `elder_bosses-forge-0.1.4+1.20.1.jar`
- `noisiumed-forge-3.0.6+mc1.20-1.20.1.jar`
- `slashblade_sendims-1.1.1.jar`
- `structure_layout_optimizer-forge-1.0.11.jar`
- `ultraterraforged-1.0.3+1.20.1-forge.jar`

## 第 5 步：客户端专用文件不要放到服务端

下面 8 个文件只给客户端用。上传时跳过；如果第 4 步整体上传了文件夹，就把它们从服务端删掉（尤其是 Carbon，放在服务端可能无法启动）：

- `mods/carbon-1.20.1.9-A.jar`
- `config/carbon-client.toml`
- `mods/xaerominimap-forge-1.20.1-26.6.0.jar`
- `mods/xaeroworldmap-forge-1.20.1-1.47.0.jar`
- `mods/XaeroPlus-2.37.2+forge-1.20.1-WM1.47.0-MM26.6.0.jar`
- `mods/XaeroZoomout-Forge-1.20-1.1.0.jar`
- `mods/ftbxaerocompat-forge-1.4.0-1.20.1.jar`
- `config/sidebar_buttons.json`

## 第 6 步：删除旧文件和文件夹

存在才删，不存在跳过。

文件夹（连同里面全部内容）：

- `kubejs/data/infinity_cave/`

文件：

- `config/tectonic.json`
- `config/ftbquests/quests/chapters/pluto.snbt`
- `kubejs/data/slashblade/slashblade/entity_drop/sabigatana.json`
- `kubejs/assets/ftbquests/textures/gui/alert.png`
- `kubejs/assets/ftbquests/textures/gui/alert.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/arrow_collapsed.png`
- `kubejs/assets/ftbquests/textures/gui/arrow_collapsed.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/arrow_expanded.png`
- `kubejs/assets/ftbquests/textures/gui/arrow_expanded.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/arrow_left.png`
- `kubejs/assets/ftbquests/textures/gui/arrow_left.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/arrow_right.png`
- `kubejs/assets/ftbquests/textures/gui/arrow_right.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/burger.png`
- `kubejs/assets/ftbquests/textures/gui/burger.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/chest.png`
- `kubejs/assets/ftbquests/textures/gui/close.png`
- `kubejs/assets/ftbquests/textures/gui/close.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/collect_rewards.png`
- `kubejs/assets/ftbquests/textures/gui/collect_rewards.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/dependency.png`
- `kubejs/assets/ftbquests/textures/gui/dependency.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/editor.png`
- `kubejs/assets/ftbquests/textures/gui/editor.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/emergency_items.png`
- `kubejs/assets/ftbquests/textures/gui/emergency_items.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/guide.png`
- `kubejs/assets/ftbquests/textures/gui/guide.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/hidden.png`
- `kubejs/assets/ftbquests/textures/gui/hidden.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/info.png`
- `kubejs/assets/ftbquests/textures/gui/info.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/link.png`
- `kubejs/assets/ftbquests/textures/gui/link.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/pagebreak.png`
- `kubejs/assets/ftbquests/textures/gui/pin.png`
- `kubejs/assets/ftbquests/textures/gui/pin.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/quest_locked.png`
- `kubejs/assets/ftbquests/textures/gui/save.png`
- `kubejs/assets/ftbquests/textures/gui/save.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/search.png`
- `kubejs/assets/ftbquests/textures/gui/search.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/settings.png`
- `kubejs/assets/ftbquests/textures/gui/settings.png.mcmeta`
- `kubejs/assets/ftbquests/textures/gui/shop.png`
- `kubejs/assets/ftbquests/textures/gui/shop.png.mcmeta`
- `kubejs/client_scripts/zenith_scrolls.js`
- `kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/generic/replace.json`
- `kubejs/data/sdbf/worldgen/placed_feature/deep_realm_1/deeprock_caverns/replace.json`
- `kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/generic/replace.json`
- `kubejs/data/sdbf/worldgen/configured_feature/deep_realm_1/deeprock_caverns/replace.json`

## 第 7 步：启动服务端

- 必须完整重启（不能用 `/reload`）。启动后查看 `logs/latest.log` 有无报错。
- 客户端也需要安装同一个更新包，两端模组一致才能进服。
