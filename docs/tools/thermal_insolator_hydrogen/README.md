# 有机灌注机氢流体兼容

配方使用 Thermal 原生 `ingredients` 中的 `fluid_tag`。补丁只修改灌注机类的储罐验证器和配方缓存返回检查，支持水/氢分流；不修改 Thermal JAR。

```powershell
& ./docs/tools/thermal_insolator_hydrogen/Build-And-Verify.ps1
```

脚本从 Thermal Foundation 提取自带 Core 依赖，编译三个静态辅助方法并嵌入原灌注机类。校验原类 SHA-256，保留其他原方法，使用 HotAI 实际生成并重新应用差分，再执行补丁缓存与原机输入数量校验的字节码测试。

产物：`docs/archive/thermal-insolator-hydrogen-2026-11-02/release/hotai/`。使用 HotAI 1.0、Thermal Expansion 11.0.1.29、Core 11.0.6.24、CoFH Core 11.0.2.56。首次部署只复制目标 `.class`，不分发单独的辅助类；后续 `.badiff` 由 HotAI 自动生成。
