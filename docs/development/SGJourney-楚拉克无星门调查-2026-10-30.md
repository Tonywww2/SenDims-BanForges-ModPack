# 楚拉克无法拨入：调查记录

> 2026-11-02 更新：根因已查明，是 BiomeSpy 在群系范围有空隙的维度里误判结构搜索，见 [SGJourney：土卫六与楚拉克找不到星门](SGJourney-土卫六与楚拉克星门生成-2026-11-02.md)。下文“生成/定位问题”的推测以该文为准。

环境：Stargate Journey 0.6.51，Minecraft 1.20.1。问题发生在多人服务器；本机没有该服务器目录或世界备份。本记录区分客户端资源审计与服务端截图证据。

## 已确认

服务端截图包含两条结果：

- `getAllStargates sgjourney:chulak`：在该维度中找不到星门。
- `/locate structure sgjourney:stargate/milky_way/pedestal/stargate_pedestal_chulak`：找不到该结构。

原模组 `Dialing.getPreferredStargate` 在目标恒星系的星门候选列表为空时返回 `NO_STARGATES`，对应中文“所拨恒星系没有星门”。正常拨号会在没有候选时尝试搜索该恒星系关联维度中的星门结构，然后才返回该错误。

因此当前证据指向接收端结构的生成/定位问题，而不仅是星门区块没加载或能量不足。具体是旧区块结构记录、服务端维度生成器、结构集/群系标签覆盖，还是其他服务端生成条件，尚无法只凭客户端资源与截图区分。

## 本机整合包资源审计

1. `sgjourney:chulak` 的维度、空间位置与地址区域定义均存在，空间位置绑定到 `sgjourney:chulak` 地址区域。
2. KubeJS 地址区域覆盖只固定了地址，不移除维度关联。其银河系地址为 `8, 1, 22, 14, 36, 19`，域外地址为 `1, 9, 14, 21, 17, 3, 29`；服务端实际地址以其查询结果为准。
3. 原生楚拉克星门结构、模板池与 NBT 模板均存在。模板包含银河系星门与 DHD。
4. 楚拉克结构位于原生 `sgjourney:stargate_pedestal` 结构集中，也包含于 `#sgjourney:network_stargate`，所以 `common_stargate_search = false` 不会将它排除。
5. 楚拉克结构未设置 `common_stargates`，该值在实现中为 `null`，不会被 `common_stargate_generation = false` 的布尔匹配规则禁用。
6. 结构允许的群系通过 `#sgjourney:is_chulak` 包含 `sgjourney:chulak_plains` 和 `sgjourney:chulak_forest`，原生楚拉克维度的群系源正是这两个群系。
7. 本机 KubeJS 未覆盖楚拉克维度、专用星门结构、原生结构集或楚拉克群系资格标签。

这只能证明本机当前资源链条完整，不能证明远程服务器的世界生成器与结构记录与其相同。

## 后续诊断与处理方向

已向用户核对的命令如下，均为当前版本的实际命令名称：

```text
/sgjourney stargateNetwork address sgjourney:chulak
/sgjourney stargateNetwork getAllStargates sgjourney:chulak
/execute in sgjourney:chulak run locate structure sgjourney:stargate/milky_way/pedestal/stargate_pedestal_chulak
```

楚拉克星门采用 `sgjourney:stargate_placement` 唯一位置策略。当前配置偏移为 0，横纵范围为 64 区块，候选位置由种子决定，约在原点每轴正负 1024 格内；它不会像普通随机分布结构一样在更多新区块中持续产生新的候选。

进一步区分服务端实际状态，需要检查该候选区块的结构起点和服务端的 `sgjourney:chulak` 生成器，以及服务端加载后的结构集与群系标签。可先用 `/execute in sgjourney:chulak run locate biome sgjourney:chulak_plains` 核对实际群系；若原生群系也不可定位，优先检查服务端维度生成器。

恢复通路可以在楚拉克维度补建一个有效星门，或在选定位置手动放置原生专用结构并加载注册。这是修复接收端的方向，不等于已确定原始生成失败原因。本次没有对多人服务器执行任何修改。

`forceStellarUpdate` 会重建宇宙/网络数据，并重置和预加载星门；它不会无条件重建缺失的结构起点，因此不应把网络重置当作结构缺失的通用修复。
