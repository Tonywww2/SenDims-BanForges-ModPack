// 获取所需的 Java 类
// Load required Java classes
const IEventListener = Java.loadClass('net.minecraftforge.eventbus.api.IEventListener');

/**
 * 专为 Tetra 自定义事件设计的底层劫持函数
 * Low-level hijack function tailored for Tetra's custom events
 */
function installTetraEventHook(eventClassPath, shortName) {
    const EventClass = Java.loadClass(eventClassPath);
    global.hookInstalled = false;

    MinecraftForge.EVENT_BUS.addListener(
        EventPriority.HIGHEST,
        false,
        EventClass,
        evt => {
            global.test2(evt, shortName)
        }
    );
}

global.test2 = (evt, shortName) => {
    if (global.hookInstalled) return;
    global.hookInstalled = true;

    try {
        console.info(`[${shortName}] 检测到首次事件，正在劫持底层事件总线...`);

        let listenerList = evt.getListenerList();

        let busClass = MinecraftForge.EVENT_BUS.getClass();
        let busIdField = busClass.getDeclaredField("busID");
        busIdField.setAccessible(true);
        let busId = busIdField.get(MinecraftForge.EVENT_BUS);

        // 动态获取 getListeners 方法
        let getListenersMethod;
        for (let m of listenerList.getClass().getMethods()) {
            if (m.getName() === "getListeners") {
                getListenersMethod = m;
                break;
            }
        }

        // 拿到真实的底层处理器数组
        let listenersArray = getListenersMethod.invoke(listenerList, busId);
        let wrappedCount = 0;

        for (let i = 0; i < listenersArray.length; i++) {
            let originalListener = listenersArray[i];
            let handlerName = originalListener.toString();

            // 防止死循环，跳过我们自己
            if (handlerName.includes("KubeJS") || handlerName.includes("Proxy")) {
                continue;
            }

            let proxyListener = new IEventListener({
                invoke: function (e) {
                    // --- 玩家过滤逻辑 ---
                    let entity = null;
                    try { entity = e.getEntity(); } catch (err) { }

                    // if (entity && !(entity instanceof Internal.Player)) {
                    //     originalListener.invoke(e);
                    //     return;
                    // }

                    // --- 动态获取伤害数值的安全函数 ---
                    // 由于源码中可能使用 getResultAmount 或 getAmount，我们双管齐下
                    let getEventValue = function (eventObj) {
                        try { return eventObj.getResultAmount(); } catch (err1) {
                            try { return eventObj.getAmount(); } catch (err2) {
                                return 0;
                            }
                        }
                    };

                    // 记录执行前的值
                    let amountBefore = getEventValue(e);

                    // 执行该模组的原始逻辑
                    originalListener.invoke(e);

                    // 记录执行后的值
                    let amountAfter = getEventValue(e);

                    console.info(`[${shortName} Detail] 处理器: ${handlerName} | 数值: ${amountBefore} -> ${amountAfter}`);

                    // 抓捕修改数值的真凶！
                    if (amountBefore !== amountAfter) {
                        console.info(`\n 🚨 >>> [抓到你了! CULPRIT FOUND!] <<< 🚨`);
                        console.info(`模组处理器 (Mod Handler): ${handlerName}`);
                        console.info(`将伤害改变了 (Modified amount by): ${amountAfter - amountBefore}\n`);
                    }
                }
            });

            listenersArray[i] = proxyListener;
            wrappedCount++;
        }
        console.info(`[${shortName}] 劫持成功！已代理 ${wrappedCount} 个处理器。\n`);

    } catch (err) {
        console.error(`[${shortName}] 底层注入失败: ` + err);
    }
}

// ==========================================
// 启动劫持逻辑 / Start Hijacking Logic
// ==========================================

// 注意：Java 的静态内部类在反射时必须使用 '$' 连接
// Note: Java static inner classes must be accessed using '$' in reflection

installTetraEventHook('net.tetra.modify.api.event.LivingHurtEvent$Pre', 'Tetra-Pre');
installTetraEventHook('net.tetra.modify.api.event.LivingHurtEvent$Post', 'Tetra-Post');