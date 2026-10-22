// Bind the named weapon to its model at the native rendering entry point.
// BladeModelManager caches OBJ data and invalidates it on resource reload.
let $DamnationRenderEvent = Java.loadClass("mods.flammpfeil.slashblade.event.client.RenderOverrideEvent");
let $DamnationModelManager = Java.loadClass("mods.flammpfeil.slashblade.client.renderer.model.BladeModelManager");
let $DamnationResourceLocation = Java.loadClass("net.minecraft.resources.ResourceLocation");
let damnationGoldTexture = new $DamnationResourceLocation("sdbf:model/damnation/damnation_gold.png");
let damnationGreatswordModel = new $DamnationResourceLocation("sdbf:model/damnation/greatsword.obj");
let damnationFinalModel = new $DamnationResourceLocation("sdbf:model/damnation/damnation.obj");
let damnationOriginalModel = new $DamnationResourceLocation("slashblade:model/named/dios/dios.obj");
let damnationVisualByName = {
    "item.slashblade.greatsword_of_damnation": {
        model: damnationOriginalModel,
        texture: new $DamnationResourceLocation("slashblade:model/greatsword_of_damnation/greatsword_of_damnation.png")
    },
    "item.slashblade.greatsword_of_damnation_plus": {
        model: damnationOriginalModel,
        texture: new $DamnationResourceLocation("slashblade:model/greatsword_of_damnation/greatsword_of_damnation_plus.png")
    },
    "item.slashblade.greatsword_of_damnation_full": {
        model: damnationGreatswordModel, texture: damnationGoldTexture
    },
    "item.slashblade_sendims.greatsword_of_damnation_final": {
        model: damnationFinalModel, texture: damnationGoldTexture
    }
};
let damnationRenderGroups = {
    blade: true, sheath: true, blade_damaged: true,
    item_blade: true, item_bladens: true, item_damaged: true
};
let damnationOwnTextures = {
    "sdbf:model/damnation/damnation_gold.png": true,
    "slashblade:model/greatsword_of_damnation/greatsword_of_damnation.png": true,
    "slashblade:model/greatsword_of_damnation/greatsword_of_damnation_plus.png": true,
    "slashblade:model/greatsword_of_damnation/greatsword_of_damnation_full.png": true
};

NativeEvents.onEvent($DamnationRenderEvent, event => {
    if (!damnationRenderGroups[String(event.getTarget())]) return;
    let stack = event.getStack();
    if (stack.isEmpty()) return;
    let visual = damnationVisualByName[String(stack.getDescriptionId())];
    if (!visual || !damnationOwnTextures[String(event.getTexture())]) return;
    let manager = $DamnationModelManager.getInstance();
    let model = manager.getModel(visual.model);
    if (model.equals(manager.defaultModel)) return;
    event.setModel(model);
    event.setTexture(visual.texture);
});
