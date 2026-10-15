"""Build the design documents and validate the proposed dependency graph.

This tool writes documentation only. It does not register items or recipes.
"""
from __future__ import annotations

import collections
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "kubejs/docs/recipe-research"

# Stable original row catalog: exclusions do not renumber surviving step IDs.
# Name | serializer (or explicitly named code mechanic) | output medium | integration constraint
BRANCHES = {
"bio": ("星浆仿生隔膜", "豆浆、盐卤、谷物、蜂蜜、木质纤维", """
盐卤凝固|tofucraft:bittern|block|豆浆或专用流体源右键盐卤；结果必须是 BlockItem。
承重压制|tofucraft:harder|block|专用前驱必须注册为 TofuBlock，带 hardness 0 至 7 与随机刻；普通 Block 不可用。
豆腐锅|tofucraft:tofu_pot_shapeless|item|使用锅内合成接口和实际槽位，保留容器返还。
TF 有序合成|tofucraft:tf_craft_shaped|item|使用 tf 能量字段；这是消耗 TF 的合成，与普通工作台分开。
TF 无序合成|tofucraft:tf_craft_shapeless|item|使用 tf 能量字段，输入与前一步使用不同专用 ID。
豆腐工作站|tofucraft:tofu_work_station|item|按 base、ingredient、sub 三种输入和 result 编排。
石臼研磨|sakura:stone_mortar|item|遵循模组石臼配方槽位与工具消耗。
砧板切制|sakura:chopping|item|使用原生 chopping 配方结构。
烹饪|sakura:cooking|item|食物型辅助材料用于生化基体，不能与熔炉合并计数。
发酵|sakura:fermenting|fluid|输出专用发酵液；显式写入 fluidTag、amount、recipeTime。
蒸馏|sakura:distillation|fluid|发酵液作为本步原料；流体产物接灌装收集。
高级蜂箱生产|productivebees:advanced_beehive|item|配置专用生产蜂与采集条件；花通常是设施，不可声称每次生产都会消耗前驱。
蜜蜂方块转化|productivebees:block_conversion|block|明确 bee、from、to；专用源块只参与本次转化，转换后采集。
蜜蜂物品转化|productivebees:item_conversion|item|按原生输入输出和对应蜂种执行，隔离其他掉落物。
蜂蜜离心|productivebees:centrifuge|item|本路线主要产物概率设为 1；概率副产物不作为必需材料。
蜂蜜灌装|productivebees:bottler|item|用实际瓶或容器产物；自定义中间液必须有配套灌装配方。
盆景培养|native:bonsaitrees3_growing|item|soil 与 sapling 是生长定义；使用生长、收获所得的专用树产物，不写假的加工 serializer。
"""),
"aether": ("苍穹晶格透镜", "天境石材、极寒载液、光晶、孢子", """
祭坛附魔加工|aether:enchanting|item|核对燃料、烹饪时间与原料数量。
冰冻器加工|aether:freezing|item|这一步使用机器，另有下列世界内冻结方式。
圣石碎片转化|aether:ambrosium_enchanting|block|右键世界内专用块；ingredient 与 result 用 block 键。
史维特球转化|aether:swet_ball_conversion|block|使用史维特球右键专用方块；验证消耗和结果。
冰石冻结|aether:icestone_freezable|block|在冰石附近放置专用固体冻胚，按 block-state 配方转换；采集后的同位置冷却要计入节拍。
冰饰品冻结|aether:accessory_freezable|block|佩戴饰品靠近专用固体冻胚触发；空 FluidState 的固体可直接匹配，两个冻结工位分开。
群系放置转化|aether:placement_conversion|block|在指定极寒群系放置可转换源块，biome 条件必须匹配；产物采集后退出该工位。
注入加工|aether_redux:infusion|native_item|注入带特殊附加数据；优先使用模组支持的工具载体并检查其注入状态，不能假设普通锭可注入。
枯萎孢子转化|aether_redux:spore_blighting|block|以孢子右键专用方块；不与发光孢子共用源块。
深天境组合|deep_aether:combining|item|原生 ingredients、output、processing_time、category 字段。
毒液浸泡|deep_aether:poison_recipe|item|将物品实体投入毒液；初版每次单件，避免批量状态与收集时机问题。
金色史维特球转化|deep_aether:golden_swet_ball_recipe|block|使用正确金色史维特球及当前 Redux 兼容包中的物品，不写错到普通史维特球。
发光孢子转化|deep_aether:glowing_spores_recipe|block|右键放置后的专用块；若使用双格草类，须同时处理上下半块。
瓦解号角|twilightforest:crumble_horn|block|from、to 均为方块 ID；要求完整方块产物，避免设为掉落而丢失唯一前驱。
拆解台|twilightforest:uncrafting|item|使用独占中间构件及明确的拆解结果；限制回收总量，不能把最终部件解回多份。
"""),
"mana": ("虹移共振腔", "活木、魔力、花瓣、符文、宝石", """
白雏菊转化|botania:pure_daisy|block|花旁放置专用块，配方 output 为方块状态；不用 ItemStack 当结果。
凝矿兰|botania:orechid|block|以唯一专用源块匹配；该源块仅有一个匹配结果，weight 为正，消除矿化抽签。
狱火凝矿兰|botania:orechid_ignem|block|单独的源块与处理工位；提供花所需魔力。
石莲转化|botania:marimorphosis|block|独立源块只有一个匹配结果；避免通用石头标签与群系加权造成随机分支。
花瓣药剂台|botania:petal_apothecary|item|保留水与完成配方的种子条件；一批一件确定性产物。
魔力池注入|botania:mana_infusion|item|显式设置 mana；催化方块不应在本配方意外消耗。
符文祭坛|botania:runic_altar|item|记录魔力、活石与完成动作；返回的符文和主材料分别核算。
泰拉凝聚板|botania:terra_plate|item|完整多方块底座与火花网络；从原生 mana 字段配置成本。
精灵门交易|botania:elven_trade|item|输入投到门内；要求各批材料数量准确，回收产物不送回门。
植物酿造|botania:brew|native_item|brew 指向已注册效果及兼容瓶，不能任意把 result 改为新锭；消费装有指定效果的原生容器。
神化附魔|apotheosis:enchanting|item|按 Eterna、Quanta、Arcana 和消耗等级配置，唯一原料避免与普通附魔冲突。
神化分解|apotheosis:salvaging|item|输入为受支持的装备或宝石；主产物采用确定范围，不让路线依赖随机稀有词缀。
神化重铸|apotheosis:reforging|native_item|重铸产生装备词缀；配置专用装备载体，后续按真实 NBT 状态验收，不伪造普通材料输出。
武器融合|cataclysm:weapon_fusion|item|使用机械融合砧；以独占构件为 base 和 addition，保持原生 result 结构。
紫晶祝福|cataclysm:amethyst_bless|item|真实紫晶祝福设施及处理时间；按 ingredients、result、time 配置。
"""),
"thermal": ("冰晶相变壳体", "铁、煤、铜、木材、热解油、树脂", """
有序工作台|minecraft:crafting_shaped|item|独占配方 ID 和专用前驱；材料平衡以 1 件为基础。
无序工作台|minecraft:crafting_shapeless|item|用于化合及容器桥接，不替代其他机台产物。
熔炉|minecraft:smelting|item|不为专用产物另外添加烟熏炉或高炉替代配方。
高炉|minecraft:blasting|item|专用输入和结果，只在该类型登记。
烟熏炉|minecraft:smoking|item|安排生物聚合物熟化步骤，与金属高炉步骤分开。
营火|minecraft:campfire_cooking|item|用耐火设施；正常取下成品，避免火焰焚毁掉落物。
切石机|minecraft:stonecutting|item|块材加工成专用衬片，产出数量限定为 1。
锻造台|minecraft:smithing_transform|item|明确 template、base、addition；模板是否消耗按原版逻辑核算。
红石熔炉|thermal:furnace|item|使用热力设备类型，不能只调用原版 smelting 冒充覆盖。
锯木机|thermal:sawmill|item|主产物概率 1，副产物用于补贴成本。
磨粉机|thermal:pulverizer|item|不使用宽泛金属标签覆盖专用中间件。
感应炉|thermal:smelter|item|严格限制输入件数和助熔材料；主产物确定。
冲压机|thermal:press|item|明确所需模具与模式，模具作为设施保留。
熔岩炉|thermal:crucible|fluid|输出专用熔体；以 1000 mB 为一个收集批次。
急速冷冻机|thermal:chiller|item|承接专用熔体，冷却得到专用结构件。
离心分离机|thermal:centrifuge|item|主产物为必需构件，概率副产物不影响通路。
热解炉|thermal:pyrolyzer|fluid|专用热解油输入下一步，固体副产物另算。
分馏精炼机|thermal:refinery|fluid|热解油分出专用重馏分；必须有足够输出槽及流体槽容量。
流体灌装机|thermal:bottler|item|把专用液灌入明确定义的容器，空瓶按原生逻辑返还或消耗。
药水酿造机|thermal:brewer|native_item|使用合法药水载体和已注册药水效果；检查 Potion NBT，不伪造普通材料输出。
结晶器|thermal:crystallizer|item|从专用结晶液得到唯一晶体，设置完整流体与物品输入。
有机灌注机|thermal:insolator|item|消耗肥料、水和专用培养物；主产物确定。
树木提取器|thermal:tree_extractor|fluid|这是世界内树木设施；要求正确树干、树叶和产液配方，不能当通用单槽机器。
蜂巢提取器|thermal:hive_extractor|fluid|绑定原生支持的蜂巢或蜂箱及状态；作为蜂业支线产液设施。
造石机|thermal:rock_gen|block|为专用产物选择受支持的流体组合与接触条件；按原生配方结构，不假设任意 ItemStack 可作流体条件。
"""),
"engineering": ("星门耦合线圈", "门瑞欧、耀魂、合金、太空金属、水晶", """
手动挤压|integrateddynamics:squeezer|fluid|玩家跳跃挤压；红石脉冲复位；产液必须被相邻容器收集。
手动烘干|integrateddynamics:drying_basin|item|承接挤压液，保留真实容器容量。
机械挤压|integrateddynamics:mechanical_squeezer|fluid|独立专用输入，以 FE 驱动；不能与手动版本共用结果。
机械烘干|integrateddynamics:mechanical_drying_basin|item|只接收机械支线的专用液，保证两种工艺都需要。
尘烬整合|dustandash:integrate|item|使用模组 level 与输入槽，不与普通工作台混合。
铣床装配|dustandash:milling|item|5×5 格和 catalyst；step1 铺板、step2 装配是同一 serializer 的两个操作阶段。
尘烬离心|dustandash:centrifuge|item|实际 outputs 为最多八组物品，并使用 tick 字段。
万用电解|dustandash:ionizer|block|机器下方必须放源块或流体源；记录 inputBlock、outputBlock、电子与电极的成本。
合金炉|enderio:alloy_smelting|item|用 Ender IO 专用合金类型，避免机器自动采用原版烧炼产生替代结果。
SAG 磨粉|enderio:sag_milling|item|必需主产物 chance 为 1；研磨球加成不能复制唯一阶段材料。
切片加工|enderio:slicing|item|输入槽和斧、剪刀耐久分别核算。
灵魂绑定|enderio:soul_binding|native_item|使用合法灵魂瓶和实体类型，费用为原生经验单位；唯一组件保留所需灵魂数据。
末影附魔|enderio:enchanting|native_item|原生结果是附魔载体；按 enchantment 和等级字段执行，不假设任意输出锭受支持。
流体罐加工|enderio:tank|item|使用原生容器、流体与模式；唯一液体需要对应 filled container。
火焰合成|enderio:fire_crafting|item|基岩上点火触发，通过 loot_table 产出；不是扔材料进火就能执行。
涂装机|enderio:painting|native_item|原生可涂装方块作载体，验收涂装外观 NBT；不能假设任意普通锭可以涂装。
太空合金炉|ad_astra:alloying|item|独占原料组合，精确写入原生 cookingtime 和 energy。
太空压缩机|ad_astra:compressing|item|专用型板，产出数量独立核算。
燃油精炼|ad_astra:refining|fluid|使用原生 ad_astra:oil 流体标签对应原油 1000 mB，精炼为专用载液 1000 mB，输送到 Naquadah 重液制备。
低温燃料制备|ad_astra:cryo_freezing|fluid|遵守物品原料和流体结果的原生格式。
氧气加载|ad_astra:oxygen_loading|fluid|使用原生支持的含氧流体和氧气载体；不能把普通锭放进氧气槽。
NASA 工作台|ad_astra:nasa_workbench|item|依原生 14 位置 ingredients 和 result.id 配置，实际输出槽需要验证自定义构件适配。
星门结晶|sgjourney:crystallizing|item|按实际结晶机槽位与能耗配置。
星门高级结晶|sgjourney:advanced_crystallizing|item|晶体基座使用上段航天供能线组；两种辅料使用石英、紫水晶碎片各 1，deplete_primary/secondary 均为 true；消耗重液制备产物 1000 mB，不依赖基础结晶产物。
Naquadah 液化|sgjourney:naquadah_liquidizing|fluid|使用独立原液及原生液化结构。
Naquadah 重液制备|sgjourney:naquadah_heavy_liquidizing|fluid|精炼载液 1000 mB 加 sgjourney:pure_naquadah ×1，得到专用重液 1000 mB，全部供高级结晶；机器按配方 input_fluid 接受流体，不要求先经过普通 Naquadah 液化。
"""),
"pneumatic": ("氢压逻辑阀组", "压缩铁、塑料、红石、赛特斯、石英", """
爆炸加工|pneumaticcraft:explosion_crafting|item|唯一中间件 loss_rate 设为 0；在专用爆炸室引爆并延后收集。
压力室|pneumaticcraft:pressure_chamber|item|逐项设置压力及堆叠原料数量，保留输入输出气闸。
装配钻床|pneumaticcraft:assembly_drill|item|使用钻床程序、装配平台和输出口，程序可重复使用。
装配激光|pneumaticcraft:assembly_laser|item|使用激光程序；联合钻刻程序属于同一装配线，不伪造新 serializer。
气动炼油|pneumaticcraft:refinery|fluid|按实际层数、温度、各流体输出与容量设计。
热气动处理|pneumaticcraft:thermo_plant|fluid|同时检查温度、压力和流体类型，不只写处理时间。
流体混合|pneumaticcraft:fluid_mixer|fluid|两个输入分别计量；输出不超过机器容量。
热处理架冷却|pneumaticcraft:heat_frame_cooling|item|max_temp 是开尔文；安装热处理架并达到阈值，不能把 273 当摄氏度。
压力附魔|pneumaticcraft:pressure_chamber_enchanting|native_item|固定处理器；使用原生附魔书、装备与经验瓶，不把 category-only 配方改成自定义锭配方。
压力祛魔|pneumaticcraft:pressure_chamber_disenchanting|native_item|原生可处理载体及书，验收剩余附魔和返还数量。
AE 充能|ae2:charger|item|充能器专用输入输出，不用通用 FE 充电冒充材料转化。
AE 压印|ae2:inscriber|item|模板及中间料按 top、middle、bottom 原生字段配置。
AE 水中转化|ae2:transform|item|circumstance.type 为 fluid、tag 为 minecraft:water；投下完整多种原料。
AE 爆炸转化|ae2:transform|item|同一 serializer 的另一种 circumstance；爆炸工位与气动爆炸工位隔离。
AE 熵变|ae2:entropy|block|手持熵变机械臂操作源块，明确 cool 或 heat 与状态。
PCB 紫外曝光|native:pneumaticcraft_uv|native_item|只用原生未组装 PCB 载体；不能给普通 KubeJS 物品写曝光 JSON。
PCB 蚀刻|native:pneumaticcraft_etching|native_item|原生曝光 PCB 经蚀刻酸或蚀刻槽加工，使用完全曝光结果防止失败。
"""),
"nuclear": ("中子约束环", "专用矿料、酸碱、水、核燃料、受控粒子束", """
核工制造|nuclearcraft:manufactory|item|专用输入和 output 主产物。
核工碎岩|nuclearcraft:rock_crusher|item|确定性主产物；正确配置多组输出。
核工合金熔炼|nuclearcraft:alloy_smelter|item|各原料数量、timeModifier 和 powerModifier 明确。
核工加压|nuclearcraft:pressurizer|item|专用致密板，不能被热力冲压替代。
核工熔融|nuclearcraft:melter|fluid|专用熔体及准确 input/outputFluids 字段。
核工铸锭|nuclearcraft:ingot_former|item|接收上步专用熔体，独占铸件。
核工提取|nuclearcraft:extractor|fluid|模板需同时核对物品输出和流体输出，不能省略原生必需字段。
核工电解|nuclearcraft:electrolyzer|fluid|完整声明多组液体输出，避免输出堵塞。
同位素分离|nuclearcraft:isotope_separator|item|使用指定同位素载体和确定数量。
核工化学反应|nuclearcraft:chemical_reactor|fluid|独占反应液，并使用 inputFluids/outputFluids。
核工流体灌注|nuclearcraft:fluid_infuser|item|物品与专用反应液同时消耗。
核工流体富集|nuclearcraft:fluid_enricher|fluid|原液与添加物明确，产物不与普通试剂共用 ID。
核工离心|nuclearcraft:centrifuge|fluid|多组分离产物留足容量。
核工浸出|nuclearcraft:leacher|fluid|酸液必须来自前置化工支线，空容器不算酸液。
核工结晶|nuclearcraft:crystallizer|item|专用结晶液产生独占晶料。
核工组装|nuclearcraft:assembler|item|槽位数量遵循机器的真实能力。
气体洗涤|nuclearcraft:gas_scrubber|fluid|专用气体、吸收剂和输出分别配平。
核工超冷|nuclearcraft:supercooler|fluid|处理专用气体或冷凝液，避免只更换显示名。
亚原子液化|nuclearcraft:subatomic_liquifier|fluid|使用原生输入和熔体结构，独占物质液。
衰变加速|nuclearcraft:decay_hastener|item|放射性前驱到稳定组分，确定性结果。
核工辐照|nuclearcraft:irradiator|fluid|原生示例为流体输入输出；连接合格中子源，不把它误作普通一槽熔炉。
固体裂变|nuclearcraft:fission_reactor_controller|item|消耗合法燃料并回收乏燃料；完整反应堆及散热设施，不能改成普通机器调用。
熔盐反应堆|nuclearcraft:msr_controller|native_item|以当前版本原生燃料配方和燃料转换为准，先验证其装载接口，不能由名称推断只接受流体。
核聚变|nuclearcraft:fusion_core|fluid|使用合法聚变燃料、温度与供能设施；回收指定产液。
燃料后处理|nuclearcraft:fuel_reprocessor|item|明确回收上游哪种乏燃料，各分离组分要可自动提取。
核工换热|nuclearcraft:heat_exchanger_controller|fluid|heat、输入输出流体与多方块结构缺一不可。
裂变沸腾|nuclearcraft:fission_boiling|fluid|与反应堆热管理共用设施；只统计实际产出的目标蒸汽。
大型涡轮|nuclearcraft:turbine_controller|fluid|输入目标高压蒸汽，回收低压蒸汽，发电不等于新物品产出。
小型蒸汽涡轮|nuclearcraft:steam_turbine|fluid|使用小型设备独立回路，回收其实际输出流体。
球状闪电加工|nuclearcraft:kugelblitz_chamber|item|要求完整腔室与供能，输出专用稳定组分。
靶室|nuclearcraft:target_chamber|item|保留合法 inputParticles、能区和束流，靶料由主线提供；输出可用物品构件。
核工泵|nuclearcraft:pump|fluid|原生 input 可能是收集器或催化装置，不能默认每次消耗；只将实际产液纳入成本。
核工分析|nuclearcraft:analyzer|native_item|原生使用地图并写 is_nc_analyzed NBT；消费经分析的专用地图载体，不能只验空白地图。
"""),
"precision": ("万象校准光栅", "耀魂、刀卷、刻线刀具、镜片、胶卷、药剂", """
耀魂加工|slashblade:proudsoul|native_item|核对原生配方工具与耀魂数据；后续按真实物品和状态消耗。
拔刀有序合成|slashblade:shaped_blade|native_item|result 仍是合法刀，使用独占 blade 标识；不是普通任意 ItemStack 结果。
拔刀锻造|slashblade:slashblade_smithing|native_item|保留 template、base、addition 与 blade 字段；消耗指定专用刀胚。
刀卷研究|last_smith:research|item|专用 blade、ink、paper 研究出专用卷轴。
泰拉工坊|terra_curio:workshop|item|使用 serializer workshop，RecipeType workshop_type 不能填入 JSON 的 type。
Tetra 模组工作台|native:tetra_workbench|native_item|从 data/tetra/schematics 定义部件装配；使用合法模块化工具和独占改进状态。
拔刀模块交换|slashbladetetra:modular_exchange|native_item|原生 NBT 特殊处理器；仅对支持的模块化工具和刀进行交换，结果按模块状态验收。
胶卷显影|exposure:film_developing|native_item|必须是原生胶卷或兼容子类；保留实际曝光数据，不用虚构的新胶卷 ID 代替。
照片复制|exposure:photograph_copying|native_item|使用实际已有照片数据及相纸；验收有效图像数据。
照片老化|exposure:photograph_aging|native_item|使用新打印的照片，保留真实照片数据和老化状态；所需数量由打印补充。
相机组件转移|exposure:component_transferring|native_item|使用原生相机与组件，不能泛化为锭之间的数据转移。
原版酿造|native:minecraft_brewing|native_item|药水效果须合法注册，以原生酿造容器执行，严格检查 Potion NBT。
铁砧加工|native:minecraft_anvil|native_item|使用可合法合并的工具或附魔书；不存在通用 minecraft:anvil JSON serializer。
砂轮处理|native:minecraft_grindstone|native_item|使用可去附魔的工具并检查耐久与诅咒；不存在通用 minecraft:grindstone serializer。
炼药锅淬火|native:last_smith_quenching|native_item|原生 blade_unfinished_3 到 blade_unfinished_4 或樱钢对应刀胚；单件持有并右键有水炼药锅，消耗一层水。
照片打印|native:exposure_printing|native_item|使用显影胶卷、相纸和原生照片打印设施；产物必须保留真实照片数据。
照片叠放|native:exposure_stacking|native_item|按原生照片叠放规则保存多张照片；每张照片由打印供给，校验张数与内容并消耗整叠，不能合成空白占位物。
框架锯切|framedblocks:frame|native_item|使用框架锯及原生框架方块；产物受形状和材料数量限制，不把任意普通锭当框架产物。
"""),
}

