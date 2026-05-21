ItemEvents.modification(event => {
    event.modify('cataclysm:void_core', item => {
        item.maxStackSize = 8;
    });
});