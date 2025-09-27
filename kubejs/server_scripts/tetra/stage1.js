// priority: 100
ServerEvents.highPriorityData(event => {
    tetraMaterialBuilder(event, "crystal_glass").setCategory("gem")
        .setPrimary(6).setSecondary(2.5).setTertiary(0.5)
        .setDurability(300).setIntegrityCost(1).setIntegrityGain(2)
        .setMagicCapacity(80).setToolLevel(3).setToolEfficiency(7)
        .setTints("ececec", "ffffff").addTexture("shiny").addTexture("crude")
        .addItemMaterial('blue_skies:crystal_glass')
        .addImprovements("arrested", 0)
        .setRequiredTool("hammer_dig", 1)
        .build()

})
