let STAR_CHART_DIMENSION_KEY = 'dimension';
let STAR_CHART_GALACTIC_ADDRESS_KEY = 'sdbf.sgjourney.galactic_address';
let STAR_CHART_EXTRAGALACTIC_ADDRESS_KEY = 'sdbf.sgjourney.extragalactic_address';
let MILKY_WAY_KEY = $SGJourneyConversion.stringToGalaxyKey('sgjourney:milky_way');

ItemEvents.rightClicked('kubejs:star_chart', event => {
    let player = event.player;
    if (!player || player.isFake()) return;

    let tag = event.item.getOrCreateTag();
    let dimension = String(tag.getString(STAR_CHART_DIMENSION_KEY));
    if (!dimension) {
        player.tell(Text.translatable('info.kubejs.star_chart.unbound').color(Color.RED));
        return;
    }

    let universe = $SGJourneyUniverse['get(net.minecraft.server.MinecraftServer)'](player.server);
    let dimensionKey = $SGJourneyConversion.stringToDimension(dimension);
    let galacticAddress = universe.getAddressInGalaxyFromDimension(MILKY_WAY_KEY, dimensionKey);
    let extragalacticAddress = universe.getExtragalacticAddressFromDimension(dimensionKey);

    if (galacticAddress) {
        tag.putString(STAR_CHART_GALACTIC_ADDRESS_KEY, String(galacticAddress.toString()));
    } else {
        tag.remove(STAR_CHART_GALACTIC_ADDRESS_KEY);
    }

    if (extragalacticAddress) {
        tag.putString(STAR_CHART_EXTRAGALACTIC_ADDRESS_KEY, String(extragalacticAddress.toString()));
    } else {
        tag.remove(STAR_CHART_EXTRAGALACTIC_ADDRESS_KEY);
    }

    if (!galacticAddress && !extragalacticAddress) {
        player.tell(Text.translatable('info.kubejs.star_chart.sync_failed').color(Color.RED));
        return;
    }

    player.cooldowns.addCooldown(event.item, 10);
    player.tell(Text.translatable('info.kubejs.star_chart.synced').color(Color.AQUA));
});