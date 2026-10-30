# 禁用水晶西瓜充能

适用版本：Darker Depths 1.20.1-2.0.9、HotAI 1.0。

## 修改

水晶西瓜的实际 ID 是 `darkerdepths:crystal_melon`。模组在 `PlayerEvents.onApplySupercharge(RightClickItem)` 中检查主手装备与副手水晶西瓜，调用 `SuperchargeHelper.applyUpgrades`，消耗一个水晶西瓜，并取消这次右键事件。

`config/darkerdepths-common.toml` 只有充能持续时间、挖掘速度、攻击速度、攻击伤害和无法破坏选项，没有充能开关。把倍率设为零仍会触发充能流程与物品 NBT 修改。

HotAI 补丁将上述充能事件方法改为直接返回，因此不会添加充能、消耗水晶西瓜、播放充能音效或拦截装备原有的右键功能。其他方法保持原样，已有充能装备仍由原版到期逻辑清理。水晶西瓜的方块、获取途径与原模组提示文字保持原样。

## 安装与远程更新

发布包：`docs/releases/SDBF-DisableCrystalMelonSupercharge-HotAI-2026-10-29.zip`。

1. 关闭游戏或服务端。
2. 将发布包中的 `hotai/` 合并到 Minecraft 根目录，保留其他补丁。
3. 新增的唯一运行文件为 `hotai/com/naterbobber/darkerdepths/events/PlayerEvents.class`。
4. 重启游戏或服务端；`/reload` 无法加载该补丁。

独立服务端只需服务端安装；单人游戏需要在本地实例安装。无需替换 Darker Depths JAR 或修改配置。

HotAI 首次加载后将 `.class` 转为 `.badiff`，属于正常现象。同一个类不能同时保留旧 `.badiff` 和新 `.class`；重新安装时，先将这个类的旧补丁备份到整个 `hotai/` 目录之外，再放入新 `.class`。远程分发使用发布包里的 `.class`。

回退时关闭游戏或服务端，移走这个路径下的 `PlayerEvents.class` 和 `PlayerEvents.badiff`，再重启即可。

## 验证

- 原类 SHA256：`0fd548a2b900b7a387ca607d9ceb7961b92c2a51771bbf5350229a67d639683a`。
- 补丁类 SHA256：`202daa6d6cfba4a63168b158bdfb51515e4833868f4acd936944ab4d1ee68d77`。
- 已确认充能唯一调用入口，校验补丁方法立即返回，其余方法、字段和类级元数据完全一致。
- ASM 字节码校验，以及当前 HotAI 首次加载、生成差分、再次加载的往返校验通过。
- 未启动完整游戏进行实机验证。

可复现构建：从 Minecraft 根目录运行 `docs/tools/disable_crystal_melon_supercharge/Build-And-Verify.ps1`。输出与校验结果位于 `docs/archive/disable-crystal-melon-2026-10-29/`，构建过程不会自动修改游戏运行文件。
