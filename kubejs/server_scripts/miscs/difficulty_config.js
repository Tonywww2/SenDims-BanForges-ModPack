// priority: 90

let difficultyData = global.sdbfDifficultyData;
let difficultyDataJson = JSON.stringify(difficultyData);

let validateDifficultyData = data => {
    if (!data || data.schemaVersion != 1) throw new Error('Unsupported difficulty data schema.');
    if (!Array.isArray(data.axes) || data.axes.length == 0) throw new Error('Difficulty axes are missing.');
    if (!Array.isArray(data.categories) || !Array.isArray(data.modifiers)) throw new Error('Difficulty categories or modifiers are missing.');
    let levels = {};
    let previousLevel = null;
    data.axes.forEach(axis => {
        let level = Number(axis.level);
        if (!isFinite(level) || levels[level]) throw new Error(`Invalid or duplicate difficulty level: ${axis.level}`);
        if (previousLevel != null && level <= previousLevel) throw new Error('Difficulty axes must be strictly ascending.');
        levels[level] = true;
        previousLevel = level;
    });
    if (!levels[0]) throw new Error('Difficulty axis N0 is required.');
    let categoryIds = {};
    data.categories.forEach(category => {
        if (!category.id || categoryIds[category.id]) throw new Error(`Invalid or duplicate difficulty category: ${category.id}`);
        categoryIds[category.id] = true;
    });
    let modifierIds = {};
    data.modifiers.forEach(modifier => {
        if (!modifier.id || modifierIds[modifier.id]) throw new Error(`Invalid or duplicate difficulty modifier: ${modifier.id}`);
        if (!categoryIds[modifier.category]) throw new Error(`Unknown modifier category: ${modifier.category}`);
        if (!levels[modifier.requiredLevel]) throw new Error(`Unknown modifier level: ${modifier.requiredLevel}`);
        modifierIds[modifier.id] = true;
    });
};

validateDifficultyData(difficultyData);
console.info(
    `[SDBF Difficulty] Loaded JS config: axes=${difficultyData.axes.length}, ` +
    `categories=${difficultyData.categories.length}, modifiers=${difficultyData.modifiers.length}`
);

let axisDefinitions = difficultyData.axes.map(definition => ({
    id: `n_${definition.level}`,
    level: definition.level,
    label: `N${definition.level > 0 ? '+' : ''}${definition.level}`,
    multipliers: {
        health: definition.health,
        attack: definition.attack,
        armor: definition.armor
    },
    description: definition.description,
    items: []
}));

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

let subCategories = difficultyData.categories.map(category => ({
    id: category.id,
    short: category.short,
    order: category.order
}));

let subModifierDefinitions = difficultyData.modifiers.map(definition => {
    let effect = definition.effect;
    let runtimeEffect = Object.assign({}, effect);
    if (effect.type == 'item') {
        if (effect.nbt) runtimeEffect.stack = Item.of(effect.item, effect.nbt);
        else runtimeEffect.stack = Item.of(effect.item, effect.count || 1);
    }
    return {
        id: definition.id,
        category: definition.category,
        requiredLevel: definition.requiredLevel,
        short: definition.short,
        score: definition.score,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        effect: runtimeEffect
    };
});