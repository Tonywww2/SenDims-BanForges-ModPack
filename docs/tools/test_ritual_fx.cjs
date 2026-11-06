// Offline check for the ritual / bedrock breaker scripts with a small KubeJS stand-in.
// Runs the real startup, server and client scripts and drives right clicks tick by tick.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..', '..');
const read = p => fs.readFileSync(path.join(ROOT, 'kubejs', p), 'utf8');
const EXIT = { exit: true };
// In game KubeJS resolves these overloaded vanilla names to another overload, so a call with
// three numbers throws. The stand-ins fail the same way to keep scripts off them.
const overloadTrap = name => () => { throw new Error(`Can't find method ${name}(number,number,number).`); };

// ---------- shared stand-ins ----------
const blocks = {};
const blockOf = id => blocks[id] || (blocks[id] = { id, getName: () => text('block:' + id), equals: o => !!o && o.id === id });
const stateOf = id => ({ getBlock: () => blockOf(id || 'minecraft:air'), isAir: () => !id || id === 'minecraft:air', block: id });
function text(s) {
    const t = { s: String(s), parts: [] };
    t.append = c => { t.parts.push(c); return t; };
    for (const m of ['yellow', 'red', 'green', 'gray', 'aqua', 'gold', 'obfuscated']) t[m] = () => { t.color = m; return t; };
    t.toString = () => t.s + t.parts.map(String).join('');
    return t;
}
class BlockPos {
    constructor(x, y, z) { this.x = Math.floor(x); this.y = Math.floor(y); this.z = Math.floor(z); }
    offset(dx, dy, dz) { return new BlockPos(this.x + dx, this.y + dy, this.z + dz); }
    toString() { return `${this.x},${this.y},${this.z}`; }
}
const items = {};
const itemOf = id => items[id] || (items[id] = { id });
class ItemStack {
    constructor(id, count) { this.id = id; this.count = id === 'minecraft:air' ? 0 : (count || 1); }
    getId() { return this.isEmpty() ? 'minecraft:air' : this.id; }
    isEmpty() { return this.count <= 0 || this.id === 'minecraft:air'; }
    getItem() { return itemOf(this.getId()); }
    shrink(n) { this.count -= n; }
}

function makeWorld() {
    const world = { tick: 0, tasks: [], commands: [], levels: {}, records: [] };
    const server = {
        getTickCount: () => world.tick,
        scheduleInTicks: (n, cb) => world.tasks.push({ at: world.tick + n, cb }),
        runCommandSilent: cmd => {
            world.commands.push({ tick: world.tick, cmd: String(cmd) });
            const m = /execute in (\S+) run tp (\S+) (\S+) (\S+) (\S+)/.exec(cmd);
            if (m) {
                const p = world.players[m[2]];
                p.level = world.levels[m[1]]; p.x = +m[3]; p.y = +m[4]; p.z = +m[5];
            }
            return 1;
        },
        getLevel: dim => world.levels[String(dim)]
    };
    world.server = server;
    world.players = {};
    world.level = dim => world.levels[dim] || (world.levels[dim] = makeLevel(world, dim));
    world.advance = n => {
        for (let i = 0; i < n; i++) {
            world.tick++;
            const due = world.tasks.filter(t => t.at <= world.tick);
            world.tasks = world.tasks.filter(t => t.at > world.tick);
            for (const t of due) t.cb({});
        }
    };
    return world;
}
function makeLevel(world, dim) {
    const map = {};
    const level = {
        map, server: world.server, getServer: () => world.server,
        getDimension: () => dim, dimensionKey: { location: () => ({ toString: () => dim }) },
        getBlockState: pos => stateOf(map[String(pos)]),
        setBlock: (pos, state) => { map[String(pos)] = state.block; },
        removeBlock: pos => { delete map[String(pos)]; },
        destroyBlock: (pos, drop) => { world.records.push({ tick: world.tick, type: 'destroy', pos: String(pos), drop }); delete map[String(pos)]; },
        destroyBlockProgress: (id, pos, stage) => world.records.push({ tick: world.tick, type: 'crack', id, pos: String(pos), stage }),
        createEntity: type => ({ type, setVisualOnly(v) { this.visual = v; }, setPosition(x, y, z) { this.pos = [x, y, z]; },
            moveTo: overloadTrap('net.minecraft.world.entity.Entity.m_20219_') }),
        addFreshEntity: e => world.records.push({ tick: world.tick, type: 'entity', e }),
        getLevelData: () => ({ getXSpawn: () => 0, getYSpawn: () => 64, getZSpawn: () => 0 })
    };
    return level;
}
function makePlayer(world, name, dim, x, y, z) {
    const cooldowns = {};
    const p = {
        name: { string: name }, uuid: 'uuid-' + name, x, y, z, level: world.level(dim), server: world.server,
        mainHandItem: new ItemStack('minecraft:air'), sneaking: false, alive: true, disconnected: false,
        status: [], chat: [], effects: [], swings: 0,
        isShiftKeyDown() { return this.sneaking; },
        isAlive() { return this.alive; },
        hasDisconnected() { return this.disconnected; },
        distanceToSqr: overloadTrap('net.minecraft.world.entity.Entity.m_20238_'),
        setStatusMessage(c) { this.status.push(String(c)); },
        tell(c) { this.chat.push(String(c)); },
        swing() { this.swings++; },
        potionEffects: { add: (id, d, a) => p.effects.push({ id, d, tick: world.tick }) },
        cooldowns: {
            addCooldown: (item, t) => { cooldowns[item.id] = world.tick + t; },
            isOnCooldown: item => (cooldowns[item.id] || 0) > world.tick
        }
    };
    world.players[name] = p;
    return p;
}

