# KubeJS 脚本规范

- JavaScript 变量声明使用 `let`，不要使用 `const` 或 `var`。
- 函数使用 `let 名称 = (...) => { ... };`，不要使用 `function` 声明或表达式。
- 事件回调使用箭头函数。

## 新增结构羽毛笔

为新结构添加结构羽毛笔时，必须同时完成以下三项，不能只添加配方：

1. **合成配方**：在对应阶段的 `server_scripts/recipes/sN_*.js` 中添加配方，优先调用 `server_scripts/utils.js` 的 `sqRecipe(event, structureId, material, type, stage)`。`type=0` 为地图加材料的无序配方，`type=1` 为八份材料围绕地图的有序配方。辅助函数通过 `$StructureQuill.forStructure(structureId)` 生成带目标结构的物品。
2. **结构名称**：在 `assets/kubejs/lang/zh_cn.json` 添加该结构的名称，翻译键按 `ResourceLocation.toLanguageKey("structure")` 生成，通常为 `structure.<namespace>.<path>`，例如 `structure.minecraft.end_city`。不能只添加羽毛笔物品本身的名称。
3. **JEI 展示配置**：在整合包根目录 `config/slashblade_sendims.toml` 的 `[structureQuill].creativeTabStructures` 中追加完整结构 ID，保留其他已有条目并避免重复。该列表生成预设结构羽毛笔变体，JEI 按 `targetStructure` 区分不同目标；此配置修改后需要客户端重启。

- 配方、翻译和配置必须对应同一个实际注册的结构 ID。
- 嵌套结构路径在翻译键中保留 `/`，不要替换成 `.`；例如 `sgjourney:stargate/milky_way/terra_stargate` 对应 `structure.sgjourney.stargate/milky_way/terra_stargate`。
- 完成后核对三项齐全；远程更新时同步配方脚本、语言文件和配置，语言与展示配置需要发给客户端。

## 文档与离线工具

- 设计文档、调查报告、预览素材和离线辅助脚本统一放在整合包根目录的 `docs/`，入口见 `../docs/README.md`。
- 文档放在 `docs/kubejs/` 或对应专题目录，离线工具放在 `docs/tools/`，调查缓存和临时输出放在 `docs/archive/`。
