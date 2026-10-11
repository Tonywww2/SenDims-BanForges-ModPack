# 深境二层 · 珊瑚礁与海泡菜

日期：2026-10-10。维度 ID：`sdbf:deep_realm_level_2`。已安装到当前实例，重启后在新生成的区块生效。

## 本次调整

- 保留原创的大型不规则礁床、五类珊瑚颜色斑块和外围海草过渡带。
- 在裸露礁面加入含水海泡菜，每组 1–4 株；约 6% 的可用礁面列尝试放置，实际数量受海床、其他地物和建筑避让影响。
- 直接复用 Minecraft 1.20.1 的 `CoralTreeFeature`、`CoralClawFeature`、`CoralMushroomFeature` 形状算法，增加立体珊瑚树、珊瑚爪、珊瑚蘑菇和壁挂珊瑚扇。原版形态自身也会少量放置海泡菜。
- 每片礁床最多接受 16 个相隔约 9 格的形态锚点，最多尝试 96 次。原版算法的放置操作写入现有地物方案，实际生成仍由当前区块负责。
- 活珊瑚在全部地物放置后，检查同一区块内六个方向的邻水状态，支持侧面接触水的珊瑚枝干；封闭位置使用方解石承托。海泡菜和珊瑚装饰均检查支撑条件。

生成候选规则保持原值：每个 192×192 格区域最多一个候选，32% 概率尝试，进一步限制为深水群系、足够水深及成片面积。建筑包围盒继续外扩 12 格避让。

## 实测结果

独立 Forge 测试服务器使用相关模组及 ModernFix、Starlight、FerriteCore、Smooth Boot。测试世界种子为 `20261004`。

| 实际 FULL 区块样本 | 海泡菜组数 | 原版壁挂珊瑚扇 | 活珊瑚方块与植株 | 与生成方案一致的方块数 |
| --- | ---: | ---: | ---: | ---: |
| `(-397, 20, -61)` | 103 | 153 | 2,859 | 7,944 / 8,013 |
| `(321, 18, 1022)` | 114 | 138 | 2,999 | 8,693 / 8,727 |

少量方案位置会因实际地形、既有地物、支撑条件和结构避让而跳过。

- 两片样本均出现 1、2、3、4 株的海泡菜组合，实际含水、支撑与发光检查通过。
- 珊瑚与海泡菜经过三轮原版方块 tick 和邻接形状更新，状态保持稳定。
- 跨区块方块索引、边界放置、结构保护检查通过；缓存淘汰、反向请求及四线程并发生成结果一致。
- 原有 15 类地物在 81 个采样格组中的方案逐方块一致；1,849 个格组中找到 2 片珊瑚礁，位置与调整前一致。该采样包含所有群系，不能作为深水区专属覆盖率。
- 在共享地形缓存预热、地物方案缓存清空的条件下，8 轮交替对比的中位数：每个含礁格组从 29.845 ms 变为 30.605 ms，增加约 0.760 ms。此项仅测方案计算，不代表完整客户端载图时间。
- 离线编译、原生 Forge 运行、生产重映射打包全部通过。
- 3,153 个 `kubejs/data` 文件哈希一致。模组工作区 397 个主源码/资源文件中仅修改 `WorldTreeEcology.java`。
- 安装包仅替换 `WorldTreeEcology` 及其内部类，其他 JAR 条目逐字节一致，包括小行星生成器、既有世界树性能优化、维度数据及 Mixin 配置。

## 实际生成预览

来自测试世界真实区块导出的 NBT，使用整合包内方块模型和纹理。为便于查看，隐藏水体、原有海带和深层基底；这是静态模型渲染。

![珊瑚礁全貌](C:/Users/Tony/AppData/Roaming/PrismLauncher/instances/SenDimsBanForges/minecraft/docs/world_tree_ecology/previews/coral_enrichment_2026-10-10/overview.png)

![海泡菜局部](C:/Users/Tony/AppData/Roaming/PrismLauncher/instances/SenDimsBanForges/minecraft/docs/world_tree_ecology/previews/coral_enrichment_2026-10-10/detail.png)

## 安装与记录

- 当前模组：`mods/slashblade_sendims-1.0.22.jar`。
- SHA-256：`a184a5c2f5c303d712812e8f91d4fd7d8af34afd1a4b46ccd4f7e3fa9e85f846`。
- 修改前备份：`backups/world_tree_coral_enrichment_before/`。
- 原生验证、区块导出、安装包差异审计：`local/world_tree_work/verification/coral_reef_enrichment_2026-10-10/`。
- 源码已同步到指定的 `SlashBlade-SenDims` 模组工作区。
