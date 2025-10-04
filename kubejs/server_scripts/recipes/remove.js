const toRemoveID = new Set([
    "easy_villagers:farmer",
    "easy_villagers:iron_farm",
    "minecraft:enchanting_table",
    "apotheosis:hellshelf",
    "apotheosis:enchanting/infused_hellshelf",
    "apotheosis:blazing_hellshelf",
    "apotheosis:glowing_hellshelf",
    "apotheosis:seashelf",
    "apotheosis:enchanting/infused_seashelf",
    "apotheosis:crystal_seashelf",
    "apotheosis:heart_seashelf",
    "apotheosis:dormant_deepshelf",
    "apotheosis:enchanting/deepshelf",
    "apotheosis:echoing_deepshelf",
    "apotheosis:soul_touched_deepshelf",
    "apotheosis:echoing_sculkshelf",
    "apotheosis:soul_touched_sculkshelf",
    "apotheosis:endshelf",
    "apotheosis:pearl_endshelf",
    "apotheosis:draconic_endshelf",
    "apotheosis:beeshelf",
    "apotheosis:melonshelf",
    "apotheosis:stoneshelf",
    "apotheosis:rectifier",
    "apotheosis:rectifier_t2",
    "apotheosis:rectifier_t3",
    "apotheosis:sightshelf",
    "apotheosis:sightshelf_t2",
    "apotheosis:filtering_shelf",
    "apotheosis:treasure_shelf",
    "apotheosis:library",
    "apotheosis:enchanting/ender_library",
    "dustandash:crafting/sharpen_flint"
]);

ServerEvents.recipes(event => {
    for (const id of toRemoveID) {
        event.remove({ id: id });
    }
})
