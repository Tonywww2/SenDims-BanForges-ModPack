global.materialReplaceRules = Utils.newMap();

// 箭矢 
global.materialReplaceRules.put('minecraft:arrow', {
    exchange: false,
    list: [
        'minecraft:spectral_arrow',
        'minecraft:tipped_arrow',
        'aether:golden_dart',
        'aether:poison_dart',
        'aether:enchanted_dart'
    ]
});

global.materialReplaceRules.put('minecraft:book', {
    exchange: false,
    list: [
        'minecraft:enchanted_book'
    ]
});

global.materialReplaceRules.put('umapyoi:speed_low_item', {
    exchange: true,
    list: [
        'umapyoi:stamina_low_item',
        'umapyoi:strength_low_item',
        'umapyoi:mentality_low_item',
        'umapyoi:wisdom_low_item'
    ]
});

global.materialReplaceRules.put('umapyoi:speed_mid_item', {
    exchange: true,
    list: [
        'umapyoi:stamina_mid_item',
        'umapyoi:strength_mid_item',
        'umapyoi:mentality_mid_item',
        'umapyoi:wisdom_mid_item',
        'umapyoi:skill_book'
    ]
});

global.materialReplaceRules.put('umapyoi:speed_high_item', {
    exchange: true,
    list: [
        'umapyoi:stamina_high_item',
        'umapyoi:strength_high_item',
        'umapyoi:mentality_high_item',
        'umapyoi:wisdom_high_item'
    ]
});

global.materialReplaceRules.put('minecraft:potato', {
    exchange: false,
    list: [
        '#c:crops'
    ]
});

global.materialReplaceRules.put('minecraft:cobblestone', {
    exchange: true,
    list: [
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

global.materialReplaceRules.put('minecraft:iron_ingot', {
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
        'confluence:brain_of_confusion',
        "botania:manasteel_ingot"
    ]
});

global.materialReplaceRules.put('minecraft:gold_ingot', {
    exchange: false,
    list: [
        'aether:golden_ring'
    ]
});

global.materialReplaceRules.put('aether:zanite_gemstone', {
    exchange: false,
    list: [
        'aether:zanite_ring'
    ]
});

global.materialReplaceRules.put('deep_aether:skyjade', {
    exchange: false,
    list: [
        'deep_aether:skyjade_ring'
    ]
});

global.materialReplaceRules.put('aether_redux:gravitite_ingot', {
    exchange: false,
    list: [
        'deep_aether:gravitite_ring'
    ]
});

global.materialReplaceRules.put('deep_aether:stratus_ingot', {
    exchange: false,
    list: [
        'deep_aether:stratus_ring'
    ]
});

global.materialReplaceRules.put('aether:ambrosium_shard', {
    exchange: false,
    list: [
        'aether_redux:enchanted_ring'
    ]
});


let removeWhitelist = new Set([
    'twilightforest:giant_sword',
    'twilightforest:giant_pickaxe',
    'aether:phoenix_gloves',
    'aether:phoenix_boots',
    'aether:phoenix_leggings',
    'aether:phoenix_chestplate',
    'aether:phoenix_helmet',
    'aether:valkyrie_hoe',
    'aether:valkyrie_boots',
    'aether:valkyrie_leggings',
    'aether:valkyrie_chestplate',
    'aether:valkyrie_helmet',
    'aether:valkyrie_gloves',
    'aether:valkyrie_lance',
    'aether:valkyrie_pickaxe',
    'aether:valkyrie_axe',
    'aether:valkyrie_shovel',
    'aether:neptune_gloves',
    'aether:neptune_boots',
    'aether:neptune_leggings',
    'aether:neptune_chestplate',
    'aether:neptune_helmet',
    'cataclysm:athame'
]);

global.materialRemoveRule = ItemFilter.and(
    ItemFilter.not(
        ItemFilter.custom(stack => {
            // print(stack)
            return removeWhitelist.has(String(stack.getId()))
        })
    ),
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

    for (const to of global.materialReplaceRules.keySet()) {
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
    global.materialReplaceRules.forEach((key, value) => {
        const id = "sdbf:" + key.split(":")[1] + "_unified";
        event.add(id, value.list);
        // console.log(id);
    })


})

ServerEvents.recipes(event => {
    global.materialReplaceRules.forEach((key, val) => {
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