// Offline integration checks for generated Titan bosses, pearls, recipes and dimension limits.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const data = new Map(), gateways = new Map(), recipes = new Map();
let dimensionCallback;
const wave = () => {
    const value = { entities: [], bosses: [], attributes: [], rewards: [] };
    for (const method of ['maxTime', 'setupTime', 'addExperienceReward']) value[method] = (...args) => { value[method + 'Value'] = args; return value; };
    value.addEntity = (id, count) => { value.entities.push([id, count]); return value; };
    value.addApotheosisBoss = id => { value.bosses.push(id); return value; };
    value.addAttribute = (...args) => { value.attributes.push(args); return value; };
    value.addReward = (id, count) => { value.rewards.push([id, count]); return value; };
    return value;
};
const gateway = id => {
    const value = { id, waves: [], rewards: [], loot: [], attributes: [], settings: {} };
    for (const method of ['size','color','spawnRange','leashRange','allowDiscarding','allowDimChange','playerDamageOnly','removeMobsOnFailure','failOnOutOfBounds','spacing','followRangeBoost','defaultDropChance'])
        value[method] = setting => { value.settings[method] = setting; return value; };
    value.addAttribute = (...args) => { value.attributes.push(args); return value; };
    value.addWave = callback => { const entry = wave(); callback(entry); value.waves.push(entry); return value; };
    value.addReward = (item, count) => { value.rewards.push([item, count]); return value; };
    value.addLootTableReward = (...args) => { value.loot.push(args); return value; };
    value.register = () => { check(!gateways.has(id), 'unique gateway ' + id); gateways.set(id, value); };
    return value;
};
const addRecipe = (kind, args) => ({ id: id => { check(!recipes.has(id), 'unique recipe ' + id); recipes.set(id, { kind, args }); } });
const request = () => { const value = {}; for (const key of ['name','killCount','proudSoul','refineCount','build']) value[key] = () => value; return value; };
const context = vm.createContext({
    console: { log() {} },
    ServerEvents: {
        highPriorityData: callback => callback({ addJson: (id, json) => { check(!data.has(id), 'unique boss resource'); data.set(id, json); } }),
        recipes: callback => callback({
            custom: json => addRecipe('custom', [json]),
            shaped: (...args) => addRecipe('shaped', args), shapeless: (...args) => addRecipe('shapeless', args),
            recipes: { slashblade: { slashblade_shaped_recipe: (...args) => addRecipe('blade', args) } }
        })
    },
    Gateway: { customBuilder: gateway },
    Utils: { newMap: () => { const value = new Map(); value.put = (k,v) => value.set(k,v); value.containsKey = k => value.has(k); return value; } },
    BlockEvents: { rightClicked: callback => { dimensionCallback = callback; } },
    Item: { of: (id, nbt) => ({ id, nbt }) },
    SlashBladeIngredient: { of: x => x }, SlashBladeRequestDefinition: { newInstance: request },
    Color: { WHITE: 'white' },
    Text: { translatable: () => ({ append() { return this; }, color() { return this; } }), of: x => x }
});
for (const file of [
    'kubejs/server_scripts/enemy/boss/boss_builder.js',
    'kubejs/server_scripts/enemy/boss/s5_titan_bosses.js',
    'kubejs/server_scripts/enemy/gateways/s5_0_gateway_helpers.js',
    'kubejs/server_scripts/enemy/gateways/s5_titan_gw.js',
    'kubejs/server_scripts/enemy/gateways/limit_gateway_dimension.js',
    'kubejs/server_scripts/recipes/s5_titan.js'
]) vm.runInContext(read(file), context, { filename: file });

const bosses = new Map([...data].map(([id, value]) => [id.replace(':bosses/', ':').replace(/\.json$/, ''), value]));
const nativeEntities = new Set(['cryo_scavenger','ammonia_stalker','corrupted_probe','tholin_weaver'].map(x => 'titan_moon:' + x));
check(bosses.size === 4, 'four native boss archetypes');
for (const [id, boss] of bosses) {
    check(nativeEntities.has(boss.entity), id + ' uses local species');
    check(boss.dimensions.length === 1 && boss.dimensions[0] === 'titan_moon:titan', 'boss dimension is Titan only');
    check(boss.min_rarity === 'mythic' && boss.max_rarity === 'mythic', 'fixed mythic rarity');
    check(boss.valid_gear_sets.includes('#the_end'), 'reuses registered stage-compatible loot carriers');
    const modifiers = boss.stats.mythic.attribute_modifiers;
    const hp = modifiers.find(m => m.attribute.endsWith('.max_health'));
    const atk = modifiers.find(m => m.attribute.endsWith('.attack_damage'));
    check(hp.value.min + hp.value.steps * hp.value.step <= 0.71, 'health modifier fits existing 4_1 template');
    check(atk.operation === 'MULTIPLY_BASE' && atk.value.min + atk.value.steps * atk.value.step <= 0.121, 'attack uses bounded stage-relative bonus');
    check(boss.size.width > 0 && boss.size.height > 0, 'valid native spawn bounds');
}

