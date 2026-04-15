// priority: 50
const $EntityTravelToDimensionEvent = Java.loadClass("net.minecraftforge.event.entity.EntityTravelToDimensionEvent")
const MIDNIGHT_STAGE = 'sdbf.midnight'

NativeEvents.onEvent($EntityTravelToDimensionEvent, /** @param {Internal.EntityTravelToDimensionEvent} event  */ event => {
    /**
    * @type {Internal.ServerPlayer}
    */
    let player = event.entity
    let key = event.dimension.location().toString()

    if (player.player) {
        switch (key) {
            case 'midnight:the_midnight':
                if (!player.stages.has(MIDNIGHT_STAGE)) {
                    event.setCanceled(true)
                    player.tell(Text.translatable('info.kubejs.the_midnight_disallowed').darkPurple())
                    punishPlayer(player)
                }
                break

        }

    }

})

BlockEvents.rightClicked(event => {
    if (event.item == 'midnight:rift_placer') {
        let player = event.player;
        player.stages.add(MIDNIGHT_STAGE);
        event.server.scheduleInTicks(1, callback => {
            player.addItemCooldown('midnight:rift_placer', 200);
        });
    }


})


