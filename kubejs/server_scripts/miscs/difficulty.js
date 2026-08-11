// priority: 80
// id，血量，攻击，防御
let difficulty_list = [
    ["n_0", 1.0, 1.0, 1.0],

    ["n_-1", 0.85, 0.85, 0.85],
    ["n_-2", 0.7, 0.7, 0.7],
    ["n_-3", 0.55, 0.55, 0.55],
    ["n_-4", 0.4, 0.4, 0.4],
    ["n_-5", 0.25, 0.25, 0.25],

    ["n_1", 1.1, 1.05, 1.0],
    ["n_2", 1.2, 1.1, 1.0],
    ["n_3", 1.4, 1.15, 1.0],
    ["n_4", 1.6, 1.15, 1.1],
    ["n_5", 1.8, 1.2, 1.2],

    ["n_10", 3.0, 1.5, 1.5],
];

let DIFFICULTY_INDEX_PATH = 'sdbf_difficulty_index';

let getDifficultyMultipliers = (server) => {
    if (!server.persistentData.contains(DIFFICULTY_INDEX_PATH)) {
        server.persistentData.putInt(DIFFICULTY_INDEX_PATH, 0);
    }
    let diffIndex = server.persistentData.getInt(DIFFICULTY_INDEX_PATH);
    if (diffIndex < 0 || diffIndex >= difficulty_list.length) {
        diffIndex = 0;
    }
    return difficulty_list[diffIndex];
};

ServerEvents.commandRegistry(event => {
    let { commands: Commands, arguments: Arguments } = event;
    event.register(
        Commands.literal('sdbf_difficulty_menu')
            .executes(c => {
                global.renderDifficulty(c.source.player);
                return 1;
            })
            .then(Commands.argument('index', Arguments.INTEGER.create(event))
                .requires(s => s.hasPermission(2))
                .executes(c => {
                    global.setDifficultyFromCmd(c, Commands, Arguments);
                    return 1;
                })
            )
    );
});

global.renderDifficulty = function (player) {
    if (!player) return;
    let server = player.server;
    let currentIndex = server.persistentData.getInt(DIFFICULTY_INDEX_PATH);
    if (currentIndex < 0 || currentIndex >= difficulty_list.length) currentIndex = 0;

    player.tell(Text.translatable('kubejs.difficulty.title').color(Color.AQUA));

    for (let i = 0; i < difficulty_list.length; i++) {
        let diff = difficulty_list[i];
        let isCurrent = (i == currentIndex);
        let color = isCurrent ? Color.LIGHT_PURPLE : Color.GRAY;

        let hover = Text.translatable(`kubejs.difficulty.${diff[0]}.desc`).color(Color.WHITE)
            .append('\n')
            .append(Text.translatable('kubejs.difficulty.hp_mult', diff[1]).color(Color.RED))
            .append('\n')
            .append(Text.translatable('kubejs.difficulty.atk_mult', diff[2]).color(Color.GOLD))
            .append('\n')
            .append(Text.translatable('kubejs.difficulty.armor_mult', diff[3]).color(Color.BLUE));

        let text = Text.translatable(`kubejs.difficulty.${diff[0]}`).color(color).hover(hover);

        if (isCurrent) {
            text.append(Text.of(" [").color(Color.WHITE).append(Text.translatable('kubejs.difficulty.current').color(Color.GREEN)).append(Text.of("]").color(Color.WHITE)));
        } else if (player.hasPermissions(2)) {
            text.click(new $ClickEvent($ClickEventAction.RUN_COMMAND, `/sdbf_difficulty_menu ${i}`));
            text.append(Text.of(" [").color(Color.WHITE).append(Text.translatable('kubejs.difficulty.click_to_switch').color(Color.YELLOW)).append(Text.of("]").color(Color.WHITE)));
        }

        player.tell(Text.of('- ').append(text));
    }
};

global.setDifficultyFromCmd = function (c, Commands, Arguments) {
    let index = Arguments.INTEGER.getResult(c, 'index');
    let server = c.source.server;
    let player = c.source.player;

    if (index < 0 || index >= difficulty_list.length) {
        if (player) player.tell(Text.translatable('kubejs.difficulty.invalid_index').color(Color.RED));
        return 0;
    }

    server.persistentData.putInt(DIFFICULTY_INDEX_PATH, index);
    server.players.forEach(p => {
        p.tell(Text.translatable('kubejs.difficulty.set_success', Text.translatable(`kubejs.difficulty.${difficulty_list[index][0]}`)).color(Color.GREEN));
    });

    if (player) {
        global.renderDifficulty(player);
    }

    return 1;
};
