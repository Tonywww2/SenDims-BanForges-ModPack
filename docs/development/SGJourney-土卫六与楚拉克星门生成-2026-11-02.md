# SGJourney：土卫六与楚拉克找不到星门

日期：2026-11-02。环境：Stargate Journey 0.6.51，BiomeSpy 1.3.3，Minecraft 1.20.1，Forge 47.4.x。

## 现象

- 向楚拉克（`sgjourney:chulak`，游戏内名称“丘拉克”）和土卫六（`titan_moon:titan`）拨号时提示“所拨恒星系没有星门”，`/locate structure` 也找不到星门结构。
- 加入土卫六标签修复后，单人世界 `ttst` 的测试（`logs/latest.log`，09:54–09:55）：
  - 从主世界执行楚拉克星门 `locate`，立即失败。
  - 土卫六 `locate` 找到 `[112, ~, 176]`，用时 69 ms。
  - 传送到楚拉克 (0, 100, 0) 后再次执行楚拉克 `locate`，立即找到同一坐标 `[112, ~, 176]`。
- 服务端情况相同：玩家用指令传送到楚拉克后，拨号恢复正常。
- 存档里楚拉克的候选区块 (7, 11) 记录了 `stargate_pedestal_chulak` 结构起点；该区域已生成区块的范围与传送后的加载范围一致，是这次传送生成的。所以楚拉克星门的实际生成没有问题，失败的只是候选区块未加载时的搜索。

## 星门的生成与拨号查找

- 星门结构集 `sgjourney:stargate_pedestal` 使用 `sgjourney:stargate_placement`（`UniqueStructurePlacement`）。每个结构集在一个世界里只有一个候选区块，由世界种子和 salt（1646217471）决定，与维度无关，所以所有维度的候选区块坐标相同。范围由 `config/sgjourney-common.toml` 的 `stargate_generation_*` 决定：偏移 0，横纵 ±64 区块。
- 候选区块生成时，原版会按权重依次尝试结构集里的 16 个结构，只有群系符合的结构才能生成。月球、火星、金星、水星、小行星带、里末地、土星环等维度，都是整合包把群系加进 `#sgjourney:has_structure/stargate_pedestal/stargate_pedestal_biomes`，再由通用基座生成星门。
- 拨号时目标恒星系若没有已登记的星门，`Dialing.getStargate` 会对该恒星系的每个维度调用 `StargateNetwork.findStargatesInLevel`，以 `#sgjourney:network_stargate` 从原点调用 `findNearestMapStructure`（请求半径 150 区块，Structure Essentials 的 `globalSearchRadius` 压到 70）。找到后加载区块并登记星门，找不到则报 `NO_STARGATES`。`/locate structure` 走的是同一个 `findNearestMapStructure`。
- 搜索遇到尚未生成的候选区块时，原版先“预测”该区块能否生成结构：检查放置规则，再在不生成区块的情况下计算结构起点并核对群系，可能生成时才把区块生成到结构起点阶段确认。区块已经生成过，就直接读取其中记录的结构起点。

## 土卫六：缺少可生成的星门结构

- SGJourney 只给 Ad Astra 星球提供了空间位置和对应结构，整合包和 titan_moon 都没有为土卫六群系提供星门结构。结构集里 16 个结构都不接受土卫六的 6 个群系，所以候选区块永远不会生成星门，拨号时的查找也必然失败。
- 搜索这一步同样失败：多群系维度里结构搜索由 BiomeSpy 接管（见下文），目标结构的群系都不在本维度时它直接判定不可能生成。
- 土卫六本身能取得地址（星图同步走 `Universe.getAddressInGalaxyFromDimension`），缺的只是星门。

修复：`kubejs/data/sgjourney/tags/worldgen/biome/has_structure/stargate_pedestal/stargate_pedestal_biomes.json` 追加 `#titan_moon:is_titan`。该标签与土卫六维度群系源的 6 个群系完全一致，通用基座因此可以在土卫六生成。

原版在服务端启动时就为每个维度确定了可能的结构集，所以这项修改必须完整重启服务端，`/reload` 不生效。

## 楚拉克：BiomeSpy 的气候预筛选误判

BiomeSpy 1.3.3（`biomespy-1.3.3-all.jar`，用于加速 `/locate` 与自然指南针）在群系源为 `minecraft:multi_noise` 的维度里取消原版的 `ChunkGenerator.getNearestGeneratedStructure`，改用自己的 `StructureChecker`：

- 候选区块已加载在内存中时，直接读结构记录。
- 否则先用 `LazyBiomeNoiseChecker` 在区块角 (x, 0, z) 采样温度、湿度、大陆性、侵蚀度、奇异度，与“目标结构可生成群系的参数范围外包框”逐轴比较（只比较外包框窄于完整气候范围的轴）。落在框外就跳过该区块，不再调用原版的预测检查，也不读存档。

