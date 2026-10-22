// Magic uses its original SJAP model. The four S5 blades share Zenith geometry.
// Resource locations are allocated once; BladeModelManager owns reload-safe caching.
let $ZenithRenderEvent = Java.loadClass('mods.flammpfeil.slashblade.event.client.RenderOverrideEvent');
let $ZenithModelManager = Java.loadClass('mods.flammpfeil.slashblade.client.renderer.model.BladeModelManager');
let $ZenithResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation');
let zenithMagicVisual = {
    model: new $ZenithResourceLocation('sjap_adder:model/icf/icfex/model.obj'),
    texture: new $ZenithResourceLocation('sjap_adder:model/icf/icfex/ice.png')
};
let zenithSharedModel = new $ZenithResourceLocation('sdbf:model/zenith/zenith.obj');
// Named blade IDs and cached resources are explicit; no external branch catalog.
let zenithNames = {
    'item.sjap_adder.dragon_steel_ice': zenithMagicVisual,
    'item.slashblade_sendims.zenith_false_black_crown': {
        model: zenithSharedModel,
        texture: new $ZenithResourceLocation('sdbf:model/zenith/zenith_black_crown.png')
    },
    'item.slashblade_sendims.zenith_false_divine_might': {
        model: zenithSharedModel,
        texture: new $ZenithResourceLocation('sdbf:model/zenith/zenith_divine_might.png')
    },
    'item.slashblade_sendims.zenith_false_kingship': {
        model: zenithSharedModel,
        texture: new $ZenithResourceLocation('sdbf:model/zenith/zenith_kingship.png')
    },
    'item.slashblade_sendims.zenith_false_dark_curse': {
        model: zenithSharedModel,
        texture: new $ZenithResourceLocation('sdbf:model/zenith/zenith_dark_curse.png')
    }
};
let zenithRenderGroups = {
    blade: true, sheath: true, blade_damaged: true,
    item_blade: true, item_bladens: true, item_damaged: true
};
NativeEvents.onEvent($ZenithRenderEvent, event => {
    if (!zenithRenderGroups[String(event.getTarget())]) return;
    let stack = event.getStack();
    if (!stack || stack.isEmpty()) return;
    let visual = zenithNames[String(stack.getDescriptionId())];
    if (!visual) return;
    let manager = $ZenithModelManager.getInstance();
    let model = manager.getModel(visual.model);
    if (model.equals(manager.defaultModel)) return;
    event.setModel(model);
    event.setTexture(visual.texture);
});
