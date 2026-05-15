NativeEvents.onEvent($LivingHurtEvent, event => {
    /**
     * @type {Internal.LivingEntity}
     */
    let entity = event.entity;

    if (entity.isPlayer()) {
        let damage = event.getAmount();
        if (damage <= 0) return;

        if (event.source.player) {
            damage *= 0.8;
        }

        if (event.source.getType() == "oxygen") {
            damage += entity.getMaxHealth() * 0.2;
        }

        if (event.source.getType() == "freeze") {
            damage += entity.getMaxHealth() * 0.05;

        }
        
        event.setAmount(damage);

    }

})

