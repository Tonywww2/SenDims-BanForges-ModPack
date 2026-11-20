# 2026-11-18 麻将成就与强制终止 HotAI 补丁

目标版本：Minecraft 1.20.1 / Riichi Mahjong Forge 0.2.0 / HotAI 1.0。不更换模组 JAR。

说明文档见 [SDBF-麻将成就与强制终止修复-2026-11-18](../../development/SDBF-麻将成就与强制终止修复-2026-11-18.md)。

## 文件

- `PatchMahjong.java`：补丁生成器。从 `mods/riichi_mahjong_forge-0.2.0.jar` 读取原始类并核对 SHA-256；牌桌类先调用 [2026-10-24 生成器](../server_bugs_2026_10_24/PatchServerBugs.java) 的 v3 变换，确认结果与已发布 v3 的 SHA-256 一致，再叠加本次修改。
- `MahjongAchievementHelpers.java`：辅助方法模板，只用于生成，不随整合包发布。生成器把其中以 `sdbf$` 开头的方法和字段复制进目标类：`MahjongAchievementHelpers` → `WinCalculator`，`MahjongTableHelpers` → `MahjongTableBlockEntity`。模板中的其他字段和方法只是目标类原有成员的占位。

## 构建

在整合包根目录的 PowerShell 中执行（依赖与 2026-10-24 工具相同，另需 Prism 库中的 Minecraft SRG JAR、brigadier、datafixerupper、authlib 供模板编译）：

```powershell
$lib = Join-Path $env:APPDATA 'PrismLauncher\libraries'
$jdk = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin'
$out = 'docs\archive\mahjong-2026-11-18'
$cp = @(
  "$lib\org\ow2\asm\asm\9.9.1\asm-9.9.1.jar", "$lib\org\ow2\asm\asm-tree\9.9.1\asm-tree-9.9.1.jar",
  "$lib\org\ow2\asm\asm-analysis\9.9.1\asm-analysis-9.9.1.jar", "$lib\org\ow2\asm\asm-commons\9.9.1\asm-commons-9.9.1.jar",
  "$lib\net\minecraft\client\1.20.1-20230612.114412\client-1.20.1-20230612.114412-srg.jar",
  "$lib\com\mojang\brigadier\1.1.8\brigadier-1.1.8.jar", "$lib\com\mojang\datafixerupper\6.0.8\datafixerupper-6.0.8.jar",
  "$lib\com\mojang\authlib\4.0.43\authlib-4.0.43.jar", 'mods\riichi_mahjong_forge-0.2.0.jar'
) -join ';'
& "$jdk\javac.exe" --release 17 -XDstringConcat=inline -encoding UTF-8 -cp $cp -d "$out\builder" `
  docs\tools\mahjong_2026_11_18\MahjongAchievementHelpers.java docs\tools\mahjong_2026_11_18\PatchMahjong.java `
  docs\tools\server_bugs_2026_10_24\PatchServerBugs.java
& "$jdk\java.exe" -Xverify:all -cp "$cp;$out\builder" PatchMahjong . "$out\release\hotai"
```

`-XDstringConcat=inline` 让模板不产生 `invokedynamic` 字符串拼接，复制进目标类时无需引导方法。生成时用 ASM `BasicVerifier` 检查所有改动的方法。脚本不安装文件，也不启动游戏。

## 版本指纹

| 目标类 | 原始 SHA-256 | 补丁 SHA-256 |
| --- | --- | --- |
| `com/themahjong/yaku/WinCalculator.class` | `b41d98b9b95190462b1bebee0e2bbf38298867cff8869796f08f1957802770e3` | `e8b142cbf7f3542b47d460b487a71ba9adeed96040e8d8699835214338c988d3` |
| `com/riichimahjongforge/mahjongtable/MahjongTableBlockEntity.class` | `b1d8850bbde9e05b2d52f5d406bdca2c09a12f485ce473f32d2be2305b594118` | `138feeb22921bafd0ad85928b50c799336a65ded6b52a567a8421a5912f31aad` |

牌桌类的中间 v3 结果必须为 `1c7b7201ccbe752efb80cda47e356d7fb1db229693a5864e7750b7a0293e8a58`。`MahjongTableBlock` 与 `MahjongWinEffects` 沿用 2026-10-24 的补丁，不变。

## 安装

1. 停止游戏或服务端。
2. 把 `hotai/com/riichimahjongforge/mahjongtable/MahjongTableBlockEntity.badiff`（以及同名 `.class`，若存在）移到 `hotai/` 目录之外。
3. 放入生成的 `WinCalculator.class` 和 `MahjongTableBlockEntity.class`，完整重启。首次加载后 HotAI 把 `.class` 转为 `.badiff` 属正常现象。

回退：删除这两个目标的 `.class` / `.badiff`，恢复移出的旧 `MahjongTableBlockEntity.badiff` 后重启。模组升级后必须重新核对原始类。
