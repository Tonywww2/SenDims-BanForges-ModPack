# sjap_adder 专用服务端崩溃修复（2026-11-11）

## 现象

专用服务端在「冥灾帝陨·神威」（`se.sjap_adder.the_lich_of_dead`）命中生成死之球时崩溃：

```
java.lang.NoSuchFieldError: Class com.dinzeer.sjapadder.entity.DeadBall does not have member field 'java.util.Deque trailPositions'
	at com.dinzeer.sjapadder.entity.DeadBall.<init>(DeadBall.java:63)
	at com.dinzeer.sjapadder.se.kamuy.TheLichOfDead.spawnDeadBall(TheLichOfDead.java:40)
```

## 原因

sjap_adder 1.1.7 把拖尾坐标字段 `trailPositions` 标成 `@OnlyIn(Dist.CLIENT)`，却在构造函数里初始化。专用服务端加载类时 Forge 会删掉这个字段，构造函数里的赋值随即报 `NoSuchFieldError`。单人游戏（客户端内置服务端）不受影响。与特供模组已有的 `DeadBallMixin`、`TheLichOfDeadMixin` 无关。

扫描了整合包里的拔刀剑系模组，同样的问题还有 `WhirlingSwordEntity`（拔刀剑技「回旋剑舞」）。两个类对该字段的其他读写（`updateTrailPositions`、`getTrailPositions`）都只在客户端执行。

死裁、EX·冥府死灾两个拔刀剑技同样会生成死之球，也走这个构造函数。

## 处理

特供模组 `slashblade_sendims-1.1.1.jar` 新增 `sjap_adder.DeadBallServerTrailMixin`、`sjap_adder.WhirlingSwordServerTrailMixin`：在构造函数里跳过对 `trailPositions` 的赋值。`SenDimsMixinConfigPlugin` 只在专用服务端应用这两个 mixin（客户端字段存在，保持原样）。
