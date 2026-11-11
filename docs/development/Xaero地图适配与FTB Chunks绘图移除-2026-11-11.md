# Xaero 地图适配与 FTB Chunks 绘图移除（2026-11-11）

整合包改用 Xaero 小地图 + 世界地图（另装 XaeroPlus、XaeroZoomout、ftbxaerocompat）。改动全部在特供模组 `slashblade_sendims-1.1.1.jar` 的客户端 mixin 里，Xaero 和 FTB Chunks 都不是编译依赖（字符串目标 + `@Pseudo`，世界地图的类通过反射访问），没装这些模组时对应 mixin 不加载。

## 洞穴模式

- 每个维度只有两档（存在世界地图的维度配置里，小地图和世界地图共用）：
  - **普通（自动）**：显示地表；保留 Xaero 原有的自动切换，周围 3×3 头顶都有遮挡（进入地下）时自动进入洞穴视图，离开后恢复地表。
  - **部分层级**：始终是洞穴视图，相当于 Xaero 的"手动洞穴模式"（起始高度为"自动"）。
- 切片沿用 Xaero 原本的范围：顶端为头顶第一个遮挡方块，最高不超过脚下 +4（没有遮挡时取脚下 +4）；从顶端往下 30 层；渲染时跳过顶端的实心方块，从遇到空气后的第一个方块开始画。
- 不允许调整：小地图自动洞穴模式天花板尺寸固定 2、世界地图自动洞穴模式固定"跟随小地图"、洞穴深度固定 30、手动起始高度（小地图 `minimap_manual_cave_mode_start`、世界地图 `cave_mode_start_y`）一律按"自动"。世界地图原来的"完全"档被移除，旧存档里的"完全"按"部分层级"处理。
- 切换方式：
  - 世界地图：洞穴模式面板里的档位按钮显示"洞穴模式：普通（自动）/ 部分层级"，点击切换；起始高度滑条和输入框已隐藏，也不再写入。
  - 小地图：Xaero 的"切换手动洞穴模式"快捷键（改名为"切换洞穴模式（普通／部分层级）"，默认未绑定）切换同一档位，并在动作栏提示。
  - 小地图信息显示里的"手动洞穴模式"状态改为"部分层级洞穴模式"，在部分层级档时显示。
- 进入世界时，所有维度一律回到普通（自动）：存档里保存的"部分层级"或旧的"完全"等档位在本次会话第一次载入该维度时被重置；之后玩家在本次会话中切换的档位照常生效。
- 设置界面移除的选项：
  - 小地图：洞穴地图开关、允许洞穴模式的维度、自动洞穴模式、洞穴深度、手动洞穴起始高度、清晰洞穴地图、洞穴模式切换延迟、洞穴模式额外缩放；
  - 世界地图：洞穴模式开关、允许洞穴模式的维度、洞穴深度、清晰洞穴地图、自动洞穴模式、洞穴模式切换延迟、默认洞穴模式类型。
  - "显示洞穴起始高度"保留（显示为"洞穴视图顶部 Y"）。深度、起始高度、自动检测参数、"完全"档由代码固定为 Xaero 默认；清晰洞穴地图、额外缩放、切换延迟保持玩家原有数值。
- 相关描述：世界地图档位按钮的说明、洞穴模式图标提示、快捷键名称和信息显示名称在 `kubejs/assets/xaeroworldmap/lang/`、`kubejs/assets/xaerominimap/lang/`（中英文）中改写；动作栏提示和按钮文字在特供模组语言文件中。

相关 mixin：`mixin/xaero/*`，规则集中在 `client/compat/xaero/XaeroCaveMode`。

## FTB Chunks

FTB Chunks 只保留领地数据（服务端同步到客户端的领地/强加载信息，ftbxaerocompat 从这里读取并画在 Xaero 地图上，圈地也在 Xaero 世界地图的右键菜单里进行）。客户端不再：

- 扫描区块、生成和保存地图图像（区块包、方块更新、重绘队列、服务器地图同步全部跳过）；
- 绘制小地图（`renderHud` 只保留开头的维度切换检查，`MapDimension.getCurrent()` 依赖它随维度更新）；
- 打开大地图、圈地界面，绘制世界内路径点，记录死亡点，响应 FTB Chunks 的按键；
- 侧边栏的"地图""圈地"按钮在 `config/sidebar_buttons.json` 中关闭。

原先用于 FTB 小地图的性能优化已整体删除：`performance.FtbMinimapScopeMixin`、`performance.FtbEntityMapIconMixin`，以及只为它们服务的 `MinimapFilterState`、`TextureFilterMemo`、`performance.TextureFilterInvalidationMixin`（原本挂在每次 `GlStateManager._texParameter` 上）和配置项 `performance.hud.minimapIconFilters`（`config/slashblade_sendims.toml` 中的旧条目也已删去）。

旧的 FTB Chunks 地图缓存 `local/ftbchunks/data/` 不再使用，可以删除。
