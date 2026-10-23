# KubeJS 脚本规范

- JavaScript 变量声明使用 `let`，不要使用 `const` 或 `var`。
- 函数使用 `let 名称 = (...) => { ... };`，不要使用 `function` 声明或表达式。
- 事件回调使用箭头函数。

## 文档与离线工具

- 设计文档、调查报告、预览素材和离线辅助脚本统一放在整合包根目录的 `docs/`，入口见 `../docs/README.md`。
- 文档放在 `docs/kubejs/` 或对应专题目录，离线工具放在 `docs/tools/`，调查缓存和临时输出放在 `docs/archive/`。
