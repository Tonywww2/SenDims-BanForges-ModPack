# Thermal 树脂提取机扫描优化

针对 Thermal Foundation 11.0.6.70 内嵌 Thermal Core 11.0.6.24，使用 HotAI 1.0 替换单个类，不修改原模组 JAR。

```powershell
& ./docs/tools/thermal_tree_extractor/Build-And-Verify.ps1
```

构建依赖本机 PrismLauncher 的 Java/ASM/FastUtil 库、Forge 1.20.1 官方映射开发缓存和已安装的 Thermal/CoFH/HotAI。Java 编译器默认使用 `C:/Program Files/Java/graalvm-jdk-21.0.5+9.1/bin`，输出 Java 17 字节码。

- `TreeExtractorOptimized.java`：构建时的方法来源；方法和五个私有字段重映射后嵌入原提取机类。此辅助类不分发。
- `PatchTreeExtractor.java`：核对原类 SHA-256，替换五个扫描/验证方法，仅将原生产方法的一次验证调用改为强制验证，其余原方法保持字节码一致。
- `TestTreeExtractor.java`：执行原始和补丁后的实际方法字节码，使用相同的世界/方块替身进行随机树形、遍历顺序、重叠配方、倒生树、更新合并、生产验证、未加载区块和恢复检查，并测量扫描分配量。
- 构建还直接调用 HotAI 的 `BytecodeTransformer` / `DiffTransformer`，核对首次 `.class` 加载及以后 `.badiff` 重启结果一致。

产物位于 `docs/archive/thermal-tree-extractor-2026-11-02/release/hotai/`，验证记录和基准数据位于同一归档目录。只分发 `DeviceTreeExtractorBlockEntity.class`，不分发 `TreeInfo` 或测试类。原类不匹配时构建会拒绝继续。

详细分析见 [性能分析与更新说明](../../development/Thermal-树脂提取机性能优化-2026-11-02.md)。
