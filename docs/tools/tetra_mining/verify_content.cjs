const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { root, records } = require('./audit_materials.cjs');
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const before = JSON.parse(read('.sdbf-backups/tetra-mining-2026-11-02/module-baseline.json'));
const current = Object.fromEntries(Object.keys(before).map(key => [key, JSON.parse(read('kubejs/data/tetra/modules/' + key + '.json'))]));
const withoutSpeed = data => {
    data = JSON.parse(JSON.stringify(data));
    for (const variant of data.variants) for (const key of ['primaryAttributes','secondaryAttributes','tertiaryAttributes']) {
        const attributes = variant.extract?.[key];
        if (attributes) { delete attributes['generic.attack_speed']; if (!Object.keys(attributes).length) delete variant.extract[key]; }
    }
    return data;
};
for (const key of Object.keys(before)) {
    assert.deepEqual(withoutSpeed(current[key]), withoutSpeed(before[key]), 'all non-speed stats preserved: ' + key); checks++;
}
const value = record => record.data;
const byKey = name => value(records.find(record => record.data.key === name));
const allows = (variant, material) => variant.materials?.some(prefix => prefix === 'tetra:' + material.category + '/' || prefix === 'tetra:' + material.category + '/' + material.key);
const variantFor = (module, material) => module.variants.find(variant => allows(variant, material));
const speed = (variant, material) => (variant.attributes?.['generic.attack_speed'] || 0)
    + ['primary','secondary','tertiary'].reduce((sum,key) => sum + (variant.extract?.[key + 'Attributes']?.['generic.attack_speed'] || 0) * (material[key] || 0), 0);
const rawEfficiency = (variant, material, action) => {
    const extraction = variant.extract?.tools?.[action];
    const base = variant.tools?.[action];
    return (Array.isArray(base) ? base[1] : 0) + (Array.isArray(extraction) ? extraction[1] : 0) * material.toolEfficiency;
};
const predict = (modules, headKey, head, handle, binding, action, single = false) => {
    const hv = variantFor(modules[headKey], head), shaft = modules[single ? 'single/basic_handle' : 'double/basic_handle'];
    const bind = modules[single ? 'single/binding' : 'double/binding'];
    const attackSpeed = 4 + speed(hv, head) * (single ? 1 : 2) + speed(variantFor(shaft, handle), handle) + speed(variantFor(bind, binding), binding);
    // Upstream getAttackSpeedHarvestModifier(s)=0.5*s+0.5; getDestroySpeed floors at 1.
    return { attackSpeed, destroySpeed: Math.max(1, rawEfficiency(hv, head, action) * (attackSpeed * 0.5 + 0.5)) };
};
const shafts = records.map(value).filter(material => allows(current['double/basic_handle'].variants[0], material));
const bindings = records.map(value).filter(material => allows(current['double/binding'].variants[0], material));
const heads = records.filter(record => record.stage !== null && record.data.toolEfficiency > 0 && variantFor(current['double/basic_pickaxe'], record.data));
let worst = Infinity;
for (const { data:head } of heads) for (const handle of shafts) for (const binding of bindings) {
    const result = predict(current, 'double/basic_pickaxe', head, handle, binding, 'pickaxe_dig');
    check(result.attackSpeed > 0 && result.destroySpeed > 1, 'all staged pickaxe/shaft/binding combinations stay above bare hands');
    worst = Math.min(worst, result.destroySpeed);
}
for (const [key,action] of [['double/basic_axe','axe_dig'],['double/basic_hammer','hammer_dig'],['double/adze','axe_dig'],['double/claw','pry'],['double/hoe','hoe_dig'],['double/sickle','hoe_dig'],['single/basic_shovel','shovel_dig'],['single/unbound_earthpiercer','pickaxe_dig']]) {
    for (const record of records.filter(record => record.stage >= 4)) {
        const material = record.data;
        if (!variantFor(current[key], material)) continue;
        const handle = variantFor(current[key.startsWith('single/') ? 'single/basic_handle' : 'double/basic_handle'], material) ? material : byKey('oak');
        const result = predict(current,key,material,handle,byKey('tholin_fibre'),action,key.startsWith('single/'));
        check(result.attackSpeed > 0 && result.destroySpeed > 1, 'late mining roles remain usable: ' + key + '/' + material.key);
    }
}
const examples = [];
for (const name of ['iron','naquadah','celestial_filling_alloy_ingot','meteoric_iron_ingot','titan-ii_composite_ingot','unmelting_ice','gate_fragment']) {
    const material = byKey(name), binding = name === 'iron' ? byKey('string') : byKey('tholin_fibre');
    const handle = variantFor(current['double/basic_handle'], material) ? material : byKey('oak');
    const old = predict(before,'double/basic_pickaxe',material,handle,binding,'pickaxe_dig');
    const updated = predict(current,'double/basic_pickaxe',material,handle,binding,'pickaxe_dig');
    examples.push({ material:name, old, updated });
    if (name !== 'iron') check(updated.destroySpeed > old.destroySpeed * 3, 'late representative speed improves substantially');
}

