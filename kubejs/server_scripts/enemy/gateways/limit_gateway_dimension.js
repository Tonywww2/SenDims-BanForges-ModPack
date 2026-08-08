let dimensionLimitMap = Utils.newMap();

dimensionLimitMap.put("gateways:sdbf_dr1_g1", "sdbf:deep_realm_level_1");
dimensionLimitMap.put("gateways:sdbf_dr1_g2", "sdbf:deep_realm_level_1");

dimensionLimitMap.put("gateways:sdbf_moon_g1", "ad_astra:moon");

dimensionLimitMap.put("gateways:sdbf_nether_g1", "minecraft:the_nether");
dimensionLimitMap.put("gateways:sdbf_nether_g2", "minecraft:the_nether");
dimensionLimitMap.put("gateways:sdbf_nether_g3", "minecraft:the_nether");

dimensionLimitMap.put("gateways:sdbf_mars_g1", "ad_astra:mars");

dimensionLimitMap.put("gateways:sdbf_sr_ayeti", "slashblade_sendims:saturn_ring");
dimensionLimitMap.put("gateways:sdbf_sr_kp", "slashblade_sendims:saturn_ring");

dimensionLimitMap.put("gateways:sdbf_sgj_abydos_g1", "sgjourney:abydos");
dimensionLimitMap.put("gateways:sdbf_sgj_abydos_g2", "sgjourney:abydos");
dimensionLimitMap.put("gateways:sdbf_sgj_athos_g1", "sgjourney:athos");
dimensionLimitMap.put("gateways:sdbf_sgj_athos_g2", "sgjourney:athos");
dimensionLimitMap.put("gateways:sdbf_sgj_chulak_g1", "sgjourney:chulak");
dimensionLimitMap.put("gateways:sdbf_sgj_chulak_g2", "sgjourney:chulak");
dimensionLimitMap.put("gateways:sdbf_sgj_lantea_g1", "sgjourney:lantea");
dimensionLimitMap.put("gateways:sdbf_sgj_lantea_g2", "sgjourney:lantea");
dimensionLimitMap.put("gateways:sdbf_sgj_rima_g1", "sgjourney:rima");
dimensionLimitMap.put("gateways:sdbf_sgj_rima_g2", "sgjourney:rima");
dimensionLimitMap.put("gateways:sdbf_sgj_tollan_g1", "sgjourney:tollan");
dimensionLimitMap.put("gateways:sdbf_sgj_tollan_g2", "sgjourney:tollan");
dimensionLimitMap.put("gateways:sdbf_sgj_unitas_g1", "sgjourney:unitas");
dimensionLimitMap.put("gateways:sdbf_sgj_unitas_g2", "sgjourney:unitas");

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