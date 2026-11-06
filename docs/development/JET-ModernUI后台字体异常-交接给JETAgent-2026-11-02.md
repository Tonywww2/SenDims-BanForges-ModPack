# JET / ModernUI 后台字体异常：交接给 JET Agent

用户要求：JET 问题由 JET Agent 修复。本次只提供调查与建议，不修改 JET 项目、模组或配置。

## 优先修复的失败

日志：`C:/Users/Tony/AppData/Roaming/PrismLauncher/instances/SenDimsBanForges/minecraft/logs/latest.log`，本次会话 2026-11-02 17:43 启动。

17:46:08.528，线程 `justenoughthreads-start`：

```text
JEI failed to start on the background thread
java.lang.IllegalArgumentException
  icyllis.modernui.graphics.text.CharArrayIterator.setIndex(CharArrayIterator.java:87)
  com.ibm.icu.text.RuleBasedBreakIterator.handleNext
  com.ibm.icu.text.RuleBasedBreakIterator.setText
  icyllis.modernui.graphics.text.EmojiFont.calcGlyphScore(EmojiFont.java:109)
  icyllis.modernui.graphics.text.FontCollection$Run.getBestFont
  icyllis.modernui.graphics.text.LayoutPiece.<init>
  icyllis.modernui.mc.text.TextLayoutEngine.lookupVanillaLayout
  icyllis.modernui.mc.text.ModernStringSplitter.measureText
  net.minecraft.client.gui.Font.m_92895_
  mezz.jei.library.plugins.vanilla.cooking.fuel.FurnaceFuelCategory.getMaxWidth(FurnaceFuelCategory.java:38)
  mezz.jei.library.plugins.vanilla.cooking.fuel.FurnaceFuelCategory.<init>
  mezz.jei.library.plugins.vanilla.VanillaPlugin.registerCategories(VanillaPlugin.java:219)
  mezz.jei.library.load.PluginCaller
  com.tonywww.jeioptimize.runtime.JeiOptExecutors.lambda$runJeiStartAsync$1
```

17:46:08.553，`Render thread` 随后记录 `Error executing task on Client`、`RuntimeException: JEI failed to start`，cause 为同一字体异常。结果是 JEI 此次启动失败，而不只是某一条配方页面损坏。

完整该异常块另存于 `docs/archive/jei-errors-2026-11-02/jet-font-failure.log`；当前日志可能被下次启动覆盖。

## 环境

- Minecraft 1.20.1，Forge 47.4.10，Java 21。
- JET：`mods/justenoughthreads-0.14.6+1.20.1.jar`。
- JEI：`mods/jei-1.20.1-forge-15.74.0.228.jar`。
- ModernUI：`mods/ModernUI-Forge-1.20.1-3.12.0.1-universal.jar`。
- ICU4J 71.1。
- `config/justenoughthreads-client.toml`：`asyncStartup=true`、`asyncIngredientFilter=true`、`parallelVanillaRecipes=false`。
- `mainThreadPlugins` 仍是五个默认插件，未包含 `jei:minecraft`。

JEI 本体原版插件 UID 是 **`jei:minecraft`**，不是 `minecraft`。仅添加 `minecraft` 命名空间不能匹配这个 UID。

## 已确认与待确认

已确认：本次分类创建调用确实在 JET 后台启动线程执行，并进入了 ModernUI 的字体排版路径，在 ICU 文本迭代器处抛出异常。安装 JAR 的主线程策略没有在此环境中把该分类阶段调回客户端线程。

合理推断：后台分类创建与客户端渲染/字体状态共享存在兼容边界问题。仍需 JET Agent 核对 ModernUI 的字体、Emoji 和 BreakIterator 复用机制并做实机复现；当前证据不能精确证明哪一个对象发生了数据竞争，也不能仅凭近期修改时间把原因归给某条 KubeJS 配方。

补充核对当前 ModernUI 实际字节码后，已找到明确的共享可变对象：`EmojiFont` 声明 `private static final BreakIterator sBreaker`，`calcGlyphScore()` 直接取得它，调用 `setText(new CharArrayIterator(...))`，随后循环调用 `following()`；该方法没有同步、克隆或 ThreadLocal 隔离。JET 后台和客户端排版同时进入时存在真实竞争窗口。现场尚未采集两个线程的具体交错，最终触发过程仍需实机确认。反编译输出见 `docs/archive/jei-errors-2026-11-02/EmojiFont-javap.txt`。