REMOVED_STEPS = {
    "bio": {2, 4, 5, 6},
    "aether": {15},
    "mana": {13},
    "engineering": {1, 2, 13, 16, 17, 18, 21, 23, 25},
    "pneumatic": {1, 9, 10},
    "nuclear": {33},
    "precision": {2, 3, 6, 7, 9, 11, 13, 14, 18},
}
REMOVED_RECIPES = {
    row.split("|", 3)[1]: {"step": f"{branch}_{number:02d}", "label": row.split("|", 1)[0]}
    for branch, (_, _, rows) in BRANCHES.items()
    for number, row in enumerate(rows.strip().splitlines(), 1)
    if number in REMOVED_STEPS.get(branch, set())
}

EXCLUSIONS = {
    "nuclearcraft:collision_chamber": "粒子专用输出；接入原生束流上游，不能添加普通物品结果。独立强制关卡需要能区、粒子来源和专用粒子注册设计。",
    "nuclearcraft:decay_chamber": "粒子专用输出；同位素物品的衰变加速由 decay_hastener 覆盖，不混为同一种设备。",
    "nuclearcraft:nuclear_blast": "会在世界中核爆并改写大量方块；本路线的爆炸转化使用可隔离的 AE 爆炸，不强制核爆。",
    "apotheosis:fletching": "当前配置关闭 Village Module，不能要求玩家使用本整合包未启用的制箭台加工。",
    "ad_astra:space_station_recipe": "空间站建造与发射菜单，不是普通物品输出的材料加工配方。",
    "ae2:matter_cannon": "弹药质量或伤害定义，不是合成机器。",
    "aether:incubation": "孵化输出生物，保留为养殖支线，不伪装成材料输出。",
    "twilightforest:transformation_powder": "输入输出都是实体类型，不能把材料 ID 填入 from/to。",
    "deeprealm_4th:frame_disassembly": "3×3 工作台内返还投影框架及吸收材料，是纠错回收；没有净加工进度，不能作为必经增值步骤。",
    "pneumaticcraft:amadron": "贸易及配送系统，保留为供应渠道；基础制造路线不将购买行为计为独立材料加工。",
    "gateways:gate_recipe": "传送门道具的合成包装；波次召唤和掉落是战斗获取方式，不属于材料加工机台。",
    "nuclearcraft:nuclear_furnace": "快照有运行时类型，未找到独立 serializer；保留为烧炼设备候选，不能仅靠普通 smelting 配方保证只经过核动力熔炉。",
}

