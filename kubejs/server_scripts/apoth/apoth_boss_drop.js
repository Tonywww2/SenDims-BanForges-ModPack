const bossDropReplace = new Map();

// TODO 神化Boss掉落
bossDropReplace.set("apotheosis:common", '3x apotheosis:common_material')
bossDropReplace.set("apotheosis:uncommon", '3x apotheosis:uncommon_material')
bossDropReplace.set("apotheosis:rare", '2x apotheosis:rare_material')
bossDropReplace.set("apotheosis:epic", '2x apotheosis:epic_material')
bossDropReplace.set("apotheosis:mythic", 'apotheosis:mythic_material')
bossDropReplace.set("apotheosis:ancient", '2x apotheosis:mythic_material')

EntityEvents.drops(event => {
    for (const i of event.getDrops()) {
        for (const rule of global.materialRemoveRule) {
            if (rule.test(i.getItem())) {
                const nbt = i.getItem().getNbt();
                let item = "minecraft:air";
                if (nbt && nbt.contains("affix_data")) {
                    const affix = nbt.getCompound("affix_data");
                    if (affix && affix.contains("rarity")) {
                        item = bossDropReplace.get(String(affix.getString("rarity")));

                    }
                }
                i.setItem(item);
                break;
            }
        }
    }
})