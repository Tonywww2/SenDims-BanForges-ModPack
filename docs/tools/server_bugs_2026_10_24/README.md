# 2026-10-24 服务端 HotAI 修复

目标版本：Minecraft 1.20.1，FluxOfTetra 6.9.0-1.0.5，Riichi Mahjong Forge 0.2.0，HotAI 1.0。保留当前 Forge 版本，无须更换模组 JAR。

`PatchServerBugs.java` 从现有模组提取类，核对原始类 SHA-256 后生成四个替换类。补丁保留原始 Java 17 字节码版本。

## 修改

- `TetraFEStore.deserializeNBT` 只读取非负能量值并使容量缓存失效，不在能力附加期间查询 Tetra 能力。首次查询容量时将能量限制在容量内；提取能量前也先完成容量查询，防止旧存档的超容量值被提取。正常充放电、NBT 键名和数据格式不变。
- `MahjongTableBlockEntity` 的玩家数据保存循环，以及 `serverTick` 的两个玩家循环，改用 `driver.match().playerCount()`。牌桌的四个物理座位和 136 格内部物品栏继续按原结构保存。
- v2：确认结算并推进 driver 后，若进入 `MatchEnded`，清理结算状态并调用原有 `endGame()` 返回空闲；普通右键也能恢复已经停在 `GAME + MatchEnded` 的牌桌。普通换局和未结束的对局不触发清理。
- v3：新增 `MahjongTableBlock` 补丁，将中央扳手交互放到原 `GAME` 提前返回之前；`MahjongTableBlockEntity.onCuteClick` 同样接入扳手菜单入口。已结束的牌桌恢复空闲并打开物品栏；最后一手等待确认时先用独立随机数推演真实不可变 Match，仅在确认后会结束整场时实际确认。仍在对局/动画中的扳手给出提示，普通单局不会被提前结束。非扳手模型点击可确认已完成的结算。

## 构建与验证

新增的成就修复针对 `MahjongWinEffects`：普通役与具体役满列表分别交给原有成就判定，并沿用其首次完成去重逻辑；补齐地和、一杯口、自风、场风、一气通贯、七对子的六个内部名称映射。详见 [役满成就修复记录](../../development/SDBF-麻将役满成就修复-2026-10-24.md)。

从整合包根目录执行：

```powershell
& .\docs\tools\server_bugs_2026_10_24\Build-And-Test.ps1
```

脚本参数可覆盖 `MinecraftRoot`、`JavaBin`、`PrismLibraries`、`BuildRoot`。默认输出为 `docs/archive/server-bugs-2026-10-24/release/hotai/`。脚本不会自动安装，也不会启动 Minecraft。

依赖本机现有的 ASM 9.9.1、Guava 31.1、ModLauncher 10.0.9、SLF4J，以及上述麻将和 HotAI JAR。没有下载外部二进制。

`TestServerBugs.java` 执行原始及修补后方法的字节码，而不是重写同一段逻辑进行自测。Minecraft 边界对象使用测试替身；Guava 缓存、麻将核心 Match/Driver 和 HotAI 转换器使用真实库。

当前共 1016 项断言通过：`TestServerBugs` 的 80 项、`TestMahjongInteractions` 的 117 项，以及 `TestMahjongAdvancements` 的 819 项。其中原有 80 项包含最初版本的 55 项：

- 原始能量类复现同 UUID 缓存的 `Recursive load`，补丁后可完成能力附加并保留能量。
- 覆盖 NBT 保存/重读、负值/超容量、容量缓存刷新、充放电和模拟调用。
- 原始麻将类在三人局保存与 tick 时均复现 `Index 3 out of bounds for length 3`。
- 修补后的三人局、四人局均完成保存、100 次完整 `serverTick` 和再次保存；两个 tick 循环正确访问每名实际玩家，四个物理座位、玩家数据、物品格位置及游戏元数据保留。
- 空闲牌桌的空 driver 分支通过。
- 四个类通过实际 HotAI `.class → .badiff → 再加载` 往返，重建字节码一致；生成及测试均开启 JVM 字节码校验。
- v2 新增 25 项：真实麻将核心复现负点数结束整场后牌桌仍停在 `GAME`，且旧右键无法恢复；三人/四人新版均可确认结算、返回空闲、通过原 `tryStartMatch` 重新开局，保留座位及牌桌物品。普通换局、进行中右键、结算动画未完成、已有卡住状态及空 driver 分支均通过。
- v3 的 117 项交互断言：执行实际 `Block.use` 和 `onCuteClick` 字节码，复现 v2 扳手被消费、模型入口绕过恢复；三人/四人终局、待确认的被飞终局、空闲桌均正确请求打开菜单，并可使用原方法切换人数后重新开局。进行中、普通结算、动画中的扳手仅提示，不推进现有对局；方块边缘与客户端分支也有覆盖。该测试从原模组重建 v2，并核对历史 SHA-256，不再依赖旧 ZIP。
- 成就修复的 819 项断言：执行实际牌桌结算 → WinEffects → awardForWin → grant 调用链。复现原版大三元/国士无双仅授予通用役满；验证全部 13 个核心役满枚举和 30 个普通役枚举的成就 ID、三人/四人每个获胜位置、重复奖励去重、多重役满、多名赢家、离线玩家、流局和累计役满。读取实际数据文件校验条件与证书奖励映射，Minecraft 成就保存与奖励发放边界使用替身。

