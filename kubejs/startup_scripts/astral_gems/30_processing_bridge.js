// priority: 1600
// Register consumables and their stacking callbacks with explicit item IDs.
let astralGemApplyProcessing = (event, reversed) => {
  return global.sdbfAstral.stackInteraction(event, 'generate', reversed);
};
let astralGemApplyEnhancement = (event, reversed) => {
  return global.sdbfAstral.stackInteraction(event, 'enhance', reversed);
};
let astralGemMakeFiller = event => {
  return global.sdbfAstral.stackInteraction(event, 'filler');
};
let astralGemUseBadge = event => {
  return global.sdbfAstral.stackInteraction(event, 'badge');
};

StartupEvents.registry('item', event => {
  let system = global.sdbfAstral;

  Object.keys(system.processing.tiers).forEach(tier => {
    let id = system.processing.tiers[tier].id;
    event.create(id.split(':')[1]).maxStackSize(64).texture('kubejs:item/' + id.split(':')[1]);
    system.meonother(id, astralGemApplyProcessing);
  });
  Object.keys(system.processing.enhancements).forEach(kind => {
    let id = system.processing.enhancements[kind].id;
    event.create(id.split(':')[1]).maxStackSize(64).texture('kubejs:item/' + id.split(':')[1]);
    system.meonother(id, astralGemApplyEnhancement);
  });
  system.meonother('minecraft:paper', astralGemMakeFiller);
  system.meonother(system.badgeId, astralGemUseBadge);
});

