// priority: 1730
// Pure generation and enhancement operations; no inventory edits or random preview.
; (() => {
  let A = global.sdbfAstral;
  A.canProcess = (item, tier) => !!A.processing.tiers[tier] && !!A.gemTiers[item] && A.gemTiers[item] <= A.processing.tiers[tier].rank;
  A.dimensionSuccess = (profile, luck) => {
    let config = A.processing.dimensionRoll, value = Number(luck || 0);
    if (!Number.isFinite(value)) value = 0;
    return profile.baseSuccess + config.luckSuccessBonus * value / (config.luckScale + Math.abs(value));
  };
  A.sampleDimension = (profile, random, luck) => {
    let range = A.processing.dimensionRoll.range, success = A.dimensionSuccess(profile, luck);
    let u = Math.max(0, Math.min(1, random()));
    // Bound the logarithmic draw before taking the square root, as in the old generator.
    let lower = Math.pow(success, (range - 1) / 2);
    let target = Math.log(lower + (1 - lower) * u) / Math.log(success);
    return (Math.sqrt(1 + 8 * range * target) - 1) / (2 * (range - 1));
  };
  A.rollGem = (item, tier, random, luck) => {
    if (!A.canProcess(item, tier)) throw new Error('inapplicable_agent');
    let rng = random || Math.random, profile = A.processing.tiers[tier], rules = A.byItem[item];
    let primary = rules[Math.min(rules.length - 1, Math.floor(rng() * rules.length))].primary;
    let data = { schema: 1, source_item: item, primary: primary, natural: {}, affixes: [], reinforcements: [], extensions: null };
    A.stats.forEach(stat => {
      let limit = A.limits[stat], value = A.sampleDimension(profile, rng, luck);
      // Equal-width integer bins retain every natural value, including both endpoints.
      data.natural[stat] = Math.min(limit, 1 + Math.floor(limit * value));
    });
    let count = 1; for (let i = 0; i < 4; i++)if (rng() < profile.extraAffix) count++;
    for (let i = 0; i < count; i++) {
      let stat = A.stats[Math.min(2, Math.floor(rng() * 3))], operation = rng() < 0.5 ? 'flat' : 'percent';
      let positive = rng() < profile.positiveAffix;
      let bound = operation === 'percent' ? 0.25 : A.limits[stat] / 10;
      let magnitude = Math.pow(Math.max(1e-15, Math.min(1 - 1e-15, rng())), positive ? profile.affixPower : A.processing.negativeAffixPower);
      data.affixes.push({ stat: stat, operation: operation, value: bound * magnitude * (positive ? 1 : -0.5) });
    }
    let error = A.validate(data); if (error) throw new Error(error); return data;
  };
  A.enhanceData = (data, kind, used) => {
    let config = A.processing.enhancements[kind], limit = A.balance.enhancementMaxUses;
    if (!config) throw new Error('unknown_enhancement');
    if (!Number.isInteger(used) || used < 0) throw new Error('invalid_enhancement_count');
    if (!Number.isInteger(limit) || limit < 0) throw new Error('invalid_enhancement_limit');
    if (used >= limit) throw new Error('enhancement_limit');
    let result = {
      schema: data.schema, source_item: data.source_item, primary: data.primary, natural: Object.assign({}, data.natural),
      affixes: data.affixes.map(a => Object.assign({}, a)), reinforcements: data.reinforcements.map(a => Object.assign({}, a)), extensions: data.extensions
    };
    if (kind === 'cleanse') {
      if (!result.affixes.some(a => a.value < 0)) throw new Error('no_negative_affixes');
      result.affixes = result.affixes.filter(a => a.value >= 0);
    } else result.reinforcements.push({ stat: config.stat, operation: 'flat', value: config.value });
    let error = A.validate(result); if (error) throw new Error(error); return result;
  };
})();
