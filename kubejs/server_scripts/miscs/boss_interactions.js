const $TheHarbingerEntity = Java.loadClass('com.github.L_Ender.cataclysm.entity.AnimationMonster.BossMonsters.The_Harbinger_Entity');
const $GlobalPos = Java.loadClass('net.minecraft.core.GlobalPos');

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