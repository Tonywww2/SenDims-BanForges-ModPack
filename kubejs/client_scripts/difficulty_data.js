// priority: 100

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
    global.sdbfDifficultyDataJson = configText;
    console.log(
        `[SDBF Difficulty] Received server config: ` +
        `class=${packetData.getClass().getName()}, keys=${packetData.getAllKeys()}, ` +
        `length=${configText.length}, tagType=${packetData.getTagType('json')}`
    );
});