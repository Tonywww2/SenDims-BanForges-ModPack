const LivingAttackEvent = Java.loadClass('net.minecraftforge.event.entity.living.LivingAttackEvent');
const LivingHurtEvent = Java.loadClass('net.minecraftforge.event.entity.living.LivingHurtEvent');
const MinecraftForge = Java.loadClass('net.minecraftforge.common.MinecraftForge');
const EventPriority = Java.loadClass('net.minecraftforge.eventbus.api.EventPriority');

// // === 新增：引入原版 Player 类 ===
// // === NEW: Import vanilla Player class ===
// const PlayerClass = Java.loadClass('net.minecraft.world.entity.player.Player');

// let attackDamageMap = {};

// // 1. Attack 阶段 (Attack Phase)
// MinecraftForge.EVENT_BUS.addListener(EventPriority.HIGHEST, false, LivingAttackEvent, event => {
//     let entity = event.getEntity();
    
//     // === 新增：如果不是玩家，直接跳过 (If not a player, skip directly) ===
//     if (!(entity instanceof PlayerClass)) return;

//     let entityId = entity.getUuid().toString();
//     attackDamageMap[entityId] = event.getAmount();
// });

// // 2. Hurt 阶段 (Hurt Phase)
// MinecraftForge.EVENT_BUS.addListener(EventPriority.HIGHEST, false, LivingHurtEvent, event => {
//     global.test(event);
// });

// global.test = (event) => {
//     let entity = event.getEntity();
    
//     // === 新增：如果不是玩家，直接跳过 (If not a player, skip directly) ===
//     if (!(entity instanceof PlayerClass)) return;

//     let entityId = entity.getUuid().toString();
    
//     let attackAmount = attackDamageMap[entityId];
//     let hurtAmount = event.getAmount();
    
//     if (!attackAmount || attackAmount === hurtAmount) {
//         delete attackDamageMap[entityId];
//         return; 
//     }
    
//     console.info(`\n[BlindSpot] 发现异常伤害衰减！玩家 (Player): ${entity.getName().getString()}`);
//     console.info(`[BlindSpot] Attack 数值: ${attackAmount} -> Hurt 数值: ${hurtAmount}`);
    
//     try {
//         let hurtResistantTime = entity.invulnerableTime || entity.minecraftEntity.invulnerableTime;
//         console.info(`[BlindSpot] 玩家当前无敌帧 (Player I-Frame timer): ${hurtResistantTime}`);
//         if (hurtResistantTime > 10) {
//             console.info(`[BlindSpot] ⚠️ 高度怀疑是原版无敌帧导致了伤害相减！`);
//         }
//     } catch (e) {}

// console.info(`[BlindSpot] 正在抓取底层调用栈 (Dumping Call Stack)...`);
    
//     let stackTrace = [];
//     try {
//         // 故意触发一个 Java 原生的 IllegalArgumentException
//         // Intentionally trigger a native Java IllegalArgumentException
//         Java.loadClass('java.util.UUID').fromString("fake-uuid-to-get-stack");
//     } catch (err) {
//         // KubeJS (Rhino 引擎) 会将底层的 Java 异常包装在 err.javaException 中
//         // KubeJS (Rhino engine) wraps the underlying Java exception in err.javaException
//         let javaException = err.javaException || err;
//         if (javaException.getStackTrace) {
//             stackTrace = javaException.getStackTrace();
//         }
//     }
    
//     // 打印最近的 20 步调用，寻找 Mixin 的痕迹
//     // Print the nearest 20 calls to look for Mixin traces
//     for (let i = 0; i < Math.min(80, stackTrace.length); i++) {
//         let traceLine = stackTrace[i].toString();
//         if (traceLine.includes("mixin") || traceLine.includes("handler") || traceLine.includes("inject")) {
//             console.info(`  ---> 🚨 可疑 Mixin/注入: ${traceLine}`);
//         } else {
//             console.info(`       ${traceLine}`);
//         }
//     }
//     console.info(`====================================\n`);
    
//     delete attackDamageMap[entityId];
// }