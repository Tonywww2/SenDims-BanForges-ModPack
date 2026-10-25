// Run from the pack root: node docs/tools/test_difficulty.cjs
let fs = require('fs');
let vm = require('vm');
let assert = require('assert/strict');
let checks = 0;
let check = (value, message) => { checks++; assert.ok(value, message); };
let near = (actual, expected, message) => check(Math.abs(actual - expected) < 1e-8, `${message}: ${actual} != ${expected}`);
let native = [];
let spawned = [];
let tagEvents = [];
let globals = {};
let read = file => fs.readFileSync(file, 'utf8');
let math = Object.create(Math);
math.random = () => 0;
let noEvents = new Proxy({}, { get: () => () => {} });
let context = vm.createContext({
    global: globals, console, Math: math,
    Item: { of: () => ({ copy: () => ({}) }) },
    ResourceLocation: { parse: value => value },
    $UUID: { fromString: value => value },
    $AttributeModifierOperation: { valueOf: value => value },
    $ForgeRegistries: { ATTRIBUTES: { getValue: value => value } },
    $AttributeModifier: class {},
    $LivingHurtEvent: 'hurt', $PlayerNameFormatEvent: 'name',
    $TagKey: { create: (registry, key) => key }, $Registries: { DAMAGE_TYPE: 'damage_type' },
    Java: { loadClass: () => ({ HIGHEST: 'HIGHEST', LOWEST: 'LOWEST' }) },
    ServerEvents: new Proxy({ tags: (...args) => tagEvents.push(args) }, { get: (target, key) => target[key] || (() => {}) }),
    PlayerEvents: noEvents, ItemEvents: noEvents,
    NativeEvents: { onEvent: (...args) => native.push(args) },
    EntityEvents: { spawned: (...args) => spawned.push(args) },
    OVERWORLD_STAGE: 'sdbf.world_lock'
});
let files = [
    'kubejs/server_scripts/enemy/enemy_attributes_patterns.js',
    'kubejs/server_scripts/enemy/enemy_attributes_mobs.js',
    'kubejs/server_scripts/miscs/difficulty_data.js',
    'kubejs/server_scripts/miscs/difficulty_config.js',
    'kubejs/server_scripts/miscs/difficulty.js',
    'kubejs/server_scripts/enemy/enemy_attributes.js',
    'kubejs/server_scripts/miscs/difficulty_damage.js'
];
for (let file of files) vm.runInContext(read(file), context, { filename: file });
let players = [];
let level = { dimension: 'minecraft:overworld', server: { players } };
let player = (axis, selected = [], flags = {}) => {
    let values = new Set(['sdbf_difficulty_schema_v5', `sdbf_difficulty_axis_n_${axis}`,
        ...selected.map(id => `sdbf_difficulty_sub_${id}`)]);
    return { level, x: 0, y: 0, z: 0, uuid: `test-${axis}`, ...flags,
        stages: { has: key => values.has(key), add: key => values.add(key), remove: key => values.delete(key),
            getAll: () => [...values], sync: () => {} },
        isFake: () => !!flags.fake, isCreative: () => !!flags.creative,
        isSpectator: () => !!flags.spectator, isPlayer: () => true };
};
let tagData = () => {
    let values = new Map();
    return { contains: key => values.has(key), putDouble: (key, value) => values.set(key, value),
        getDouble: key => values.get(key) || 0, putInt: (key, value) => values.set(key, value), getInt: key => values.get(key) || 0,
        putBoolean: (key, value) => values.set(key, value), getBoolean: key => values.get(key) || false,
        putString: (key, value) => values.set(key, value), getString: key => values.get(key) || '' };
};
let mob = (type = 'minecraft:zombie', mobLevel = level) => {
    let attributes = new Map([['minecraft:generic.max_health', 20], ['minecraft:generic.attack_damage', 4],
        ['minecraft:generic.armor', 2], ['slashblade_sendims:magic_resistance', 0], ['slashblade_sendims:frenzy_resistance', 0]]);
    let entity = { type, level: mobLevel, x: 0, y: 0, z: 0, forgePersistentData: tagData(), hp: 20,
        isLiving: () => true, isPlayer: () => false,
        attributes: { hasAttribute: id => attributes.has(id) },
        setAttributeBaseValue: (id, value) => attributes.set(id, value),
        getMaxHealth: () => attributes.get('minecraft:generic.max_health'),
        getHealth: () => entity.hp, setHealth: value => { entity.hp = value; }, values: attributes };
    return entity;
};
let spawn = entity => spawned.find(args => args.length == 1)[0]({ entity, level: entity.level });
let exclusions = new Set();
for (let [registry, callback] of tagEvents) {
    if (registry != 'damage_type') continue;
    callback({ add: (tag, values) => {
        if (tag == 'sdbf:difficulty_unaffected') values.forEach(value => exclusions.add(value));
    } });
}
let hurt = (entity, amount, attacker, type = 'minecraft:mob_attack') => {
    let event = { entity, source: { getPlayer: () => attacker,
        is: key => key == 'sdbf:difficulty_unaffected' && exclusions.has(type) },
        getAmount: () => amount, setAmount: value => { amount = value; } };
    for (let priority of ['HIGHEST', 'LOWEST']) {
        for (let args of native.filter(args => args[0] == priority && args[2] == 'hurt')) args[3](event);
    }
    return amount;
};

