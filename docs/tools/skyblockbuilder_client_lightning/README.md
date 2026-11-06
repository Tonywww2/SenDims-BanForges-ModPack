# SkyblockBuilder 客户端闪电修复

```powershell
& ./docs/tools/skyblockbuilder_client_lightning/Build-And-Verify.ps1
```

只在原 `EventListener.onEntityJoinLevel()` 入口增加 `ServerLevel` 类型检查，保留全类其余字节码、注解和事件订阅。原类版本不匹配时拒绝生成。

验证直接执行原始/补丁方法字节码，客户端原强转异常可重现；服务端对比避雷针搜索和重定位结果。使用真实 HotAI 转换器核对首次加载及差分重启一致性。

需要本机 Java 17+、PrismLauncher ASM 库、已安装 SkyblockBuilder 5.1.33 与 HotAI 1.0。产物、原生验证报告和 HotAI 临时差分均位于 `docs/archive/skyblockbuilder-client-lightning-2026-11-02/`；只分发 `release/hotai/de/melanx/skyblockbuilder/EventListener.class`。
