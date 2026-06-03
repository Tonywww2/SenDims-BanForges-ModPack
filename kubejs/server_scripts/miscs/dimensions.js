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
                    event.setCanceled(true);
                    player.tell(Text.translatable('info.kubejs.the_midnight_disallowed').darkPurple());
                    punishPlayer(player);
                }
                break

            case 'minecraft:the_end':
                if (!hasCurios(player, 'slashblade_sendims:blessing_petals')) {
                    event.setCanceled(true);
                    player.tell(Text.translatable('info.kubejs.the_end_disallowed').darkPurple());
                    punishPlayer(player);
                }
                break

            case 'the_bumblezone:the_bumblezone':
                if (!hasCurios(player, 'slashblade_sendims:the_nectar_quest')) {
                    event.setCanceled(true);
                    player.tell(Text.translatable('info.kubejs.the_bumblezone_disallowed').darkPurple());
                    punishPlayer(player);
                }
                break

        }

    }

})

BlockEvents.rightClicked(event => {
    let item = event.item
    if (item == 'midnight:rift_placer') {
        let player = event.player;
        if (!item.hasNBT() || !item.nbt.getBoolean(MIDNIGHT_STAGE)) {
            player.tell(Text.translatable("info.kubejs.item_unactivated"))
            event.cancel()
            return
        }

        player.stages.add(MIDNIGHT_STAGE);
        event.server.scheduleInTicks(1, callback => {
            player.addItemCooldown('midnight:rift_placer', 200);
        });
    }


})

NativeEvents.onEvent($PortalSpawnEvent, event => {
    let pos = event.pos
    let level = event.level

    let isObsidian = p => {
        // print(level.getBlockState(p).getBlock())
        return level.getBlockState(p).getBlock() == Blocks.OBSIDIAN;
    }

    if (isObsidian(pos.below()) ||
        isObsidian(pos.above()) ||
        isObsidian(pos.north()) ||
        isObsidian(pos.south()) ||
        isObsidian(pos.east()) ||
        isObsidian(pos.west())) {
        event.setCanceled(true);
    }
})

BlockEvents.rightClicked(event => {
    let { player, level, block, item } = event;
    let dimension = level.dimension.toString();
    if (item != 'undergarden:catalyst') return;

    console.log(`[Undergarden Portal] Catalyst used at ${block.pos} in ${dimension}`);

    if (dimension == 'undergarden:undergarden' || dimension == 'minecraft:overworld') {
        let clickedPos = block.pos;
        let portalBlock = $UGBlocks.UNDERGARDEN_PORTAL.get();

        let verticalDirections = [Direction.UP, Direction.DOWN];

        for (let dir of verticalDirections) {
            // console.log(`[Undergarden Portal] Checking direction: ${dir}`);
            let framePos = clickedPos.relative(dir);

            let size = portalBlock.isPortal(level, framePos);
            // console.log(`[Undergarden Portal] Dimension check, portal size: ${size != null ? 'valid' : 'null'}`);

            // if (size != null && !portalBlock.isPortalSpawnCanceled(level, framePos, size)) {
            if (size != null) {
                // console.log(`[Undergarden Portal] Spawning portal blocks at ${framePos}`);
                size.createPortalBlocks();
                level.playSound(player, framePos, $UGSoundEvents.UNDERGARDEN_PORTAL_ACTIVATE.get(), "blocks", 1.0, 1.0);
                event.success();
                return;
            } else {
                // console.log(`[Undergarden Portal] Portal fails to spawn at direction: ${dir}`);
                event.cancel();
                return;
            }
        }
    }
});