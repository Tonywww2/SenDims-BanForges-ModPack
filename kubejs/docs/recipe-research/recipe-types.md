# 整合包配方类型清单

扫描 354 个根目录模组 JAR 及其中声明的 170 个 JarJar 依赖档案，结合原生及内置数据包、KubeJS 配方引用和 ProbeJS 注册快照，收集 **427 个去重标识**。其中 360 个属于已安装命名空间候选，66 个只对应未安装兼容命名空间，1 个因当前模块配置单列。嵌入依赖仍受加载器版本选择影响；其中 Thermal Core 提供造石机的原生配方。

JSON 中的 `type` 是 RecipeSerializer 标识；RecipeType 是运行时分组。两者不能互换。原版短名已规范为 `minecraft:`，因此不会重复统计 `smelting` 与 `minecraft:smelting`。

ProbeJS 快照时间为本地文件记录的 2026-10-04T16:29:54.685995，包含 163 个规范化 RecipeType、314 个规范化 RecipeSerializer。当前 JAR 和脚本补充快照之后安装的模组。快照不等于本次实时注册表；候选配方还会受到条件加载、内置包启用状态与 KubeJS 删除影响。

当前 `apotheosis.cfg` 关闭 Village Module；制箭加工不应成为必经步骤。Create、Mekanism、匠魂等未安装模组虽在其他模组兼容 JSON 中出现，已单列。

机器能耗、冷却液、弹药和世界生成等数据虽有 type，也未必是可投料得到材料的工艺。无 JSON serializer 的真实操作还包括 Tetra 工作台、原版酿造、铁砧、砂轮、刀胚淬火、照片打印叠放和 PCB 曝光蚀刻；是否采用见下表，已取消的工艺保留为模组清单记录。JEI 分类类名也已保存在原始清单，分类存在不代表拥有可自定义结果的配方接口。

## 已安装命名空间

### ad_astra

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `ad_astra:alloying` | 已按要求取消 | 快照 Serializer；快照 RecipeType；1 条源数据。原步骤 engineering_17；保留模组类型记录，不计入当前合成路线。 |
| `ad_astra:compressing` | 已按要求取消 | 快照 Serializer；快照 RecipeType；10 条源数据。原步骤 engineering_18；保留模组类型记录，不计入当前合成路线。 |
| `ad_astra:cryo_freezing` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；4 条源数据。engineering_20 |
| `ad_astra:nasa_workbench` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；7 条源数据；有 KubeJS 引用。engineering_22 |
| `ad_astra:oxygen_loading` | 已按要求取消 | 快照 Serializer；快照 RecipeType；2 条源数据。原步骤 engineering_21；保留模组类型记录，不计入当前合成路线。 |
| `ad_astra:refining` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；1 条源数据。engineering_19 |
| `ad_astra:space_station_recipe` | 单列处理 | 快照 Serializer；快照 RecipeType；6 条源数据。空间站建造与发射菜单，不是普通物品输出的材料加工配方。 |

### ad_astra_giselle_addon

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `ad_astra_giselle_addon:can_upgrading` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### ae2

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `ae2:charger` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；5 条源数据。pneumatic_11 |
| `ae2:entropy` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；10 条源数据。pneumatic_15 |
| `ae2:facade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `ae2:inscriber` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；19 条源数据；有 KubeJS 引用。pneumatic_12 |
| `ae2:matter_cannon` | 单列处理 | 快照 Serializer；快照 RecipeType；68 条源数据。弹药质量或伤害定义，不是合成机器。 |
| `ae2:transform` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；11 条源数据。pneumatic_13, pneumatic_14 |

### aether

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `aether:accessory_freezable` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；4 条源数据。aether_06 |
| `aether:ambrosium_enchanting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；17 条源数据。aether_03 |
| `aether:block_placement_ban` | 世界规则 | 快照 Serializer；快照 RecipeType；3 条源数据。禁止放置规则，无合成产物。 |
| `aether:enchanting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；29 条源数据。aether_01 |
| `aether:freezing` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；13 条源数据。aether_02 |
| `aether:icestone_freezable` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；2 条源数据。aether_05 |
| `aether:incubation` | 单列处理 | 快照 Serializer；快照 RecipeType；12 条源数据。孵化输出生物，保留为养殖支线，不伪装成材料输出。 |
| `aether:item_placement_ban` | 世界规则 | 快照 Serializer；快照 RecipeType；4 条源数据。禁止放置规则，无合成产物。 |
| `aether:placement_conversion` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；38 条源数据。aether_07 |
| `aether:repairing` | 专用合成处理器 | 快照 Serializer；132 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `aether:swet_ball_conversion` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；9 条源数据。aether_04 |
| `aether:swet_banner` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### aether_redux

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `aether_redux:infusion` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；12 条源数据。aether_08 |
| `aether_redux:spore_blighting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；17 条源数据。aether_09 |

