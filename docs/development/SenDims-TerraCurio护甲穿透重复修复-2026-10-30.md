# TerraCurio 护甲穿透重复计算修复

2026-10-30。适用 SenDims 1.1.1、TerraCurio 0.2.0、Apothic Attributes 1.3.7。调查背景见[受伤减伤顺序](伤害减免顺序-护甲前后-2026-10-30.md)。

## 问题

检测到 Apothic Attributes 时，TerraCurio 把自己的 `armor_pass` 映射到 `attributeslib:armor_pierce`。鲨牙项链、蜂刺项链因此给出 Apothic 护甲穿透。

在 `LivingEntity.getDamageAfterArmorAbsorb` 中，两边各扣一次同一个属性：

1. TerraCurio 的 `@WrapOperation` 从护甲中直接减去攻击者的 `armor_pierce`，不考虑韧性。
2. Apothic 的 `@Redirect` 再按 `穿透 × (1 − min(韧性 × 2%, 60%))` 扣一次。

例：穿透 10、护甲 30、韧性 20，应剩 24，实际剩 14；韧性 0 时应剩 20，实际剩 10。

## 修复

只在护甲计算期间，把 TerraCurio 读到的护甲穿透属性换成它自己的 `terra_curio:armor_pass`。本包中实体没有这个属性，TerraCurio 的包装层因此不再减护甲，只保留 Apothic 的计算。星辰斗篷伤害的 −3 护甲保持不变。

- `mixin/terracurio/LivingEntityArmorPassMixin`：在 `getDamageAfterArmorAbsorb` 开头和返回时标记计算窗口，按线程计数，可重入。
- `mixin/terracurio/ModAttributesMixin`：`@Pseudo`，在 `ModAttributes.getArmorPass()` 返回时检查。仅在窗口内、且映射结果正是 Apothic `armor_pierce` 时替换；其他映射不变。
- `compat/terracurio/TerraCurioArmorPass`：窗口计数与替换判断。

窗口外的调用不受影响，项链生成属性修饰时仍得到 `attributeslib:armor_pierce`。未安装 TerraCurio 时，配置插件按目标类不存在跳过 `ModAttributesMixin`，另一个 Mixin 只维护计数。

## 文件

工程源码（`C:/Users/Tony/Documents/EX/ForgeDev/SlashBlade-SenDims`）：

- `src/main/java/com/tonywww/slashblade_sendims/compat/terracurio/TerraCurioArmorPass.java`
- `src/main/java/com/tonywww/slashblade_sendims/mixin/terracurio/LivingEntityArmorPassMixin.java`
- `src/main/java/com/tonywww/slashblade_sendims/mixin/terracurio/ModAttributesMixin.java`
- `src/main/resources/slashblade_sendims.mixins.json`：新增两项注册

正常用 Gradle 构建时，注解处理器会生成 `getDamageAfterArmorAbsorb` 的 refmap。

当前实例的 JAR 是在原 1.1.1 JAR 上合并得到的：新增三个类，追加两项 Mixin 注册，并在 refmap 的 `mappings` 与 `data.searge` 中加入

```text
getDamageAfterArmorAbsorb -> Lnet/minecraft/world/entity/LivingEntity;m_21161_(Lnet/minecraft/world/damagesource/DamageSource;F)F
```

其余 833 个条目逐字节不变。版本号保持 1.1.1。

- 本次构建：SHA-256 `15dd091dda01648569b1c72bda43c09c014a347c65878e455c2546baa04e063b`。之后的[饰品数值调整](TerraCurio-饰品数值调整-2026-10-30.md)在其上又加了两个 Mixin，当前安装版本以那份记录为准
- 构建副本已于 2026-11-01 清理；当前 JAR 由仓库 Gradle 构建，见 [SenDims 行动力恢复调整与结构羽毛笔修复](SenDims-行动力恢复与结构羽毛笔修复-2026-11-01.md)

## 验证

- 三个类以 Java 17 编译，字节码中没有需要 SRG 转换的 Minecraft 成员引用；只引用 Forge 注册表、`ResourceLocation` 构造器和 Apothic `ALObjects`。
- 直接执行编译后的 `TerraCurioArmorPass` 字节码，依赖换成测试替身，15 项检查通过：窗口外不替换、窗口内替换、非 Apothic 映射不替换、嵌套与多余退出、线程隔离、注册表只查一次，以及护甲结果只扣一次穿透。
- 未进游戏实测。

游戏内核对：

```mcfunction
/attribute @s minecraft:generic.attack_damage base set 30
/attribute @s attributeslib:armor_pierce base set 10
/attribute @e[type=minecraft:zombie,limit=1,sort=nearest] minecraft:generic.armor base set 30
/attribute @e[type=minecraft:zombie,limit=1,sort=nearest] minecraft:generic.armor get
```

空手满蓄力攻击该僵尸（护甲韧性为 0）。设读到的总护甲为 A，修复后伤害应为 `30 − max(0, A − 10)`；A 为 30 时约 10 点，修复前为 20 点。偶发暴击会放大结果，多打几次取常见值。也可以把穿透改为 0 对照：两次伤害差应为 10，修复前为 20。

## 远程更新与回退

已并入 `docs/releases/SDBF-Update-2026-10-30.zip`。手动更新时，完整退出客户端和服务端，两边都替换 `mods/slashblade_sendims-1.1.1.jar` 后重启；`/reload` 无效。

回退时停服，换回 Git 中上一版本的 JAR（修复前 SHA-256 `6ead22a338840fc8e14e5ec989e8ec636b40c824224e9b6ac17604bbc3da46f5`）。
