// Read-only audit against the actual Forge registries and loaded RecipeManager.
ServerEvents.loaded(event => {
    let data = global.sdbfOmniAlloy;
    if (!data) return;
    let ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation');
    let Registries = Java.loadClass('net.minecraftforge.registries.ForgeRegistries');
    let missing = [];
    let definitions = data.registrations;
    let itemIds = Object.keys(definitions.items).concat(Object.keys(definitions.blocks));
    Object.keys(definitions.fluids).forEach(id => itemIds.push(id + '_bucket'));
    itemIds.forEach(id => {
        if (!Registries.ITEMS.containsKey(new ResourceLocation(id))) missing.push('item ' + id);
    });
    Object.keys(definitions.blocks).forEach(id => {
        if (!Registries.BLOCKS.containsKey(new ResourceLocation(id))) missing.push('block ' + id);
    });
    Object.keys(definitions.fluids).forEach(id => {
        if (!Registries.FLUIDS.containsKey(new ResourceLocation(id))) missing.push('fluid ' + id);
    });
    let manager = event.server.getRecipeManager();
    data.expected_recipe_ids.forEach(id => {
        if (!manager.byKey(new ResourceLocation(id)).isPresent()) missing.push('recipe ' + id);
    });
    if (missing.length) {
        console.error('[万象合金] 加载检查失败，共缺失 ' + missing.length + ' 项：' + missing.join(', '));
    } else {
        console.info('[万象合金] 加载检查通过：' + data.expected_recipe_ids.length + ' 条配方及全部材料已注册');
    }
});
