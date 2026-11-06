// priority: 110
// 结构召唤仪式、传送门仪式和基岩破坏者共用的特效工具：主题、粒子、音效、标题、逐 tick 时间线。
// 全部在服务端执行，通过原版命令和数据包发给客户端，客户端无需额外模组。开关见 configs.js 的 global.ritualFx。

let RITUAL_THEMES = {
    // dust: [起始色 RGB, 结束色 RGB]；converge: 汇聚粒子；accent: 点缀粒子；extra: 余韵粒子；chime: 主题音效
    default: { dust: ['1 1 1', '0.75 0.6 1'], converge: 'minecraft:enchant', accent: 'minecraft:end_rod', extra: 'minecraft:enchant', chime: 'minecraft:block.beacon.ambient' },
    aether: { dust: ['0.98 0.82 0.35', '1 1 1'], converge: 'minecraft:enchant', accent: 'minecraft:end_rod', extra: 'minecraft:cloud', chime: 'minecraft:block.amethyst_block.chime' },
    undergarden: { dust: ['0.35 0.9 0.75', '0.1 0.35 0.25'], converge: 'minecraft:enchant', accent: 'minecraft:soul_fire_flame', extra: 'minecraft:sculk_soul', chime: 'minecraft:entity.warden.heartbeat' },
    tofu: { dust: ['0.98 0.96 0.88', '1 0.92 0.6'], converge: 'minecraft:portal', accent: 'minecraft:item_snowball', extra: 'minecraft:cloud', chime: 'minecraft:block.wool.place' },
    deep_realm_1: { dust: ['0.75 0.3 0.2', '1 0.55 0.15'], converge: 'minecraft:portal', accent: 'minecraft:lava', extra: 'minecraft:ash', chime: 'minecraft:block.furnace.fire_crackle' },
    deep_realm_2: { dust: ['0.3 0.85 0.85', '0.35 0.9 0.45'], converge: 'minecraft:portal', accent: 'minecraft:glow', extra: 'minecraft:spore_blossom_air', chime: 'minecraft:block.amethyst_block.resonate' },
    return: { dust: ['0.6 0.3 0.9', '0.1 0.05 0.15'], converge: 'minecraft:portal', accent: 'minecraft:reverse_portal', extra: 'minecraft:falling_obsidian_tear', chime: 'minecraft:block.respawn_anchor.ambient' },
    bedrock: { dust: ['0.45 0.45 0.45', '1 0.4 0.1'], converge: 'minecraft:portal', accent: 'minecraft:lava', extra: 'minecraft:crimson_spore', chime: 'minecraft:block.deepslate.hit' }
};

