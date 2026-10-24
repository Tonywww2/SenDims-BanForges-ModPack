# Quest Enhance 击杀任务同步修复（HotAI，服务端专用）

适用组合：Minecraft 1.20.1、Forge 47.4.10、FTB Quests 2001.4.22、Quest Enhance 1.20.1-forge-3.13。

## 原因与修复

Quest Enhance 把 `KillTaskMixin` 放进 `quest_enhance.mixins.json` 的 `client` 列表，但其中的 `readNetData` 注入会额外读取一个实体类型标签 UTF 字符串。专用服务端没有对应的写入；即使标签为空，客户端也会多读取一个长度字节，导致后续任务数据错位。

本次运行记录显示：上一项任务的父类字段结束位置两端均为 145409，下一项 Quest 在服务端从 145437 开始、客户端却读到 145438。随后 `Quest.readNetData` 把 64 当作只有三个值的 `Tristate` 索引，出现 `Index 64 out of bounds for length 3`。

构建工具将当前 Quest Enhance 的公共逻辑移植进 FTB Quests 的 `KillTask`，通过 HotAI 加载：

- 补上实体类型标签字段、访问器和 NBT 保存/读取。
- 在 `writeNetData` / `readNetData` 末尾补上与客户端一致的 UTF 字符串读写。
- 在 `kill` 开头保留原有的实体标签匹配、进度增加与取消原处理逻辑。
- 保留 Quest Additions 的 KillNBTTask 跳过条件。
- 去掉 Forge 标记为客户端的原方法和 GUI 辅助方法。

生成文件为 `hotai/dev/ftb/mods/ftbquests/quest/task/KillTask.class`。只安装到专用服务端。客户端继续使用 Quest Enhance 自带的 Mixin；客户端安装此文件会造成重复修改。

## 构建

从整合包根目录在 PowerShell 中运行，编译产物放到临时目录：

```powershell
$patchJava = 'C:\Program Files\Java\graalvm-jdk-21.0.5+9.1\bin'
$patchBuild = Join-Path $env:TEMP 'sdbf-quest-hotai-build'
$patchExports = @(
  '--add-exports', 'java.base/jdk.internal.org.objectweb.asm=ALL-UNNAMED',
  '--add-exports', 'java.base/jdk.internal.org.objectweb.asm.commons=ALL-UNNAMED',
  '--add-exports', 'java.base/jdk.internal.org.objectweb.asm.tree=ALL-UNNAMED',
  '--add-exports', 'java.base/jdk.internal.org.objectweb.asm.tree.analysis=ALL-UNNAMED'
)
New-Item -ItemType Directory -Path $patchBuild -Force | Out-Null
& "$patchJava\javac.exe" @patchExports -d $patchBuild 'docs\tools\quest_enhance_server_fix\PatchQuestEnhanceKillTask.java'
& "$patchJava\java.exe" @patchExports -cp $patchBuild PatchQuestEnhanceKillTask `
  'mods\ftb-quests-forge-2001.4.22.jar' `
  'mods\quest_enhance-1.20.1-forge-3.13.jar' `
  "$patchBuild\hotai\dev\ftb\mods\ftbquests\quest\task\KillTask.class"
```

工具校验两份原始 JAR 的 SHA-256、服务端方法集合、移植方法数量、注入点和字节码栈；不匹配时拒绝生成。

| 文件 | SHA-256 |
| --- | --- |
| ftb-quests-forge-2001.4.22.jar | `9ea9d159a78a2724cfe0457b024680fdb52a2126eff9cfa5280a30578f647a68` |
| quest_enhance-1.20.1-forge-3.13.jar | `60d4e20fad2478309e26b1c5b9d8518d7853e5f1710a47e00ab54a7808e1e7b2` |
| 生成的 KillTask.class | `57757f2e563a39fe6742f4a507c4fddbfa17d60e1fbc9a0e7ebf7627c8c03ad5` |

## 本次验证

- 17 个服务端方法通过字节码检查；HotAI 启动日志确认成功替换目标类。
- 独立新世界启动成功；25/25 启动脚本、113/113 服务端脚本加载，均为 0 错误、0 警告。
- 在独立测试服主线程验证：现有 2 个 KillTask 的网络读写和 NBT 往返通过；另构造非空实体标签，网络往返与缓冲区读写位置一致。
- 完整任务包成功序列化，长度 201899 字节；测试服保存所有维度后以退出码 0 关闭。
- 2026-10-22 22:13:22（本机时间），实际服务端记录 Tonywww 加入并通过 SimpleLogin；22:13:24.955 客户端 FTB Quests 记录 `Read 201899 bytes, 2605 objects`，已成功通过此前失败的同步步骤。

## 维护

安装后重启服务端。HotAI 首次加载可能将 `.class` 转换为 `.badiff` 并删除 `.class`，属于正常行为。更新补丁前，先删除对应的旧 `.badiff`，两种文件不能并存。

升级 Quest Enhance 或 FTB Quests 时，需要先重新检查两端协议，再重新生成或移除补丁。恢复原状只需删除对应的 `KillTask.class` / `KillTask.badiff` 并重启服务端。

移植字节码来源于本机已有的 Quest Enhance，由 hp 编写；该 JAR 声明 All Rights Reserved。本地修复没有改变原作者对该字节码的授权。
