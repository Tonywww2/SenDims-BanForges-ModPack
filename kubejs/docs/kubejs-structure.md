# SDBF 整合包 KubeJS 结构文档

> 本文档描述 `kubejs/` 目录的组织结构、加载机制与核心开发约定。
> 定位：以 **SlashBlade + Tetra + Apotheosis** 为核心的大型进程整合包，涵盖 Ad Astra 太空、Aether、Undergarden、TofuCraft、NuclearCraft 等多维度进程。

## 1. 概述

- 默认命名空间：`kubejs:`，即 `event.create('name')` 生成 `kubejs:name`。
- 特殊内容显式使用 `sdbf:` 前缀（如 `event.create('sdbf:fantasy_bubble')`）。
- 脚本语言：JavaScript（Rhino 引擎），配合 ProbeJS 生成的类型提示。

## 2. 顶层目录布局

标准 KubeJS 布局，每个目录职责如下：

| 目录 | 作用 |
|------|------|
| `startup_scripts/` | 游戏启动时加载一次，用于物品/方块/流体注册、tier、potion 等 |
| `server_scripts/` | 每次服务端资源重载时加载，处理配方、标签、战利品、服务端事件（项目主体） |
| `client_scripts/` | 每次客户端资源重载时加载，处理 JEI、tooltips 等客户端逻辑 |
| `common_scripts/` | 双端共享脚本 |
| `assets/` | 资源包，按 mod 分子目录存放客户端资源（贴图/模型/语言等） |
| `data/` | 数据包，按 mod 分子目录存放服务端资源（战利品表/标签/配方等） |
| `mixin_scripts/` | KubeJS Mixin 脚本（当前为空，未使用） |
| `config/` | KubeJS 配置存储 |
| `probe/` | ProbeJS 生成的类型定义（`generated/` `user/` `docs/` `cache/`） |
| `jsconfig.json` | TypeScript 语言服务配置 |

## 3. 脚本加载机制

### 3.1 三类脚本与重载方式

| 类型 | 加载时机 | 重载命令 |
|------|----------|----------|
| startup | 游戏启动一次 | 需重启游戏（`/kubejs reload_startup_scripts` 未必生效） |
| server | 服务端资源重载 | `/reload` |
| client | 客户端资源重载 | `F3 + T` |

> 注意：方块/物品注册在 startup 脚本，改动后必须**重启游戏**，`/reload` 无效。

### 3.2 加载顺序：`// priority: N`

脚本文件顶部的 `// priority: N` 注释控制加载顺序，**数值大者先加载**。项目实测：

- `server_scripts/utils.js` = 2000（最先，加载 Java 类与工具函数）
- `server_scripts/api/api.js` = 1900
- `server_scripts/tetra/tetra_builder.js` = 200
- `server_scripts/tetra/s1_tetras.js` = 100
- 未标注的文件 = 0（默认，最后加载）

## 4. 命名与阶段约定

### 4.1 阶段化前缀 `s1` / `s2` / `s3` / `s4`

全包按游戏进度分为 4 个阶段，Tetra 材料、Boss、Gateway、配方等都用 `sN_` 前缀分文件：

| 阶段 | 内容主题 |
|------|----------|
| s1 | 豆腐（TofuCraft）起步阶段 |
| s2 | 以太 / 火星 / 月球 / 下界 / 深暗领域1 / 暮色 |
| s3 | 末地 / 暗域 / 金星水星 / 深暗领域2、3 |
| s4 | 小行星带 / 嗡嗡蜂领域 / 末地内部 / 土星环 / 主世界 |

## 5. 核心封装

### 5.1 Tetra 材料构建器 `tetraMaterialBuilder`

定义于 `server_scripts/tetra/tetra_builder.js`，链式 Builder 模式，`.build()` 内部调用 `event.addJson('tetra:materials/<category>/<key>.json', json)` 生成 Tetra 材料 JSON。在 `ServerEvents.highPriorityData` 事件中调用。

示例（来自 `server_scripts/tetra/s1_tetras.js`）：

```js
ServerEvents.highPriorityData(event => {
    tetraMaterialBuilder(event, "tofuishi").setCategory("stone")
        .setPrimary(1.3).setSecondary(1.3).setTertiary(0.8)
        .setDurability(130).setIntegrityCost(1).setIntegrityGain(1)
        .setMagicCapacity(60).setToolLevel(3).setToolEfficiency(4)
        .addAttributes("minecraft:generic.attack_damage", 0.15)
        .setTints("f5f5dc", "fff8dc")
        .addTexture("crude").addTexture("grainy")
        .addItemMaterial('tofucraft:tofuishi')
        .setRequiredTool("hammer_dig", 1)
        .build();
})
```

主要链式方法：

