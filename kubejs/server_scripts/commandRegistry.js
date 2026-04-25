let $ItemSlashBlade = Java.loadClass("mods.flammpfeil.slashblade.item.ItemSlashBlade")
ServerEvents.commandRegistry(event => {
    event.dispatcher.register(
        event.commands.literal("debugTool")
            .then(
                event.commands.literal("genSlashbladeFilter")
                    .executes(/**@param {$CommandContext<$CommandSourceStack>} ctx */ctx => {
                        let item = ctx.source.player.mainHandItem
                        if (item.item instanceof $ItemSlashBlade) {
                            let lang = item.nbt.getCompound("bladeState").getString("translationKey")
                            if (lang.isEmpty()) {
                                ctx.source.sendFailure(Text.of("拔刀不存在翻译键"))
                            } else {
                                let filter = Item.of('ftbfiltersystem:smart_filter', `{"ftbfiltersystem:filter":'nbt(fuzzy:{bladeState:{translationKey:"${lang}"}})'}`)
                                filter.setHoverName(Text.translate(lang))
                                ctx.source.player.addItem(filter)
                                ctx.source.sendSuccess(Text.of("已生成过滤"), false)
                            }
                        } else {
                            ctx.source.sendFailure(Text.of("主手不为拔刀"))
                        }
                        return 1;
                    })
            )
            .executes(/**@param {$CommandContext<$CommandSourceStack>} ctx */ctx => {
                ctx.source.sendSuccess(Text.of("咕咕嘎嘎"), false)
                return 1;
            })
    )
})
