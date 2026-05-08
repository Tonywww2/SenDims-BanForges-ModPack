let shieldingItems = new Set([
    'nuclearcraft:light',
    'nuclearcraft:medium',
    'nuclearcraft:heavy',
    'nuclearcraft:dps'
]);

let armorItems = new Set([
    'geotetraarmor:head',
    'geotetraarmor:chest',
    'geotetraarmor:legs',
    'geotetraarmor:feet'
]);

ItemEvents.rightClicked(event => {
    let player = event.player;
    if (!player) return;

    let mainHand = player.mainHandItem;
    let offHand = player.offHandItem;

    if (shieldingItems.has(String(mainHand.id)) && armorItems.has(String(offHand.id))) {
        let shieldingLevel = mainHand.getItem().getRadiationShieldingLevel();
        offHand.getOrCreateTag().putInt("rad_shielding", shieldingLevel);

        player.addItemCooldown(mainHand.item, 10);
        player.addItemCooldown(offHand.item, 10);

        mainHand.shrink(1);

        player.swing();
        event.cancel();
    }
})