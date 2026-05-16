
MoreJSEvents.registerPotionBrewing(event => {
    event.removeByPotion('minecraft:turtle_master', null, null);
    event.removeByPotion('apotheosis:resistance', null, null);
    event.removeByPotion('apotheosis:flying', null, null);
    event.removeByPotion('minecraft:potion', null, null);

    event.removeByPotion(null, 'minecraft:turtle_helmet', null);
    event.removeByPotion(null, 'minecraft:shulker_shell', null);
    event.removeByPotion(null, 'minecraft:popped_chorus_fruit', null);

})