// ---------- script contexts ----------
const shared = {};
function context(world, handlers) {
    const ctx = {
        global: shared, console: { warn: m => world.records.push({ type: 'warn', m: String(m) }), log() {}, error: m => world.records.push({ type: 'error', m: String(m) }) },
        Utils: { newMap: () => { const m = new Map(); return { put: (k, v) => m.set(String(k), v), get: k => m.get(String(k)), containsKey: k => m.has(String(k)) }; } },
        Block: { getBlock: id => blockOf(String(id)) },
        Blocks: Object.fromEntries(['AIR', 'OBSIDIAN', 'CRYING_OBSIDIAN', 'COBBLESTONE'].map(n => [n, { defaultBlockState: () => stateOf(n === 'AIR' ? 'minecraft:air' : 'minecraft:' + n.toLowerCase()) }])),
        BlockPos, Text: { of: s => text(s), translatable: (k, ...a) => { const t = text(k); t.args = a; t.toString = () => k + '(' + a.map(String).join('|') + ')'; return t; } },
        Platform: { getMods: () => ({ containsKey: () => false }) },
        Java: { loadClass: n => n.endsWith('Vec3') ? function (x, y, z) { this.v = [x, y, z]; } : { ScreenShake: (lvl, v, r, m, d, f) => world.records.push({ tick: world.tick, type: 'shake', r, m }) } },
        BlockEvents: { rightClicked: (a, b) => handlers.push(b ? { filter: a, fn: b } : { filter: null, fn: a }) },
        PLAYER_Y: 310, getLevelSpawnPoint: level => [0, 64, 0], JSON, Math, Object, String
    };
    return vm.createContext(ctx);
}
function load(ctx, files) {
    // KubeJS shares top-level declarations between scripts of one type: run them as one program.
    vm.runInContext(files.map(read).join('\n;\n'), ctx, { filename: 'kubejs' });
}

