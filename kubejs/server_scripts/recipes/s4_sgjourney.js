ServerEvents.recipes(event => {
    let gatewayRecipe = (id, outer, inner, center) => {
        event.shaped(Item.of('gateways:gate_pearl', `{gateway:"gateways:${id}"}`), [
            'ABA',
            'BCB',
            'ABA'
        ], {
            A: outer,
            B: inner,
            C: center
        }).id(`sdbf:${id}_s4`)
    };

    gatewayRecipe('sdbf_sgj_abydos_g1', 'sgjourney:raw_naquadah', 'minecraft:sand', 'slashblade:proudsoul_sphere');
    gatewayRecipe('sdbf_sgj_abydos_g2', 'sgjourney:naquadah_ingot', 'apotheosis:epic_material', 'slashblade:proudsoul_crystal');

    gatewayRecipe('sdbf_sgj_athos_g1', 'aether:ambrosium_shard', 'minecraft:oak_leaves', 'slashblade:proudsoul_sphere');
    gatewayRecipe('sdbf_sgj_athos_g2', 'twilightforest:ironwood_ingot', 'apotheosis:epic_material', 'slashblade:proudsoul_crystal');

    gatewayRecipe('sdbf_sgj_chulak_g1', 'sgjourney:naquadah_nugget', 'minecraft:moss_block', 'slashblade:proudsoul_sphere');
    gatewayRecipe('sdbf_sgj_chulak_g2', 'sgjourney:goauld_fossil', 'apotheosis:epic_material', 'slashblade:proudsoul_crystal');

    gatewayRecipe('sdbf_sgj_lantea_g1', 'minecraft:prismarine_shard', 'minecraft:sea_lantern', 'slashblade:proudsoul_sphere');
    gatewayRecipe('sdbf_sgj_lantea_g2', 'sgjourney:naquadah_ingot', 'apotheosis:epic_material', 'slashblade:proudsoul_crystal');

    gatewayRecipe('sdbf_sgj_rima_g1', 'sgjourney:raw_naquadah', 'minecraft:coarse_dirt', 'slashblade:proudsoul_sphere');
    gatewayRecipe('sdbf_sgj_rima_g2', 'sgjourney:refined_naquadah', 'apotheosis:epic_material', 'slashblade:proudsoul_crystal');

    gatewayRecipe('sdbf_sgj_tollan_g1', 'sgjourney:raw_trinium', 'minecraft:basalt', 'slashblade:proudsoul_sphere');
    gatewayRecipe('sdbf_sgj_tollan_g2', 'sgjourney:trinium_ingot', 'apotheosis:epic_material', 'slashblade:proudsoul_crystal');

    gatewayRecipe('sdbf_sgj_unitas_g1', 'sgjourney:unity_shard', 'sgjourney:sulfur_sand', 'slashblade:proudsoul_sphere');
    gatewayRecipe('sdbf_sgj_unitas_g2', 'sgjourney:budding_unity', 'apotheosis:epic_material', 'slashblade:proudsoul_crystal');
})