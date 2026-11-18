# 马娘村民交易的 HotAI 补丁

适用：`umapyoi-1.12.73-1.20.1.jar`（SHA-256 `bb85ab88709e592f371aa00bbe296e50fb1b6ffd9345c6f3c219c0de22319756`），客户端和服务端都要装。

## 修改

整类替换 6 个类，源码在 `src/`，按反编译结果重写，方法名使用运行时的 SRG 名称：

- `net.tracen.umapyoi.villager.VillagerTradeHandler`：交易数值调整，详见 `docs/development/马娘村民交易与JEI显示-2026-11-17.md` 第 4 节。
- `net.tracen.umapyoi.villager.itemlisting.*` 5 个交易条目类：
  - 交易者或随机源为空时不再抛异常。数量和价格取区间中值，随机物品、技能书、比赛取第一项，比赛券从服务器主世界读取比赛注册表。Advanced Loot Info（JEI 交易页）用空参数取样，补丁后能显示这些交易。
  - `RandomPriceOrderItemListing` 新增显式价格区间的构造器；原有构造器保留，语义不变（基础价 + 5~19）。
  - 技能书价格改为 16 × 技能等级 + 2 ~ + 6；比赛券价格改为 5 × 村民等级 − 2 ~ 5 × 村民等级。

原有的公开构造器和方法全部保留。

## 构建

```powershell
& ./docs/tools/umapyoi_trades/Build-And-Verify.ps1
```

先核对 umapyoi JAR 的 SHA-256，再编译并用 ASM 的 `CheckClassAdapter` 校验。产物在 `docs/archive/umapyoi-trades-2026-11-17/hotai/`，目录结构与游戏根目录的 `hotai/` 相同。脚本只构建，不安装。

## 安装与回退

把产物合并到游戏根目录的 `hotai/`，完整重启。HotAI 在类首次加载时把 `.class` 转成 `.badiff`，属于正常现象。

已经生成的村民交易保存在村民数据里，补丁只影响之后新生成的交易（新村民、村民升级、新的流浪商人）。

回退：关闭游戏，移走 `hotai/net/tracen/umapyoi/villager/` 下这 6 个类的 `.class` 或 `.badiff`。马娘版本变化后需要重新反编译核对再构建。
