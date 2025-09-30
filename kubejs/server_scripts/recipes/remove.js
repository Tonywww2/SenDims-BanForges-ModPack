const toRemoveID = new Set([
    "easy_villagers:farmer",
    "easy_villagers:iron_farm"
]);

ServerEvents.recipes(event => {
    for (const id of toRemoveID) {
        event.remove({ id: id });
    }
})
