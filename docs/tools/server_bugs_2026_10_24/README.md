# 2026-10-24 服务端 HotAI 修复

目标版本：Minecraft 1.20.1，FluxOfTetra 6.9.0-1.0.5，Riichi Mahjong Forge 0.2.0，HotAI 1.0。保留当前 Forge 版本，无须更换模组 JAR。

`PatchServerBugs.java` 从现有模组提取类，核对原始类 SHA-256 后生成两个替换类。补丁保留原始 Java 17 字节码版本。

## 修改

- `TetraFEStore.deserializeNBT` 只读取非负能量值并使容量缓存失效，不在能力附加期间查询 Tetra 能力。首次查询容量时将能量限制在容量内；提取能量前也先完成容量查询，防止旧存档的超容量值被提取。正常充放电、NBT 键名和数据格式不变。
- `MahjongTableBlockEntity` 的玩家数据保存循环，以及 `serverTick` 的两个玩家循环，改用 `driver.match().playerCount()`。牌桌的四个物理座位和 136 格内部物品栏继续按原结构保存。
- v2：确认结算并推进 driver 后，若进入 `MatchEnded`，清理结算状态并调用原有 `endGame()` 返回空闲；普通右键也能恢复已经停在 `GAME + MatchEnded` 的牌桌。普通换局和未结束的对局不触发清理。

## 构建与验证

从整合包根目录执行：

```powershell
& .\docs\tools\server_bugs_2026_10_24\Build-And-Test.ps1
```

脚本参数可覆盖 `MinecraftRoot`、`JavaBin`、`PrismLibraries`、`BuildRoot`。默认输出为 `docs/archive/server-bugs-2026-10-24/release/hotai/`。脚本不会自动安装，也不会启动 Minecraft。

依赖本机现有的 ASM 9.9.1、Guava 31.1、ModLauncher 10.0.9、SLF4J，以及上述麻将和 HotAI JAR。没有下载外部二进制。

`TestServerBugs.java` 执行原始及修补后方法的字节码，而不是重写同一段逻辑进行自测。Minecraft 边界对象使用测试替身；Guava 缓存、麻将核心 Match/Driver 和 HotAI 转换器使用真实库。

当前 v2 共 80 项断言通过，包含最初版本的 55 项：

- 原始能量类复现同 UUID 缓存的 `Recursive load`，补丁后可完成能力附加并保留能量。
- 覆盖 NBT 保存/重读、负值/超容量、容量缓存刷新、充放电和模拟调用。
- 原始麻将类在三人局保存与 tick 时均复现 `Index 3 out of bounds for length 3`。
- 修补后的三人局、四人局均完成保存、100 次完整 `serverTick` 和再次保存；两个 tick 循环正确访问每名实际玩家，四个物理座位、玩家数据、物品格位置及游戏元数据保留。
- 空闲牌桌的空 driver 分支通过。
- 两个类通过实际 HotAI `.class → .badiff → 再加载` 往返，重建字节码一致；生成及测试均开启 JVM 字节码校验。
- v2 新增 25 项：真实麻将核心复现负点数结束整场后牌桌仍停在 `GAME`，且旧右键无法恢复；三人/四人新版均可确认结算、返回空闲、通过原 `tryStartMatch` 重新开局，保留座位及牌桌物品。普通换局、进行中右键、结算动画未完成、已有卡住状态及空 driver 分支均通过。

这些测试覆盖相关方法及 HotAI 转换流程，不等同于完整 Forge 模组环境或远程服实测。最终仍须在远程服检查登录、正常重启后的物品保留，以及三人/四人麻将开局。

## 版本指纹

| 目标类 | 原始 SHA-256 | 补丁 SHA-256 |
| --- | --- | --- |
| `net/yiran/fot/common/TetraFEStore.class` | `d8d573e4b67f6f0606b6efd6c32cbd00a9af51e32f4ca06de7f1a9348e627a4a` | `88b1cbbd16e572bc5a73d8bd163e20abd65dd6c83020a47761e12c07e2dc63de` |
| `com/riichimahjongforge/mahjongtable/MahjongTableBlockEntity.class`（v2） | `b1d8850bbde9e05b2d52f5d406bdca2c09a12f485ce473f32d2be2305b594118` | `b27ba698a6f2c1dec0fe6921597bb188624960254bc20f8dcce4895cabe78ad6` |

v1 麻将类的 SHA-256 为 `10f2cb3c55622df4188af2f983391cab069bfa651452378fa9d29ee70b794247`，只修复三人局越界。新版麻将增量包为 [SDBF-Mahjong-HotAI-2026-10-24-v2.zip](../../releases/SDBF-Mahjong-HotAI-2026-10-24-v2.zip)，包含此前的越界修复及此次整场结束修复。FluxOfTetra 补丁未改变。

## 安装、更新与回退

将发布包中的 `hotai/` 合并进服务端根目录现有 `hotai/`，保留其他补丁。停止服务端后安装，然后完整重启；`/reload` 不会加载字节码补丁。当前整合包也可安装这两个类，重启客户端后生效；联机修复的关键仍是服务端安装。

同一目标类已有旧 `.badiff` 时，先备份到整个 `hotai/` 目录之外并移走该旧文件，再放入新 `.class`，避免两种补丁同时存在。首次启动后 `.class` 被 HotAI 转为 `.badiff` 属正常现象。回退时只移除对应目标类的 `.class` / `.badiff`，恢复需要的旧版并重启。

模组升级后必须重新核对原始类并重新测试，不能沿用本包。补丁防止此处加载失败，不能从已经保存为空的物品栏恢复物品；恢复需要丢失前的玩家数据或世界备份。
