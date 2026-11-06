// priority: 100

global.difficultyResetCommandEnabled = true;

global.immptEnabled = Platform.getMods().containsKey("immersive_portals");

// 结构召唤仪式、传送门仪式、基岩破坏者的特效开关（custom_spawn/ritual_fx.js）
global.ritualFx = {
    charge: true,       // false：跳过 2 秒蓄能，仪式瞬间完成
    darkness: true,     // 传送门与基岩破坏者传送前的 1 秒黑暗
    screenShake: true,  // 召唤与基岩碎裂时借用灾变模组的屏幕震动
    particles: true     // 旁人可见的公共粒子；关闭后只保留给发起者的预览和诊断虚影
};

// 难度系统 N-6 与 N-7 的全部子修正（创造物品、大量机器等补给）；false 时这些子修正不出现、不能选择。
global.difficulty_extreme_modifiers_enabled = true;

