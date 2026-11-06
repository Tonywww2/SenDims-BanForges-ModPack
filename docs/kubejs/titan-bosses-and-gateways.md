# 土卫六：神话首领与三种传送门珍珠

实装日期：2026-11-02。维度 `titan_moon:titan`，任务阶段 S5 初期，沿用整合包的 `4_1` 生物属性模板。

## 世界设定与首领

围绕 Titan Moon 已有的托林生物、氨泉捕食链、冰硅甲壳和被寄生的勘探设备设计，保留各物种的原生 AI 与技能。没有把温顺的甲烷浮游体、氢营养蹒兽变成首领，也没有复制原生冰虫这一独立世界首领。

四类定义均只接受土卫六，稀有度固定为 `mythic`。这里的称谓描述战斗定位，实体显示名仍由 Apotheosis 的首领命名系统生成。

| 首领原型 | 定位与原生机制 | 首领额外生命 | 额外攻击力 | 额外移速 | 额外护甲 |
| --- | --- | --- | --- | --- | --- |
| 冰硅甲虫 | 低矮重甲，自卫反击；耐久较高、移动较慢 | +55～70% | +4～8% | +4～9% | +20 |
| 氨泉掠食者 | 氨泉跃击、远程与近战、毒素；机动追猎 | +25～40% | +8～12% | +20～25% | 无 |
| 托林寄生探测器 | 保留勘探设备的远程压制，抗击退较高 | +35～50% | +6～10% | +6～11% | +12 |
| 托林织体蛛 | 跃击与毒素，近距离追击 | +35～50% | +6～10% | +12～17% | +8 |

生命、移速为 `MULTIPLY_TOTAL`，攻击力为 `MULTIPLY_BASE`，护甲与抗击退为 `ADDITION`。这些修正叠加在现有 S5 模板和玩家难度上，不把原版几十点生命直接作为最终数值。攻击力修正只影响原生攻击逻辑实际读取攻击属性的部分；没有改写原模组技能。

装备载体复用已注册的 `#the_end` 池，附魔参数 `[64,64,32,16]`；战利品继续走现有首领掉落转换脚本，不引入阶段之后的新装备。自然入侵配置追加 `titan_moon:titan|0.03|NEEDS_SURFACE`，即通过原模组对应检查时使用 3% 的替换概率，继续沿用每维度 3600 tick 冷却。词缀转换范围与宝石范围分别明确为 `rare～mythic`、`epic～ancient`，与现有 S5 配置保持一致。

首领资源 ID：

```text
sdbf:titan/titan_moon_cryo_scavenger
sdbf:titan/titan_moon_ammonia_stalker
sdbf:titan/titan_moon_corrupted_probe
sdbf:titan/titan_moon_tholin_weaver
```

## 珍珠与固定奖励总量

三种均只能在土卫六开启。下表合计包括各波奖励与额外通关奖励，不包括怪物本身和其他脚本产生的掉落。

| 珍珠 | 波次 / 神话首领数 | 耀魂铁锭 | 耀魂宝珠 | 神铸珍珠 | 玄奥沙 | 宝石尘 | 随机星图碎片 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 托林巢潮 `sdbf_titan_g1` | 5 波 / 1 只 | 8 | 14 | 2 | 8 | 2 | 0 |
| 失控勘探 `sdbf_titan_g2` | 8 波 / 2 只 | 12 | 28 | 4 | 12 | 3 | 1 |
| 极地猎场 `sdbf_titan_g3` | 4 波 / 4 只 | 12 | 28 | 6 | 8 | 4 | 1 |

耀魂按 SG 同档门完整通关总量乘 1.2、逐类四舍五入；G1 对齐 SG 五波门，G2/G3 对齐 SG 十波门。奖励数据已集中到 `s5_0_gateway_helpers.js`，与深四对应档共用。宝石池与深四的新设计见[土卫六与深四更新说明](titan-deep4-gateways-gems-2026-11-02.md)。

对应物品：耀魂铁锭 `slashblade:proudsoul_ingot`，宝珠 `slashblade:proudsoul_sphere`，神铸珍珠 `apotheosis:mythic_material`，玄奥沙 `apotheosis:epic_material`。神铸珍珠集中在后期波次和通关奖励，普通波次主要发铁锭与玄奥沙。星图只在远征和猎场完整通关时抽取一次，使用既有随机星图池。

额外本地材料：

- 托林巢潮：陨铁锭 14、冰晶甲壳 12、托林纤维 12。
- 失控勘探：陨铁锭 12、精密电子元件 8、废弃高能电池 8、多磷腈辅酶 2。
- 极地猎场：冰晶合金锭 4、氮质体膜片 2。

## 波次设计

### 托林巢潮：小型、材料清剿

