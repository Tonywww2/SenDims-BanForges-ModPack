// priority: -50
// Original-carrier operations retain native item classes and their real state.
// Ordinary machine recipes are in kubejs/data/sdbf/recipes/omni_alloy.
let omniValidCarrier = (stack, check) => {
    if (!stack || stack.isEmpty()) return false;
    let tag = stack.nbt;
    switch (check) {
        case 'none': return true;
        case 'uv_full': {
            let UV = Java.loadClass('me.desht.pneumaticcraft.common.block.entity.UVLightBoxBlockEntity');
            return UV.getExposureProgress(stack) >= 100;
        }
        case 'brew_absorption':
            return !!tag && String(tag.getString('brewKey')) === 'botania:absorption' && stack.getItem().getSwigsLeft(stack) >= 4;
        case 'strong_swiftness':
            return !!tag && String(tag.getString('Potion')) === 'minecraft:strong_swiftness';
        case 'developed_film': {
            let frames = stack.getItem().getStoredFrames(stack);
            if (frames.isEmpty()) return false;
            for (let i = 0; i < frames.size(); i++) {
                let identifier = frames.get(i).identifier();
                if (identifier.isEmpty() || !identifier.isId()) return false;
            }
            return true;
        }
        case 'photograph': {
            let identifier = stack.getItem().getIdentifier(stack);
            return !identifier.isEmpty() && identifier.isId();
        }
        case 'photo_stack': {
            let photos = stack.getItem().getPhotographs(stack);
            if (photos.size() < 2) return false;
            for (let i = 0; i < photos.size(); i++) {
                let pair = photos.get(i);
                let identifier = pair.getItem().getIdentifier(pair.getItemStack());
                if (identifier.isEmpty() || !identifier.isId()) return false;
            }
            return true;
        }
        default: throw new Error('Unknown omni carrier check: ' + check);
    }
};

ServerEvents.recipes(event => {
    let data = global.sdbfOmniAlloy;
    if (!data) throw new Error('Omni alloy registrations need a full game restart');
    data.packaging.forEach(entry => {
        if (Item.of(entry.carrier).isEmpty() || Item.of(entry.output).isEmpty()) {
            throw new Error('Missing omni carrier or output: ' + entry.step);
        }
        event.shapeless(entry.output, [entry.carrier, 'kubejs:omni_process_liner'])
            .modifyResult((grid, result) => {
                let carrier = grid.find(entry.carrier);
                return omniValidCarrier(carrier, entry.check) ? result : Item.of('minecraft:air');
            })
            .id(entry.recipe);
    });
});
