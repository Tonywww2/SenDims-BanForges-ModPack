let saReplaceMap = Utils.newMap();

saReplaceMap.put("slashblade:wave_edge", "slashblade_sendims:wave_edge_ammo");
saReplaceMap.put("slashblade:void_slash", "slashblade_sendims:void_slash_ammo");
saReplaceMap.put("slashblade:sakura_end", "slashblade_sendims:sakura_end_ammo");

NativeEvents.onEvent($SlashBladeRegistryEvent.Post, event => {
    // let definition = event.getSlashBladeDefinition();
    let blade = event.getBlade();
    let state = $SDUtils.getState(blade);

    let sa = String(state.getSlashArtsKey());

    if (saReplaceMap.containsKey(sa)) {
        state.setSlashArtsKey(ResourceLocation.parse(saReplaceMap.get(sa)));
        blade.getOrCreateTag().put("bladeState", state.serializeNBT());

    }

})