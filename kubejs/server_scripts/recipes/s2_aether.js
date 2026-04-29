ServerEvents.recipes(event => {

    event.shapeless('3x kubejs:neptune_ingot', [
        Ingredient.of([
            'aether:neptune_gloves',
            'aether:neptune_boots',
            'aether:neptune_leggings',
            'aether:neptune_chestplate',
            'aether:neptune_helmet',
        ])]).id("sdbf:neptune_ingot_s2")

    event.shapeless('3x kubejs:valkyrie_ingot', [
        Ingredient.of([
            'aether:valkyrie_boots',
            'aether:valkyrie_leggings',
            'aether:valkyrie_chestplate',
            'aether:valkyrie_helmet',
            'aether:valkyrie_hoe',
            'aether:valkyrie_axe',
            'aether:valkyrie_pickaxe',
            'aether:valkyrie_shovel',
            'aether:valkyrie_lance',
            'aether:valkyrie_gloves',
            'aether:valkyrie_cape',
        ])]).id("sdbf:valkyrie_ingot_s2")

    event.shapeless('3x kubejs:phoenix_ingot', [
        Ingredient.of([
            'lost_aether_content:phoenix_hoe',
            'lost_aether_content:phoenix_pickaxe',
            'lost_aether_content:phoenix_shovel',
            'lost_aether_content:phoenix_sword',
            'aether:phoenix_gloves',
            'aether:phoenix_boots',
            'aether:phoenix_leggings',
            'aether:phoenix_chestplate',
            'aether:phoenix_helmet',
            'lost_aether_content:phoenix_cape',
            'lost_aether_content:phoenix_axe',
        ])]).id("sdbf:phoenix_ingot_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "BC ",
        "DE "
    ], {
        "A": "minecraft:obsidian",
        "B": "slashblade:proudsoul_sphere",
        "C": "slashblade:proudsoul_ingot",
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("slashblade:fox_black")
                .refineCount(10)
                .build()
        ),
        "E": "minecraft:string"
    }, "pseudoedge_break_dawn:purplesblade")
        .id("sdbf:purplesblade_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "BDB",
        "CBC"
    ], {
        "A": "minecraft:obsidian",
        "B": "minecraft:cactus",
        "C": ["minecraft:nether_star", 'deep_aether:stratus_ingot'],
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("pseudoedge_break_dawn:purplesblade")
                .killCount(300)
                .proudSoul(20000)
                .refineCount(10)
                .build()
        )
    }, "pseudoedge_break_dawn:vitex")
        .id("sdbf:vitex_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " EF",
        "BCS",
        "WQ "
    ], {
        "B": "minecraft:blaze_powder",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("blades_derby:uma_odachi_haru")
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:looting", 1))
                .build()
        ),
        "E": "#forge:obsidian",
        "F": "#forge:feathers",
        "Q": "#forge:storage_blocks/quartz",
        "S": 'slashblade:proudsoul',
        "W": "#forge:crops/wheat"
    }, "slashblade:fox_white")
        .id("sdbf:fox_white_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " EF",
        "BCS",
        "WQ "
    ], {
        "B": "minecraft:blaze_powder",
        "C": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance().name("blades_derby:uma_odachi_halo")
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:smite", 1))
                .build()
        ),
        "E": "#forge:obsidian",
        "F": "#forge:feathers",
        "Q": "#forge:storage_blocks/quartz",
        "S": 'slashblade:proudsoul',
        "W": "#forge:crops/wheat"
    }, "slashblade:fox_black")
        .id("sdbf:fox_black_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " JS",
        "JSW",
        "BWG"
    ], {
        "J": "umapyoi:jewel",
        "S": "slashblade:proudsoul_ingot",
        "G": 'aether:ambrosium_shard',
        "W": "#forge:dyes/white",        // 使用 Tag (Using Tag)
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ruby")
                .killCount(113)
                .proudSoul(113)
                .refineCount(10)            // 要求：10 锻造 (Refine Count)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:smite", 1))
                .build()
        )
    }, "blades_derby:uma_odachi_haru")
        .id("sdbf:uma_odachi_haru_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        " JS",
        "JSW",
        "BWG"
    ], {
        "J": "umapyoi:jewel",
        "S": 'aether:ambrosium_shard',
        "W": "#forge:dyes/white",      // 使用 Tag (Using Tag)
        "G": "slashblade:proudsoul",   // 注意：此处为耀魂 (Proudsoul)
        "B": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("slashblade:ruby")
                .refineCount(10)          // 要求：10 锻造 (Refine Count)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:smite", 1))
                .build()
        )
    }, "blades_derby:uma_odachi_halo")
        .id("sdbf:uma_odachi_halo_s2")

    event.recipes.slashblade.slashblade_shaped_recipe("slashblade:slashblade", [
        "ABC",
        "BDB",
        "GBF"
    ], {
        "A": '#c:dyed/blue',
        "B": 'deep_aether:metal_mixture',
        "C": 'framedblocks:framed_blueprint',
        "F": 'quark:light_blue_framed_glass',
        "D": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("sjap_adder:break_moon")
                .killCount(77)
                .proudSoul(17777)
                .refineCount(7)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:smite", 4)) // 亡灵杀手 IV
                .build()
        ),
        "G": SlashBladeIngredient.of(
            SlashBladeRequestDefinition.newInstance()
                .name("blades_derby:uma_odachi_haru")
                .killCount(114)
                .proudSoul(114)
                .addEnchantment(SBEnchantmentDefinition.of("minecraft:sharpness", 4))
                .build()
        )
    }, "slashblade:egg_lan")
        .id("kubejs:slashblade/egg_lan")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": 'aether_redux:gravitite_ingot'
        },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": {}
        },
        "blade": "slashblade:ruby",
        "template": {
            "item": "last_smith:scroll_katana"
        }
    }).id("sdbf:blade_ruby_s2")

    event.custom({
        "type": "slashblade:slashblade_smithing",
        "addition": {
            "item": 'deep_aether:metal_mixture'
        },
        "base": {
            "type": "slashblade:blade",
            "item": "slashblade:slashblade",
            "request": {
                "enchantments": [
                    {
                        "id": "minecraft:smite"
                    }
                ],
                "name": "last_smith:nagasada"
            }
        },
        "blade": "last_smith:exorcism_yuki",
        "template": {
            "item": "last_smith:scroll_named"
        }
    }).id("sdbf:exorcism_yuki_s2")

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

    event.shaped($StructureQuill.forStructure("deep_aether:brass_dungeon"), [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'aether:golden_amber',
        B: 'minecraft:map'
    }).id('sdbf:sq_brass_dungeon_s2')

})