let RitualFx = (() => {
    let cfg = () => {
        let c = global.ritualFx || {};
        return {
            charge: c.charge !== false,
            darkness: c.darkness !== false,
            screenShake: c.screenShake !== false,
            particles: c.particles !== false
        };
    };
    let num = n => String(Math.round(n * 1000) / 1000);
    let dimOf = level => String(level.getDimension());
    let theme = name => RITUAL_THEMES[name] || RITUAL_THEMES.default;
    let dust = th => `minecraft:dust_color_transition ${th.dust[0]} 1.2 ${th.dust[1]}`;
    let warned = {};
    let warnOnce = (key, error) => {
        if (warned[key]) return;
        warned[key] = true;
        console.warn(`[ritual_fx] ${key} 不可用，已跳过：${error}`);
    };

    // viewer 为玩家时只发给该玩家（预览、诊断，不受开关影响）；否则发给 48 格内的玩家（关闭 particles 时不发）。
    let particle = (level, type, x, y, z, dx, dy, dz, speed, count, viewer) => {
        let target;
        if (viewer) target = String(viewer.name.string);
        else if (cfg().particles) target = '@a[distance=..48]';
        else return;
        level.server.runCommandSilent(`execute in ${dimOf(level)} positioned ${num(x)} ${num(y)} ${num(z)} run particle ${type} ~ ~ ~ ${num(dx)} ${num(dy)} ${num(dz)} ${num(speed)} ${count} force ${target}`);
    };
    // 让单个粒子从 (fx,fy,fz) 飞向 (tx,ty,tz)：enchant / portal 粒子在 count=0 时以给定坐标为终点。
    let fly = (level, type, fx, fy, fz, tx, ty, tz, viewer) => particle(level, type, tx, ty, tz, fx - tx, fy - ty, fz - tz, 1, 0, viewer);
    // 以 (x,y,z) 为起点向 (vx,vy,vz) 方向发射单个粒子。
    let shoot = (level, type, x, y, z, vx, vy, vz, speed) => particle(level, type, x, y, z, vx, vy, vz, speed, 0, null);
    let sound = (level, id, x, y, z, volume, pitch, viewer) => {
        let target = viewer ? String(viewer.name.string) : '@a[distance=..32]';
        level.server.runCommandSilent(`execute in ${dimOf(level)} positioned ${num(x)} ${num(y)} ${num(z)} run playsound ${id} block ${target} ~ ~ ~ ${num(volume)} ${num(pitch)}`);
    };
    let ring = (level, type, x, y, z, radius, points, phase, viewer) => {
        for (let i = 0; i < points; i++) {
            let a = phase + Math.PI * 2 * i / points;
            particle(level, type, x + Math.cos(a) * radius, y, z + Math.sin(a) * radius, 0, 0, 0, 0, 1, viewer);
        }
    };
    let shockwave = (level, type, x, y, z, points, speed) => {
        for (let i = 0; i < points; i++) {
            let a = Math.PI * 2 * i / points;
            shoot(level, type, x, y, z, Math.cos(a), 0.02, Math.sin(a), speed);
        }
    };
    let column = (level, type, x, y, z, height, density) => {
        particle(level, type, x, y + height / 2, z, 0.06, height / 2, 0.06, 0.005, Math.max(1, Math.round(height * density)), null);
    };
    // 在方块位置显示应放方块的虚影（原版 block_marker 粒子，约 4 秒），只给该玩家看。
    let ghost = (level, player, pos, blockId) => particle(level, `minecraft:block_marker ${blockId}`, pos.x + 0.5, pos.y + 0.5, pos.z + 0.5, 0, 0, 0, 0, 1, player);
    let actionbar = (player, component) => player.setStatusMessage(component);
    let subtitle = (player, json) => {
        let name = String(player.name.string);
        let server = player.server;
        server.runCommandSilent(`title ${name} times 5 40 15`);
        server.runCommandSilent(`title ${name} subtitle ${json}`);
        server.runCommandSilent(`title ${name} title ""`);
    };
    let darkness = (player, ticks) => {
        if (cfg().darkness) player.potionEffects.add('minecraft:darkness', ticks, 0, false, false);
    };
    let lightning = (level, x, y, z) => {
        try {
            let bolt = level.createEntity('minecraft:lightning_bolt');
            bolt.setVisualOnly(true);
            // KubeJS 的 setPosition；moveTo 是有多个重载的原版方法，三个数字的调用可能被解析错。
            bolt.setPosition(x, y, z);
            level.addFreshEntity(bolt);
        } catch (error) {
            warnOnce('visual lightning', error);
        }
    };
    let shake = (level, x, y, z, radius, magnitude, duration, fade) => {
        if (!cfg().screenShake) return;
        try {
            let $Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
            let $Shake = Java.loadClass('com.github.L_Ender.cataclysm.entity.effect.ScreenShake_Entity');
            $Shake.ScreenShake(level, new $Vec3(x, y, z), radius, magnitude, duration, fade);
        } catch (error) {
            warnOnce('cataclysm screen shake', error);
        }
    };
    // 逐 tick 推进：onTick(t) 在 t = 0..ticks 依次调用；返回 false 时停止。
    // onTick 抛错时记录日志、调用 onError（用于解锁和提示玩家）并停止，不让仪式卡在半途。
    let timeline = (server, ticks, onTick, onError) => {
        let step = t => {
            let keep;
            try {
                keep = onTick(t);
            } catch (error) {
                console.error(`[ritual_fx] 时间线第 ${t} tick 出错，已中止：${error}`);
                if (onError) {
                    try { onError(error); } catch (inner) { console.error(`[ritual_fx] 中止处理出错：${inner}`); }
                }
                return;
            }
            if (keep === false || t >= ticks) return;
            server.scheduleInTicks(1, callback => step(t + 1));
        };
        step(0);
    };

    return {
        cfg: cfg, dimOf: dimOf, theme: theme, dust: dust,
        particle: particle, fly: fly, shoot: shoot, sound: sound, ring: ring, shockwave: shockwave, column: column,
        ghost: ghost, actionbar: actionbar, subtitle: subtitle, darkness: darkness,
        lightning: lightning, shake: shake, timeline: timeline
    };
})();
