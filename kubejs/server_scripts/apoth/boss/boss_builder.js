// priority: 200
// By Tonywww, 原始用途：千界万锻整合包

const bossMaterialBuilder = (event, entity, path) => {
    let entityId = entity;
    let weight = 100;
    let quality = 1;
    const size = {
        "width": 0.6,
        "height": 1.8
    };
    let validGearSets = [];
    let dimensions = [];
    let minRarity = "common";
    let maxRarity = "legendary";
    const stats = {};
    
    let currentRarity = null;

    const builder = {
        setEntity(id) { entityId = id; return builder; },
        setWeight(num) { weight = num; return builder; },
        setQuality(num) { quality = num; return builder; },
        setSize(width, height) { 
            size.width = width; 
            size.height = height; 
            return builder; 
        },
        addValidGearSet(gearSet) { 
            validGearSets.push(gearSet); 
            return builder; 
        },
        setValidGearSets(sets) { 
            validGearSets = sets; 
            return builder; 
        },
        addDimension(dim) { 
            dimensions.push(dim); 
            return builder; 
        },
        setDimensions(dims) { 
            dimensions = dims; 
            return builder; 
        },
        setMinRarity(rarity) { 
            minRarity = rarity; 
            return builder; 
        },
        setMaxRarity(rarity) { 
            maxRarity = rarity; 
            return builder; 
        },
        
        // 开始配置某个稀有度
        forRarity(rarity) {
            currentRarity = rarity;
            if (!stats[rarity]) {
                stats[rarity] = {
                    enchant_chance: 0,
                    enchantment_levels: [],
                    effects: [],
                    attribute_modifiers: []
                };
            }
            return builder;
        },
        
        // 设置附魔概率
        setEnchantChance(chance) {
            if (currentRarity) {
                stats[currentRarity].enchant_chance = chance;
            }
            return builder;
        },
        
        // 设置附魔等级
        setEnchantmentLevels(levels) {
            if (currentRarity) {
                stats[currentRarity].enchantment_levels = levels;
            }
            return builder;
        },
        
        // 添加效果
        addEffect(effect, chance) {
            if (currentRarity) {
                stats[currentRarity].effects.push({
                    effect: effect,
                    chance: chance
                });
            }
            return builder;
        },
        
        // 添加属性修改器(简化版 - 固定值)
        addAttribute(attribute, operation, value) {
            if (currentRarity) {
                stats[currentRarity].attribute_modifiers.push({
                    attribute: attribute,
                    operation: operation,
                    value: value
                });
            }
            return builder;
        },
        
        // 添加属性修改器(范围值)
        addAttributeRange(attribute, operation, min, steps, step) {
            if (currentRarity) {
                stats[currentRarity].attribute_modifiers.push({
                    attribute: attribute,
                    operation: operation,
                    value: { min: min, steps: steps, step: step }
                });
            }
            return builder;
        },

        build() {
            const json = {
                entity: entityId,
                weight: weight,
                quality: quality,
                size: size,
                valid_gear_sets: validGearSets,
                dimensions: dimensions,
                min_rarity: minRarity,
                max_rarity: maxRarity,
                stats: stats
            };
            
            event.addJson(`apostle:bosses/${path}/${entityId.replace(':', '_')}.json`, json);
            console.log(`[Boss Builder] Boss "${entityId}" created.`);
        }
    };
    
    return builder;
}

