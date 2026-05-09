NativeEvents.onEvent($LivingTickEvent, event => {
    let entity = event.entity;

    if (entity.age % 20 === 0) {
        if (entity.type == 'powerful_dummy:test_dummy') {
            let isOverworld = entity.level.dimension == 'minecraft:overworld';
            let isAbove290 = entity.y > 290;

            if (!isOverworld || !isAbove290) {
                entity.discard(); 
            }
        }
    }

});