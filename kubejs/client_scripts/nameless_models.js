// Select the series model at SlashBlade's actual render entry point. This also
// covers JEI stacks and old client capability snapshots of existing blades.
const $NamelessRenderEvent = Java.loadClass("mods.flammpfeil.slashblade.event.client.RenderOverrideEvent");
const $NamelessModelManager = Java.loadClass("mods.flammpfeil.slashblade.client.renderer.model.BladeModelManager");
const namelessOldRenderModel = new $ResourceLocation("last_smith:model/named/odachi/model.obj");
const namelessOldRenderTexture = "last_smith:model/named/odachi/odachi.png";
const namelessRenderModels = {};
const namelessRenderTargets = {
    blade: true, blade_damaged: true, sheath: true,
    item_blade: true, item_bladens: true, item_damaged: true
};
const namelessRenderReported = {};

for (let stage of ["faded", "lone", "thunder", "judgement", "king"]) {
    namelessRenderModels[`item.slashblade.nameless_${stage}`] = {
        model: new $ResourceLocation(`sdbf:model/nameless/nameless_${stage}.obj`),
        texture: new $ResourceLocation(`sdbf:model/nameless/nameless_${stage}.png`)
    };
}

NativeEvents.onEvent($NamelessRenderEvent, event => {
    if (!namelessRenderTargets[String(event.getTarget())]) return;

    let stack = event.getStack();
    if (stack.isEmpty()) return;
    let target = namelessRenderModels[String(stack.getDescriptionId())];
    if (!target) return;

    // Only replace the series' own resources or its original odachi resources.
    let texture = String(event.getTexture());
    if (texture !== String(target.texture) && texture !== namelessOldRenderTexture) return;
    let manager = $NamelessModelManager.getInstance();
    let model = manager.getModel(target.model);
    let key = String(target.model);
    if (model.equals(manager.defaultModel)) {
        if (!namelessRenderReported[key + ":error"]) {
            console.error(`[Nameless models] Failed to load ${key}`);
            namelessRenderReported[key + ":error"] = true;
        }
        return;
    }
    let current = event.getModel();
    if (!current.equals(model) && !current.equals(manager.defaultModel) &&
        !current.equals(manager.getModel(namelessOldRenderModel))) return;
    event.setModel(model);
    event.setTexture(target.texture);
    if (!namelessRenderReported[key]) {
        console.info(`[Nameless models] Rendering ${key} (${event.getTarget()})`);
        namelessRenderReported[key] = true;
    }
});
