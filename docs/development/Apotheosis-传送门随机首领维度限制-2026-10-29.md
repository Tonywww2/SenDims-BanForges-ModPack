# 随机神话首领传送门按当前维度筛选

适用版本：Apotheosis 7.4.8、Placebo 8.6.3、GatewaysJS 1.6、HotAI 1.0，Minecraft 1.20.1。

## 问题与修改

`wave.addApotheosisBoss()` 生成不指定 `boss` 的 `apotheosis:boss` 波次。原 Apotheosis `GatewaysCompat$BossWaveEntity.createEntity(Level)` 调用全局 `BossRegistry.getRandomItem(random)`，不会检查首领的 `dimensions`，因此仅把脚本改成无参数调用无法保证只出现末地首领。

补丁将这一处抽取调用改为：

```java
BossRegistry.INSTANCE.getRandomItem(level.random, 0F, IDimensional.matches(level))
```

直接使用 Placebo 已有的维度规则和权重抽取接口，每次实际生成时读取所在维度。保留原来的零幸运值、首领权重、首领生成过程，以及显式指定 `boss` ID 的逻辑。没有候选首领时沿用原有返回空结果的处理，不回退到全局池。

维度资格按照首领数据里的 `dimensions` 判断，而不是 JSON 文件路径。未限制维度的模板仍按 Placebo 原规则视为适用于全部维度。

末地门 `gateways:sdbf_end_g1` 三波继续使用无参数随机接口；该门已限制在 `minecraft:the_end` 使用。小行星带门仍显式指定原先的三个模板。

## 安装与远程更新

本次运行文件：

```text
hotai/dev/shadowsoffire/apotheosis/adventure/compat/GatewaysCompat$BossWaveEntity.class
kubejs/server_scripts/enemy/gateways/mythic_boss_gw.js
```

发布包：`docs/releases/SDBF-GatewayBossDimension-HotAI-2026-10-29.zip`。

关闭游戏或服务端后合并安装，完整重启后生效。独立服务端只需服务端安装，单人游戏安装到本地实例。无需修改或替换原始模组 JAR。仅 `/reload` 不能加载新增的类补丁。

HotAI 首次加载会将 `.class` 转成 `.badiff`。同一类不能同时存在旧 `.badiff` 和新 `.class`；重复安装时先将这个目标类的旧补丁备份到整个 `hotai/` 目录之外，再放入新的 `.class`。保留其他 HotAI 补丁。

## 校验与重建

- 原始目标类 SHA256：`668fe669f029ea2f091b1a5bafbd50ccca1698f729c1ba777ef3937b40bf3f38`。
- 补丁目标类 SHA256：`7c1bc561195a864f057be8195e7a7b24dc216d30ea0dcbf90fa4b63c828d5a2c`。
- 已通过 5 项结构/HotAI 校验和 224 项行为检查，执行原模组的首领生成方法字节码，Minecraft/Placebo 边界使用测试夹具。
- 覆盖末地排除异维度首领、保留候选权重、动态读取当前维度、空池不回退、指定首领不受影响和无维度限制模板规则。
- HotAI 首次加载、生成差分与再次加载的往返校验通过。未启动完整游戏实测。

从 Minecraft 根目录运行 `docs/tools/gateway_boss_dimension/Build-And-Verify.ps1` 可重建与校验。输出位于被 Git 忽略的 `docs/archive/gateway-boss-dimension-2026-10-29/`；构建脚本不会自动安装。
