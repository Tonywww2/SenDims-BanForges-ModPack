// priority: 1775
// First playable tuning. Keep all numerical choices here for later adjustment.
; (() => {
  let A = global.sdbfAstral;
  A.balance = {
    enhancementMaxUses: 10,
    common: {
      producerBase: 1000, readerBase: 50, multiplier: 2, K: 100, K1: 100, K2: 100,
      step: 1.4, bonus: 0.5, levelScale: 30, target: 0.6, nightMultiplier: 1.5,
      cleanMultiplier: 1.5, airMultiplier: 1.5, groundMultiplier: 1.5, clearMultiplier: 1.5,
      periodTicks: 1200, orderMultiplier: 1.5, matchSensitivity: 4, share: 0.25, maxShare: 0.75,
      lowHealth: 0.3, healthWidth: 0.2, crouchMultiplier: 1.5, powerBase: 1, powerLimit: 2,
      baseShare: 1, gainShare: 1
    },
    rules: {},
    badge: {
      scoreCoefficient: 0.10, scoreScale: '1000', referenceEfficiency: 0.4,
      efficiencyPower: 0.5, multiAttributeFactor: 0.65, attributes: {
        'minecraft:generic.attack_damage': { operation: 'multiplyTotal', factor: 1 },
        'slashblade:slashblade_damage': { operation: 'multiplyTotal', factor: 1 },
        'slashblade_sendims:frenzy_damage': { operation: 'add', factor: 1 },
        'attributeslib:crit_chance': { operation: 'add', factor: 1 },
        'attributeslib:crit_damage': { operation: 'add', factor: 1 },
        'attributeslib:armor_pierce': { operation: 'add', factor: 50 },
        'attributeslib:armor_shred': { operation: 'add', factor: 1 },
        'slashblade_sendims:magic_penetration': { operation: 'add', factor: 100 },
        'minecraft:generic.max_health': { operation: 'multiplyTotal', factor: 1 },
        'attributeslib:healing_received': { operation: 'multiplyTotal', factor: 1 },
        'attributeslib:experience_gained': { operation: 'multiplyTotal', factor: 1 },
        'attributeslib:fire_damage': { operation: 'add', factor: 1300 },
        'attributeslib:cold_damage': { operation: 'add', factor: 1300 }
      }
    }
  };
  let overrides = {
    '2:alpha': { bonus: 0.35 }, '8:alpha': { share: 0.5 },
    '10:alpha': { target: 3 }, '10:beta': { target: 50 }, '18:alpha': { target: 130 },
    '25:alpha': { target: 130 }, '25:beta': { target: 130 }, '25:gamma': { target: 0.5 },
    '26:alpha': { target: 1.5 }, '29:beta': { target: 1200 }, '29:gamma': { share: 0.1, maxShare: 1 }
  };
  A.rules.forEach(r => { let p = overrides[r.kind + ':' + r.primary]; if (p) A.balance.rules[r.identity] = p; });
})();
