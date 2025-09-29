const bossDropReplace = new Map();

// TODO 神化Boss掉落
bossDropReplace.set("apotheosis:common", 'slashblade:proudsoul_ingot')
bossDropReplace.set("apotheosis:uncommon", 'slashblade:proudsoul_trapezohedron')
bossDropReplace.set("apotheosis:rare", 'kubejs:beta_dust')
bossDropReplace.set("apotheosis:epic", 'kubejs:gamma_dust')
bossDropReplace.set("apotheosis:mythic", 'kubejs:delta_dust')
bossDropReplace.set("apotheosis:ancient", 'kubejs:epsilon_dust')

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