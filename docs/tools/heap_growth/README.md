# Java 堆内存增长采样

用于比较同一次 Minecraft 运行中低、高占用阶段的存活对象和持有关系。无需修改整合包或 Java 启动参数，也不需要关闭 `DisableExplicitGC`。脚本只在本地保存样本。

## 双击运行

1. 正常启动这个整合包，进入平时游玩的世界或服务器，等 JEI 等初始化完成。
2. 双击本目录的 `Start-HeapCapture.cmd`。脚本自动根据 `--gameDir` 识别这个整合包的 Java 进程，并寻找对应 JDK 的 `jcmd.exe`。
3. 在低占用阶段（例如之前观察到的 GC 后约 6 GB），输入 `1`。等待显示“采样完成”后，继续正常游玩。
4. 当占用持续增长（例如 GC 后接近 9 GB）时，输入 `2`，再次等待完成。不要等到游戏接近崩溃才采集。
5. 输入 `Q` 退出采样工具。

两次采样必须来自同一次游戏运行，中途不要重启游戏。关闭采样窗口不会关闭游戏；重新打开工具仍可找到这次运行的基线。可以追加多次高占用样本，已有文件不会被覆盖或自动删除。

每次完整采集会请求一次 Full GC 并暂停游戏，耗时取决于堆大小和磁盘速度。每份快照可能有数 GB，建议采样前预留约 40 GB 可用磁盘空间；脚本还会按实际堆上限检查每次采样所需的空间。若在服务器中采样，暂停期间可能断线；游戏进程未退出时，已有样本仍保留。

## 结果在哪里

默认位置为整合包根目录下：

```text
docs/archive/heap-samples/<游戏启动时间UTC>-pid<进程号>/
  session.json
  baseline-<时间>-<随机后缀>/
    heap.hprof
    sample.json
    heap-before.txt
    heap-after.txt
    ...
  high-<时间>-<随机后缀>/
    heap.hprof
    sample.json
    ...
```

采样完成后，保留包含基线和高占用样本的整个进程目录。后续分析最重要的是两阶段的 `heap.hprof`；其中保存对象及引用关系。辅助文件包含 JVM 版本和参数、采集前后堆信息、进程内存、类直方图及 `latest.log` 最后 1000 行。

完整快照后的 `histogram-all-after-dump.txt` 包括直方图采集时尚未回收的对象，用于辅助观察；比较存活对象时以 `heap.hprof` 为准。单独的 `-HistogramOnly` 模式会在 GC 后采集 `histogram-live.txt`，但不能提供对象持有关系。

## 命令行选项

以下命令从整合包根目录运行，兼容 Windows PowerShell 5.1 和 PowerShell 7。

```powershell
# 交互菜单，与双击启动器相同
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\tools\heap_growth\Capture-HeapGrowth.ps1

# 分别采集基线、高占用样本
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\tools\heap_growth\Capture-HeapGrowth.ps1 -Mode Baseline
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\tools\heap_growth\Capture-HeapGrowth.ps1 -Mode High

# 仅查看当前堆占用，不主动触发 GC
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\tools\heap_growth\Capture-HeapGrowth.ps1 -Mode Status

# 磁盘不足时，仅采集小型类直方图；完整分析仍需堆快照
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\tools\heap_growth\Capture-HeapGrowth.ps1 -HistogramOnly

# 可选：把两次样本都保存到另一个磁盘，路径保持一致
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\tools\heap_growth\Capture-HeapGrowth.ps1 -OutputRoot 'D:\MinecraftHeapSamples'
```

如果找不到 `jcmd.exe`，使用 `-JcmdPath '完整路径\jcmd.exe'` 指定游戏使用的 JDK 中的工具。如果同时启动了多个相同整合包实例，使用 `-TargetJavaProcessId 进程号` 选择；脚本仍会核对整合包路径。如果游戏以管理员权限运行，采样工具也需要相同权限。
