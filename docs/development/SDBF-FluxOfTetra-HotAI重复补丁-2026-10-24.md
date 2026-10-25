# FluxOfTetra HotAI 重复应用导致启动错误

远程服务端提供的 KubeJS 启动日志在 `04:39:26` 报出：

```text
Error in 'ItemEvents.modification': Index 23925 out of bounds for length 3754
java.lang.ArrayIndexOutOfBoundsException: Index 23925 out of bounds for length 3754
    at org.objectweb.asm.ClassReader.readInt
    at org.objectweb.asm.ClassReader.getFirstAttributeOffset
    at org.objectweb.asm.ClassReader.accept
    at youyihj.hotai.transformers.HotaiTransformer.transform
    ...
    at net.yiran.fot.common.TetraFEProvider.<init>(TetraFEProvider.java:17)
```

物品修改事件枚举物品、创建拔刀剑默认物品栈时触发了 `TetraFEStore` 类加载。故障发生于 HotAI 生成字节码后的 ASM 解析阶段，因此这次异常不能按普通 KubeJS 脚本错误处理。

## 已完成的精确复现

使用 FluxOfTetra 6.9.0-1.0.5、本地现有的 `TetraFEStore.badiff`、已发布的替换类、实际 HotAI 内含的差分库和 ASM 9.9.1，执行以下只读检查：

| 输入与操作 | 结果 |
| --- | --- |
| 原始类 3776 字节，应用一次现有差分 | 有效的 3765 字节类，与已发布替换类的 SHA-256 完全相同 |
| 原始类经 ASM ClassNode/ClassWriter 重写，再应用差分 | 同上 |
| 已修补类 3765 字节，再应用同一差分 | 损坏的 3754 字节类，精确复现 `Index 23925 out of bounds for length 3754` |
| 已修补类经 ASM 重写，再应用同一差分 | 同样精确复现 |

HotAI 1.0 分别收集 `.class` 和 `.badiff` 并注册对应转换器，不会自动将同一目标类的两种文件视为互斥更新。因此，如果上传新的 `.class` 时保留同目标类的旧 `.badiff`，同一类可能先替换、再套差分。

远程目录尚未直接检查，不能声称已看到两种文件同时存在；但重复应用测试与远程错误的索引和输出长度均完全一致。应优先核对并清理远程同目标类的两种文件。

诊断源码：`docs/tools/server_bugs_2026_10_24/DiagnoseEnergyDiff.java`。该工具只读模组、发布包和指定差分，不写游戏文件。

## 重装方式

[FluxOfTetra 专用重装包](../releases/SDBF-FluxOfTetra-HotAI-Reinstall-2026-10-24.zip)只包含已验证的同一份能量修复类、安装说明和校验清单，不改变修复逻辑，也不包含麻将类。

1. 停止远程服务端。
2. 将以下文件中存在的文件备份到整个 `hotai/` 目录之外，再从原位置移走：

   ```text
   hotai/net/yiran/fot/common/TetraFEStore.class
   hotai/net/yiran/fot/common/TetraFEStore.badiff
   ```

3. 合并重装包的 `hotai/` 到服务端根目录。启动前同目录只应存在新 `TetraFEStore.class`，没有同名 `.badiff`。
4. 完整启动服务端。首次成功加载后，HotAI 把该 `.class` 转成 `.badiff` 并删除 `.class` 是正常行为。不要随后再把同一 `.class` 覆盖回来。
5. 核对启动日志是否有 `Patched class: net/yiran/fot/common/TetraFEStore`，以及 `ItemEvents.modification` 是否不再出现上述错误；单条成功加载记录不足以证明后续没有重复应用，应同时确认错误消失。

仅处理这一个类，不清空其他 HotAI 文件，也不修改 KubeJS、配置或玩家数据。本机的现有差分单独应用正常，因此本次没有替换本机有效补丁。

如果清理后仍出现该错误，需要核对远程 FluxOfTetra JAR 和补丁文件指纹、目录清单及完整启动日志，再排查其他转换器或文件损坏；不要继续反复叠加补丁文件。

## 文件指纹

| 文件 | SHA-256 |
| --- | --- |
| `FluxOfTetra-6.9.0-1.0.5.jar` | `9d51820890f2bf9df05152ee9e7cdc1a3fb30b101ccc71ed00f753da0f4b4f69` |
| 重装用 `TetraFEStore.class` | `88b1cbbd16e572bc5a73d8bd163e20abd65dd6c83020a47761e12c07e2dc63de` |
| 本地单独应用正常的旧差分 | `b597def687e2a3fb42df973175e97617170d9a4c3a370018bed42f7ff63dbabc` |

麻将点击无反应尚未由这份日志解释。该问题仍需确认远程 v2 的安装状态、同目标类是否有重复补丁，以及点击时牌桌处于哪一种结算状态。
