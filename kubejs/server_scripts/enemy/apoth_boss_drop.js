const $BloodJade = Java.loadClass("com.tonywww.slashblade_sendims.items.BloodJade");

let bossDropReplace = Utils.newMap();

bossDropReplace.put("apotheosis:common", '2x apotheosis:common_material');
bossDropReplace.put("apotheosis:uncommon", '2x apotheosis:uncommon_material');
bossDropReplace.put("apotheosis:rare", 'apotheosis:rare_material');
bossDropReplace.put("apotheosis:epic", 'apotheosis:epic_material');
bossDropReplace.put("apotheosis:mythic", 'apotheosis:mythic_material');
bossDropReplace.put("apotheosis:ancient", '2x apotheosis:mythic_material');

let jadeMap = {
    "apotheosis:common": 20,
    "apotheosis:uncommon": 20,
    "apotheosis:rare": 50,
    "apotheosis:epic": 100,
    "apotheosis:mythic": 500,
    "apotheosis:ancient": 1000,
};

let specialMap = {
    "apotheosis:epic": [
        { item: 'kubejs:chaotic_truth', chance: 0.7, minCount: 1, maxCount: 1, dimension: 'sdbf:inside_the_end' }
    ],
    "apotheosis:mythic": [
        { item: 'kubejs:chaotic_truth', chance: 1.0, minCount: 1, maxCount: 1, dimension: 'sdbf:inside_the_end' }
    ],
    "apotheosis:ancient": [
        { item: 'kubejs:chaotic_truth', chance: 1.0, minCount: 1, maxCount: 1, dimension: 'sdbf:inside_the_end' }
    ]
};

let applyDrops = (event, extraDrops, configs) => {
    if (!configs) return;
    configs.forEach(conf => {
        if (conf.dimension && String(event.level.dimension) != conf.dimension) return;
        if (Math.random() < conf.chance) {
            let count = conf.minCount ? conf.minCount : 1;
            let max = conf.maxCount ? conf.maxCount : count;
            if (max > count) count += Math.floor(Math.random() * (max - count + 1));
            extraDrops.push(Item.of(conf.item, count));
        }
    });
};

EntityEvents.drops(event => {
    let entity = event.entity;
    if (entity.isPlayer()) return;
    // console.log(event.entity)
    // console.log(event.getDrops())
    let extraDrops = [];
    let hasProcessedSpecialDrops = false;
    let shouldDropGem = false;

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

                    let killCount = jadeMap[rarity];

                    extraDrops.push($BloodJade.withKillCount(killCount));

                    if (killCount >= 100) {
                        shouldDropGem = true;
                    }

                    if (!hasProcessedSpecialDrops) {
                        hasProcessedSpecialDrops = true;

                        // 统一处理 specialMap 的自定义掉落配置
                        applyDrops(event, extraDrops, specialMap[rarity]);
                    }
                }
            }
            i.setItem(item);
        }
    }

    if (shouldDropGem) {
        let nbt = {};
        nbt[GEM_TICKET_DIM_PATH] = event.level.dimension.toString();
        print(nbt)
        extraDrops.push(Item.of("kubejs:gem_ticket", 1, nbt))
    }

    extraDrops.forEach(ele => {
        event.addDrop(ele);
    })

})