// 星界躯体 → 星界卢恩／星界框架：配方结构与填充物迁移检查（不需要游戏）。
// node docs/tools/astral_gems/verify_container_upgrade.js
let fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
let root = path.resolve(__dirname, '../../..');
let read = file => fs.readFileSync(path.join(root, file), 'utf8');

// ---- NBT / ItemStack stand-ins (same calls the script makes in game) ----
class CompoundTag {
  constructor(d) { this.d = d || {}; }
  contains(k, type) { let v = this.d[k]; return v !== undefined && (type !== 10 || v instanceof CompoundTag); }
  getCompound(k) { return this.d[k] instanceof CompoundTag ? this.d[k] : new CompoundTag(); }
  getInt(k) { return typeof this.d[k] === 'number' ? this.d[k] : 0; }
  getList(k) { return this.d[k] instanceof ListTag ? this.d[k] : new ListTag(); }
  putInt(k, v) { this.d[k] = v; }
  put(k, v) { this.d[k] = v; }
  copy() { let d = {}; for (let k of Object.keys(this.d)) d[k] = this.d[k] && this.d[k].copy ? this.d[k].copy() : this.d[k]; return new CompoundTag(d); }
}
class ListTag {
  constructor(a) { this.a = a || []; }
  size() { return this.a.length; }
  getCompound(i) { return this.a[i]; }
  add(t) { this.a.push(t); return true; }
  copy() { return new ListTag(this.a.map(t => t.copy())); }
}
let ItemStack = { of: tag => ({ isEmpty: () => !tag.d.id || tag.d.id === 'minecraft:air' }) };
class Stack {
  constructor(id, tag) { this.id = id; this.tag = tag || null; }
  getTag() { return this.tag; }
  getOrCreateTag() { if (!this.tag) this.tag = new CompoundTag(); return this.tag; }
  copyWithCount() { return new Stack(this.id, this.tag ? this.tag.copy() : null); }
  isEmpty() { return false; }
}
let gem = n => new CompoundTag({ id: 'kubejs:astral_gem_filler', Count: 1, tag: new CompoundTag({ uid: n }) });
let body = (entries, overflow, size) => {
  let rootTag = new CompoundTag({ Version: 1, Size: size || 20, Items: new ListTag(entries.map(([slot, n]) => new CompoundTag({ Slot: slot, Stack: gem(n) }))) });
  if (overflow) rootTag.put('Overflow', new ListTag(overflow.map(gem)));
  return new Stack('deeprealm_4th:base_container', new CompoundTag({ AstralContainer: rootTag }));
};

// ---- load the real scripts ----
let predicates = {}, transforms = {};
let A = { apiReady: true, itemId: stack => stack.id };
let scope = {
  global: { sdbfAstral: A }, console, Math, Object, JSON, String, Error,
  StartupEvents: { registry: () => {} }, AstralContainers: { create: () => ({}) },
  Java: { loadClass: name => ({ 'net.minecraft.nbt.CompoundTag': CompoundTag, 'net.minecraft.nbt.ListTag': ListTag, 'net.minecraft.world.item.ItemStack': ItemStack })[name] },
  AstralDataPredicates: { register: (id, fn) => { predicates[id] = fn; } },
  AstralTransforms: {
    register: (id, matches, preview, produce) => { transforms[id] = { matches, preview, produce }; },
    previewItem: s => ({ ok: true, stack: s }), producedItem: s => ({ ok: true, stack: s }),
    failedPreview: e => ({ ok: false, error: e }), failedProduce: e => ({ ok: false, error: e })
  }
};
vm.createContext(scope);
vm.runInContext(read('kubejs/startup_scripts/astral_gems/17_containers.js'), scope);
vm.runInContext(read('kubejs/startup_scripts/astral_gems/35_container_upgrade.js'), scope);
let U = A.containerUpgrade, C = A.containers;
let checks = 0, ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// What the mod would show after loading the result (AstralStoredItems.projected, non-legacy size).
let stored = (stack, layout) => {
  let rootTag = stack.getTag().getCompound('AstralContainer');
  ok(rootTag.getInt('Size') === layout.width * layout.height, 'Size is the physical cell count');
  let cells = rootTag.getList('Items').a.map(e => ({ slot: e.getInt('Slot'), uid: e.getCompound('Stack').getCompound('tag').getInt('uid') }));
  let overflow = rootTag.getList('Overflow').a.map(t => t.getCompound('tag').getInt('uid'));
  return { cells, overflow };
};
let openSlot = (layout, slot) => U.open(layout, slot % layout.width, Math.floor(slot / layout.width));

// 1. Offsets: rune keeps the whole 4×5 block; frame keeps 18 of 20 positions.
ok(JSON.stringify([U.offset(C.rune).x, U.offset(C.rune).y, U.offset(C.rune).fit]) === '[1,0,20]', 'rune offset (1,0), all 20 cells fit');
ok(JSON.stringify([U.offset(C.frame).x, U.offset(C.frame).y, U.offset(C.frame).fit]) === '[3,1,18]', 'frame offset (3,1), 18 cells fit');

// 2. Full body → rune: every gem keeps its relative position.
let full = body(Array.from({ length: 20 }, (_, i) => [i, 100 + i]));
let rune = U.upgrade(full, new Stack(C.rune.id));
let r = stored(rune, C.rune);
ok(r.cells.length === 20 && r.overflow.length === 0, 'rune holds all 20 gems');
ok(r.cells.every(c => { let i = c.uid - 100; return c.slot === (Math.floor(i / 4)) * 6 + (i % 4) + 1; }), 'rune keeps the 4×5 arrangement shifted one column');
ok(full.getTag().getCompound('AstralContainer').getList('Items').size() === 20, 'source body is not modified');

