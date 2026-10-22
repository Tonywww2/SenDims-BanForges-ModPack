# 拔刀剑模型与贴图审计

生成时间：2026-10-21T10:53:32-07:00（America/Los_Angeles）。

扫描 360 个模组 JAR、KubeJS 覆盖和启用的文件资源包。合并后有 213 个命名刀定义，对应 103 个武器 OBJ（含本体默认模型）、202 张武器贴图；另统计 35 个未被命名刀直接引用的 OBJ。

这是当前磁盘资源的静态检查，不是 FPS 基准测试。未修改任何游戏资源，也未启动游戏。

现有 latest.log 最近一次实际加载记载 OBJ 为 138 个，与本次文件扫描 一致；该次 fallbackParses=0。这是既有日志交叉核对，未另行启动游戏。

## 统计口径

- `faces` 为 OBJ 的 `f` 行数；三角面按每个 n 边形 n−2 个统计。四边形不能与三角形直接按 f 行比较。
- 文件总三角面包含完整、破损、碎片、鞘、特效和物品栏网格；这些状态通常不会同时渲染。
- 正常网格 = `blade`＋`sheath`；物品栏列为 `item_blade`，无鞘状态另记录在 JSON/CSV 的 `item_bladens` 列。
- 原生渲染的重复绘制、附魔光效、透明层、光影和实体数量会改变实际开销；面数比例不等于 FPS 比例。
- 贴图内存为宽×高×4 的 RGBA8 估算；不含 mipmap、驱动开销或光影附加贴图。分辨率本身不代表美术质量。
- 同一 OBJ 或贴图被多把刀复用时按资源去重；所有刀到资源的对应关系见 blades.csv。
- 模组资源同路径存在不同内容且优先级相同的情况标为歧义，不把文件名排序当成已确认的 Forge 加载顺序。
- 无名五刀及永罚四刀的客户端覆盖单独核对；运行时绑定与定义不一致项记录在 audit.json。
- Tetra 拔刀物品继承原生 ItemSlashBlade，两个 SlashBladeTetra 模组没有独立 OBJ；按刀状态绑定的模型统计，不把拼装组合当成新的独立 OBJ。

## 本体原始标准模型（直接取安装的 SlashBlade JAR）

| 模型 | OBJ 面 | 总三角面 | 刀身＋鞘 | 物品栏 | 原始贴图尺寸 |
|---|---:|---:|---:|---:|---|
| `slashblade:model/blade.obj` | 1,005 | 1,005 | 215 | 235 | 64×128 |
| `slashblade:model/named/agito.obj` | 2,057 | 2,057 | 603 | 623 | 128×256 |
| `slashblade:model/named/dios/dios.obj` | 3,330 | 3,330 | 926 | 946 | 256×256 |
| `slashblade:model/named/muramasa/muramasa.obj` | 2,215 | 2,215 | 680 | 700 | 256×512 |
| `slashblade:model/named/sange/sange.obj` | 2,477 | 2,477 | 723 | 743 | 192×384 |
| `slashblade:model/named/yamato.obj` | 1,501 | 1,501 | 463 | 483 | 64×128 |
| `slashblade:model/named/yasha/yasha.obj` | 916 | 916 | 151 | 167 | 128×128 |
| `slashblade:model/named/yasha/yasha_true.obj` | 745 | 745 | 151 | 167 | 128×128 |

## 主要发现与优化顺序

- 本体默认常态为 215 个三角面；本体传统命名刀为 151～926，文件总量为 745～3330。不能仅用默认刀的最低负载代表所有本体名刀。
- 常态三角面超过 2,000 的独立武器模型有 21 个。
- 常态三角面超过 5,000 的独立武器模型有 7 个。
- 常态三角面超过 10,000 的独立武器模型有 2 个。
- 几何优先核对：凯伯水晶光剑、灵刃狐月刀、樱剪、红樱、隐月·刃、狐月刀灵狐/仙狐、知更鸟及无名五刀。
- 贴图优先核对：绝念 2134×2133；猩红龙刃、蓝之梦、闪刀零衣与赫刀零衣为 2048×2048。
- 神威/极神威共用的常态网格均为 151 个三角面；役刀六种共享模型均为 600，物品栏为 456，符合本体名刀的数量级。
- 永罚大剑常态 580、最终永罚 780，贴图共用 128×128；黄金两剑常态约 1652～1704，御厨子 2836。
- 无名五刀常态 3397～4397，贴图都是 256×512。贴图属于本体已有尺寸级别，优先优化网格更有依据。
- 未被命名刀直接引用的解构者完整版仍有 82952 个文件总三角面，常态刀身 16142。不能直接断言它在当前战斗中使用，也不能把此类模型当成不会影响加载的空文件。
- 202 个武器贴图资源路径按 RGBA8 基础层估算总计 197.08 MiB；仅按图片内容哈希去重为 198 份、195.52 MiB。游戏按资源路径缓存，不能假设不同路径的相同图片会自动合并。