for (let axis of globals.sdbfDifficultyData.axes) {
    let available = globals.sdbfDifficultyData.modifiers.filter(m => m.effect.type == 'damage_taken' && m.requiredLevel <= axis.level);
    for (let mask = 0; mask < 1 << available.length; mask++) {
        let chosen = available.filter((modifier, index) => mask & (1 << index));
        let p = player(axis.level, chosen.map(m => m.id));
        let multiplier = axis.damageTaken + chosen.reduce((sum, m) => sum + m.effect.bonus, 0);
        near(globals.getPlayerDamageTakenMultiplier(p), multiplier, 'axis and selected damage modifiers add');
        near(hurt(p, 20, null), 20 * multiplier, 'incoming damage scaling');
        near(hurt(p, 20, null, 'minecraft:out_of_world'), 20, 'void excluded');
        near(hurt(p, 20, null, 'minecraft:generic_kill'), 20, 'kill excluded');
        check(!('attack' in globals.getPlayerEnemyBonuses(p)), 'No enemy attack multiplier remains');
    }
}
near(hurt(player(-7), 20, null), 4, 'N-7 damage reduction');
near(hurt(player(5), 20, null), 25, 'N+5 incoming damage');
near(hurt(player(5, ['enemy_attack_1', 'enemy_attack_2']), 20, null), 27, 'Legacy stage IDs remain additive');
near(hurt(player(18, [], { fake: true }), 20, null), 20, 'Fake player excluded');

let fallback = mob();
spawn(fallback);
near(fallback.values.get('minecraft:generic.attack_damage'), 4, 'N0 spawn does not reduce mob attack');
near(fallback.getMaxHealth(), 17, 'Default N0 health');
check(fallback.forgePersistentData.getBoolean('sdbf_difficulty_used_fallback'), 'Missing player marked as fallback');
fallback.setHealth(8.5);
let attacker = player(5, ['enemy_health_1']);
players.push(player(18));
hurt(fallback, 1, attacker);
near(fallback.getMaxHealth(), 46, 'Fallback uses attacker, not the nearby highest player');
near(fallback.getHealth(), 23, 'Reapplication preserves health ratio');
near(fallback.values.get('minecraft:generic.attack_damage'), 4, 'Attack is not scaled twice');
check(fallback.forgePersistentData.getBoolean('sdbf_difficulty_player_reapplied'), 'First attacker marks the retry complete');
hurt(fallback, 1, player(-7));
spawn(fallback);
near(fallback.getMaxHealth(), 46, 'Repeated hits and entity reload do not reapply');

players.length = 0;
players.push(player(0));
let legitimateN0 = mob();
spawn(legitimateN0);
check(!legitimateN0.forgePersistentData.getBoolean('sdbf_difficulty_used_fallback'), 'Explicit N0 is not a fallback');
hurt(legitimateN0, 1, player(18));
near(legitimateN0.getMaxHealth(), 17, 'Explicitly initialized mob remains unchanged');
players.length = 0;
let waiting = mob();
spawn(waiting);
hurt(waiting, 0, attacker);
hurt(waiting, 1, null);
hurt(waiting, 1, player(5, [], { fake: true }));
check(!waiting.forgePersistentData.getBoolean('sdbf_difficulty_player_reapplied'), 'Non-player, fake and zero damage cannot consume retry');
let progressed = player(5);
progressed.stages.add('sdbf.world_lock');
hurt(waiting, 1, progressed);
check(waiting.forgePersistentData.getString('sbsd.diff') == '3_3', 'Dimension special rule uses the attacker too');
near(waiting.values.get('minecraft:generic.attack_damage'), 700, 'Dimension base attack retained');
near(waiting.getMaxHealth(), 26908.2, 'Dimension and personal health recomputed from template');

players.push(player(18, [], { creative: true }), player(-7));
let easy = mob();
spawn(easy);
near(easy.getMaxHealth(), 4, 'Nearby negative difficulty is not clamped to N0; creative ignored');
players.length = 0;
let unknown = mob('test:unmapped');
spawn(unknown);
hurt(unknown, 1, attacker);
let unknownMax = unknown.getMaxHealth();
hurt(unknown, 1, player(18));
near(unknown.getMaxHealth(), unknownMax, 'An unfixable template fallback still retries only once');
let legacy = mob();
legacy.forgePersistentData.putBoolean('dimension_difficulty', true);
legacy.values.set('minecraft:generic.attack_damage', 500);
legacy.setHealth(10);
hurt(legacy, 1, player(5));
near(legacy.values.get('minecraft:generic.attack_damage'), 4, 'Legacy attack multiplier removed');
near(legacy.getHealth(), 18, 'Legacy migration preserves health fraction');
let blocked = mob('powerful_dummy:test_dummy');
spawn(blocked);
hurt(blocked, 1, attacker);
check(!blocked.forgePersistentData.contains('dimension_difficulty'), 'Blacklisted entities untouched');

let html = read('kubejs/assets/apricityui/apricity/screens/difficulty.html');
let totalFunction = html.slice(html.indexOf('function getEnemyTotalAdjustments()'), html.indexOf('function getAxisState('));
let uiContext = vm.createContext({
    axisDefinitions: globals.sdbfDifficultyData.axes.map(axis => ({ level: axis.level, health: axis.health * 100,
        damageTaken: axis.damageTaken * 100, armor: axis.armor * 100 })),
    pendingLevel: 5, selectedModifiers: { enemy_attack_1: true }, queuedModifiers: { enemy_attack_1: true, enemy_attack_2: true },
    findModifierById: id => globals.sdbfDifficultyData.modifiers.find(m => m.id == id)
});
vm.runInContext(totalFunction, uiContext);
near(vm.runInContext('getEnemyTotalAdjustments().damageTaken', uiContext), 135, 'UI deduplicates selected/queued damage modifiers');
check(!/敌人攻击倍率|\battack:/.test(read('kubejs/server_scripts/miscs/difficulty_data.js')), 'No stale attack semantics in config');
JSON.parse(read('kubejs/assets/kubejs/lang/zh_cn.json'));
console.log(`Difficulty regression checks passed: ${checks}`);
