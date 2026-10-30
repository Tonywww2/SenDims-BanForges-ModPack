# 调查与临时工作归档

此目录用于 AI 调查输出、离线验证、编译产物和发布暂存。除本说明和根目录 `.gitignore` 外，全部内容都应被 Git 忽略。新建任务目录无需再添加独立的 `.gitignore`。

`cache/` 保存早期调查中仍有参考价值的源码、结论和历史备份；`tmp/` 用于临时工作输出。可再生的编译类、HotAI 往返测试差分、测试世界、重复解压日志、测试堆快照和发布副本可以清理，不保证长期保留。当前维护的工具入口在 [docs/tools](../tools/)。

目录对应关系和数量见[迁移清单](../maintenance/ai-artifact-relocation-2026-10-22.json)。旧文档中的 `local/world_tree_work/` 等路径属于当时的工作记录；当前已不存在的文件未生成替代副本。

建模工具依赖仍位于 `.cache/modeling-python/`，独立模组回滚备份仍位于 `.cache/mod-backups/`。

实际游戏采样默认写入 `heap-samples/`，清理时须与采样工具验证用的测试堆快照区分。原始游戏日志、存档、正在使用的 `hotai/` 补丁及 `.sdbf-backups/` 回滚目录不属于可再生测试产物。
