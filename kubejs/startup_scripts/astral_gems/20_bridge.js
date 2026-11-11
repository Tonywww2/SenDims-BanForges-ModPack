// priority: 1700
; (() => {
  let A = global.sdbfAstral;
  StartupEvents.registry('item', event => {
    event.create('astral_gem_filler').maxStackSize(1).rarity('epic')
      .texture('deeprealm_4th:item/magic_gem').modelJson(A.fillerModel);
    event.create('astral_gem_badge').maxStackSize(1).rarity('epic')
      .texture('deeprealm_4th:item/warrior_medal');
  });
  A.apiReady = typeof FillerNode !== 'undefined' && typeof GemPayloadTransfer !== 'undefined'
    && typeof FillerPresentations !== 'undefined' && typeof EffectScope !== 'undefined';
  if (!A.apiReady) {
    console.warn('[Astral gems] Installed DeepRealm lacks the gem node API. Update the mod before runtime testing.');
    return;
  }
  let Compound = Java.loadClass('net.minecraft.nbt.CompoundTag');
  let ListTag = Java.loadClass('net.minecraft.nbt.ListTag');
  let ArrayList = Java.loadClass('java.util.ArrayList');
  let Component = Java.loadClass('net.minecraft.network.chat.Component');
  let Registries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
  A.itemId = stack => String(Registries.ITEM.getKey(stack.getItem()));
  A.clientDayTime = null;
  A.clientClockTime = 0;
  let N = value => AstralNumber.fromDouble(value);
  // Copy API lists before calling methods: Java's immutable list classes are not
  // public and Rhino cannot reflectively invoke their size/get implementations.
  A.list = list => { let copy = new ArrayList(list), out = []; for (let i = 0; i < copy.size(); i++)out.push(copy.get(i)); return out; };
  A.payloadFromTag = tag => {
    let decoded = GemPayload.decode(tag);
    if (!decoded.ok()) return { error: String(decoded.error()) };
    let gem = decoded.value();
    let affixes = list => A.list(list).map(a => ({ stat: String(a.stat().name()).toLowerCase(), operation: String(a.operation().name()).toLowerCase(), value: a.value() }));
    let data = {
      schema: 1, source_item: String(gem.sourceItem()), primary: String(gem.primary()),
      natural: { size: gem.natural().size(), purity: gem.natural().purity(), polish: gem.natural().polish() },
      affixes: affixes(gem.affixes()), reinforcements: affixes(gem.reinforcements()), extensions: gem.extensions()
    };
    let error = A.validate(data);
    if (!error && A.enhancementUses) { try { A.enhancementUses(data); } catch (problem) { error = String(problem.message || problem); } }
    return error ? { error: error } : { payload: data, rule: A.byIdentity[data.source_item + '#' + data.primary] };
  };
  A.read = stack => {
    let id = A.itemId(stack);
    let tag = AstralItemData.read(stack, id === A.badgeId ? A.badgeKey : A.gemKey);
    if (id === A.badgeId) tag = tag && tag.contains('gem', 10) ? tag.getCompound('gem') : null;
    let parsed = A.payloadFromTag(tag);
    if (parsed.payload && id !== A.fillerId && id !== A.badgeId && id !== parsed.payload.source_item) return { error: 'source_item_mismatch' };
    return parsed;
  };
  A.encode = data => {
    let error = A.validate(data); if (error) throw new Error(error);
    let tag = new Compound(), natural = new Compound();
    tag.putInt('schema', 1); tag.putString('source_item', data.source_item); tag.putString('primary', data.primary);
    A.stats.forEach(s => natural.putDouble(s, data.natural[s])); tag.put('natural', natural);
    ['affixes', 'reinforcements'].forEach(key => {
      let list = new ListTag(); data[key].forEach(a => { let entry = new Compound(); entry.putString('stat', a.stat); entry.putString('operation', a.operation); entry.putDouble('value', a.value); list.add(entry); }); tag.put(key, list);
    });
    tag.put('extensions', data.extensions ? data.extensions.copy() : new Compound());
    return tag;
  };
  A.write = (stack, data) => {
    let output;
    if (A.itemId(stack) === A.badgeId) {
      let tag = AstralItemData.read(stack, A.badgeKey); if (!tag) tag = new Compound();
      tag.put('gem', A.encode(data)); output = AstralItemData.writeCopy(stack, A.badgeKey, tag);
    } else output = AstralItemData.writeCopy(stack, A.gemKey, A.encode(data));
    return FillerPresentations.applyNameCopy(output);
  };
  let name = stack => {
    let parsed = A.read(stack);
    if (!parsed.payload) return null;
    return Component.translatable('name.sdbf_astral.badge', Component.literal(parsed.rule.name), Component.literal(parsed.rule.letter));
  };
  FillerPresentations.registerName(A.badgeId, name);
  A.species.forEach(species => FillerPresentations.registerFoil(species.item, stack => !!A.read(stack).payload));
  // Catalog/rules run at higher startup priorities than this 1700 bridge.
  let attributeNames = [];
  // Call after any supported catalog extension before evaluating scores again.
  A.rebuildAttributeNames = () => {
    attributeNames = [];
    Object.keys(A.byIdentity).forEach(key => A.byIdentity[key].badgeChannels.forEach(c => {
      if (attributeNames.indexOf(c.attribute) < 0) attributeNames.push(c.attribute);
    }));
  };
  A.rebuildAttributeNames();
  let overworldTime = (player, s) => {
    let server = player.getServer();
    return server ? Number(server.overworld().getDayTime()) : A.clientDayTime === null ? Number(s.dayTime()) : A.clientDayTime + Number(s.gameTime()) - A.clientClockTime;
  };
  A.playerState = (player, s) => {
    let attrs = {};
    attributeNames.forEach(id => { let v = s.attribute(id); attrs[id] = Number.isFinite(v) ? v : 0; });
    // Server calculation uses overworld time, as required by the amethyst rules.
    let dayTime = overworldTime(player, s);
    return {
      healthRatio: s.healthRatio(), level: s.experienceLevel(), experienceProgress: s.experienceProgress(), food: s.food(),
      onGround: s.onGround(), crouching: s.crouching(), raining: s.raining(), thundering: s.thundering(),
      gameTime: Number(s.gameTime()), overworldDayTime: dayTime,
      mainHandDamageable: s.mainHandDamageable(), mainHandRemaining: s.mainHandRemaining(), attributes: attrs
    };
  };
  // Only this audited adapter reads these memo values. Never cache writers/results/env.
  let memo = (ctx, key, create, wholeRound) => {
    let supported = false;
    try { supported = typeof ctx.memoGet === 'function' && typeof ctx.roundMemoGet === 'function'; } catch (ignored) {}
    if (!supported) return create();
    let value = wholeRound ? ctx.roundMemoGet(key) : ctx.memoGet(key);
    if (value !== null && value !== undefined) return value;
    value = create();
    if (wholeRound) ctx.roundMemoPut(key, value); else ctx.memoPut(key, value);
    return value;
  };
  let pureState = ctx => memo(ctx, 'sdbf:player-state', () => A.playerState(ctx.player(), ctx.state()), true);
  let lazy = (object, key, create) => {
    let ready = false, value;
    Object.defineProperty(object, key, { enumerable: true, get: () => {
      if (!ready) { value = create(); ready = true; }
      return value;
    } });
  };
  let environment = (ctx, metadataOnly) => {
    let shared = memo(ctx, 'sdbf:cells', () => {
      let cells = A.list(ctx.cells()).map(c => {
        let rule = A.byIdentity[String(c.kindKey()) + '#' + String(c.variantKey())];
        let cell = {
          index: c.index(), x: c.x(), y: c.y(), inBounds: c.inBounds(), open: c.open(), occupied: c.occupied(),
          effective: c.effective(), rule: rule, view: c
        };
        // reads touches metadata only. Decode a cell at most once when calculate needs it.
        lazy(cell, 'payload', () => rule ? A.payloadFromTag(c.instanceData()).payload : undefined);
        return cell;
      });
      return { cells: cells, width: ctx.layout().width(), height: ctx.layout().height() };
    }, false);
    let cells = shared.cells, width = shared.width, height = shared.height;
    let locate = (x, y) => x >= 0 && y >= 0 && x < width && y < height ? cells[y * width + x]
      : { index: -1, x: x, y: y, inBounds: false, open: false, occupied: false, effective: false };
    let x = ctx.x(), y = ctx.y(), directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    let result = { cells: cells, x: x, y: y, index: ctx.index() };
    if (!metadataOnly) lazy(result, 'state', () => pureState(ctx));
    lazy(result, 'neighbors', () => directions.map(d => locate(x + d[0], y + d[1])));
    lazy(result, 'diagonal', () => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(d => locate(x + d[0], y + d[1])));
    lazy(result, 'mirror', () => [locate(width - 1 - x, height - 1 - y)]);
    lazy(result, 'squares', () => Math.max(width, height) >= 2 ? A.list(ctx.squaresContainingSelf(2)).map(list => A.list(list).map(c => locate(c.x(), c.y()))) : []);
    lazy(result, 'gapTwo', () => directions.filter(d => { let c = locate(x + d[0], y + d[1]); return c.open && !c.occupied; }).map(d => locate(x + 2 * d[0], y + 2 * d[1])));
    lazy(result, 'rays', () => directions.map(d => { let ray = []; for (let j = 1; ; j++) { let c = locate(x + j * d[0], y + j * d[1]); if (!c.inBounds || !c.open || !c.effective || !c.rule || c.rule.role !== 'producer') break; ray.push(c); } return ray; }));
    result.cluster = (index, item) => {
      let start = cells[index], seen = {}, queue = start ? [start] : [], out = [];
      for (let head = 0; head < queue.length; head++) {
        let c = queue[head]; if (seen[c.index] || !c.effective || !c.rule || c.rule.item !== item) continue; seen[c.index] = true; out.push(c);
        directions.forEach(d => { let n = locate(c.x + d[0], c.y + d[1]); if (n.inBounds) queue.push(n); });
      }
      return out;
    };
    return result;
  };
  let sources = (r, env) => r.geometry === 'rays' ? env.rays.reduce((o, ray) => o.concat(ray), []) : r.geometry === 'squares' ? env.squares.reduce((o, s) => o.concat(s), []) : r.geometry === 'orthogonal' ? env.neighbors : env[r.geometry];
  let scores = sheet => { let out = {}; Object.keys(A.scoreNames).forEach(s => { out[s] = sheet.get(ScoreType[s]); }); return out; };
  A.intrinsic = (r, data, state, p) => {
    let out = {}, eff = A.weighted(A.effective(data), r.main), amount = N(r.role === 'producer' ? p.producerBase : p.readerBase).multiply(N(eff));
    let seed = r.seed;
    if (r.kind === 5 && r.primary === 'alpha') { let time = state.overworldDayTime % 24000; seed = [time >= 13000 && time < 23000 ? 'MAGIC' : 'AGILITY']; }
    seed.forEach(s => { out[s] = amount.divide(N(seed.length)); }); return out;
  };
  // An inventory item has no placement: omit all neighbor and boundary bonuses.
  A.previewScores = (r, data, player) => {
    if (!A.balance || !player) return {};
    let state = A.playerState(player, PlayerStateSnapshot.capture(player));
    let own = { index: 0, x: 0, y: 0, effective: true, rule: r, payload: data };
    let absent = () => ({ index: -1, inBounds: true, open: false, occupied: false, effective: false });
    let env = {
      index: 0, x: 0, y: 0, cells: [own], neighbors: [absent(), absent(), absent(), absent()],
      diagonal: [], mirror: [], squares: [], rays: [], gapTwo: [], cluster: () => [own], state: state
    };
    let p = A.parameters(r);
    return A.evaluate(r, data, env, {}, A.intrinsic(r, data, state, p), N, p);
  };
  let definitionBuilder = () => {
    let builder = FillerDefinition.builder();
    try { if (typeof builder.readOnlySnapshot === 'function') return builder.readOnlySnapshot(); } catch (ignored) {}
    return builder;
  };
  AstralFillers.register(A.fillerId, definitionBuilder().activation(FillerActivation.STACKABLE)
    .node(ctx => {
      let parsed = A.read(ctx.filler()); if (!parsed.payload) return FillerNode.invalid(parsed.error);
      if (!A.balance) return FillerNode.invalid('sdbf_astral_balance_pending');
      let r = parsed.rule, own = parsed.payload, parameters = A.parameters(r);
      return FillerNode.builder().kindKey(r.item).variantKey(r.primary).ruleKey(r.key).role(r.role).data(A.encode(parsed.payload))
        .intrinsic((ctx, data, out) => { let state = r.kind === 5 && r.primary === 'alpha' ? { overworldDayTime: overworldTime(ctx.player(), ctx.state()) } : {}; let result = A.intrinsic(r, own, state, parameters); Object.keys(result).forEach(s => out.add(ScoreType[s], result[s])); })
        .reads((ctx, data) => {
          let env = environment(ctx, true), plan = ReadPlan.builder(), selected = sources(r, env);
          let views = new ArrayList(); selected.filter(c => c.index !== env.index && c.view).forEach(c => views.add(c.view));
          r.ports.forEach(port => {
            let filter = FillerFilter.where(c => c.effective() && String(c.actualItemId()) === A.fillerId && A.allowed(port, A.byIdentity[String(c.kindKey()) + '#' + String(c.variantKey())]));
            if (port.mode === 'base') plan.baseScores(port.name, views, filter); else plan.finalScores(port.name, views, filter);
          }); return plan.build();
        })
        .calculate((ctx, data, inputs, out) => {
          let input = {}; r.ports.forEach(port => { input[port.name] = A.list(inputs.results(port.name)).map(x => ({ index: x.cellRef(), identity: String(x.kindKey()) + '#' + String(x.variantKey()), scores: scores(port.mode === 'base' ? x.baseScores() : x.finalScores()), baseTotal: x.baseTotal() })); });
          let base = {}; Object.keys(A.scoreNames).forEach(s => { base[s] = out.get(ScoreType[s]); });
          let result = A.evaluate(r, own, environment(ctx, false), input, base, N, parameters);
          Object.keys(result).forEach(s => out.set(ScoreType[s], result[s]));
        }).build();
    }).build());
  AstralFillers.register(A.badgeId, definitionBuilder().activation(FillerActivation.STACKABLE)
    .effectGroup('sdbf:astral_gem_badge', EffectScope.PLAYER)
    .node(ctx => {
      let parsed = A.read(ctx.filler()); if (!parsed.payload) return FillerNode.invalid(parsed.error);
      if (!A.balance) return FillerNode.invalid('sdbf_astral_balance_pending');
      if (!parsed.rule.badgeChannels.some(c => !!A.balance.badge.attributes[c.attribute])) return FillerNode.invalid('sdbf_astral_attribute_pending');
      return FillerNode.builder().kindKey(A.badgeId).variantKey(parsed.rule.identity).ruleKey('sdbf:gem_badge').role('badge').data(A.encode(parsed.payload)).build();
    })
    .bigMedal((ctx, sheet, out) => {
      let parsed = A.read(ctx.filler()); if (!parsed.payload || !A.balance) return;
      let r = parsed.rule, b = A.balance.badge, eff = A.weighted(A.effective(parsed.payload), r.badgeMain);
      let eta = Math.pow(Math.log1p(eff) / Math.log1p(b.referenceEfficiency), b.efficiencyPower);
      r.badgeChannels.forEach(channel => {
        let input = channel.scores.reduce((s, type) => s.add(sheet.get(ScoreType[type]).max(AstralNumber.ZERO)), AstralNumber.ZERO);
        let compressed = input.divide(AstralNumber.parse(b.scoreScale)).log1p() * b.scoreCoefficient;
        let config = b.attributes[channel.attribute];
        if (!config) return;
        let value = compressed * eta * config.factor * (r.badgeChannels.length > 1 ? b.multiAttributeFactor : 1);
        if (!Number.isFinite(value)) throw new Error('nonfinite_badge_output');
        if (config.operation === 'add') out.add(channel.attribute, value);
        else if (config.operation === 'multiplyTotal') out.multiplyTotal(channel.attribute, value);
        else if (config.operation === 'multiplyBase') out.multiplyBase(channel.attribute, value);
        else throw new Error('unknown_badge_operation');
      });
    }).build());
  ['warrior_medal', 'wayfarer_medal', 'warden_medal'].forEach(id => AstralFillers.disable('deeprealm_4th:' + id));
  let raw = stack => { let p = A.read(stack); return !!p.payload && A.itemId(stack) === p.rule.item; };
  AstralDataPredicates.register('sdbf:astral_raw_gem', raw);
  let transfer = ctx => GemPayloadTransfer.toFiller(ctx.source('gem'), A.gemKey, ctx.template(), A.gemKey);
  let embed = ctx => GemPayloadTransfer.embed(ctx.source('gem'), A.gemKey, ctx.source('badge'), A.badgeKey);
  let register = (id, check, run) => AstralTransforms.register(id, check,
    ctx => { let r = run(ctx); return r.ok() ? AstralTransforms.previewItem(r.stack()) : AstralTransforms.failedPreview(r.error()); },
    ctx => { let r = run(ctx); return r.ok() ? AstralTransforms.producedItem(r.stack()) : AstralTransforms.failedProduce(r.error()); });
  let craftReady = ctx => !!ctx.player();
  register('sdbf:astral_gem_to_filler', ctx => craftReady(ctx) && raw(ctx.source('gem')) && A.itemId(ctx.template()) === A.fillerId, transfer);
  register('sdbf:astral_embed_gem', ctx => craftReady(ctx) && raw(ctx.source('gem')) && A.itemId(ctx.source('badge')) === A.badgeId, embed);
})();