// 3. Full body → frame: 18 keep position, 2 move to the nearest free open cells.
let frame = U.upgrade(full, new Stack(C.frame.id));
let f = stored(frame, C.frame);
ok(f.cells.length === 20 && f.overflow.length === 0, 'frame holds all 20 gems');
ok(f.cells.every(c => openSlot(C.frame, c.slot)), 'no gem lands in a closed frame cell');
ok(new Set(f.cells.map(c => c.slot)).size === 20, 'no two gems share a cell');
let kept = f.cells.filter(c => { let i = c.uid - 100; return c.slot === (Math.floor(i / 4) + 1) * 10 + (i % 4) + 3; });
ok(kept.length === 18, 'frame keeps 18 relative positions');

// 4. Legacy 12×9 storage, a bad slot, a duplicate slot and saved overflow: nothing is lost.
let legacy = body([[2 * 12 + 4, 1], [3 * 12 + 5, 2], [0, 3], [2 * 12 + 4, 4]], [5, 6], 108);
let lr = stored(U.upgrade(legacy, new Stack(C.rune.id)), C.rune);
ok(lr.cells.length === 6 && lr.overflow.length === 0, 'legacy body: all 6 gems carried');
ok(lr.cells.find(c => c.uid === 1).slot === 1 && lr.cells.find(c => c.uid === 2).slot === 6 + 2, 'legacy slots are converted like the mod does');
ok(lr.cells.every(c => openSlot(C.rune, c.slot)), 'loose gems go to open cells');

// 5. More gems than cells (old overflow): the rest stays in Overflow for the mod to return later.
let crowded = body(Array.from({ length: 20 }, (_, i) => [i, i]), Array.from({ length: 20 }, (_, i) => 50 + i));
let cr = stored(U.upgrade(crowded, new Stack(C.frame.id)), C.frame);
ok(cr.cells.length === 36 && cr.overflow.length === 4, '36 placed, 4 kept in Overflow');
ok(new Set(cr.cells.map(c => c.uid).concat(cr.overflow)).size === 40, 'every one of the 40 gems is still present');

// 6. Empty body → clean container; transform wiring and predicate.
ok(U.upgrade(new Stack('deeprealm_4th:base_container'), new Stack(C.rune.id)).getTag() === null, 'empty body gives a clean container');
let t = transforms['sdbf:astral_container_upgrade'], ctx = (src, tpl) => ({ source: n => n === 'body' ? src : null, template: () => tpl });
ok(t && t.matches(ctx(full, new Stack(C.frame.id))) === true, 'transform accepts body → frame');
ok(t.matches(ctx(new Stack('minecraft:dirt'), new Stack(C.frame.id))) === false, 'transform rejects other items');
let produced = t.produce(ctx(full, new Stack(C.rune.id)));
ok(produced.ok && produced.stack.id === C.rune.id && stored(produced.stack, C.rune).cells.length === 20, 'produce returns the filled rune');
ok(t.preview(ctx(full, new Stack('kubejs:astral_gem_filler'))).ok === false, 'preview fails cleanly on a wrong template');
ok(predicates['sdbf:astral_upgradable_body'](full) && !predicates['sdbf:astral_upgradable_body'](new Stack(C.rune.id)), 'only the base body is accepted');

// 7. Recipes: structure accepted by the mod's serializer (1–12 inputs, counts ≤ 64, named body input).
let recipes = {};
let rscope = {
  global: { sdbfAstral: { apiReady: true, species: [], containers: C, badgeId: 'kubejs:astral_gem_badge' } }, console, Math, Object, JSON, String, Error,
  ServerEvents: { recipes: cb => cb({ custom: json => ({ id: id => { recipes[id] = json; } }), shaped: () => ({ id: () => {} }) }) }
};
vm.createContext(rscope);
vm.runInContext(read('kubejs/startup_scripts/astral_gems/13_processing_config.js'), rscope);
vm.runInContext(read('kubejs/server_scripts/recipes/astral_gems.js'), rscope);
for (let kind of ['rune', 'frame']) {
  let json = recipes['sdbf:astral/container_' + kind];
  ok(!!json && json.type === 'deeprealm_4th:combination_forging' && json.result.item === C[kind].id, kind + ' recipe registered');
  ok(json.ingredients.length >= 1 && json.ingredients.length <= 12, kind + ': 1–12 inputs');
  ok(json.ingredients.every(i => (i.stack.count || 1) <= 64), kind + ': every input fits one slot');
  let first = json.ingredients[0];
  ok(first.name === 'body' && first.stack.item === 'deeprealm_4th:base_container' && first.exact_data === false && first.data_predicate === 'sdbf:astral_upgradable_body', kind + ': body input named for the transform');
  ok(json.data_transform === 'sdbf:astral_container_upgrade' && json.clicks === 6 && json.levels === 30, kind + ': transform, 6 clicks, 30 levels');
  ok(json.ingredients.some(i => i.stack.item === 'elder_bosses:gate_fragment' && i.stack.count === 2), kind + ': two gate fragments');
}
ok(recipes['sdbf:astral/container_rune'].ingredients.some(i => i.stack.item === 'elder_bosses:rune_fragment'), 'rune uses a rune fragment');
ok(recipes['sdbf:astral/container_frame'].ingredients.some(i => i.stack.item === 'deeprealm_4th:projection_frame' && i.stack.count === 4), 'frame uses four projection frames');
console.log('PASS: ' + checks + ' checks (offsets, rune/frame carry-over, legacy and overflow, transform wiring, recipes)');
