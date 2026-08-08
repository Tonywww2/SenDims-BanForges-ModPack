// Java classes for startup scripts belong in utils.js.

SBSDEvents.registerTier(event => {
//     event.registerTier(4,
//          "kubejs:mining_tier_4", 'aether_treasure_reforging:valkyrum_ingot', ['aether_treasure_reforging:valkyrum_ingot'],
//           "kubejs:valkyrum")

    event.registerTier(5,
         "kubejs:mining_tier_5", "aether_treasure_reforging:valkyrum_ingot", ["minecraft:netherite"],
          "kubejs:valkyrum")

    // TODO 6

    event.registerTier(7,
         "kubejs:mining_tier_7", "nuclearcraft:thorium_ingot", ["kubejs:enderium"],
          "kubejs:thorium")

    event.registerTier(8,
         "kubejs:mining_tier_8", "nuclearcraft:tough_alloy_ingot", ["kubejs:thorium"],
          "kubejs:tough")

    event.registerTier(9,
         "kubejs:mining_tier_9", "nuclearcraft:qnp", ["kubejs:tough"],
          "kubejs:qnp")

    // TODO 10

})
