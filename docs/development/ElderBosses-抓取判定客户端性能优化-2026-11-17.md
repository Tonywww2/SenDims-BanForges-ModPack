# ElderBosses 抓取判定的客户端性能优化

对象：`elder_bosses-forge-0.1.4+1.20.1`（`com.tonywww.elder_bosses`）。依据是整合包实装 JAR 的反编译结果，以及 2026-11-17 SDBF 性能测试的 JFR 采样。测试场景是初始空岛，附近没有任何 elder_bosses 的 boss。

本文只说明问题和改法，由 elder_bosses 自己实现。整合包和 SenDims 都不对它打补丁。

## 现象

场景里没有 boss，渲染线程上 elder_bosses 的代码仍占 Java 采样的 1.4%（第 3、4 轮共 1213 个样本中的 17 个；四轮合计 0.9%）。这些样本几乎全部落在 `Level.getEntitiesOfClass` / `getEntities` 的实体区段遍历里，来源如下（第 3、4 轮）：

| 入口 | 样本 |
|---|---|
| `ClientGameEvents.onGrabHands`（`RenderHandEvent`） | 5 |
| `ConsortGrabPlayerRenderer.lockLocalInput`（`LocalPlayer.aiStep` 注入） | 5 |
| `ConsortGrabMouseMixin`（`heldLocal`，两种 boss 各一次） | 3 |
| `ConsortGrabCameraMixin` | 1 |
| `MaleniaGrabInput.lock` | 1 |
| 其他 | 2 |

## 调用点与频率

下表是本地玩家没被抓时的情况。"Consort 搜索"指 `ConsortGrabPlayerRenderer.owner(player)`：在玩家包围盒外扩 192 格的范围内 `getEntitiesOfClass(PromisedConsortEntity)`，再逐个比对 `sourceGrab()` 的 `Victim`。"Malenia 搜索"指 `MaleniaGrabInput.held(player)`：外扩 48 格 `getEntities(MaleniaEntity)`，再比对 `grabbedEntityId()`。

| 调用点 | 频率 | 每次的搜索 |
|---|---|---|
| `ConsortGrabClientPlayerMixin`：`LocalPlayer.aiStep` 的 HEAD 与 RETURN | 每 tick 2 次 | Consort + Malenia |
| `ClientGameEvents.onClientTick`（END） | 每 tick 1 次 | Consort |
| `ConsortGrabCameraMixin`：`Camera.setup` 的 HEAD；第一人称时 RETURN 再一次 | 每帧 1–2 次 | Consort |
| `ConsortGrabMouseMixin`：`MouseHandler.turnPlayer` / `onScroll` | 每帧 1 次，滚轮时另加 | Consort + Malenia |
| `ClientGameEvents.onGrabHands`（`RenderHandEvent`） | 每帧每只手 1 次 | Consort |
| `ConsortGrabPlayerModelMixin`：`PlayerModel.setupAnim` | 每个被渲染的玩家模型，包括第一人称空手 | Consort + Malenia |
| `ClientGameEvents.onGrabPlayerRender`（`RenderPlayerEvent.Pre`） | 每个被渲染的玩家 | Consort |
| `ClientGameEvents.onGrabInput`（`InteractionKeyMappingTriggered`） | 每次交互按键 | Consort |
| `ClientConsortSourceFfxRenderer` → `charmPoint` | 每个魅惑标记（仅 boss 在场时） | Consort |

200 FPS 时，本地玩家每秒要做约 900 次以上的 192 格搜索。192 格半径对应 384×384×384 的包围盒，`getEntitiesOfClass` 要遍历其中每个非空实体区段，逐个做类型和包围盒判断。没有 boss 时结果恒为空，遍历成本照付。这部分大多发生在每一帧，非 tick 帧也一样。

## 原因

1. `owner()` 和 `held()` 每次调用都做一次完整的范围实体搜索，既没有缓存，也没有"附近根本没有这类 boss"的快速返回。
2. 模组里已有 `ClientBossRenderIndex`：每个游戏刻遍历一次 `entitiesForRendering()`，缓存 `PromisedConsortEntity`、`MaleniaEntity`、分身和重力岩，并在 `EntityJoinLevelEvent` / 离开世界时失效。抓取判定没有用它。
3. 同一 tick 内 `lockLocalInput()` 被调用 3 次，`MaleniaGrabInput.lock()` 2 次；同一帧内本地玩家的抓取状态也被重复判定多次。

## 改法

### 1. 抓取判定改走 `ClientBossRenderIndex`（主要收益）

- `ConsortGrabPlayerRenderer.owner(player)`：遍历 `ClientBossRenderIndex.sources()`，筛选同时满足以下条件的实体：
  - 是 `PromisedConsortEntity`；
  - 未被移除；
  - 包围盒与 `player.getBoundingBox().inflate(192)` 相交；
  - `sourceGrab()` 含 `Victim`，且等于玩家 UUID。

  条件与原搜索相同。客户端世界本来就只有追踪范围内的实体，所以覆盖范围也不变。
- `MaleniaGrabInput.held(player)`：同样遍历索引，筛选同时满足以下条件的实体：
  - 是 `MaleniaEntity`；
  - `isAlive()`；
  - 包围盒与 `inflate(48)` 相交；
  - `grabbedEntityId() == player.getId()`。
- 索引为空（附近没有 boss）时直接返回 `null` / `false`。之后本地玩家每帧的判定几乎没有成本；boss 在场时，也只需遍历几个实体。
- `sourceGrab()` 和 `grabbedEntityId()` 是同步数据，每次直接读取，不要缓存。抓取开始或结束仍在收到数据后的第一帧生效。
- 这两个类只在客户端使用（`client.render` 包和客户端 mixin），服务端不受影响。

### 2. 可选：本地玩家的抓取状态每 tick 只算一次

tick 侧的 3 次 `lockLocalInput()` 和 2 次 `lock()`，可以共用一个按 `(level, gameTime)` 缓存的结果。帧侧调用继续实时判定。做完改法 1 后这项收益已经很小，可以不做。

### 3. 不建议的做法

- 不要缩小 192 / 48 格半径，也不要合并 `aiStep` 首尾和 `ClientTick END` 的锁输入调用。这些都会改变锁定的时机和范围；做完改法 1 后，重复调用的成本可以忽略。
- 不要在整合包或 SenDims 里给 elder_bosses 打 mixin。按约定，由模组自身修复。

## 验证

按模组规范，不写 GameTest 或测试代码，用构建加实机验证：

1. 没有 boss 的场景：JFR 采样里，elder_bosses 的帧不再出现在 `getEntitiesOfClass` / `getEntities` 下面。
2. `PromisedConsortEntity` 抓取：
   - 被抓期间键盘、鼠标、滚轮都被锁定，交互键被取消；
   - 第一人称相机跟随抓取位置和朝向，手部不渲染；
   - 第三人称姿态正确，魅惑标记位置正确；
   - 被放开后立即恢复。
3. `MaleniaEntity` 抓取：输入锁定和模型姿态正确，被放开后立即恢复。
4. 多人：其他玩家被抓时，本地看到的该玩家位置和姿态正确。这一项覆盖 `RenderPlayerEvent.Pre` 和 `setupAnim` 对非本地玩家的判定。

## 预期收益

在测试场景（附近没有 boss）中，渲染线程约 1.4% 的 Java 采样会消失。其中大部分在每一帧都会发生，也包括非 tick 帧。
