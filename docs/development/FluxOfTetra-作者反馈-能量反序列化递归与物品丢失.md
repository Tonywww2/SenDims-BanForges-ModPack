# FluxOfTetra 能量反序列化重入问题与修复建议

面向 FluxOfTetra 维护者，记录日期为 2026-10-24。

在包含 Tetra 与 SlashBladeTetra 的整合包服务端中，玩家登录读取物品时出现 `IllegalStateException: Recursive load of: <item-uuid>`。错误链经过 `TetraFEStore` 的构造函数、NBT 读取和容量查询，重新进入同一物品尚未完成的 Tetra 效果缓存加载。Minecraft 的物品读取代码会将构造失败的物品转换为空物品，因此这个异常存在物品丢失风险。

建议将“读取已保存的能量”与“依据 Tetra 效果计算容量”拆开：反序列化阶段不查询物品能力，待后续容量查询或能量操作时再计算容量、限制能量范围。本文给出已用于临时补丁的具体实现及其验证范围，供上游修复参考。

## 版本与问题范围

| 项目 | 版本或说明 |
| --- | --- |
| Minecraft | 1.20.1 |
| 故障服务端 Forge | 47.4.20 |
| 故障服务端 Java | 18.0.2.1 |
| 分析目标 | `FluxOfTetra-6.9.0-1.0.5.jar` |
| 本地核对依赖 | Tetra 6.9.0；SlashBladeTetra 1.0.17-6.9.0-1.9.65；SlashBlade Resharped 1.20.1-1.9.65 |
| 涉及的类 | `net.yiran.fot.common.TetraFEStore`、`TetraFEProvider`、`AttachCapability` |

代码分析依据上述已发布 JAR 的字节码。下文使用可读的 Minecraft 方法名表达对应逻辑；行号来自原始类的调试信息，不要求与作者当前开发分支一致。

玩家观察到服务器重启或崩溃后，重新登录时快捷栏第一格的物品或拔刀剑丢失，但无法确认是否仅影响该格或该物品类型。日志确认了一次登录期间的拔刀剑兼容链递归异常；没有完整的失败物品 NBT 和槽位记录，因此不能断言所有丢失事件都由本问题导致。

## 日志证据

原服务端 `debug.log` 在 `17:05:18.587` 开始记录 `Recursive load`，之后仍记录玩家登录成功。以下为已核对的关键异常帧摘录，物品 UUID 已替换为占位符，省略无关帧：

```text
java.lang.IllegalStateException: Recursive load of: <item-uuid>
    ...
    at net.yiran.fot.common.TetraFEStore.getMaxEnergyStored(TetraFEStore.java:54)
    at net.yiran.fot.common.TetraFEStore.setEnergyStored(TetraFEStore.java:47)
    at net.yiran.fot.common.TetraFEStore.deserializeNBT(TetraFEStore.java:92)
    at net.yiran.fot.common.TetraFEStore.<init>(TetraFEStore.java:22)
    ...
```

同次登录还记录了包装该异常的 `UncheckedExecutionException`。外层调用链包含 `ItemSlashBlade.getDamage`、`ItemStack.of` 和 `Inventory.load`，说明异常发生于玩家物品栏的存档读取过程。

这里的 UUID 是 Tetra 效果缓存所使用的物品键，不能据此当作玩家 UUID，也不能直接推导物品所在槽位。

## 具体错误逻辑

### 构造能量存储时立即计算容量

原始 `TetraFEStore` 的相关逻辑等价于：

```java
public TetraFEStore(ItemStack stack) {
    this.stack = stack;
    if (!stack.isEmpty()
            && stack.getOrCreateTag().contains("FOT$energy")) {
        deserializeNBT(stack.getOrCreateTag().getCompound("FOT$energy"));
    }
}

public void deserializeNBT(CompoundTag tag) {
    setEnergyStored(tag.getInt("energy"));
}

public void setEnergyStored(int energy) {
    this.energy = Math.max(0, Math.min(energy, getMaxEnergyStored()));
}

public int getMaxEnergyStored() {
    if (!capacityCached) {
        Item item = stack.getItem();
        if (item instanceof IModularItem modular) {
            capacity = modular.getEffectLevel(stack, FEItemEffects.FE_STORE);
        } else {
            capacity = 0;
        }
        capacityCached = true;
    }
    return capacity;
}
```

问题不在 NBT 中的整数是否合法，而在于 `deserializeNBT → setEnergyStored` 带入了依赖物品能力的容量计算。即使保存的能量是 `0`，只要进入该反序列化路径，原实现仍会调用 `getMaxEnergyStored()`。

`capacityCached` 初始为 `false`，只有 `getEffectLevel()` 成功返回后才变为 `true`，因此它无法保护本次首次求值期间的重入。

### 物品效果与能力初始化形成循环

按调用方向整理后的关键路径如下；这是依赖关系图，不是原日志逐行复制：

