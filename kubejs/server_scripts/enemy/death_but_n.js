let PLAYR_DEATH_COUNT_PATH = "pl_death_ct";

let defaultMaxDeath = 1;


// 定义重写规则列表（黑名单/覆写列表），不在列表中的实体默认 1 次击杀回满血
let OVERRIDE_LIMITS = Utils.newMap();

OVERRIDE_LIMITS.put('block_factorys_bosses:infernal_dragon', 2);
// OVERRIDE_LIMITS.put('minecraft:ender_dragon', 3);


// 监听玩家死亡事件
EntityEvents.death('minecraft:player', event => {
    let damageSource = event.source;
    // 获取造成致命伤害的实际实体
    let killer = damageSource.actual;

    // 如果击杀者不存在、或者不是生物实体，则跳过
    if (!killer || !killer.isLiving()) return;

    // 获取击杀者的实体类型 ID（例如 'cataclysm:ignis'）
    let entityType = String(killer.type);

    // 默认只需死亡1次，如果在列表中则取重写的值
    let maxKills = OVERRIDE_LIMITS.containsKey(entityType) ?
        OVERRIDE_LIMITS.get(entityType) :
        defaultMaxDeath;

    // 如果次数配置为0或以下，则相当于将其拉黑/禁用机制
    if (maxKills <= 0) return;

    // 从该实体独有的持久化数据中读取当前击杀玩家的次数（默认为 0）
    let currentKills = killer.persistentData.getInt(PLAYR_DEATH_COUNT_PATH);
    currentKills += 1;

    if (currentKills >= maxKills) {
        // 达到设定的击杀次数上限，将击杀者血量回满
        killer.heal(killer.maxHealth);

        // 重置该实体的击杀计数器
        killer.persistentData.putInt(PLAYR_DEATH_COUNT_PATH, 0);

        // 【可选功能】可以全服播报 Boss 被养得回满了血
        // event.server.tell(Text.yellow(`[警告] ${killer.name.string} 击杀玩家达到 ${maxKills} 次，已恢复全部生命值！`));
    } else {
        // 未达到上限，更新该实体的击杀计数器
        killer.persistentData.putInt(PLAYR_DEATH_COUNT_PATH, currentKills);
    }

});