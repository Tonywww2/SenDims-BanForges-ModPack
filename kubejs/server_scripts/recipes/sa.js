ServerEvents.highPriorityData(event => {
    for (let sa of Java.loadClass("mods.flammpfeil.slashblade.registry.SlashArtsRegistry").REGISTRY.get().keys) {
        event.addJson("kjs:recipes/" + sa.toString().replace(":", "/") + ".json", {
            "type": "minecraft:stonecutting",
            "count": 2,
            "ingredient": {
                type: "forge:partial_nbt",
                nbt: `{item_list:["${sa.toString()}"]}`,
                item: "slashblade:proudsoul_sphere"
            },
            "result": {
                "item": "slashblade:proudsoul_sphere",
                "count": 1,
                "nbt": `{SpecialAttackType:"${sa.toString()}"}`
            }
        })
    }
})
console.log(Item.of('slashblade:proudsoul_tiny').enchant('enderio:shimmer', 1).toJson().toString())