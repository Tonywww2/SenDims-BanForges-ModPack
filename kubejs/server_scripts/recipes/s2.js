ServerEvents.recipes(event => {
    event.shaped($StructureQuill.forStructure("aether:bronze_dungeon"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'aether:quicksoil',
        B: 'minecraft:map'
    }).id('sdbf:sq_bronze_dungeon_s2')

    event.shaped($StructureQuill.forStructure("aether:silver_dungeon"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'aether:holystone',
        B: 'minecraft:map'
    }).id('sdbf:sq_silver_dungeon_s2')

    event.shaped($StructureQuill.forStructure("aether:gold_dungeon"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'aether:ambrosium_shard',
        B: 'minecraft:map'
    }).id('sdbf:sq_gold_dungeon_s2')
})