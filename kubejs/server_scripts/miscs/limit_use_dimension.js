let LIMIT_DIMENSTION_KEY = "sdbf.use_in";

let limitUseDimension = (event) => {
    let item = event.getItem();

    if (!item.hasNBT()) return;

    let tag = item.getNbt();

    if (!tag.contains(LIMIT_DIMENSTION_KEY)) return;

    let targetDim = tag.getString(LIMIT_DIMENSTION_KEY);
    let level = event.getLevel();

    if (level.dimensionKey != targetDim) {
        let player = event.player;

        player.addItemCooldown(item, 20);
        player.tell(
            Text.translatable("info.kubejs.dimension_limit").append(
                Text.of(targetDim)
            ).color(Color.WHITE));
        event.cancel(true);
        return;
    }
}

let addDimensionLimitToItem = (stack, dimension) => {
    stack.getOrCreateTag().putString(LIMIT_DIMENSTION_KEY, dimension);
}

ItemEvents.rightClicked(event => {
    if (event.item && !event.item.isEmpty()) {
        limitUseDimension(event);
    }

})

BlockEvents.rightClicked(event => {
    if (event.item && !event.item.isEmpty()) {
        limitUseDimension(event);
    }
})