# SDBF Tectonic 替代模组与结构优化调查

整理于 2026-11-09。本文中的实际运行测试完成于 2026-11-07，使用当天保存的整合包隔离副本。

## 结论

两个候选中，优先考虑 UltraTerraForged 1.0.3+1.20.1。它在本包隔离副本中完成了新世界创建与区块生成，具有 TerraBlender 适配，本轮固定路线的耗时也更低。TerraForged Reimagined 0.4.3 同样能运行，但存在 RU 地下群系分类缺口，而且本轮采样中的侵蚀区域计算成本较高。

针对额外数据驱动结构，Structure Layout Optimizer 1.0.11 有直接收益。本包的 `dungeons_arise:keep_kayra` 定点放置测试从 23.767 秒降到 6.140 秒。2026-11-09 复核正式目录时，已经存在相同版本、相同 SHA-256 的 JAR。

本次正式游戏数据变更为禁用 AE2 陨石自然生成。两个地形候选的 JAR 和预设均用于归档中的隔离测试。

## 测试版本与运行方式

| 项目 | 本轮版本或设置 |
| --- | --- |
| Minecraft / Forge | 1.20.1 / 47.4.10 |
| Java | GraalVM JDK 21.0.5 |
| JVM | 4–10 GiB，分代 ZGC |
| UltraTerraForged | 1.0.3+1.20.1 Forge |
| TerraForged Reimagined | 0.4.3 Forge |
| Terralith / RU | 2.5.4 / 0.5.6 |
| TerraBlender | 3.0.1.10 |
| Structure Layout Optimizer | 1.0.11 Forge |

