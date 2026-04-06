ServerEvents.recipes(event => {
    event.shapeless('slashblade:proudsoul_tiny',
        [Item.of('slashblade_sendims:blood_jade', '{sbsd.bj.kill_count:10}')])
        .modifyResult((grid, result) => {
            let bloodJade = grid.find('slashblade_sendims:blood_jade');
            if (bloodJade && bloodJade.nbt) {
                let count = Math.floor(bloodJade.nbt.getInt('sbsd.bj.kill_count') / 10);
                count = Math.max(1, Math.min(64, count));
                return Item.of('slashblade:proudsoul_tiny', count);
            }

            return result;
        })
        .id("sdbf:jade_to_soul")

    event.shaped('integrateddynamics:logic_director', [
        'ACA',
        'ABA',
        'ACA'
    ], {
        A: 'integrateddynamics:crystalized_chorus_chunk',
        B: '#forge:gems/diamond',
        C: 'integrateddynamics:crystalized_menril_chunk'
    }).id('sdbf:logic_director')

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_ingot', [
        '#forge:ingots/steel',
        '3x slashblade:proudsoul',
        '3x minecraft:blaze_powder'
    ]).id('sdbf:proudsoul_ingot')

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_sphere', [
        '2x integrateddynamics:proto_chorus',
        '3x slashblade:proudsoul_ingot',
        '4x nuclearcraft:borax_dust'
    ]).id("sdbf:proudsoul_sphere")

    // TODO 替换基岩为真正的材料
    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_crystal', [
        '3x slashblade:proudsoul_sphere',
        'minecraft:bedrock'
    ]).id("sdbf:proudsoul_crystal")

    event.recipes.slashblade.proudsoul_shapeless_recipe('slashblade:proudsoul_trapezohedron', [
        '3x slashblade:proudsoul_crystal',
        'minecraft:bedrock'
    ]).id("sdbf:proudsoul_trapezohedron")

    event.recipes.thermal.smelter('slashblade:proudsoul_sphere', [
        'integrateddynamics:proto_chorus',
        '2x slashblade:proudsoul_ingot',
        '3x nuclearcraft:borax_dust'
    ])
        .energy(8192)
        .id("sdbf:proudsoul_sphere_acc")

    event.recipes.thermal.smelter('2x slashblade:proudsoul_crystal', [
        '5x slashblade:proudsoul_sphere',
        'minecraft:bedrock'
    ])
        .energy(16384)
        .id("sdbf:proudsoul_crystal_acc")

    event.recipes.thermal.smelter('2x slashblade:proudsoul_trapezohedron', [
        '2x slashblade:proudsoul_crystal',
        'slashblade_useful_addon:soul_crystal',
        'minecraft:bedrock'
    ])
        .energy(32768)
        .id("sdbf:proudsoul_trapezohedron_acc")

})