### aether_treasure_reforging

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `aether_treasure_reforging:phoenix_armor` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### akashictome

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `akashictome:attachment` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### apotheosis

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `apotheosis:add_sockets` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `apotheosis:enchanting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；11 条源数据。mana_11 |
| `apotheosis:fletching` | 单列处理 | 快照 RecipeType；7 条源数据。当前配置关闭 Village Module，不能要求玩家使用本整合包未启用的制箭台加工。 |
| `apotheosis:keep_nbt_enchanting` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `apotheosis:potion_charm` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `apotheosis:potion_charm_enchanting` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `apotheosis:reforging` | 已按要求取消 | 快照 Serializer；快照 RecipeType；5 条源数据。原步骤 mana_13；保留模组类型记录，不计入当前合成路线。 |
| `apotheosis:salvaging` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；15 条源数据。mana_12 |
| `apotheosis:socketing` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `apotheosis:spawner_modifier` | 专用合成处理器 | 快照 Serializer；快照 RecipeType；26 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `apotheosis:unnaming` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `apotheosis:widthdrawal` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### bonsaitrees3

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `bonsaitrees3:sapling` | 设施或参数 | 快照 Serializer；快照 RecipeType；281 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `bonsaitrees3:soil` | 设施或参数 | 快照 Serializer；快照 RecipeType；74 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |

### bookshelf

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `bookshelf:shaped_durability` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `bookshelf:shapeless_durability` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### botania

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `botania:ancient_will_attach` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:armor_upgrade` | 专用合成处理器 | 快照 Serializer；4 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:black_hole_talisman_extract` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:brew` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；20 条源数据。mana_10 |
| `botania:composite_lens` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:cosmetic_attach` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:cosmetic_remove` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:elven_trade` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；15 条源数据；有 KubeJS 引用。mana_09 |
| `botania:elven_trade_lexicon` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:gog_alternation` | 专用合成处理器 | 快照 Serializer；6 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:keep_ivy` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:laputa_shard_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:lens_dye` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:mana_gun_add_clip` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:mana_gun_add_lens` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:mana_gun_remove_lens` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:mana_infusion` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；140 条源数据；有 KubeJS 引用。mana_06 |
| `botania:mana_upgrade` | 专用合成处理器 | 快照 Serializer；2 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:mana_upgrade_shapeless` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:marimorphosis` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；8 条源数据。mana_04 |
| `botania:merge_vial` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:nbt_output_wrapper` | 加载或包装 | 快照 Serializer；9 条源数据。条件加载、空配方或 NBT 包装层，不是玩家独立操作。 |
| `botania:orechid` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；16 条源数据。mana_02 |
| `botania:orechid_ignem` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；3 条源数据。mana_03 |
| `botania:petal_apothecary` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；44 条源数据；有 KubeJS 引用。mana_05 |
| `botania:phantom_ink_apply` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:pure_daisy` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；8 条源数据。mana_01 |
| `botania:runic_altar` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；17 条源数据；有 KubeJS 引用。mana_07 |
| `botania:runic_altar_head` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:spell_cloth_apply` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:split_lens` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:state_copying_pure_daisy` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:terra_pick_tipping` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:terra_plate` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；2 条源数据；有 KubeJS 引用。mana_08 |
| `botania:twig_wand` | 专用合成处理器 | 快照 Serializer；2 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `botania:water_bottle_matching_shaped` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### cataclysm

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `cataclysm:amethyst_bless` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；1 条源数据。mana_15 |
| `cataclysm:weapon_fusion` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；8 条源数据。mana_14 |

### cofh_core

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `cofh_core:crafting_securable` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `cofh_core:crafting_shaped_potion` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### computercraft

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `computercraft:clear_colour` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:colour` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:computer_upgrade` | 专用合成处理器 | 快照 Serializer；3 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:disk` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:impostor_shaped` | 专用合成处理器 | 快照 Serializer；24 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:impostor_shapeless` | 专用合成处理器 | 快照 Serializer；18 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:pocket_computer_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:printout` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:shaped` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:shapeless` | 专用合成处理器 | 快照 Serializer；2 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:turtle` | 专用合成处理器 | 快照 Serializer；2 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:turtle_overlay` | 专用合成处理器 | 快照 Serializer；4 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `computercraft:turtle_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### constructionwand

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `constructionwand:wand_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### deep_aether

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `deep_aether:combining` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；4 条源数据。aether_10 |
| `deep_aether:floaty_scarf_coloring` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `deep_aether:glowing_spores_recipe` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；4 条源数据。aether_13 |
| `deep_aether:golden_swet_ball_recipe` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；2 条源数据。aether_12 |
| `deep_aether:poison_recipe` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；9 条源数据。aether_11 |

### deeprealm_4th

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `deeprealm_4th:combination_forging` | 设计加工工艺 | 6 条源数据；有 KubeJS 引用。omni_alloy_ingot |
| `deeprealm_4th:frame_disassembly` | 单列处理 | 1 条源数据。3×3 工作台内返还投影框架及吸收材料，是纠错回收；没有净加工进度，不能作为必经增值步骤。 |
| `deeprealm_4th:projection_combining` | 设计加工工艺 | 9 条源数据；有 KubeJS 引用。omni_seed |

### draconicevolution

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `draconicevolution:fusion_crafting` | 设计加工工艺 | 42 条源数据；有 KubeJS 引用。omni_billet |

### dustandash

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `dustandash:centrifuge` | 设计加工工艺 | 快照 Serializer；25 条源数据。engineering_07 |
| `dustandash:integrate` | 设计加工工艺 | 快照 Serializer；38 条源数据。engineering_05 |
| `dustandash:ionizer` | 设计加工工艺 | 快照 Serializer；24 条源数据。engineering_08 |
| `dustandash:milling` | 设计加工工艺 | 快照 Serializer；37 条源数据。engineering_06 |

### enderio

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `enderio:alloy_smelting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；56 条源数据；有 KubeJS 引用。engineering_09 |
| `enderio:dark_steel_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `enderio:enchanting` | 已按要求取消 | 快照 Serializer；快照 RecipeType；41 条源数据。原步骤 engineering_13；保留模组类型记录，不计入当前合成路线。 |
| `enderio:fire_crafting` | 推荐原生供料 | 快照 Serializer；快照 RecipeType；1 条源数据。engineering_15 |
| `enderio:grinding_ball` | 设施或参数 | 快照 Serializer；快照 RecipeType；10 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `enderio:painting` | 已按要求取消 | 快照 Serializer；快照 RecipeType；24 条源数据。原步骤 engineering_16；保留模组类型记录，不计入当前合成路线。 |
| `enderio:sag_milling` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；65 条源数据。engineering_10 |
| `enderio:shaped_entity_storage` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `enderio:slicing` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；5 条源数据。engineering_11 |
| `enderio:soul_binding` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；11 条源数据；有 KubeJS 引用。engineering_12 |
| `enderio:tank` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；21 条源数据。engineering_14 |

### exposure

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `exposure:component_transferring` | 已按要求取消 | 1 条源数据。原步骤 precision_11；保留模组类型记录，不计入当前合成路线。 |
| `exposure:film_developing` | 设计加工工艺 | 2 条源数据。precision_08 |
| `exposure:photograph_aging` | 设计加工工艺 | 1 条源数据。precision_10 |
| `exposure:photograph_copying` | 已按要求取消 | 2 条源数据。原步骤 precision_09；保留模组类型记录，不计入当前合成路线。 |

### forge

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `forge:conditional` | 加载或包装 | 快照 Serializer；508 条源数据。条件加载、空配方或 NBT 包装层，不是玩家独立操作。 |

### framedblocks

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `framedblocks:frame` | 已按要求取消 | 快照 Serializer；快照 RecipeType；173 条源数据。原步骤 precision_18；保留模组类型记录，不计入当前合成路线。 |

### gateways

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `gateways:gate_recipe` | 单列处理 | 快照 Serializer；7 条源数据；有 KubeJS 引用。传送门道具的合成包装；波次召唤和掉落是战斗获取方式，不属于材料加工机台。 |

### integrateddynamics

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `integrateddynamics:crafting_special_energycontainer_combination` | 专用合成处理器 | 快照 Serializer；1 条源数据；有 KubeJS 引用。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `integrateddynamics:crafting_special_facade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `integrateddynamics:crafting_special_nbt_clear` | 专用合成处理器 | 快照 Serializer；5 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `integrateddynamics:crafting_special_shaped_omni_directional` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `integrateddynamics:crafting_special_shaped_omni_directional_3` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `integrateddynamics:crafting_special_shapeless_omni_directional` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `integrateddynamics:crafting_special_variable_copy` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `integrateddynamics:drying_basin` | 已按要求取消 | 快照 Serializer；快照 RecipeType；30 条源数据。原步骤 engineering_02；保留模组类型记录，不计入当前合成路线。 |
| `integrateddynamics:mechanical_drying_basin` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；32 条源数据。engineering_04 |
| `integrateddynamics:mechanical_squeezer` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；78 条源数据。engineering_03 |
| `integrateddynamics:mechanical_squeezer_facade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `integrateddynamics:squeezer` | 已按要求取消 | 快照 Serializer；快照 RecipeType；74 条源数据。原步骤 engineering_01；保留模组类型记录，不计入当前合成路线。 |
| `integrateddynamics:squeezer_facade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### kubejs

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `kubejs:shaped` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `kubejs:shapeless` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### last_smith

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `last_smith:research` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；49 条源数据。precision_04 |