## 当前武器模型全表

| 模型 | 使用刀举例 | 刀数 | OBJ 面 | 总三角面 | 刀身＋鞘 | 正常/默认倍率 | 物品栏 | 贴图尺寸 |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `slashblade:model/named/light_sword/light_sword.obj` | 未来神兵 「凯伯水晶能量光剑」 | 1 | 91,690 | 91,690 | 15,130 | 70.37× | 15,272 | 192×384 |
| `foxextra:model/foxex/model2.obj` | 灵刃「狐月刀」 | 1 | 31,869 | 31,869 | 14,792 | 68.80× | 5,486 | 192×384 |
| `last_smith:model/named/bot_roukan/model.obj` | 「樱剪」 | 1 | 21,674 | 21,674 | 9,866 | 45.89× | 870 | 512×512 |
| `redtassel:model/katana/redtassel_blade.obj` | 红樱 | 1 | 12,611 | 12,611 | 8,839 | 41.11× | 20 | 1024×1024 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/emptyblade/emptyblade.obj` | 「隐月·刃」 | 1 | 27,141 | 27,141 | 8,093 | 37.64× | 5,237 | 4×4 |
| `foxextra:model/foxex/model.obj` | 狐月刀「灵狐」、狐月刀「仙狐」 | 2 | 23,343 | 23,343 | 6,266 | 29.14× | 5,486 | 192×384 |
| `slashblade:model/named/robin/robin.obj` | 「知更鸟」 | 1 | 32,744 | 32,744 | 5,316 | 24.73× | 5,336 | 8×8 |
| `slashblade_addon:model/terra/terra.obj` | 「大地之刃」 | 1 | 19,074 | 19,074 | 4,934 | 22.95× | 3,478 | 512×256 |
| `sdbf:model/nameless/nameless_king.obj` | 无名王者「无冠」 | 1 | 16,960 | 16,960 | 4,397 | 20.45× | 4,397 | 256×512 |
| `sdbf:model/nameless/nameless_judgement.obj` | 无名「天罚」 | 1 | 16,452 | 16,452 | 4,257 | 19.80× | 4,257 | 256×512 |
| `sdbf:model/nameless/nameless_thunder.obj` | 无名「雷霆」 | 1 | 16,020 | 16,020 | 4,137 | 19.24× | 4,137 | 256×512 |
| `sdbf:model/nameless/nameless_lone.obj` | 无名「孤高」 | 1 | 15,616 | 15,616 | 3,989 | 18.55× | 3,989 | 256×512 |
| `slashblade:model/named/ruined_sword/ruined_sword.obj` | 古神兵 「残败大剑」 | 1 | 19,781 | 19,782 | 3,940 | 18.33× | 3,960 | 1024×1024 |
| `sdbf:model/nameless/nameless_faded.obj` | 无名「褪名」 | 1 | 12,824 | 12,824 | 3,397 | 15.80× | 3,397 | 256×512 |
| `slashblade_addon:model/tboen/model.obj` | 型月刀「空之境界」 | 1 | 27,376 | 27,376 | 3,317 | 15.43× | 3,359 | 512×512 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/dragonblade/dragonblade.obj` | 龙刃「猩红」 | 1 | 10,942 | 10,942 | 3,270 | 15.21× | 3,290 | 2048×2048 |
| `slashblade:model/named/kagari/kagari.obj` | 闪刀 「燎里」 | 1 | 16,228 | 16,228 | 3,164 | 14.72× | 3,184 | 1024×1024 |
| `last_smith:model/named/sagequoia/model.obj` | 名刀「将军木」 | 1 | 6,000 | 6,000 | 3,159 | 14.69× | 1,332 | 256×512 |
| `last_smith:model/named/odachi/model.obj` | 「神乐」村正、大太刀「」 | 2 | 10,137 | 10,137 | 2,893 | 13.46× | 2,531 | 256×512 |
| `slashblade_sendims:model/sukuna/mizushi.obj` | 咒王刀「御厨子」 | 1 | 15,408 | 15,408 | 2,836 | 13.19× | 2,836 | 256×256 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/magicblade/magicblade.obj` | 「魔刃」 | 1 | 12,279 | 12,279 | 2,236 | 10.40× | 2,256 | 512×256 |
| `sjap_adder:model/icf/icfex/model.obj` | 龙王铸「炎龙刀」、天顶剑「伪」魔剑、龙王铸「雷龙刀」 | 3 | 12,244 | 12,244 | 1,982 | 9.22× | 2,002 | 512×256 |
| `blades_derby:model/uma_odachi_haru.obj` | 大太刀「春丽」 | 1 | 8,285 | 8,285 | 1,939 | 9.02× | 1,752 | 256×512 |
| `blades_derby:model/uma_odachi_halo.obj` | 大太刀「光环」 | 1 | 8,285 | 8,285 | 1,891 | 8.79× | 1,768 | 256×512 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/dimension/dimension.obj` | 次元之刃「伪」 | 1 | 5,683 | 5,683 | 1,740 | 8.09× | 1,711 | 128×256 |
| `slashblade_addon:model/laemmle/blade.obj` | 「幻魔炼金拵」 | 1 | 5,683 | 5,683 | 1,740 | 8.09× | 1,711 | 128×256 |
| `slashblade_sendims:model/holy_swords/caliburn.obj` | 「必胜黄金之剑」 | 1 | 6,616 | 6,616 | 1,704 | 7.93× | 1,704 | 128×128 |
| `slashblade_sendims:model/holy_swords/excalibur.obj` | 「誓约胜利之剑」 | 1 | 5,924 | 5,924 | 1,652 | 7.68× | 1,652 | 128×128 |
| `last_smith:model/named/roukan/model.obj` | 「楼观剑」、狱界剑「楼观剑」 | 2 | 3,162 | 3,162 | 1,627 | 7.57× | 700 | 512×512 |
| `last_smith:model/named/eievui/model.obj` | 「伊布之刃」 | 1 | 7,272 | 7,272 | 1,579 | 7.34× | 1,486 | 256×512 |
| `slashblade_addon:model/murakumo/model.obj` | 神剑「天丛云」 | 1 | 4,283 | 4,283 | 1,527 | 7.10× | 1,611 | 512×512 |
| `slashblade:model/named/hayate/hayate.obj` | 闪刀 「飒天」 | 1 | 7,934 | 7,934 | 1,380 | 6.42× | 1,400 | 1024×1024 |
| `slashblade:model/named/winchester/winchester.obj` | 温彻斯特 | 1 | 7,272 | 7,272 | 1,352 | 6.29× | 1,372 | 1024×1024 |
| `slashblade:model/named/roze/roze.obj` | 闪刀 「露世」 | 1 | 6,926 | 6,926 | 1,300 | 6.05× | 1,320 | 1024×1024 |
| `slashblade_addon:model/wanderer/wanderer.obj` | 「风来之刃」、「风来之械刃」 | 2 | 5,850 | 5,850 | 1,240 | 5.77× | 1,260 | 256×256 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/kumasakura/kumasakura.obj` | 山樱「伪」 | 1 | 8,324 | 8,324 | 1,198 | 5.57× | 1,218 | 256×256 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/sword/sword.obj` | 「黑刃」、「白刃」 | 2 | 3,454 | 3,454 | 1,193 | 5.55× | 20 | 256×256 |
| `slashblade_addon:model/murasama/murasama.obj` | 高周波刀「村雨」 | 1 | 3,344 | 3,344 | 1,092 | 5.08× | 1,090 | 512×512 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/kingblade/kingblade.obj` | 「灭」 | 1 | 2,826 | 2,826 | 982 | 4.57× | 1,002 | 512×512 |
| `last_smith:model/named/sekiro/fushigiri.obj` | 不死斩「拜泪」 | 1 | 1,645 | 1,645 | 963 | 4.48× | 20 | 256×512 |
| `slashblade:model/named/dios/dios.obj` | 幽匿「斩月」、伪物「永罚」、无铭「永罚」等 | 4 | 3,330 | 3,330 | 926 | 4.31× | 946 | 256×256 |
| `slashblade:model/named/witch_broom/witch_broom.obj` | 「魔女的扫帚~」 | 1 | 5,022 | 5,022 | 918 | 4.27× | 962 | 256×256 |
| `slashblade_addon:model/kirisaya/kirisaya.obj` | 「大黑天」、宝刀「大黑天」、无神「无刃」 | 3 | 2,586 | 2,586 | 832 | 3.87× | 852 | 128×256 |
| `energyblade:model/hf_blade.obj` | 高周波刀 | 1 | 3,255 | 3,255 | 809 | 3.76× | 829 | 512×512 |
| `slashblade:model/named/dissociator/dissociator_simple.obj` | 未来神兵 「解构者」 | 1 | 3,476 | 3,476 | 806 | 3.75× | 808 | 1024×1024 |
| `slashblade_addon:model/frostwolf/frosty_cherry.obj` | 冻樱刃「雪花苍月」 | 1 | 3,713 | 3,713 | 805 | 3.74× | 825 | 256×512 |
| `sdbf:model/damnation/damnation.obj` | 「永罚」 | 1 | 3,532 | 3,532 | 780 | 3.63× | 780 | 128×128 |
| `blades_derby:model/uma_hishi.obj` | 奇迹「蓝菱」 | 1 | 2,427 | 2,427 | 744 | 3.46× | 764 | 256×512 |
| `slashblade:model/named/raye/raye.obj` | 赫刀「零衣」、闪刀 「零衣」 | 2 | 3,532 | 3,532 | 744 | 3.46× | 816 | 2048×2048 |
| `slashblade_addon:model/frostwolf/frost_wolf.obj` | 明兽刃「阳牙冰狼」 | 1 | 2,613 | 2,613 | 731 | 3.40× | 751 | 256×512 |
| `slashblade:model/named/dojikiri_yasutsuna/dojikiri_yasutsuna.obj` | 童子切安纲 | 1 | 2,475 | 2,475 | 723 | 3.36× | 743 | 192×384 |
| `slashblade:model/named/sange/sange.obj` | 数码「马娘狂热」、「黑瞳」、狐月刀「黑狐」等 | 5 | 2,477 | 2,477 | 723 | 3.36× | 743 | 192×384 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/purplesblade/purplesblade.obj` | 紫刃「虚」 | 1 | 2,279 | 2,279 | 688 | 3.20× | 708 | 256×512 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/xblades/xblades.obj` | 「命刃」 | 1 | 1,834 | 1,834 | 688 | 3.20× | 20 | 256×512 |
| `last_smith:model/named/hakurou/model.obj` | 「白楼剑」、狱界剑「白楼剑」 | 2 | 2,215 | 2,215 | 680 | 3.16× | 700 | 256×512 |
| `slashblade:model/named/muramasa/muramasa.obj` | 茶座「漆黑高楼」、黑刀「魂灵影」、白剑「姬」等 | 8 | 2,215 | 2,215 | 680 | 3.16× | 700 | 256×512 |
| `last_smith:model/named/rf_roukan/model.obj` | 「文始」 | 1 | 2,315 | 2,315 | 649 | 3.02× | 411 | 256×512 |
| `slashblade:model/named/agito.obj` | 天云「残云」、伪物「鄂门」、锈掉的鄂门等 | 7 | 2,057 | 2,057 | 603 | 2.81× | 623 | 128×256 |
| `slashblade:model/named/egg_lan/egg_lan.obj` | 姬姬之刃 「蓝小蛋」 | 1 | 2,055 | 2,055 | 603 | 2.81× | 623 | 512×1024 |
| `slashblade_sendims:model/yakuman/celestial.obj` | slashblade_sendims:yakuman_chiihou、slashblade_sendims:yakuman_chisei_chuuren、slashblade_sendims:yakuman_chuuren等 | 4 | 2,372 | 2,372 | 600 | 2.79× | 456 | 256×256 |
| `slashblade_sendims:model/yakuman/dragon.obj` | slashblade_sendims:yakuman_daisangen、slashblade_sendims:yakuman_sangen_jirei | 2 | 2,372 | 2,372 | 600 | 2.79× | 456 | 256×256 |
| `slashblade_sendims:model/yakuman/jade.obj` | slashblade_sendims:yakuman_hekigyoku_suukantsu、slashblade_sendims:yakuman_ryuuiisou、slashblade_sendims:yakuman_suukantsu | 3 | 2,372 | 2,372 | 600 | 2.79× | 456 | 256×256 |
| `slashblade_sendims:model/yakuman/shadow.obj` | slashblade_sendims:yakuman_chinrou_suukou、slashblade_sendims:yakuman_suuankou | 2 | 2,372 | 2,372 | 600 | 2.79× | 456 | 256×256 |
| `slashblade_sendims:model/yakuman/solitary.obj` | slashblade_sendims:yakuman_chinroutou、slashblade_sendims:yakuman_kokushi、slashblade_sendims:yakuman_tenju_kokushi | 3 | 2,372 | 2,372 | 600 | 2.79× | 456 | 256×256 |
| `slashblade_sendims:model/yakuman/wind.obj` | slashblade_sendims:yakuman_daisuushii、slashblade_sendims:yakuman_shishou_kiitsu、slashblade_sendims:yakuman_shousuushii等 | 5 | 2,372 | 2,372 | 600 | 2.79× | 456 | 256×256 |
| `last_smith:model/named/yamato_neo/yamato_neo.obj` | 「阎魔刀」 | 1 | 2,641 | 2,641 | 599 | 2.79× | 619 | 128×256 |
| `slashblade_addon:model/yukari/model.obj` | 結月刀「付喪-改」 | 1 | 4,165 | 4,165 | 595 | 2.77× | 767 | 256×512 |
| `sdbf:model/damnation/greatsword.obj` | 古大剑「永罚大剑」 | 1 | 2,636 | 2,636 | 580 | 2.70× | 580 | 128×128 |
| `sjap_adder:model/icf/icf/model.obj` | 龙骨刀「炎刃」、龙骨刀「白」、龙骨刀「霆刃」 | 3 | 2,573 | 2,573 | 576 | 2.68× | 596 | 256×128 |
| `last_smith:model/named/sakura/model.obj` | 邪魔刃「双」、邪魔刃「修罗」、驱魔刃「杏」等 | 5 | 1,682 | 1,682 | 565 | 2.63× | 411 | 256×512 |
| `cialloblade:model/ciallo/blademaster.obj` | 「千恋万花」 | 1 | 1,810 | 1,810 | 536 | 2.49× | 711 | 256×512 |
| `slashblade:model/named/hand_of_malenia/hand_of_malenia.obj` | 化圣 「玛莲妮亚的义手刀」 | 1 | 3,328 | 3,328 | 536 | 2.49× | 556 | 1024×1024 |
| `slashblade_addon:model/blademaster/blademaster.obj` | 侍月刀「炎水薄斩」、圣幸刀「绿乃雾」、月光樱「吹雪一闪」 | 3 | 1,810 | 1,810 | 536 | 2.49× | 711 | 256×512 |
| `last_smith:model/named/sekiro/kusabimaru.obj` | 名刀「楔丸」 | 1 | 807 | 807 | 524 | 2.44× | 20 | 256×512 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/blade/blade.obj` | 钻石剑「」、金剑「」、铁剑「」等 | 6 | 3,146 | 3,146 | 504 | 2.34× | 524 | 160×160 |
| `sjap_adder:model/nihill/nihil_over_bx.obj` | 终狱刀「绝念」 | 1 | 1,995 | 1,995 | 496 | 2.31× | 516 | 2134×2133 |
| `slashblade_addon:model/nihil/nihil.obj` | 炼狱刀「血雨红樱」、炼狱刀「耀魂似蛭」、妖刀「红樱」等 | 7 | 1,567 | 1,567 | 496 | 2.31× | 516 | 256×512 |
| `blades_derby:model/uma_black.obj` | 无敌「黑将」 | 1 | 1,594 | 1,594 | 492 | 2.29× | 512 | 256×512 |
| `last_smith:model/named/smith/model.obj` | 天云「速风」、天云「无念」、「胧村正」等 | 5 | 1,547 | 1,547 | 492 | 2.29× | 512 | 256×512 |
| `slashblade_addon:model/wa/wa.obj` | 利刀「苍梅」、名刀「武士刀」、名刀「太刀」 | 3 | 1,547 | 1,547 | 492 | 2.29× | 512 | 256×512 |
| `sjap_adder:model/tw/agito_ex.obj` | 噬魂「鄂门」、结月刀「缘结」 | 2 | 1,647 | 1,647 | 484 | 2.25× | 504 | 128×256, 768×1536 |
| `sjap_adder:model/tw/agito_ex_true.obj` | 祸灾「大蛇鄂门」 | 1 | 1,707 | 1,707 | 484 | 2.25× | 504 | 896×1792 |
| `last_smith:model/nagasada/model.obj` | 魂樱刀「永贞」 | 1 | 1,415 | 1,415 | 463 | 2.15× | 483 | 64×128 |
| `slashblade:model/named/yamato.obj` | 「隐者之竹光」、名刀「金纸竹光」、「血纸竹光」等 | 6 | 1,501 | 1,501 | 463 | 2.15× | 483 | 64×128 |
| `slashblade_addon:model/darkraven/dark_raven.obj` | 「暗鸦」 | 1 | 1,325 | 1,325 | 375 | 1.74× | 395 | 256×512 |
| `pseudoedge_break_dawn:model/pseudo/named/pseudosword/vitex/vitex.obj` | 荆棘之刃「虚」 | 1 | 1,493 | 1,493 | 347 | 1.61× | 367 | 400×800 |
| `sjap_adder:model/tw/frostbane_moonveil.obj` | 妖刀「蓝之梦」、寒妖刀「冰胧月」、妖刀「血桑轮结月」等 | 4 | 4,328 | 4,328 | 325 | 1.51× | 1,611 | 1024×1024, 2048×2048, 512×512 |
| `slashblade:model/named/diamond_sword/diamond_sword.obj` | 「钻石剑」 | 1 | 1,316 | 1,316 | 228 | 1.06× | 248 | 160×160 |
| `last_smith:model/slashblade/model.obj` | 拔刀剑「」 | 1 | 820 | 820 | 215 | 1.00× | 215 | 64×128 |
| `slashblade:model/blade.obj` | 上品「竹光」、宝刀「霜露」露台、灼刀「炽心」露台等 | 16 | 1,005 | 1,005 | 215 | 1.00× | 235 | 64×128 |
| `slashblade_addon:model/darkraven/snow_crow.obj` | 「雪鸦」 | 1 | 1,005 | 1,005 | 215 | 1.00× | 235 | 256×512 |
| `slashblade:model/named/clothesline/clothesline.obj` | 双刀流 「物干竿」 | 1 | 1,390 | 1,390 | 179 | 0.83× | 199 | 192×384 |
| `slashblade:model/named/kanze_masamune/kanze_masamune.obj` | 名刀 「备前长船长光」、无铭 「观世正宗」、妖刀 「村正」等 | 5 | 1,387 | 1,387 | 179 | 0.83× | 199 | 192×384 |
| `slashblade:model/named/wakizashi/wakizashi.obj` | 双刀流 「胁差」 | 1 | 1,350 | 1,350 | 179 | 0.83× | 199 | 192×384 |
| `sjap_adder:model/kaumyex/kamuyex.obj` | 极神威「诺克特」·暗轮破斩、极神威「帝斯陀」·冥灾帝陨、极神威「阿贝」·灼热影舞等 | 6 | 1,062 | 1,062 | 151 | 0.70× | 167 | 256×512 |
| `slashblade:model/named/yasha/yasha.obj` | 伪月刀「夜叉」、夜叉 | 2 | 916 | 916 | 151 | 0.70× | 167 | 128×128 |
| `slashblade:model/named/yasha/yasha_true.obj` | 暮月刀「夜叉」、夜叉「鬼哭」 | 2 | 745 | 745 | 151 | 0.70× | 167 | 128×128 |
| `slashblade_addon:model/kamuy/kamuy.obj` | 神威刀「诺克特」、神威刀「帝斯陀」、神威刀「莉芙」等 | 7 | 738 | 738 | 151 | 0.70× | 167 | 256×512 |
| `slashblade:model/named/ranbao/yiran_sword.obj` | 「然宝然宝~」 | 1 | 1,232 | 1,232 | 144 | 0.67× | 164 | 640×640 |
| `slashblade_addon:model/fluorescentbar/fluorescent_bar.obj` | 「荧光」 | 1 | 723 | 723 | 108 | 0.50× | 135 | 64×64 |
| `slashblade_addon:model/toyako/toyako.obj` | 洞爷湖 | 1 | 505 | 505 | 79 | 0.37× | 111 | 128×128 |
| `last_smith:model/sweapon/model.obj` | 鞘付武器「」 | 1 | 395 | 395 | 48 | 0.22× | 48 | 32×32 |
| `slashblade:model/named/air_sword/air_sword.obj` | 无铭 「空气」 | 1 | 61 | 62 | 2 | 0.01× | 20 | 64×64 |

