# FTB Library 侧栏按钮配置被重置的 HotAI 补丁

适用：`ftb-library-forge-2001.2.13.jar`（SHA-256 `41810281b65336265cae2c88412022d02f2f0a3f28c66a06173d86f98acf14a7`），仅客户端。

## 原因

`SidebarButtonManager` 是客户端资源重载监听器。每次资源重载（启动、F3+T、切换资源包或语言）都会读取 `config/sidebar_buttons.json`，然后 `saveConfig()` 用「本次已加载的按钮」重新生成整个文件：

- 某次重载里没有加载的按钮会从文件中删掉，下次出现时恢复默认值 `true`。按钮缺席的情况包括：模组没加载或加载出错的启动、资源包没启用、同一命名空间里前面的按钮 JSON 抛异常（整个命名空间后面的按钮都会被跳过）。
- 文件无法解析时按空配置处理，再用默认值覆盖原文件。空文件不会有任何日志。
- `FileWriter` 先清空文件再写入，写入中途进程被结束会留下空文件，下次启动又全部变回默认值。

整合包历史里 `ftblibrary` 的 `toggle.*` 和 `ftbchunks` 的 `chunks`、`claim_chunks` 多次从 `false` 变回 `true`，与上面的行为一致。

## 修改

只替换 `saveConfig()`，读取和按钮加载逻辑不变：

- 以现有文件为基础合并，只更新当前已加载按钮的值。其他按钮的条目原样保留。
- 文件存在但不是合法的 JSON 对象时不覆盖，只记录警告。空文件按不存在处理。
- 内容没有变化时不写文件。需要写入时先写 `sidebar_buttons.json.tmp`，再整体替换原文件。
- 输出格式与原版相同（制表符缩进）。旧格式的 `"命名空间:按钮": true` 条目在对应按钮加载后改写到命名空间对象里。

## 构建

```powershell
& ./docs/tools/ftb_sidebar_config_fix/Build-And-Verify.ps1
```

产物位于 `docs/archive/ftb-sidebar-config-2026-11-17/hotai/dev/ftb/mods/ftblibrary/sidebar/SidebarButtonManager.class`，构建时用 ASM 的 `CheckClassAdapter` 校验整类字节码。脚本只构建，不安装。

## 安装与回退

把 `hotai/dev/ftb/mods/ftblibrary/sidebar/SidebarButtonManager.class` 放到游戏根目录的同一路径，完整重启。HotAI 在类首次加载时把 `.class` 转成 `.badiff`，属于正常现象。

回退：关闭游戏，移走该类的 `.class` 或 `.badiff`，再启动。FTB Library 版本变化后需要重新核对再构建。