### libx

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `libx:empty` | 加载或包装 | 快照 Serializer；快照 RecipeType。条件加载、空配方或 NBT 包装层，不是玩家独立操作。 |

### mcjtylib

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `mcjtylib:copy_nbt` | 加载或包装 | 快照 Serializer。条件加载、空配方或 NBT 包装层，不是玩家独立操作。 |

### midnight

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `midnight:nbt_smithing` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### minecraft

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `minecraft:blasting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；216 条源数据。thermal_04 |
| `minecraft:campfire_cooking` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；33 条源数据。thermal_06 |
| `minecraft:crafting` | 运行时类型或代码设施 | 快照 RecipeType。不能直接作为 JSON serializer；检查原生设备或归并到同一工艺。 |
| `minecraft:crafting_decorated_pot` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_shaped` | 设计加工工艺 | 快照 Serializer；6747 条源数据；有 KubeJS 引用。thermal_01 |
| `minecraft:crafting_shapeless` | 设计加工工艺 | 快照 Serializer；3212 条源数据。thermal_02 |
| `minecraft:crafting_special_armordye` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_bannerduplicate` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_bookcloning` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_firework_rocket` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_firework_star` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_firework_star_fade` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_mapcloning` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_mapextending` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_repairitem` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_shielddecoration` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_shulkerboxcoloring` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_suspiciousstew` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:crafting_special_tippedarrow` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:smelting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；629 条源数据。thermal_03 |
| `minecraft:smithing` | 运行时类型或代码设施 | 快照 RecipeType。不能直接作为 JSON serializer；检查原生设备或归并到同一工艺。 |
| `minecraft:smithing_transform` | 设计加工工艺 | 快照 Serializer；105 条源数据；有 KubeJS 引用。thermal_08 |
| `minecraft:smithing_trim` | 专用合成处理器 | 快照 Serializer；11 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `minecraft:smoking` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；46 条源数据。thermal_05 |
| `minecraft:stonecutting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；1957 条源数据；有 KubeJS 引用。thermal_07 |

### netherman

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `netherman:crimson_arrow_coating` | 专用合成处理器 | 1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### nuclearcraft

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `nuclearcraft:accelerator_coolant` | 设施或参数 | 快照 Serializer；快照 RecipeType；4 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `nuclearcraft:alloy_smelter` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；62 条源数据；有 KubeJS 引用。nuclear_03 |
| `nuclearcraft:analyzer` | 已按要求取消 | 快照 Serializer；快照 RecipeType；3 条源数据。原步骤 nuclear_33；保留模组类型记录，不计入当前合成路线。 |
| `nuclearcraft:assembler` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；47 条源数据；有 KubeJS 引用。nuclear_16 |
| `nuclearcraft:centrifuge` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；52 条源数据。nuclear_13 |
| `nuclearcraft:chemical_reactor` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；169 条源数据；有 KubeJS 引用。nuclear_10 |
| `nuclearcraft:collision_chamber` | 单列处理 | 39 条源数据。粒子专用输出；接入原生束流上游，不能添加普通物品结果。独立强制关卡需要能区、粒子来源和专用粒子注册设计。 |
| `nuclearcraft:crystallizer` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；33 条源数据。nuclear_15 |
| `nuclearcraft:decay_chamber` | 单列处理 | 34 条源数据。粒子专用输出；同位素物品的衰变加速由 decay_hastener 覆盖，不混为同一种设备。 |
| `nuclearcraft:decay_hastener` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；34 条源数据。nuclear_20 |
| `nuclearcraft:electrolyzer` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；3 条源数据。nuclear_08 |
| `nuclearcraft:extractor` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；2 条源数据。nuclear_07 |
| `nuclearcraft:fission_boiling` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；3 条源数据。nuclear_27 |
| `nuclearcraft:fission_reactor_controller` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；109 条源数据。nuclear_22 |
| `nuclearcraft:fluid_enricher` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；16 条源数据。nuclear_12 |
| `nuclearcraft:fluid_infuser` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；190 条源数据。nuclear_11 |
| `nuclearcraft:fuel_reprocessor` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；56 条源数据。nuclear_25 |
| `nuclearcraft:fusion_coolant` | 设施或参数 | 快照 Serializer；快照 RecipeType；4 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `nuclearcraft:fusion_core` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；21 条源数据。nuclear_24 |
| `nuclearcraft:gas_scrubber` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；1 条源数据。nuclear_17 |
| `nuclearcraft:heat_exchanger_controller` | 设计加工工艺 | 6 条源数据。nuclear_26 |
| `nuclearcraft:ingot_former` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；288 条源数据。nuclear_06 |
| `nuclearcraft:irradiator` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；12 条源数据；有 KubeJS 引用。nuclear_21 |
| `nuclearcraft:isotope_separator` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；32 条源数据。nuclear_09 |
| `nuclearcraft:kugelblitz_chamber` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；52 条源数据；有 KubeJS 引用。nuclear_30 |
| `nuclearcraft:leacher` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；16 条源数据。nuclear_14 |
| `nuclearcraft:manufactory` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；123 条源数据；有 KubeJS 引用。nuclear_01 |
| `nuclearcraft:melter` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；604 条源数据；有 KubeJS 引用。nuclear_05 |
| `nuclearcraft:msr_controller` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；27 条源数据。nuclear_23 |
| `nuclearcraft:nc_ore_veins` | 设施或参数 | 快照 Serializer；快照 RecipeType；9 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `nuclearcraft:nuclear_blast` | 单列处理 | 2 条源数据。会在世界中核爆并改写大量方块；本路线的爆炸转化使用可隔离的 AE 爆炸，不强制核爆。 |
| `nuclearcraft:nuclear_furnace` | 单列处理 | 快照 RecipeType。快照有运行时类型，未找到独立 serializer；保留为烧炼设备候选，不能仅靠普通 smelting 配方保证只经过核动力熔炉。 |
| `nuclearcraft:pressurizer` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；54 条源数据；有 KubeJS 引用。nuclear_04 |
| `nuclearcraft:pump` | 推荐原生供料 | 快照 Serializer；快照 RecipeType；10 条源数据；有 KubeJS 引用。nuclear_32 |
| `nuclearcraft:reset_nbt` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `nuclearcraft:rock_crusher` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；15 条源数据；有 KubeJS 引用。nuclear_02 |
| `nuclearcraft:shielding` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `nuclearcraft:steam_turbine` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；2 条源数据。nuclear_29 |
| `nuclearcraft:subatomic_liquifier` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；73 条源数据。nuclear_19 |
| `nuclearcraft:supercooler` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；9 条源数据。nuclear_18 |
| `nuclearcraft:target_chamber` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；441 条源数据。nuclear_31 |
| `nuclearcraft:turbine_controller` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；3 条源数据。nuclear_28 |

### patchouli

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `patchouli:shaped_book_recipe` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `patchouli:shapeless_book_recipe` | 专用合成处理器 | 快照 Serializer；4 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### pneumaticcraft

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `pneumaticcraft:amadron` | 单列处理 | 23 条源数据。贸易及配送系统，保留为供应渠道；基础制造路线不将购买行为计为独立材料加工。 |
| `pneumaticcraft:assembly_drill` | 设计加工工艺 | 5 条源数据。pneumatic_03 |
| `pneumaticcraft:assembly_drill_laser` | 专用合成处理器 | 当前注册类。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:assembly_laser` | 设计加工工艺 | 15 条源数据。pneumatic_04 |
| `pneumaticcraft:compressor_upgrade_crafting` | 专用合成处理器 | 2 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:crafting_shaped_no_mirror` | 专用合成处理器 | 2 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:crafting_shaped_pressurizable` | 专用合成处理器 | 11 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:drone_color_crafting` | 专用合成处理器 | 1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:drone_upgrade_crafting` | 专用合成处理器 | 1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:explosion_crafting` | 已按要求取消 | 3 条源数据；有 KubeJS 引用。原步骤 pneumatic_01；保留模组类型记录，不计入当前合成路线。 |
| `pneumaticcraft:fluid_mixer` | 设计加工工艺 | 2 条源数据；有 KubeJS 引用。pneumatic_07 |
| `pneumaticcraft:fuel_quality` | 设施或参数 | 12 条源数据；有 KubeJS 引用。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `pneumaticcraft:gun_ammo_potion_crafting` | 专用合成处理器 | 1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:heat_frame_cooling` | 设计加工工艺 | 3 条源数据。pneumatic_08 |
| `pneumaticcraft:heat_properties` | 设施或参数 | 33 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `pneumaticcraft:one_probe_helmet_crafting` | 专用合成处理器 | 1 条源数据；当前注册类。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:patchouli_book_crafting` | 专用合成处理器 | 1 条源数据；当前注册类。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `pneumaticcraft:pressure_chamber` | 设计加工工艺 | 18 条源数据；有 KubeJS 引用。pneumatic_02 |
| `pneumaticcraft:pressure_chamber_disenchanting` | 已按要求取消 | 1 条源数据。原步骤 pneumatic_10；保留模组类型记录，不计入当前合成路线。 |
| `pneumaticcraft:pressure_chamber_enchanting` | 已按要求取消 | 1 条源数据。原步骤 pneumatic_09；保留模组类型记录，不计入当前合成路线。 |
| `pneumaticcraft:refinery` | 设计加工工艺 | 3 条源数据；有 KubeJS 引用。pneumatic_05 |
| `pneumaticcraft:thermo_plant` | 设计加工工艺 | 24 条源数据；有 KubeJS 引用。pneumatic_06 |

### productivebees

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `productivebees:advanced_beehive` | 推荐原生供料 | 快照 Serializer；快照 RecipeType；387 条源数据；有 KubeJS 引用。bio_12 |
| `productivebees:bee_breeding` | 生物或实体流程 | 快照 Serializer；快照 RecipeType；101 条源数据。保留为蜂种或养殖设施上游；结果受实体类型限制，不冒充任意材料输出。 |
| `productivebees:bee_cage_bomb` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `productivebees:bee_conversion` | 生物或实体流程 | 快照 Serializer；快照 RecipeType；114 条源数据。保留为蜂种或养殖设施上游；结果受实体类型限制，不冒充任意材料输出。 |
| `productivebees:bee_fishing` | 生物或实体流程 | 快照 Serializer；快照 RecipeType；5 条源数据；有 KubeJS 引用。保留为蜂种或养殖设施上游；结果受实体类型限制，不冒充任意材料输出。 |
| `productivebees:bee_nbt_changer` | 生物或实体流程 | 快照 Serializer；快照 RecipeType；6 条源数据。保留为蜂种或养殖设施上游；结果受实体类型限制，不冒充任意材料输出。 |
| `productivebees:bee_spawning` | 生物或实体流程 | 快照 Serializer；快照 RecipeType；35 条源数据；有 KubeJS 引用。保留为蜂种或养殖设施上游；结果受实体类型限制，不冒充任意材料输出。 |
| `productivebees:block_conversion` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；28 条源数据。bio_13 |
| `productivebees:bottler` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；7 条源数据。bio_16 |
| `productivebees:centrifuge` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；400 条源数据。bio_15 |
| `productivebees:configurable_comb_block` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `productivebees:configurable_honeycomb` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `productivebees:gene_gene` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `productivebees:gene_treat` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `productivebees:incubation` | 生物或实体流程 | 快照 Serializer；快照 RecipeType。保留为蜂种或养殖设施上游；结果受实体类型限制，不冒充任意材料输出。 |
| `productivebees:item_conversion` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；8 条源数据。bio_14 |

### quark

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `quark:dye_item` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `quark:elytra_duplication` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `quark:exclusion` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `quark:mixed_exclusion` | 专用合成处理器 | 快照 Serializer；3 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `quark:slab_to_block` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `quark:smithing_rune` | 专用合成处理器 | 快照 Serializer；18 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### sakura

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `sakura:chopping` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；6 条源数据。bio_08 |
| `sakura:cooking` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；105 条源数据。bio_09 |
| `sakura:distillation` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；5 条源数据。bio_11 |
| `sakura:fermenting` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；15 条源数据。bio_10 |
| `sakura:stone_mortar` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；19 条源数据；有 KubeJS 引用。bio_07 |

### sgjourney

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `sgjourney:advanced_crystallizing` | 设计加工工艺 | 6 条源数据。engineering_24 |
| `sgjourney:crystallizing` | 已按要求取消 | 17 条源数据。原步骤 engineering_23；保留模组类型记录，不计入当前合成路线。 |
| `sgjourney:naquadah_heavy_liquidizing` | 设计加工工艺 | 1 条源数据。engineering_26 |
| `sgjourney:naquadah_liquidizing` | 已按要求取消 | 1 条源数据。原步骤 engineering_25；保留模组类型记录，不计入当前合成路线。 |

### slashblade

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `slashblade:proudsoul` | 设计加工工艺 | 快照 Serializer；3 条源数据。precision_01 |
| `slashblade:shaped_blade` | 已按要求取消 | 快照 Serializer；132 条源数据；有 KubeJS 引用。原步骤 precision_02；保留模组类型记录，不计入当前合成路线。 |
| `slashblade:slashblade_smithing` | 已按要求取消 | 快照 Serializer；49 条源数据；有 KubeJS 引用。原步骤 precision_03；保留模组类型记录，不计入当前合成路线。 |

### slashbladetetra

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `slashbladetetra:modular_exchange` | 已按要求取消 | 1 条源数据。原步骤 precision_07；保留模组类型记录，不计入当前合成路线。 |

### sophisticatedbackpacks

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `sophisticatedbackpacks:backpack_dye` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedbackpacks:backpack_upgrade` | 专用合成处理器 | 快照 Serializer；5 条源数据；有 KubeJS 引用。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedbackpacks:basic_backpack` | 专用合成处理器 | 快照 Serializer；1 条源数据；有 KubeJS 引用。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedbackpacks:smithing_backpack_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据；有 KubeJS 引用。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### sophisticatedcore

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `sophisticatedcore:upgrade_clear` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedcore:upgrade_next_tier` | 专用合成处理器 | 快照 Serializer；36 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### sophisticatedstorage

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `sophisticatedstorage:barrel_material` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:double_chest_tier_upgrade` | 专用合成处理器 | 快照 Serializer；5 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:double_chest_tier_upgrade_shapeless` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:flat_top_barrel_toggle` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:generic_wood_storage` | 专用合成处理器 | 快照 Serializer；6 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:shulker_box_from_chest` | 专用合成处理器 | 快照 Serializer；6 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:shulker_box_from_vanilla_shapeless` | 专用合成处理器 | 快照 Serializer；17 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:storage_dye` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:storage_tier_upgrade` | 专用合成处理器 | 快照 Serializer；35 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `sophisticatedstorage:storage_tier_upgrade_shapeless` | 专用合成处理器 | 快照 Serializer；7 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### species

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `species:species_mob_head_firework_star` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### storagedrawers

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `storagedrawers:add_detached_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `storagedrawers:add_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `storagedrawers:keyring` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `storagedrawers:personal_key_cycle` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `storagedrawers:remote_group_upgrade` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### supermartijn642corelib

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `supermartijn642corelib:conditional` | 加载或包装 | 快照 Serializer。条件加载、空配方或 NBT 包装层，不是玩家独立操作。 |

