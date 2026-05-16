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

        if (entity.isPlayer()) {
            let damage = event.getAmount();
            let source = event.source;
            let actual = event.source.actual;
            let type = source.getType();

            if (damage <= 0 || !type) return;

            if (event.source.getPlayer() || (actual && actual.isPlayer())) {
                damage *= 0.8;
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

            // entity.tell(event.source)

            event.setAmount(damage);

        }

    })