const worlds = [];
function setup(cfg) {
    const world = makeWorld();
    worlds.push(world);
    for (const k of Object.keys(shared)) delete shared[k];
    const serverHandlers = [], clientHandlers = [];
    load(context(world, []), ['startup_scripts/ritual_triggers.js']);
    load(context(world, serverHandlers), ['server_scripts/configs.js', 'server_scripts/custom_spawn/ritual_fx.js',
        'server_scripts/custom_spawn/spawn_struct_base.js', 'server_scripts/custom_spawn/spawn_struct.js',
        'server_scripts/custom_spawn/spawn_portal.js', 'server_scripts/miscs/bedrock_breaker.js']);
    load(context(world, clientHandlers), ['client_scripts/ritual_triggers.js']);
    if (cfg) Object.assign(shared.ritualFx, cfg);
    // KubeJS logs errors from scheduled callbacks and carries on; surface them here.
    const realAdvance = world.advance;
    world.advance = n => {
        for (let i = 0; i < n; i++) {
            try { realAdvance(1); } catch (e) { world.records.push({ type: 'error', m: String(e) }); }
        }
    };
    // KubeJS: the event is skipped while the held item is on cooldown.
    const fire = (handlers, player, pos) => {
        if (!player.mainHandItem.isEmpty() && player.cooldowns.isOnCooldown(player.mainHandItem.getItem())) return 'cooldown';
        const blockId = player.level.map[String(pos)] || 'minecraft:air';
        let canceled = false;
        const event = { block: { id: blockId, pos }, level: player.level, player, hand: 'MAIN_HAND', item: player.mainHandItem,
            cancel() { canceled = true; throw EXIT; } };
        for (const h of handlers) {
            if (h.filter && h.filter !== blockId) continue;
            try { h.fn(event); } catch (e) { if (e !== EXIT) throw e; break; }
        }
        return canceled;
    };
    world.click = (player, pos) => ({ client: fire(clientHandlers, player, pos), server: fire(serverHandlers, player, pos) });
    return world;
}
const build = (level, center, pattern, mapping) => {
    pattern.forEach((layer, li) => layer.forEach((row, r) => [...row].forEach((ch, c) => {
        if (ch !== ' ') level.map[String(center.offset(c - 1, 1 - li, r - 1))] = mapping[ch];
    })));
};
const BASE = [[' A ', 'AAA', ' A '], ['A A', ' B ', 'A A'], ['CAC', 'AAA', 'CAC']];
const PORTAL = [['   ', '   ', '   '], ['   ', ' B ', '   '], ['AAA', 'AAA', 'AAA']];
const AETHER = { A: 'aether:cold_aercloud', B: 'aether:ambrosium_block', C: 'aether:angelic_stone' };
const cmds = (w, re) => w.commands.filter(c => re.test(c.cmd));
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// 1. Summoning ritual: diagnose, preview, charge, release (item consumed only at release).
{
    const w = setup();
    const lvl = w.level('minecraft:overworld');
    const c = new BlockPos(10, 64, 10);
    build(lvl, c, BASE, AETHER);
    delete lvl.map[String(c.offset(-1, -1, -1))];
    lvl.map[String(c.offset(1, 1, 0))] = 'minecraft:dirt';
    const p = makePlayer(w, 'Steve', 'minecraft:overworld', 12, 64, 10);
    p.mainHandItem = new ItemStack('aether_redux:golden_swet_ball', 3);
    let r = w.click(p, c);
    ok(r.client === true && r.server === true, 'activation click canceled on both sides');
    ok(p.mainHandItem.count === 3, 'failed check keeps the item');
    ok(/info\.kubejs\.ritual\.missing\(2\|/.test(p.status.at(-1)), 'action bar lists 2 problems: ' + p.status.at(-1));
    ok(cmds(w, /block_marker aether:angelic_stone .* force Steve$/).length === 1, 'ghost of missing corner shown to the player only');
    ok(cmds(w, /block_marker aether:cold_aercloud .* force Steve$/).length === 1 && cmds(w, /minecraft:dust 1 0\.15 0\.15 .* force Steve$/).length === 1, 'wrong block gets ghost + red mark');
    ok(w.click(p, c).server === 'cooldown', 'short cooldown after a failed check');
    w.advance(11);
    lvl.map[String(c.offset(-1, -1, -1))] = 'aether:angelic_stone';
    lvl.map[String(c.offset(1, 1, 0))] = 'aether:cold_aercloud';

    p.sneaking = true;
    const before = w.commands.length;
    r = w.click(p, c);
    ok(r.server === true && p.mainHandItem.count === 3 && /complete/.test(p.status.at(-1)), 'sneak + activation item previews without activating');
    ok(w.commands.slice(before).every(x => / force Steve$/.test(x.cmd) || /playsound .* Steve /.test(x.cmd)), 'preview effects are personal');
    p.sneaking = false;

    r = w.click(p, c);
    ok(r.server === true && /charging/.test(p.status.at(-1)), 'charge starts');
    ok(p.mainHandItem.count === 3, 'item not consumed at charge start');
    ok(w.click(p, c).server === 'cooldown', 'repeat clicks during the charge are swallowed by the cooldown');
    w.advance(39);
    ok(p.mainHandItem.count === 3 && !w.records.some(x => x.type === 'destroy'), 'nothing released before tick 40');
    w.advance(1);
    ok(p.mainHandItem.count === 2, 'one item consumed at release');
    ok(w.records.some(x => x.type === 'entity' && x.e.visual === true), 'visual-only lightning');
    ok(w.records.some(x => x.type === 'shake'), 'screen shake requested');
    w.advance(6);
    const destroyed = w.records.filter(x => x.type === 'destroy');
    ok(destroyed.length === 19 && destroyed.every(x => x.drop === false), 'all 19 ritual blocks crumble without drops');
    ok(new Set(destroyed.map(x => x.tick)).size === 3, 'crumble in three batches');
    ok(cmds(w, /place structure lost_aether_content:platinum_dungeon/).length === 1, 'dungeon placed once');
    ok(p.chat.some(m => /TungTungTung/.test(m)), 'easter egg kept');
    ok(cmds(w, /^title Steve subtitle .*info\.kubejs\.ritual\.summoned.*platinum_dungeon/).length === 1, 'summon title to the initiator only');
    ok(cmds(w, /^title /).every(x => /^title Steve /.test(x.cmd)), 'no title for anyone else');
}

// 2. Interruptions: block removed, item switched, second player while busy.
{
    const w = setup();
    const lvl = w.level('minecraft:overworld');
    const c = new BlockPos(0, 64, 0);
    build(lvl, c, BASE, AETHER);
    const p = makePlayer(w, 'Alex', 'minecraft:overworld', 2, 64, 0);
    const q = makePlayer(w, 'Bob', 'minecraft:overworld', -2, 64, 0);
    p.mainHandItem = new ItemStack('aether_redux:golden_swet_ball', 1);
    q.mainHandItem = new ItemStack('aether_redux:golden_swet_ball', 1);
    w.click(p, c);
    w.click(q, c);
    ok(/busy/.test(q.status.at(-1)), 'second activation reports busy');
    w.advance(15);
    delete lvl.map[String(c.offset(0, 1, 0))];
    w.advance(5);
    ok(/interrupted/.test(p.status.at(-1)) && p.mainHandItem.count === 1, 'broken structure interrupts without consuming');
    w.advance(60);
    ok(!cmds(w, /place structure/).length, 'nothing summoned after interruption');

    lvl.map[String(c.offset(0, 1, 0))] = 'aether:cold_aercloud';
    w.click(p, c);
    w.advance(10);
    p.mainHandItem = new ItemStack('minecraft:dirt', 1);
    w.advance(10);
    ok(/item_left/.test(p.status.at(-1)), 'switching away from the activation item interrupts');
    p.mainHandItem = new ItemStack('aether_redux:golden_swet_ball', 1);
    w.advance(20);
    w.click(p, c);
    p.x = 20;
    w.advance(10);
    ok(/interrupted/.test(p.status.at(-1)), 'walking away interrupts');
}

// 3. Preview rules: empty hand + sneak previews; other items or no sneak do nothing.
{
    const w = setup();
    const lvl = w.level('minecraft:overworld');
    const c = new BlockPos(0, 64, 0);
    build(lvl, c, BASE, AETHER);
    delete lvl.map[String(c.offset(1, 1, 0))];
    const p = makePlayer(w, 'Eve', 'minecraft:overworld', 2, 64, 0);
    p.sneaking = true;
    let r = w.click(p, c);
    ok(r.client === true && r.server === true && cmds(w, /block_marker .* force Eve$/).length === 19, 'empty-hand sneak preview shows the whole structure');
    w.advance(30);
    const n = w.commands.length;
    p.mainHandItem = new ItemStack('minecraft:dirt', 64);
    r = w.click(p, c);
    ok(r.client === false && r.server === false && w.commands.length === n, 'other held items get no preview and no cancel');
    p.mainHandItem = new ItemStack('minecraft:air');
    p.sneaking = false;
    r = w.click(p, c);
    ok(r.client === false && r.server === false && w.commands.length === n, 'empty hand without sneaking does nothing');
    p.sneaking = true;
    w.click(p, c);
    const m = w.commands.length;
    w.click(p, c);
    ok(w.commands.length === m, 'held right-click preview is throttled');
}

// 4. Portal ritual: wrong dimension, charge, darkness, teleport, platform.
{
    const w = setup();
    const ow = w.level('minecraft:overworld');
    const nether = w.level('minecraft:the_nether');
    w.level('tofucraft:tofu_world');
    const c = new BlockPos(5, 70, 5);
    build(ow, c, PORTAL, { A: 'tofucraft:blocktofugrilled', B: 'minecraft:moss_block' });
    build(nether, c, PORTAL, { A: 'tofucraft:blocktofugrilled', B: 'minecraft:moss_block' });
    const p = makePlayer(w, 'Tofu', 'minecraft:the_nether', 5, 71, 6);
    p.mainHandItem = new ItemStack('tofucraft:tofustick', 1);
    w.click(p, c);
    ok(/wrong_dimension/.test(p.status.at(-1)) && !cmds(w, / run tp /).length, 'portal refuses the wrong dimension');
    w.advance(12);
    p.level = ow;
    const start = w.tick;
    w.click(p, c);
    w.advance(30);
    ok(p.effects.some(e => e.id === 'minecraft:darkness' && e.tick === start + 30), 'darkness 10 ticks before teleport');
    w.advance(10);
    ok(cmds(w, /execute in tofucraft:tofu_world run tp Tofu 5\.5 65 5\.5/).length === 1, 'teleported to the tofu world');
    ok(p.mainHandItem.count === 1, 'portal activation item is not consumed');
    const tofu = w.levels['tofucraft:tofu_world'];
    ok(tofu.map['5,64,5'] === 'minecraft:crying_obsidian' && tofu.map['5,63,5'] === 'minecraft:obsidian', 'support under the player is placed immediately');
    ok(tofu.map['6,63,5'] === undefined, 'outer ring not yet placed');
    w.advance(9);
    ok([[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].every(([dx, dz]) => tofu.map[`${5 + dx},63,${5 + dz}`] === 'minecraft:obsidian'), 'outer ring condenses within 8 ticks');
    ok(cmds(w, /execute in tofucraft:tofu_world .*respawn_anchor\.set_spawn/).length === 1, 'arrival effect at the destination');
}

// 5. Bedrock breaker: three hits with cooldowns, reset, wrong dimension.
{
    const w = setup();
    const moon = w.level('ad_astra:moon');
    w.level('minecraft:the_nether');
    const ow = w.level('minecraft:overworld');
    const b = new BlockPos(0, -64, 0);
    moon.map[String(b)] = 'minecraft:bedrock';
    ow.map[String(b)] = 'minecraft:bedrock';
    const p = makePlayer(w, 'Digger', 'minecraft:overworld', 0, -63, 0);
    p.mainHandItem = new ItemStack('kubejs:bedrock_breaker', 2);
    let r = w.click(p, b);
    ok(r.client === true && r.server === true && /no_path/.test(p.status.at(-1)) && p.mainHandItem.count === 2, 'no passage outside moon / twilight');
    w.advance(10);
    p.level = moon;
    w.click(p, b);
    ok(/crack\(1\)/.test(p.status.at(-1)), 'hit 1');
    const crack = w.records.filter(x => x.type === 'crack');
    ok(crack.length === 1 && crack[0].stage === 3 && crack[0].id < 0, 'crack stage 3 with a non-entity breaker id');
    ok(w.click(p, b).server === 'cooldown', 'vanilla cooldown between hits');
    w.advance(8);
    w.click(p, b);
    ok(/crack\(2\)/.test(p.status.at(-1)), 'hit 2');
    w.advance(70);
    ok(w.records.filter(x => x.type === 'crack').at(-1).stage === -1, 'crack fades after 3 s without a hit');
    w.click(p, b);
    ok(/crack\(1\)/.test(p.status.at(-1)), 'count restarts after the pause');
    w.advance(8); w.click(p, b);
    w.advance(8); w.click(p, b);
    ok(p.mainHandItem.count === 1, 'third hit consumes one breaker');
    w.advance(3);
    ok(p.effects.some(e => e.id === 'minecraft:darkness'), 'darkness before the fall');
    w.advance(10);
    ok(cmds(w, /execute in minecraft:the_nether run tp Digger 0 87 0/).length === 1, 'fell into the nether 150 blocks up');
    ok(w.levels['minecraft:the_nether'].map['-2,84,-2'] === 'minecraft:obsidian', 'obsidian landing platform');
}

// 6. Charge switch off: instant release.
{
    const w = setup({ charge: false });
    const lvl = w.level('minecraft:overworld');
    const c = new BlockPos(0, 64, 0);
    build(lvl, c, BASE, { A: 'minecraft:soul_soil', B: 'undergarden:utherium_block', C: 'undergarden:virulent_mix' });
    const p = makePlayer(w, 'Sam', 'minecraft:overworld', 2, 64, 0);
    p.mainHandItem = new ItemStack('undergarden:utherium_crystal', 1);
    w.click(p, c);
    ok(p.mainHandItem.count === 0, 'charge disabled: released immediately');
    w.advance(6);
    ok(cmds(w, /summon final_samurai:samurai/).length === 1, 'samurai summoned');
    ok(!w.records.some(x => x.type === 'warn'), 'every registered ritual is listed in the shared trigger table');
}

// 7. A script error mid-charge must unlock the spot and tell the player (it used to stay "busy").
{
    const w = setup();
    const ow = w.level('minecraft:overworld');
    w.level('tofucraft:tofu_world');
    const c = new BlockPos(5, 70, 5);
    build(ow, c, PORTAL, { A: 'tofucraft:blocktofugrilled', B: 'minecraft:moss_block' });
    const p = makePlayer(w, 'Glitch', 'minecraft:overworld', 5, 71, 6);
    p.mainHandItem = new ItemStack('tofucraft:tofustick', 1);
    let failOnce = true;
    p.hasDisconnected = function () { if (failOnce && w.tick > 0) { failOnce = false; throw new Error('boom'); } return false; };
    w.click(p, c);
    w.advance(10);
    ok(w.records.filter(x => x.type === 'error').length === 1 && /boom/.test(w.records.find(x => x.type === 'error').m), 'the error is logged once');
    ok(/interrupted/.test(p.status.at(-1)), 'player is told the ritual was interrupted');
    w.records = w.records.filter(x => x.type !== 'error');
    w.advance(20);
    w.click(p, c);
    ok(/charging/.test(p.status.at(-1)), 'the same spot can be used again, not stuck as busy');
    w.advance(40);
    ok(cmds(w, /execute in tofucraft:tofu_world run tp Glitch /).length === 1, 'second attempt teleports');
}

for (const w of worlds) {
    const errors = w.records.filter(x => x.type === 'error');
    ok(errors.length === 0, 'no script errors: ' + errors.map(x => x.m).join(' / '));
}

console.log(`PASS: ${checks} checks (summon, interruptions, preview rules, portal, bedrock breaker, client/server cancel parity)`);
