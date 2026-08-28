// priority: 90

let axis = (level, health, attack, armor, items) => ({
    id: `n_${level}`,
    level: level,
    multipliers: { health: health, attack: attack, armor: armor },
    items: items || []
});

// Main axis must stay sorted from N-10 to N+10.
let axisDefinitions = [
    axis(-10, 0.2, 0.2, 0.2),
    axis(-9, 0.4, 0.4, 0.4),
    axis(-8, 0.4, 0.4, 0.4),
    axis(-7, 0.4, 0.4, 0.4),
    axis(-6, 0.4, 0.4, 0.4),
    axis(-5, 0.4, 0.4, 0.4),
    axis(-4, 0.6, 0.6, 0.6),
    axis(-3, 0.6, 0.6, 0.6),
    axis(-2, 0.75, 0.75, 0.75),
    axis(-1, 0.75, 0.75, 0.75),
    axis(0, 0.85, 0.85, 0.85),
    axis(1, 1.0, 1.0, 1.0),
    axis(2, 1.2, 1.1, 1.05),
    axis(3, 1.4, 1.15, 1.1),
    axis(4, 1.6, 1.15, 1.15),
    axis(5, 1.8, 1.25, 1.25),
    axis(6, 1.8, 1.25, 1.25),
    axis(7, 1.8, 1.25, 1.25),
    axis(8, 1.8, 1.25, 1.25),
    axis(9, 1.8, 1.25, 1.25),
    axis(10, 3.0, 1.5, 1.5)
];

let modifierCatalog = {
    ap_gain_percentage: {
        uuid: '19f55a7d-f033-45fe-ba52-46b7012c6574',
        attribute: 'slashblade_sendims:ap_gain_percentage',
        translationKey: 'attribute.name.sbsd.ap_gain_percentage',
        operation: 'addition',
        amount: 1.5
    },
    ap_reduce_amount: {
        uuid: 'c2dd843a-6588-432f-9fc7-9f6dd8d3487f',
        attribute: 'slashblade_sendims:ap_reduce_amount',
        translationKey: 'attribute.name.sbsd.ap_reduce_amount',
        operation: 'addition',
        amount: 300
    }
};

let subCategories = [
    { id: 'starter_item', short: '物', order: 0 },
    { id: 'attribute', short: '属', order: 1 },
    { id: 'mob_drop', short: '掉', order: 2 }
];

let subModifier = (id, category, requiredLevel, short, effect) => ({
    id: id,
    category: category,
    requiredLevel: requiredLevel,
    short: short,
    effect: effect
});
let itemSubModifier = (id, requiredLevel, short, stack) => {
    return subModifier(id, 'starter_item', requiredLevel, short, { type: 'item', stack: stack });
};
let attributeSubModifier = (id, requiredLevel, short, modifierKey) => {
    return subModifier(id, 'attribute', requiredLevel, short, { type: 'attribute', modifierKey: modifierKey });
};
let dropSubModifier = (id, requiredLevel, short, bonus) => {
    return subModifier(id, 'mob_drop', requiredLevel, short, { type: 'drop', bonus: bonus });
};

// Negative requirements use <=; positive requirements use >=.
let subModifierDefinitions = [
    itemSubModifier('soul_tiny', 0, '魂碎', Item.of('slashblade:proudsoul_tiny')),
    itemSubModifier('crafting_terminal', -2, '合成端', Item.of('ae2:crafting_terminal', 2)),
    itemSubModifier('smart_cable', -2, '智能缆', Item.of('ae2:red_smart_cable', 16)),
    itemSubModifier('storage_bus', -2, '存储总', Item.of('ae2:storage_bus', 4)),
    itemSubModifier('resonance_generator', -2, '共振机', Item.of('ae2:crystal_resonance_generator')),
    itemSubModifier('soul_ingot', -3, '耀魂锭', Item.of('slashblade:proudsoul_ingot', 16)),
    itemSubModifier('soul_sphere', -3, '耀魂珠', Item.of('slashblade:proudsoul_sphere', 8)),
    itemSubModifier('soul_crystal', -3, '耀魂晶', Item.of('slashblade:proudsoul_crystal', 4)),
    itemSubModifier('ender_hook', -4, '末影钩', Item.of('rehooked:ender_hook')),
    itemSubModifier('advanced_dislocator', -4, '高级传', Item.of('draconicevolution:advanced_dislocator', '{fuel:128}')),
    itemSubModifier('infinite_items', -10, '无限物', Item.of('storagedrawers:creative_vending_upgrade')),
    itemSubModifier('chaos_rod', 3, '混沌杖', Item.of('rodofdiscord:chaos_rod_500')),
    attributeSubModifier('ap_gain', -5, 'AP获取', 'ap_gain_percentage'),
    attributeSubModifier('ap_reduce', -5, 'AP减耗', 'ap_reduce_amount'),
    dropSubModifier('drop_2', -4, '掉落Ⅱ', 1),
    dropSubModifier('drop_3', -5, '掉落Ⅲ', 2)
];