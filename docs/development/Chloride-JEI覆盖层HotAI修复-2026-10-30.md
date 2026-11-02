# Chloride 与 JEI 15.74 的覆盖层兼容修复（HotAI）

2026-10-30。适用 Chloride 1.8.1（`chloride-FORGE-mc1.20.1-v1.8.1.jar`）、JEI 15.74.0.228、HotAI 1.0。只影响客户端。

## 问题

JEI 侧栏不显示，日志在 `Building ingredient filter took ...` 之后报：

```text
chloride.mixin.json:jei_rei_emi.JeiOverlayMixin -> mezz.jei.gui.overlay.IngredientListOverlay:
InvalidMixinException @Shadow field configButton was not located in the target class
...
java.lang.RuntimeException: JEI failed to start
```

本机 19:58 的运行（JEI 15.74.0.228）同样复现。

Chloride 的 `JeiOverlayMixin` 以 `GuiIconToggleButton` 类型影射 `IngredientListOverlay.configButton`。JEI 15.67 起该字段改为 `IconButton`，`GuiIconToggleButton` 类已删除，`@Shadow` 无法解析。Mixin 应用失败属于致命错误，`IngredientListOverlay` 无法定义，JEI 本次启动无法恢复。Just Enough Threads 只是换了执行这一步的线程，不是原因。

这个 Mixin 实现的是 Chloride 的 `hideJREMI`：搜索框为空时隐藏物品列表，并居中显示提示。它另一个注入点 `IngredientGridWithNavigation.draw` 在新版 JEI 中也已不存在。

## 修复

用 HotAI 替换 `me/srrapero720/chloride/mixins/impl/jei_rei_emi/JeiOverlayMixin.class`，类名和 Mixin 注册不变：

- 目标改为 `mezz.jei.gui.overlay.IngredientListOverlayController`，`@Pseudo`、`remap = false`。
- 在 JEI 自己的 `isListHiddenWhenNotSearching()` 开头注入：`hideJREMI` 开启且搜索文本为空时返回 true。JEI 用这个判断决定是否显示列表，配置按钮状态也随之同步。
- 不再使用 `@Shadow`。搜索文本通过反射读取 `filterTextSource`，并缓存字段；字段缺失时只关闭该选项，不会再让 JEI 启动失败。
- `hideJREMIHint` 的居中提示不再绘制。

本包 `config/chloride-client.toml` 中 `hideJREMI = false`，所以实际效果就是 JEI 恢复正常，界面行为不变。JEI 15.74 自带同类设置 `hideIngredientsWhenNotSearching`，也可以直接用它。

## 安装

本机已放入 `hotai/me/srrapero720/chloride/mixins/impl/jei_rei_emi/JeiOverlayMixin.class`，重启客户端后生效。首次加载后 HotAI 会把它转为同名 `.badiff`。

分发已并入 `docs/releases/SDBF-Update-2026-10-30.zip`，安装脚本会先删除同一目标类的旧 `.badiff`。手动安装时同样不要让 `.class` 与 `.badiff` 并存。专用服务端不需要此补丁。

如果以后更新到修复了这个问题的 Chloride 版本，需删除此补丁；原类 SHA-256 不同，HotAI 差分将无法对应新版本。

## 验证

`docs/tools/chloride_jei_overlay/Build-And-Verify.ps1` 编译补丁并运行 19 项检查，产物写入被 Git 忽略的 `docs/archive/chloride-jei-overlay-2026-10-30/`：

- 原类 SHA-256 `9da7e063bd167800b9396d3c7f58b0e924bc88b23893e2a98c9f1cc2d2404378`，确认其影射 `GuiIconToggleButton configButton`；已安装的 JEI 中该类型不存在。
- JEI 控制器存在 `isListHiddenWhenNotSearching()Z` 与 `filterTextSource`，`isListDisplayed` 经由该判断隐藏列表。
- 补丁类目标、`@Pseudo`、`remap`、注入点与 `require = 0` 正确，没有 `@Shadow`，不再引用已删除的字段与类型；ASM 校验全部方法。
- 实际执行补丁中的读取逻辑：空文本、非空文本、缓存后再次读取、字段缺失时返回空且不抛异常。
- 使用 HotAI 1.0 自带转换器完成首次加载转差分和重启重建，结果一致。
- 补丁类 SHA-256 `190e0996fbaff3b1023f04338f8e6dcd4ef5e8aa2a753409a68741d5c0d36e50`。

未启动游戏实测。进游戏后应确认日志中有 `Patched class: me/srrapero720/chloride/mixins/impl/jei_rei_emi/JeiOverlayMixin`，没有 `JEI failed to start`，JEI 侧栏正常出现。