let initializeAstralGemProcessingBridge = () => {
  let A = global.sdbfAstral;
  if (!A.apiReady) return;
  let Compound = Java.loadClass('net.minecraft.nbt.CompoundTag'), ArrayList = Java.loadClass('java.util.ArrayList');
  let HashMap = Java.loadClass('java.util.HashMap');
  let Output = Java.loadClass('com.tonywww.deeprealm4th.astral.process.AstralTransforms$ProcessOutput');
  let Result = Java.loadClass('com.tonywww.deeprealm4th.astral.process.AstralTransforms$Result');
  A.hasGemData = stack => { let tag = stack.getNbt(); return !!tag && (tag.contains(A.gemKey) || tag.contains(A.badgeKey)); };
  A.enhancementUses = data => {
    let ext = data.extensions;
    if (!ext || !ext.contains('enhancement_uses')) return 0;
    if (!ext.contains('enhancement_uses', 3)) throw new Error('invalid_enhancement_count');
    let used = ext.getInt('enhancement_uses'); if (used < 0) throw new Error('invalid_enhancement_count'); return used;
  };
  A.generateProcessed = (item, tier, random, luck) => {
    let data = A.rollGem(item, tier, random, luck); data.extensions = new Compound();
    data.extensions.putBoolean('processed', true); data.extensions.putString('processing_tier', tier);
    data.extensions.putInt('probability_version', A.processing.generationVersion); data.extensions.putInt('enhancement_uses', 0);
    return data;
  };
  A.enhanceStack = (stack, kind) => {
    let parsed = A.read(stack); if (!parsed.payload) throw new Error('invalid_gem');
    let used = A.enhancementUses(parsed.payload), data = A.enhanceData(parsed.payload, kind, used);
    data.extensions = parsed.payload.extensions.copy(); data.extensions.putInt('enhancement_uses', used + 1);
    return A.write(stack.copyWithCount(1), data);
  };
  A.processingMessage = error => {
    let key = String(error.message || error);
    if (key === 'enhancement_limit') return '强化次数已满。';
    if (key === 'no_negative_affixes') return '无负面词条。';
    if (key === 'already_processed') return '宝石已加工。';
    if (key === 'inapplicable_agent') return '加工剂不适用。';
    if (key === 'badge_socket_occupied') return '徽章已镶嵌宝石。';
    return '宝石数据无效。';
  };
  let fail = A.processingMessage;
  let preview = fn => ctx => { try { return AstralTransforms.previewItem(fn(ctx)); } catch (error) { return AstralTransforms.failedPreview(fail(error)); } };
  let produce = fn => ctx => { try { return AstralTransforms.producedItem(fn(ctx)); } catch (error) { return AstralTransforms.failedProduce(fail(error)); } };
  let source = ctx => ctx.source('gem');
  let sourceItem = stack => !!A.byItem[A.itemId(stack)];
  AstralDataPredicates.register('sdbf:astral_source_item', sourceItem);
  AstralDataPredicates.register('sdbf:astral_gem_target', stack => A.isSystemStack(stack));
  let materials = Object.keys(A.processing.materials).map(key => A.processing.materials[key]);
  AstralDataPredicates.register('sdbf:astral_material', stack => materials.indexOf(A.itemId(stack)) >= 0);
  AstralDataPredicates.register('sdbf:astral_badge_item', stack => A.itemId(stack) === A.badgeId);
  A.species.forEach(s => AstralDataPredicates.register('sdbf:astral_badge_source_' + s.number, stack => {
    let parsed = A.read(stack); return A.itemId(stack) === A.badgeId && !!parsed.payload && parsed.payload.source_item === s.item;
  }));
  let processing = ctx => {
    let gem = source(ctx), item = A.itemId(gem), tier = A.agentTiers[A.itemId(ctx.source('agent'))];
    if (!A.canProcess(item, tier)) throw new Error('inapplicable_agent');
    if (A.hasGemData(gem)) throw new Error('already_processed');
    if (!A.processing.generationEnabled) throw new Error('generation_pending');
    return { gem: gem, item: item, tier: tier };
  };
  AstralTransforms.register('sdbf:astral_generate_gem', ctx => sourceItem(source(ctx)),
    preview(ctx => processing(ctx).gem.copyWithCount(1)),
    produce(ctx => {
      let input = processing(ctx), player = ctx.player(), luck = player ? player.getLuck() : 0;
      return A.write(input.gem.copyWithCount(1), A.generateProcessed(input.item, input.tier, Math.random, luck));
    }));
  let target = ctx => {
    let parsed = A.read(source(ctx)); if (!parsed.payload) throw new Error('invalid_gem'); return parsed;
  };
  AstralTransforms.register('sdbf:astral_enhance_gem', ctx => A.isSystemStack(source(ctx)),
    preview(ctx => { target(ctx); return A.enhanceStack(source(ctx), A.enhancementKinds[A.itemId(ctx.source('agent'))]); }),
    produce(ctx => { target(ctx); return A.enhanceStack(source(ctx), A.enhancementKinds[A.itemId(ctx.source('agent'))]); }));
  A.extractBadge = badge => {
    let parsed = A.read(badge); if (A.itemId(badge) !== A.badgeId || !parsed.payload) throw new Error('invalid_gem');
    let gem = A.write(Item.of(parsed.payload.source_item), parsed.payload);
    let empty = badge.copyWithCount(1), data = AstralItemData.read(empty, A.badgeKey);
    data.remove('gem');
    empty = data.isEmpty() ? AstralItemData.removeCopy(empty, A.badgeKey) : AstralItemData.writeCopy(empty, A.badgeKey, data);
    // Remove only our generated name; retain an independently assigned custom name.
    let tag = empty.getNbt();
    if (tag && tag.contains('display', 10)) {
      let display = tag.getCompound('display');
      if (display.getString('Name').indexOf('name.sdbf_astral.badge') >= 0) { display.remove('Name'); if (display.isEmpty()) tag.remove('display'); }
    }
    return { gem: gem, badge: empty };
  };
  AstralTransforms.register('sdbf:astral_extract_gem', ctx => A.itemId(source(ctx)) === A.badgeId,
    preview(ctx => { target(ctx); return A.extractBadge(source(ctx)).gem; }),
    ctx => {
      try {
        target(ctx); let extracted = A.extractBadge(source(ctx)), returned = new ArrayList(); returned.add(extracted.badge);
        return Result.success(new Output(extracted.gem, new HashMap(), returned));
      } catch (error) { return AstralTransforms.failedProduce(fail(error)); }
    });
};
initializeAstralGemProcessingBridge();