这个预筛选只在维度的群系参数范围铺满整个气候空间时成立。原版 multi_noise 选用的是距离最近的条目，并不要求采样点落在条目范围内。楚拉克只有两个群系，温度都是 −0.45～−0.15，奇异度都是 −1～−0.9333，其余各项也很窄；世界上绝大部分地方的气候都在这些范围外，生成的仍是这两个群系。楚拉克星门的候选区块因此几乎必然被跳过，直到有人把该区块加载出来。土卫六的 6 个群系范围铺满了气候空间，各轴外包框都是完整范围，BiomeSpy 不做比较，所以不受影响。

按下文的网格检查，整合包里群系范围有空隙的多群系维度：楚拉克、阿比多斯、托兰、里玛、霜原星、火星、金星、水星、NuclearCraft 荒原（`nuclearcraft:wasteland`）、地下花园、深境一层（`sdbf:deep_realm_level_1`）和下界（KubeJS 覆盖的 5 群系版本）。这些维度里依赖 BiomeSpy 预筛选的结构搜索和群系搜索都可能漏掉实际存在的目标。

排查中已排除的因素（结论仍然有效）：星门资源与标签完整；SGJourney 0.6.46 → 0.6.51 的相关文件相同；Structure Essentials 的超时和搜索半径足够；Lithostitched、Structure Gel、ServerCore 不影响此结构；ModernFix 的 `faster_structure_location` 只检查放置规则，对唯一放置正确。Structure Essentials 的群系抽样加速在这些维度根本不会执行，因为 BiomeSpy 已经接管了上一层方法。

## 修复：特供模组跳过有空隙维度的预筛选

`slashblade_sendims-1.1.1.jar`（11-02 补丁包）新增：

- `mixin/biomespy/LazyBiomeNoiseCheckerMixin`：`@Pseudo` 注入 `com.moepus.biomespy.biome.LazyBiomeNoiseChecker#checkSingleNoise`。当前群系源范围有空隙时直接返回“符合”，由原版预测检查决定。BiomeSpy 在调用该方法之前的“目标群系都不在本维度”判断保留不变。未安装 BiomeSpy 时，混入配置插件会跳过这个 mixin。
- `compat/biomespy/ClimateCoverage`：每个群系参数表第一次使用时计算一次，按对象缓存（弱引用）。取深度包含 0 的条目，在五个气候轴各取 −0.9、−0.6、−0.3、0、0.3、0.6、0.9（共 16807 个点）检查每个点是否落在某个条目范围内；有任一点不在任何条目内即视为有空隙。端点不取 ±1，因为噪声值可能超出 ±1。主世界（Terralith，1705 个条目）约 200 万次比较，只算一次。

范围铺满的维度（主世界、末地、以太、午夜、神秘之境、土卫六）仍由 BiomeSpy 加速，行为不变。BiomeSpy 的群系搜索（`/locate biome`、自然指南针）用的是同一个预筛选，在上述有空隙的维度里也一并修正。

禁用时日志会出现一次：`BiomeSpy climate pre-filter disabled for a multi_noise biome source with N entries: ...`，N 是该维度的群系条目数（楚拉克为 2）。

只有搜索受这个缺陷影响，生成从未受影响：候选区块一旦被搜索选中，就会生成到结构起点阶段并放下星门。所以有空隙的维度装上补丁后不需要额外处理。

## 服务器处理

1. 先安装 10-31 更新包，再安装 11-02 更新包，完整重启服务端。土卫六的群系标签只在服务端启动时读取，`/reload` 不生效。
2. 楚拉克：已有玩家去过，星门已生成。可用 `/sgjourney stargateNetwork getAllStargates sgjourney:chulak` 确认。
3. 土卫六：执行 `/sgjourney stargateNetwork getAllStargates titan_moon:titan`。若已有星门，结束。
4. 若没有，从任意星门拨号一次，触发查找。仍失败，说明土卫六的候选区块在标签修复前已经生成过（当时没有可生成的结构），原版不会补生成，需要手动放置。
5. 手动放置（OP，站在要放置的位置附近，保证区块已加载）：
   - 土卫六：`/execute in titan_moon:titan run tp @s <x> 200 <z>`，然后执行 `/place structure sgjourney:stargate/milky_way/pedestal/stargate_pedestal`
   - 楚拉克（仅在楚拉克星门确实缺失时）：`/execute in sgjourney:chulak run tp @s 0 150 0`，然后执行 `/place structure sgjourney:stargate/milky_way/pedestal/stargate_pedestal_chulak`

   `/place structure` 不检查群系，并会执行结构的 `afterPlace`，星门修饰（主星门、受保护、本地原点符号）与 DHD 保护照常应用，星门加载后登记到网络。放置后再执行第 3 步确认。

## 验证

在没人去过楚拉克的新单人世界里，从主世界执行：

```text
/execute in sgjourney:chulak run locate structure sgjourney:stargate/milky_way/pedestal/stargate_pedestal_chulak
/execute in titan_moon:titan run locate structure sgjourney:stargate/milky_way/pedestal/stargate_pedestal
```

两条都应找到星门（同一世界里坐标相同），日志里应有一行上面的 BiomeSpy 禁用提示。`ttst` 存档的楚拉克候选区块已经生成，不能再用来复现。

相关调查：[楚拉克无法拨入](SGJourney-楚拉克无星门调查-2026-10-30.md)。该记录推测问题出在服务端存档状态，本文已查明实际原因。
