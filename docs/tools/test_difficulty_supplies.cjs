// 难度子修正补给：多件补给、拔刀剑延后生成、N-6 及以下开关。node docs/tools/test_difficulty_supplies.cjs
'use strict';
const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
const read = f => fs.readFileSync(f, 'utf8');
let checks = 0; const ok = (c, m) => { checks++; assert.ok(c, m); };
const made = [];
const stackOf = (id, extra) => ({ id, extra, isEmpty: () => false, copy() { return this; } });
const load = flags => {
    const ctx = vm.createContext({
        global: Object.assign({}, flags), console, JSON, Math, Object, Array, String, Number,
        Item: { of: (id, extra) => { made.push([id, extra]); return stackOf(id, extra); } }
    });
    vm.runInContext(read('kubejs/server_scripts/miscs/difficulty_data.js'), ctx);
    vm.runInContext(read('kubejs/server_scripts/miscs/difficulty_config.js') + '\n;globalThis.__defs = subModifierDefinitions; globalThis.__data = difficultyData;', ctx);
    return { defs: ctx.__defs, data: ctx.__data };
};
const byId = defs => Object.fromEntries(defs.map(d => [d.id, d]));

// 1. Defaults: every requested modifier is present at its level with the right stacks.
const on = load({});
const d = byId(on.defs);
const want = {
    skip_skyblock: [0, [['tofucraft:blocktofugrilled', 18], ['minecraft:moss_block', 2], ['tofucraft:tofustick', 2]]],
    skip_tofu_world: [0, [['slashblade_sendims:deeprealm_certificate', 1], ['biomemakeover:cracked_bricks', 18], ['minecraft:bricks', 2]]],
    me_drive: [-3, [['ae2:drive', 2]]],
    storage_cell_16k: [-4, [['ae2:item_storage_cell_16k', 2]]], villagers: [-4, [['easy_villagers:villager', 8]]], traders: [-4, [['easy_villagers:trader', 8]]],
    vindicator_spawner: [-5, [['minecraft:spawner', 'nbt']]],
    disk_drive_256k: [-6, [['ae2things:disk_drive_256k', 2]]], fe_cell_256k: [-6, [['appflux:fe_256k_cell', 1]]],
    americium_rtg: [-6, [['nuclearcraft:americium_rtg', 2], ['thermal:upgrade_augment_3', 2]]],
    pulverizer: [-6, [['thermal:machine_pulverizer', 2], ['thermal:upgrade_augment_3', 2]]],
    induction_smelter: [-6, [['thermal:machine_smelter', 2], ['thermal:upgrade_augment_3', 2]]],
    redstone_furnace: [-6, [['thermal:machine_furnace', 2], ['thermal:upgrade_augment_3', 2]]],
    creative_energy: [-7, [['draconicevolution:creative_op_capacitor', 1]]],
    creative_oxygen: [-7, [['ad_astra_giselle_addon:creative_oxygen_can', 1], ['minecraft:enchanted_book', 'nbt']]],
    tier7_rocket: [-7, [['ad_astra_rocketed:tier_7_rocket', 1], ['pneumaticcraft:huge_tank', 'nbt']]],
    creative_item_cell: [-7, [['ae2:creative_item_cell', 1]]], creative_fluid_cell: [-7, [['ae2:creative_fluid_cell', 1]]],
    creative_pool: [-7, [['botania:creative_pool', 1]]], fission_builder: [-7, [['nuclearcraft:multiblock_builder', 1]]],
    zenith_divine_might: [-7, [['blade', 'slashblade_sendims:zenith_false_divine_might']]],
    gate_fragments: [-7, [['elder_bosses:gate_fragment', 64]]]
};
for (const [id, [level, stacks]] of Object.entries(want)) {
    const m = d[id];
    ok(m && m.requiredLevel === level && m.category === 'starter_item', id + ' at N' + level);
    ok(m.effect.supplies.length === stacks.length, id + ': ' + stacks.length + ' stack(s)');
    stacks.forEach(([item, amount], i) => {
        const s = m.effect.supplies[i];
        if (item === 'blade') ok(s.blade === amount && !s.stack, id + ': blade built at give time');
        else ok(s.stack.id === item && (amount === 'nbt' ? typeof s.stack.extra === 'string' : s.stack.extra === amount), id + ': ' + item + ' ×' + amount);
    });
}
ok(d.vindicator_spawner.effect.supplies[0].stack.extra.includes('minecraft:vindicator') && d.vindicator_spawner.effect.supplies[0].stack.extra.includes('no_ai:1b'), 'spawner NBT kept verbatim');
ok(/StoredEnchantments:\[\{id:"ad_astra_giselle_addon:space_breathing",lvl:1s\}\]/.test(d.creative_oxygen.effect.supplies[1].stack.extra), 'space breathing I stored on the book');
ok(/Amount:512000,FluidName:"ad_astra:fuel"/.test(d.tier7_rocket.effect.supplies[1].stack.extra), 'huge tank holds 512000 mB fuel');
ok(d.soul_tiny.effect.supplies.length === 1 && d.soul_tiny.effect.supplies[0].stack.id === 'slashblade:proudsoul_tiny', 'old single-item form still works');
ok(d.advanced_dislocator.effect.supplies[0].stack.extra === '{fuel:128}', 'old single-item NBT form still works');
ok(!!d.infinite_items, 'creative vending upgrade present by default');

