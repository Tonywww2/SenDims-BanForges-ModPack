// 役刀配方逐项定义；常规路线使用阶段材料，提前路线消耗一枚对应役满之证。
// 每把前置刀的杀敌数、耀魂数、锻造数均直接写在对应材料条件中。
ServerEvents.recipes(event => {

    // 役铸之魂
    event.shapeless(
        'kubejs:yakuman_forging_soul',
        [
            'riichi_mahjong_forge:mahjong_star',
            'slashblade:proudsoul_ingot',
            'riichi_mahjong_forge:tile_dragon_white'
        ]
    ).id('sdbf:yakuman_forging_soul');

    // 移除原发电机配方
    event.remove({
        'id': 'riichi_mahjong_forge:yaku_generator_tier_2'
    });

    // 二级役种发电机：阶段二
    event.shaped(
        'riichi_mahjong_forge:yaku_generator_tier_2',
        [
            'ABA',
            'CDC',
            'AEA'
        ],
        {
            'A': 'ad_astra:desh_ingot',
            'B': 'kubejs:yakuman_forging_soul',
            'C': 'slashblade:proudsoul_ingot',
            'D': 'riichi_mahjong_forge:yaku_generator_tier_1',
            'E': 'riichi_mahjong_forge:mahjong_red_dragon_soul'
        }
    ).id('sdbf:yaku_generator_tier_2_s2');

    // 移除原发电机配方
    event.remove({
        'id': 'riichi_mahjong_forge:yaku_generator_tier_3'
    });

    // 三级役种发电机：阶段五初期
    event.shaped(
        'riichi_mahjong_forge:yaku_generator_tier_3',
        [
            'ABA',
            'CDC',
            'AEA'
        ],
        {
            'A': 'titan_moon:cryo_alloy_ingot',
            'B': 'kubejs:storm_hydrogen_crystal',
            'C': 'slashblade:proudsoul_crystal',
            'D': 'riichi_mahjong_forge:yaku_generator_tier_2',
            'E': 'kubejs:yakuman_forging_soul'
        }
    ).id('sdbf:yaku_generator_tier_3_s5');

    // 国士无双：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'S M',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_man_1',
            'L': 'riichi_mahjong_forge:tile_man_9'
        },
        'slashblade_sendims:yakuman_kokushi'
    ).id('sdbf:yakuman_kokushi_s3');

    // 国士无双：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'S M',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/kokushi_musou"]),
            'K': 'riichi_mahjong_forge:tile_man_1',
            'L': 'riichi_mahjong_forge:tile_man_9'
        },
        'slashblade_sendims:yakuman_kokushi'
    ).id('sdbf:yakuman_kokushi_early_s2');

    // 四暗刻：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_pin_1',
            'L': 'riichi_mahjong_forge:tile_pin_1',
            'N': 'riichi_mahjong_forge:tile_pin_1'
        },
        'slashblade_sendims:yakuman_suuankou'
    ).id('sdbf:yakuman_suuankou_s3');

    // 四暗刻：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/suu_ankou"]),
            'K': 'riichi_mahjong_forge:tile_pin_1',
            'L': 'riichi_mahjong_forge:tile_pin_1',
            'N': 'riichi_mahjong_forge:tile_pin_1'
        },
        'slashblade_sendims:yakuman_suuankou'
    ).id('sdbf:yakuman_suuankou_early_s2');

    // 大三元：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_dragon_white',
            'L': 'riichi_mahjong_forge:tile_dragon_green',
            'N': 'riichi_mahjong_forge:tile_dragon_red'
        },
        'slashblade_sendims:yakuman_daisangen'
    ).id('sdbf:yakuman_daisangen_s3');

    // 大三元：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/daisangen"]),
            'K': 'riichi_mahjong_forge:tile_dragon_white',
            'L': 'riichi_mahjong_forge:tile_dragon_green',
            'N': 'riichi_mahjong_forge:tile_dragon_red'
        },
        'slashblade_sendims:yakuman_daisangen'
    ).id('sdbf:yakuman_daisangen_early_s2');

    // 小四喜：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'KPL'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_wind_east',
            'L': 'riichi_mahjong_forge:tile_wind_south',
            'N': 'riichi_mahjong_forge:tile_wind_west',
            'P': 'riichi_mahjong_forge:tile_wind_north'
        },
        'slashblade_sendims:yakuman_shousuushii'
    ).id('sdbf:yakuman_shousuushii_s3');

    // 小四喜：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'KPL'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/shousuushii"]),
            'K': 'riichi_mahjong_forge:tile_wind_east',
            'L': 'riichi_mahjong_forge:tile_wind_south',
            'N': 'riichi_mahjong_forge:tile_wind_west',
            'P': 'riichi_mahjong_forge:tile_wind_north'
        },
        'slashblade_sendims:yakuman_shousuushii'
    ).id('sdbf:yakuman_shousuushii_early_s2');

    // 字一色：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_wind_east',
            'L': 'riichi_mahjong_forge:tile_dragon_white',
            'N': 'riichi_mahjong_forge:tile_dragon_red'
        },
        'slashblade_sendims:yakuman_tsuuiisou'
    ).id('sdbf:yakuman_tsuuiisou_s3');

    // 字一色：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/tsuuiisou"]),
            'K': 'riichi_mahjong_forge:tile_wind_east',
            'L': 'riichi_mahjong_forge:tile_dragon_white',
            'N': 'riichi_mahjong_forge:tile_dragon_red'
        },
        'slashblade_sendims:yakuman_tsuuiisou'
    ).id('sdbf:yakuman_tsuuiisou_early_s2');

    // 绿一色：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_sou_2',
            'L': 'riichi_mahjong_forge:tile_sou_3',
            'N': 'riichi_mahjong_forge:tile_dragon_green'
        },
        'slashblade_sendims:yakuman_ryuuiisou'
    ).id('sdbf:yakuman_ryuuiisou_s3');

    // 绿一色：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/ryuuiisou"]),
            'K': 'riichi_mahjong_forge:tile_sou_2',
            'L': 'riichi_mahjong_forge:tile_sou_3',
            'N': 'riichi_mahjong_forge:tile_dragon_green'
        },
        'slashblade_sendims:yakuman_ryuuiisou'
    ).id('sdbf:yakuman_ryuuiisou_early_s2');

    // 清老头：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'S M',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_man_1',
            'L': 'riichi_mahjong_forge:tile_pin_9'
        },
        'slashblade_sendims:yakuman_chinroutou'
    ).id('sdbf:yakuman_chinroutou_s3');

    // 清老头：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'S M',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/chinroutou"]),
            'K': 'riichi_mahjong_forge:tile_man_1',
            'L': 'riichi_mahjong_forge:tile_pin_9'
        },
        'slashblade_sendims:yakuman_chinroutou'
    ).id('sdbf:yakuman_chinroutou_early_s2');

    // 九莲宝灯：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_man_1',
            'L': 'riichi_mahjong_forge:tile_man_5',
            'N': 'riichi_mahjong_forge:tile_man_9'
        },
        'slashblade_sendims:yakuman_chuuren'
    ).id('sdbf:yakuman_chuuren_s3');

    // 九莲宝灯：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/chuuren_poutou"]),
            'K': 'riichi_mahjong_forge:tile_man_1',
            'L': 'riichi_mahjong_forge:tile_man_5',
            'N': 'riichi_mahjong_forge:tile_man_9'
        },
        'slashblade_sendims:yakuman_chuuren'
    ).id('sdbf:yakuman_chuuren_early_s2');

    // 四杠子：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'KPL'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_sou_1',
            'L': 'riichi_mahjong_forge:tile_sou_1',
            'N': 'riichi_mahjong_forge:tile_sou_1',
            'P': 'riichi_mahjong_forge:tile_sou_1'
        },
        'slashblade_sendims:yakuman_suukantsu'
    ).id('sdbf:yakuman_suukantsu_s3');

    // 四杠子：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SNM',
            'FBS',
            'KPL'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/suukantsu"]),
            'K': 'riichi_mahjong_forge:tile_sou_1',
            'L': 'riichi_mahjong_forge:tile_sou_1',
            'N': 'riichi_mahjong_forge:tile_sou_1',
            'P': 'riichi_mahjong_forge:tile_sou_1'
        },
        'slashblade_sendims:yakuman_suukantsu'
    ).id('sdbf:yakuman_suukantsu_early_s2');

    // 天和：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'S M',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_wind_east',
            'L': 'riichi_mahjong_forge:tile_dragon_white'
        },
        'slashblade_sendims:yakuman_tenhou'
    ).id('sdbf:yakuman_tenhou_s3');

    // 天和：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'S M',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/tenhou"]),
            'K': 'riichi_mahjong_forge:tile_wind_east',
            'L': 'riichi_mahjong_forge:tile_dragon_white'
        },
        'slashblade_sendims:yakuman_tenhou'
    ).id('sdbf:yakuman_tenhou_early_s2');

    // 地和：常规制作（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'S M',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': 'ad_astra:calorite_ingot',
            'K': 'riichi_mahjong_forge:tile_wind_south',
            'L': 'riichi_mahjong_forge:tile_dragon_white'
        },
        'slashblade_sendims:yakuman_chiihou'
    ).id('sdbf:yakuman_chiihou_s3');

    // 地和：提前制作，消耗一枚证书（阶段2）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'S M',
            'FBS',
            'K L'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade:nameless_lone')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(25)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_ingot',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/chiihou"]),
            'K': 'riichi_mahjong_forge:tile_wind_south',
            'L': 'riichi_mahjong_forge:tile_dragon_white'
        },
        'slashblade_sendims:yakuman_chiihou'
    ).id('sdbf:yakuman_chiihou_early_s2');

    // 大四喜：常规制作（阶段4）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SMS',
            'FBF',
            'S S'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_shousuushii')
                    .killCount(8000)
                    .proudSoul(15000)
                    .refineCount(100)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': 'kubejs:delta_dust'
        },
        'slashblade_sendims:yakuman_daisuushii'
    ).id('sdbf:yakuman_daisuushii_s4');

    // 大四喜：提前制作，消耗一枚证书（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SMS',
            'FBF',
            'S S'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_shousuushii')
                    .killCount(8000)
                    .proudSoul(15000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/daisuushii"])
        },
        'slashblade_sendims:yakuman_daisuushii'
    ).id('sdbf:yakuman_daisuushii_early_s3');

    // 三元字敕：常规制作（阶段4）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'FSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_daisangen')
                    .killCount(8000)
                    .proudSoul(15000)
                    .refineCount(100)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_tsuuiisou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(100)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': 'kubejs:delta_dust'
        },
        'slashblade_sendims:yakuman_sangen_jirei'
    ).id('sdbf:yakuman_sangen_jirei_s4');

    // 三元字敕：提前制作，消耗一枚证书（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'FSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_daisangen')
                    .killCount(8000)
                    .proudSoul(15000)
                    .refineCount(50)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_tsuuiisou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/daisangen", "#kubejs:yakuman_certificates/tsuuiisou"])
        },
        'slashblade_sendims:yakuman_sangen_jirei'
    ).id('sdbf:yakuman_sangen_jirei_early_s3');

    // 清老四刻：常规制作（阶段4）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'FSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_chinroutou')
                    .killCount(8000)
                    .proudSoul(15000)
                    .refineCount(100)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suuankou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(100)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': 'kubejs:delta_dust'
        },
        'slashblade_sendims:yakuman_chinrou_suukou'
    ).id('sdbf:yakuman_chinrou_suukou_s4');

    // 清老四刻：提前制作，消耗一枚证书（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'FSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_chinroutou')
                    .killCount(8000)
                    .proudSoul(15000)
                    .refineCount(50)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suuankou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/chinroutou", "#kubejs:yakuman_certificates/suu_ankou"])
        },
        'slashblade_sendims:yakuman_chinrou_suukou'
    ).id('sdbf:yakuman_chinrou_suukou_early_s3');

    // 碧玉四杠：常规制作（阶段4）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'FSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_ryuuiisou')
                    .killCount(8000)
                    .proudSoul(15000)
                    .refineCount(100)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suukantsu')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(100)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': 'kubejs:delta_dust'
        },
        'slashblade_sendims:yakuman_hekigyoku_suukantsu'
    ).id('sdbf:yakuman_hekigyoku_suukantsu_s4');

    // 碧玉四杠：提前制作，消耗一枚证书（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'FSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_ryuuiisou')
                    .killCount(8000)
                    .proudSoul(15000)
                    .refineCount(50)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suukantsu')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/ryuuiisou", "#kubejs:yakuman_certificates/suukantsu"])
        },
        'slashblade_sendims:yakuman_hekigyoku_suukantsu'
    ).id('sdbf:yakuman_hekigyoku_suukantsu_early_s3');

    // 天授国士：常规制作（阶段4）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_kokushi')
                    .killCount(10000)
                    .proudSoul(20000)
                    .refineCount(100)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_tenhou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(100)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': 'kubejs:multifaceted_ambrosia'
        },
        'slashblade_sendims:yakuman_tenju_kokushi'
    ).id('sdbf:yakuman_tenju_kokushi_s4');

    // 天授国士：提前制作，消耗一枚证书（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_kokushi')
                    .killCount(10000)
                    .proudSoul(20000)
                    .refineCount(50)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_tenhou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/tenhou", "kubejs:yakuman_certificate_kokushi_musou_juusanmen_machi"])
        },
        'slashblade_sendims:yakuman_tenju_kokushi'
    ).id('sdbf:yakuman_tenju_kokushi_early_s3');

    // 地生九莲：常规制作（阶段4）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_chuuren')
                    .killCount(10000)
                    .proudSoul(20000)
                    .refineCount(100)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_chiihou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(100)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': 'kubejs:multifaceted_ambrosia'
        },
        'slashblade_sendims:yakuman_chisei_chuuren'
    ).id('sdbf:yakuman_chisei_chuuren_s4');

    // 地生九莲：提前制作，消耗一枚证书（阶段3）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_chuuren')
                    .killCount(10000)
                    .proudSoul(20000)
                    .refineCount(50)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_chiihou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(50)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_sphere',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/chiihou", "kubejs:yakuman_certificate_junsei_chuuren_poutou"])
        },
        'slashblade_sendims:yakuman_chisei_chuuren'
    ).id('sdbf:yakuman_chisei_chuuren_early_s3');

    // 四喜字刻：常规制作（阶段5）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'FSS',
            'CBD',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_daisuushii')
                    .killCount(15000)
                    .proudSoul(70000)
                    .refineCount(200)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_tsuuiisou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(200)
                    .build()
            ),
            'D': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suuankou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(200)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_crystal',
            'M': 'deeprealm_4th:star_slurry_crystal'
        },
        'slashblade_sendims:yakuman_suushi_jikoku'
    ).id('sdbf:yakuman_suushi_jikoku_s5');

    // 四喜字刻：提前制作，消耗一枚证书（阶段4）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'FSS',
            'CBD',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_daisuushii')
                    .killCount(15000)
                    .proudSoul(70000)
                    .refineCount(100)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_tsuuiisou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(100)
                    .build()
            ),
            'D': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suuankou')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(100)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_crystal',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/daisuushii", "kubejs:yakuman_certificate_suu_ankou_tanki"])
        },
        'slashblade_sendims:yakuman_suushi_jikoku'
    ).id('sdbf:yakuman_suushi_jikoku_early_s4');

    // 四象归一：常规制作（阶段5）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suushi_jikoku')
                    .killCount(40000)
                    .proudSoul(400000)
                    .refineCount(200)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suukantsu')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(200)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_crystal',
            'M': 'kubejs:rainbowshift_entropy'
        },
        'slashblade_sendims:yakuman_shishou_kiitsu'
    ).id('sdbf:yakuman_shishou_kiitsu_s5');

    // 四象归一：提前制作，消耗一枚证书（阶段4）
    event.recipes.slashblade.slashblade_shaped_recipe(
        'slashblade:slashblade',
        [
            'SSS',
            'CBF',
            'SMS'
        ],
        {
            'B': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suushi_jikoku')
                    .killCount(40000)
                    .proudSoul(400000)
                    .refineCount(100)
                    .build()
            ),
            'C': SlashBladeIngredient.of(
                SlashBladeRequestDefinition.newInstance()
                    .name('slashblade_sendims:yakuman_suukantsu')
                    .killCount(2500)
                    .proudSoul(8000)
                    .refineCount(100)
                    .build()
            ),
            'F': 'kubejs:yakuman_forging_soul',
            'S': 'slashblade:proudsoul_crystal',
            'M': Ingredient.of(["#kubejs:yakuman_certificates/daisuushii", "kubejs:yakuman_certificate_suu_ankou_tanki", "#kubejs:yakuman_certificates/suukantsu"])
        },
        'slashblade_sendims:yakuman_shishou_kiitsu'
    ).id('sdbf:yakuman_shishou_kiitsu_early_s4');
});

// 天和、地和成就直奖对应单役刀；证书由原生成就战利品表发放。
let yakumanAdvancementBlades = {
    'riichi_mahjong_forge:yaku/tenhou': 'slashblade_sendims:yakuman_tenhou',
    'riichi_mahjong_forge:yaku/chiihou': 'slashblade_sendims:yakuman_chiihou'
};
PlayerEvents.advancement(event => {
    let bladeName = yakumanAdvancementBlades[String(event.advancement.id)];
    if (bladeName) {
        event.player.give(getBladeStack(event.player.server.registryAccess(), bladeName).copy());
    }
});
