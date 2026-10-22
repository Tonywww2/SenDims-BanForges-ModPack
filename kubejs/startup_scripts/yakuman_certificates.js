// priority: 0
// 17种役满之证逐项注册；成就奖励直接绑定在原生成就与战利品表中。
StartupEvents.registry('item', event => {

    // 国士无双
    event.create('yakuman_certificate_kokushi_musou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/kokushi_musou');

    // 国士无双十三面
    event.create('yakuman_certificate_kokushi_musou_juusanmen_machi')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/kokushi_musou');

    // 四暗刻
    event.create('yakuman_certificate_suu_ankou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/suu_ankou');

    // 四暗刻单骑
    event.create('yakuman_certificate_suu_ankou_tanki')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/suu_ankou');

    // 大三元
    event.create('yakuman_certificate_daisangen')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/daisangen');

    // 小四喜
    event.create('yakuman_certificate_shousuushii')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/shousuushii');

    // 大四喜
    event.create('yakuman_certificate_daisuushii')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/daisuushii');

    // 字一色
    event.create('yakuman_certificate_tsuuiisou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/tsuuiisou');

    // 清老头
    event.create('yakuman_certificate_chinroutou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/chinroutou');

    // 绿一色
    event.create('yakuman_certificate_ryuuiisou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/ryuuiisou');

    // 九莲宝灯
    event.create('yakuman_certificate_chuuren_poutou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/chuuren_poutou');

    // 纯正九莲宝灯
    event.create('yakuman_certificate_junsei_chuuren_poutou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/chuuren_poutou');

    // 四杠子
    event.create('yakuman_certificate_suukantsu')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/suukantsu');

    // 天和
    event.create('yakuman_certificate_tenhou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/tenhou');

    // 地和
    event.create('yakuman_certificate_chiihou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/chiihou');

    // 人和
    event.create('yakuman_certificate_renhou')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/renhou');

    // 累计役满
    event.create('yakuman_certificate_kazoe_yakuman')
        .rarity('epic')
        .maxStackSize(64)
        .fireResistant()
        .texture('kubejs:item/yakuman_certificate')
        .tag('kubejs:yakuman_certificates')
        .tag('kubejs:yakuman_certificates/kazoe_yakuman');
});
