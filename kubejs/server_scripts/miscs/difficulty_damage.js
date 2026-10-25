// priority: 70

let $DifficultyEventPriority = Java.loadClass('net.minecraftforge.eventbus.api.EventPriority');
let difficultyUnaffectedDamageTag = 'sdbf:difficulty_unaffected';
// Maintain difficulty damage exclusions here; these bypass only this system's multiplier.
let difficultyUnaffectedDamageTypeIds = [
    'minecraft:out_of_world',
    'minecraft:generic_kill'
];
ServerEvents.tags('damage_type', event => {
    event.add(difficultyUnaffectedDamageTag, difficultyUnaffectedDamageTypeIds);
});

let difficultyUnaffectedDamageTypes = $TagKey.create(
    $Registries.DAMAGE_TYPE,
    ResourceLocation.parse(difficultyUnaffectedDamageTag)
);

// LivingHurtEvent runs before armor and magic absorption. Rebind fallback mobs
// before other hurt handlers inspect their attributes, using the actual attacker.
NativeEvents.onEvent($DifficultyEventPriority.HIGHEST, false, $LivingHurtEvent, event => {
    if (event.getAmount() <= 0 || event.entity.isPlayer()) return;
    global.reapplyDefaultDifficultyOnPlayerHit(event.entity, event.source.getPlayer());
});

// Apply after the pack's other incoming-damage adjustments, still before armor.
// The tag exempts a damage type only from this difficulty multiplier.
NativeEvents.onEvent($DifficultyEventPriority.LOWEST, false, $LivingHurtEvent, event => {
    let player = event.entity;
    if (!player.isPlayer() || !global.isRealDifficultyPlayer(player)) return;
    if (event.getAmount() <= 0 || event.source.is(difficultyUnaffectedDamageTypes)) return;
    event.setAmount(event.getAmount() * global.getPlayerDamageTakenMultiplier(player));
});
