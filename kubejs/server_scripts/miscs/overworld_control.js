// priority: 300
let TARGET_DIM = 'minecraft:overworld';

let PLATFORM_Y = 300;
let PLAYER_Y = 301;

let X_MIN = 0;
let X_MAX = 15;
let Z_MIN = 0;
let Z_MAX = 15;

let WALL_THICKNESS = 1;
let ROOM_HEIGHT = 5;

let Y_MIN = PLATFORM_Y - 1;
let Y_MAX = PLAYER_Y + ROOM_HEIGHT + 1;

let SPAWN_X = 8;
let SPAWN_Z = 8;

let MIN_Y_LEVEL = 280;

let signs = [
    // 北墙 (朝向南)
    { pos: new BlockPos(7, PLAYER_Y + 1, 2), facing: 'south' },
    { pos: new BlockPos(8, PLAYER_Y + 1, 2), facing: 'south' },
    // 南墙 (朝向北)
    { pos: new BlockPos(7, PLAYER_Y + 1, 13), facing: 'north' },
    { pos: new BlockPos(8, PLAYER_Y + 1, 13), facing: 'north' },
    // 西墙 (朝向东)
    { pos: new BlockPos(2, PLAYER_Y + 1, 7), facing: 'east' },
    { pos: new BlockPos(2, PLAYER_Y + 1, 8), facing: 'east' },
    // 东墙 (朝向西)
    { pos: new BlockPos(13, PLAYER_Y + 1, 7), facing: 'west' },
    { pos: new BlockPos(13, PLAYER_Y + 1, 8), facing: 'west' }
];

let PLAYER_INIT_KEY = 'sdbf.linit';
let OVERWORLD_STAGE = 'sdbf.world_lock';

const getLevelSpawnPoint = (level) => {
    let data = level.getLevelData();

    return [data.getXSpawn(), data.getYSpawn(), data.getZSpawn()];
}

const buildBedrockPlatform = (level) => {

    for (let x = X_MIN; x <= X_MAX; x++) {
        for (let y = Y_MIN; y <= Y_MAX; y++) {
            for (let z = Z_MIN; z <= Z_MAX; z++) {
                let isWallX = (x < X_MIN + WALL_THICKNESS) || (x > X_MAX - WALL_THICKNESS);
                let isWallZ = (z < Z_MIN + WALL_THICKNESS) || (z > Z_MAX - WALL_THICKNESS);
                let isFloor = (y <= PLATFORM_Y);
                let isRoof = (y == Y_MAX);

                if (isWallX || isWallZ || isFloor || isRoof) {
                    level.setBlock(new BlockPos(x, y, z), Blocks.BARRIER.defaultBlockState(), 3);
                } else {
                    level.setBlock(new BlockPos(x, y, z), Blocks.AIR.defaultBlockState(), 3);
                }
            }
        }
    }
}

const placeSign = (level) => {

    signs.forEach(s => {
        let block = level.getBlock(s.pos);
        block.set('minecraft:oak_wall_sign', { facing: s.facing });

        let be = level.getBlockEntity(s.pos);
        if (be) {
            be.updateText(text =>
                text
                    .setMessage(0, Text.of('To Begin'))
                    .setMessage(1, Text.of('Enter /skyblock gui'))
                    .setMessage(2, Text.of('开始'))
                    .setMessage(3, Text.of('输入指令 /skyblock gui'))
                , true
            );
            be.setChanged();
        }
    });

}

const ensureWorldPlatform = (server) => {
    let level = server.getLevel(TARGET_DIM);

    buildBedrockPlatform(level);
    level.setDefaultSpawnPos(new BlockPos(SPAWN_X, PLAYER_Y, SPAWN_Z), 0);
    placeSign(level);

    return level;
}

// PlayerEvents.loggedIn(event => {
//     let player = event.player;
//     if (!player || player.isFake && player.isFake()) return;

//     if (player.stages.has(PLAYER_INIT_KEY)) return;

//     let level = ensureWorldPlatform(event.server);
//     if (!level) return;

//     player.stages.add(PLAYER_INIT_KEY);
//     player.teleportTo(TARGET_DIM, SPAWN_X + 0.5, PLAYER_Y, SPAWN_Z + 0.5, 0, 0);

//     player.tell('Wellcome! ');
// });

const punishPlayer = (player) => {
    // player.teleportTo(TARGET_DIM, SPAWN_X + 0.5, PLAYER_Y, SPAWN_Z + 0.5, 0, 0);
    let pos = getLevelSpawnPoint(player.level);
    player.teleportTo(TARGET_DIM, pos[0] + 0.5, pos[1], pos[2] + 0.5, 0, 0);

    player.potionEffects.add('minecraft:wither', 100, 0);
    player.potionEffects.add('minecraft:blindness', 100, 0);
    player.potionEffects.add('minecraft:nausea', 100, 0);
};

PlayerEvents.tick(event => {
    if (event.level.isClientSide()) return;
    let player = event.player;
    if (!player || player.isFake && player.isFake()) return;

    if (player.level.dimensionKey != TARGET_DIM) return;

    if (player.stages.has(OVERWORLD_STAGE)) return;

    if (player.getBlockY() < MIN_Y_LEVEL) {
        punishPlayer(player);
        player.tell(Text.translatable('info.kubejs.overworld_disallowed').darkPurple())
    }
})
