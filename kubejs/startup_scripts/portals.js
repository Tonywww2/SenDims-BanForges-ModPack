const $CustomPortalBuilder = Java.loadClass("net.kyrptonaught.customportalapi.api.CustomPortalBuilder")
const $BuiltinDimensionTypes = Java.loadClass("net.minecraft.world.level.dimension.BuiltinDimensionTypes")

StartupEvents.postInit(event => {
    // 豆腐
    $CustomPortalBuilder.beginPortal()
    ["frameBlock(net.minecraft.world.level.block.Block)"]
        (Block.getBlock('minecraft:mossy_cobblestone'))
        .destDimID('tofucraft:tofu_world')
        .lightWithItem(Item.getItem('kubejs:garden_lighter'))
        .tintColor(224, 224, 224)
        .onlyLightInOverworld()
        .registerPortal();

    // 深境1
    $CustomPortalBuilder.beginPortal()
    ["frameBlock(net.minecraft.world.level.block.Block)"]
        (Block.getBlock('biomemakeover:cracked_bricks'))
        .destDimID('sdbf:deep_realm_level_1')
        .lightWithItem(Item.getItem('slashblade_sendims:deeprealm_certificate'))
        .tintColor(200, 200, 200)
        .onlyLightInOverworld()
        .registerPortal();

    // 深境2
    $CustomPortalBuilder.beginPortal()
    ["frameBlock(net.minecraft.world.level.block.Block)"]
        (Block.getBlock('aether:sentry_stone'))
        .destDimID('sdbf:deep_realm_level_2')
        .lightWithItem(Item.getItem('integrateddynamics:variable'))
        .tintColor(204, 255, 255)
        .onlyLightInOverworld()
        .registerPortal();

})