KeyBindEvents.modify(event => {
    const dodgeRoll = KeyBindUtil.findKeyMappingInAllKeyMapping('key.block_factorys_bosses.dodge_roll')

    if (dodgeRoll) {
        event.remove(dodgeRoll)
    }
})