# Tetra材料生成要点与模板
### 1. 基础函数调用
```javascript
tetraMaterialBuilder(event, "material_id")
```

### 2. 材料类别 (setCategory)
**可选值：** `bone`, `fabric`, `fibre`, `gem`, `metal`, `misc`, `rod`, `scale`, `skin`, `socket`, `stone`, `wood`

**选择依据：**
- 金属类材料：`metal`
- 宝石类材料：`gem` 
- 石头类材料：`stone`
- 木材类材料：`wood`
- 骨骼类材料：`bone`
- 布料类材料：`fabric`
- 皮革类材料：`skin`
- 其他特殊材料根据实际情况，归入上述类别中的一种

### 3. 基础属性
- `setPrimary(数值)` - 第一属性（小数）
- `setSecondary(数值)` - 第二属性（小数）
- `setTertiary(数值)` - 第三属性（小数）

### 4. 耐久度与完整度
- `setDurability(数值)` - 耐久度
  - 金属：150-300
  - 宝石：150-300
  - 石头：100-150
  - 木材：50-200
- `setIntegrityCost(数值)` - 完整度消耗（整数）
- `setIntegrityGain(数值)` - 完整度增益（整数）

### 5. 魔法与工具属性
- `setMagicCapacity(数值)` - 魔法容量（40-160）
  - 普通材料：40-80
  - 稀有材料：80-120
  - 珍贵材料：120-160
- `setToolLevel(数值|字符串)` - 工具等级
  - 数字：0-4
- `setToolEfficiency(数值)` - 工具效率（3-8）
  - 低效材料：1-3
  - 中等材料：4-6
  - 高效材料：7-8

### 6. 外观属性
- `setTints("glyph颜色", "texture颜色")` - 颜色
  - 使用6位十六进制颜色代码
  - glyph：符号颜色
  - texture：纹理颜色
- `addTexture("纹理名称")` - 纹理（可重复调用1-3次）
  **可选纹理：** `bone`, `crude`, `default`, `shiny`, `metal`, `heavy`, `grainy`, `wooden`
  - 金属：通常使用`metal` + `heavy`/`default`
  - 宝石：通常使用`shiny` + `crude`
  - 木材：通常使用`wooden` + `crude`
  - 不用严格遵守`通常使用的纹理`

### 7. 材料来源
- `addItemMaterial('物品ID')` - 材料物品
- `setTagMaterial('物品标签')` - 材料标签
  - 使用完整的物品ID或者物品标签
  - 如果id由`#`开头，那么这个id是一个材料标签（注意，生成时需要去除`#`）
  - 如果没有提供来源的id，则填入一个注释：addItemMaterial(/** 材料ID */)

### 8. 工具要求
- `setRequiredTool("hammer_dig", 1)` - 固定值

### 9. 特殊属性
- addAttributes("属性ID", 数值)
- 你不知道每个特殊属性对应的ID，所以不需要完整的调用addAttributes，只需要把属性ID的对应描述填入
- "+"类属性直接由ID开头，"%"类属性需要在ID前加上"**"，并将数字转化为小数格式
- 例：攻击伤害+0.25 addAttributes("攻击伤害", 0.25)
- 例：移动速度-10% addAttributes("**移动速度", -0.1)

### 10. 构建
- `.build()` - 结束构建

## 完整生成模板
```javascript
// [材料名称]
tetraMaterialBuilder(event, "[material_id]").setCategory("[category]")
    .setPrimary([primary]).setSecondary([secondary]).setTertiary([tertiary])
    .setDurability([durability]).setIntegrityCost([cost]).setIntegrityGain([gain])
    .setMagicCapacity([capacity]).setToolLevel([level]).setToolEfficiency([efficiency])
    .addAttributes("[attribute_id_1]", amount)
    .addAttributes("[attribute_id_2]", amount)
    .addAttributes("[attribute_id_3]", amount)
    .setTints("[glyph_color]", "[texture_color]")
    .addTexture("[texture1]").addTexture("[texture2]")[.addTexture("[texture3]")]
    .addItemMaterial('[item_id]')
    .setRequiredTool("hammer_dig", 1)
    .build();
```
