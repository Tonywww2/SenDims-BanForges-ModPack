// Survival recipes; all removals belong to recipes/remove.js.
; (() => {
  let A = global.sdbfAstral, P = A.processing;
  ServerEvents.recipes(event => {
    if (!A.apiReady) return;
    let stack = (item, count) => ({ item: item, count: count || 1 });
    let materialInputs = rows => {
      let inputs = [];
      rows.forEach(row => {
        let remaining = row[1];
        while (remaining > 0) { let amount = Math.min(64, remaining); inputs.push({ stack: stack(P.materials[row[0]], amount), data_predicate: 'sdbf:astral_material', exact_data: false }); remaining -= amount; }
      });
      if (inputs.length > 12) throw new Error('Astral forging exceeds twelve input slots'); return inputs;
    };
    let forging = (id, result, ingredients, clicks, transform) => {
      let json = { type: 'deeprealm_4th:combination_forging', result: result, ingredients: ingredients, clicks: clicks, cooldown: 5, levels: 0 };
      if (transform) json.data_transform = transform; event.custom(json).id('sdbf:astral/' + id);
    };
    let machine = (id, result, rows, pressure) => {
      let inputs = [];
      rows.forEach(row => {
        let remaining = row[1];
        while (remaining > 0) { let amount = Math.min(64, remaining); inputs.push({ type: 'pneumaticcraft:stacked_item', item: P.materials[row[0]], count: amount }); remaining -= amount; }
      });
      event.custom({ type: 'pneumaticcraft:pressure_chamber', inputs: inputs, pressure: pressure, results: [result] }).id('sdbf:astral/' + id + '_pressure');
    };
    event.shaped('deeprealm_4th:base_container', ['AGA', 'GMG', 'AGA'], {
      A: 'minecraft:amethyst_shard', G: P.materials.iron, M: P.materials.star
    }).id('sdbf:astral/base_container');
    forging('empty_badge', stack(A.badgeId), materialInputs([['alloy', 1], ['sheet', 1], ['solid', 1], ['lens', 1]]), 2);
    Object.keys(P.tiers).forEach(tier => {
      let rule = P.manufacture[tier], item = P.tiers[tier].id;
      forging('agent_' + tier, stack(item, rule.count), materialInputs(rule.inputs), rule.clicks);
      machine('agent_' + tier, stack(item, rule.machine.count), rule.machine.inputs, rule.machine.pressure);
    });
    Object.keys(P.soulRefining).forEach(kind => {
      let rule = P.soulRefining[kind]; forging('soul_' + kind, stack(P.materials[kind]), materialInputs(rule.inputs), rule.clicks);
    });
    Object.keys(P.enhancements).forEach(kind => {
      let item = P.enhancements[kind].id, rows = P.reinforcementRecipes[kind];
      forging('enhancement_' + kind, stack(item, 2), materialInputs(rows), 2);
      let machineRows = rows.map(row => [row[0], row[1] * (['ingot', 'sphere', 'crystal'].indexOf(row[0]) >= 0 ? 4 : 3)]);
      machine('enhancement_' + kind, stack(item, 8), machineRows, 2.5);
    });
  });
})();
