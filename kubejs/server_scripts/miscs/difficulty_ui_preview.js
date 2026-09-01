ServerEvents.commandRegistry(event => {
    let { commands: Commands } = event;
    event.register(
        Commands.literal('sdbf_difficulty_preview')
            .requires(source => source.hasPermission(2))
            .executes(c => {
                let player = c.source.player;
                if (!player || (player.isFake && player.isFake())) {
                    c.source.sendFailure(Text.of('Only real players can open the difficulty UI preview.'));
                    return 0;
                }
                global.openDifficultyScreen(player);
                return 1;
            })
    );
});