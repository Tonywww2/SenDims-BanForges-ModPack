# SkyblockBuilder 客户端闪电崩溃 HotAI 修复

目标版本：`SkyblockBuilder-1.20.1-5.1.33.jar`，HotAI 1.0。

## 原因

2026-11-02 日志在 17:47:21、17:48:17、17:48:20 报告：

```text
ClassCastException: ClientLevel cannot be cast to ServerLevel
  de.melanx.skyblockbuilder.EventListener.onEntityJoinLevel(EventListener.java:117)
```

原事件处理先检查实体是否为闪电、世界是否为空岛，然后直接把 `event.getLevel()` 转成 `ServerLevel`，没有判断逻辑端。客户端收到闪电实体生成包时也会触发此 Forge 事件，所以客户端空岛同样走到强制转换。

这与同一日志更早出现的 JET / ModernUI 字体异常是两件独立问题。

## 改动

替换单个类：

`hotai/de/melanx/skyblockbuilder/EventListener.class`

只在 `onEntityJoinLevel(EntityJoinLevelEvent)` 入口加入判断：事件的世界必须为 `ServerLevel`，否则立即返回。其后原有闪电判定、空岛判定、避雷针搜索、坐标换算及闪电重定位逻辑完整保留，其他事件处理和注解不变。

没有修改原模组 JAR。客户端闪电显示与服务端生成仍由原游戏处理；仅跳过客户端不适用的服务端搜索。

## 验证

运行 `docs/tools/skyblockbuilder_client_lightning/Build-And-Verify.ps1`：

- 7 项结构及 HotAI 检查通过。核对原类 SHA-256，确认只有入口判断改变，所有方法通过 ASM 检查，并使用 HotAI 实际转换器验证首次 `.class` 加载及后续 `.badiff` 重启结果相同。
- 362 项执行实际事件处理字节码的检查通过：原实现复现 24 次非服务端空岛闪电强转异常；补丁跳过客户端和其他非服务端世界。
- 48 个服务端组合与原方法结果逐项相同，覆盖闪电/普通实体、空岛/非空岛、避雷针有/无，以及正负与小数坐标。
- Minecraft/Forge 世界、实体与事件边界使用替身，尚未重启完整游戏验证真实雷暴。

原类 SHA-256：`d2c8c39d3b47d8142e7ea7c6356ddf87fc0edec0dd9d618084cf08cb1fdd5ea0`。

补丁 SHA-256：`bb7dd5549e24fc80485f0dfafb9f410c745ebbe93ea3df9d2fe2356fe9a7e2a3`。

## 安装

本地已安装，并合入最新版 1102 更新包；完整重启客户端后生效。单人、多人客户端均可使用，服务端安装也兼容并保持原逻辑。

再次部署同目标类时，将旧同名 `.class` / `.badiff` 备份到整个 `hotai/` 目录外，再放入新 `.class`，不要两种格式同时保留。1102 安装器会自动处理本包涉及的旧补丁；HotAI 首次运行把 `.class` 转为 `.badiff` 属于正常行为。
