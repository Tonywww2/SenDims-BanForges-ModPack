// priority: 1770
// Survival processing configuration. Recipe counts and generation parameters live here.
; (() => {
  let A = global.sdbfAstral;
  A.processing = {
    generationEnabled: true,
    generationVersion: 2,
    interaction: {
      cooldownTicks: 5, successSound: 'minecraft:block.amethyst_block.chime', failureSound: 'minecraft:block.note_block.bass',
      volume: 0.7, successPitch: 1.2, failurePitch: 0.7
    },
    dimensionRoll: { range: 500, luckScale: 100, luckSuccessBonus: 0.001 },
    negativeAffixPower: 2,
    tiers: {
      low: { rank: 1, id: 'kubejs:astral_gem_agent_low', extraAffix: 0.25, positiveAffix: 0.55, affixPower: 3, baseSuccess: 0.95 },
      mid: { rank: 2, id: 'kubejs:astral_gem_agent_mid', extraAffix: 0.50, positiveAffix: 0.70, affixPower: 2, baseSuccess: 0.97 },
      high: { rank: 3, id: 'kubejs:astral_gem_agent_high', extraAffix: 0.75, positiveAffix: 0.85, affixPower: 1, baseSuccess: 0.98 }
    },
    enhancements: {
      cleanse: { id: 'kubejs:astral_gem_cleanser' },
      size: { id: 'kubejs:astral_gem_shaper', stat: 'size', value: 10 },
      purity: { id: 'kubejs:astral_gem_purifier', stat: 'purity', value: 4 },
      polish: { id: 'kubejs:astral_gem_polisher', stat: 'polish', value: 2 }
    },
    materials: {
      iron: 'titan_moon:meteoric_iron_ingot', carapace: 'titan_moon:cryo_carapace', silk: 'titan_moon:tholin_silk_sac',
      membrane: 'titan_moon:aero_membrane', neural: 'titan_moon:tough_neural_gland', gland: 'titan_moon:toxic_gland',
      alloy: 'titan_moon:cryo_alloy_ingot', sheet: 'titan_moon:azotosome_sheet', coenzyme: 'titan_moon:polyphosphazene_coenzyme',
      salt: 'titan_moon:ammonia_salt', silicon: 'titan_moon:silicon_dust',
      blank: 'deeprealm_4th:star_slurry_blank', solid: 'deeprealm_4th:stabilized_star_slurry',
      lens: 'deeprealm_4th:astral_lens', star: 'deeprealm_4th:star_slurry', gate: 'elder_bosses:gate_fragment',
      soul: 'slashblade:proudsoul', ingot: 'slashblade:proudsoul_ingot', sphere: 'slashblade:proudsoul_sphere',
      crystal: 'slashblade:proudsoul_crystal', trapezohedron: 'slashblade:proudsoul_trapezohedron'
    },
    manufacture: {
      low: {
        count: 2, clicks: 2, inputs: [['iron', 1], ['carapace', 16], ['silk', 8], ['blank', 1], ['soul', 2]],
        machine: { count: 3, pressure: 1.5, inputs: [['iron', 1], ['carapace', 24], ['silk', 16], ['blank', 2], ['soul', 4]] }
      },
      mid: {
        count: 2, clicks: 4, inputs: [['alloy', 16], ['sheet', 8], ['coenzyme', 1], ['solid', 1], ['lens', 1], ['sphere', 1]],
        machine: { count: 3, pressure: 2.5, inputs: [['alloy', 24], ['sheet', 16], ['coenzyme', 1], ['solid', 2], ['lens', 2], ['sphere', 2]] }
      },
      high: {
        count: 1, clicks: 6, inputs: [['alloy', 16], ['sheet', 16], ['coenzyme', 2], ['solid', 2], ['lens', 1], ['neural', 8], ['gate', 1], ['crystal', 1]],
        machine: { count: 2, pressure: 3.5, inputs: [['alloy', 24], ['sheet', 24], ['coenzyme', 3], ['solid', 3], ['lens', 2], ['neural', 16], ['gate', 2], ['crystal', 2]] }
      }
    },
    reinforcementRecipes: {
      cleanse: [['gland', 16], ['solid', 1], ['coenzyme', 1], ['salt', 1], ['crystal', 1]],
      size: [['carapace', 16], ['iron', 2], ['solid', 1], ['sheet', 1], ['ingot', 1]],
      purity: [['membrane', 8], ['coenzyme', 1], ['solid', 1], ['salt', 2], ['sphere', 1]],
      polish: [['silk', 16], ['lens', 1], ['solid', 1], ['silicon', 1], ['sphere', 1]]
    },
    soulRefining: {
      ingot: { clicks: 2, inputs: [['soul', 4], ['iron', 2], ['salt', 1]] },
      sphere: { clicks: 3, inputs: [['ingot', 3], ['coenzyme', 1], ['sheet', 1]] },
      crystal: { clicks: 4, inputs: [['sphere', 3], ['lens', 1], ['solid', 1]] }
    }
  };
  A.gemTiers = {};
  A.species.forEach(s => { A.gemTiers[s.item] = [10, 34].indexOf(s.number) >= 0 ? 3 : s.number === 9 || s.number >= 12 && s.number <= 23 ? 2 : 1; });
  A.agentTiers = {}; Object.keys(A.processing.tiers).forEach(tier => { A.agentTiers[A.processing.tiers[tier].id] = tier; });
  A.enhancementKinds = {}; Object.keys(A.processing.enhancements).forEach(kind => { A.enhancementKinds[A.processing.enhancements[kind].id] = kind; });
})();