# Stage-five feed is consumed per finished ingot, never used as a reusable unlock.
# (semantic component ID, purpose, entry blank, medium, [(item, Chinese name, count)])
COMPONENTS = {
    "bio": ("astral_biomembrane", "隔离活性星浆，同时允许反应物定向交换。", "星浆培养液", "fluid", [
        ("titan_moon:azotosome_sheet", "氮质体膜片", 2),
        ("titan_moon:polyphosphazene_coenzyme", "多磷腈辅酶", 1),
        ("deeprealm_4th:star_slurry", "星浆", 1)]),
    "aether": ("celestial_lattice_lens", "折射并校准来自不同维度的投影。", "冰晶光学毛坯", "item", [
        ("titan_moon:cryo_alloy_ingot", "冰晶合金锭", 2),
        ("deeprealm_4th:star_slurry_blank", "星浆晶胚", 1),
        ("deeprealm_4th:star_slurry_crystal", "星浆晶体", 1)]),
    "mana": ("iridescent_resonance_chamber", "将魔力和虹移效应锁定在同一谐振空间。", "虹移腔室基座", "block", [
        ("kubejs:storm_hydrogen_crystal", "风暴氢晶", 1),
        ("kubejs:rainbowshift_entropy", "虹移之熵", 1),
        ("deeprealm_4th:star_slurry_crystal", "星浆晶体", 1)]),
    "thermal": ("cryogenic_phase_housing", "承受高温聚合并缓冲骤冷造成的体积变化。", "冰晶矿质复合坯", "item", [
        ("titan_moon:cryo_alloy_ingot", "冰晶合金锭", 2),
        ("deeprealm_4th:star_slurry_blank", "星浆晶胚", 1)]),
    "engineering": ("stargate_coupling_coil", "在门瑞欧网络、灵魂介质和星门晶体之间传递能量。", "星浆导电基材", "item", [
        ("titan_moon:precision_components", "精密电子元件", 2),
        ("titan_moon:cryo_alloy_ingot", "冰晶合金锭", 1),
        ("kubejs:rainbowshift_entropy", "虹移之熵", 1)]),
    "pneumatic": ("hydrogen_logic_valve_bank", "同步气压、流量与 AE 控制信号。", "氢压阀体毛坯", "item", [
        ("titan_moon:precision_components", "精密电子元件", 1),
        ("kubejs:storm_hydrogen_crystal", "风暴氢晶", 1),
        ("deeprealm_4th:star_slurry_blank", "星浆晶胚", 1)]),
    "nuclear": ("neutron_confinement_ring", "约束粒子束并稳定聚合时的同位素结构。", "氦封约束环胚", "item", [
        ("titan_moon:cryo_alloy_ingot", "冰晶合金锭", 2),
        ("kubejs:epsilon_dust", "ε 尘", 1),
        ("deeprealm_4th:star_slurry_blank", "星浆晶胚", 1)]),
    "precision": ("omni_calibration_grating", "保存多重光学标定与刻线基准，控制最终合金成形。", "星浆光栅基板", "item", [
        ("titan_moon:precision_components", "精密电子元件", 2),
        ("titan_moon:silicon_dust", "硅晶粉", 2),
        ("deeprealm_4th:star_slurry_crystal", "星浆晶体", 1)]),
}

