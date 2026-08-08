ItemEvents.entityInteracted('minecraft:diamond', event => {
    let { target, player, hand, item, level } = event;


    if (hand !== 'MAIN_HAND' || level.isClientSide()) return;

    if (target instanceof $TheHarbingerEntity) {
        
        if (!target.getIsAct()) {
            if (!player.isCreative()) {
                item.count--;
            }

            target.setIsAct(true)
            target.setHomePos($GlobalPos.of(target.level.getDimensionKey(), target.blockPosition()));
            target.heal(target.getMaxHealth());

            player.tell("FORCED");
            event.success()

        }
    }
});