// Execute the actual tooltip registration and confirm only the ordinary can receives this warning.
const additions = [];
const text = (key, content) => { const value = { key, content }; for (const method of ['color','append','bold','italic','underlined','withStyle']) value[method] = () => value; return value; };
const tooltip = vm.createContext({
    ItemEvents: { tooltip: callback => callback({ add: (items, line) => additions.push([items,line]), addAdvanced() {} }) },
    Text: { translatable: key => text(key), of: value => text(null,value) }, Color: {},
    Ingredient: { of: () => ({ test: () => false }) }
});
vm.runInContext(read('kubejs/client_scripts/tooltips.js'), tooltip);
const warnings = additions.filter(([,line]) => line.key === 'info.kubejs.oxygen_can_hot_planets');
check(warnings.length === 1 && warnings[0][0] === 'ad_astra_giselle_addon:oxygen_can', 'warning applies only to ordinary oxygen can');
const language = JSON.parse(read('kubejs/assets/kubejs/lang/zh_cn.json'));
check(['水星','金星','下界合金'].every(word => language['info.kubejs.oxygen_can_hot_planets'].includes(word)), 'warning names both planets and upgrade');

// Cross-check the exact JSON recipe, including the fluid tag and net-positive propagation output.
const recipes = new Map();
const recipe = json => ({ id: id => recipes.set(id,json) });
const request = () => { const value={};for(const method of ['name','killCount','proudSoul','refineCount','build'])value[method]=()=>value;return value; };
const context=vm.createContext({ ServerEvents:{recipes:callback=>callback({ custom:recipe,shaped:()=>recipe(null),shapeless:()=>recipe(null),recipes:{slashblade:{slashblade_shaped_recipe:()=>recipe(null)}} })},Item:{of:()=>({})},SlashBladeIngredient:{of:x=>x},SlashBladeRequestDefinition:{newInstance:request} });
vm.runInContext(read('kubejs/server_scripts/recipes/s5_titan.js'),context);
const growth=recipes.get('sdbf:branch_crystal_hydrogen_propagation_s5');
check(growth?.type==='thermal:insolator','uses the organic infuser');
check(growth.ingredients.length===2&&growth.ingredients[0].item==='titan_moon:branch_crystal','requires an existing specimen');
check(growth.ingredients[1].fluid_tag==='forge:hydrogen'&&growth.ingredients[1].amount===1000,'uses 1000 mB hydrogen by fluid tag');
check(growth.result[0].item==='titan_moon:branch_crystal'&&growth.result[0].chance===2&&growth.energy===16000,'two growth outputs and 16000 RF');
const result={checks,materials:records.length,pickaxeCombinationMinimum:worst,examples};
fs.writeFileSync(path.join(root,'docs/archive/tetra-mining-2026-11-02/mining-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log('PASS:',checks,'material/module/tooltip/recipe checks.');
console.log(JSON.stringify(examples,null,2));
