// 仪式触发表：服务端（server_scripts/custom_spawn）和客户端（client_scripts/ritual_triggers.js）共用。
// 启动脚本在两端都会执行，客户端据此判断哪些右键交给服务端处理。这里只放字符串，不放函数。
// 新增结构召唤或传送门仪式时，在 rituals 中补一行 [激活物, 核心方块 B]，服务端注册时会核对。
global.sdbfRitualTriggers = {
    rituals: [
        ['aether_redux:golden_swet_ball', 'aether:ambrosium_block'],
        ['undergarden:utherium_crystal', 'undergarden:utherium_block'],
        ['minecraft:stick', 'minecraft:crying_obsidian'],
        ['tofucraft:tofustick', 'minecraft:moss_block'],
        ['slashblade_sendims:deeprealm_certificate', 'minecraft:bricks'],
        ['integrateddynamics:variable', 'aether_redux:sentry_base'],
        ['minecraft:filled_map', 'minecraft:chiseled_stone_bricks']
    ],
    bedrockBreaker: ['kubejs:bedrock_breaker', 'minecraft:bedrock']
};
