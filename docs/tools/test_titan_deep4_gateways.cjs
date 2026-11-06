// Execute data/recipe callbacks and compare complete generated rewards with the SG baseline.
let fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
let root = path.resolve(__dirname, '../..');
let read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
let plain = value => JSON.parse(JSON.stringify(value));
let checks = 0;
let check = (ok, why) => { assert.ok(ok, why); checks++; };
let equal = (a, b, why) => { assert.deepEqual(plain(a), plain(b), why); checks++; };
let harness = () => {
    let gates = new Map(), data = new Map(), recipes = new Map(), dimensionCallback;
    let wave = () => {
        let value = { entities: [], bosses: [], attributes: [], rewards: [], stacks: [] };
        for (let method of ['maxTime', 'setupTime', 'addExperienceReward']) value[method] = (...args) => { value[method + 'Value'] = args; return value; };
        value.addEntity = (...args) => { value.entities.push(args); return value; };
        value.addApotheosisBoss = id => { value.bosses.push(id); return value; };
        value.addAttribute = (...args) => { value.attributes.push(args); return value; };
        value.addReward = (...args) => { value.rewards.push(args); return value; };
        value['addStackListReward(java.util.List)'] = entries => { value.stacks.push(...entries); return value; };
        return value;
    };
    let gateway = id => {
        let value = { id, waves: [], rewards: [], loot: [], attributes: [], settings: {} };
        for (let method of ['size','color','spawnRange','leashRange','allowDiscarding','allowDimChange','playerDamageOnly','removeMobsOnFailure','failOnOutOfBounds','spacing','followRangeBoost','defaultDropChance']) value[method] = setting => { value.settings[method] = setting; return value; };
        value.addAttribute = (...args) => { value.attributes.push(args); return value; };
        value.addWave = callback => { let w = wave(); callback(w); value.waves.push(w); return value; };
        value.addReward = (...args) => { value.rewards.push(args); return value; };
        value.addLootTableReward = (...args) => { value.loot.push(args); return value; };
        value.register = () => { check(!gates.has(id), 'unique portal ' + id); gates.set(id, value); };
        return value;
    };
    let addRecipe = (kind, args) => ({ id: id => { check(!recipes.has(id), 'unique recipe ' + id); recipes.set(id, { kind, args }); } });
    let item = (id, nbt) => ({ id, nbt, toJson() { return { item: id, ...(nbt ? { nbt } : {}) }; }, weakNBT() { return this; } });
    let request = () => { let value = {}; for (let key of ['name','killCount','proudSoul','refineCount']) value[key] = x => { value[key + 'Value'] = x; return value; }; value.build = () => value; return value; };
    let context = vm.createContext({
        console: { log() {} }, Gateway: { customBuilder: gateway },
        ServerEvents: {
            highPriorityData: callback => callback({ addJson: (id, value) => { check(!data.has(id), 'unique resource'); data.set(id, value); } }),
            recipes: callback => callback({ custom: value => addRecipe('custom', [value]), shaped: (...args) => addRecipe('shaped', args), shapeless: (...args) => addRecipe('shapeless', args), recipes: { slashblade: { slashblade_shaped_recipe: (...args) => addRecipe('blade', args) } } })
        },
        Item: { of: item }, Ingredient: { of: value => value }, SlashBladeIngredient: { of: x => x }, SlashBladeRequestDefinition: { newInstance: request },
        $BloodJade: { withKillCount: kills => ({ kills, count: 1, setCount(n) { this.count = n; } }) },
        Utils: { newMap: () => { let m = new Map(); m.put = (k,v) => m.set(k,v); m.containsKey = k => m.has(k); return m; } },
        BlockEvents: { rightClicked: callback => { dimensionCallback = callback; } },
        Color: { WHITE: 'white' }, Text: { of: x => x, translatable: () => ({ append() { return this; }, color() { return this; } }) }
    });
    return { gates, data, recipes, context, run: file => vm.runInContext(read(file), context, { filename: file }), dimension: event => dimensionCallback(event) };
};
let h = harness();
for (let file of [
    'enemy/boss/boss_builder.js', 'enemy/boss/s5_titan_bosses.js', 'enemy/boss/s5_deep_realm_4_bosses.js',
    'enemy/gateways/gateway_helpers.js', 'enemy/gateways/s5_0_gateway_helpers.js',
    'enemy/gateways/s4_sgjourney_gw.js', 'enemy/gateways/s5_titan_gw.js', 'enemy/gateways/s5_deep_realm_4_gw.js',
    'enemy/gateways/limit_gateway_dimension.js', 'recipes/s5_titan.js', 'recipes/s5_deep_realm_4.js'
]) h.run('kubejs/server_scripts/' + file);
let baseline = harness();
let backup = '.sdbf-backups/titan-deep4-2026-11-02/';
for (let relative of ['enemy/gateways/s5_titan_gw.js', 'recipes/s5_titan.js', 'recipes/s5_deep_realm_4.js']) baseline.run(backup + 'kubejs/server_scripts/' + relative);
let bosses = new Map([...h.data].map(([id, value]) => [id.replace(':bosses/', ':').replace(/\.json$/, ''), value]));
let targetGates = [...h.gates].filter(([id]) => id.startsWith('gateways:sdbf_titan_') || id.startsWith('gateways:sdbf_dr4_'));
check(targetGates.length === 11 && bosses.size === 12, 'three Titan + eight Deep4 portals and twelve bosses');
let totals = gate => {
    let result = {};
    for (let [item, n] of [...gate.rewards, ...gate.waves.flatMap(w => w.rewards)]) result[item] = (result[item] || 0) + n;
    return result;
};
let soul = item => item.startsWith('slashblade:proudsoul');
let noSoul = gate => { let value = plain(gate); value.rewards = value.rewards.filter(([id]) => !soul(id)); value.waves.forEach(w => { w.rewards = w.rewards.filter(([id]) => !soul(id)); }); return value; };
for (let tier of ['g1','g2','g3']) {
    let id = 'gateways:sdbf_titan_' + tier, gate = h.gates.get(id), sg = totals(h.gates.get('gateways:sdbf_sgj_abydos_' + (tier === 'g1' ? 'g1' : 'g2')));
    equal(noSoul(gate), noSoul(baseline.gates.get(id)), 'Titan encounters, non-soul rewards, timing and fragments unchanged');
    for (let item of ['slashblade:proudsoul_ingot','slashblade:proudsoul_sphere']) check(totals(gate)[item] === Math.round(sg[item] * 1.2), tier + ': full-clear soul rewards = rounded SG * 1.2');
}
let allItems = new Set(), allEntities = new Set(), report = {};
let mobTypes = read('kubejs/server_scripts/enemy/enemy_attributes_mobs.js');
for (let [id, gate] of targetGates) {
    let tier = id.slice(-2), deep = id.includes('_dr4_'), expectedDim = deep ? 'deeprealm_4th:fourth_layer' : 'titan_moon:titan';
    check(gate.waves.length === ({ g1: 5, g2: 8, g3: 4 })[tier], 'matching wave count ' + id);
    check(gate.settings.removeMobsOnFailure && !gate.settings.allowDimChange, 'cleanup and no mob dimension transfer');
    if (deep) {
        let titan = h.gates.get('gateways:sdbf_titan_' + tier);
        equal(gate.rewards, titan.rewards, 'identical completion reward');
        equal(gate.waves.map(w => w.rewards), titan.waves.map(w => w.rewards), 'identical per-wave rewards, including local supplies');
        equal(gate.loot, titan.loot, 'identical chart completion loot');
        let bossWaves = gate.waves.map((w,i) => w.bosses.length ? i + 1 : 0).filter(Boolean);
        equal(bossWaves, tier === 'g1' ? [5] : [4,8], 'branch checkpoint plan');
    }
    for (let wave of gate.waves) {
        check(wave.entities.reduce((sum,[,n]) => sum + n, 0) + wave.bosses.length <= 10, 'bounded spawn count');
        check(wave.entities.length + wave.bosses.length > 0, 'nonempty wave');
        for (let [entity,n] of wave.entities) { allEntities.add(entity); check(Number.isInteger(n) && n > 0, 'positive mob count'); }
        for (let bossId of wave.bosses) { check(bosses.has(bossId), 'boss reference resolves'); let boss = bosses.get(bossId); equal(boss.dimensions, [expectedDim], 'boss stays in its correct dimension'); allEntities.add(boss.entity); }
        for (let [attribute,,operation] of wave.attributes) if (attribute.endsWith('.attack_damage')) check(operation === 'multiply_base', 'noncompounding attack modifier');
    }
    for (let [item,n] of [...gate.rewards, ...gate.waves.flatMap(w => w.rewards)]) { check(Number.isInteger(n) && n > 0, 'positive integer reward'); allItems.add(item); }
    let recipeId = 'sdbf:' + id.slice('gateways:'.length) + '_s5', recipe = h.recipes.get(recipeId);
    check(recipe && recipe.kind === 'shaped', 'pearl recipe exists');
    let [output,pattern,ingredients] = recipe.args;
    check(output.id === 'gateways:gate_pearl' && output.nbt.includes(id), 'NBT matches registered gate');
    check(pattern.join('') === 'ABABCBABA', 'four outer + four inner + one center');
    for (let item of Object.values(ingredients)) allItems.add(item);
    if (deep) check(ingredients.A === 'deeprealm_4th:star_slurry_blank' || ingredients.C === 'deeprealm_4th:star_slurry', 'recipe requires Deep4 materials');
    for (let right of [true,false]) {
        let blocked = false, cooldown = 0;
        h.dimension({ getItem: () => ({ toString: () => 'gateways:gate_pearl', getNbt: () => ({ contains: () => true, getString: () => id }) }), player: { getLevel: () => ({ dimensionKey: right ? expectedDim : 'minecraft:overworld' }), addItemCooldown: (_,n) => { cooldown = n; }, tell() {} }, cancel: x => { blocked = x; } });
        check(blocked === !right && cooldown === (right ? 0 : 20), 'right and wrong dimension behavior');
    }
    for (let lang of ['zh_cn','en_us']) check(JSON.parse(read('kubejs/assets/kubejs/lang/' + lang + '.json'))[id.replace(':','.')], 'pearl has localized name');
    report[id] = { waves: gate.waves.length, rewards: totals(gate), fragments: gate.loot.length };
}
for (let [id,boss] of bosses) if (id.startsWith('sdbf:deep_realm_4/')) {
    equal(boss.dimensions, ['deeprealm_4th:fourth_layer'], 'Deep4 boss dimension');
    check(boss.min_rarity === 'mythic' && boss.max_rarity === 'mythic', 'fixed mythic rarity');
    check(boss.valid_gear_sets.includes('#the_end'), 'registered equipment set');
    for (let modifier of boss.stats.mythic.attribute_modifiers) if (modifier.attribute.endsWith('.attack_damage')) check(modifier.operation === 'MULTIPLY_BASE', 'boss base attack multiplier');
}
for (let entity of allEntities) check(mobTypes.includes('["' + entity + '",'), 'entity has a stage-aware stat template: ' + entity);
for (let [id, recipe] of baseline.recipes) equal(h.recipes.get(id), recipe, 'all existing Titan and Deep4 recipes preserved');
check(h.recipes.size === baseline.recipes.size + 8, 'only eight Deep4 pearl recipes added');
let gemPaths = ['overworld/earth','overworld/royalty','twilight/forest','twilight/queen'];
for (let relative of gemPaths) {
    let file = 'kubejs/data/apotheosis/gems/' + relative + '.json', fresh = JSON.parse(read(file)), previous = JSON.parse(read(backup + file));
    for (let dimension of previous.dimensions) check(fresh.dimensions.includes(dimension), 'existing gem dimensions retained');
    delete fresh.dimensions; delete previous.dimensions; equal(fresh, previous, 'gem bonuses and weights unchanged');
}
let gems = fs.readdirSync(path.join(root,'kubejs/data/apotheosis/gems'), { recursive: true }).filter(x => x.endsWith('.json')).map(x => [x.replaceAll('\\','/'), JSON.parse(read('kubejs/data/apotheosis/gems/' + x))]);
let dimensionId = s => s.includes(':') ? s : 'minecraft:' + s;
let gemPool = dim => gems.filter(([,g]) => !g.dimensions.length || g.dimensions.some(d => dimensionId(d) === dim)).map(([id]) => id).sort();
equal(gemPool('titan_moon:titan'), gemPool('twilightforest:twilight_forest'), 'Titan uses Twilight pool');
equal(gemPool('deeprealm_4th:fourth_layer'), gemPool('minecraft:overworld'), 'Deep4 uses Overworld pool');
check(gemPool('titan_moon:titan').length === 15 && gemPool('deeprealm_4th:fourth_layer').length === 15, 'thirteen core + two themed gems');
let config = read('config/apotheosis/adventure.cfg');
check(!config.includes('sdbf:deep_realm_level_4'), 'obsolete Deep4 dimension removed');
for (let [section,line] of [['Affix Convert Rarities','deeprealm_4th:fourth_layer|epic|mythic'],['Gem Dimensional Rarities','deeprealm_4th:fourth_layer|mythic|ancient'],['Gem Dimensional Rarities','titan_moon:titan|epic|ancient'],['Boss Spawn Dimensions','deeprealm_4th:fourth_layer|0.05|ANY']]) {
    let block = config.split('S:"' + section + '" <')[1].split('>')[0];check(block.split(/\r?\n/).filter(s => s.trim() === line).length === 1, 'one effective configuration entry');
}
for (let lang of ['zh_cn','en_us']) {
    let file = 'kubejs/assets/kubejs/lang/' + lang + '.json', fresh = JSON.parse(read(file)), previous = JSON.parse(read(backup + file));
    for (let [key,value] of Object.entries(previous)) check(fresh[key] === value, 'existing translation preserved');
}
let out = path.join(root,'docs/archive/titan-deep4-2026-11-02');fs.mkdirSync(out,{ recursive:true });
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({ checks, bosses:Object.fromEntries(bosses), gateways:report, items:[...allItems].sort(), entities:[...allEntities].sort(), gemPools:{ titan:gemPool('titan_moon:titan'), deep4:gemPool('deeprealm_4th:fourth_layer') } },null,2)+'\n');
console.log(`PASS: ${checks} Titan/Deep4 integration checks; 8 new bosses, 8 new pearls, SG-relative rewards, existing recipes and both gem pools verified.`);
