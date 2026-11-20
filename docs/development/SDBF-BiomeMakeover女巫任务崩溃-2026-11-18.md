# Biome Makeover 女巫任务崩溃（Weighted List Was Empty）

2026-11-18。玩家反馈：刷怪笼和村庄袭击刷出女巫时反复抛出 `Weighted List Was Empty`，最终把服务端 tick 崩掉；11-16 的两次崩溃（自然生成、袭击）是同一个问题。依据：实例中的 `biomemakeover-FORGE-1.20.1-1.11.4.jar` 及其内嵌的 `taniwha-forge-1.20.0-5.4.4.jar`（反编译）。

## 调用链

```
Witch.<init> → WitchMixin_Quests.onConstruct → WitchQuestList.populate
  → WitchQuestHandler.createQuest → QuestCategories.choose → WeightedList.sample
  → throw "Weighted List Was Empty"
```

女巫在构造函数末尾就抽任务，不分服务端和客户端；`populate` 只检查分类列表是否为空（`hasQuests`），远程客户端上列表为空会直接跳过。抛在实体构造阶段，KubeJS 的生成事件拦不住。

## 原因

taniwha 的 `WeightedList.sample()`：

```java
Collections.shuffle(this.entries);                       // 原地乱序
float p = random.nextFloat() * (float) this.totalWeight;
float count = 0;
for (Entry e : entries) { if ((count += e.weight) > p) return e.object; }
throw new RuntimeException("Weighted List Was Empty");
```

女巫任务用到的三个列表都是静态共享的：任务分类 `QuestCategories.CATEGORIES`、任务物品数量 `WitchQuestHandler.ITEM_COUNT_SELECTOR`、任务奖励 `RewardTables`。每次抽取都会原地乱序这个共享列表，而它可能同时被两个线程使用：

- 单人游戏：内置服务端线程构造女巫，同一时刻客户端线程收到生成包也构造女巫，两边用的是同一个 JVM 里的同一份静态列表。
- 专用服务端：C2ME 的世界生成线程放置女巫小屋时构造女巫，主线程的刷怪笼、袭击也在构造。

两个线程同时原地交换元素，会把某些条目复制、某些丢失，条目权重之和不再等于 `totalWeight`。和变小以后，随机阈值 `p` 落在两者之间时循环走完也找不到条目，就抛这个异常。列表只在数据包重载（开服、`/reload`）时清空重建，所以一旦弄坏会一直抛，直到重启；刷怪笼每秒构造女巫，最容易撞上并发，也最先刷屏。

分类权重没有被清 0：BM 自带 10 个分类，权重 1～10，整合包没有覆盖这些数据。只有列表为空或条目与 `totalWeight` 不一致时才会抛；列表为空时 `populate` 不会进来，所以只能是后者。玩家把 `common.json` 权重改为 100 的数据包并不能修复：重启后列表重建，看起来恢复正常，并发再次发生时仍会复发。

## 修复

特供模组 SenDims 新增软 mixin `mixin/taniwha/WeightedListSampleMixin`（`@Pseudo`，未安装 Biome Makeover 时不生效）：把 `sample()` 里的 `Collections.shuffle` 改为不操作。

- 按权重抽取不需要先乱序，概率不变。
- 抽取时列表保持只读，多线程同时读取是安全的；三个共享列表都由此修复。
- 列表写入只发生在数据包重载时，与抽取同时发生的概率可以忽略。

已经弄坏的列表只在内存里，重启游戏或服务端即恢复，存档不受影响。

## 发布

随 `SDBF-Update-2026-11-18` 的特供模组 1.1.4 发布，客户端和服务端都要更新。尚未进游戏实测：需要用女巫刷怪笼长时间运行，确认不再出现该异常。
