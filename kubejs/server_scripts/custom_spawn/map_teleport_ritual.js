// 地图传送仪式：结构羽毛笔生成的地图，目标超过 3000 格时只能用仪式传送（更近的距离也可以用）。
// 结构：下层 3×3 石砖，中心上方一块雕纹石砖（核心）。主手持成品地图、副手持地图传送粉，右键雕纹石砖。
// 蓄能完成时扣除 1 个地图传送粉，地图保留；落点与直接传送相同（目标水平坐标，保持当前高度，清理头部方块）。
let $QuillMapTeleport = Java.loadClass('com.tonywww.slashblade_sendims.items.QuillMapTeleport');
let MAP_TELEPORT_POWDER = 'kubejs:map_teleport_powder';

registerStructure({
    activateItem: 'minecraft:filled_map',
    blockMapping: {
        'A': 'minecraft:stone_bricks',
        'B': 'minecraft:chiseled_stone_bricks'
    },
    patterns: RETURN_PORTAL_PATTERN,
    weakMatch: true,
    consumeActivateItem: false,
    destroyAfterSpawn: false,
    isPortal: true,
    structureName: 'map_teleport',
    theme: 'map_teleport',
    precheck: (level, centerPos, player) => {
        let refusal = $QuillMapTeleport.checkRitual(player, player.mainHandItem);
        if (refusal) return Text.translatable(String(refusal)).red();
        if (String(player.offhandItem.getId()) !== MAP_TELEPORT_POWDER) {
            return Text.translatable('info.kubejs.map_teleport.need_powder').yellow();
        }
        return null;
    },
    executeCommands: (level, centerPos, player) => {
        let powder = player.offhandItem;
        if (String(powder.getId()) !== MAP_TELEPORT_POWDER) return;
        if (!$QuillMapTeleport.ritualTeleport(player, player.mainHandItem)) return;
        if (!player.isCreative()) powder.shrink(1);
        let theme = RitualFx.theme('map_teleport');
        level.server.scheduleInTicks(1, callback => ritualArrival(player.level, player.x, player.y, player.z, theme));
    }
});
