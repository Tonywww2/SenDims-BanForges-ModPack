// priority: 100
/**
 * 实装层
 */
EntityEvents.spawned(event => {
    /**
     * @type {Internal.LivingEntity}
     */
    let entity = event.entity;
    if (!entity || !entity.isLiving()) return;
    let name = String(entity.type.toString());

    if (entity.isPlayer()) return;
    if (entityBlackList.has(name)) return;
    if (!entity.forgePersistentData) return;
    if (entity.forgePersistentData.contains('dimension_difficulty')) return;
    entity.forgePersistentData.putBoolean('dimension_difficulty', true);

    let dim = String(event.level.dimension.toString());
    let player = entity.getLevel().getNearestPlayer(entity, 240);
    let dimStage = null;
    if (dimensionSpecialRule.has(dim) && player) {
        // Special Rule
        let dimInfo = dimensionSpecialRule.get(dim);
        if (player.stages.has(dimInfo.stageID)) {
            dimStage = dimInfo.activateDifficulty;
        } else {
            dimStage = dimInfo.normalDifficulty;
        }



    } else {
        // Normal Rule
        dimStage = dimensionStages.get(dim);
        if (!dimStage) dimStage = "0_1";

    }

    entity.forgePersistentData.putString('sbsd.diff', dimStage);
    // console.log(name)
    let mobType = mobTypes.get(name);
    if (!mobType) {
        mobType = type0;
        console.log(name + " does not have a mobtype!")
    }
    let mobValues = mobType[dimStage];
    if (!mobValues) mobValues = mobType["0_1"];
    let additionalScale = additionalStageScale[dimStage];
    if (!additionalScale) additionalScale = additionalStageScale["0_1"];

    /**
     * @type {Internal.Player}
     */
    // 
    // let diffNum = -1;

    // if (player) {
    //     player.stages.getAll().forEach(element => {
    //         if (element.startsWith(diffLevelPrefix)) {
    //             diffNum = Math.max(diffNum, parseInt(element.split('_')[2]));
    //         }
    //     })

    // }
    // if (diffNum == -1) diffNum = 1;

    // let playerCount = entity.getLevel().getNearbyPlayers(
    //     $TargetingConditions.DEFAULT,
    //     entity,
    //     AABB.ofSize(entity.position(), 64, 64, 64)
    // ).size() - 1;
    // if (playerCount < 0) playerCount = 0;

    if (entity.attributes.hasAttribute(attack)) {
        let val = mobValues[0];
        val *= 1 + (Math.random() * atkFloat);
        val *= additionalScale[0];
        val = Math.floor(val);
        entity.setAttributeBaseValue(attack, val);
        // console.log(val);
    }

    if (entity.attributes.hasAttribute(health)) {
        let val = mobValues[1];
        val *= 1 + (Math.random() * hpFloat);
        val *= additionalScale[1];
        val = Math.floor(val);
        entity.setAttributeBaseValue(health, val);
        entity.setHealth(entity.getMaxHealth());
        // console.log(val);
    }

    if (entity.attributes.hasAttribute(armor)) {
        let val = mobValues[2];
        val *= 1 + (Math.random() * armorFloat);
        val *= additionalScale[2];
        val = Math.floor(val);
        entity.setAttributeBaseValue(armor, val);
        // console.log(val);
    }

    if (entity.attributes.hasAttribute(magic_resist)) {
        let val = mobValues[3];
        val *= additionalScale[3];
        entity.setAttributeBaseValue(magic_resist, val);
        // console.log(val);
    }

    if (mobType.isBoss && entity.attributes.hasAttribute(magic_resist)) {
        let val = mobValues[3] * 0.006;
        entity.setAttributeBaseValue(frenzy_resistance, val);
    }

    // Apply difficulty system multipliers
    let diffData = getDifficultyMultipliers(entity.level.server);
    
    if (entity.attributes.hasAttribute(attack)) {
        let currentAtk = entity.attributes.getInstance(attack).getBaseValue();
        entity.setAttributeBaseValue(attack, currentAtk * diffData[2]);
    }
    
    if (entity.attributes.hasAttribute(health)) {
        let currentHp = entity.attributes.getInstance(health).getBaseValue();
        entity.setAttributeBaseValue(health, currentHp * diffData[1]);
        entity.setHealth(entity.getMaxHealth());
    }
    
    if (entity.attributes.hasAttribute(armor)) {
        let currentArmor = entity.attributes.getInstance(armor).getBaseValue();
        entity.setAttributeBaseValue(armor, currentArmor * diffData[3]);
    }

    // console.log(`[EA] Spawned ${name} in ${dim}.`)

})