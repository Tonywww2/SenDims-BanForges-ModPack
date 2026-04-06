// priority: 100
let TARGET_DIM = 'minecraft:overworld';

let PLATFORM_Y = 300;
let PLAYER_Y = 301;

let X_MIN = 0;
let X_MAX = 15;
let Z_MIN = 0;
let Z_MAX = 15;

let SPAWN_X = 8;
let SPAWN_Z = 8;

let PLAYER_INIT_KEY = 'sdbf.linit';
let OVERWORLD_STAGE = 'sdbf.world_lock';

const buildBedrockPlatform = (level) => {
    for (let x = X_MIN; x <= X_MAX; x++) {
        for (let z = Z_MIN; z <= Z_MAX; z++) {
            level.setBlock(new BlockPos(x, PLATFORM_Y, z), Blocks.BEDROCK.defaultBlockState(), 3);
            level.setBlock(new BlockPos(x, PLATFORM_Y - 1, z), Blocks.BEDROCK.defaultBlockState(), 3);
            level.setBlock(new BlockPos(x, PLAYER_Y, z), Blocks.AIR.defaultBlockState(), 3);
            level.setBlock(new BlockPos(x, PLAYER_Y + 1, z), Blocks.AIR.defaultBlockState(), 3);
        }
    }
}

const placeSign = (level) => {
    let signPos = new BlockPos(SPAWN_X, PLAYER_Y, SPAWN_Z - 1);

    level.setBlock(signPos, Blocks.OAK_SIGN.defaultBlockState(), 3);

    let be = level.getBlockEntity(signPos);
    be.updateText(text =>
        text
            .setMessage(0, Text.of('To Begin'))
            .setMessage(1, Text.of('Enter /skyblock gui'))
            .setMessage(2, Text.of('开始'))
            .setMessage(3, Text.of('输入指令 /skyblock gui'))
        , true
    );
    be.setChanged();
    return;

}

const ensureWorldPlatform = (server) => {
    let level = server.getLevel(TARGET_DIM);

    buildBedrockPlatform(level);
    level.setDefaultSpawnPos(new BlockPos(SPAWN_X, PLAYER_Y, SPAWN_Z), 0);
    placeSign(level);

    return level;
}

PlayerEvents.loggedIn(event => {
    let player = event.player;
    if (!player || player.isFake && player.isFake()) return;

    if (player.stages.has(PLAYER_INIT_KEY)) return;

    let level = ensureWorldPlatform(event.server);
    if (!level) return;

    player.stages.add(PLAYER_INIT_KEY);
    player.teleportTo(TARGET_DIM, SPAWN_X + 0.5, PLAYER_Y, SPAWN_Z + 0.5, 0, 0);

    player.tell('Wellcome! ');
});

const punishPlayer = (player) => {
    player.teleportTo(TARGET_DIM, SPAWN_X + 0.5, PLAYER_Y, SPAWN_Z + 0.5, 0, 0);

    player.potionEffects.add('minecraft:wither', 200, 0);
    player.potionEffects.add('minecraft:blindness', 200, 0);
    player.potionEffects.add('minecraft:nausea', 200, 0);
};

PlayerEvents.tick(event => {
    let player = event.player;
    if (!player || player.isFake && player.isFake()) return;

    if (player.level.dimensionKey != TARGET_DIM) return;

    if (player.stages.has(OVERWORLD_STAGE)) return;

    if (player.getBlockY() < 280) {
        punishPlayer(player);
        player.tell('You are forbided, wait for the future task. ');
    }
})
