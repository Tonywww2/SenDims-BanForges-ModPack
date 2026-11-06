# AUI 输入重置的原生验证

```powershell
& ./docs/tools/aui_input_reset/Build-And-Verify.ps1
```

使用已安装 ApricityUI 1.2.7 的 `AbstractText.class`，保留原始插入、选区和属性同步方法字节码，在最小文档/渲染/事件替身上执行。先复现仅清空 `value` 后的字符串越界，再验证界面采用的“字段赋值 → 属性同步 → 选区归零”顺序。

测试不修改模组、HotAI 或游戏文件。生成类及报告位于 `docs/archive/aui-text-input-2026-11-02/`，需要本机 Java 17+ 及 PrismLauncher 的 ASM 库。
