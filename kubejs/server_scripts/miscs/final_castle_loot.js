// 终焉城堡里的怪被玩家击杀时追加掉落（docs/development/终焉城堡内容设计-2026-11-18.md 第 4 节）。
// 只在终焉城堡结构内生效；同种怪在城堡外不掉这些。
// 按死亡掉落表匹配，不按实体匹配：死灵书每次受伤都会抽一次 twilightforest:entities/death_tome_hurt（原版掉纸），
// 按实体匹配时那张表也会带上残响和碎片，每挨一下就掉一次（2026-11-18 修复）。
let $FinalCastleLeaderApi = Java.loadClass('com.tonywww.slashblade_sendims.api.leader.LeaderApi');

let FINAL_CASTLE_MOBS = [
    'twilightforest:death_tome',
    'twilightforest:wraith',
    'twilightforest:kobold',
    'twilightforest:adherent',
    'twilightforest:redcap',
    'twilightforest:skeleton_druid',
    'twilightforest:redcap_sapper',
    'twilightforest:fire_beetle'
];
let FINAL_CASTLE_DEATH_TABLES = FINAL_CASTLE_MOBS.map(id => id.replace('twilightforest:', 'twilightforest:entities/'));
let FINAL_CASTLE_GUARD_TAG = 'sdbf_castle_guard';
let FINAL_CASTLE_SHARDS = [
    'kubejs:castle_rune_shard_yellow',
    'kubejs:castle_rune_shard_blue',
    'kubejs:castle_rune_shard_pink',
    'kubejs:castle_rune_shard_violet'
];

let finalCastleIsLeader = entity => entity.isLiving() && $FinalCastleLeaderApi.isLeader(entity);
let finalCastleIsGuard = entity => entity.getTags().contains(FINAL_CASTLE_GUARD_TAG);

LootJS.modifiers(event => {
    event.addLootTableModifier(FINAL_CASTLE_DEATH_TABLES)
        .anyStructure(['twilightforest:final_castle'], false)
        .killedByPlayer()
        // 普通城堡怪：城堡残响 35%（抢夺每级 +5%），随机颜色碎片 5%
        .pool(p => {
            p.entityPredicate(entity => !finalCastleIsLeader(entity));
            p.randomChanceWithLooting(0.35, 0.05);
            p.addLoot('kubejs:castle_echo');
        })
        .pool(p => {
            p.entityPredicate(entity => !finalCastleIsLeader(entity));
            p.randomChance(0.05);
            p.addWeightedLoot(FINAL_CASTLE_SHARDS);
        })
        // Leader（神化首领、钥匙守卫）：城堡残响 3～5
        .pool(p => {
            p.entityPredicate(entity => finalCastleIsLeader(entity));
            p.addLoot(LootEntry.of('kubejs:castle_echo').limitCount([3, 5]));
        })
        // 神化首领 50% 掉随机颜色碎片；钥匙守卫不掉碎片（钥匙箱已给），改给 1 个耀魂
        .pool(p => {
            p.entityPredicate(entity => finalCastleIsLeader(entity) && !finalCastleIsGuard(entity));
            p.randomChance(0.5);
            p.addWeightedLoot(FINAL_CASTLE_SHARDS);
        })
        .pool(p => {
            p.entityPredicate(entity => finalCastleIsGuard(entity));
            p.addLoot('slashblade:proudsoul');
        });
});
