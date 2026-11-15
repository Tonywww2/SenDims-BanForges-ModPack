// 测试假人只能放在主世界 Y290 以上，其他位置在加入世界时直接移除（放置和区块重新加载都会经过这里）。
// 原先监听 LivingTickEvent：每个生物每 tick 都要进一次脚本，单人游戏时客户端渲染线程也会触发，
// 与服务端脚本争用 KubeJS 的全局锁；2026-11-14 的卡死日志里渲染线程就卡在这个回调上。
EntityEvents.spawned('powerful_dummy:test_dummy', event => {
    let entity = event.entity;
    if (String(entity.level.dimension) == 'minecraft:overworld' && entity.y > 290) return;
    event.cancel();
});
