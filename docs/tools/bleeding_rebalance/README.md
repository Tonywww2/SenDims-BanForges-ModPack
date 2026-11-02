# 出血累积与爆发调整

规则与远程更新文件见[机制说明](../../development/特供模组-出血调整-2026-10-30.md)。`forge-source/` 为已同步到特供模组工程的源码快照。

从整合包根目录执行：

```powershell
& ./docs/tools/bleeding_rebalance/Build-And-Verify.ps1
```

脚本编译三个 Mixin，按 `SourceProject/build/createMcpToSrg/output.tsrg` 转换 Minecraft 成员名，执行生成的 SRG 类字节码的行为检查。测试依赖使用小型替身，不会启动游戏。输出到被忽略的 `docs/archive/bleeding-rebalance-2026-10-30/slashblade_sendims-1.1.1.jar`，不自动安装。

完全退出当前 Minecraft 实例后，可运行 `./docs/tools/bleeding_rebalance/Install.ps1` 安装。脚本核对构建产物的 SHA-256、检查文件占用、保留旧 JAR 备份后替换；游戏运行期间会拒绝安装。

输入为当前安装的 SenDims 1.1.1 JAR。工具核对原出血 Mixin 指纹，合并三个类和两个注册项，逐项确认其他文件内容不变。已安装本次结果后也允许重新生成。

可用 `-MinecraftRoot`、`-SourceProject`、`-JavaBin` 指定路径，需要本地 Forge 开发 JAR、Prism 依赖、LSP 与 SlashBlade JAR。编译目标 Java 17。