| 方法 | 说明 |
|------|------|
| `setCategory(str)` | 材料类别（metal / stone / fabric / skin 等） |
| `setPrimary/Secondary/Tertiary(num)` | 三档数值权重 |
| `setDurability(int)` | 耐久 |
| `setIntegrityCost/Gain(int)` | 完整性消耗 / 获得 |
| `setMagicCapacity(int)` | 魔法容量 |
| `setToolLevel(str)` / `setToolEfficiency(int)` | 工具等级 / 效率 |
| `setTints(glyph, texture)` | 符文色 / 纹理色（hex） |
| `addTexture(texture)` | 追加纹理层（shiny / metal / crude / grainy / heavy / default 等） |
| `addItemMaterial(item)` | 关联来源物品 |
| `setTagMaterial(tag)` / `setMaterialNBT(any)` / `addMaterialCount(num)` | 标签材料 / NBT / 数量 |
| `setRequiredTool(tool, level)` | 所需工具（如 hammer_dig） |
| `addAttributes(att, num)` | 追加属性加成 |
| `addEffects(eff, lst)` | 追加效果 |
| `addEnchantment(id, lvl)` | 追加附魔 |
| `addImprovements(str, any)` | 追加改良 |
| `setTags(lst)` / `setFeatures(lst)` | 标签 / 特性 |
| `setReplace/setHidden/setHiddenOutcomes(bool)` | 替换 / 隐藏 / 隐藏产出 |
| `setExperienceCost(num)` / `setCountFactor(num)` | 经验消耗 / 数量系数 |
| `build()` | 生成 JSON 并写入 |

### 5.2 Boss 与 Gateway 构建器

- `server_scripts/enemy/boss/boss_builder.js`：Apotheosis Boss 构建器，各阶段 boss 用 `sN_*_bosses.js` 分文件。
- `server_scripts/enemy/gateways/gateway_helpers.js`：Gateways to Eternity 传送门构建器，各阶段用 `sN_gw.js` 分文件。

> 这两套封装对应工作区内的两个 subagent：Gateway Generator 与 Tetra Material Generator。

### 5.3 `utils.js` 工具库

`server_scripts/utils.js`（priority 2000，最先加载）集中做两件事：

1. 用 `Java.loadClass(...)` 把 Minecraft / Forge / SlashBlade / Tetra / Apotheosis / Curios / Umapyoi 等 Java 类挂到 `$XxxClass` 常量，供全局脚本复用。
2. 定义通用工具函数，如 `sqRecipe`（StructureQuill 配方）、`numToInt`、`print` 等。

### 5.4 `SDBF` 全局对象

`server_scripts/api/api.js`（priority 1900）定义全局 `SDBF` 对象：

```js
const SDBF = {
    modInstalled: (modId) => Platform.getMods().containsKey(modId),
    getRecipeHelper: () => $RecipeRemovalHelper,
}
```

### 5.5 `global.xxx` 跨脚本共享

用 `global.` 前缀在脚本间共享数据，例如：

- `global.materialReplaceRules`（`server_scripts/materials_merge.js`）：材料替换规则表。
- `global.immptEnabled`（`server_scripts/config.js`）：是否安装 Immersive Portals。

## 6. server_scripts 子目录职责

| 路径 | 职责 |
|------|------|
| `api/` | `SDBF` 全局 API 对象 |
| `tetra/` | Tetra 材料构建器与各阶段材料定义 |
| `recipes/` | 配方（含 `tech/`：AE2、Botania、Ender IO、NuclearCraft、Thermal） |
| `enemy/` | 敌人属性（`enemy_attributes*.js` 按 pattern 加属性）、`boss/`、`gateways/`、Apotheosis boss 掉落 |
| `custom_spawn/` | 自定义生成（传送门 / 结构） |
| `miscs/` | 杂项事件（难度、维度、宝石、特殊战利品等） |
| 根级 `*.js` | 标签（block/item/entity_tags）、命令注册、配置、工具函数、材料合并 |

## 7. 内容注册示例

`startup_scripts/reg.js` 通过 `StartupEvents.registry` 注册：

```js
StartupEvents.registry('item', event => {
    event.create('alpha_dust').fireResistant()
    event.create('gem_ticket').fireResistant().rarity('epic').maxStackSize(8)
    event.create('sdbf:fantasy_bubble').fireResistant().rarity('epic')
})

StartupEvents.registry('block', event => {
    event.create('asteroid_rock')
        .soundType('stone').hardness(2.0).resistance(6.0)
        .requiresTool(true).tagBlock('minecraft:mineable/pickaxe')
})

StartupEvents.registry('fluid', event => {
    event.create('melted_proudsoul').thickTexture(0x5a30bf).bucketColor(0x5a30bf)
})
```

## 8. 资源包 / 数据包组织

- `assets/<modid>/`：按 mod 分目录，覆盖或新增该 mod 的客户端资源（贴图、模型、语言文件）。
- `data/<modid>/`：按 mod 分目录，覆盖或新增该 mod 的服务端资源（战利品表、标签、配方）。
- 提供自定义资源 JSON 会覆盖 KubeJS 自动生成的默认资源。

## 9. 开发环境

- `jsconfig.json`：`rootDirs` 包含 `probe/generated`、`probe/user`、`server_scripts`、`startup_scripts`、`client_scripts`，`target` 为 ES2015。
- `probe/`：ProbeJS 生成的类型定义与文档，为脚本提供类型提示与自动补全。
- 类型专属日志位于 `logs/kubejs/` 目录。
