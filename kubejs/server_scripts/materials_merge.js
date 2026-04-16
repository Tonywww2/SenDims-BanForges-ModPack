global.materialReplaceRules = new Map();

// 箭矢 
global.materialReplaceRules.set('minecraft:arrow', {
    exchange: false,
    list: [
        'minecraft:spectral_arrow',
        'minecraft:tipped_arrow',
        'aether:golden_dart',
        'aether:poison_dart',
        'aether:enchanted_dart'
    ]
});

global.materialReplaceRules.set('minecraft:book', {
    exchange: false,
    list: [
        'minecraft:enchanted_book'
    ]
});

global.materialReplaceRules.set('umapyoi:speed_low_item', {
    exchange: true,
    list: [
        'umapyoi:stamina_low_item',
        'umapyoi:strength_low_item',
        'umapyoi:mentality_low_item',
        'umapyoi:wisdom_low_item'
    ]
});

global.materialReplaceRules.set('umapyoi:speed_mid_item', {
    exchange: true,
    list: [
        'umapyoi:stamina_mid_item',
        'umapyoi:strength_mid_item',
        'umapyoi:mentality_mid_item',
        'umapyoi:wisdom_mid_item',
        'umapyoi:skill_book'
    ]
});

global.materialReplaceRules.set('umapyoi:speed_high_item', {
    exchange: true,
    list: [
        'umapyoi:stamina_high_item',
        'umapyoi:strength_high_item',
        'umapyoi:mentality_high_item',
        'umapyoi:wisdom_high_item'
    ]
});

global.materialReplaceRules.set('minecraft:potato', {
    exchange: false,
    list: [
        '#c:crops'
    ]
});

global.materialReplaceRules.set('minecraft:cobblestone', {
    exchange: true,
    list: [
        'minecraft:granite',
        'minecraft:diorite',
        'minecraft:andesite',
        'minecraft:cobbled_deepslate',
        'minecraft:smooth_basalt',
        'minecraft:calcite',
        'minecraft:tuff',
        'twilightforest:etched_nagastone',
        'twilightforest:cracked_etched_nagastone',
        'twilightforest:mossy_etched_nagastone',
        'twilightforest:nagastone_pillar',
        'twilightforest:cracked_nagastone_pillar',
        'twilightforest:mossy_nagastone_pillar',
        'twilightforest:nagastone_stairs_left',
        'twilightforest:cracked_nagastone_stairs_left',
        'twilightforest:mossy_nagastone_stairs_left',
        'twilightforest:nagastone_stairs_right',
        'twilightforest:cracked_nagastone_stairs_right',
        'twilightforest:mossy_nagastone_stairs_right',
        'twilightforest:nagastone_head',
        'twilightforest:nagastone'
    ]
});

global.materialReplaceRules.set('minecraft:iron_ingot', {
    exchange: false,
    list: [
        'aether:iron_ring',
        'aether:ice_ring',
        'aether:skyroot_poison_bucket',
        'ad_astra:space_helmet',
        'ad_astra:space_suit',
        'ad_astra:space_pants',
        'ad_astra:space_boots',
        'artifacts:vampiric_glove',
        'confluence:brain_of_confusion'
    ]
});

global.materialReplaceRules.set('minecraft:gold_ingot', {
    exchange: false,
    list: [
        'aether:golden_ring'
    ]
});

global.materialReplaceRules.set('aether:zanite_gemstone', {
    exchange: false,
    list: [
        'aether:zanite_ring'
    ]
});

global.materialReplaceRules.set('deep_aether:skyjade', {
    exchange: false,
    list: [
        'deep_aether:skyjade_ring'
    ]
});

global.materialReplaceRules.set('aether_redux:gravitite_ingot', {
    exchange: false,
    list: [
        'deep_aether:gravitite_ring'
    ]
});

global.materialReplaceRules.set('deep_aether:stratus_ingot', {
    exchange: false,
    list: [
        'deep_aether:stratus_ring'
    ]
});

global.materialReplaceRules.set('aether:ambrosium_shard', {
    exchange: false,
    list: [
        'aether_redux:enchanted_ring'
    ]
});

global.materialRemoveRule = ItemFilter.and(
    ItemFilter.not(ItemFilter.or(
        'twilightforest:giant_sword',
        'twilightforest:giant_pickaxe',
    )),
    ItemFilter.or(
        ItemFilter.TOOL,
        ItemFilter.ARMOR,
        ItemFilter.WEAPON,

        'minecraft:shield',
        'terra_entity:wooden_yoyo',
        'terra_entity:valor',
        'terra_entity:rally',
        'terra_entity:malaise',
        'terra_entity:hive_five',
        'terra_entity:code_1',
        'terra_entity:cascade',
        'terra_entity:artery',
        'terra_entity:amazon',
        'terra_entity:summon_netherite_sword_staff',
        'terra_entity:summon_diamond_sword_staff',
        'terra_entity:summon_golden_sword_staff',
        'terra_entity:summon_iron_sword_staff',
        'terra_entity:summon_stone_sword_staff',
        'terra_entity:summon_wooden_sword_staff',

        'terra_entity:finch_staff',
        'terra_entity:hornet_staff',
        'terra_entity:slime_staff',
        'terra_entity:snow_flinx_staff',
        'terra_entity:imp_staff',
        'terra_entity:sculk_wisp_staff',
        'terra_entity:iron_golem_staff',

        'terra_entity:swamp_whip',

        'terra_entity:slimy_saddle'
    )
);

// global.materialRemoveRule = ItemFilter.or(
//     ItemFilter.and(ItemFilter.or(ItemFilter.ENCHANTABLE, ItemFilter.DAMAGEABLE), ItemFilter.not("slashblade:slashblade"))
// );


LootJS.modifiers((event) => {
    let entityModifier = event.addLootTypeModifier(LootType.ENTITY);
    let blockModifier = event.addLootTypeModifier(LootType.BLOCK);
    let fishingModifier = event.addLootTypeModifier(LootType.FISHING);
    let chestModifier = event.addLootTypeModifier(LootType.CHEST);

    for (const to of global.materialReplaceRules.keys()) {
        global.materialReplaceRules.get(to).list.forEach(from => {
            entityModifier.replaceLoot(from, to, true);
            blockModifier.replaceLoot(from, to, true);
            fishingModifier.replaceLoot(from, to, true);
            chestModifier.replaceLoot(from, to, true);

        });
    }

    entityModifier.removeLoot(global.materialRemoveRule);
    blockModifier.removeLoot(global.materialRemoveRule);
    fishingModifier.removeLoot(global.materialRemoveRule);
    chestModifier.removeLoot(global.materialRemoveRule);

});

ServerEvents.tags("item", event => {
    global.materialReplaceRules.forEach((value, key) => {
        const id = "sdbf:" + key.split(":")[1] + "_unified";
        event.add(id, value.list);
        // console.log(id);
    })


})

ServerEvents.recipes(event => {
    global.materialReplaceRules.forEach((val, key) => {
        let keyName = key.split(":")[1] + "_to_";
        if (val.exchange) {
            val.list.forEach(element => {
                if (element.charAt(0) == "#") return;

                event.stonecutting(element, [key])
                    .id("sdbf:" + keyName + element.replace(":", "_"));

            });
        }


    })

})