```text
Inventory.load
  → ItemStack.of / ItemStack 构造
    → ItemSlashBlade.getDamage
      → Tetra.getEffectDataCached(物品键 K) 开始加载
        → ISlashBladeTetra.getEffectData / getSBEffectData
          → ItemStack.getCapability
            → Forge 附加物品能力
              → AttachCapability.attach
                → new TetraFEProvider(stack)
                  → new TetraFEStore(stack)
                    → deserializeNBT(FOT$energy)
                      → setEnergyStored
                        → getMaxEnergyStored
                          → IModularItem.getEffectLevel
                            → Tetra.getEffectDataCached(同一个 K)
                              → Recursive load
```

第一次效果缓存求值尚未完成，内部又要求加载同一个键。Guava 拒绝这种重入。此处是在服务端同一执行链中发生的循环依赖，不需要多个线程竞争才能触发。

另外，`TetraFEProvider` 先构造存储对象，再创建 `LazyOptional`：

```java
this.energyStorage = new TetraFEStore(stack);
this.lazyOptional = LazyOptional.of(() -> this.energyStorage);
```

因此现有的 `LazyOptional` 没有延迟 `TetraFEStore` 的构造，也没有阻止构造函数读取 NBT 后求容量。只观察到 Provider 使用了 `LazyOptional`，不足以认为该路径已经安全延迟。

### 为什么可能表现为物品消失

已核对的 Minecraft 1.20.1 服务端 `ItemStack.of(CompoundTag)` 字节码包含如下处理：

```java
try {
    return new ItemStack(tag);
} catch (RuntimeException exception) {
    // 原实现还会记录调试日志
    return ItemStack.EMPTY;
}
```

当上述异常沿物品构造链传播到这里，调用者得到的是空物品，玩家登录本身仍可能继续成功。后续若保存该物品栏，空值还可能被写回玩家数据。这能解释“玩家能上线，但物品不见了”的现象。

代码中没有按快捷栏第一格特殊处理的条件。服务器冷启动后缓存尚未建立，符合首次读取触发递归的条件，但当前证据不能给出触发概率；“只丢第一格”“只在崩溃后丢失”均不应作为已确认结论。

## 当前修复方案

核心约束是：**能力构造和 NBT 读取只恢复本地数据，不应反向请求尚在初始化的物品能力。**

本次临时修复仅修改 `TetraFEStore` 的三个方法，保留原 NBT 键名 `FOT$energy` / `energy`、Provider 接口和充放电配置。以下 Java 方法体与临时 HotAI 补丁的行为对应，可在作者源码中直接审阅；不依赖 HotAI 才能实现这项修复。

```java
@Override
public void deserializeNBT(CompoundTag tag) {
    // 不调用 setEnergyStored：该方法会反向查询 Tetra 容量。
    this.energy = Math.max(0, tag.getInt("energy"));
    this.capacityCached = false;
}

@Override
public int getMaxEnergyStored() {
    if (!this.capacityCached) {
        Item item = this.stack.getItem();
        if (item instanceof IModularItem modular) {
            this.capacity = modular.getEffectLevel(
                this.stack, FEItemEffects.FE_STORE);
        } else {
            this.capacity = 0;
        }
        this.capacityCached = true;
    }

    // 容量成功求得后，再规范化从 NBT 恢复的能量。
    this.energy = Math.max(0, Math.min(this.energy, this.capacity));
    return this.capacity;
}

@Override
public int extractEnergy(int maxExtract, boolean simulate) {
    // 原实现先读 energy；必须先确定容量，防止提取旧的超容量值。
    getMaxEnergyStored();

    int extracted = Math.min(
        getEnergyStored(), Math.min(getMaxReceive(), maxExtract));
    if (!simulate) {
        setEnergyStored(this.energy - extracted);
    }
    return extracted;
}
```

`receiveEnergy` 原本就先调用 `getMaxEnergyStored()` 计算剩余空间，因此可以沿用。`setEnergyStored` 继续负责普通写入时的上下界裁剪；只是反序列化不再借用它。

不能把初始化期间的未知容量直接当成 `0` 然后裁掉能量，也不建议通过捕获 `Recursive load` 后返回零容量来隐藏异常。这些处理可能把有效的存档能量错误清零，仍未解除初始化依赖。

## 上游合入时需要考虑的行为

当前补丁采用延后裁剪策略，有以下明确行为：

- 在首次容量查询之前，`getEnergyStored()` 返回从 NBT 读取的非负值，该值暂时可能大于最终容量。`serializeNBT()` 也不会为了保存而强行查询容量，避免再次引入初始化依赖。
- `getMaxEnergyStored()` 现在会规范化能量，因此不是完全无副作用的 getter。对于合法能量，模拟充放电不会改变能量；对于超容量旧数据，首次 `receiveEnergy(..., true)` 或 `extractEnergy(..., true)` 也会因容量查询而触发一次裁剪。
- `deserializeNBT()` 会使容量缓存失效。模块修改、能力失效或其他路径如何刷新容量缓存，仍需沿用或完善作者已有的生命周期设计；本次修复不证明所有动态容量变化都已覆盖。