# Existing source recipes produce ordinary raw stock. Quantities are per ingot,
# not claimed per machine cycle. No custom endgame item is generated for free.
SUPPLIES = {
    "bio": [
        (17, "橡木纤维原料", "minecraft:oak_log", 2, None,
         "原生橡树盆景掉落；原木单次掉落概率 0.75，持续收获至凑齐 2 个，不能承诺两次必出。"),
        (12, "蜂蜡原料", "minecraft:honeycomb", 1, None,
         "原生 productivebees:bee_produce/bee；使用 minecraft:bee，花与蜂种保留，消耗产出的蜜脾。"),
    ],
    "thermal": [
        (25, "玄武岩骨料", "minecraft:basalt", 4, None,
         "沿用 thermal:devices/rock_gen/rock_gen_basalt；邻接熔岩源与蓝冰，正下方灵魂土。这三个环境方块保留。"),
        (23, "胶乳黏合剂", "thermal:latex_bucket", 1, "thermal:latex",
         "原生橡胶树提取配方每次 30 mB；每锭支出 1000 mB，余量留罐，树干与树叶保留。"),
        (24, "蜂蜡密封剂", "minecraft:honeycomb", 1, None,
         "使用原生蜂巢提取器的物品产物蜜脾；设备放在合格蜂箱下方，保留蜂箱及蜂群，流体副产物另存。"),
    ],
    "engineering": [
        (15, "无尽之尘", "enderio:grains_of_infinity", 2, None,
         "直接沿用 enderio:fire_crafting/infinity；主世界基岩上点火，原生战利品有 0.5 掉落概率，收集满 2 粒后投料。"),
    ],
    "nuclear": [
        (32, "氦气", "nuclearcraft:helium_bucket", 1, "nuclearcraft:helium",
         "沿用原生泵与氦收集器；按 forge:helium 对应实际注册流体收集 1000 mB，收集器不是每批原料。"),
    ],
}

# (in-process assembly, chains of recipe-row numbers, which chain carries the
# previous S5 workpiece). An integer targets the chain's first step; a pair
# (chain, offset) targets a later step with an additional consumed input.
# Other chains supply auxiliaries; None incorporates the workpiece at assembly.
SEGMENTS = {
    "bio": [
        ("陶瓷承压膜", [[1], [3]], 0),
        ("代谢催化膜", [[7, 8, 9], [10, 11]], 0),
        ("蜂蜡复合膜", [[13, 14], [15, 16]], None)],
    "aether": [
        ("极寒折射镜坯", [[1, 2], [3, 4, 5, 6, 7]], 0),
        ("孢光镀层镜片", [[10, 11], [8], [9]], 0),
        ("天境晶格镜组", [[12, 13, 14]], None)],
    "mana": [
        ("四相活石腔壁", [[1, 2, 3, 4]], 0),
        ("符文谐振内衬", [[5, 6, 7, 8, 9]], 0),
        ("祝福谐振腔体", [[14, 15], [10], [11], [12]], 0)],
    "thermal": [
        ("锻制承压骨架", [[1, 2, 3, 4, 7, 8]], 0),
        ("相变金属外壳", [[9, 10, 11, 12, 13, 14, 15]], 0),
        ("热解隔热夹层", [[5, 6], [16, 17, 18, 19]], 0),
        ("结晶防护外壳", [[21, 22], [20]], 0)],
    "engineering": [
        ("门瑞欧导电骨架", [[3, 4], [5, 6, 7], [8]], 0),
        ("灵魂绝缘绕组", [[9, 10, 11], [12], [14]], 0),
        ("航天供能线组", [[22], [20]], 0),
        ("Naquadah 耦合绕组", [[19, 26, 24]], (0, 2))],
    "pneumatic": [
        ("钻刻耐压阀体", [[2, 3, 4]], 0),
        ("热控密封阀座", [[5, 6, 7, 8]], None),
        ("熵变信号阀片", [[11, 12, 13, 14], [15]], 0),
        ("光刻控制板总成", [[16], [17]], None)],
    "nuclear": [
        ("致密承束环", [[1, 2, 3, 4, 5, 6]], 0),
        ("同位素过滤层", [[9], [7, 8], [10, 11], [12, 13, 14, 15, 16]], 0),
        ("辐照吸收层", [[20, 19, 21], [17, 18]], 0),
        ("燃料闭锁环", [[22, 25], [23], [24]], None),
        ("多级换热环套", [[26, 27, 28, 29]], None),
        ("束流稳定环架", [[30, 31]], 0)],
    "precision": [
        ("定向刻线刀组", [[1], [4], [5], [15]], None),
        ("多层成像标尺", [[8], [16], [10], [17]], None),
        ("显影防护镀层", [[12]], None)],
}


