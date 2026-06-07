let dimensionLimitMap = Utils.newMap();

dimensionLimitMap.put("gateways:basic/blaze", "minecraft:the_nether");

BlockEvents.rightClicked(event => {
    let item = event.getItem();
    if (item == 'gateways:gate_pearl') {
        let tag = item.getNbt();
        if (!tag.contains("gateway")) return;

        let gateWayId = tag.getString("gateway");

        if (dimensionLimitMap.containsKey(gateWayId)) {
            let targetDim = dimensionLimitMap.get(gateWayId);
            let player = event.player;

            if (player.getLevel().dimensionKey != targetDim) {
                player.addItemCooldown(item, 20);
                player.tell(
                    Text.translatable("info.kubejs.dimension_limit").append(
                        Text.of(targetDim)
                    ).color(Color.WHITE));
                event.cancel(true);
            }
        }


    }
})