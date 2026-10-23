# 开发文档与辅助工具

整合包的设计文档、调查记录、预览素材与离线辅助脚本统一存放在本目录。

## 目录索引

| 目录 | 内容 |
| --- | --- |
| [kubejs](kubejs/) | KubeJS 结构说明、拔刀剑目录、天顶及役刀设计、配方路线与材料清单 |
| [development](development/) | 星界宝石设计与 API、模组调查、修复说明和 Tetra 材料模板 |
| [tools](tools/) | 绘图、模型生成、配方文档生成和离线验证工具 |
| [tools/legacy](tools/legacy/) | 旧版处理工具及未接入游戏的调试片段 |
| [assets](assets/) | 零散辅助图片，包括根目录迁入的 `checkerboard.png` |
| [model-audit](model-audit/report.md) | 拔刀剑模型面数与贴图审计 |
| [model-previews](model-previews/) | 模型预览素材 |
| [asteroid_belt](asteroid_belt/index.md) | 小行星带设计与预览 |
| [world_tree_ecology](world_tree_ecology/index.md) | 世界树生态、珊瑚及性能记录 |
| [world_tree_dungeons](world_tree_dungeons/index.md) | 世界树地牢、建筑细节与路线 |
| [world_tree_small_structures](world_tree_small_structures/index.md) | 世界树小型结构 |
| [archive](archive/README.md) | 历次调查、验证快照与临时工作目录 |
| [maintenance](maintenance/ai-artifact-relocation-2026-10-22.json) | 本次整理的原路径、归档路径及校验记录 |

## 常用文档

- [刀名与刀 ID 对照](kubejs/slashblade-list.md)
- [天顶系列设计](kubejs/zenith-series.md)
- [役刀配方依赖图](kubejs/yakuman-recipes.mmd)
- [役刀定义与路线数据](kubejs/yakuman-series.json)
- [万象合金路线设计](kubejs/recipe-research/omni-alloy-route.md)
- [万象合金交互预览](kubejs/recipe-research/omni-alloy-route-preview.html)
- [星界宝石设计表](development/宝石设计表.md)
- [星界宝石实装与测试说明](development/星界宝石系统-实装与测试说明.md)
- [世界树之海实现说明](world_tree_sea_implementation.md)

## 工具入口

以下命令从整合包根目录运行。生成器仍按其原用途更新对应游戏资源，文档和临时输出写入 `docs`。

```text
python -X utf8 docs/tools/validate_omni_alloy.py
python -X utf8 docs/tools/validate_omni_alloy_textures.py
node docs/tools/test_omni_alloy.cjs
python -X utf8 docs/tools/collect_recipe_types.py
python -X utf8 docs/tools/build_recipe_route_design.py
python -X utf8 docs/tools/build_omni_alloy_preview.py
```

根目录原有的 Python 工具现位于 [GIF 帧处理工具](tools/halve_gif_frames.py) 和 [NBT 方块替换工具](tools/replace_nbt_blocks.py)。

## 存放约定

- 新增设计、报告及离线脚本放在上述对应子目录；调查缓存和临时输出放入 `docs/archive/`。
- 游戏加载的 KubeJS 脚本、资源与数据包按原加载结构存放；`AGENTS.md` 和工具配置按其约定位置存放。
- `local/` 中的模组配置、地图数据和自动导出 API 文档由游戏维护。
- `dev_docs/` 中保留原有表格、源画稿、手工提示词和游戏内 Lua 程序；已整理的设计文档和辅助脚本见本索引。
