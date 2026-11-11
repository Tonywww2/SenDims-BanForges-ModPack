# UTF 与 C2MEF 实施阶段报告

2026-11-10 后续调整。按用户确认，层状洞穴恢复开启并降频至 0.1，使用 HotAI 将开挖范围限制到约 Y=52 以下，并加厚表层保护到 12 格。截图附近的突兀雪带主要对应 Terralith 岩石山脉的三个强制铺雪地物，通过 KubeJS data 群系修正移除。源码、存档采样和验证记录见 `docs/maintenance/utf-layer-snow-2026-11-10.json`。11/08 补丁包已同步。

2026-11-10 截图反馈调整。以当前已开启 UTF 群系地物的配置为基线，修改 8 项地表、洞穴和河流参数。关闭坡面侵蚀与层状洞穴，提高大洞穴表层密度阈值，降低冰川洞穴频率与崖底掏空强度，河流采用海平面水位并加宽河岸过渡。三份预设和原生生成的噪声及地表规则已同步，11/08 补丁包已更新。完整清单与源码依据见 `docs/maintenance/utf-terrain-2026-11-10.json`。本次采用原生数据生成和静态校验，视觉效果待新生成区块确认。

2026-11-10 追加记录。按用户反馈，将 29 项地形参数恢复到 UTF 1.0.3 默认值，同步两份配置预设和 KubeJS 实际生成预设。保留 Y=-64～319。随后按用户要求开启 `customBiomeFeatures=true`，原生导出并补充 179 个树木、灌木、草丛与配套资源，其中包含 17 个原版树木和圆盘地物替换定义。TerraBlender/RU 兼容按模组自动启用，矿石兼容选项为 true。11/08 补丁包同步更新。原调参配置已备份至 `.sdbf-backups/utf-default-2026-11-10/`，默认地形恢复清单见 `docs/maintenance/utf-default-2026-11-10.json`，群系地物启用清单见 `docs/maintenance/utf-features-2026-11-10.json`。两份大型云杉地物定义的 10 个模板路径已修正为 JAR 中实际文件名。以下性能和视觉数据对应 11/09 的调参方案。

2026-11-09。按用户要求停止剩余对照和重测，汇总截至停止时的结果。随后按用户授权应用到整合包，并合并进 11/08 补丁包。本次部署只做文件和压缩包校验。

## 当前状态

- 所有测试控制器已停止，最后一台测试服务端已执行原生 `stop`，日志确认所有维度保存完成，进程已退出。
- 已将 76 个运行文件应用到主整合包，包含 UTF、C2MEF、配置、KubeJS 生成数据和两个 HotAI 补丁。
- 已移除主目录中的 Tectonic JAR 和配置。部署文件和 SHA-256 见同目录下 `utf-migration-2026-11-09/deployed-files.json`。
- 陆地区域补充对照、旧 A 首轮重测、B 客户端帧率重测已取消。测试结果与局限保留在本报告中。
- 11/08 补丁包合并后共 85 个运行文件，包含原有 9 个文件及本次新增 76 个文件，安装脚本同步更新删除清单。
- 已清理测试实例、测试存档、JFR、编译产物和下载缓存。保留本报告、精简统计、报告插图、工具源码与回滚备份。

## 候选实现

| 项目 | 实现 |
| --- | --- |
| 世界高度 | `worldHeight=320`、`worldDepth=64`，有效范围 Y=-64～319，共 384 层 |
| UTF | UltraTerraForged 1.0.3，1.20.1 Forge |
| C2MEF | 用户指定项目的 9.9.6 |
| 默认新档入口 | SkyblockBuilder |
| 生成数据 | UTF 原生导出后筛选，68 个 KubeJS 数据资源 |
| 并行度 | 一半逻辑核心，最多 4，最少 1 |
| C2MEF 配置 | `gcFreeChunkSerializer=false`、`noTickViewDistance.enabled=false` |
| SLO | 三组共同使用现有 1.0.11 |
| HotAI | 新增 ZGC 计时修复、自动保存死锁修复 |

UTF 调整了 31 项参数。大陆尺度由 3000 提高到 4800，地形分区由 1200 提高到 1600，水平尺度为 1.25，群系尺度由 225 提高到 300。同时加宽主河道和河岸，扩大湖泊与大陆架，减少碎岛，提高巨型洞室、层状洞穴及地下河的频率。

源预设与导出的 KubeJS 数据需要一起更新。SkyblockBuilder 新档使用导出的固定生成定义。

导出筛选排除了 12 项共享覆盖，包括原版树木、部分共享地物和 carver，以及缺少维度限定的沼泽表面修改。当前外部资源扫描未发现必须由 Tectonic 提供的引用。

## 固定坐标生成性能

测试机器为 i7-13700K、24 个逻辑核心、约 31.7 GiB 内存。专用服务端使用 Forge 47.4.10、Java 21、12 GiB 堆上限和分代 ZGC。各组顺序运行。

