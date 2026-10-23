// Verify the real display registration, including synchronization and native input directions.
let fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
let {A, scope} = require('./verify_processing.js');
let root = path.resolve(__dirname, '../../..');
let lang = JSON.parse(fs.readFileSync(path.join(root, 'kubejs/assets/sdbf_astral/lang/zh_cn.json'), 'utf8'));
let synced = false, listener, missing = new Set();
let originalJava = scope.Java, originalItem = scope.Item;
class DisplayList extends Array {
  removeIf(predicate) {let changed = false; for (let i = this.length - 1; i >= 0; i--) if (predicate(this[i])) {this.splice(i, 1); changed = true;} return changed;}
}
let builtIn = {lang: () => 'jei.stacking.blood_jade'};
let stackData = {AllData: new DisplayList(), register: (key, carried, target) => {
  stackData.AllData.push({lang: () => key, putIngredient: () => carried, targetItem: () => target});
}};
stackData.AllData.push(builtIn);
Object.assign(scope, {
  Java: {loadClass: name => {
    if (name === 'com.tonywww.slashblade_sendims.compat.jei.StackData') {assert(synced, 'defer registry-dependent class until recipe synchronization'); return stackData;}
    if (name === 'net.minecraftforge.client.event.RecipesUpdatedEvent') return name;
    return originalJava.loadClass(name);
  }},
  Item: {of: originalItem.of, exists: id => !missing.has(id)},
  Ingredient: {of: value => ({items: (Array.isArray(value) ? value : [value]).map(item => typeof item === 'string' ? originalItem.of(item) : item)})},
  NativeEvents: {onEvent: (priority, receiveCanceled, type, callback) => {
    assert.equal(priority, 'HIGHEST'); assert.equal(receiveCanceled, false);
    assert.equal(type, 'net.minecraftforge.client.event.RecipesUpdatedEvent'); listener = callback;
  }}
});
vm.runInContext('Math.random=()=>{throw new Error("JEI displays must not roll real gems");}', scope);
vm.runInContext(fs.readFileSync(path.join(root, 'kubejs/client_scripts/astral_gem_stacking_jei.js'), 'utf8'), scope);
assert(listener); assert.deepEqual([...stackData.AllData], [builtIn], 'loading scripts alone adds no display');
synced = true; listener({});
let displays = () => stackData.AllData.filter(row => row.lang().startsWith('jei.sdbf_astral.'));
let rows = displays(); assert.equal(rows.length, 247); assert(stackData.AllData.includes(builtIn));
let count = key => rows.filter(row => row.lang() === 'jei.sdbf_astral.' + key).length;
assert.equal(count('process'), 34); assert.equal(count('filler'), 34); assert.equal(count('embed'), 34); assert.equal(count('extract'), 1);
for (let kind of Object.keys(A.processing.enhancements)) assert.equal(count('enhancement.' + kind), 36);
for (let row of rows) {
  assert(lang[row.lang()], 'approved translation exists: ' + row.lang());
  let target = row.targetItem(), carried = row.putIngredient().items;
  if (row.lang().endsWith('.process')) {
    assert(!A.hasGemData(target));
    let applicable = Object.keys(A.processing.tiers).filter(tier => A.canProcess(A.itemId(target), tier)).map(tier => A.processing.tiers[tier].id);
    assert.deepEqual(Array.from(carried, item => A.itemId(item)), applicable);
  } else if (row.lang().endsWith('.extract')) {
    assert(target.isEmpty(), 'extraction targets an empty slot'); assert.equal(carried.length, 34);
    assert(carried.every(item => A.itemId(item) === A.badgeId && A.read(item).payload));
  } else {
    let parsed = A.read(target); assert(parsed.payload, 'processed example has valid new data');
    assert.equal(A.enhancementUses(parsed.payload), 0);
    if (row.lang().endsWith('.filler')) {assert.equal(A.itemId(carried[0]), 'minecraft:paper'); assert.equal(A.itemId(target), parsed.payload.source_item);}
    if (row.lang().endsWith('.embed')) {assert.equal(A.itemId(carried[0]), A.badgeId); assert(!A.hasGemData(carried[0])); assert.equal(A.itemId(target), parsed.payload.source_item);}
    if (row.lang().includes('.enhancement.')) {
      let kind = row.lang().split('.').at(-1); assert.equal(A.itemId(carried[0]), A.processing.enhancements[kind].id);
      assert(A.enhanceData(parsed.payload, kind, 0), 'enhancement example is applicable');
    }
  }
}
listener({}); assert.equal(displays().length, 247, 'resynchronization does not duplicate displays'); assert(stackData.AllData.includes(builtIn));
missing.add('thermal:apatite'); missing.add('thermal:cinnabar'); missing.add('thermal:niter');
listener({}); assert.equal(displays().length, 226, 'missing registry entries add no empty gem displays'); assert(stackData.AllData.includes(builtIn));
console.log('PASS: 247 native Sendims stacking displays; all gem species, tier coverage, three enhancement target forms, valid NBT examples, empty extraction target, approved copy, deferred registration, no random draws, reload deduplication and preserved mod displays.');