// 2. Switch off (new key, then legacy key): everything at N-6 and N-7 disappears, the rest stays.
for (const flags of [{ difficulty_extreme_modifiers_enabled: false }, { difficulty_cvu_enabled: false }]) {
    const off = load(flags), o = byId(off.defs);
    ok(off.defs.every(m => m.requiredLevel > -6), JSON.stringify(flags) + ': no modifier at N-6 or below');
    ok(!o.infinite_items && !o.creative_pool && !o.americium_rtg, JSON.stringify(flags) + ': creative upgrade and N-6/N-7 supplies removed');
    ok(o.skip_skyblock && o.skip_tofu_world && o.vindicator_spawner && o.me_drive && o.ap_gain && o.drop_3 && o.enemy_health_5, JSON.stringify(flags) + ': N-5 and milder modifiers kept');
    ok(off.data.modifiers.length === off.defs.length, 'client data matches the server list');
}
ok(on.defs.length - load({ difficulty_extreme_modifiers_enabled: false }).defs.length === 16, 'exactly 16 modifiers sit at N-6/N-7 (6 + 10)');

// 3. Giving: every stack is given; the blade is created from the registry; a missing blade does not stop the rest.
const src = read('kubejs/server_scripts/miscs/difficulty.js');
const fn = src.slice(src.indexOf('let giveDifficultySupplies'), src.indexOf('let applySubModifier'));
const given = [], errors = [];
const gctx = vm.createContext({ console: { error: m => errors.push(m) }, getBladeStack: (reg, id) => { if (id.includes('missing')) throw new Error('no blade'); return stackOf('blade:' + id); } });
vm.runInContext(fn + '\n;globalThis.give = giveDifficultySupplies;', gctx);
const player = { server: { registryAccess: () => 'registry' }, give: s => given.push(s.id) };
gctx.give(player, d.americium_rtg);
ok(JSON.stringify(given) === '["nuclearcraft:americium_rtg","thermal:upgrade_augment_3"]', 'both stacks given');
given.length = 0; gctx.give(player, d.zenith_divine_might);
ok(given[0] === 'blade:slashblade_sendims:zenith_false_divine_might', 'named blade created at give time');
given.length = 0;
gctx.give(player, { id: 'probe', effect: { supplies: [{ blade: 'missing:blade' }, { stack: stackOf('x:after') }] } });
ok(given.length === 1 && given[0] === 'x:after' && errors.length === 1, 'missing blade is logged and skipped, later stacks still given');

console.log(`PASS: ${checks} checks (22 new supplies, switch on/off incl. legacy key, multi-stack and blade giving)`);