| 波次 | 敌人 | 额外生命 / 攻击 | 时限 |
| --- | --- | --- | --- |
| 1 | 托林织体蛛 3、氨泉掠食者 2 | +0% / +0% | 110 秒 |
| 2 | 托林织体蛛 4、冰硅甲虫 2 | +5% / +2.5% | 120 秒 |
| 3 | 氨泉掠食者 3、托林织体蛛 3 | +10% / +5% | 130 秒 |
| 4 | 托林织体蛛 4、氨泉掠食者 3、冰硅甲虫 2 | +15% / +7.5% | 140 秒 |
| 5 | 神话托林织体蛛 1 | +25% / +5% | 160 秒 |

### 失控勘探：中型、混编远征

| 波次 | 敌人 | 额外生命 / 攻击 | 时限 |
| --- | --- | --- | --- |
| 1 | 寄生探测器 3、氨泉掠食者 2 | +10% / +2.5% | 120 秒 |
| 2 | 寄生探测器 4、托林织体蛛 2 | +15% / +2.5% | 130 秒 |
| 3 | 寄生探测器 4、氨泉掠食者 3 | +20% / +5% | 140 秒 |
| 4 | 神话寄生探测器 1 | +25% / +5% | 160 秒 |
| 5 | 寄生探测器 4、托林织体蛛 3、冰硅甲虫 2 | +30% / +7.5% | 150 秒 |
| 6 | 寄生探测器 5、氨泉掠食者 3 | +35% / +7.5% | 160 秒 |
| 7 | 寄生探测器 5、托林织体蛛 3、氨泉掠食者 2 | +40% / +10% | 170 秒 |
| 8 | 神话寄生探测器 1、氨泉掠食者 2 | +50% / +10% | 200 秒 |

### 极地猎场：大型、神话首领连战

| 波次 | 神话首领 | 额外生命 / 攻击 | 时限 |
| --- | --- | --- | --- |
| 1 | 冰硅甲虫 1 | +25% / +5% | 160 秒 |
| 2 | 托林织体蛛 1 | +40% / +7.5% | 180 秒 |
| 3 | 寄生探测器 1 | +55% / +10% | 200 秒 |
| 4 | 氨泉掠食者 1 | +75% / +12.5% | 220 秒 |

波次攻击百分比采用 `multiply_base`，与首领的攻击百分比按同类运算累加；生命采用 `multiply_total`。所有波次另有 +5% 移速。普通波次准备 4 秒，首领波次准备 6 秒。波次最多同时生成 10 只怪，避免用密集怪海堆叠 S5 的高生命模板。

## 合成

全部使用既有 `gateways:gate_pearl` 加 `gateway` NBT，配方图案为 `ABA / BCB / ABA`，每次生成一颗。

| 珍珠 | A ×4 | B ×4 | C ×1 |
| --- | --- | --- | --- |
| 托林巢潮 | `titan_moon:cryo_carapace` | `titan_moon:tholin_fibre` | `slashblade:proudsoul_sphere` |
| 失控勘探 | `titan_moon:cryo_alloy_ingot` | `titan_moon:precision_components` | `slashblade:proudsoul_crystal` |
| 极地猎场 | `titan_moon:cryo_alloy_ingot` | `apotheosis:mythic_material` | `slashblade:proudsoul_crystal` |

入门珍珠需要先取得本地生物材料，后两种需要冰晶合金，避免在到达土卫六前直接用低阶段通用材料量产。

## 更新文件与验证

服务端更新以下文件：

1. `kubejs/server_scripts/enemy/boss/s5_titan_bosses.js`（新增）。
2. `kubejs/server_scripts/enemy/gateways/s5_titan_gw.js`（新增）。
3. `kubejs/server_scripts/enemy/gateways/limit_gateway_dimension.js`。
4. `kubejs/server_scripts/recipes/s5_titan.js`。
5. `config/apotheosis/adventure.cfg`。
6. `kubejs/server_scripts/enemy/gateways/s5_0_gateway_helpers.js`（新增且必需）。
7. `kubejs/data/apotheosis/gems/twilight/forest.json`。
8. `kubejs/data/apotheosis/gems/twilight/queen.json`。

客户端另同步 `kubejs/assets/kubejs/lang/zh_cn.json` 与 `en_us.json`。单人实例需要全部文件。没有改动模组 JAR。完整重启以加载 Apotheosis 配置；只执行 `/reload` 不足以更新自然入侵配置。

离线检查命令：`node docs/tools/test_titan_gateways.cjs`。实际执行首领生成脚本、传送门注册回调、配方和维度拦截回调，验证四个首领引用、全部物品 ID、三套配方与中文名称、每种珍珠的波次及固定奖励合计、维度限制和配置条目。物品 ID 及玄奥沙的中文名从已安装模组 JAR 核对。

已通过 355 项土卫六检查；另通过 2,533 项土卫六/深四联合检查。未启动完整游戏进行战斗测试；个体最终属性、远程技能伤害和实战时限仍需在服务器中体验确认。
