// Exercise the production registration and carrier-validation scripts with
// narrow native API stand-ins. Forge loading is checked separately in game.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const catalog = JSON.parse(read('kubejs/config/omni_alloy.json'));
const batches = [];
const registries = {};
const builder = () => new Proxy({}, {get: () => () => builder()});
const ctx = vm.createContext({
  global: {},
  JsonIO: {read: () => catalog},
  StartupEvents: {registry: (kind, callback) => {
    registries[kind] = [];
    callback({create: id => {registries[kind].push(id); return builder();}});
  }},
  Java: {loadClass: name => {
    assert.equal(name, 'me.desht.pneumaticcraft.common.block.entity.UVLightBoxBlockEntity');
    return {getExposureProgress: stack => stack.exposure || 0};
  }},
  Item: {of: id => ({id, isEmpty: () => id === 'minecraft:air'})},
  ServerEvents: {recipes: callback => {
    const recipes = new Map();
    callback({shapeless: (output, inputs) => {
      let modify;
      return {modifyResult: fn => {
        modify = fn;
        return {id: id => {
          assert(!recipes.has(id));
          recipes.set(id, {output, inputs, modify});
        }};
      }};
    }});
    batches.push(recipes);
  }}
});
vm.runInContext(read('kubejs/startup_scripts/omni_alloy.js'), ctx);
for (const [kind, ids] of Object.entries(registries)) {
  const spec = catalog.registrations[kind === 'item' ? 'items' : kind === 'block' ? 'blocks' : 'fluids'];
  assert.deepEqual(ids.sort(), Object.keys(spec).sort());
  assert.equal(new Set(ids).size, ids.length);
}
vm.runInContext(read('kubejs/server_scripts/recipes/s5_omni_alloy.js'), ctx);
vm.runInContext(read('kubejs/server_scripts/recipes/s5_omni_alloy.js').replace('let omniValidCarrier', 'omniValidCarrier'), ctx);
assert.equal(batches[0].size, catalog.packaging.length);
assert.deepEqual([...batches[0].keys()], [...batches[1].keys()]);
const validate = vm.runInContext('omniValidCarrier', ctx);
const tag = data => ({getString: key => data[key] || '', getInt: key => data[key] || 0});
const identifier = good => ({isEmpty: () => !good, isId: () => good});
const list = values => ({isEmpty: () => !values.length, size: () => values.length, get: i => values[i]});
const base = {isEmpty: () => false};
const test = (check, stack, valid) => assert.equal(validate(stack, check), valid, check);
test('none', {isEmpty: () => true}, false);
test('none', base, true);
test('uv_full', {...base, exposure: 99}, false);
test('uv_full', {...base, exposure: 100}, true);
test('brew_absorption', {...base, nbt: tag({brewKey: 'botania:absorption'}), getItem: () => ({getSwigsLeft: () => 4})}, true);
test('brew_absorption', {...base, nbt: tag({brewKey: 'botania:absorption'}), getItem: () => ({getSwigsLeft: () => 3})}, false);
test('brew_absorption', {...base, nbt: tag({brewKey: 'botania:speed'})}, false);
test('strong_swiftness', {...base, nbt: tag({Potion: 'minecraft:strong_swiftness'})}, true);
test('strong_swiftness', {...base, nbt: tag({Potion: 'minecraft:swiftness'})}, false);
test('strong_swiftness', base, false);
const frame = good => ({identifier: () => identifier(good)});
test('developed_film', {...base, getItem: () => ({getStoredFrames: () => list([])})}, false);
test('developed_film', {...base, getItem: () => ({getStoredFrames: () => list([frame(true)])})}, true);
test('developed_film', {...base, getItem: () => ({getStoredFrames: () => list([frame(false)])})}, false);
test('photograph', {...base, getItem: () => ({getIdentifier: () => identifier(true)})}, true);
test('photograph', {...base, getItem: () => ({getIdentifier: () => identifier(false)})}, false);
const photo = good => ({getItem: () => ({getIdentifier: () => identifier(good)}), getItemStack: () => ({})});
const photos = values => ({...base, getItem: () => ({getPhotographs: () => list(values)})});
test('photo_stack', photos([photo(true)]), false);
test('photo_stack', photos([photo(true), photo(true)]), true);
test('photo_stack', photos([photo(true), photo(false)]), false);
assert.throws(() => validate(base, 'unknown'), /Unknown omni carrier check/);
for (const entry of catalog.packaging) {
  const recipe = batches[0].get(entry.recipe);
  assert.equal(recipe.inputs[0], entry.carrier);
  assert.equal(recipe.inputs[1], 'kubejs:omni_process_liner');
  assert.equal(recipe.modify({find: () => ({isEmpty: () => true})}, {} ).id, 'minecraft:air');
}
console.log(`PASS: startup registrations, ${catalog.packaging.length} packaging recipes across two reloads, carrier state rejection/acceptance`);
