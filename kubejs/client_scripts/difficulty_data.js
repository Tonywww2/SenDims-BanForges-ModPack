// priority: 100

let localizeDifficultyText = (key, fallback, placeholders) => {
    let component;
    if (placeholders && placeholders.length == 2) component = Text.translatable(key, placeholders[0], placeholders[1]);
    else if (placeholders && placeholders.length == 1) component = Text.translatable(key, placeholders[0]);
    else component = Text.translatable(key);
    let translated = String(component.getString());
    return translated == key ? fallback : translated;
};

let localizeDifficultyConfig = configText => {
    let data = JSON.parse(String(configText));
    data.axes.forEach(axis => {
        let nameKey = `kubejs.difficulty.n_${axis.level}`;
        axis.label = localizeDifficultyText(nameKey, `N${axis.level > 0 ? '+' : ''}${axis.level}`);
        axis.description = localizeDifficultyText(`${nameKey}.desc`, String(axis.description || ''));
    });
    data.confirmationI18n = {};
    let placeholders = { title: ['{level}'], progress: ['{step}', '{total}'], input_hint: ['{word}'] };
    ['title', 'progress', 'continue', 'submit', 'cancel', 'input_hint', 'combat', 'duration', 'high', 'extreme', 'selection_changed'].forEach(id => {
        let key = `kubejs.difficulty.confirm.${id}`;
        data.confirmationI18n[id] = localizeDifficultyText(key, key, placeholders[id]);
    });
    return JSON.stringify(data);
};

NetworkEvents.dataReceived('sdbf_difficulty_probe', event => {
    let packetData = event.getData();
    console.log(
        `[SDBF Difficulty] Received probe: class=${packetData.getClass().getName()}, ` +
        `keys=${packetData.getAllKeys()}, probe=${packetData.getString('probe')}, ` +
        `probeType=${packetData.getTagType('probe')}, ` +
        `expectedLength=${packetData.getInt('expectedLength')}, ` +
        `lengthType=${packetData.getTagType('expectedLength')}`
    );
});

NetworkEvents.dataReceived('sdbf_difficulty_data', event => {
    let packetData = event.getData();
    let configText = String(packetData.getString('json'));
    global.sdbfDifficultyDataJson = localizeDifficultyConfig(configText);
    console.log(
        `[SDBF Difficulty] Received server config: ` +
        `class=${packetData.getClass().getName()}, keys=${packetData.getAllKeys()}, ` +
        `length=${configText.length}, tagType=${packetData.getTagType('json')}`
    );
});
