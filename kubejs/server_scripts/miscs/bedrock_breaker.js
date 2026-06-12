let bbAllowDims = Utils.newMap();
bbAllowDims.put("ad_astra:moon", "minecraft:the_nether");
bbAllowDims.put("twilightforest:twilight_forest", "minecraft:the_nether");
// bbAllowDims.add("minecraft:the_nether", "ad_astra:moon");

const moonToNetherKey = "sbdf.moon_to_nether";

BlockEvents.rightClicked("minecraft:bedrock", event => {
    if (event.item == "kubejs:bedrock_breaker") {
        let fromDim = String(event.getLevel().getDimension().toString());
        if (bbAllowDims.containsKey(fromDim)) {
            // event.getLevel().removeBlock(event.block.getPos(), true);
            // event.getServer().getAllLevels()
            //     .forEach((lev) => {
            //         if (bbAllowDims.has(String(lev.getDimension().toString()))) {
            //             lev.removeBlock(event.block.getPos(), true);
            //             lev.removeBlock(event.block.getPos().above(191), true);
            //         }

            //     })
            let targetDim = bbAllowDims.get(fromDim);
            if (global.immptEnabled) {
                let level = event.level;
                if (!level.getData().getOrDefault(moonToNetherKey, false)) {
                    level.getData().put(moonToNetherKey, true);
                    level.runCommandSilent("portal global connect_floor ad_astra:moon minecraft:the_nether");
                    level.runCommandSilent("portal global connect_ceil minecraft:the_nether ad_astra:moon");
                }
            } else {
                let targetLevel = event.getServer().getLevel(targetDim);
                let player = event.player;
                let x = player.x;
                let y = player.y + 150;
                let z = player.z;
                // event.player.teleportTo(targetDim, x, y, z, 0, 0);
                player.server.runCommandSilent(`/execute in ${targetDim} run tp ${player.name.string} ${x} ${y} ${z}`);

                for (let i = x - 2; i < x + 2; i++) {
                    for (let j = z - 2; j < z + 2; j++) {
                        for (let k = y - 2; k < y + 2; k++) {
                            targetLevel.removeBlock(new BlockPos(i, k, j), true);

                        }
                        targetLevel.setBlock(new BlockPos(i, y - 3, j), Blocks.OBSIDIAN.defaultBlockState(), 2);

                    }
                }

            }

            event.player.cooldowns.addCooldown(event.item, 50);
            event.player.playNotifySound("sounds:block.deepslate_iron_ore.break", event.player.soundSource, 10.0, 1.5);
            event.item.shrink(1);

        }
    }
})
