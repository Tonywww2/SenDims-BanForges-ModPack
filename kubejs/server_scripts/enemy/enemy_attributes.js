// priority: 100

let MOB_DIFFICULTY_VERSION = 3;
let MOB_DIFFICULTY_VERSION_KEY = 'sdbf_difficulty_attributes_version';
let MOB_DIFFICULTY_FALLBACK_KEY = 'sdbf_difficulty_used_fallback';
let MOB_DIFFICULTY_REBOUND_KEY = 'sdbf_difficulty_player_reapplied';

EntityEvents.spawned('minecraft:ender_dragon', event => {
    event.entity.setAttributeBaseValue('minecraft:generic.knockback_resistance', 1.0);
});

// 终焉城堡（暮色第一段）里不出现分区表里的怪（段 2～10）。城堡结构自己的刷怪只有城堡怪；
// 这里拦的是由城堡里的自然刷怪触发、却可能选中雪怪等其他怪的神化首领（Apotheosis 的 apoth.boss 标记）。
// 只拦新生成的，已存档的怪和指令、刷怪蛋召唤的不受影响。
let $EnemyAttrRegistries = Java.loadClass('net.minecraft.core.registries.Registries');
let $EnemyAttrResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation');
let FINAL_CASTLE_STRUCTURE_ID = new $EnemyAttrResourceLocation('twilightforest', 'final_castle');
let TWILIGHT_DIMENSION_ID = 'twilightforest:twilight_forest';

let isInFinalCastle = entity => {
    let level = entity.level;
    let structure = level.registryAccess().registryOrThrow($EnemyAttrRegistries.STRUCTURE).get(FINAL_CASTLE_STRUCTURE_ID);
    if (!structure) return false;
    return level.structureManager().getStructureAt(entity.blockPosition(), structure).isValid();
};

let isBlockedFinalCastleBoss = entity => {
    if (String(entity.level.dimension) !== TWILIGHT_DIMENSION_ID) return false;
    if (!entity.forgePersistentData.getBoolean('apoth.boss')) return false;
    if (!twilightRegionTypes.has(String(entity.type))) return false;
    return isInFinalCastle(entity);
};

let canApplyMobDifficulty = entity => {
    return entity && entity.isLiving() && !entity.isPlayer() && entity.forgePersistentData
        && !entityBlackList.has(String(entity.type));
};

// Keep each mob's random rolls stable when a fallback is replaced or it is loaded again.
let getMobDifficultyRoll = (data, name, amount) => {
    let key = 'sdbf_difficulty_roll_' + name;
    if (!data.contains(key)) data.putDouble(key, Math.random());
    return 1 + data.getDouble(key) * amount;
};

