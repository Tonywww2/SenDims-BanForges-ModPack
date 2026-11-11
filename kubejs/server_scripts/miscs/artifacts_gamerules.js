// 神器模组的饰品效果由游戏规则控制，规则保存在存档里。
// 服务端每次启动时写入一次，新存档和已有存档都按这里的值生效；在游戏里手动改过的值会在下次启动时被覆盖。
let artifactsGameRules = {
    // 村民帽的村庄声望加成，模组默认 100
    'artifacts.villagerHat.reputationBonus': 20
};

ServerEvents.loaded(event => {
    Object.keys(artifactsGameRules).forEach(rule => {
        event.server.runCommandSilent(`gamerule ${rule} ${artifactsGameRules[rule]}`);
    });
});