如果上游希望严格保持“模拟调用完全不改变存储值”以及 getter 无副作用，可考虑在**能够保证效果缓存求值和能力附加均已完成**的时点显式完成容量初始化，再进入普通能量 API。该生命周期方案未在本次补丁中实现，不能直接把容量求值重新放回 Provider 构造或反序列化末尾。

同样，不建议简单把 `getEnergyStored()` 改为每次调用 `getMaxEnergyStored()`：初始化链中的读取者可能因此再次触发同样的循环。

## 复现与验证

### 已完成的方法级回归

测试直接执行原始与修补后的 `TetraFEStore` 方法字节码，使用真实 Guava 缓存；Minecraft 物品、NBT 和 Tetra 接口边界使用测试替身。递归夹具让同一个缓存键的首次加载触发 `new TetraFEStore(stack)`，并让容量查询再次访问该键，与日志中的循环依赖一致。

| 场景 | 原版或修补后的结果 |
| --- | --- |
| 原版在同键缓存加载期间构造能量存储 | 复现 `IllegalStateException: Recursive load` |
| 修补后在同样路径构造，存储 700 FE，容量 1000 FE | 不发生递归；保留 700 FE，之后容量查询得到 1000 FE |
| 单独反序列化 | 不查询 Tetra 效果或容量 |
| 700/1000 FE 时模拟接收 500 FE | 返回 300，存储值仍为 700 |
| 随后实际接收 500 FE | 接收 300，存储值变为 1000 |
| 模拟提取及实际提取 250 FE | 模拟不扣除合法能量；实际扣除后为 750 |
| 保存并重新读取 | 保留 750 FE |
| 负值与超容量普通写入 | 分别裁剪到 0 和容量上限 |
| 反序列化 2000 FE，重新求得容量 400 FE | 缓存重新求值，能量裁剪为 400 |
| 先读取超容量 NBT，再进行模拟或实际提取 | 均不返回超过 400 的可提取量；首次查询会规范化存储值 |
| 非模块化物品 | 容量及规范化后的能量为 0 |

另使用真实 HotAI 转换器验证了首次 `.class` 替换、生成 `.badiff`、再次从差分重建的流程，重建结果与目标补丁一致。相关字节码通过 ASM 分析及 JVM 校验。

这些结果验证了初始化循环及能量操作的相关路径；尚未取得远程完整模组环境安装此补丁后的登录结果，不能将它们等同于完整游戏环境已通过验收。

### 建议作者进行的游戏集成复测

以下是根据故障链设计的复测步骤，不是“仅安装 FluxOfTetra 和 Tetra 即必现”的声明。原案例来自包含 SlashBladeTetra 和其他附属的整合包，尚未确定最小模组集合。

1. 在测试世界准备一个走 SlashBladeTetra 能力读取路径的物品，并确认保存数据包含 `FOT$energy`；记录该物品的完整 NBT、能量和槽位。
2. 正常保存并停止服务端，重新启动以清空进程中的效果缓存，然后登录读取物品。无需通过强制崩溃制造条件。
3. 对比原版与修复版是否出现同一物品键的 `Recursive load`，同时比较物品栏 NBT，不能只以“登录成功”作为通过标准。
4. 分别测试快捷栏第一格、其他快捷栏格和普通背包格；测试保存能量为 0、正数及超容量旧值的情况。
5. 验证充放电、模拟调用、保存重读及再次正常重启；必要时增加箱子、掉落物等其他 `ItemStack` 反序列化入口。
6. 在一次修复后的完整运行中，确认构造和反序列化路径不再进入 `getEffectLevel`，再评估是否还存在其他调用者在能力附加期间主动请求容量。

修复用于防止后续读取失败，不能恢复已经被保存为空的物品；旧物品恢复需要丢失前的玩家数据或世界备份。

## 对应文件与校验值

为便于核对报告针对的版本，记录 SHA-256：

| 对象 | SHA-256 |
| --- | --- |
| 原始 `FluxOfTetra-6.9.0-1.0.5.jar` | `9d51820890f2bf9df05152ee9e7cdc1a3fb30b101ccc71ed00f753da0f4b4f69` |
| 原始 `TetraFEStore.class` | `d8d573e4b67f6f0606b6efd6c32cbd00a9af51e32f4ca06de7f1a9348e627a4a` |
| 临时补丁 `TetraFEStore.class` | `88b1cbbd16e572bc5a73d8bd163e20abd65dd6c83020a47761e12c07e2dc63de` |

临时补丁保留 Java 17 类版本，不要求升级 Forge 或改变存档格式。上游源码修复可直接采用本文的初始化原则，无须引入 HotAI。
