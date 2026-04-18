
ItemEvents.tooltip(event => {

    event.add('minecraft:arrow', Text.translatable('info.kubejs.material.arrow.1').color(Color.LIME_DYE));
    event.add('minecraft:book', Text.translatable('info.kubejs.material.book.1').color(Color.LIME_DYE));
    event.add('umapyoi:speed_low_item', Text.translatable('info.kubejs.material.lowbook').color(Color.LIME_DYE));
    event.add('umapyoi:speed_mid_item', Text.translatable('info.kubejs.material.midbook').color(Color.LIME_DYE));
    event.add('umapyoi:speed_high_item', Text.translatable('info.kubejs.material.highbook').color(Color.LIME_DYE));

    event.add('#slashblade:can_copy_sa', Text.translatable('info.kubejs.slashblade.can_copy_sa').color(Color.AQUA));
    event.add('#slashblade:can_copy_se', Text.translatable('info.kubejs.slashblade.can_copy_se').color(Color.AQUA));

    event.addAdvanced([
        'slashblade:slashblade',
        'energyblade:forge_energy_blade',
        'slashbladetetra:slashblade',
        'slashbladetetra:hf'
    ], (item, advanced, text) => {
        if (item.nbt && item.nbt.bladeState && item.nbt.bladeState.translationKey) {
            text.add(Text.of(String(item.nbt.bladeState.translationKey).substring(5).replace(".", ":")).color(Color.LIME_DYE));
        }
    })

    event.addAdvanced(Ingredient.all, (item, advanced, text) => {
        if (event.alt && item.nbt) {
            text.add(Text.of('NBT: ').append(Text.prettyPrintNbt(item.nbt)));
        }
    })

})