## 其他 OBJ 全表（特效、备用或变形资源）

“未被定义直接引用”不代表未使用；存在代码静态引用的会列在最后一列。

| 模型 | OBJ 面 | 总三角面 | blade＋sheath | 主要分组 | 代码静态引用 |
|---|---:|---:|---:|---|---|
| `slashblade:model/named/dissociator/dissociator.obj` | 82,952 | 82,952 | 16,142 | item_back:20, blade:16142, blade_damaged:15918, blade_fragment:870, effect:870, item_blade:16162, item_bladens:16162, item_damaged:16808 |  |
| `last_smith:model/named/ikaruga/model.obj` | 8,699 | 8,699 | 2,569 | item_blade:2157, item_blade_luminous:67, item_damaged:1291, item_bladens:1306, item_bladens_luminous:57, sheath:1340, blade:1229, blade_luminous:47, blade_damaged:1168, blade_fragment:37 |  |
| `last_smith:model/named/thousand/model_on.obj` | 6,041 | 6,041 | 1,199 | item_blade:1273, item_damaged:1239, item_bladens:999, sheath:240, effect:264, blade:959, blade_damaged:959, blade_fragment:54, blade_luminous:54 |  |
| `last_smith:model/named/thousand/model.obj` | 5,879 | 5,879 | 1,199 | item_blade:1219, item_damaged:1239, item_bladens:999, sheath:240, effect:264, blade:959, blade_damaged:959 |  |
| `last_smith:model/named/arthurs/model_grand.obj` | 5,683 | 5,683 | 1,740 | item_blade:1711, item_damaged:593, item_bladens:551, sheath:1184, effect:44, handle:468, blade:556, blade_damaged:536, blade_fragment:20, item_back:20 |  |
| `last_smith:model/named/arthurs/model_0.obj` | 3,839 | 3,839 | 792 | item_blade:808, item_damaged:1621, item_bladens:199, sheath:609, effect:240, blade:183, blade_damaged:142, blade_fragment:37 |  |
| `last_smith:model/named/murasama/murasama.obj` | 3,344 | 3,344 | 1,092 | item_blade:1090, item_damaged:305, item_bladens:263, item_back:20, blade:265, blade_luminous:69, sheath:827, effect:240, blade_damaged:228, blade_fragment:37 |  |
| `last_smith:model/named/hf_blade/hf_blade.obj` | 3,255 | 3,255 | 809 | sheath:467, sheath_luminous:4, blade:342, blade_damaged:240, blade_fragment:130, effect:467, item_blade:829, item_blade_luminous:4, item_bladens:362, item_damaged:390, item_back:20 |  |
| `last_smith:model/named/arthurs/model_fox.obj` | 2,477 | 2,477 | 723 | item_blade:743, item_damaged:241, item_bladens:199, sheath:544, effect:240, handle:132, blade:179, blade_damaged:142, blade_fragment:37, item_back:20 |  |
| `last_smith:model/named/scorn/model.obj` | 2,088 | 2,088 | 443 | effect:240, item_back.001:20, item_bladens:360, item_blade:327, sheath:304, blade_luminous:248, item_back:20, blade:139, handle:92, blade_damaged:102, blade_fragment:37, item_damaged:199 |  |
| `last_smith:model/named/rf_roukan/model_off.obj` | 1,803 | 1,803 | 649 | item_blade:411, item_bladens:139, item_damaged:197, sheath:396, effect:240, blade:253, blade_damaged:140, blade_fragment:27 |  |
| `sjap_adder:model/nihill/nihilbloodbx.obj` | 1,783 | 1,783 | 496 | blade:139, blade_damaged:102, blade_fragment:37, effect:56, item_blade:516, item_bladens:159, item_damaged:201, sheath:357, sheath_luminous:216 |  |
| `last_smith:model/named/arthurs/model_irsort.obj` | 1,757 | 1,757 | 443 | item_back:20, item_blade:463, item_damaged:201, item_bladens:159, sheath:304, effect:240, handle:92, blade:139, blade_damaged:102, blade_fragment:37 |  |
| `sjap_adder:model/nihill/nihilbloodex.obj` | 1,675 | 1,675 | 496 | sheath_luminous:108, blade:139, blade_damaged:102, blade_fragment:37, effect:56, item_blade:516, item_bladens:159, item_damaged:201, sheath:357 |  |
| `sjap_adder:model/util/the_hole.obj` | 1,584 | 1,584 | 0 | base:432, ring:576, ring_white:576 | sjap_adder-1.1.7-forge.jar!/com/dinzeer/sjapadder/client/render/DeadBallRender.class |
| `sjap_adder:model/util/slash_ss.obj` | 1,176 | 1,176 | 0 | ss:24, base:1152 |  |
| `last_smith:model/named/slashblade/1.obj` | 820 | 820 | 215 | sheath:76, blade:139, blade_damaged:102, blade_fragment:37, effect:56, item_blade:215, item_effect:56, item_damaged:139 |  |
| `slashblade:model/util/slashdim.obj` | 528 | 528 | 0 | base:432, wind:96 | SlashBladeResharped-1.20.1-1.9.65.jar!/mods/flammpfeil/slashblade/client/renderer/entity/JudgementCutRenderer.class |
| `last_smith:model/named/arthurs/model_pear.obj` | 483 | 483 | 80 | blade:80, blade_damaged:39, effect:56, item_blade:96, item_damaged:96, item_bladens:96, item_back:20 |  |
| `last_smith:model/named/sweapon/model.obj` | 395 | 395 | 48 | sheath:12, blade:36, blade_damaged:97, blade_fragment:12, effect:12, item_blade:48, item_bladens:36, item_damaged:142 |  |
| `slashblade:model/util/slash.obj` | 288 | 288 | 0 | base:288 | SlashBladeResharped-1.20.1-1.9.65.jar!/mods/flammpfeil/slashblade/client/renderer/entity/SlashEffectRenderer.class, slashblade_sendims-1.0.22.jar!/com/tonywww/slashblade_sendims/client/YakumanVisualClient.class |
| `slashblade_sendims:model/yakuman/fx_shockwave.obj` | 192 | 192 | 0 | shockwave:192 |  |
| `slashblade_sendims:model/yakuman/fx_tile.obj` | 156 | 156 | 0 | tile:156 |  |
| `slashblade:model/util/lockon.obj` | 140 | 140 | 0 | obj5:1, obj10:1, obj11:1, obj13:1, obj12:1, obj4:1, obj3:1, obj2:1, obj1:1, obj6:1, lockonbase:70, lockonhealthmask:32, lockonhealth:28 | SlashBladeResharped-1.20.1-1.9.65.jar!/mods/flammpfeil/slashblade/client/renderer/LockonCircleRender.class |
| `legendreliclib:model/ss.obj` | 108 | 108 | 0 | ss:24, sb:84 |  |
| `slashblade:model/util/ss.obj` | 108 | 108 | 0 | ss:24, sb:84 | SlashBladeResharped-1.20.1-1.9.65.jar!/mods/flammpfeil/slashblade/entity/EntityAbstractSummonedSword.class |
| `slashblade:model/util/drive.obj` | 96 | 96 | 0 | base:96 | SlashBladeResharped-1.20.1-1.9.65.jar!/mods/flammpfeil/slashblade/client/renderer/entity/DriveRenderer.class |
| `slashblade_sendims:model/yakuman/fx_gate.obj` | 64 | 64 | 0 | gate:64 |  |
| `slashblade:model/util/grim_grip.obj` | 40 | 40 | 0 | obj3:40 |  |
| `redtassel:model/util/the_string.obj` | 18 | 36 | 0 | base:12, base_1:12, base_2:12 | redtassel-1.0.2.jar!/com/alpha/redtassel/client/TheSringSlashRender.class |
| `slashblade:model/util/durability.obj` | 24 | 24 | 0 | base:8, color:8, color_r:8 | SlashBladeResharped-1.20.1-1.9.65.jar!/mods/flammpfeil/slashblade/init/DefaultResources.class |
| `slashblade_sendims:model/yakuman/fx_phantom.obj` | 20 | 20 | 0 | phantom:20 |  |
| `slashblade_sendims:model/yakuman/fx_needle.obj` | 12 | 12 | 0 | needle:12 |  |
| `slashblade:model/util/ring.obj` | 4 | 4 | 0 | (default):4 |  |
| `slashblade:model/util/trail.obj` | 0 | 0 | 0 |  |  |

