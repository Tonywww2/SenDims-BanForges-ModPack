// priority: -10
// 深境1层：自然刷新的敌对生物有 10% 概率携带一件材料，死亡时掉落。
// 携带的物品在刷新时抽取并写入生物的持久化数据，随实体一起保存。
// 本文件优先级低于 apoth_boss_drop.js，掉落在其之后加入，不参与玩家掉落倍率。

let $DeepRealmFinalizeSpawn = Java.loadClass('net.minecraftforge.event.entity.living.MobSpawnEvent$FinalizeSpawn');
let $DeepRealmMobSpawnType = Java.loadClass('net.minecraft.world.entity.MobSpawnType');

let DEEP_REALM_CARRY = {
    dimension: 'sdbf:deep_realm_level_1',
    chance: 0.1,
    dataKey: 'sdbf_deep_realm_carried',
    // weight 为整组权重，组内物品平分；count 为掉落数量
    groups: [
        { weight: 50, count: 1, items: ['minecraft:raw_iron_block', 'minecraft:raw_copper_block', 'minecraft:raw_gold_block'] },
        { weight: 25, count: 1, items: ['minecraft:diamond', 'minecraft:emerald_block', 'minecraft:redstone_block', 'minecraft:lapis_block'] },
        { weight: 20, count: 1, items: ['thermal:raw_tin_block', 'thermal:raw_lead_block', 'thermal:raw_silver_block', 'thermal:raw_nickel_block'] },
        { weight: 5, count: 1, items: ['minecraft:ender_pearl', 'slashblade:proudsoul'] }
    ]
};

let rollDeepRealmCarried = () => {
    let total = 0;
    DEEP_REALM_CARRY.groups.forEach(group => { total += group.weight; });
    let pick = Math.random() * total;
    for (let group of DEEP_REALM_CARRY.groups) {
        pick -= group.weight;
        if (pick < 0) {
            return { item: group.items[Math.floor(Math.random() * group.items.length)], count: group.count };
        }
    }
    let last = DEEP_REALM_CARRY.groups[DEEP_REALM_CARRY.groups.length - 1];
    return { item: last.items[last.items.length - 1], count: last.count };
};

NativeEvents.onEvent($DeepRealmFinalizeSpawn, event => {
    if (event.getSpawnType() != $DeepRealmMobSpawnType.NATURAL) return;
    let entity = event.getEntity();
    if (!entity || !entity.isMonster()) return;
    if (String(entity.level.dimension) != DEEP_REALM_CARRY.dimension) return;
    if (Math.random() >= DEEP_REALM_CARRY.chance) return;
    let carried = rollDeepRealmCarried();
    let tag = new $CompoundTag();
    tag.putString('item', carried.item);
    tag.putInt('count', carried.count);
    entity.forgePersistentData.put(DEEP_REALM_CARRY.dataKey, tag);
});

EntityEvents.drops(event => {
    let entity = event.entity;
    if (entity.isPlayer()) return;
    let data = entity.forgePersistentData;
    if (!data.contains(DEEP_REALM_CARRY.dataKey)) return;
    let tag = data.getCompound(DEEP_REALM_CARRY.dataKey);
    data.remove(DEEP_REALM_CARRY.dataKey);
    let stack = Item.of(String(tag.getString('item')), Math.max(1, tag.getInt('count')));
    if (!stack.isEmpty()) event.addDrop(stack);
});
