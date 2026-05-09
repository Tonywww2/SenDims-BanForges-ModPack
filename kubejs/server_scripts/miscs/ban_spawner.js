let bannedTag = $TagKey.create($Registries.ENTITY_TYPE, new ResourceLocation('enderio:soul_vial_blacklist'));

let bannedModifyMobs = new Set([
    'ad_astra:martian_raptor',
    'minecraft:phantom'
]);

BlockEvents.rightClicked("minecraft:spawner", event => {
    let entityData = event.block.entityData;
    if (entityData && entityData.SpawnData && entityData.SpawnData.entity && entityData.SpawnData.entity.id) {
        let currentId = String(entityData.SpawnData.entity.id);
        
        let entityTypeInSpawner = $ForgeRegistries.ENTITY_TYPES.getValue(new ResourceLocation(currentId));
        let isBannedByTag = entityTypeInSpawner && entityTypeInSpawner.is(bannedTag);

        if (bannedModifyMobs.has(currentId) || isBannedByTag) {
            event.player.tell(Text.translate("info.kubejs.spawner.cannot_modify"));
            event.player.cooldowns.addCooldown(event.item, 40);
            event.cancel();
            return;
        }
    }

    let item = event.item;
    if (item.item instanceof $SpawnEggItem) {
        let egg = $SpawnEggItem(item.item);
        let entityType = egg.getDefaultType();

        // console.log(entityType.is(bannedTag))
        if (entityType && entityType.is(bannedTag)) {
            event.player.tell(Text.translate("info.kubejs.spawner.cannot_insert"));
            event.player.cooldowns.addCooldown(event.item, 40);
            event.cancel();
        }

    }

});