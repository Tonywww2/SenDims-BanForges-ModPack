# Tetra 模块化盾牌 → 平面图标（HotAI 补丁 + KubeJS 资源覆盖）

把 Tetra 的模块化盾牌（`ModularShieldRenderer`，一个 BEWLR）换成一张普通 2D 物品图标，
用来去掉 spark 里那 4.5% 的每帧盾牌重建开销，以及 `ModularShieldBannerModel` 每帧抛出的
`NoSuchElementException`（约 0.4%）。

不新增资源包：模型/贴图直接放在 `kubejs/assets/tetra/` 里，由 KubeJS 自带的
`KubeJS Resource Pack [assets]` 加载。

## 为什么 KubeJS assets 能覆盖 mod 资源

启动日志里资源包顺序（越靠后优先级越高）：

```
Reloading ResourceManager: vanilla, mod_resources, builtin/client/golden_swet_ball/...,
  quest_enhance, KubeJS Resource Pack [assets], file/Minecraft-Mod-Language-Modpack-Converted-1.20.1.zip,
  diagonalblocks:default_block_models
```

`KubeJS Resource Pack [assets]` 排在 `mod_resources` 之后，所以 `kubejs/assets/tetra/...`
会盖掉 Tetra jar 里的同名文件；不需要 `pack.mcmeta`，也不需要往 `options.txt` 的
`resourcePacks` 里加东西（本包本来就在用这种方式覆盖 `ad_astra` 贴图和 `tetra` 的 `zh_cn.json`）。

## 为什么还需要 HotAI 补丁

Forge 1.20.1 里 `ItemRenderer.m_115143_` 的分支（`forge-1.20.1-47.4.10-client.jar` 字节码）：

```
120: aload 8
122: invokeinterface BakedModel.m_7521_()Z      // isCustomRenderer()
127: ifne 451                                  // 是 -> 走自定义渲染器
...
451: IClientItemExtensions.of(stack).getCustomRenderer()
470: invokevirtual BlockEntityWithoutLevelRenderer.m_108829_(...)
```

**真正的开关是烘焙模型的 `isCustomRenderer()`**。Tetra 的盾牌模型父模型是 `builtin/entity`
（`BuiltInModel.isCustomRenderer() == true`），所以每帧都走 `ModularShieldRenderer`。

- **`kubejs/assets/tetra/models/item/modular_shield.json`** 把模型换成 `minecraft:item/generated`
  → `isCustomRenderer()` 变 false → BEWLR 不再被调用，这是性能收益的主要来源。
- **HotAI 补丁**把 `ModularShieldItem$1#getCustomRenderer()` 改成返回
  `IClientItemExtensions.DEFAULT.getCustomRenderer()`（即 `ItemRenderer` 自带的 BEWLR 实例）。
  正常路径下它已经不会被调用，是一层保险：万一以后有别的资源包把盾牌模型又覆盖回
  `builtin/entity` 之类，也不会再拉起 Tetra 的每帧模块化重建（此时盾牌会退化成原版盾牌外观）。

## 目录内容

| 文件 | 说明 |
| --- | --- |
| `PatchTetraFlatShield.java` | 用 ASM 改 `getCustomRenderer()` 方法体，做 24 项结构/校验/HotAI 往返检查，产出 `.class` 和 `.badiff` |
| `Build-And-Verify.ps1` | 编译并运行上面的工具（Java 21 GraalVM + Prism 的 ASM 9.9.1 + hotai-1.0.jar） |
| `Install.ps1` | 把 `.badiff` 装进 `hotai/`，把 `kubejs/` 模板合并进实例的 `kubejs/assets/`，并清掉旧版独立资源包 |
| `make_icon.py` | 生成 16×16 的平面盾牌图标 |
| `kubejs/assets/tetra/` | 覆盖用的模型 JSON ×3 + 图标 |

## 构建 / 安装

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\docs\tools\tetra_flat_shield\Build-And-Verify.ps1
.\docs\tools\tetra_flat_shield\Install.ps1
```

产物：`docs\archive\tetra-flat-shield-2026-11-06\release\hotai\...\ModularShieldItem$1.class|.badiff`

## 目标类与补丁内容

- 目标：`se/mickelus/tetra/items/modular/impl/shield/ModularShieldItem$1`
  （Tetra 6.9.0，原始 SHA-256 `c0f8dd64…415c6c`，1282 字节）
- 原来：`getCustomRenderer()` → `val$renderer.get()`（`NonNullLazy<ModularShieldRenderer>`）
- 之后：`getCustomRenderer()` → `IClientItemExtensions.DEFAULT.getCustomRenderer()`
- 其余字节码（`this$0`、`val$renderer` 字段、构造器）完全不动；工具会逐方法比对确认只有这一个方法变了。

## 安装后的文件

- `hotai/se/mickelus/tetra/items/modular/impl/shield/ModularShieldItem$1.badiff`（369 字节）
- `kubejs/assets/tetra/models/item/modular_shield.json`（`item/generated`）
- `kubejs/assets/tetra/models/item/modular_shield_blocking.json`、`modular_shield_throwing.json`（都指向同一模型）
- `kubejs/assets/tetra/textures/item/modular_shield_flat.png`

## 验证

1. 启动游戏，`logs/latest.log` 里应出现
   `[Hotai/]: Patched class: se/mickelus/tetra/.../ModularShieldItem$1`；
   `Reloading ResourceManager` 行里应能看到 `KubeJS Resource Pack [assets]`。
2. 盾牌在快捷栏/手上/物品栏显示为平面木盾图标；格挡、投掷、模块属性不变。
3. 再采一次 `/spark profiler --timeout 60`：`se.mickelus.tetra.items.modular.impl.shield` 应该从
   Top methods 里消失，`java.lang.Throwable.fillInStackTrace` 也应该一起消失。

## 回滚

删除 `hotai/.../ModularShieldItem$1.badiff`，再删除
`kubejs/assets/tetra/models/item/modular_shield*.json` 和
`kubejs/assets/tetra/textures/item/modular_shield_flat.png` 即可（不必动 `options.txt`）。
