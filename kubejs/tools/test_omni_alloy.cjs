// Exercise the production registration and carrier-validation scripts with
// narrow native API stand-ins. Forge loading is checked separately in game.
let fs = require('node:fs');
let vm = require('node:vm');
let assert = require('node:assert/strict');
let path = require('node:path');
let root = path.resolve(__dirname, '../..');
let read = file => fs.readFileSync(path.join(root, file), 'utf8');
let batches = [];
let registries = {};
let builder = () => new Proxy({}, {get: (_, key) => key === 'bucketItem' ? builder() : () => builder()});
let ctx = vm.createContext({
  global: {},
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
    let recipes = new Map();
    callback({custom: json => ({id: id => {
      assert(!recipes.has(id));
      recipes.set(id, {json});
    }}), shapeless: (output, inputs) => {
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
let catalog = JSON.parse(JSON.stringify(ctx.global.sdbfOmniAlloy));
for (let [kind, ids] of Object.entries(registries)) {
  let spec = catalog.registrations[kind === 'item' ? 'items' : kind === 'block' ? 'blocks' : 'fluids'];
  assert.deepEqual(ids.sort(), Object.keys(spec).sort());
  assert.equal(new Set(ids).size, ids.length);
}
vm.runInContext(read('kubejs/server_scripts/recipes/s5_omni_alloy.js'), ctx);
vm.runInContext(read('kubejs/server_scripts/recipes/s5_omni_alloy.js').replace('let omniValidCarrier', 'omniValidCarrier'), ctx);
assert.equal(batches[0].size, catalog.expected_recipe_ids.length);
assert.deepEqual([...batches[0].keys()].sort(), catalog.expected_recipe_ids.slice().sort());
assert.equal([...batches[0].values()].filter(recipe => recipe.json).length,
  catalog.expected_recipe_ids.length - catalog.packaging.length);
assert.deepEqual([...batches[0].keys()], [...batches[1].keys()]);
let validate = vm.runInContext('omniValidCarrier', ctx);
let tag = data => ({getString: key => data[key] || '', getInt: key => data[key] || 0});
let identifier = good => ({isEmpty: () => !good, isId: () => good});
let list = values => ({isEmpty: () => !values.length, size: () => values.length, get: i => values[i]});
let base = {isEmpty: () => false};
let test = (check, stack, valid) => assert.equal(validate(stack, check), valid, check);
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
let frame = good => ({identifier: () => identifier(good)});
test('developed_film', {...base, getItem: () => ({getStoredFrames: () => list([])})}, false);
test('developed_film', {...base, getItem: () => ({getStoredFrames: () => list([frame(true)])})}, true);
test('developed_film', {...base, getItem: () => ({getStoredFrames: () => list([frame(false)])})}, false);
test('photograph', {...base, getItem: () => ({getIdentifier: () => identifier(true)})}, true);
test('photograph', {...base, getItem: () => ({getIdentifier: () => identifier(false)})}, false);
let photo = good => ({getItem: () => ({getIdentifier: () => identifier(good)}), getItemStack: () => ({})});
let photos = values => ({...base, getItem: () => ({getPhotographs: () => list(values)})});
test('photo_stack', photos([photo(true)]), false);
test('photo_stack', photos([photo(true), photo(true)]), true);
test('photo_stack', photos([photo(true), photo(false)]), false);
assert.throws(() => validate(base, 'unknown'), /Unknown omni carrier check/);
for (let entry of catalog.packaging) {
  let recipe = batches[0].get(entry.recipe);
  assert.equal(recipe.inputs[0], entry.carrier);
  assert.equal(recipe.inputs[1], 'kubejs:omni_process_liner');
  assert.equal(recipe.modify({find: () => ({isEmpty: () => true})}, {} ).id, 'minecraft:air');
}
console.log(`PASS: embedded startup registrations, ${batches[0].size} inline recipes across two reloads, carrier state rejection/acceptance`);