两种地形模组的发布 JAR 元数据均接受本包的 Forge 版本。Reimagined 的发布页说明其构建环境为 Forge 47.4.26，其 JAR 的最低依赖声明为 Forge 47，本轮在 47.4.10 下实际完成测试。UltraTerraForged 的 JAR 声明最低 Forge 47.1。[UltraTerraForged 发布版本](https://github.com/Pandaismyname1/ultraterraforged/releases/tag/1.0.3%2B1.20.1)、[Reimagined Forge 1.20.1 发布版本](https://www.curseforge.com/minecraft/mc-mods/terraforged-reimagined/files/9115420)

全部操作使用命令行。隔离服务端绑定本机回环地址，使用新建世界，无在线玩家。保留本包服务端内容及现有优化模组，去除了之前确认的纯客户端组件。测试先预热 8×8 个区块，再在三个区域各请求 8×8 个 FULL 区块，种子为 `20261107`，共 192 次同步请求。生成依赖会涉及更多邻块。

三个地形分组都移出了测试副本的 Tectonic JAR，关闭 AE2 陨石，保留 Terralith、RU 和其他结构。两个候选分别使用自身的默认预设，服务端世界类型分别为 `ultraterraforged:ultraterraforged` 和 `terraforged:normal`。

## 地形性能实测

| 分组 | 总耗时 | 最长单次请求 | 单次请求中位数 |
| --- | ---: | ---: | ---: |
| 移除 Tectonic，关闭 AE2 陨石 | 38.583 秒 | 4.835 秒 | 110 毫秒 |
| 加入 UltraTerraForged 默认预设 | 14.069 秒 | 2.666 秒 | 29 毫秒 |
| 加入 Reimagined 默认预设 | 57.645 秒 | 11.124 秒 | 55 毫秒 |

相对此轮 38.583 秒的参照，UltraTerraForged 总耗时减少约 63.5%，Reimagined 增加约 49.4%。UltraTerraForged 与 Reimagined 的总耗时相差约 4.1 倍。

这些数字对应一次运行、一个种子、三个小区域。地形生成器改变了同坐标的群系分布。UltraTerraForged 样本以蘑菇岛、海洋和部分高地为主，Reimagined 三片区域的采样群系均为海洋，参照组包括海洋、白桦林和冰刺。这组结果支持优先选择 UltraTerraForged 继续适配，但完整陆地探索的收益仍需更大范围复测。11 月 7 日早先“配置关闭 Tectonic”的旧轮次与本轮“移出 JAR”的参照分开保存，本文的百分比只采用本轮参照。

### 生成器确实生效

- UltraTerraForged 继续使用原版 `NoiseBasedChunkGenerator` 和 `MultiNoiseBiomeSource`。世界预设数据包的最终密度函数引用 `ultraterraforged:overworld/sloped_cheese`，JFR 中也记录到 `UTF-WorldGen-*` 地形线程。该轮生成了对应候选的地形。
- Reimagined 的世界保存和运行时均记录 `terraforged:generator` / `com.terraforged.mod.worldgen.Generator`，群系源为其自身的 `Source`。
- 三组均完成 2700 个被审计依赖区块的保存。两个候选都存在原版、Terralith、ATi、Dungeons Arise 等结构起点。起点记录用于确认结构生成路径参与了运行，完整建筑落地还取决于后续区块阶段。

### Reimagined 的主要耗时

JFR 中 `ErodedNoiseGenerator.buildRegion` 出现在 3633 / 4452 个选定执行样本中，约 81.6%。调用链包含 `TerrainGenerator.generate`、`TerrainCache` 与侵蚀区域生成。该模组按 8×8 区块构建侵蚀区域，并计算周边边界数据。高度查询或新区块进入尚未缓存的区域时会触发这部分工作。

其中位请求时间比参照低，但最长请求达到 11.124 秒，显示缓存命中后的请求和新区域计算的成本差异明显。上述嵌套方法的采样占比不能相加。

UltraTerraForged 的解析同时计入了 `UTF-WorldGen-*` 线程，共 1537 个选定样本，其自己的 tile 生成和过滤链仍占有显著 CPU 时间。本文没有据此推断长期内存占用或内存增长速度。

作者也提供了 UltraTerraForged 的默认预设基准，但其硬件、优化模组组合及工作负载与本包不同，本文采用本包的实测数值。作者测试中的 C2ME、Noisiumed 等组合收益需按对应版本和加载器解释。[作者性能测试说明](https://github.com/Pandaismyname1/ultraterraforged/blob/1.20.1/docs/porting/performance-mods.md)

## 与本包的兼容性

### Terralith、RU 与群系分布

UltraTerraForged 有显式 TerraBlender 适配，使用其区域与地表规则接口。本轮群系源的候选集合包含 94 个 Terralith 群系与 66 个 RU 群系，实际请求区域也出现了这两个模组的群系。作者将 TerraBlender 群系模组列入支持范围。[UltraTerraForged 1.20.1 说明](https://github.com/Pandaismyname1/ultraterraforged/blob/1.20.1/README.md)

Reimagined 按群系注册表、标签及气候分类构造自己的群系池。本轮候选集合包含 99 个 Terralith 群系与 66 个 RU 群系。其 0.4.3 专门修复了 Terralith 数据包覆盖其主世界生成器的问题，本轮运行时也确认了其生成器仍然生效。它保留群系及其地表、结构内容，采用自身地形形状。[Reimagined 0.4.3 更新说明](https://www.curseforge.com/minecraft/mc-mods/terraforged-reimagined/files/9115420)

Reimagined 的分类不直接复用 RU 的 TerraBlender 区域权重。原有 `primary_region_weight` 等数值不能用于推断其世界中的 RU 分布比例。

复核发布 JAR 字节码和源码后，确认 Reimagined 的地下群系识别使用 `#terraforged:non_surface`，再辅以 `cave/` 前缀和 `_caves` 后缀。其自带标签只有三个原版地下群系及 `terraforged:cave`。RU 的 `ancient_delta`、`prismachasm` 被 RU 标为洞穴群系，又列入主世界群系标签，但名称不符合上述规则，因此可能进入地表气候池。选择 Reimagined 时需要为它们补充地下分类标签。这是本包资源与候选实现结合得出的兼容性判断。[分类源码](https://github.com/Romoslayer/TerraForged-Reimagined/blob/1.20.1/src/main/java/com/terraforged/mod/worldgen/biome/util/BiomeUtil.java)

### 世界创建入口

正式目录的 `config/defaultworldtype/client-config.toml` 默认值为 `skyblockbuilder:skyblock`，白名单只包括它和 `minecraft:flat`。还存在 `kubejs/data/minecraft/worldgen/world_preset/normal.json` 及 SkyblockBuilder 的世界创建配置。

部署地形替代时，需要一起适配世界类型白名单、默认世界类型和服务端 `level-type`，并核对本包的出生岛、团队和传送流程。两个候选的隔离测试使用了它们各自的服务端创建入口，客户端创建界面和完整开局流程尚未在本轮验证。世界类型的选择作用于新建世界，现有世界的生成器保存在世界数据中。[UltraTerraForged 服务端设置](https://github.com/Pandaismyname1/ultraterraforged/blob/1.20.1/README.md)、[Reimagined 服务端设置](https://github.com/Romoslayer/TerraForged-Reimagined/blob/1.20.1/README.md)

### 多维度与高度

两个候选的测试都成功加载了包含 42 个维度的世界数据。

UltraTerraForged 默认预设导出的主世界维度类型和噪声高度为 576，最低 Y 为 -64，顶端为 Y=511。它覆盖 `minecraft:overworld` 噪声设置，而本包额外维度 `minecraft:the_overworld` 也引用该设置，因此也会受到预设影响。Reimagined 使用自己的主世界生成器，其他维度的独立生成器仍需按各自定义核对。

UltraTerraForged 1.0.1 修复过其他维度被主世界地形截断的问题，1.0.2 和 1.0.3 继续修复了 terrain tile 持有和多维度缓存释放。本轮选用 1.0.3。其 1.0.3 还修复了所有结构被错误限制在远离河流处的问题。[1.0.3 及之前版本修复记录](https://github.com/Pandaismyname1/ultraterraforged/releases/tag/1.0.3%2B1.20.1)

本轮实际区块请求集中于主世界，尚未逐一探索全部维度，也未做数小时运行的内存增长测试。

## 数据驱动结构优化

### Structure Layout Optimizer

该模组提供 Forge 1.20.1 构建，适合本包的 Jigsaw 拼接与大型 NBT 模板。它用空间树缩小结构片段相交检查的范围，并在处理模板前筛除当前区块范围外的方块。存在自定义 `finalizeProcessing` 处理器时，它保留完整输入以兼容处理器行为。[官方说明](https://modrinth.com/mod/structure-layout-optimizer)

使用同一结构、同一坐标、同一种子，在预先生成的 33×33 区块中执行整座 `keep_kayra` 放置。

| 分组 | 整座放置耗时 | 命令返回值 | 录制期间区块生成事件 |
| --- | ---: | ---: | ---: |
| 原有模组组合 | 23.767 秒 | 1 | 0 |
| 加入 Structure Layout Optimizer 1.0.11 | 6.140 秒 | 1 | 0 |

耗时减少约 74.2%，约为原速度的 3.87 倍。原轮次和优化轮次都使用预生成的普通主世界，结构组的自然生成频率统一归零，以减少其他建筑干扰。计时包含模板首次加载与整座放置。

原轮次中 Structure Gel 的模板扫描占用了明显 CPU 时间。加入优化模组后，模板在进入处理链前已缩小到当前边界，原先的全模板处理负担显著降低。新的主要热点转移到 `StructureTemplateOptimizer.getStructureBlockInfosInBounds` 及坐标变换。

这是单座建筑的定点放置收益。自然探索中的整体收益取决于实际遇到的结构，全部模组结构的布局和方块内容尚未逐一验证。

2026-11-09 复核时，正式目录已经安装 `structure_layout_optimizer-forge-1.0.11.jar`，其 SHA-256 与测试 JAR 一致。所需 Resourceful Config 2.1.3 也已存在，当前 `deduplicateShuffledTemplatePoolElementList=false`，与本次测试的默认设置一致。1.0.11 包含 Compact Machines 预览类加载问题的修复。[Forge 1.20.1 发布版本](https://modrinth.com/mod/structure-layout-optimizer/version/1.0.11%2B1.20.1-forge)

### 现有优化模组的覆盖范围

正式目录已有 Structure Essentials 5.1、Lithostitched 1.4.11 和 ModernFix 5.27.91。Structure Essentials 当前开启快速结构查询，间距倍率为 1.0，重叠限制关闭。它的查询优化与上述模板处理优化覆盖不同调用路径。

AE2 陨石的主要成本位于结构起点选择时的密集高度查询。Structure Layout Optimizer 的拼接和模板优化无法直接覆盖这部分工作，因此本次单独禁用了该结构的自然生成。

## AE2 陨石禁用实现

新增 `kubejs/data/ae2/worldgen/structure_set/meteorite.json`，沿用 AE2 原有结构组定义，将 `placement.frequency` 设为 `0.0`。

AE2 当前 `common.json` 中的 `spawnPressesInMeteorites` 控制压印模板相关内容。结构组覆盖能在自然生成候选判断阶段阻止陨石生成。

三个地形测试都加载了这份覆盖数据。分别审计每轮的 2700 个依赖区块，AE2 有效结构起点均为 0，同时保留其他模组的有效结构起点。

远程更新需要添加或替换这一份 JSON，并重启服务端，使新生成区块加载该结构组设置。

## UTF 384 上限核对

2026-11-09 在同一隔离副本中创建 UTF 新世界，将默认预设的 `worldHeight` 改为 384、`worldDepth` 设为 64。运行时确认可用高度范围为 Y=-64～383，共 448 层。

源码中的 `WorldSettings.Properties.terrainScaler()` 返回 `min(worldHeight, 256)`，`GeneratorContext` 使用它创建地形高度基准。因此 512 和 384 都使用 256 的基础地形缩放值。地形上限收窄时，高山高度需要单独核对。

对种子 `20261107`、`1111`、`2222`，分别在 X/Z ±16384 的范围以 256 格间距扫描，并在每轮最高的四个粗采样点附近以 8 格间距细采样。共进行 62,991 次地形高度采样。

| 种子 | 采样地形高度最高值 | 地形类型 |
| --- | ---: | --- |
| 20261107 | 230.77 | mountains_1 |
| 1111 | 227.92 | mountain_chain |
| 2222 | 218.99 | mountain_chain |

另在相同坐标比较 384 与 512 两套独立地形上下文，共 3120 次比较，未发现高度值差异。这项比较针对基础地形高度计算。

随后在种子 `20261107` 的最高采样点及火山、火山口、火山低地、火山岛附近生成 5 个 FULL 区块，逐列检查实际方块。山顶区块最高非空气方块为 Y=229，火山锥区块为 Y=210，五个区块在 Y=383 处的非空气列数均为零。

本次默认预设的核对未发现触顶或削顶现象，默认山脉参数可配合 384 上限使用。验证覆盖上述三个种子的有限采样和第一个种子的五个实际区块，其他高山预设及自定义垂直缩放需独立核对。

记录保存在 `runs/ultra_height_384-20261109-102840`，包含采样结果、实际生成检查、配置控制和日志。该轮的完整 384 预设保存在该目录的 `server-preset.json`。

## UTF 320 上限补测

2026-11-09 使用相同方法，将默认预设设为 `worldHeight=320`、`worldDepth=64`。运行时确认可用范围为 Y=-64～319。

三个种子再次完成 62,991 次地形高度采样，最高值与 384 测试相同，分别为 230.77、227.92、218.99。与 512 上限的 3120 次基础地形高度比较均一致。第一个种子的同五个山顶和火山区块完成 FULL 生成，其最高非空气方块高度也与 384 轮次相同，五个区块在 Y=319 处的非空气列数均为零。

对两个轮次保存的区块进行了额外比较。五个区块在 Y<320 范围的群系标签序列化数据一致，但方块数据存在差异。进一步将调色板和位存储解码为实际方块状态后，仍可确认这些差异，其中包括岩层材料和内部空气分布。

源码 `StrataRule.apply` 使用区块的最高／最低建造高度计算岩层堆叠长度，并将其传给随机岩层生成。因此改变高度上限会影响岩层排布。其他内部方块差异的具体来源尚未逐项隔离。

本轮结果支持默认预设采用 320 上限，地表高度及本轮山顶／火山检查具有余量。完整区块细节会受到高度相关逻辑影响，其他高山预设仍需独立核对。

记录位于 `runs/ultra_height_320-20261109-103503`，包含可用的 `server-preset.json`、生成结果和与 384 轮次的区块比较数据。

## 复核材料

- 运行记录位于 `docs/archive/chunk-performance-2026-11-07/runs/terrain_ae2_off-20261107-181211`、`terrain_ultra-20261107-181657`、`terrain_reimagined-20261107-182034` 和 `place_keep_kayra_slo-20261107-182527`。
- 结构优化参照记录为 `place_keep_kayra-20261107-145830`。
- 每轮保留 `result.json`、配置控制记录、日志、原始 JFR 和 `jfr-summary.json`。
- 下载版本、源码快照及结构起点审计位于 `docs/archive/chunk-performance-2026-11-07/terrain-replacements`。
- 可复用的运行器、探针与 JFR 解析器位于 `docs/tools/chunk_performance_bench`。
