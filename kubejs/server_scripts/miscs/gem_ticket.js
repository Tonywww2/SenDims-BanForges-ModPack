ItemEvents.rightClicked('kubejs:gem_ticket', event => {
    let player = event.player;
    if (!player || player.isFake()) return;

    let server = event.player.server;
    if (!server) return;

    let item = event.item;

    let levelKey = item.getOrCreateTag().getString(GEM_TICKET_DIM_PATH);

    let level = server.getLevel(levelKey);
    if (!level) return;

    let gem = $GemRegistry.createRandomGemStack(
        player.random,
        level,
        player.getLuck(),
        $IDimensional["matches(net.minecraft.world.level.Level)"](level), 
        $IStaged.matches(player)
    );

    player.give(gem);
    player.cooldowns.addCooldown(item, 2);
    item.shrink(1);


})