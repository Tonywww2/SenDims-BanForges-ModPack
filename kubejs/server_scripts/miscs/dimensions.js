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