const allItems = new Set(), totals = {};
const expected = {
    g1: [5,1,8,14,2,8,2,0],
    g2: [8,2,12,28,4,12,3,1],
    g3: [4,4,12,28,6,8,4,1]
};
for (const [id, gate] of gateways) {
    const key = id.slice(-2), totalsByItem = {};
    const entries = [...gate.rewards];
    let bossCount = 0;
    for (const entry of gate.waves) {
        entries.push(...entry.rewards); bossCount += entry.bosses.length;
        check(entry.entities.length + entry.bosses.length > 0, 'no empty waves');
        check(entry.entities.reduce((sum,[,count]) => sum + count, 0) + entry.bosses.length <= 10, 'wave stays within spawn budget');
        for (const [entity,count] of entry.entities) check(nativeEntities.has(entity) && Number.isInteger(count) && count > 0, 'valid native wave entity');
        for (const boss of entry.bosses) check(bosses.has(boss), 'boss reference resolves: ' + boss);
        check(entry.maxTimeValue[0] >= 2200 && entry.maxTimeValue[0] <= 4400, 'S5 time budget');
        check(entry.setupTimeValue[0] >= 80, 'preparation window');
        for (const [attribute,amount,operation] of entry.attributes) {
            check(amount >= 0 && amount <= 0.75, 'bounded wave bonus');
            if (attribute.endsWith('.attack_damage')) check(operation === 'multiply_base', 'wave attack bonus does not compound with boss bonus');
        }
    }
    for (const [item,count] of entries) {
        check(Number.isInteger(count) && count > 0, 'positive integer reward count');
        allItems.add(item); totalsByItem[item] = (totalsByItem[item] || 0) + count;
    }
    const actual = [gate.waves.length,bossCount,...['slashblade:proudsoul_ingot','slashblade:proudsoul_sphere','apotheosis:mythic_material','apotheosis:epic_material','apotheosis:gem_dust'].map(item => totalsByItem[item] || 0),gate.loot.length];
    assert.deepEqual(actual, expected[key], 'exact direct rewards and encounter plan for ' + id); checks++;
    check(gate.loot.every(([table,count]) => table === 'kubejs:rewards/star_chart_fragment' && count === 1), 'only one completion chart fragment');
    check(gate.settings.removeMobsOnFailure && !gate.settings.allowDimChange, 'gateway cleanup and mob dimension lock');
    totals[id] = { waves: gate.waves.length, mythicBosses: bossCount, rewards: totalsByItem, starChartFragments: gate.loot.length };

    const recipe = recipes.get('sdbf:sdbf_titan_' + key + '_s5');
    check(recipe && recipe.kind === 'shaped', 'craftable pearl');
    const [output,pattern,ingredients] = recipe.args;
    check(output.id === 'gateways:gate_pearl' && output.nbt.includes(id), 'recipe NBT matches gateway');
    check(pattern.join('').split('A').length - 1 === 4 && pattern.join('').split('B').length - 1 === 4, 'recipe pays four outer + four inner materials');
    Object.values(ingredients).forEach(item => allItems.add(item));
    const language = JSON.parse(read('kubejs/assets/kubejs/lang/zh_cn.json'));
    check(language[id.replace(':','.')].includes('土卫六'), 'localized pearl name');
    for (const correct of [true,false]) {
        let blocked = false, cooldown = 0;
        dimensionCallback({
            getItem: () => ({ toString: () => 'gateways:gate_pearl', getNbt: () => ({ contains: () => true, getString: () => id }) }),
            player: { getLevel: () => ({ dimensionKey: correct ? 'titan_moon:titan' : 'minecraft:overworld' }), addItemCooldown: (_,ticks) => { cooldown = ticks; }, tell() {} },
            cancel: value => { blocked = value; }
        });
        check(blocked === !correct && cooldown === (correct ? 0 : 20), 'pearl opens only on Titan');
    }
}
check(gateways.size === 3, 'three different pearls');
const config = read('config/apotheosis/adventure.cfg');
for (const [section,line] of [
    ['Affix Convert Rarities','titan_moon:titan|rare|mythic'],
    ['Gem Dimensional Rarities','titan_moon:titan|epic|ancient'],
    ['Boss Spawn Dimensions','titan_moon:titan|0.03|NEEDS_SURFACE']
]) {
    const block = config.split('S:"' + section + '" <')[1].split('>')[0];
    check(block.split(/\r?\n/).filter(x => x.trim() === line).length === 1, 'one Titan setting in ' + section);
}

// Resolve every new reward/ingredient against the installed mod's own item models.
const python = process.env.PYTHON || 'C:/ProgramData/Anaconda3/python.exe';
const result = JSON.parse(execFileSync(python, ['-X','utf8','-c', `
import json,zipfile
from pathlib import Path
items=json.loads(${JSON.stringify(JSON.stringify([...allItems]))})
archives={}
for pattern,namespace in [('titan_moon-*.jar','titan_moon'),('Apotheosis-*.jar','apotheosis'),('SlashBladeResharped-*.jar','slashblade')]:
    archives[namespace]=zipfile.ZipFile(next(Path('mods').glob(pattern)))
missing=[item for item in items if 'assets/'+item.split(':')[0]+'/models/item/'+item.split(':')[1]+'.json' not in archives[item.split(':')[0]].namelist()]
lang=json.loads(archives['apotheosis'].read('assets/apotheosis/lang/zh_cn.json'))
print(json.dumps({'missing':missing,'epicName':lang['item.apotheosis.epic_material'],'mythicName':lang['item.apotheosis.mythic_material']}))
`], { cwd: root, encoding: 'utf8' }));
check(result.missing.length === 0, 'all item ids exist: ' + result.missing.join(', '));
check(result.epicName === '玄奥沙' && result.mythicName === '神铸珍珠', 'materials match requested Chinese names');
const out = path.join(root, 'docs/archive/titan-gateways-2026-11-02');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'generated-design.json'), JSON.stringify({ bosses: Object.fromEntries(bosses), gateways: totals, checks }, null, 2) + '\n');
console.log(`PASS: ${checks} Titan content integration checks; 4 bosses, 3 pearls, all IDs/recipes/limits/reward totals resolved.`);
console.log(JSON.stringify(totals, null, 2));
