const $SGJourneyUniverse = Java.loadClass('net.povstalec.sgjourney.common.data.Universe');
const $SGJourneyConversion = Java.loadClass('net.povstalec.sgjourney.common.misc.Conversion');

const STAR_CHART_DIMENSIONS_KEY = 'dimensions';
const STAR_CHART_GALACTIC_ADDRESSES_KEY = 'sdbf.sgjourney.galactic_addresses';
const MILKY_WAY_KEY = $SGJourneyConversion.stringToGalaxyKey('sgjourney:milky_way');

ItemEvents.rightClicked('kubejs:star_chart', event => {
    let player = event.player;
    if (!player || player.isFake()) return;

    let tag = event.item.getOrCreateTag();
    if (!tag.contains(STAR_CHART_DIMENSIONS_KEY, 9)) {
        player.tell(Text.translatable('info.kubejs.star_chart.unbound').color(Color.RED));
        return;
    }

    let universe = $SGJourneyUniverse['get(net.minecraft.server.MinecraftServer)'](player.server);
    let dimensions = tag.getList(STAR_CHART_DIMENSIONS_KEY, 8);
    let addresses = [];
    let resolved = 0;

    for (let index = 0; index < dimensions.size(); index++) {
        let dimensionKey = $SGJourneyConversion.stringToDimension(dimensions.getString(index));
        let address = universe.getAddressInGalaxyFromDimension(MILKY_WAY_KEY, dimensionKey);

        if (address) {
            addresses.push(String(address.toString()));
            resolved++;
        } else {
            addresses.push('');
        }
    }

    tag.put(STAR_CHART_GALACTIC_ADDRESSES_KEY, NBT.toTagList(addresses));
    player.cooldowns.addCooldown(event.item, 10);
    player.tell(Text.translatable(
        'info.kubejs.star_chart.synced',
        resolved,
        dimensions.size()
    ).color(Color.AQUA));
});