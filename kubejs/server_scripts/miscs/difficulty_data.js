// priority: 100

let sdbfDifficultyDataSource = {
    schemaVersion: 1,
    axes: [
        { level: -7, health: 0.2, attack: 0.2, armor: 0.2, description: '开心就好。' },
        { level: -6, health: 0.4, attack: 0.4, armor: 0.4, description: '割草般的体验，巨幅降低敌人的属性。' },
        { level: -5, health: 0.4, attack: 0.4, armor: 0.4, description: '割草般的体验，巨幅降低敌人的属性。' },
        { level: -4, health: 0.6, attack: 0.6, armor: 0.6, description: '割草般的体验，大幅降低敌人的属性。' },
        { level: -3, health: 0.6, attack: 0.6, armor: 0.6, description: '割草般的体验，大幅降低敌人的属性。' },
        { level: -2, health: 0.75, attack: 0.75, armor: 0.75, description: '近乎割草般的体验，中幅降低敌人的属性。' },
        { level: -1, health: 0.75, attack: 0.75, armor: 0.75, description: '近乎割草般的体验，中幅降低敌人的属性。' },
        { level: 0, health: 0.85, attack: 0.85, armor: 0.85, description: '略微简单的体验。' },
        { level: 1, health: 1.0, attack: 1.0, armor: 1.0, description: '标准的战斗体验。' },
        { level: 2, health: 1.2, attack: 1.1, armor: 1.05, description: '略微强大的敌人，小幅提升敌人的属性。' },
        { level: 3, health: 1.4, attack: 1.15, armor: 1.1, description: '更加强大的敌人，中幅提升敌人的属性。' },
        { level: 4, health: 1.6, attack: 1.15, armor: 1.15, description: '极具挑战的敌人，大幅提升敌人的属性。' },
        { level: 5, health: 1.8, attack: 1.25, armor: 1.25, description: '极具挑战的敌人，大幅提升敌人的属性。' },
        { level: 6, health: 1.8, attack: 1.25, armor: 1.25, description: '极具挑战的敌人，大幅提升敌人的属性。' },
        { level: 7, health: 1.8, attack: 1.25, armor: 1.25, description: '极具挑战的敌人，大幅提升敌人的属性。' },
        { level: 8, health: 1.8, attack: 1.25, armor: 1.25, description: '极具挑战的敌人，大幅提升敌人的属性。' },
        { level: 9, health: 1.8, attack: 1.25, armor: 1.25, description: '极具挑战的敌人，大幅提升敌人的属性。' },
        { level: 10, health: 2.0, attack: 1.3, armor: 1.3, description: '极具挑战的敌人，大幅提升敌人的属性。' },
        { level: 11, health: 2.0, attack: 1.3, armor: 1.3, description: '' },
        { level: 12, health: 2.2, attack: 1.3, armor: 1.3, description: '' },
        { level: 13, health: 2.2, attack: 1.3, armor: 1.3, description: '' },
        { level: 14, health: 2.4, attack: 1.35, armor: 1.3, description: '' },
        { level: 15, health: 2.4, attack: 1.35, armor: 1.3, description: '' },
        { level: 16, health: 2.6, attack: 1.35, armor: 1.35, description: '' },
        { level: 17, health: 2.8, attack: 1.4, armor: 1.4, description: '' },
        { level: 18, health: 3.0, attack: 1.5, armor: 1.5, description: '' }
    ],
    categories: [
        { id: 'enemy', clientId: 'enemy', label: '敌人属性修正', short: '敌', order: 0 },
        { id: 'attribute', clientId: 'attributes', label: '玩家属性修正', short: '属', order: 1 },
        { id: 'mob_drop', clientId: 'drops', label: '掉落物修正', short: '掉', order: 2 },
        { id: 'starter_item', clientId: 'items', label: '物品补给', short: '物', order: 3 }
    ],
    modifiers: [
        { id: 'soul_tiny', category: 'starter_item', requiredLevel: 0, short: '破碎的耀魂', score: 0, name: '耀魂碎片补给', description: '获得 1 个耀魂碎片。', icon: 'slashblade:proudsoul_tiny', effect: { type: 'item', item: 'slashblade:proudsoul_tiny', count: 1 } },
        { id: 'crafting_terminal', category: 'starter_item', requiredLevel: -2, short: '合成终端', score: -1, name: 'ME 合成终端补给', description: '获得 2 个 ME 合成终端。', icon: 'ae2:crafting_terminal', effect: { type: 'item', item: 'ae2:crafting_terminal', count: 2 } },
        { id: 'smart_cable', category: 'starter_item', requiredLevel: -2, short: '智能线缆', score: -1, name: '红色智能线缆补给', description: '获得 16 个红色智能线缆。', icon: 'ae2:red_smart_cable', effect: { type: 'item', item: 'ae2:red_smart_cable', count: 16 } },
        { id: 'storage_bus', category: 'starter_item', requiredLevel: -2, short: '存储总线', score: -1, name: '存储总线补给', description: '获得 4 个存储总线。', icon: 'ae2:storage_bus', effect: { type: 'item', item: 'ae2:storage_bus', count: 4 } },
        { id: 'resonance_generator', category: 'starter_item', requiredLevel: -2, short: '共振发电机', score: -1, name: '水晶共振发电机补给', description: '获得 1 个水晶共振发电机。', icon: 'ae2:crystal_resonance_generator', effect: { type: 'item', item: 'ae2:crystal_resonance_generator', count: 1 } },
        { id: 'soul_ingot', category: 'starter_item', requiredLevel: -3, short: '耀魂铁锭', score: -1, name: '耀魂锭补给', description: '获得 16 个耀魂锭。', icon: 'slashblade:proudsoul_ingot', effect: { type: 'item', item: 'slashblade:proudsoul_ingot', count: 16 } },
        { id: 'soul_sphere', category: 'starter_item', requiredLevel: -3, short: '耀魂宝珠', score: -1, name: '耀魂宝珠补给', description: '获得 8 个耀魂宝珠。', icon: 'slashblade:proudsoul_sphere', effect: { type: 'item', item: 'slashblade:proudsoul_sphere', count: 8 } },
        { id: 'soul_crystal', category: 'starter_item', requiredLevel: -3, short: '耀魂结晶', score: -1, name: '耀魂结晶补给', description: '获得 4 个耀魂结晶。', icon: 'slashblade:proudsoul_crystal', effect: { type: 'item', item: 'slashblade:proudsoul_crystal', count: 4 } },
        { id: 'ender_hook', category: 'starter_item', requiredLevel: -4, short: '末影钩爪', score: -1, name: '末影钩补给', description: '获得 1 个末影钩。', icon: 'rehooked:ender_hook', effect: { type: 'item', item: 'rehooked:ender_hook', count: 1 } },
        { id: 'advanced_dislocator', category: 'starter_item', requiredLevel: -4, short: '高级传送器', score: -1, name: '高级传送器补给', description: '获得 1 个装有 128 点燃料的高级传送器。', icon: 'draconicevolution:advanced_dislocator', effect: { type: 'item', item: 'draconicevolution:advanced_dislocator', nbt: '{fuel:128}' } },
        { id: 'infinite_items', category: 'starter_item', requiredLevel: -7, short: '无限物品', score: -50, name: '无限物品补给', description: '获得 1 个创造贩卖升级。', icon: 'storagedrawers:creative_vending_upgrade', effect: { type: 'item', item: 'storagedrawers:creative_vending_upgrade', count: 1 } },
        { id: 'chaos_rod', category: 'starter_item', requiredLevel: 3, short: '混沌杖', score: 0, name: '混沌传送杖补给', description: '获得 1 个混沌传送杖。', icon: 'rodofdiscord:chaos_rod_500', effect: { type: 'item', item: 'rodofdiscord:chaos_rod_500', count: 1 } },
        { id: 'ap_gain', category: 'attribute', requiredLevel: -5, short: 'AP获取', score: -1, name: 'AP 获取强化', description: '永久获得 AP 获取比例 +1.5。', icon: 'minecraft:experience_bottle', effect: { type: 'attribute', modifierKey: 'ap_gain_percentage' } },
        { id: 'ap_reduce', category: 'attribute', requiredLevel: -5, short: 'AP减耗', score: -1, name: 'AP 消耗减免', description: '永久获得 AP 消耗减免 +300。', icon: 'minecraft:shield', effect: { type: 'attribute', modifierKey: 'ap_reduce_amount' } },
        { id: 'drop_2', category: 'mob_drop', requiredLevel: -4, short: '掉落Ⅱ', score: -1, name: '怪物掉落 II', description: '玩家击杀实体时，掉落倍率增量 +1。', icon: 'minecraft:chest', effect: { type: 'drop', bonus: 1 } },
        { id: 'drop_3', category: 'mob_drop', requiredLevel: -5, short: '掉落Ⅲ', score: -1, name: '怪物掉落 III', description: '玩家击杀实体时，掉落倍率增量 +2。', icon: 'minecraft:ender_chest', effect: { type: 'drop', bonus: 2 } },
        { id: 'enemy_attack_1', category: 'enemy', requiredLevel: 3, short: '敌攻Ⅰ', score: 1, name: '敌人修正：攻击 I', description: '敌人攻击倍率 +5%，与主轴加算。', icon: 'minecraft:iron_sword', effect: { type: 'enemy', stat: 'attack', bonus: 0.05 } },
        { id: 'enemy_attack_2', category: 'enemy', requiredLevel: 5, short: '敌攻Ⅱ', score: 2, name: '敌人修正：攻击 II', description: '敌人攻击倍率 +5%，与主轴加算。', icon: 'minecraft:diamond_sword', effect: { type: 'enemy', stat: 'attack', bonus: 0.05 } },
        { id: 'enemy_attack_3', category: 'enemy', requiredLevel: 10, short: '敌攻Ⅲ', score: 3, name: '敌人修正：攻击 III', description: '敌人攻击倍率 +5%，与主轴加算。', icon: 'minecraft:netherite_sword', effect: { type: 'enemy', stat: 'attack', bonus: 0.05 } },
        { id: 'enemy_attack_4', category: 'enemy', requiredLevel: 15, short: '敌攻Ⅳ', score: 4, name: '敌人修正：攻击 IV', description: '敌人攻击倍率 +5%，与主轴加算。', icon: 'minecraft:netherite_axe', effect: { type: 'enemy', stat: 'attack', bonus: 0.05 } },
        { id: 'enemy_attack_5', category: 'enemy', requiredLevel: 18, short: '敌攻Ⅴ', score: 5, name: '敌人修正：攻击 V', description: '敌人攻击倍率 +5%，与主轴加算。', icon: 'minecraft:trident', effect: { type: 'enemy', stat: 'attack', bonus: 0.05 } },
        { id: 'enemy_health_1', category: 'enemy', requiredLevel: 3, short: '敌命Ⅰ', score: 1, name: '敌人修正：生命 I', description: '敌人生命倍率 +50%，与主轴加算。', icon: 'minecraft:apple', effect: { type: 'enemy', stat: 'health', bonus: 0.5 } },
        { id: 'enemy_health_2', category: 'enemy', requiredLevel: 5, short: '敌命Ⅱ', score: 1, name: '敌人修正：生命 II', description: '敌人生命倍率 +50%，与主轴加算。', icon: 'minecraft:golden_apple', effect: { type: 'enemy', stat: 'health', bonus: 0.5 } },
        { id: 'enemy_health_3', category: 'enemy', requiredLevel: 10, short: '敌命Ⅲ', score: 1, name: '敌人修正：生命 III', description: '敌人生命倍率 +50%，与主轴加算。', icon: 'minecraft:enchanted_golden_apple', effect: { type: 'enemy', stat: 'health', bonus: 0.5 } },
        { id: 'enemy_health_4', category: 'enemy', requiredLevel: 15, short: '敌命Ⅳ', score: 1, name: '敌人修正：生命 IV', description: '敌人生命倍率 +50%，与主轴加算。', icon: 'minecraft:totem_of_undying', effect: { type: 'enemy', stat: 'health', bonus: 0.5 } },
        { id: 'enemy_health_5', category: 'enemy', requiredLevel: 18, short: '敌命Ⅴ', score: 1, name: '敌人修正：生命 V', description: '敌人生命倍率 +50%，与主轴加算。', icon: 'minecraft:beacon', effect: { type: 'enemy', stat: 'health', bonus: 0.5 } }
    ]
};

global.sdbfDifficultyData = sdbfDifficultyDataSource;
