// 仪式与基岩破坏者的客户端一侧：与服务端相同条件下取消本地交互。
// 取消后客户端不再预测物品使用（也不会接着对空气使用物品），点击仍会发给服务端，由服务端执行仪式和特效。
let ritualClientMatch = (itemId, blockId, emptyHand, sneaking) => {
    let triggers = global.sdbfRitualTriggers;
    if (!triggers) return false;
    let breaker = triggers.bedrockBreaker;
    if (breaker && itemId === String(breaker[0]) && blockId === String(breaker[1])) return true;
    for (let pair of triggers.rituals) {
        if (blockId !== String(pair[1])) continue;
        if (itemId === String(pair[0])) return true;
        if (emptyHand && sneaking) return true;
    }
    return false;
};

BlockEvents.rightClicked(event => {
    if (String(event.hand).toUpperCase() !== 'MAIN_HAND') return;
    let itemId = String(event.item.getId());
    let blockId = String(event.block.id);
    if (ritualClientMatch(itemId, blockId, event.item.isEmpty(), event.player.isShiftKeyDown())) {
        event.cancel();
    }
});
