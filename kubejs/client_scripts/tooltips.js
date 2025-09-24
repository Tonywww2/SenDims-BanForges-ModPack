
global.materialArrow1 = 'minecraft:arrow'
global.materialBook1 = 'minecraft:book'
global.materialLowBook = 'umapyoi:speed_low_item'
global.materialMidBook = 'umapyoi:speed_mid_item'
global.materialHighBook = 'umapyoi:speed_high_item'

ItemEvents.tooltip(event => {

    event.add(global.materialArrow1, Text.translatable('info.kubejs.material.arrow.1').color(Color.LIME_DYE))
    event.add(global.materialBook1, Text.translatable('info.kubejs.material.book.1').color(Color.LIME_DYE))
    event.add(global.materialLowBook, Text.translatable('info.kubejs.material.lowbook').color(Color.LIME_DYE))
    event.add(global.materialMidBook, Text.translatable('info.kubejs.material.midbook').color(Color.LIME_DYE))
    event.add(global.materialHighBook, Text.translatable('info.kubejs.material.highbook').color(Color.LIME_DYE))

    event.addAdvanced(Ingredient.all, (item, advanced, text) => {
        if (event.alt && item.nbt) {
            text.add(Text.of('NBT: ').append(Text.prettyPrintNbt(item.nbt)))
        }
    })

})