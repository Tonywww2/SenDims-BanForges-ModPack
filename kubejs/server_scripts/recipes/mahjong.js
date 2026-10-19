ServerEvents.recipes(event => {
    // 役铸之魂：普通麻将和牌获得的麻将之星即可制作。
    event.shapeless('kubejs:yakuman_forging_soul', [
        'riichi_mahjong_forge:mahjong_star',
        'slashblade:proudsoul_ingot',
        'riichi_mahjong_forge:tile_dragon_white'
    ]).id('sdbf:yakuman_forging_soul');
});
