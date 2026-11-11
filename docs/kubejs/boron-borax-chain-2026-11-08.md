# 硼砂湿法提硼（可选获取方式）

日期：2026-11-08
状态：已实现（KubeJS：流体在 `reg.js`，配方在 `nc.js`），待游戏内验证

## 目标

给硼增加一条**可选**获取路线，不动原有硼矿（`nuclearcraft:boron_ore` / `boron_deepslate_ore`）主线：
用末地石粉碎得到的**硼砂**，经**熔化机**做成**熔融硼砂**，再和**熔融镍**反应得到**熔融硼**，
最后铸锭 / 结晶成粗硼。

## 链路

```
末地石 --(NC 岩石粉碎机 3:1，原有)--> 硼砂 + 锗
硼砂 --(NC 熔化机)--> 熔融硼砂 (kubejs:molten_borax，新流体)
镍锭 / 镍粉 --(NC 熔化机)--> 熔融镍 (kubejs:molten_nickel，新流体)
熔融硼砂 + 熔融镍 --(NC 化工反应堆)--> 熔融硼 (nuclearcraft:boron)
熔融硼 --(NC 铸锭机 90mB，原有)--> 硼锭
熔融硼 --(NC 结晶器 180mB)--> 粗硼 (nuclearcraft:boron_chunk) --(NC 制造机，原有)--> 2 硼粉
```

镍的来源：`forge:ingots/nickel`（Thermal 的 `thermal:nickel_ingot`、dustandash 等）、
`forge:dusts/nickel`（Thermal），矿脉有 `thermal:nickel_ore` 与 Thermal And Space 各行星镍矿。

> 注意：NuclearCraft 1.20.1 本身没有熔融镍（只有 `nickel_slurry`），所以这里和熔融硼砂一样，
> 由 KubeJS 在 `reg.js` 里注册 `kubejs:molten_nickel`，再用熔化机把镍锭/镍粉熔掉。
>
> 两个新流体都通过 `nc.js` 顶部的 `ServerEvents.tags('fluid', ...)` 打上
> `forge:molten_borax` / `forge:molten_nickel` 标签（沿用 NuclearCraft 自己的 `forge:molten_*`
> 命名习惯），配方里也统一按标签引用，方便别的模组/管线按标签识别。

## 配方数值（都在 `nc.js`）

| 步骤 | 机器 | 输入 | 输出 | power | time |
| --- | --- | --- | --- | --- | --- |
| 熔化硼砂 | `nuclearcraft:melter` | 1x `#forge:dusts/borax` | 180mB 熔融硼砂 | 2.0 | 1.5 |
| 熔化镍锭 | `nuclearcraft:melter` | 1x `#forge:ingots/nickel` | 90mB 熔融镍 | 1.5 | 1.0 |
| 熔化镍粉 | `nuclearcraft:melter` | 1x `#forge:dusts/nickel` | 90mB 熔融镍 | 1.5 | 1.0 |
| 还原 | `nuclearcraft:chemical_reactor` | 360mB 熔融硼砂 + 90mB 熔融镍 | 180mB `#forge:molten_boron` | 4.0 | 3.0 |
| 粗硼 | `nuclearcraft:crystallizer` | 180mB `#forge:molten_boron` | 1x `nuclearcraft:boron_chunk` | 2.0 | 2.0 |

即 **2 硼砂 + 1 镍锭 → 2 硼锭**（1 硼锭 ≈ 3 末地石 + 半块镍矿）。

## 平衡计算

- 原版硼矿：1 矿 → 熔化机 240mB 熔融硼 = **2.67 硼锭**；或王水浸出线 ≈ 2 硼锭。
- 新路线：1 镍矿 → 1 镍锭 → 90mB 熔融镍，配 6 末地石（=2 硼砂）→ **2 硼锭**。
- 也就是每块镍矿换 2 硼锭（约为直接挖硼矿的 75%），另付末地石粉碎与熔化/化工的电力、时间。
- 镍比镁常见（Thermal 主矿 + 行星矿 + 部分模组副产），所以实际体感会比原镁版本更宽松；
  想收紧就把还原配方改成 `360mB 熔融硼砂 + 90mB 熔融镍 → 90mB 熔融硼`（1 镍锭 → 1 硼锭，约 37%）。

