// priority: -10
// 深境1层：自然刷新的敌对生物有 10% 概率携带一件材料，死亡时掉落。
// 携带的物品在生物加入世界时抽取并写入生物的持久化数据，随实体一起保存。
// 本文件优先级低于 apoth_boss_drop.js，掉落在其之后加入，不参与玩家掉落倍率。

let $DeepRealmMob = Java.loadClass('net.minecraft.world.entity.Mob');
let $DeepRealmMobSpawnType = Java.loadClass('net.minecraft.world.entity.MobSpawnType');

let DEEP_REALM_CARRY = {
    dimension: 'sdbf:deep_realm_level_1',
    chance: 0.1,
    dataKey: 'sdbf_deep_realm_carried',
    rolledKey: 'sdbf_deep_realm_carry_rolled',
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

// 在生物加入世界时（服务端主线程）判定，只处理自然刷新：Forge 在 finalizeSpawn 时记下刷新方式（getSpawnType），并随实体保存。
// 不要改回监听 FinalizeSpawn：区块生成时刷出的生物也会触发它，而且在区块生成线程上执行。脚本回调要拿 KubeJS 的全局锁，
// 主线程上的脚本（例如传送仪式在目的地搭平台）正等这块区块生成时，两边互相等待，游戏卡死（2026-11-14 单人存档）。
// 重新加载区块时生物会再次加入世界，所以每只生物只判定一次，判定过的打上标记。
EntityEvents.spawned(event => {
    let entity = event.entity;
    if (String(entity.level.dimension) != DEEP_REALM_CARRY.dimension) return;
    if (!(entity instanceof $DeepRealmMob) || !entity.isMonster()) return;
    if (entity.getSpawnType() != $DeepRealmMobSpawnType.NATURAL) return;
    let data = entity.forgePersistentData;
    if (data.contains(DEEP_REALM_CARRY.rolledKey) || data.contains(DEEP_REALM_CARRY.dataKey)) return;
    data.putBoolean(DEEP_REALM_CARRY.rolledKey, true);
    if (Math.random() >= DEEP_REALM_CARRY.chance) return;
    let carried = rollDeepRealmCarried();
    let tag = new $CompoundTag();
    tag.putString('item', carried.item);
    tag.putInt('count', carried.count);
    data.put(DEEP_REALM_CARRY.dataKey, tag);
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