def build():
    inventory = json.loads((OUT / "recipe-types.json").read_text(encoding="utf-8"))
    records = {r["id"]: r for r in inventory["records"]}
    nodes = []; branches = []; used = collections.defaultdict(list)
    for key, (name, raw, text) in BRANCHES.items():
        component_id, purpose, feed_name, feed_medium, feed = COMPONENTS[key]
        by_number = {}
        for number, line in enumerate(text.strip().splitlines(), 1):
            if number in REMOVED_STEPS.get(key, set()):
                continue
            label, kind, medium, constraint = line.split("|", 3)
            assert kind.startswith("native:") or kind in records, kind
            ident = f"{key}_{number:02d}"
            output = {"id": f"kubejs:omni_{ident}", "count": 1}
            if medium == "fluid":
                output.update(id=f"kubejs:omni_{ident}_fluid_bucket",
                    fluid=f"kubejs:omni_{ident}_fluid", amount_mB=1000,
                    collection="串接时直接输送 1000 mB；汇合时使用满桶并返还空桶。")
            if medium == "block":
                output.update(id=f"kubejs:omni_{ident}_block", block=f"kubejs:omni_{ident}_block",
                    collection="放置并转化后采集；对应 BlockItem 与单件掉落表必须存在。")
            if medium == "native_item":
                output["collection"] = "沿用原生载体，验收真实状态后消耗载体和一片工艺衬片封装；封装只用于后续装配，不冒充原生机器的输出。"
            source = records.get(kind)
            node = {"id": ident, "branch": key, "label": label, "recipe_identifier": kind,
                "medium": medium, "constraint": constraint, "dependencies": [],
                "consumed_inputs": [], "output_contract": output,
                "recipe_policy": "优先沿用可衔接的原生配方；仅在需要专用阶段状态或接口桥接时新增。",
                "evidence": source["examples"][:1] if source else [],
                "origin_rule": "新增增值中间件要求唯一来源；原生产物允许既有来源，未排除替代途径的工艺只计推荐覆盖。"}
            by_number[number] = node
            used[kind].append(ident)

        supplies = []
        for number, label, item, count, fluid, constraint in SUPPLIES.get(key, []):
            n = by_number[number]
            n.update(label=n["label"] + "（原生供料）", phase="early_supply", constraint=constraint,
                recipe_policy="直接复用原生配方，不新增同功能配方或专用产物。",
                coverage_strength="recommended_native_source_not_exclusive")
            n["medium"] = "fluid" if fluid else "item"
            n["output_contract"] = {"id": item, "count": 1, "label": label,
                "note": "标准物料单位；不表示一次原生配方必出此数量。"}
            if fluid:
                n["output_contract"].update(fluid=fluid, amount_mB=1000)
            n["per_ingot_demand"] = count
            nodes.append(n); supplies.append(n["id"])

        feed_id = f"{key}_feed"
        ingredients = [{"item": item, "name": label, "count": count, "consumed": True}
            for item, label, count in feed]
        feed_output = {"id": f"kubejs:omni_{feed_id}", "label": feed_name, "count": 1}
        if feed_medium == "fluid":
            feed_output.update(id=f"kubejs:omni_{feed_id}_bucket",
                fluid=f"kubejs:omni_{feed_id}", amount_mB=1000)
            ingredients.append({"item": "minecraft:bucket", "name": "空桶", "count": 1,
                "consumed": False, "role": "灌入培养液；盐卤工位倒出液体后空桶复用。"})
        if feed_medium == "block":
            feed_output["block"] = feed_output["id"]
        supply_inputs = [{"source_node": by_number[num]["id"], "count": count,
            "consumed": True, "container_return": "若为满桶，返还空桶；其中原料全部消耗。"}
            for num, _, _, count, _, _ in SUPPLIES.get(key, [])]
        entry = {"id": feed_id, "branch": key, "label": feed_name, "phase": "stage5_entry",
            "recipe_identifier": "minecraft:crafting_shapeless", "medium": feed_medium,
            "dependencies": supplies, "consumed_inputs": supply_inputs,
            "ingredients": ingredients, "stage5_consumed_inputs": ingredients[:len(feed)],
            "output_contract": feed_output,
            "constraint": "每批重新消耗全部土卫六、深四材料和列明的原生辅料，得到一份坯料；坯料不能作无限生产的底座、花、树苗或催化剂。"}
        assert sum(x["count"] for x in ingredients + supply_inputs) <= 9, feed_id
        nodes.append(entry)
        previous = feed_id
        methods = list(supplies); assemblies = []; stage_descriptions = []
        seen = {number for number, *_ in SUPPLIES.get(key, [])}
        for stage, (label, chains, primary) in enumerate(SEGMENTS[key], 1):
            primary_chain, primary_step = primary if isinstance(primary, tuple) else (primary, 0)
            assert chains and all(chains), (key, stage, "empty processing segment")
            if primary_chain is not None:
                assert 0 <= primary_chain < len(chains)
                assert 0 <= primary_step < len(chains[primary_chain])
            terminals = []
            for chain_number, chain in enumerate(chains):
                prior = None
                for offset, number in enumerate(chain):
                    assert number not in seen, (key, number)
                    seen.add(number)
                    n = by_number[number]
                    n.update(phase="processing", segment=stage)
                    deps = []
                    if prior:
                        deps.append(prior)
                    if (chain_number, offset) == (primary_chain, primary_step):
                        deps.append(previous)
                    if deps:
                        n["dependencies"] = deps
                        n["consumed_inputs"] = [{"source_node": dep, "count": 1, "consumed": True} for dep in deps]
                        n["input_contract"] = "各前驱整份进入原生 input/ingredient/fluid 字段；流体份量 1000 mB，方块以实物放置或 BlockItem 投料。额外模组辅料按本机槽位加入。"
                    else:
                        n["input_contract"] = "使用本支线相符的模组辅料加工；原生载体保留真实数据，最终消耗其产物并入阶段五在制件。"
                    nodes.append(n); methods.append(n["id"]); prior = n["id"]
                terminals.append(prior)
            if primary_chain is None:
                terminals.insert(0, previous)
            ident = f"{key}_assembly_{stage}"
            nodes.append({"id": ident, "branch": key, "label": label, "phase": "assembly",
                "recipe_identifier": "minecraft:crafting_shaped", "dependencies": terminals,
                "consumed_inputs": [{"source_node": dep, "count": 1, "consumed": True} for dep in terminals],
                "output_contract": {"id": f"kubejs:omni_{ident}", "count": 1},
                "constraint": "消耗前段在制件及本段全部末端辅件各一份；串联上游已被消耗，不能再拿同一份参与装配。满桶返还空桶。"})
            stage_descriptions.append({"id": ident, "name": label, "previous": previous,
                "chains": [[by_number[i]["id"] for i in chain] for chain in chains],
                "primary_chain": primary_chain, "primary_step": primary_step})
            assemblies.append(ident); previous = ident
        assert seen == set(by_number), (key, set(by_number) - seen)
        # The last assembly is the named component, rather than a generic core.
        component_node = nodes[-1]
        component_node["label"] = name
        component_node["output_contract"]["id"] = f"kubejs:{component_id}"
        branches.append({"id": key, "name": name, "purpose": purpose,
            "raw_materials": raw, "stage5_inputs": entry["stage5_consumed_inputs"],
            "feed": feed_id, "supplies": supplies, "methods": methods,
            "stages": stage_descriptions, "component": previous,
            "component_item": f"kubejs:{component_id}"})

    projection = [{"source_node": b["component"], "count": 1,
        "direction": "material_on_frame" if i % 2 == 0 else "frame_on_material"}
        for i, b in enumerate(branches)]
    nodes.extend([
        {"id": "omni_seed", "label": "万象原核", "recipe_identifier": "deeprealm_4th:projection_combining",
         "dependencies": [b["component"] for b in branches], "steps": projection,
         "output_contract": {"id": "kubejs:omni_seed", "count": 1},
         "constraint": "8 步、每步 1 件；物品栏内按方向操作，保留 9 步上限；不能与其他配方形成相同前缀冲突。"},
        {"id": "omni_billet", "label": "万象锻坯", "recipe_identifier": "draconicevolution:fusion_crafting",
         "dependencies": ["omni_seed"],
         "ingredients": [{"item": "kubejs:omni_seed", "count": 1, "role": "catalyst"},
             {"item": "kubejs:epsilon_dust", "count": 1},
             {"item": "kubejs:basepoint_alloy", "count": 1},
             {"item": "kubejs:chaotic_truth", "count": 1},
             {"item": "kubejs:rainbowshift_entropy", "count": 1}],
         "tier": "CHAOTIC", "total_energy": 200000000,
         "output_contract": {"id": "kubejs:omni_billet", "count": 1},
         "constraint": "催化物消耗；四个独立注入器各 1 件辅料，使用支持该等级的注入器。参数属于设计值。"},
        {"id": "omni_alloy_ingot", "label": "万象合金锭", "recipe_identifier": "deeprealm_4th:combination_forging",
         "dependencies": ["omni_billet"], "clicks": 12, "cooldown": 4, "levels": 50,
         "ingredients": [{"item": "kubejs:omni_billet", "count": 1},
             {"item": "elder_bosses:rune_fragment", "count": 2},
             {"item": "deeprealm_4th:star_slurry_blank", "count": 1},
             {"item": "deeprealm_4th:star_slurry_crystal", "count": 1}],
         "output_contract": {"id": "kubejs:omni_alloy_ingot", "count": 1},
         "constraint": "在锻造皮革垫中进行；消耗 50 个经验等级，4 tick 为有效锤击间隔。参数属于设计值。"},
    ])
    for node in nodes[-3:]: used[node["recipe_identifier"]].append(node["id"])
    index = {n["id"]: n for n in nodes}
    removed_ids = {x["step"] for x in REMOVED_RECIPES.values()}
    assert not (removed_ids & index.keys()), "removed workflow restored"
    assert not (REMOVED_RECIPES.keys() & used.keys()), "removed recipe still counted"
    visited = set(); stack = set()
    def visit(ident):
        assert ident in index, ident
        assert ident not in stack, "cycle: " + ident
        if ident in visited: return
        stack.add(ident)
        for dep in index[ident]["dependencies"]: visit(dep)
        stack.remove(ident); visited.add(ident)
    visit("omni_alloy_ingot")
    assert len(visited) == len(nodes), "orphan or optional stages"
    assert len(projection) <= 9
    assert all(len(n["dependencies"]) <= 9 for n in nodes if n["recipe_identifier"] == "minecraft:crafting_shaped")
    # Every intermediate is spent once. A serial product is never also counted
    # as an assembly ingredient after the downstream machine has consumed it.
    consumers = collections.Counter(dep for n in nodes for dep in n["dependencies"])
    assert all(consumers[n["id"]] == 1 for n in nodes if n["id"] != "omni_alloy_ingot")
    def ancestors(ident):
        return {ident}.union(*(ancestors(dep) for dep in index[ident]["dependencies"]))
    supply_nodes = [n for n in nodes if n.get("phase") == "early_supply"]
    for branch in branches:
        assert not branch["name"].endswith("芯")
        assert branch["feed"] in ancestors(branch["component"])
        assert set(branch["supplies"]) <= ancestors(branch["feed"])
        assert any(x["item"].startswith("titan_moon:") or x["item"] == "kubejs:storm_hydrogen_crystal"
            for x in branch["stage5_inputs"])
        assert any(x["item"].startswith("deeprealm_4th:") or x["item"] in
            {"kubejs:rainbowshift_entropy", "kubejs:epsilon_dust"} for x in branch["stage5_inputs"])
    # Treat every ungated auxiliary as freely available: withholding S5 entries
    # must still prevent every completed component and the final ingot.
    available = set()
    for n in nodes:
        if n.get("phase") != "stage5_entry" and set(n["dependencies"]) <= available:
            available.add(n["id"])
    assert all(b["component"] not in available for b in branches)
    assert "omni_alloy_ingot" not in available
    stage5_totals = collections.Counter()
    for branch in branches:
        for ingredient in branch["stage5_inputs"]:
            stage5_totals[ingredient["item"]] += ingredient["count"]
    plan = {"status": "design_reference_implementation_tracked_separately", "revision": 4,
        "material": "万象合金锭", "tier": "阶段五（土卫六、深境四层）入口的后期综合制造",
        "structure": "原生供料设施在前端持续产出普通辅料；各支线每批消耗阶段五材料制坯，逐段加工并入模组辅件，八种部件汇合后投影、聚合、锻造。",
        "recipe_policy": "保留可用原生配方；按用途复用既有材料，只为阶段连接、复合在制件和最终部件新增必要配方。",
        "branches": branches, "nodes": nodes,
        "removed_workflow_steps": [{"recipe_identifier": kind, **info} for kind, info in REMOVED_RECIPES.items()],
        "stage5_entry_totals_per_ingot": dict(stage5_totals),
        "recurring_supply_per_ingot": [{"source_node": n["id"], "item": n["output_contract"]["id"],
            "count": n["per_ingot_demand"], "fluid": n["output_contract"].get("fluid"),
            "amount_mB": n["output_contract"].get("amount_mB")} for n in supply_nodes],
        "coverage": {"planned_workflow_steps": sum(len(b["methods"]) for b in branches) + 3,
            "recommended_native_supply_steps": len(supply_nodes),
            "processing_and_final_steps": sum(len(b["methods"]) for b in branches) + 3 - len(supply_nodes),
            "unique_recipe_identifiers": len(used), "registered_or_json_identifiers": sum(not k.startswith("native:") for k in used),
            "code_mechanics": sum(k.startswith("native:") for k in used),
            "graph_nodes_including_subassemblies": len(nodes),
            "note": "总步骤包含推荐的原生供料工艺；同一种原料可能有其他来源，不能把这些供料设备声称为独占必经。其余也须通过载体、接口和来源验收，才可称运行时强制覆盖。"},
        "mandatory_source_audits": ["原有合成与拆解替代路径", "标签和 NBT 接受范围", "JEI 显示与真实消耗", "热力或 Ender IO 自动生成烧炼等兼容配方", "世界内块替换与掉落", "固定载体类工艺来源校验"],
        "intentionally_unforced": EXCLUSIONS,
    }
    (OUT / "omni-alloy-route.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_inventory(inventory, used)
    write_route(plan, used)
    print(json.dumps(plan["coverage"], ensure_ascii=False))
    print("PASS proposed graph: reachable, acyclic, single-use intermediates, S5 gates, supplies before entry, crafting/projection capacities")


def disposition(record, used):
    kind = record["id"]
    if kind in used:
        supplied = {f"{key}_{row[0]:02d}" for key, rows in SUPPLIES.items() for row in rows}
        category = "推荐原生供料" if set(used[kind]) <= supplied else "设计加工工艺"
        return category, ", ".join(used[kind])
    if kind in REMOVED_RECIPES:
        return "已按要求取消", f"原步骤 {REMOVED_RECIPES[kind]['step']}；保留模组类型记录，不计入当前合成路线。"
    if kind in EXCLUSIONS: return "单列处理", EXCLUSIONS[kind]
    if record["availability"] == "compatibility_namespace_not_installed":
        return "未安装兼容", "只有其他模组提供的兼容数据，不纳入基础路线。"
    if record["probe_recipe_type"] and not record["probe_serializer"] and not record["jar_recipe_count"]:
        return "运行时类型或代码设施", "不能直接作为 JSON serializer；检查原生设备或归并到同一工艺。"
    path = kind.split(":", 1)[1]
    if any(word in path for word in ("fuel", "coolant", "boost", "heat_properties", "catalyst", "nc_ore_veins", "grinding_ball", "soil", "sapling")):
        return "设施或参数", "燃料、冷却、催化、生长或资源定义；按真实设施供给，不作为独立材料合成步骤。"
    if path in ("conditional", "empty", "nbt_output_wrapper", "copy_nbt"):
        return "加载或包装", "条件加载、空配方或 NBT 包装层，不是玩家独立操作。"
    if any(word in path for word in ("spawning", "breeding", "incubation", "bee_conversion", "bee_fishing", "bee_nbt", "transformation_powder")):
        return "生物或实体流程", "保留为蜂种或养殖设施上游；结果受实体类型限制，不冒充任意材料输出。"
    if path in ("block_placement_ban", "item_placement_ban"):
        return "世界规则", "禁止放置规则，无合成产物。"
    if kind.startswith("exposure:") or kind.startswith("slashblade:"):
        return "固定载体", "查看相应精密校准步骤的实际数据要求。"
    if "recycle" in path:
        return "同设备回收模式", "磨粉机或感应炉的回收处理，归并相同设备；主路线不开放材料增殖回收。"
    return "专用合成处理器", "通常用于染色、复制、升级、外观、地图、装备或容器 NBT；清单保留，按实际对象处理，不据此虚增材料加工方式数。"


def write_inventory(inventory, used):
    counts = collections.Counter(r["availability"] for r in inventory["records"])
    lines = ["# 整合包配方类型清单", "",
        f"扫描 {inventory['jar_count']} 个根目录模组 JAR 及其中声明的 {inventory.get('embedded_jar_count', 0)} 个 JarJar 依赖档案，结合原生及内置数据包、KubeJS 配方引用和 ProbeJS 注册快照，收集 **{len(inventory['records'])} 个去重标识**。其中 {counts['installed_candidate']} 个属于已安装命名空间候选，{counts['compatibility_namespace_not_installed']} 个只对应未安装兼容命名空间，{counts['module_disabled_by_configuration']} 个因当前模块配置单列。嵌入依赖仍受加载器版本选择影响；其中 Thermal Core 提供造石机的原生配方。", "",
        "JSON 中的 `type` 是 RecipeSerializer 标识；RecipeType 是运行时分组。两者不能互换。原版短名已规范为 `minecraft:`，因此不会重复统计 `smelting` 与 `minecraft:smelting`。", "",
        f"ProbeJS 快照时间为本地文件记录的 {inventory['probe_snapshot_local_mtime']}，包含 {len(inventory['probe_recipe_types_normalized'])} 个规范化 RecipeType、{len(inventory['probe_serializers_normalized'])} 个规范化 RecipeSerializer。当前 JAR 和脚本补充快照之后安装的模组。快照不等于本次实时注册表；候选配方还会受到条件加载、内置包启用状态与 KubeJS 删除影响。", "",
        "当前 `apotheosis.cfg` 关闭 Village Module；制箭加工不应成为必经步骤。Create、Mekanism、匠魂等未安装模组虽在其他模组兼容 JSON 中出现，已单列。", "",
        "机器能耗、冷却液、弹药和世界生成等数据虽有 type，也未必是可投料得到材料的工艺。无 JSON serializer 的真实操作还包括 Tetra 工作台、原版酿造、铁砧、砂轮、刀胚淬火、照片打印叠放和 PCB 曝光蚀刻；是否采用见下表，已取消的工艺保留为模组清单记录。JEI 分类类名也已保存在原始清单，分类存在不代表拥有可自定义结果的配方接口。", "",
        "## 已安装命名空间", ""]
    groups = collections.defaultdict(list)
    for r in inventory["records"]:
        if r["availability"] != "compatibility_namespace_not_installed": groups[r["id"].split(":")[0]].append(r)
    for ns, entries in sorted(groups.items()):
        lines.extend([f"### {ns}", "", "| 标识 | 设计处理 | 依据与说明 |", "|---|---|---|"])
        for r in entries:
            category, note = disposition(r, used)
            evidence = []
            if r["probe_serializer"]: evidence.append("快照 Serializer")
            if r["probe_recipe_type"]: evidence.append("快照 RecipeType")
            if r["jar_recipe_count"]: evidence.append(f"{r['jar_recipe_count']} 条源数据")
            if r["kubejs_references"]: evidence.append("有 KubeJS 引用")
            if r.get("current_code_registration"): evidence.append("当前注册类")
            lines.append(f"| `{r['id']}` | {category} | {'；'.join(evidence)}。{note} |")
        lines.append("")
    lines.extend(["## 未安装模组的兼容命名空间", "", "这些条目保留在机器可读清单中，以便后续安装模组时重审。不会要求玩家建造未安装模组的机器。", "", "| 命名空间 | 标识 |", "|---|---|"])
    compat = collections.defaultdict(list)
    for r in inventory["records"]:
        if r["availability"] == "compatibility_namespace_not_installed": compat[r["id"].split(":")[0]].append(r["id"])
    for ns, ids in sorted(compat.items()): lines.append(f"| `{ns}` | " + "、".join(f"`{x}`" for x in ids) + " |")
    lines.extend(["", "## 代码驱动和 JEI 展示操作", "", "| 操作 | 设计处理 |", "|---|---|"])
    native_labels = {"native:bonsaitrees3_growing": "盆景生长收获", "native:tetra_workbench": "Tetra 模组工作台", "native:minecraft_brewing": "原版酿造", "native:minecraft_anvil": "铁砧", "native:minecraft_grindstone": "砂轮", "native:pneumaticcraft_uv": "PCB 曝光", "native:pneumaticcraft_etching": "PCB 蚀刻", "native:last_smith_quenching": "炼药锅刀胚淬火", "native:exposure_printing": "照片打印", "native:exposure_stacking": "照片叠放"}
    for key, label in native_labels.items():
        if used.get(key):
            lines.append(f"| {label} | 设计包含的原生操作，对应 {', '.join(used[key])}；`native:` 只是本文记号，不能填进配方 JSON。 |")
        elif key in REMOVED_RECIPES:
            lines.append(f"| {label} | 已按要求取消原步骤 {REMOVED_RECIPES[key]['step']}，不计入当前路线覆盖。 |")
    lines.extend(["| 村民交易与嗡嗡蜂女王交易 | 供应或交易系统，保留展示，不计材料加工机台。 |", "| Species 生物喂养产物 | 养殖和实体行为，列为供应支线；本路线不伪造通用 JSON 加工器。 |", "| 赛马娘抽卡和马魂拆解 | 专用马魂与随机获取系统，结果受对象限制，保留清单复核，不作通用材料加工。 |", "| Quark 附魔影响 | 附魔设施效果，归入附魔系统条件，不计为额外机台。 |", ""])
    lines.extend(["", "## 原始依据", "", "[recipe-types.json](recipe-types.json) 保存每个标识的示例 JSON、来源 JAR 路径、条件判断、注册类字符串证据和 KubeJS 引用位置。注册类中的字符串只提供复核线索，不自动等同于已注册配方。", "",
        "重新收集使用 `python -X utf8 kubejs/tools/collect_recipe_types.py`，重新生成设计索引使用 `python -X utf8 kubejs/tools/build_recipe_route_design.py`。两个工具仅更新文档。", ""])
    (OUT / "recipe-types.md").write_text("\n".join(lines), encoding="utf-8")


def write_route(plan, used):
    c = plan["coverage"]
    by_id = {n["id"]: n for n in plan["nodes"]}
    material_names = {x["item"]: x["name"] for b in plan["branches"] for x in b["stage5_inputs"]}
    def costs(ingredients):
        return "、".join(f"{x['name']} ×{x['count']}" for x in ingredients)
    def desc(ident):
        return by_id[ident]["label"]
    lines = ["# 万象合金合成路线设计", "",
        f"第四版：按要求累计取消 {len(plan['removed_workflow_steps'])} 个流程，保留其余步骤编号便于对照。以阶段五的土卫六和深境四层材料起步，制造八种具有不同用途的部件。原生供料设施先准备普通辅料；每批消耗新的阶段五材料制坯，逐段加工并加入模组材料，八种部件最终通过投影、聚合和组合锻造制成一锭万象合金。", "",
        "优先复用合适的原生配方。无尽之尘、盆景原木、蜂蜡、玄武岩、胶乳和氦气均可直接使用既有产物；新的配方主要负责复合坯料、工艺衔接和部件装配。原生设备不会免费产出已经含有阶段五材料的高级中间件。", "",
        f"共规划 {c['planned_workflow_steps']} 个工艺位置：{c['recommended_native_supply_steps']} 个前端原生供料位置，{c['processing_and_final_steps']} 个加工与最终合成位置。涉及 {c['registered_or_json_identifiers']} 个配方标识和 {c['code_mechanics']} 类代码驱动操作，加入制坯与装配后共 {c['graph_nodes_including_subassemblies']} 个节点。供料原料有替代来源时，相应设备属于推荐路径；其余工艺也需完成接口与来源验收后才能宣称运行时强制覆盖。", "",
        "本文是路线设计依据；实装与验证状态另见 [omni-alloy-implementation.json](omni-alloy-implementation.json)。以下物耗以一锭为单位；流体、原生载体和世界内操作保留各自的实际接口。", "",
        "## 八种部件与阶段五入口", "",
        "| 部件 | 在合金制造中的用途 | 每批消耗的阶段五材料 | 后续加入的模组材料 |", "|---|---|---|---|"]
    for b in plan["branches"]:
        lines.append(f"| {b['name']} | {b['purpose']} | {costs(b['stage5_inputs'])} | {b['raw_materials']} |")
    lines.extend(["", "入口材料依据当前 `s5_titan.js`、`s5_deep_realm_4.js` 及两个维度模组的原生材料注册：风暴氢晶由冰晶合金锭、氢气瓶和生物电池合成；虹移之熵由星浆参与投影组合；ε 尘由深四组合锻造取得。这里消耗的是材料本身，不是用于解锁配方的可复用凭证。", "",
        "| 入口材料 | 实际 ID | 每锭直接投入 |", "|---|---|---|"])
    for item, count in plan["stage5_entry_totals_per_ingot"].items():
        lines.append(f"| {material_names[item]} | `{item}` | {count} |")
    lines.extend(["", "此表仅汇总八条支线的入口，不重复展开风暴氢晶等成品的上游物耗，也不包含文末最终三步的追加投入。机器、花、树、蜂种、模具和场地是可复用设施；八份坯料及八个部件均被实际消耗。", "",
        "## 前端供料与原生配方复用", "",
        "| 工艺 | 直接使用的产物 | 每锭支出 | 消耗位置与设施条件 |", "|---|---|---|---|"])
    for b in plan["branches"]:
        for ident in b["supplies"]:
            n = by_id[ident]; out = n["output_contract"]
            amount = f"{out['amount_mB'] * n['per_ingot_demand']} mB" if out.get("fluid") else str(n["per_ingot_demand"])
            lines.append(f"| {n['label']} | {out['label']} `{out.get('fluid', out['id'])}` | {amount} | 制作{desc(b['feed'])}时消耗。{n['constraint']} |")
    lines.extend(["", "七种供料操作全部位于对应支线制坯之前，原料可以缓冲储存。每次制造一锭都会扣除表中数量，因此量产仍需持续补充；一次建成的设施可长期使用。原生产物若有采矿、其他模组配方等来源，保留这些既有途径并标明推荐设备，不为追求形式上的全覆盖复制一套原料。", "",
        "基岩火焰直接使用 `enderio:fire_crafting/infinity` 与原生 `enderio:grains_of_infinity`。当前战利品有 0.5 掉落概率，凑齐两粒后才投入线圈制坯；不额外造一种只能靠基岩火焰获得的高级粉末。原生盆景同样按累计收获计量。随机性只影响前端库存补充，不销毁后续昂贵在制件。", "",
        "造石机采用原生玄武岩配方：邻接熔岩源和蓝冰，正下方灵魂土。`adjacent` 与 `below` 是方块条件；不能随意把它写成两种流体消耗配方。每锭使用四块玄武岩，在第一份复合坯中与冰晶合金锭 ×2、星浆晶胚 ×1、胶乳 1000 mB、蜜脾 ×1 合并；九个工作台槽位刚好容纳。环境方块不消耗，阶段五材料全部消耗。", "",
        "```mermaid", "flowchart LR",
        "  supply[前端原生供料] --> feed[每批制坯]",
        "  titan[土卫六材料 每批消耗] --> feed",
        "  deep[深境四层材料 每批消耗] --> feed",
        "  feed --> processing[八条支线分段加工]",
        "  auxiliary[后续模组辅料和原生工艺] --> processing",
        "  processing --> parts[八种部件 各一件]",
        "  parts --> projection[投影组合] --> fusion[龙之研究聚合] --> forging[深四组合锻造] --> ingot[万象合金锭]",
        "```", "",
        "## 逐批加工与材料平衡", "",
        "每条支线只有一份阶段五入口坯料。能接收其物品、方块或流体的加工段直接继续处理；只支持照片、刀、药水等原生载体的工艺作为辅件生产，验收并消耗这些实物后并入前段在制件。所有装配都沿用上一段的实物，缺少前段不能直接从辅件合成成品。", "",
        "以下箭头表示实际消耗关系，不是完成任务或解锁顺序。串联只把末端产物交给该段装配，已经送入下一台机器的上游件不会再计算一次；并行工艺则各交付一份。流体一份暂定 1000 mB，管道直连或满桶交付均可，空桶按容器规则返还。原生供料的单次产量不改成这个设计单位，允许连续运行和留存余量。", "",
        "原生载体保留真实附魔、刀标识、药水效果和照片数据。需要封装时消耗该原生实物与一片工艺衬片，再把封装件并入在制件；不能拿完成操作的标记替代实物。衬片可沿用低级材料：铁粒 ×4、纸 ×1 制成四片；它单独不能合成任何部件。原生接口已支持普通物品输入输出时直接使用该接口。", "",
        "只给需要防止跳步的新增增值中间件设置独立 ID。可以直接使用的原生材料、配方与工具不重复注册；例如现有门瑞欧机械挤压／机械烘干、原生 PCB 曝光蚀刻、合法刀胚淬火和整合包已有灵魂过滤基质／带电灵魂过滤片可作为实现时优先复用的候选。候选是否能连续衔接仍按真实槽位、NBT 和材料平衡验收。", "",
        "为了避免一次完成后退出生产链：八个部件均在投影时消耗，不返回；支线坯料与所有装配前驱均消耗；免费产出设施只供给低值原料；不增加高级部件的种植、蜂箱复制、底座造石、催化式复制或最终锭拆回多份前驱的配方。批量合成 N 锭需 N 倍的入口和表列原料，机器与环境设施可复用。", "",
        "## 八条支线的加工顺序", ""])
    for b in plan["branches"]:
        entry = by_id[b["feed"]]
        lines.extend([f"### {b['name']}", "",
            f"**入口：**{costs(b['stage5_inputs'])}，加上前端供料表中属于本支线的原料，得到{entry['label']}一份。",
            "", f"**主干：**{entry['label']} → " + " → ".join(
                b['name'] if i == len(b['stages']) - 1 else st['name'] for i, st in enumerate(b['stages'])) + "。", "",
            f"最终部件 ID：`{b['component_item']}`。", "",
            "| 加工段 | 实际工艺链（分号分隔并行供料） | 前段在制件的去向 |", "|---|---|---|"])
        for st in b["stages"]:
            chains = "；".join(" → ".join(desc(x) for x in chain) for chain in st["chains"])
            primary = st["primary_chain"]
            incorporation = (f"{desc(st['previous'])}投入{desc(st['chains'][primary][st['primary_step']])}；末端汇合其他辅件。"
                if primary is not None else f"保留{desc(st['previous'])}直到本段装配，与所有合格辅件一并消耗。")
            lines.append(f"| {desc(st['id'])} | {chains} | {incorporation} |")
        if b["id"] == "engineering":
            lines.extend(["", "液体连接改为：原油 1000 mB → 燃油精炼所得专用载液 1000 mB → 加纯 Naquadah 一份制成专用重液 1000 mB → 全部注入高级结晶。高级结晶同时消耗上段航天供能线组作为晶体基座，以及石英、紫水晶碎片各一份；不要求基础结晶或普通 Naquadah 液化提供前驱。", "",
                "已检查当前 HeavyNaquadahLiquidizerEntity.isDesiredInputFluid：按可用配方的 input_fluid 建立接受列表，可以接收这条精炼支线定义的载液。实际注册、容量与缓存刷新仍需落地验证。"])
        lines.extend(["", "| 步骤 | 配方标识或操作 | 产物介质 | 实现要求 |", "|---|---|---|---|"])
        for ident in b["methods"]:
            n = by_id[ident]
            medium = {"item": "物品", "block": "世界方块", "fluid": "流体", "native_item": "原生载体及状态"}[n["medium"]]
            lines.append(f"| {ident} {n['label']} | `{n['recipe_identifier']}` | {medium} | {n['constraint']} |")
        lines.append("")
    lines.extend(["## 最终三步", "",
        "1. **投影组合**：依部件表顺序使用八种部件，各一件，方向交替为材料 → 框架、框架 → 材料，得到一个万象原核 `kubejs:omni_seed`。物品栏操作共八步，符合九步上限。", "",
        "2. **龙之研究聚合**：万象原核作为消耗的 catalyst；四个注入器放入 `kubejs:epsilon_dust`、`kubejs:basepoint_alloy`、`kubejs:chaotic_truth`、`kubejs:rainbowshift_entropy` 各一件。CHAOTIC 级，总能量 200000000，得到一个万象锻坯 `kubejs:omni_billet`。这些是入口以外的追加物耗。", "",
        "3. **深四组合锻造**：万象锻坯 ×1、`elder_bosses:rune_fragment` ×2、`deeprealm_4th:star_slurry_blank` ×1、`deeprealm_4th:star_slurry_crystal` ×1；12 次锤击，4 tick 间隔，消耗 50 个经验等级，产出一锭 `kubejs:omni_alloy_ingot`。", "",
        "上述三步参数是设计值。完整的节点、消耗边、部件 ID、入口账本与原生样例见 [omni-alloy-route.json](omni-alloy-route.json)。", ""])
    lines.extend(["## 世界内工艺的实现要求", "",
        "### 方块和流体", "",
        "方块转化必须有真正的 Block、对应 BlockItem 与掉落表。使用普通固体源块时，每次从 A 替换为 B，再采集一份 B；两种物品不能共用 ID，也不能在放置时直接得到后续产物。带方块实体的容器不作为普通转化前驱，避免替换时把储存内容删除。", "",
        "盐卤凝固操作的是豆浆或配方支持的流体源，结果必须是有 BlockItem 的世界方块；凝固产物采集后直接参与本段装配。", "",
        "冰石和冰饰品使用两种专用固体冻胚，按方块状态匹配，避免用通用水、熔岩与原有配方抢同一个输入。饰品实现允许 FluidState 为空的固体走配方匹配；冰石采集结果后对同位置有冷却记录，连续投料需要等待或轮换反应位置。群系放置转化另设专用前驱并核对 biome 条件。", "",
        "白雏菊、凝矿兰和石莲使用专用源块，正常结果一对一。一个源块若同时命中多个矿化配方，就仍会抽签；仅提高 weight 不能保证必出，必须使匹配集合只有一个有效结果。", "",
        "### 掉落物和现场机器", "",
        "AE 水中转化要求完整原料组进入符合 tag 的流体。毒液浸泡使用物品实体，初版采用单件批次。用墙体和定时收集设施隔离工位，输入与输出分别过滤；即时吸附或磁铁可能抢走尚未转化的输入。", "",
        "AE 爆炸使用对应 circumstance，独立工位隔离无关掉落物，避免误触其他转换。Ender IO 火焰合成沿用 base_blocks、dimensions 和 loot_table 及原生概率产粉，不把阶段五前驱扔进火中。", "",
        "万用电解机需要正确的正下方输入块、电子和电极；液体必须为源，完成后下方块被替换，物品产物也在下方释放。工位要先容纳目标方块和掉落物，收集设施不能占据反应位置。", "",
        "最后的太刀匠的炼药锅淬火由 CauldronInteraction 注册，使用原生第三阶段刀胚，右键有水炼药锅变为第四阶段刀胚，并消耗一层水。原生实现直接替换手中堆叠，设计要求一次手持一件，避免整组投料损失；不添加虚构的 cauldron serializer。", "",
        "### 数据和回收", "",
        "投影框架每步最多吸收一件材料，最多 9 步。8 个部件按固定方向进入；新增配方的整个前缀序列不能与已有配方歧义。`frame_disassembly` 在至少 3×3 的合成网格中返还框架和已吸收材料，仅作为纠错途径；不将其计为一次净材料加工。", "",
        "不依赖重命名普通物品保存阶段。需要有独立 NBT 状态的原生载体必须逐字段匹配，并检查放置、拆解、复制、模块交换和再次加工是否会清除状态或制造副本。新增方块的 normal、silk touch 和 fortune 掉落总数都限定为一次一份。", "",
        "## 单列的工艺与覆盖边界", "",
        "原始清单含条件包装、燃料、世界规则、容器升级、染色及 NBT 专用处理器，它们不与独立材料加工设备等量计数。路线覆盖八个大类的主要材料加工方式；特殊类型的逐项处理见 [recipe-types.md](recipe-types.md)。", "",
        "| 标识 | 处理理由 |", "|---|---|"])
    for kind, reason in EXCLUSIONS.items(): lines.append(f"| `{kind}` | {reason} |")
    lines.extend(["", "## 落地验收", "",
        "1. 客户端重启后，检查所有新物品、方块、流体、命名和模型均已注册，双端资源一致。", "",
        "2. 完整重载后，本路线无未知 serializer、缺失物品、空标签或反序列化错误；再次重载不重复添加配方。", "",
        "3. 每种工艺验证一份合法输入、错误输入、空槽、缺能源及满输出；合法批次消耗与产量一致，错误批次不扣材料。固定载体必须显示并保留真实状态。", "",
        "4. 世界内步骤分别测试单件、整组、邻近无关方块、玩家磁铁、区块卸载重载和服务端重启；未完成状态不能重复结算，受影响范围不得超出该工位。", "",
        "5. 方块采集验证精准采集、时运、爆炸和普通挖掘；投影与拆解验证返还无复制；流体容器往返验证没有增殖或凭空生成。", "",
        "6. 最终链条逐项移除一个构件，验证在制件、部件、投影、聚合和锻造都不能越过缺失步骤；再反查配方、战利品和跨模组兼容生成，关闭新增增值中间件的意外旁路；普通原生原料的已有途径保留并标为推荐覆盖。", "",
        "7. 从准备好的基础原料完成一锭的端到端试制，记录实际物耗、时间、能耗和经验，修订设计值后才写入正式进度。", "",
        "设计图已检查节点全部连接、无循环、每个中间件只交付一次、入口包含两处阶段五材料、前端供料位于制坯之前，以及工作台和投影容量。还检查了即使免费提供所有低级辅料，缺少入口坯料仍无法获得八个部件或最终锭；这不是游戏内运行验证。", "",
        "8. 连续试制两锭：第二锭再次扣除整套阶段五入口与供料表原料，原料缓冲量相应下降；清空阶段五库存后，仅启动造石、蜂箱、树液提取等设施不能再得到高级部件。", "",
        "## 已核对的世界内实现依据", "",
        "以下为当前安装版本的原生数据与类实现，可在清单 JSON 的来源路径中追溯；并非运行时试制记录。", "",
        "| 机制 | 原生依据 | 设计采用的约束 |", "|---|---|---|",
        "| 豆腐凝固 | TofuCraft 的 BitternRecipe、RecipeHelper | 卤水操作流体，结果必须可放置。 |",
        "| 冰饰品及冰石 | Aether 的 FreezingAccessory、FreezingBlock、IcestoneBlockEntity 及其 FreezingListener | 固体方块按状态匹配；冰石记录采集位置冷却；不能用背包物品直接匹配。 |",
        "| 凝矿兰和石莲 | Botania 的 OrechidBlockEntity、OrechidManager 和 orechid、orechid_ignem、marimorphosis JSON | 从所有匹配结果中加权抽取，故专用源块只能有一个有效匹配结果。 |",
        "| 深天境毒液 | Deep Aether 的 PoisonBlock 与 poison_recipe JSON | 触发对象为 ItemEntity；浸泡工位先使用单件批次。 |",
        "| 万用电解机 | Dust and Ash 的 IonizerEntity、IonizerRecipe 与当前中文手册 | 检查正下方输入块；源液、电子、电极与最多四组输出必须匹配；下方同时发生方块替换。 |",
        "| 铣床 | Dust and Ash 的 MillingMachineRecipe 与当前中文手册 | 两阶段共用 5×5 工作区；装配时空格必须清空并投入 catalyst。 |",
        "| 热处理架 | PneumaticCraft 的 heat_frame_cooling 原生 JSON | max_temp 使用开尔文，需在阈值下进行冷却。 |",
        "| 投影与返还 | Deeprealm 4th 的 ProjectionCombining、ProjectionInventoryClick、FrameDisassemblyRecipe | 投影最多 9 步，匹配前缀不得歧义；返还至少需要 3×3 网格。 |",
        "| 炼药锅淬火 | Last Smith 的 SetupEventsHandler.coolItem 与原生 JEI 淬火分类 | 只匹配原生第三阶段刀胚，一件变一件并扣一层水；一次手持一件。 |",
        "| 火焰合成 | Ender IO 的 fire_crafting/infinity.json 及同名 loot table | 主世界基岩点火；原生粉末概率 0.5，累计收集后投入阶段五制坯。 |",
        "| 原生造石 | Thermal Foundation 内嵌 Thermal Core 的 devices/rock_gen/rock_gen_basalt.json 与原生手册 | 熔岩源、蓝冰及下方灵魂土是设施；每锭消耗四块玄武岩，后段重新消耗阶段五材料。 |", ""])
    (OUT / "omni-alloy-route.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    build()