死球示例：`sjap_adder:model/util/the_hole.obj` 文件总量 1584 三角面，其中 `base` 为 432。DeadBallRender 实际调用 `renderOverridedLuminous(..., "base", ...)`，单球主体只取 432，配套 `sjap_adder:model/util/ss.png` 为 32×32；21 枚球主体单次绘制约 9072 三角面，未含代码生成的拖尾。


## 贴图尺寸分布（资源路径去重）

| 尺寸 | 数量 |
|---|---:|
| 256×512 | 66 |
| 256×256 | 29 |
| 64×128 | 22 |
| 192×384 | 17 |
| 128×256 | 13 |
| 1024×1024 | 10 |
| 512×512 | 9 |
| 160×160 | 7 |
| 128×128 | 6 |
| 512×256 | 5 |
| 2048×2048 | 4 |
| 256×128 | 3 |
| 64×64 | 2 |
| 32×32 | 1 |
| 4×4 | 1 |
| 400×800 | 1 |
| 2134×2133 | 1 |
| 768×1536 | 1 |
| 896×1792 | 1 |
| 512×1024 | 1 |
| 640×640 | 1 |
| 8×8 | 1 |

## 缺失资源与解析提示

本次扫描未发现引用资源缺失或 OBJ 面索引/面类型异常。

## 资源覆盖


## 完整数据

- `blades.csv`：逐把命名刀的名称、模型、面数、贴图尺寸与最终资源来源。
- `models.csv`：全部缓存范围内 OBJ，包括没有被命名刀直接引用的特效/备用模型。
- `textures.csv`：全部武器贴图的尺寸、像素数、RGBA8 估算与复用刀名。
- `audit.json`：完整分组面数、本体原始对照、覆盖来源与缺失项。
- 复现：`python docs/tools/audit_slashblade_models.py`。