## 为什么没有做"硼矿石"产物

曾考虑用熔融硼"浇铸"成 `nuclearcraft:boron_deepslate_ore`，实测不可行：

- 硼矿掉落表（`data/nuclearcraft/loot_tables/blocks/boron_deepslate_ore.json`）非精准采集时
  掉 1 个 `boron_chunk`，并且带 **fortune uniform_bonus_count（bonusMultiplier=1）**。
- 时运 III 平均约 2.5 个碎块 = 5 硼锭；若浇铸成本低于此（例如 240mB=2.67 锭），
  就会形成"造矿 → 时运挖矿"的无限硼漏洞。
- 除非把浇铸成本压到 8 锭以上（纯亏本、只作装饰），否则不做。需要的话可以再加一条
  `fluid_infuser`：1 深层板岩 + 720mB 熔融硼 → 1 硼矿（故意亏本，避免时运套利）。

## 可调旋钮

- **产量**：改 `nc.js` 里还原配方的 `360mB 熔融硼砂 + 90mB 熔融镍 → 180mB 熔融硼`。
  - 收紧：`180mB + 90mB → 90mB`（1 镍锭 → 1 硼锭）。
  - 放宽：`540mB + 90mB → 270mB`。
- **电/时间**：`powerModifier` / `timeModifier` 直接调。
- **替代助熔剂**：这套结构可以换任意熔融金属（铁/铝/镁……），只要改 `inputFluids` 的流体 id。

## 文件

只改现有文件，不新增脚本/数据文件：

| 文件 | 内容 |
| --- | --- |
| `kubejs/startup_scripts/reg.js` | 在原有自定义流体之后追加 `kubejs:molten_borax`、`kubejs:molten_nickel` 两个流体的注册 |
| `kubejs/server_scripts/recipes/tech/nc.js` | 文件最前面是 `ServerEvents.tags('fluid', ...)`（两个 `forge:molten_*` 标签），末尾追加 5 条配方：熔化硼砂、熔化镍锭、熔化镍粉、化工反应堆、结晶器；配方全部按标签引用 |
| `kubejs/assets/kubejs/lang/zh_cn.json`、`en_us.json` | 追加 `fluid/block/item ... molten_borax/molten_nickel` 六条翻译 |

## 验证

1. 启动游戏，`latest.log` 不应出现 KubeJS 报错（流体注册失败会直接刷黄字）；游戏内 `/kubejs errors` 也应为空。
2. 标签：`forge:molten_borax` / `forge:molten_nickel` 由 `nc.js` 顶部的 `ServerEvents.tags('fluid', ...)` 写入
   （不是数据包文件），确认方式：化工反应堆配方能在 JEI 里正常显示并带熔融硼砂/熔融镍图标，
   说明标签解析成功；若标签为空，NC 会在加载时报流体原料为空。
3. JEI 搜索 `熔融硼砂` / `熔融镍`：应能看到熔化机配方；搜 `硼锭` 能看到原有铸锭机配方。
4. 手动跑一遍：末地石 → 岩石粉碎机 → 硼砂 → 熔化机 → 熔融硼砂；
   镍锭 → 熔化机 → 熔融镍；两者进化工反应堆 → 熔融硼 → 铸锭机 → 硼锭；
   再用结晶器验证粗硼 → 制造机 2 硼粉。
5. 检查 `熔融硼砂` / `熔融镍` 的桶/方块图标是否正常（KubeJS 自动生成，缺图标再补 `mcmeta`）。

## 备注

- 这是一条**可选**路线，不影响原有硼矿、铁硼、二硼化镁、Omni 合金等配方。
- 若后续想改成"裂变产物回收"或"核废料洗涤"，可以在这条链旁边再加独立配方，
  与现有的 `forge:molten_nuclear_waste` / `spent_nuclear_waste` 流体衔接。


## 分发

已并入 `docs/releases/SDBF-Update-2026-11-08.zip`（需先安装 2026-11-05 更新包）。
包内 4 个文件，安装脚本逐一校验 SHA-256；客户端与服务端都要安装，流体注册在 `startup_scripts`，
安装后必须完整重启。
