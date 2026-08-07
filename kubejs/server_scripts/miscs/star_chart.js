const $SGJourneyUniverse = Java.loadClass('net.povstalec.sgjourney.common.data.Universe');
const $SGJourneyConversion = Java.loadClass('net.povstalec.sgjourney.common.misc.Conversion');

const STAR_CHART_DIMENSION_KEY = 'dimension';
const STAR_CHART_GALACTIC_ADDRESS_KEY = 'sdbf.sgjourney.galactic_address';
const MILKY_WAY_KEY = $SGJourneyConversion.stringToGalaxyKey('sgjourney:milky_way');

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
    let address = universe.getAddressInGalaxyFromDimension(MILKY_WAY_KEY, dimensionKey);

    if (!address) {
        tag.remove(STAR_CHART_GALACTIC_ADDRESS_KEY);
        player.tell(Text.translatable('info.kubejs.star_chart.sync_failed').color(Color.RED));
        return;
    }

    tag.putString(STAR_CHART_GALACTIC_ADDRESS_KEY, String(address.toString()));
    player.cooldowns.addCooldown(event.item, 10);
    player.tell(Text.translatable('info.kubejs.star_chart.synced').color(Color.AQUA));
});