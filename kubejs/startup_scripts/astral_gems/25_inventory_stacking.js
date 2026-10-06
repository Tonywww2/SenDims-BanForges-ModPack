// priority: 1650
// Register callbacks with explicit item IDs, then dispatch the Forge stacking event.
let initializeAstralGemStacking = () => {
  let A = global.sdbfAstral;
  let handlers = {};
  A.meonother = (itemId, callback) => {
    handlers[String(itemId)] = callback;
  };
  if (!A.apiReady) return;
  let Stacked = Java.loadClass('net.minecraftforge.event.ItemStackedOnOtherEvent');
  let Priority = Java.loadClass('net.minecraftforge.eventbus.api.EventPriority');
  let Runtime = Java.loadClass('com.tonywww.deeprealm4th.astral.AstralRuntime');

  let finishAstralGemInteraction = (event, success) => {
    let player = event.getPlayer();
    let config = A.processing.interaction;
    let itemIds = Object.keys(handlers);
    itemIds.push(A.badgeId, A.fillerId);
    let cursor = event.getCarriedSlotAccess().get();
    let target = event.getSlot().getItem();
    if (!cursor.isEmpty()) itemIds.push(A.itemId(cursor));
    if (!target.isEmpty()) itemIds.push(A.itemId(target));
    let added = {};
    itemIds.forEach(itemId => {
      if (added[itemId]) return;
      added[itemId] = true;
      player.cooldowns.addCooldown(Item.of(itemId).getItem(), config.cooldownTicks);
    });
    if (!player.level.clientSide) {
      try {
        player.playNotifySound(success ? config.successSound : config.failureSound, player.soundSource,
          config.volume, success ? config.successPitch : config.failurePitch);
      } catch (error) {
        console.warn('[Astral gems] Interaction sound: ' + error);
      }
    }
    // Our operation has finished; suppress the original inventory interaction.
    return true;
  };

  let isAstralGemSource = stack => {
    return !!A.byItem[A.itemId(stack)];
  };

  let handleAstralGemStackInteraction = (event, operation, reversed) => {
    let player = event.getPlayer();
    // Read the actual positions: Forge 47.4.20 reverses the event's named item getters.
    let cursor = event.getCarriedSlotAccess().get();
    let target = event.getSlot().getItem();
    let gem = reversed ? cursor : target;
    let agent = reversed ? target : cursor;
    let slot = event.getSlot();
    let client = player.level.clientSide;
    let badge = operation === 'badge';
    let extract = badge && gem.isEmpty() && !!A.read(cursor).payload;
    if (cursor.isEmpty() || (!badge && gem.isEmpty())) return false;
    if (badge) {
      if (!extract && !isAstralGemSource(gem)) return false;
    } else if (operation === 'enhance') {
      if (!A.isSystemStack(gem)) return false;
    } else if (!isAstralGemSource(gem)) {
      return false;
    }
    // The badge cooldown is the shared gate for every registered gem operation.
    if (player.cooldowns.isOnCooldown(Item.of(A.badgeId).getItem())) return true;
    if (!slot.isActive() || !slot.allowModification(player)) return finishAstralGemInteraction(event, false);

    try {
      let parsed;
      let kind;
      let tier;
      if (operation === 'generate') {
        tier = A.agentTiers[A.itemId(agent)];
        if (!A.canProcess(A.itemId(gem), tier)) throw new Error('inapplicable_agent');
        if (A.hasGemData(gem)) throw new Error('already_processed');
        if (!A.processing.generationEnabled) throw new Error('generation_pending');
      } else if (!extract) {
        parsed = A.read(gem);
        if (!parsed.payload) throw new Error('invalid_gem');
        if (operation === 'enhance') {
          kind = A.enhancementKinds[A.itemId(agent)];
          A.enhanceData(parsed.payload, kind, A.enhancementUses(parsed.payload));
        }
        if (badge) {
          let tag = cursor.getNbt();
          if (tag && tag.contains(A.badgeKey)) {
            if (!tag.contains(A.badgeKey, 10)) throw new Error('invalid_gem');
            let badgeData = tag.getCompound(A.badgeKey);
            if (badgeData.contains('gem', 10)) throw new Error('badge_socket_occupied');
            if (badgeData.contains('gem')) throw new Error('invalid_gem');
          }
        }
      }

      // Reserve room before generating a unique item; a full inventory consumes nothing.
      let inventory = player.getInventory();
      let destination = !badge && gem.getCount() > 1 ? inventory.getFreeSlot() : -1;
      if (!badge && gem.getCount() > 1 && destination < 0) return finishAstralGemInteraction(event, false);
      if (!reversed && !badge && gem.getCount() === 1 && !slot.mayPlace(operation === 'filler' ? Item.of(A.fillerId) : gem)) return finishAstralGemInteraction(event, false);
      if (extract && !slot.mayPlace(Item.of(A.read(cursor).payload.source_item))) return finishAstralGemInteraction(event, false);
      if (client) return finishAstralGemInteraction(event, true);

      let output;
      let result;
      if (operation === 'generate') {
        output = A.write(gem.copyWithCount(1), A.generateProcessed(A.itemId(gem), tier, Math.random, player.getLuck()));
      } else if (operation === 'enhance') {
        output = A.enhanceStack(gem, kind);
      } else if (operation === 'filler') {
        result = GemPayloadTransfer.toFiller(gem, A.gemKey, Item.of(A.fillerId), A.gemKey);
        if (!result.ok()) throw new Error(result.error());
        output = result.stack();
      } else if (extract) {
        result = A.extractBadge(cursor);
        if (!event.getCarriedSlotAccess().set(result.badge)) return finishAstralGemInteraction(event, false);
        slot.set(result.gem);
      } else {
        result = GemPayloadTransfer.embed(gem, A.gemKey, cursor, A.badgeKey);
        if (!result.ok()) throw new Error(result.error());
        if (!event.getCarriedSlotAccess().set(result.stack())) return finishAstralGemInteraction(event, false);
        slot.set(gem.copyWithCount(gem.getCount() - 1));
      }
      if (!badge) {
        if (reversed) {
          if (!event.getCarriedSlotAccess().set(destination >= 0 ? gem.copyWithCount(gem.getCount() - 1) : output)) return finishAstralGemInteraction(event, false);
          if (destination >= 0) inventory.setItem(destination, output);
          slot.set(agent.copyWithCount(agent.getCount() - 1));
        } else {
          if (gem.getCount() === 1 && !slot.mayPlace(output)) return finishAstralGemInteraction(event, false);
          if (!event.getCarriedSlotAccess().set(cursor.copyWithCount(cursor.getCount() - 1))) return finishAstralGemInteraction(event, false);
          if (destination >= 0) {
            inventory.setItem(destination, output);
            slot.set(gem.copyWithCount(gem.getCount() - 1));
          } else {
            slot.set(output);
          }
        }
      }
      slot.setChanged();
      inventory.setChanged();
      Runtime.invalidate(player);
      if (player.containerMenu) player.containerMenu.sendAllDataToRemote();
      return finishAstralGemInteraction(event, true);
    } catch (error) {
      if (!client) {
        let expected = ['enhancement_limit', 'no_negative_affixes', 'already_processed', 'inapplicable_agent', 'badge_socket_occupied'];
        if (expected.indexOf(String(error.message || error)) < 0) console.warn('[Astral gems] Stacking ' + operation + ' (' + A.itemId(gem) + '): ' + error);
        player.displayClientMessage(Text.of(A.processingMessage(error)), true);
      }
      return finishAstralGemInteraction(event, false);
    }
  };
  A.stackInteraction = handleAstralGemStackInteraction;

  let handleAstralGemStackedOnOther = event => {
    let cursor = event.getCarriedSlotAccess().get();
    if (String(event.getClickAction().name()) !== 'SECONDARY' || cursor.isEmpty()) return false;
    let callback = handlers[A.itemId(cursor)];
    let targetId = A.itemId(event.getSlot().getItem());
    let reverseCallback = A.agentTiers[targetId] || A.enhancementKinds[targetId] ? handlers[targetId] : null;
    if (!callback && !reverseCallback) return false;
    let canceled = event.isCanceled();
    event.setCanceled(true);
    let result = callback ? callback(event, false) : false;
    if (result === false && reverseCallback) result = reverseCallback(event, true);
    // NativeEvents uses a void consumer; true must also cancel the Forge event.
    if (result === true) {
      event.setCanceled(true);
      return true;
    }
    event.setCanceled(canceled);
    return false;
  };
  NativeEvents.onEvent(Priority.HIGHEST, false, Stacked, handleAstralGemStackedOnOther);
};
initializeAstralGemStacking();