每轮通过 Chunky 请求生成 16,129 个 FULL 区块，中心为 `(16384,16384)`，方形半径 1000。计时覆盖全部请求完成，并另外检查保存退出。

| 种子 | A 旧 Tectonic | B UTF | C UTF＋C2MEF |
| --- | ---: | ---: | ---: |
| 20261107 | 911.9 秒，因内存压力剔除 | 244.4 秒 | 87.0 秒 |
| 1111 | 667.2 秒 | 289.9 秒 | 132.3 秒 |
| 2222 | 701.5 秒 | 298.7 秒 | 128.2 秒 |
| 有效样本数 | 2 | 3 | 3 |
| 有效耗时中位数 | 684.3 秒 | 289.9 秒 | 128.2 秒 |
| 有效吞吐中位数 | 23.58 区块/秒 | 55.63 区块/秒 | 125.85 区块/秒 |

两个可配对的有效种子中，UTF 的吞吐为旧配置约 2.30～2.35 倍，UTF＋C2MEF 约为 5.04～5.47 倍。B、C 使用相同 UTF 生成参数。

这些倍率适用于本次固定坐标测区。第一个种子的实际存档中，UTF 测区约 99.36% 为海面，旧配置约 45.40%。地形改变会改变相同坐标的生成工作量。陆地补充对照尚未完成，因此整包陆地探索的通用加速幅度仍待确定。

A 首轮有 287 次采样的系统可用内存低于 1 GiB，其中 103 次低于 512 MiB。该轮时间已从最终统计剔除。此前汇报的 A 中位数约 701 秒包含此轮，当前表格已更新。

![有效生成吞吐](C:/Users/Tony/AppData/Roaming/PrismLauncher/instances/SenDimsBanForges/minecraft/docs/development/utf-migration-2026-11-09/throughput.png)

## 内存与存储

按用户最新要求，每组只做一轮正式内存采样。直接请求 64 个 FULL 新区块，闲置 4 分钟后执行 GC，再等待 5 秒读取堆占用。实际生成过程会附带相邻区块。

| 项目 | A 旧配置 | B UTF | C UTF＋C2MEF |
| --- | ---: | ---: | ---: |
| GC 后 Java 堆占用 | 2.56 GiB | 2.67 GiB | 2.72 GiB |
| 采样时已加载 FULL 区块 | 0 | 0 | 0 |
| 首个种子主世界 region 文件 | 257.39 MiB | 292.92 MiB | 286.97 MiB |
| 对应已保存 FULL 区块 | 16,381 | 16,381 | 16,363 |

内存数据来自无人在线的专用服务端。它反映单次生成、卸载后的堆留存。持续增长和长时间泄漏的结论需要时间序列采样。

存储数据包含请求区外的附带区块及不同阶段的邻区块。它反映该区域的实际磁盘结果，不能直接换算整张地图的固定增幅。三组的有效高度范围均为 384 层，本次也没有进行 UTF 512 上限的存储对照。

## 兼容性和保存检查

- 原生运行检查覆盖 43 个维度，每个维度实际生成区块。UTF 上下文只绑定 `minecraft:overworld` 和 `minecraft:the_overworld`。
- 深四、里末地、小行星带及其他阶段维度保留各自的生成器和高度定义。
- A/B/C 分别保存并重开，检查 17 个固定区块。方块、群系、结构、方块实体、Forge 附加数据和计划刻内容保持一致。
- 光照缓存重建单独记录。原 A 检查还出现了仅含光照信息的空顶部 section，已与方块和群系内容分开处理。
- 单人原生客户端的新队伍建岛、入队、回岛均通过，实测高度上界为 320。
- 四种模板的静态高度检查通过。放置基准 Y=300 时，`spawn_island` 顶部为 310，`classic_moss` 和 `otto` 为 308，`small_flat` 为 306。
- 死亡重生和其余模板的逐项交互回归尚未完成。

不同新世界生成顺序下，B/C 存档存在装饰、方块实体随机内容和部分生成结果差异。现有检查区分新生成差异与保存重开后的内容完整性。

## 视觉与地下生成

宏观采样显示，UTF 将陆地组织成更连续的大型陆块，旧配置的高地更零碎。该样本中 UTF 最高采样点约 Y=198，旧配置约 Y=303。宏观 UTF 高度使用侵蚀前数据近似，实际保存区块高度图另有归档。

固定地下气候采样中，特色洞穴群系命中数由 7,894/25,350 提高到 10,010/25,350，相对提高约 26.8%。该指标描述气候分配命中率。

RU 的 `redstone_caves`、`bioshroom_caves`、`ancient_delta`、`scorching_caves`、`prismachasm` 均找到了实际可通行的空气位置。游戏截图确认了对应地下装饰。

当前数据尚未证明整体洞穴空腔体积提高。固定海域内的实际空腔采样比例较低，地形与群系分布差异需要结合区域解读。

