# 星门与 Tetra 挖掘崩溃修复

补丁适用于 Minecraft 1.20.1 Forge、Stargate Journey 0.6.51、HotAI 1.0。已制作发布包并安装到当前本地实例，重启后加载。

[下载 HotAI 补丁](../releases/SDBF-Stargate-Tetra-HotAI-2026-10-28.zip)。

## 原因

用户报告的异常发生于 Tetra 的 `ItemModularHandheld.mineBlock` 查询原方块硬度时。`StargateBlockState.getDestroySpeed()` 根据旧状态进入星门逻辑，却把 `world.getBlockState(pos)` 返回的当前状态传给门环解析。当前位置已经是空气，因此 `AbstractStargateRingBlock.getBaseBlockPos()` 读取 `stargate_part` 时抛出异常。

报告明确了旧状态与当前位置不一致，但不足以单独确定该坐标在哪个早先回调中被移除。

## 修改

只修改 `StargateBlockState.getDestroySpeed(BlockGetter, BlockPos)`：

```java
if (world != null && pos != null && world.getBlockState(pos).getBlock() != this.getBlock()) {
    return super.getDestroySpeed(world, pos);
}
// 后续完整保留模组原方法体。
```

失效状态返回原方块基础硬度，工具仍能根据原硬度处理损耗；正常门环的连接保护、配置、伪装硬度等继续执行原逻辑。未新增异常捕获，不吞掉其他错误。其他方法、字段、类元数据均保留。

## 验证

[构建和测试入口](../tools/stargate_hardness_fix/Build-And-Test.ps1)直接读取安装的原始模组，先核对类 SHA-256，再生成单类替换补丁。

- **10 项结构与 HotAI 检查**通过，包含 Java 17 版本、精确目标描述符、其他方法保持一致，以及真实 HotAI `.class → .badiff → 再次加载` 往返一致性。
- **3882 项行为检查**通过：执行实际星门硬度方法、门环查找与基座定位方法的字节码，先复现原始异常，再验证补丁结果。
- 空气、洞穴空气、石头、水及其他星门替换场景安全回退，不读取已失效的星门实体和伪装。
- 正常状态覆盖四个代表性部件、四个朝向、三种方向、连接/断开及拆除配置、无伪装/空伪装/普通伪装/不可破坏伪装。正常返回结果与原代码一致。
- 核对基础实体缺失、不相关实体、同种方块的新状态，以及空上下文的原有回退行为。
- JVM `-Xverify:all` 与 ASM 校验通过。

Minecraft/Forge 的世界、属性、实体及配置边界为测试替身，未运行完整游戏或远程服务器。验证输出位于 `docs/archive/stargate-hardness-2026-10-28/verification-results.txt`。

## 安装

服务端仅需添加一个文件：

```text
hotai/net/povstalec/sgjourney/common/blockstates/StargateBlockState.class
```

先停服，再合并发布包的 `hotai/` 文件夹，完整重启。不要保留同目标的旧 `.class` 与 `.badiff`；备份放在整个 `hotai/` 目录外。首次加载后转换为 `.badiff` 是正常行为。

联机服务端安装即可解决报告中的服务端异常；客户端可同步安装，单人游戏需本地安装。无需更新星门或 Tetra 模组 JAR、KubeJS 脚本、配置及存档。更多安装和回退步骤见发布包 `INSTALL.txt`。

| 文件 | SHA-256 |
| --- | --- |
| 原星门 JAR | `4bed593c4762db6e3bbc0037c04e13e6f5950c183785e589ce5b392c8581eaaf` |
| 原 `StargateBlockState.class` | `54227e7bca559dab73330456937b037b69b1661de5355b98418658556cdcf56f` |
| 修补后 `StargateBlockState.class` | `fea2ab957806ec9a99b36a887feb468955829e88d34eec0cfd98d7873f3088a7` |