let applyMobDifficulty = (entity, forcedPlayer, preserveHealth) => {
    if (!canApplyMobDifficulty(entity)) return false;
    let data = entity.forgePersistentData;
    let name = String(entity.type);
    let dim = String(entity.level.dimension);
    let context = forcedPlayer ? {
        difficulty: global.getPlayerDifficulty(forcedPlayer),
        bonuses: global.getPlayerEnemyBonuses(forcedPlayer),
        foundPlayer: true
    } : global.getNearbyDifficultyContext(entity);
    let usedFallback = !context.foundPlayer;
    let dimensionPlayer = forcedPlayer || global.getNearestDifficultyPlayer(entity, 240);
    let dimStage = dimensionStages.get(dim);
    if (dimensionSpecialRule.has(dim)) {
        if (dimensionPlayer) {
            let rule = dimensionSpecialRule.get(dim);
            dimStage = dimensionPlayer.stages.has(rule.stageID) ? rule.activateDifficulty : rule.normalDifficulty;
        } else {
            usedFallback = true;
        }
    }
    if (!dimStage) {
        dimStage = '0_1';
        usedFallback = true;
    }

    let mobType = mobTypes.get(name);
    // 暮色森林分区表里的怪：在所有维度都换成表里的模板，并在当地维度档上再偏移若干档
    let stageOffset = 0;
    let regionType = twilightRegionTypes.get(name);
    if (regionType) {
        mobType = regionType[0];
        stageOffset = regionType[1];
    }
    if (!mobType) {
        mobType = type0;
        usedFallback = true;
    }
    let mobValues = templateValuesAt(mobType, dimStage, stageOffset);
    if (!mobValues) {
        mobValues = mobType['0_1'];
        usedFallback = true;
    }
    let additionalScale = additionalStageScale[dimStage];
    if (!additionalScale) {
        additionalScale = additionalStageScale['0_1'];
        usedFallback = true;
    }

    let healthRatio = preserveHealth && entity.getMaxHealth() > 0
        ? Math.max(0, Math.min(1, entity.getHealth() / entity.getMaxHealth())) : 1;
    let healthMultiplier = context.difficulty.multipliers.health + context.bonuses.health;
    let armorMultiplier = context.difficulty.multipliers.armor + context.bonuses.armor;

    // Always rebuild from the template, never from an already-scaled base value.
    // Personal difficulty no longer changes the mob's attack attribute.
    if (entity.attributes.hasAttribute(attack)) {
        let value = Math.floor(mobValues[0] * getMobDifficultyRoll(data, 'attack', atkFloat) * additionalScale[0]);
        entity.setAttributeBaseValue(attack, value);
    }
    if (entity.attributes.hasAttribute(health)) {
        let value = Math.floor(mobValues[1] * getMobDifficultyRoll(data, 'health', hpFloat) * additionalScale[1]);
        entity.setAttributeBaseValue(health, value * healthMultiplier);
        entity.setHealth(entity.getMaxHealth() * healthRatio);
    }
    if (entity.attributes.hasAttribute(armor)) {
        let value = Math.floor(mobValues[2] * getMobDifficultyRoll(data, 'armor', armorFloat) * additionalScale[2]);
        entity.setAttributeBaseValue(armor, value * armorMultiplier);
    }
    if (entity.attributes.hasAttribute(magic_resist)) {
        entity.setAttributeBaseValue(magic_resist, mobValues[3] * additionalScale[3]);
    }
    if (mobType.isBoss && entity.attributes.hasAttribute(frenzy_resistance)) {
        entity.setAttributeBaseValue(frenzy_resistance, mobValues[3] * 0.006);
    }

    // Mark success last: an interrupted application must remain eligible for retry.
    data.putString('sbsd.diff', dimStage);
    data.putString('sdbf_difficulty_id', context.difficulty.id);
    data.putBoolean(MOB_DIFFICULTY_FALLBACK_KEY, usedFallback);
    data.putBoolean(MOB_DIFFICULTY_REBOUND_KEY, !!forcedPlayer);
    if (forcedPlayer) data.putString('sdbf_difficulty_player', String(forcedPlayer.uuid));
    data.putInt(MOB_DIFFICULTY_VERSION_KEY, MOB_DIFFICULTY_VERSION);
    data.putBoolean('dimension_difficulty', true);
    return true;
};

global.reapplyDefaultDifficultyOnPlayerHit = (entity, player) => {
    if (!canApplyMobDifficulty(entity) || !player || !global.isRealDifficultyPlayer(player)) return;
    let data = entity.forgePersistentData;
    let needsMigration = data.getInt(MOB_DIFFICULTY_VERSION_KEY) != MOB_DIFFICULTY_VERSION;
    if (!needsMigration && (!data.getBoolean(MOB_DIFFICULTY_FALLBACK_KEY)
        || data.getBoolean(MOB_DIFFICULTY_REBOUND_KEY))) return;
    applyMobDifficulty(entity, player, true);
};

EntityEvents.spawned(event => {
    let entity = event.entity;
    if (!canApplyMobDifficulty(entity)) return;
    let data = entity.forgePersistentData;
    if (data.getInt(MOB_DIFFICULTY_VERSION_KEY) == MOB_DIFFICULTY_VERSION) return;
    if (!data.contains('dimension_difficulty') && isBlockedFinalCastleBoss(entity)) {
        event.cancel();
        return;
    }
    // One-time migration also removes the old attack multiplier from saved mobs.
    applyMobDifficulty(entity, null, data.contains('dimension_difficulty'));
});