前后对照：17:38 会话的日志同时包含 JET 0.14.6、JEI 15.74.0.228、ModernUI 3.12.0.1，JEI 进入了配方注册及转移处理器阶段，没有此次字体异常；17:46 同一版本组合才出现失败。因此“此前正常”与竞争窗口偶发命中相符。字体缓存是否命中、客户端当前渲染文字与线程调度都可能改变窗口重叠；暂不能认定某一次具体配方或界面更新是直接原因。

当天更早的同版本日志能看到 `apotheosis:socketing` 预览错误，但没有这条字体异常。问题可能具有时序相关性。

## 代码入口

JET 工程：`C:/Users/Tony/Documents/EX/ForgeDev/JEI-Optimize`。

- `src/main/java/com/tonywww/jeioptimize/mixin/PluginCallerMixin.java`：`jeiOptimize$timePluginCall()` 判断阶段/插件是否要求主线程，并调用 `runOnMainThreadAndWait()`。
- `src/main/java/com/tonywww/jeioptimize/config/JeiMainThreadPluginPolicy.java`：`requiresMainThread(pluginUid, phase, fontBakingRequiresMainThread)`。
- `src/main/java/com/tonywww/jeioptimize/config/JeiOptFeatureFlags.java`：`pluginRequiresMainThread()`。
- `src/main/java/com/tonywww/jeioptimize/runtime/JeiOptExecutors.java`：后台启动、客户端线程桥接、取消状态。

当前 1.20.1 源码分支使用 `fontBakingRequiresMainThread=false`；现有规则只在该标志为 true 时强制 `Registering categories` 回主线程。它覆盖了较新 Minecraft 的字体行为，却没有体现本环境 ModernUI 替换字体后的约束。安装 JAR 的 `JeiMainThreadPluginPolicy` 已反编译核对，输出见同归档目录的 `JeiMainThreadPluginPolicy-javap.txt`。

## 建议修复方向

优先修正 JET 的阶段路由：让会创建分类 UI、测量字体的 **`Registering categories`** 阶段在客户端线程执行，至少覆盖本次 `jei:minecraft` + ModernUI 组合，并评估其他分类插件的同类风险。

保留 `Registering recipes` 等已支持的重型后台阶段，继续沿用现有主线程桥接、generation 失效与取消机制。由 JET Agent 判断采用普遍的阶段约束还是经过验证的 ModernUI 兼容条件；不要仅依赖 Minecraft 大版本标志。

临时配置措施是在 `mainThreadPlugins` 加入完整 UID `jei:minecraft`，但会连同其耗时配方注册阶段一起转回客户端线程。本实例尚未应用该措施。

## 验收建议

1. 使用上述真实版本和本整合包复现，记录每个阶段、UID 和线程名。确认 Vanilla `registerCategories` 与其字体测量在 `Render thread`。
2. 确认原有其他插件/原版配方后台路径仍按设计执行；分类顺序、配方数量、焦点索引与运行时发布保持一致。
3. 重复进入世界、退出重进、资源重载，并在构建中退出，验证不会死锁、跨 generation 发布或残留后台任务。
4. 启动结果应包含完整 JEI runtime，不出现 `CharArrayIterator.setIndex`、`JEI failed to start` 或分类遗漏。纯路由单测不能代替 ModernUI 实机验收。

## 与本问题分开的日志

- **17:47:21、17:48:17、17:48:20 的最后三条 FATAL**：SkyblockBuilder 的 `EventListener.onEntityJoinLevel()` 将客户端世界强转 `ServerLevel`，触发客户端闪电异常。已按用户要求另做 SkyblockBuilder HotAI 补丁，不属于本次 JET 修复。
- `apotheosis:socketing`：动态锻造预览访问空镶嵌槽列表，该错误在当天更早会话也存在；当前暂缓。
- 两条旧 JEI INI 配置迁移失败：节名/键名大小写与新版迁移器预期不符；当前暂缓。
- PneumaticCraft 的十二条 `fuel_quality` / `no world available`：已核对原方法是在传入世界和当前集成服务器都为空时记录。应核查启动时机和世界生命周期，不能仅凭后台线程名断言加白名单即可修复。本次未改。
