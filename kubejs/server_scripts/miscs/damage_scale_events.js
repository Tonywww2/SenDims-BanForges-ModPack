NativeEvents.onEvent($LivingHurtEvent,
    /**
     * 
     * @param {Internal.LivingHurtEvent} event 
     * @returns 
     */
    event => {
        /**
         * @type {Internal.LivingEntity}
         */
        let entity = event.entity;
        let source = event.source;
        let type = source.getType();
        let damage = event.getAmount();
        // print(damage)

        if (entity.type == "minecraft:phantom") {
            if (type == "onFire" && 
                entity.level.dimensionKey == "minecraft:overworld" &&
                entity.level.dayTime() > 0 && entity.level.dayTime() < 12000
            ) {
                entity.discard();
                return;
            }
        }

        if (entity.isPlayer()) {
        
            let actual = event.source.actual;

            if (damage <= 0 || !type) return;

            if (event.source.getPlayer() || (actual && actual.isPlayer())) {
                damage *= 0.6;
            }

            if (type == "oxygen") {
                damage += entity.getMaxHealth() * 0.2;
            }

            if (type == "freeze") {
                damage += entity.getMaxHealth() * 0.05;
            }

            if (type.includes("explosion")) {
                damage += entity.getMaxHealth() * 0.25;
            }
           
        }

        if (type == "starve") {
            damage += entity.getMaxHealth() * 0.05;
        }

        event.setAmount(damage);

        // if (entity.isPlayer()) {
        //     entity.tell(`Entity: ${entity}m Source: ${source}, Damage: ${damage}`)
        // }
        // print(event.source)

    })