### terra_curio

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `terra_curio:extra_step_stool` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `terra_curio:workshop` | 设计加工工艺 | 快照 Serializer；78 条源数据。precision_05 |
| `terra_curio:workshop_type` | 运行时类型或代码设施 | 快照 RecipeType。不能直接作为 JSON serializer；检查原生设备或归并到同一工艺。 |

### the_bumblezone

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `the_bumblezone:container_shapeless_recipe_bz` | 专用合成处理器 | 快照 Serializer；6 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `the_bumblezone:nbt_keeping_shapeless_recipe` | 专用合成处理器 | 快照 Serializer；2 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `the_bumblezone:potion_candle_recipe` | 专用合成处理器 | 快照 Serializer；2 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### thermal

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `thermal:bottler` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；44 条源数据。thermal_19 |
| `thermal:brewer` | 设计加工工艺 | 快照 Serializer；快照 RecipeType。thermal_20 |
| `thermal:centrifuge` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；77 条源数据。thermal_16 |
| `thermal:chiller` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；38 条源数据。thermal_15 |
| `thermal:compression_fuel` | 设施或参数 | 快照 Serializer；快照 RecipeType；7 条源数据；有 KubeJS 引用。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:crucible` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；14 条源数据。thermal_14 |
| `thermal:crystallizer` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；10 条源数据；有 KubeJS 引用。thermal_21 |
| `thermal:disenchantment_fuel` | 设施或参数 | 快照 Serializer；快照 RecipeType；1 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:fisher_boost` | 设施或参数 | 快照 Serializer；快照 RecipeType；3 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:furnace` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；1 条源数据。thermal_09 |
| `thermal:gourmand_fuel` | 设施或参数 | 快照 Serializer；快照 RecipeType；19 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:hive_extractor` | 推荐原生供料 | 快照 Serializer；快照 RecipeType。thermal_24 |
| `thermal:insolator` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；252 条源数据。thermal_22 |
| `thermal:insolator_catalyst` | 设施或参数 | 快照 Serializer；快照 RecipeType；4 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:lapidary_fuel` | 设施或参数 | 快照 Serializer；快照 RecipeType；8 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:magmatic_fuel` | 设施或参数 | 快照 Serializer；快照 RecipeType；2 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:numismatic_fuel` | 设施或参数 | 快照 Serializer；快照 RecipeType；17 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:potion_diffuser_boost` | 设施或参数 | 快照 Serializer；快照 RecipeType；2 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:press` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；412 条源数据；有 KubeJS 引用。thermal_13 |
| `thermal:pulverizer` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；108 条源数据；有 KubeJS 引用。thermal_11 |
| `thermal:pulverizer_catalyst` | 设施或参数 | 快照 Serializer；快照 RecipeType；2 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:pulverizer_recycle` | 同设备回收模式 | 快照 Serializer；快照 RecipeType；9 条源数据。磨粉机或感应炉的回收处理，归并相同设备；主路线不开放材料增殖回收。 |
| `thermal:pyrolyzer` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；3 条源数据。thermal_17 |
| `thermal:refinery` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；5 条源数据；有 KubeJS 引用。thermal_18 |
| `thermal:rock_gen` | 推荐原生供料 | 快照 Serializer；快照 RecipeType；6 条源数据。thermal_25 |
| `thermal:sawmill` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；32 条源数据。thermal_10 |
| `thermal:smelter` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；121 条源数据；有 KubeJS 引用。thermal_12 |
| `thermal:smelter_catalyst` | 设施或参数 | 快照 Serializer；快照 RecipeType；6 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:smelter_recycle` | 同设备回收模式 | 快照 Serializer；快照 RecipeType；26 条源数据。磨粉机或感应炉的回收处理，归并相同设备；主路线不开放材料增殖回收。 |
| `thermal:stirling_fuel` | 设施或参数 | 快照 Serializer；快照 RecipeType；5 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |
| `thermal:tree_extractor` | 推荐原生供料 | 快照 Serializer；快照 RecipeType；24 条源数据；有 KubeJS 引用。thermal_23 |
| `thermal:tree_extractor_boost` | 设施或参数 | 快照 Serializer；快照 RecipeType；3 条源数据。燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。 |

### tofucraft

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `tofucraft:bittern` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；3 条源数据。bio_01 |
| `tofucraft:harder` | 已按要求取消 | 快照 Serializer；快照 RecipeType；2 条源数据。原步骤 bio_02；保留模组类型记录，不计入当前合成路线。 |
| `tofucraft:tf_craft` | 运行时类型或代码设施 | 快照 RecipeType。不能直接作为 JSON serializer；检查原生设备或归并到同一工艺。 |
| `tofucraft:tf_craft_shaped` | 已按要求取消 | 快照 Serializer；2 条源数据。原步骤 bio_04；保留模组类型记录，不计入当前合成路线。 |
| `tofucraft:tf_craft_shapeless` | 已按要求取消 | 快照 Serializer；2 条源数据。原步骤 bio_05；保留模组类型记录，不计入当前合成路线。 |
| `tofucraft:tofu_pot` | 运行时类型或代码设施 | 快照 RecipeType。不能直接作为 JSON serializer；检查原生设备或归并到同一工艺。 |
| `tofucraft:tofu_pot_shapeless` | 设计加工工艺 | 快照 Serializer；20 条源数据。bio_03 |
| `tofucraft:tofu_work_station` | 已按要求取消 | 快照 Serializer；快照 RecipeType；1 条源数据。原步骤 bio_06；保留模组类型记录，不计入当前合成路线。 |

### twilightforest

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `twilightforest:crumble_horn` | 设计加工工艺 | 快照 Serializer；快照 RecipeType；36 条源数据。aether_14 |
| `twilightforest:magic_map_cloning_recipe` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `twilightforest:maze_map_cloning_recipe` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `twilightforest:moonworm_queen_repair_recipe` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `twilightforest:transformation_powder` | 单列处理 | 快照 Serializer；快照 RecipeType；16 条源数据。输入输出都是实体类型，不能把材料 ID 填入 from/to。 |
| `twilightforest:uncrafting` | 已按要求取消 | 快照 Serializer；快照 RecipeType；2 条源数据。原步骤 aether_15；保留模组类型记录，不计入当前合成路线。 |

### umapyoi

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `umapyoi:shaped_card` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `umapyoi:shaped_costume` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `umapyoi:shaped_umasoul` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `umapyoi:shapeless_card` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `umapyoi:shapeless_costume` | 专用合成处理器 | 快照 Serializer；8 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `umapyoi:shapeless_race_ticket` | 专用合成处理器 | 快照 Serializer；1 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |
| `umapyoi:shapeless_umasoul` | 专用合成处理器 | 快照 Serializer；20 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### wormhole

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `wormhole:nbtrecipe` | 专用合成处理器 | 快照 Serializer；3 条源数据。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

### zeta

| 标识 | 设计处理 | 依据与说明 |
|---|---|---|
| `zeta:dye_item` | 专用合成处理器 | 快照 Serializer。通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。 |

## 未安装模组的兼容命名空间

这些条目保留在机器可读清单中，以便后续安装模组时重审。不会要求玩家建造未安装模组的机器。

| 命名空间 | 标识 |
|---|---|
| `alchemistry` | `alchemistry:combiner`、`alchemistry:dissolver` |
| `ars_nouveau` | `ars_nouveau:enchanting_apparatus` |
| `astralsorcery` | `astralsorcery:infuser` |
| `bloodmagic` | `bloodmagic:altar`、`bloodmagic:soulforge` |
| `botanicadds` | `botanicadds:gaia_plate` |
| `botanypots` | `botanypots:crop`、`botanypots:soil` |
| `chipped` | `chipped:mason_table`、`chipped:workbench` |
| `corail_woodcutter` | `corail_woodcutter:woodcutting` |
| `create` | `create:compacting`、`create:crushing`、`create:cutting`、`create:emptying`、`create:filling`、`create:milling`、`create:mixing`、`create:pressing`、`create:sequenced_assembly` |
| `eidolon` | `eidolon:crucible` |
| `elementalcraft` | `elementalcraft:binding`、`elementalcraft:infusion`、`elementalcraft:pureinfusion` |
| `evilcraft` | `evilcraft:blood_infuser` |
| `farmersdelight` | `farmersdelight:cooking`、`farmersdelight:cutting` |
| `feywild` | `feywild:altar` |
| `forbidden_arcanus` | `forbidden_arcanus:clibano_combustion` |
| `ftbic` | `ftbic:canning` |
| `gtceu` | `gtceu:alloy_smelter`、`gtceu:assembly_line`、`gtceu:centrifuge`、`gtceu:electric_blast_furnace`、`gtceu:electrolyzer`、`gtceu:electromagnetic_separator`、`gtceu:macerator` |
| `iceandfire` | `iceandfire:dragonforge` |
| `immersiveengineering` | `immersiveengineering:crusher`、`immersiveengineering:metal_press`、`immersiveengineering:squeezer` |
| `industrialforegoing` | `industrialforegoing:laser_drill_fluid`、`industrialforegoing:laser_drill_ore` |
| `jeed` | `jeed:effect_provider` |
| `mekanism` | `mekanism:combining`、`mekanism:crushing`、`mekanism:enriching`、`mekanism:oxidizing`、`mekanism:sawing` |
| `mysticalagriculture` | `mysticalagriculture:awakening`、`mysticalagriculture:infusion` |
| `mythicbotany` | `mythicbotany:infuser` |
| `naturesaura` | `naturesaura:altar`、`naturesaura:offering` |
| `occultism` | `occultism:spirit_fire` |
| `powah` | `powah:energizing` |
| `spirit` | `spirit:soul_transmutation` |
| `tconstruct` | `tconstruct:alloy`、`tconstruct:casting_basin`、`tconstruct:casting_table`、`tconstruct:melting`、`tconstruct:modifier`、`tconstruct:modifier_salvage` |
| `tokenenchanter` | `tokenenchanter:token_enchanting` |
| `touhou_little_maid` | `touhou_little_maid:altar_crafting` |

## 代码驱动和 JEI 展示操作

| 操作 | 设计处理 |
|---|---|
| 盆景生长收获 | 设计包含的原生操作，对应 bio_17；`native:` 只是本文记号，不能填进配方 JSON。 |
| Tetra 模组工作台 | 已按要求取消原步骤 precision_06，不计入当前路线覆盖。 |
| 原版酿造 | 设计包含的原生操作，对应 precision_12；`native:` 只是本文记号，不能填进配方 JSON。 |
| 铁砧 | 已按要求取消原步骤 precision_13，不计入当前路线覆盖。 |
| 砂轮 | 已按要求取消原步骤 precision_14，不计入当前路线覆盖。 |
| PCB 曝光 | 设计包含的原生操作，对应 pneumatic_16；`native:` 只是本文记号，不能填进配方 JSON。 |
| PCB 蚀刻 | 设计包含的原生操作，对应 pneumatic_17；`native:` 只是本文记号，不能填进配方 JSON。 |
| 炼药锅刀胚淬火 | 设计包含的原生操作，对应 precision_15；`native:` 只是本文记号，不能填进配方 JSON。 |
| 照片打印 | 设计包含的原生操作，对应 precision_16；`native:` 只是本文记号，不能填进配方 JSON。 |
| 照片叠放 | 设计包含的原生操作，对应 precision_17；`native:` 只是本文记号，不能填进配方 JSON。 |
| 村民交易与嗡嗡蜂女王交易 | 供应或交易系统，保留展示，不计材料加工机台。 |
| Species 生物喂养产物 | 养殖和实体行为，列为供应支线；本路线不伪造通用 JSON 加工器。 |
| 赛马娘抽卡和马魂拆解 | 专用马魂与随机获取系统，结果受对象限制，保留清单复核，不作通用材料加工。 |
| Quark 附魔影响 | 附魔设施效果，归入附魔系统条件，不计为额外机台。 |


## 原始依据

[recipe-types.json](recipe-types.json) 保存每个标识的示例 JSON、来源 JAR 路径、条件判断、注册类字符串证据和 KubeJS 引用位置。注册类中的字符串只提供复核线索，不自动等同于已注册配方。

重新收集使用 `python -X utf8 kubejs/tools/collect_recipe_types.py`，重新生成设计索引使用 `python -X utf8 kubejs/tools/build_recipe_route_design.py`。两个工具仅更新文档。
