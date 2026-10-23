# 调查与临时工作归档

`cache/` 保存原 `.cache/` 内各项 AI 调查与验证工作的完整目录，包括报告、反编译结果、补丁草稿、验证夹具、预览图和对应快照。`tmp/` 用于原 `.codex-tmp/` 一类的临时工作输出。

历史快照保持迁移前的文件内容，用于追溯当时的状态；当前维护的工具入口在 [docs/tools](../tools/)。归档目录继续由 Git 忽略，避免将可再生缓存、反编译类及工作副本纳入版本库。

目录对应关系和数量见[迁移清单](../maintenance/ai-artifact-relocation-2026-10-22.json)。旧文档中的 `local/world_tree_work/` 等路径属于当时的工作记录；当前已不存在的文件未生成替代副本。

建模工具依赖仍位于 `.cache/modeling-python/`，独立模组回滚备份仍位于 `.cache/mod-backups/`。
