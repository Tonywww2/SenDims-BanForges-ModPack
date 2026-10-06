// priority: 1800
// Pure rule evaluation. All balance parameters are supplied by the central configuration.
; (() => {
  let A = global.sdbfAstral;
  let words = { 力量: 'STRENGTH', 敏捷: 'AGILITY', 智力: 'INTELLIGENCE', 体质: 'CONSTITUTION', 感知: 'PERCEPTION', 魔力: 'MAGIC' };
  let attributes = {
    攻击力: 'minecraft:generic.attack_damage', 拔刀剑伤害系数: 'slashblade:slashblade_damage',
    癫火伤害: 'slashblade_sendims:frenzy_damage', 暴击率: 'attributeslib:crit_chance',
    暴击伤害: 'attributeslib:crit_damage', 盔甲穿透: 'attributeslib:armor_pierce',
    盔甲撕裂: 'attributeslib:armor_shred', 魔法穿透: 'slashblade_sendims:magic_penetration',
    最大生命值: 'minecraft:generic.max_health', 受到治疗倍率: 'attributeslib:healing_received',
    经验获取: 'attributeslib:experience_gained', 火焰伤害: 'attributeslib:fire_damage', 寒冰伤害: 'attributeslib:cold_damage'
  };
  A.scoreNames = Object.keys(words).reduce((o, k) => { o[words[k]] = k; return o; }, {});
  A.stats = ['size', 'purity', 'polish'];
  A.statNames = { size: '大小', purity: '纯度', polish: '抛光' };
  A.limits = { size: 500, purity: 200, polish: 100 };
  A.byIdentity = {}; A.byItem = {};
  A.rules.forEach(r => {
    r.identity = r.item + '#' + r.primary;
    r.key = 'sdbf:gem/' + r.kind + '/' + r.primary;
    r.badgeChannels = [];
    r.badgeText.split('；').forEach(part => {
      let parts = part.split('→');
      let scores = parts[0].trim().split('＋').map(s => words[s.trim()]);
      parts[1].trim().split('、').forEach(label => r.badgeChannels.push({ scores: scores, attribute: attributes[label], label: label }));
    });
    r.seed = r.badgeChannels.reduce((list, c) => { c.scores.forEach(s => { if (list.indexOf(s) < 0) list.push(s); }); return list; }, []);
    // Some transformations keep a second score which the badge does not use.
    let specialSeeds = {
      '8:alpha': ['AGILITY', 'MAGIC'], '10:beta': ['CONSTITUTION', 'STRENGTH'],
      '20:alpha': ['INTELLIGENCE', 'PERCEPTION', 'MAGIC'], '28:beta': ['MAGIC'],
      '29:gamma': ['CONSTITUTION', 'MAGIC'], '32:beta': ['CONSTITUTION', 'MAGIC']
    };
    r.seed = specialSeeds[r.kind + ':' + r.primary] || r.seed;
    A.byIdentity[r.identity] = r;
    (A.byItem[r.item] || (A.byItem[r.item] = [])).push(r);
  });
  let identity = (kind, primary) => A.species[kind - 1].item + '#' + primary;
  let ids = list => list.map(x => identity(x[0], x[1]));
  let P9 = ids([[1, 'beta'], [2, 'beta'], [3, 'beta'], [5, 'beta'], [6, 'beta'], [6, 'gamma'], [7, 'beta'], [7, 'gamma'], [8, 'alpha'], [8, 'beta'], [8, 'gamma'], [29, 'beta'], [29, 'gamma']]);
  let mixed = ids([[8, 'alpha'], [20, 'alpha'], [10, 'beta'], [6, 'gamma'], [21, 'beta'], [27, 'beta'], [21, 'gamma'], [30, 'gamma'], [32, 'beta']]);
  let port = (name, roots, extra, mode) => ({ name: name, roots: roots, extra: ids(extra || []), mode: mode || 'final' });
  A.rules.forEach(r => {
    r.geometry = 'orthogonal'; r.ports = [];
    if (r.role === 'producer') {
      if (r.kind === 15) r.ports = [port('source', true, [], 'base')];
      return;
    }
    let common = port('source', true);
    if ([9, 10, 11, 24, 25, 31].indexOf(r.kind) >= 0) common.extra = P9.slice();
    if (r.kind === 8 && r.primary !== 'alpha') common.extra = P9.filter(x => x !== identity(8, 'beta') && x !== identity(8, 'gamma'));
    r.ports = [common];
    let key = r.kind + ':' + r.primary;
    switch (key) {
      case '9:gamma': common.extra.push(identity(9, 'beta')); break;
      case '10:gamma': r.geometry = 'gapTwo'; break;
      case '12:beta': r.ports = [port('source', false, [[12, 'alpha']])]; break;
      case '14:alpha': case '19:beta': r.geometry = 'diagonal'; break;
      case '14:beta': r.geometry = 'mirror'; common.extra = ids([[8, 'alpha'], [5, 'beta']]); break;
      case '18:beta': r.geometry = 'rays'; break;
      case '19:gamma': r.geometry = 'squares'; common.mode = 'base'; common.roots = false;
        common.extra = A.rules.map(x => x.identity); break;
      case '20:beta': case '21:beta': case '21:gamma':
        r.ports = [port('source', false, [[20, 'alpha'], [8, 'alpha']])]; break;
      case '22:beta': r.ports = [port('source', false, [[22, 'alpha']])]; break;
      case '22:gamma': r.ports = [port('body', false, [[22, 'beta'], [1, 'beta']]), port('perception', true)]; break;
      case '23:beta': r.ports = [port('source', false, [[1, 'beta'], [10, 'beta'], [11, 'beta'], [22, 'beta']])]; break;
      case '23:gamma': r.ports = [port('body', true, [[23, 'beta'], [22, 'beta'], [1, 'beta']]), port('magic', true, [[29, 'beta'], [29, 'gamma'], [16, 'beta']])]; break;
      case '28:alpha': common.extra = ids([[13, 'alpha']]); break;
      case '28:beta': r.ports = [port('strength', false, [[28, 'alpha'], [18, 'beta']]), port('magic', true)]; break;
      case '30:beta': common.extra = ids([[29, 'beta'], [29, 'gamma'], [16, 'beta']]); break;
      case '30:gamma': r.ports = [port('source', false, [[30, 'beta'], [29, 'beta'], [29, 'gamma'], [16, 'beta']])]; break;
      case '31:alpha': common.mode = 'base'; common.roots = false; common.extra = A.rules.map(x => x.identity); break;
    }
    if (r.kind === 34) {
      common.roots = false;
      common.extra = r.primary === 'beta' ? mixed : A.rules.filter(x => x.role !== 'producer' && x.kind !== 34).map(x => x.identity);
    }
  });
  A.allowed = (p, r) => !!r && ((p.roots && r.role === 'producer') || p.extra.indexOf(r.identity) >= 0);
  A.parameters = r => {
    if (!A.balance) throw new Error('balance_unavailable');
    return Object.assign({}, A.balance.common, A.balance.rules[r.identity] || {});
  };
  A.effective = payload => {
    let result = {};
    A.stats.forEach(stat => {
      let flat = 0, percent = 0;
      payload.affixes.concat(payload.reinforcements).forEach(a => {
        if (a.stat === stat) { if (a.operation === 'flat') flat += a.value; else percent += a.value; }
      });
      result[stat] = Math.max(1, (payload.natural[stat] + flat) * (1 + percent));
      if (!Number.isFinite(result[stat])) throw new Error('gem_dimension_overflow');
    });
    return result;
  };
  A.weighted = (values, main) => A.stats.reduce((sum, s) => sum + values[s] / A.limits[s] * (s === main ? 0.7 : 0.15), 0);
  A.quality = (payload, r) => {
    let count = payload.affixes.filter(x => x.value > 0).length;
    return Math.max(A.weighted(payload.natural, r.main), A.weighted(payload.natural, r.badgeMain)) * 0.8 + count / 5 * 0.2;
  };
  A.validate = payload => {
    if (!payload || payload.schema !== 1) return 'missing_or_unsupported_schema';
    if (!A.byIdentity[payload.source_item + '#' + payload.primary]) return 'unknown_gem_primary';
    if (!payload.natural || A.stats.some(s => !Number.isFinite(payload.natural[s]) || payload.natural[s] < 1 || payload.natural[s] > A.limits[s])) return 'invalid_natural_dimensions';
    if (!Array.isArray(payload.affixes) || payload.affixes.length > 5 || !Array.isArray(payload.reinforcements)) return 'invalid_affix_count';
    let bad = a => A.stats.indexOf(a.stat) < 0 || ['flat', 'percent'].indexOf(a.operation) < 0 || !Number.isFinite(a.value);
    if (payload.affixes.concat(payload.reinforcements).some(bad)) return 'invalid_affix';
    for (let i = 0; i < payload.affixes.length; i++) {
      let a = payload.affixes[i], max = a.operation === 'percent' ? 0.25 : A.limits[a.stat] / 10;
      if (a.value < -max / 2 || a.value > max) return 'natural_affix_out_of_range';
    }
    try { A.effective(payload); } catch (e) { return String(e.message); }
    return null;
  };
  A.isSystemStack = stack => !!stack && (String(stack.id) === A.fillerId || String(stack.id) === A.badgeId || !!A.byItem[String(stack.id)]);
  A.clamp = v => Math.max(0, Math.min(1, v));
  // Pure environment: state, cells, own index, and current-round source results.
  A.evaluate = (r, payload, env, inputs, base, N, p) => {
    let S = 'STRENGTH', G = 'AGILITY', I = 'INTELLIGENCE', C = 'CONSTITUTION', P = 'PERCEPTION', M = 'MAGIC';
    let zero = N(0), one = N(1), K = N(p.K), eff = A.weighted(A.effective(payload), r.main), state = env.state;
    let q = N(eff).multiply(N(p.multiplier)), output = Object.assign({}, base), values = A.effective(payload);
    let add = (s, v) => { output[s] = (output[s] || zero).add(v); };
    let score = (x, s) => (x.scores[s] || zero).max(zero);
    let sum = list => list.reduce((v, x) => v.add(x), zero);
    let total = x => sum(Object.keys(x.scores).map(s => score(x, s)));
    let gain = x => total(x).subtract(x.baseTotal).max(zero);
    let ratio = x => total(x).sign() > 0 ? gain(x).divide(total(x)) : zero;
    let all = name => (inputs[name || 'source'] || []).slice().sort((a, b) => a.index - b.index);
    let positive = (s, name) => all(name).filter(x => score(x, s).sign() > 0);
    let best = (list, fn) => list.reduce((v, x) => fn(x).max(v), zero);
    let highest = (s, name) => best(positive(s, name), x => score(x, s));
    let enhanced = v => v.multiply(q);
    let positiveAffixes = payload.affixes.filter(a => a.value > 0);
    let target = id => A.clamp((state.attributes[id] || 0) / p.target);
    let pairs = (a, b, fn) => { let max = zero; a.forEach(x => b.forEach(y => { if (x.index !== y.index) max = max.max(fn(x, y)); })); return max; };
    let triples = (a, b, c, fn) => { let max = zero; a.forEach(x => b.forEach(y => c.forEach(z => { if (x.index !== y.index && x.index !== z.index && y.index !== z.index) max = max.max(fn(x, y, z)); }))); return max; };
    let cell = index => env.cells.filter(c => c.index === index)[0];
    let norm = A.stats.map(s => values[s] / A.limits[s]);
    let night = state.overworldDayTime % 24000 >= 13000 && state.overworldDayTime % 24000 < 23000;
    let pulse = (1 - Math.cos(state.gameTime * 2 * Math.acos(-1) / p.periodTicks)) / 2;
    let neighbors = env.neighbors.filter(c => c.effective && c.rule);
    if (r.role === 'producer') {
      let factor = 1;
      switch (r.kind) {
        case 1: factor = Math.pow(p.step, Object.keys(neighbors.reduce((o, c) => { o[c.rule.item] = true; return o; }, {})).length); break;
        case 2: factor = 1 + p.bonus * Math.log1p(Math.max(0, state.level) / p.levelScale); break;
        case 3: factor = Math.pow(p.step, norm.filter(v => v > 1).length); break;
        case 4: factor = r.primary === 'alpha' ? Math.pow(p.step, env.neighbors.filter(c => c.open && !c.occupied).length) : Math.pow(p.step, neighbors.filter(c => c.rule.item === r.item).length); break;
        case 5: factor = night ? p.nightMultiplier : 1; break;
        case 6: factor = 1 + p.bonus * Math.exp(-p.matchSensitivity * (Math.max.apply(null, norm) - Math.min.apply(null, norm))); break;
        case 7: factor = 1 + p.bonus * target('attributeslib:crit_chance'); break;
        case 9: factor = payload.affixes.some(a => a.value < 0) ? 1 : p.cleanMultiplier; break;
        case 10: factor = 1 + p.bonus * target('slashblade:slashblade_damage'); break;
        case 11: factor = state.onGround ? 1 : p.airMultiplier; break;
        case 12: factor = 1 + p.bonus * pulse; break;
        case 15: factor = Math.pow(p.step, all().filter(x => x.baseTotal.compareTo(sum(Object.keys(base).map(s => base[s]))) < 0).length); break;
        case 16: factor = state.raining || state.thundering ? 1 : p.clearMultiplier; break;
        case 17: factor = 1 + p.bonus * A.clamp(state.experienceProgress); break;
        case 18: factor = 1 + p.bonus * Math.log1p(Math.max(0, (state.attributes['attributeslib:fire_damage'] || 0) + (state.attributes['attributeslib:cold_damage'] || 0)) / p.target); break;
        case 19: factor = Math.pow(p.step, env.squares.filter(square => square.every(c => c.effective && c.rule)).length); break;
        case 21: factor = Math.pow(p.step, Object.keys(neighbors.reduce((o, c) => { o[c.rule.role] = true; return o; }, {})).length); break;
        case 22: factor = Math.pow(p.step, env.cluster(env.index, r.item).length - 1); break;
        case 23: factor = Math.pow(p.step, env.neighbors.filter(c => !c.inBounds).length); break;
        case 24: factor = 1 + p.bonus * (state.mainHandDamageable ? 1 - A.clamp(state.mainHandRemaining) : 0); break;
        case 25: factor = 1 + p.bonus * target('attributeslib:fire_damage'); break;
        case 26: factor = 1 + p.bonus * target('attributeslib:healing_received'); break;
        case 27: factor = Math.pow(p.step, positiveAffixes.filter(a => a.operation === 'flat').length); break;
        case 29: factor = 1 + p.bonus * A.clamp((1 - state.healthRatio) / (1 - p.lowHealth)); break;
        case 30: factor = state.crouching ? p.crouchMultiplier : 1; break;
        case 32: factor = 1 + p.bonus * A.clamp(state.food / 20); break;
        case 33: factor = neighbors.reduce((v, c) => v * (1 + p.bonus * Math.exp(-p.matchSensitivity * Math.abs(A.effective(c.payload).size - values.size) / A.limits.size)), 1); break;
        default: throw new Error('unimplemented_producer:' + r.identity);
      }
      Object.keys(output).forEach(s => { output[s] = output[s].multiply(N(factor)); });
      return output;
    }
    let v = zero;
    switch (r.kind + ':' + r.primary) {
      case '1:beta': {
        // Choose up to three distinct source cells and one positive component per cell.
        let sources = all();
        let visit = (start, taken, types, value) => {
          if (taken) v = v.max(value.multiply(N(Math.pow(p.step, Object.keys(types).length - 1))));
          if (taken === 3) return;
          for (let k = start; k < sources.length; k++) Object.keys(sources[k].scores).forEach(s => {
            if (score(sources[k], s).sign() > 0) { let next = Object.assign({}, types); next[s] = true; visit(k + 1, taken + 1, next, value.add(score(sources[k], s))); }
          });
        };
        visit(0, 0, {}, zero); add(C, enhanced(v)); break;
      }
      case '2:beta': v = pairs(positive(P), positive(M), (x, y) => cell(x.index).x + cell(y.index).x === 2 * env.x && cell(x.index).y + cell(y.index).y === 2 * env.y ? score(x, P).add(score(y, M)) : zero); add(I, enhanced(v)); break;
      case '3:beta': add(S, enhanced(highest(C)).multiply(N(1 + p.bonus * Math.max(0, Math.max.apply(null, norm) - 1)))); break;
      case '5:beta': add(night ? M : G, enhanced(highest(night ? G : M)).multiply(N(night ? p.nightMultiplier : 1))); break;
      case '6:beta': add(M, enhanced(pairs(positive(M), positive(M), (x, y) => score(x, M).min(score(y, M))))); break;
      case '6:gamma': {
        let winner = null, max = zero;
        positive(C).forEach(x => positive(M).forEach(y => { if (x.index !== y.index) { let diff = score(x, C).subtract(score(y, M)); if (diff.abs().compareTo(max) > 0) { max = diff.abs(); winner = diff.sign() > 0 ? M : C; } } }));
        if (winner) add(winner, enhanced(max)); break;
      }
      case '7:beta': add(P, enhanced(pairs(positive(P), positive(G), (x, y) => score(x, P).multiply(one.add(score(y, G).divide(K)))))); break;
      case '7:gamma': add((state.attributes['attributeslib:crit_chance'] || 0) < p.target ? G : M, enhanced(highest(P))); break;
      case '8:alpha': v = enhanced(highest(S)); add(G, v.multiply(N(p.share))); add(M, v.multiply(N(1 - p.share))); break;
      case '8:beta': add(I, enhanced(triples(positive(S), positive(P), positive(M), (x, y, z) => score(x, S).multiply(score(y, P)).multiply(score(z, M)).divide(K.pow(2))))); break;
      case '8:gamma': {
        let list = positive(M); if (list.length >= 2) { let h = highest(M), l = list.reduce((m, x) => m.min(score(x, M)), h); add(M, enhanced(h.multiply(one.add(h.subtract(l).divide(K))))); } break;
      }
      case '9:beta': add(M, enhanced(best(all(), gain))); break;
      case '9:gamma': add(M, enhanced(best(positive(M).filter(x => x.baseTotal.sign() > 0), x => score(x, M).multiply(one.add(gain(x).divide(x.baseTotal)))))); break;
      case '10:beta': { v = enhanced(highest(C)); let share = p.share + (p.maxShare - p.share) * target('attributeslib:armor_pierce'); add(S, v.multiply(N(share))); add(C, v.multiply(N(1 - share))); break; }
      case '10:gamma': add(S, enhanced(highest(S))); break;
      case '11:beta': add(C, enhanced(highest(P)).multiply(N(state.onGround ? p.groundMultiplier : 1))); break;
      case '12:beta': add(P, enhanced(highest(P)).multiply(N(1 + p.bonus * pulse))); break;
      case '13:alpha': add(S, enhanced(pairs(positive(S), positive(S), (x, y) => cell(x.index).x + cell(y.index).x === 2 * env.x && cell(x.index).y + cell(y.index).y === 2 * env.y ? score(x, S).multiply(score(y, S)).divide(K) : zero))); break;
      case '13:beta': add(I, enhanced(triples(positive(G), positive(P), positive(M), (x, y, z) => score(x, G).multiply(score(y, P)).add(score(x, G).multiply(score(z, M))).add(score(y, P).multiply(score(z, M))).divide(K)))); break;
      case '14:alpha': add(G, enhanced(highest(G))); break;
      case '14:beta': add(M, enhanced(best(all(), total))); break;
      case '15:beta': { let list = positive(P); if (list.length >= 2) { let low = list.reduce((m, x) => m.min(score(x, P)), highest(P)); add(P, enhanced(low.multiply(one.add(sum(list.map(x => score(x, P))).subtract(low).divide(K))))); } break; }
      case '15:gamma': {
        let count = -1;
        all().forEach(x => { let c = cell(x.index).payload.affixes.filter(a => a.value > 0).length; if (c > count) { count = c; v = total(x); } else if (c === count) v = v.max(total(x)); }); add(I, enhanced(v)); break;
      }
      case '16:beta': add(M, enhanced(pairs(positive(M), positive(M), (x, y) => state.thundering ? score(x, M).add(score(y, M)).multiply(one.add(score(x, M).min(score(y, M)).divide(K))) : state.raining ? score(x, M).add(score(y, M)) : score(x, M).max(score(y, M))))); break;
      case '16:gamma': add(M, enhanced(pairs(positive(S), positive(G), (x, y) => score(x, S).add(score(y, G)).add(state.thundering ? score(x, S).multiply(score(y, G)).divide(K) : zero)))); break;
      case '17:beta': add(I, enhanced(triples(positive(S), positive(P), positive(M), (x, y, z) => {
        let positions = [x, y, z].map(t => env.neighbors.map(c => c.index).indexOf(t.index));
        let ordered = (positions[1] - positions[0] + 4) % 4 < (positions[2] - positions[0] + 4) % 4;
        return score(x, S).add(score(y, P)).add(score(z, M)).multiply(N(ordered ? p.orderMultiplier : 1));
      }))); break;
      case '18:beta': env.rays.forEach(ray => { let list = []; for (let j = 0; j < ray.length; j++) { let x = all().filter(t => t.index === ray[j].index)[0]; if (!x || score(x, M).sign() <= 0) break; list.push(x); } v = v.max(sum(list.map(x => score(x, M))).multiply(N(Math.pow(p.step, list.length)))); }); add(S, enhanced(v)); break;
      case '19:beta': { let list = positive(I); if (list.length === 4) { let low = list.reduce((m, x) => m.min(score(x, I)), highest(I)); add(I, enhanced(sum(list.map(x => score(x, I))).multiply(one.add(low.divide(K))))); } break; }
      case '19:gamma': env.squares.forEach(square => { let list = square.filter(c => c.index !== env.index).map(c => all().filter(x => x.index === c.index)[0]); if (list.length === 3 && list.every(x => !!x)) v = v.max(list.reduce((m, x) => m.multiply(x.baseTotal), one).divide(K.pow(2))); }); add(P, enhanced(v)); break;
      case '20:alpha': v = enhanced(highest(S)).divide(N(3)); add(I, v); add(P, v); add(M, v); break;
      case '20:beta': add(P, enhanced(best(all(), x => total(x).multiply(N(Math.pow(p.step, Object.keys(x.scores).filter(s => score(x, s).sign() > 0).length - 1)))))); break;
      case '21:beta': {
        let pair = null, max = zero;
        all().forEach(x => all().forEach(y => { if (x.index === y.index) return; let val = sum(Object.keys(A.scoreNames).map(s => score(x, s).multiply(score(y, s)).divide(K))); if (val.compareTo(max) > 0) { max = val; pair = [x, y]; } }));
        if (pair) Object.keys(A.scoreNames).forEach(s => add(s, enhanced(score(pair[0], s).multiply(score(pair[1], s)).divide(K)))); break;
      }
      case '21:gamma': {
        let chosen = null; all().forEach(x => { if (!chosen || total(x).compareTo(total(chosen)) > 0) chosen = x; });
        if (chosen) { let type = S, max = zero; Object.keys(A.scoreNames).forEach(s => { if (score(chosen, s).compareTo(max) > 0) { type = s; max = score(chosen, s); } }); add(type, enhanced(max)); add(P, enhanced(total(chosen).subtract(max))); } break;
      }
      case '22:beta': add(C, enhanced(best(positive(C), x => score(x, C).multiply(N(Math.pow(p.step, env.cluster(x.index, r.item).length - 1)))))); break;
      case '22:gamma': add(I, enhanced(pairs(positive(C, 'body'), positive(P, 'perception'), (x, y) => score(x, C).multiply(one.add(score(y, P).divide(K)))))); break;
      case '23:beta': add(C, enhanced(best(positive(C), x => { let c = score(x, C).multiply(ratio(x)); return c.multiply(one.add(c.divide(K))); }))); break;
      case '23:gamma': add(S, enhanced(pairs(positive(C, 'body'), positive(M, 'magic'), (x, y) => { let c = score(x, C).min(score(y, M)); return c.multiply(one.add(c.divide(K))); }))); break;
      case '24:beta': add(S, enhanced(highest(S)).multiply(N(1 + p.bonus * (state.mainHandDamageable ? A.clamp(state.mainHandRemaining) : 0)))); break;
      case '25:beta': add(M, enhanced(highest(M)).multiply(N(Math.pow(p.step, ((state.attributes['attributeslib:fire_damage'] || 0) >= p.target ? 1 : 0) + ((state.attributes['attributeslib:cold_damage'] || 0) >= p.target ? 1 : 0))))); break;
      case '25:gamma': add(M, enhanced(highest(S)).multiply(N(1 + p.bonus * target('slashblade_sendims:frenzy_damage')))); break;
      case '26:beta': add(P, enhanced(highest(C)).multiply(N(1 + p.bonus * A.clamp(state.healthRatio)))); break;
      case '27:beta': { v = enhanced(highest(S)); let share = p.share + (p.maxShare - p.share) * positiveAffixes.filter(a => a.operation === 'percent').length / 5; add(M, v.multiply(N(share))); add(I, v.multiply(N(1 - share))); break; }
      case '28:alpha': v = highest(S); add(S, enhanced(v.multiply(one.add(v.divide(K))))); break;
      case '28:beta': add(M, enhanced(pairs(positive(S, 'strength'), positive(M, 'magic'), (x, y) => score(x, S).multiply(score(y, M)).divide(K)))); break;
      case '29:beta': { let list = positive(M).sort((x, y) => score(y, M).compareTo(score(x, M))); add(M, enhanced(sum(list.slice(0, (state.attributes['minecraft:generic.attack_damage'] || 0) >= p.target ? 2 : 1).map(x => score(x, M))))); break; }
      case '29:gamma': { v = enhanced(highest(C)); let t = A.clamp((p.lowHealth + p.healthWidth / 2 - state.healthRatio) / p.healthWidth), blend = t * t * (3 - 2 * t); add(C, v.multiply(N(1 - blend))); add(M, v.multiply(N(p.share + (p.maxShare - p.share) * blend))); break; }
      case '30:beta': v = highest(M); add(M, enhanced(v.multiply(one.add(v.divide(K)).pow(p.powerBase + (p.powerLimit - p.powerBase) * (1 - Math.exp(-eff)))))); break;
      case '30:gamma': {
        let chosen = null; positive(M).forEach(x => { if (!chosen || score(x, M).compareTo(score(chosen, M)) > 0) chosen = x; });
        if (chosen) { v = enhanced(score(chosen, M)); let g = ratio(chosen); add(M, v.multiply(one.subtract(g))); add(I, v.multiply(g)); } break;
      }
      case '31:alpha': add(I, enhanced(best(all(), x => x.baseTotal))); break;
      case '31:beta': {
        let chosen = null, max = zero; all().forEach(x => { let val = x.baseTotal.multiply(N(p.baseShare)).add(gain(x).multiply(N(p.gainShare))); if (val.compareTo(max) > 0) { max = val; chosen = x; } });
        if (chosen) { add(G, enhanced(chosen.baseTotal.multiply(N(p.baseShare)))); add(I, enhanced(gain(chosen).multiply(N(p.gainShare)))); } break;
      }
      case '32:beta': { v = enhanced(highest(S)); let share = p.share + (p.maxShare - p.share) * A.clamp(state.food / 20); add(C, v.multiply(N(share))); add(M, v.multiply(N(1 - share))); break; }
      case '33:beta': add(G, enhanced(pairs(positive(C), positive(P), (x, y) => {
        let gap = Math.abs(A.effective(cell(x.index).payload).purity - A.effective(cell(y.index).payload).purity) / A.limits.purity;
        return score(x, C).add(score(y, P)).multiply(N(1 + p.bonus * Math.exp(-p.matchSensitivity * gap)));
      }))); break;
      case '34:alpha': add(M, enhanced(triples(positive(M), positive(I), positive(P), (x, y, z) => score(x, M).multiply(one.add(score(y, I).divide(N(p.K1)))).multiply(one.add(score(z, P).divide(N(p.K2))))))); break;
      case '34:beta': {
        let list = all().filter(x => Object.keys(x.scores).filter(s => score(x, s).sign() > 0).length >= 2);
        let visit = (start, taken, types, value) => {
          if (taken >= 2) v = v.max(value.multiply(N(Math.pow(p.step, Object.keys(types).length))));
          if (taken === 3) return;
          for (let k = start; k < list.length; k++) { let next = Object.assign({}, types); Object.keys(list[k].scores).forEach(s => { if (score(list[k], s).sign() > 0) next[s] = true; }); visit(k + 1, taken + 1, next, value.add(total(list[k]))); }
        }; visit(0, 0, {}, zero); add(I, enhanced(v)); break;
      }
      case '34:gamma': add(C, enhanced(triples(all(), all(), all(), (x, y, z) => { if (x.identity === y.identity || x.identity === z.identity || y.identity === z.identity) return zero; let low = total(x).min(total(y)).min(total(z)); return low.multiply(one.add(low.divide(K)).pow(2)); }))); break;
      case '34:delta': add(S, enhanced(best(all(), x => { let h = Object.keys(x.scores).reduce((m, s) => m.max(score(x, s)), zero); return h.multiply(one.add(total(x).subtract(h).divide(K))); }))); break;
      default: throw new Error('unimplemented_reader:' + r.identity);
    }
    return output;
  };
})();