这些测试覆盖相关方法及 HotAI 转换流程，Minecraft 网络发送和 GUI 等边界使用替身，不等同于完整 Forge 模组环境或远程服实测。最终仍须在远程服检查登录、正常重启后的物品保留，以及麻将物品栏/设置实际显示、切换模式和开局。

## 版本指纹

| 目标类 | 原始 SHA-256 | 补丁 SHA-256 |
| --- | --- | --- |
| `net/yiran/fot/common/TetraFEStore.class` | `d8d573e4b67f6f0606b6efd6c32cbd00a9af51e32f4ca06de7f1a9348e627a4a` | `88b1cbbd16e572bc5a73d8bd163e20abd65dd6c83020a47761e12c07e2dc63de` |
| `com/riichimahjongforge/mahjongtable/MahjongTableBlockEntity.class`（v3） | `b1d8850bbde9e05b2d52f5d406bdca2c09a12f485ce473f32d2be2305b594118` | `1c7b7201ccbe752efb80cda47e356d7fb1db229693a5864e7750b7a0293e8a58` |
| `com/riichimahjongforge/mahjongtable/MahjongTableBlock.class`（v3） | `ae90974e6c12953abd2258d98e437bfe5395614d72132c411b02adc226d4a323` | `aa15fd18dfd5943495dd650655605ad8d5f43eafe3f1a284e8f9939e4e77135f` |
| `com/riichimahjongforge/mahjongcore/MahjongWinEffects.class` | `e015e7cbc66139b4df7c2573341e65add8741201b5a5f0bb9f9788eb630afa82` | `ba18ffe0387aaca46ca4fbb142ef55644b6fa966a5fb1b61d691c072a3f4f212` |

v1 麻将类的 SHA-256 为 `10f2cb3c55622df4188af2f983391cab069bfa651452378fa9d29ee70b794247`，只修复三人局越界。v2 为 `b27ba698a6f2c1dec0fe6921597bb188624960254bc20f8dcce4895cabe78ad6`，补上整场结束清理。当前麻将包为 [SDBF-Mahjong-HotAI-2026-10-24-v3.zip](../../releases/SDBF-Mahjong-HotAI-2026-10-24-v3.zip)，同时更新两个麻将类，包含全部既有麻将修复。FluxOfTetra 补丁未改变，也未打入麻将更新包。

## 安装、更新与回退

[成就增量包](../../releases/SDBF-Mahjong-Advancements-HotAI-2026-10-24.zip) 只包含 `MahjongWinEffects`，与原 v3 同时使用；本次前三个补丁类的字节码未改变。已经错过的成就不会追溯发放，针对用户确认的两项成就的补发命令见包内说明。

将发布包中的 `hotai/` 合并进服务端根目录现有 `hotai/`，保留其他补丁。停止服务端后安装，然后完整重启；`/reload` 不会加载字节码补丁。v3 的两个麻将类必须一起更新，新 Block 调用新 BlockEntity 方法。当前整合包也可安装，重启客户端后生效；联机修复的关键仍是服务端安装。

同一目标类已有旧 `.badiff` 时，先备份到整个 `hotai/` 目录之外并移走该旧文件，再放入新 `.class`，避免两种补丁同时存在。首次启动后 `.class` 被 HotAI 转为 `.badiff` 属正常现象。回退时只移除对应目标类的 `.class` / `.badiff`，恢复需要的旧版并重启。

模组升级后必须重新核对原始类并重新测试，不能沿用本包。补丁防止此处加载失败，不能从已经保存为空的物品栏恢复物品；恢复需要丢失前的玩家数据或世界备份。
