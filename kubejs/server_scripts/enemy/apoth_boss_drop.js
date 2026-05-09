const $BloodJade = Java.loadClass("com.tonywww.slashblade_sendims.items.BloodJade");

const bossDropReplace = Utils.newMap();

bossDropReplace.put("apotheosis:common", '2x apotheosis:common_material');
bossDropReplace.put("apotheosis:uncommon", '2x apotheosis:uncommon_material');
bossDropReplace.put("apotheosis:rare", 'apotheosis:rare_material');
bossDropReplace.put("apotheosis:epic", 'apotheosis:epic_material');
bossDropReplace.put("apotheosis:mythic", 'apotheosis:mythic_material');
bossDropReplace.put("apotheosis:ancient", '2x apotheosis:mythic_material');

const jadeMap = {
    "apotheosis:common": 20,
    "apotheosis:uncommon": 20,
    "apotheosis:rare": 50,
    "apotheosis:epic": 100,
    "apotheosis:mythic": 500,
    "apotheosis:ancient": 1000,
};

EntityEvents.drops(event => {
    if (event.entity.isPlayer()) return;
    // console.log(event.entity)
    // console.log(event.getDrops())
    let extraDrops = [];
    for (const i of event.getDrops()) {
        // console.log(i);
        if (global.materialRemoveRule.test(i.getItem())) {
            // console.log(global.materialRemoveRule.test(i.getItem()))
            let nbt = i.getItem().getNbt();
            let item = "minecraft:air";
            if (nbt && nbt.contains("affix_data")) {
                let affix = nbt.getCompound("affix_data");
                if (affix && affix.contains("rarity")) {
                    let rarity = String(affix.getString("rarity"));
                    item = bossDropReplace.get(rarity);

                    extraDrops.push($BloodJade.withKillCount(jadeMap[rarity]));

                }
            }
            i.setItem(item);
        }

    }

    extraDrops.forEach(ele => {
        event.addDrop(ele);
    })

})