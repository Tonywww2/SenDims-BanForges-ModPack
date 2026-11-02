# TerraCurio 饰品数值调整

2026-10-30。适用 TerraCurio 0.2.0、SenDims 1.1.1。

| 饰品 | 原效果 | 调整后 | 实现 |
| --- | --- | --- | --- |
| 蠕虫围巾 | 受到伤害 ×0.83（减 17%） | ×0.99（减 1%） | SenDims `mixin/terracurio/WormScarfMixin` |
| 冰冻海龟壳 | 血量 ≤ 50% 时受到伤害 ×0.75（减 25%） | ×0.95（减 5%） | SenDims `mixin/terracurio/FrozenTurtleShellMixin` |
| 十字项链 | 受伤冷却 40 tick | 30 tick | `config/terra_curio-common.toml` 的 `CrossNecklace` |

两个减伤都在 `LivingHurtEvent`、护甲之前结算。两个 Mixin 均为 `@Pseudo`、`remap = false`，用 `@ModifyConstant` 只替换 `apply(LivingEntity, float)` 中唯一的 `0.83F`、`0.75F`；其他判断不变。

冰冻海龟壳保留原触发条件：血量 ≤ 50%，且按原代码须同时佩戴冰冻海龟壳与冰冻护盾。星辰面纱的受伤冷却仍为 40 tick。

物品提示由 `kubejs/assets/terra_curio/lang/zh_cn.json`、`en_us.json` 覆盖：蠕虫围巾改为 1%，冰冻海龟壳与冰冻护盾的外壳提示改为 5%。

## 文件与验证

- 工程源码：`src/main/java/com/tonywww/slashblade_sendims/mixin/terracurio/WormScarfMixin.java`、`FrozenTurtleShellMixin.java`，并在 `slashblade_sendims.mixins.json` 注册。
- 已安装 `mods/slashblade_sendims-1.1.1.jar`，SHA-256 `03c76ab3213eec3a9c0c934bc7c50e532709c48b4dfe556bc9548ce8abc64918`。在[护甲穿透修复](SenDims-TerraCurio护甲穿透重复修复-2026-10-30.md)版本上新增两个类和两项注册，其余条目逐字节不变。
- 构建副本已于 2026-11-01 清理；当前 JAR 由仓库 Gradle 构建，见 [SenDims 行动力恢复调整与结构羽毛笔修复](SenDims-行动力恢复与结构羽毛笔修复-2026-11-01.md)。
- 已核对目标方法中各常量只出现一次，Mixin 字节码只含注解和返回常量。未进游戏实测。

## 远程更新

已并入 `docs/releases/SDBF-Update-2026-10-30.zip`。手动更新时，关闭客户端和服务端后：

1. 服务端与客户端替换 `mods/slashblade_sendims-1.1.1.jar`。
2. 服务端与客户端把 `config/terra_curio-common.toml` 的 `["Invulnerable Time"]` 中 `CrossNecklace` 改为 30；已有服务器只改这一项即可。
3. 客户端添加 `kubejs/assets/terra_curio/lang/zh_cn.json` 和 `en_us.json`。

重启后生效。
