KeyBindEvents.modify(event => {
    let dodgeRoll = KeyBindUtil.findKeyMappingInAllKeyMapping('key.block_factorys_bosses.dodge_roll')

    if (dodgeRoll) {
        event.remove(dodgeRoll)
    }
})