![UTF 地下群系实景](C:/Users/Tony/AppData/Roaming/PrismLauncher/instances/SenDimsBanForges/minecraft/docs/development/utf-migration-2026-11-09/C-cave-matched.png)

三组客户端均完成了 90 次、每次推进 16 格的探索路线，实际推进距离 1,424 格。路线耗时分别约为 103、99、91 秒，传送命令均成功。

B 组原始路线只有约 34% 的采样窗口保持前台，其余受到 ModernUI 后台 30 FPS 限制，因此 B 帧率已排除出模组性能比较。A/C 路线均为前台。原定 B 重测已按用户要求取消。

固定等待时间的地表截图也包含区块加载进度差异。A 山顶截图仅显示山尖，B 部分地表尚未加载完整，C 显示的周边地形更完整。这些照片用于核对生成与加载情况，宏观造型对照同时参考存档高度图。

## 两个 HotAI 修复

### ZGC 自适应计时

`AdaptiveWorldGenController.totalGcMillis()` 原逻辑累计全部 GC MXBean 时间。分代 ZGC 的并发 Cycles 被计入后，曾得到约 129% 的 GC 压力估计，使生成进料被错误压低。

补丁排除 ZGC 的并发 Cycles 计时，保留 Pauses 和其他 GC 的原有计时。已通过分代 ZGC、普通 ZGC、G1 和不支持计时的定向用例，以及 HotAI 转换、重启应用和真实运行验证。

### 自动保存死锁

第三个种子的原 C 测试在约 90% 时阻塞。两份线程转储显示，服务端在持有脏区块保存队列锁时序列化区块，触发星门/DHD 初始化并同步等待邻区块。四个 C2ME 工作线程同时等待同一队列锁，完成回调无法推进。

补丁将保存操作与 Future 完成回调注册移到队列锁之外，仅在选择和移除队列项时持锁。同时在移除 fastutil 迭代项前复制 key。已验证保存、延期、重新入队、延迟规则、异常路径和 HotAI 重启应用。修复后三个种子的 C 组均完整生成、保存并退出。

两个补丁均绑定当前 C2MEF 9.9.6 JAR，其 SHA-256 为 `e73681883b2c867049800f8b2f7bdcbbbda6c9a44eb5e165c0513914364abfc6`。

## 文件清单与交付状态

已部署的 76 个文件包括以下内容。

- 2 个模组 JAR，UTF 与 C2MEF，部署目标为 `mods/`。
- 4 个配置文件，`config/c2me.toml`、`config/ultraterraforged/modpack.json`、`config/ultraterraforged/server-preset.json`、`config/ultraterraforged/modpack-presets/SDBF_Continental.json`。
- 68 个 `kubejs/data/` 资源，包含实际生效的导出预设、主世界噪声、密度函数及相关定义。
- 2 个 HotAI 文件，分别为 `AdaptiveWorldGenController.badiff` 和 `MixinThreadedAnvilChunkStorage.badiff`，保留完整包路径。

已删除 `mods/tectonic-3.0.17-forge-1.20.1.jar` 和 `config/tectonic.json`。完整部署路径与 SHA-256 保存在 `utf-migration-2026-11-09/deployed-files.json`。

更新包位于 `docs/releases/SDBF-Update-2026-11-08.zip`。本次地形迁移面向新存档，客户端和服务端均应用包内文件，并通过 SkyblockBuilder 新建存档。

本地回滚文件保存在 `.sdbf-backups/utf-migration-2026-11-09/`。11/08 合并前的压缩包保存在 `docs/releases/backups/utf-migration-2026-11-09/`。部署和清理记录位于 `docs/maintenance/utf-migration-deployment-2026-11-09.json`。

## 数据位置

精简统计与报告插图位于 `docs/development/utf-migration-2026-11-09/`。测试世界、JFR、逐轮原始日志及中间结果已按要求清理。11/07 原有 Spark 资料与研究汇总保留在原调查归档中。

| 文件 | 内容 |
| --- | --- |
| `formal-summary.json` | 质量筛选后的 8 个有效计时样本 |
| `client-memory-summary.json` | 客户端路线和单轮 GC 数据，标明 B 帧率排除原因 |
| `storage-summary.json` | 实际 MCA 存储、矿物和地下采样统计 |
| `generation-differences-summary.json` | B/C 新生成结果差异汇总 |
| `roundtrip-summary.json` | 三组保存重开校验汇总 |
| `template-height-audit.json` | 四种空岛模板的静态高度边界 |
| `export-resource-policy.json` | UTF 导出资源保留和排除规则 |
| `c2me-gc-patch-verification.txt`、`c2me-autosave-patch-verification.txt` | 补丁类哈希和定向验证记录 |
| `deployed-files.json` | 实际部署的 76 个文件和删除清单 |
| `throughput.png`、`C-cave-matched.png` | 报告使用的统计图与原生截图 |
