# 难度系统：N0 与 N-3～N-7 物品补给子修正（2026-11-04）

数据在 `kubejs/server_scripts/miscs/difficulty_data.js`，全部属于"物品补给"类。选择后一次性发放；子修正选中后不能取消，只有重置命令会清除。

## 新增子修正

| 档位 | ID | 发放 | 分数 |
| --- | --- | --- | --- |
| N0 | `skip_skyblock`（跳过初始空岛部分） | 烤豆腐块 ×18、苔藓块 ×2、豆腐魔杖 ×2（两套豆腐世界传送仪式材料） | 0 |
| N0 | `skip_tofu_world`（跳过豆腐世界部分） | 深境证章 ×1、裂纹砖块 ×18、砖块 ×2（深境一层传送仪式材料） | 0 |
| N-3 | `me_drive` | ME驱动器 ×2 | -1 |
| N-4 | `storage_cell_16k` | 16k ME物品存储元件 ×2 | -1 |
| N-4 | `villagers` | 村民（简易村民）×8 | -1 |
| N-4 | `traders` | 交易器 ×8 | -1 |
| N-5 | `vindicator_spawner` | 卫道士刷怪笼 ×1（按给定 NBT：每 20 刻、每次 16 只、上限 32、玩家 16 格内、无 AI、无视光照与条件、可红石控制） | -1 |
| N-6 | `disk_drive_256k` | 256k ME 磁盘驱动器 ×2 | -1 |
| N-6 | `fe_cell_256k` | 256k ME FE存储元件 ×1 | -1 |
| N-6 | `americium_rtg` | 镅放射性同位素热电式发电机 ×2、谐振整合组件 ×2 | -1 |
| N-6 | `pulverizer` | 磨粉机 ×2、谐振整合组件 ×2 | -1 |
| N-6 | `induction_smelter` | 感应炉 ×2、谐振整合组件 ×2 | -1 |
| N-6 | `redstone_furnace` | 红石熔炼炉 ×2、谐振整合组件 ×2 | -1 |
| N-7 | `creative_energy` | 创造模式能量源 ×1 | -50 |
| N-7 | `creative_oxygen` | 创造模式氧气罐 ×1、太空呼吸 I 附魔书 ×1 | -50 |
| N-7 | `tier7_rocket` | 七阶火箭 ×1、装 512000 mB 燃油的巨型流体储罐 ×1 | -1 |
| N-7 | `creative_item_cell` | 创造ME物品元件 ×1 | -50 |
| N-7 | `creative_fluid_cell` | 创造ME流体元件 ×1 | -50 |
| N-7 | `creative_pool` | 永恒魔力池 ×1 | -50 |
| N-7 | `fission_builder` | 裂变反应堆建造器 ×1 | -1 |
| N-7 | `zenith_divine_might` | 天顶·伪「神威」×1（刀 ID `slashblade_sendims:zenith_false_divine_might`） | -1 |
| N-7 | `gate_fragments` | 神门残片 ×64 | -1 |

- **分数沿用原有约定**：普通补给 -1；创造物品与原有的创造贩卖升级一样记 -50。分数只用于界面"总分"显示。
- **N0 的两项**：任何难度都可以选（N0 子修正不受当前档位限制），与原有的 N0 补给"破碎的耀魂"一样记 0 分。
- **原有子修正**：N-7 原有的 `infinite_items`（创造贩卖升级）保留。加上新增的，N-6 共 6 个，N-7 共 10 个。

## 写法

`effect.type: 'item'` 现在支持两种写法：
- 单件：`{ item, count }` 或 `{ item, nbt }`，原有条目不变。
- 多件：`{ items: [...] }`，列表里每一项可以是：
  - `{ item, count }`
  - `{ item, nbt }`
  - `{ blade: 刀ID }`：拔刀剑具名刀，需要服务端注册表，发放时用 `utils.js` 的 `getBladeStack` 生成。刀 ID 无效时记录错误并跳过这一件，其余照常发放。

`difficulty_config.js` 把两种写法统一为 `effect.supplies`，`difficulty.js` 的 `giveDifficultySupplies` 逐件发放。附魔书直接写 `StoredEnchantments`，与 `Item.of('minecraft:enchanted_book').enchant(...)` 结果相同。

## 开关

`kubejs/server_scripts/configs.js`：

```js
global.difficulty_extreme_modifiers_enabled = true;
```

- **作用**：设为 `false` 时，N-6 与 N-7 的全部子修正（`requiredLevel <= -6`，共 16 个）从服务端和客户端数据中移除，界面里不出现、也不能选择。N-6、N-7 难度本身仍可选择。
- **替代旧开关**：它取代原先只禁用创造贩卖升级的 `global.difficulty_cvu_enabled`。旧开关仍写成 `false` 的服务端按同样规则处理。
- **已选的不受影响**：关闭开关只影响之后的选择；已经选过的子修正和已发放的物品不受影响。

## 检查

- `node docs/tools/test_difficulty_supplies.cjs`：94 项，覆盖 22 个新条目的档位与物品、NBT 原样保留、开关新旧两种键、多件发放、拔刀剑延后生成和失败跳过。
- `test_difficulty.cjs`（795 项）与 `test_difficulty_confirmation.cjs`（562 项）：以已提交的 `enemy_attributes_patterns.js`／`enemy_attributes_mobs.js` 运行时全部通过。用当前工作区的这两个文件运行时，`test_difficulty.cjs` 会因生命期望值失败（25740 ≠ 23400，即三阶段 "3_3" 生命倍率从 1.0 改为 1.1），与本次修改无关，需要按新数值更新测试期望。
- 实例 Rhino 编译四个改动脚本通过。游戏内的选择和发放尚未实际验收。
