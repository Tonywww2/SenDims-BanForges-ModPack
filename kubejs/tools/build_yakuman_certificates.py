"""Add per-yaku advancement rewards without changing Mahjong's win detection."""
from pathlib import Path
import copy
import json
import sys
import zipfile

PACK = Path(__file__).resolve().parents[2]
KUBEJS = PACK / 'kubejs'
MOD = PACK / 'mods/riichi_mahjong_forge-0.2.0.jar'


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    # 17种证书及本地化直接在此定义；游戏内注册位于 startup_scripts/yakuman_certificates.js。
    catalog = {
        "reward_count": 1,
        "certificates": [
            {
                "key": "kokushi_musou",
                "family": "kokushi_musou",
                "zh_cn": "国士无双",
                "en_us": "Thirteen Orphans"
            },
            {
                "key": "kokushi_musou_juusanmen_machi",
                "family": "kokushi_musou",
                "zh_cn": "国士无双十三面",
                "en_us": "Thirteen Orphans Thirteen-Sided Wait"
            },
            {
                "key": "suu_ankou",
                "family": "suu_ankou",
                "zh_cn": "四暗刻",
                "en_us": "Four Concealed Triplets"
            },
            {
                "key": "suu_ankou_tanki",
                "family": "suu_ankou",
                "zh_cn": "四暗刻单骑",
                "en_us": "Four Concealed Triplets Single Wait"
            },
            {
                "key": "daisangen",
                "family": "daisangen",
                "zh_cn": "大三元",
                "en_us": "Big Three Dragons"
            },
            {
                "key": "shousuushii",
                "family": "shousuushii",
                "zh_cn": "小四喜",
                "en_us": "Little Four Winds"
            },
            {
                "key": "daisuushii",
                "family": "daisuushii",
                "zh_cn": "大四喜",
                "en_us": "Big Four Winds"
            },
            {
                "key": "tsuuiisou",
                "family": "tsuuiisou",
                "zh_cn": "字一色",
                "en_us": "All Honors"
            },
            {
                "key": "chinroutou",
                "family": "chinroutou",
                "zh_cn": "清老头",
                "en_us": "All Terminals"
            },
            {
                "key": "ryuuiisou",
                "family": "ryuuiisou",
                "zh_cn": "绿一色",
                "en_us": "All Green"
            },
            {
                "key": "chuuren_poutou",
                "family": "chuuren_poutou",
                "zh_cn": "九莲宝灯",
                "en_us": "Nine Gates"
            },
            {
                "key": "junsei_chuuren_poutou",
                "family": "chuuren_poutou",
                "zh_cn": "纯正九莲宝灯",
                "en_us": "Pure Nine Gates"
            },
            {
                "key": "suukantsu",
                "family": "suukantsu",
                "zh_cn": "四杠子",
                "en_us": "Four Kans"
            },
            {
                "key": "tenhou",
                "family": "tenhou",
                "zh_cn": "天和",
                "en_us": "Blessing of Heaven"
            },
            {
                "key": "chiihou",
                "family": "chiihou",
                "zh_cn": "地和",
                "en_us": "Blessing of Earth"
            },
            {
                "key": "renhou",
                "family": "renhou",
                "zh_cn": "人和",
                "en_us": "Blessing of Man"
            },
            {
                "key": "kazoe_yakuman",
                "family": "kazoe_yakuman",
                "zh_cn": "累计役满",
                "en_us": "Counted Yakuman"
            }
        ]
    }
    certificates = catalog['certificates']
    assert len(certificates) == len({entry['key'] for entry in certificates}) == 17
    assert catalog['reward_count'] == 1
    manifest = []
    with zipfile.ZipFile(MOD) as mod:
        for entry in certificates:
            key = entry['key']
            advancement = f'riichi_mahjong_forge:yaku/{key}'
            item = f'kubejs:yakuman_certificate_{key}'
            loot = f'kubejs:rewards/yakuman_certificates/{key}'
            relative = f'data/riichi_mahjong_forge/advancements/yaku/{key}.json'
            original = json.loads(mod.read(relative))
            patched = copy.deepcopy(original)
            rewards = patched.setdefault('rewards', {})
            tables = rewards.setdefault('loot', [])
            if loot not in tables:
                tables.append(loot)
            # The native criteria, parent, description and existing rewards remain authoritative.
            assert all(patched[field] == value for field, value in original.items() if field != 'rewards')
            write_json(KUBEJS / relative, patched)
            write_json(KUBEJS / f'data/kubejs/loot_tables/rewards/yakuman_certificates/{key}.json', {
                'type': 'minecraft:advancement_reward',
                'pools': [{'rolls': 1, 'entries': [{'type': 'minecraft:item', 'name': item}]}]
            })
            manifest.append({'item': item, 'advancement': advancement, 'reward_loot': loot,
                             'family_tag': f'kubejs:yakuman_certificates/{entry["family"]}',
                             'reward_count': 1})

    for locale in ('zh_cn', 'en_us'):
        file = KUBEJS / f'assets/kubejs/lang/{locale}.json'
        language = json.loads(file.read_text(encoding='utf-8-sig')) if file.exists() else {}
        before = dict(language)
        for entry in certificates:
            language[f'item.kubejs.yakuman_certificate_{entry["key"]}'] = (
                '役满之证：' if locale == 'zh_cn' else 'Yakuman Certificate: '
            ) + entry[locale]
        language['info.kubejs.yakuman_certificate.obtain'] = (
            '首次达成对应役满成就时获得。' if locale == 'zh_cn'
            else 'Awarded when the corresponding yakuman advancement is first completed.'
        )
        language['info.kubejs.yakuman_certificate.material'] = (
            '役刀提前阶段合成的凭证材料，使用时消耗。' if locale == 'zh_cn'
            else 'A consumable material for crafting a related yakuman blade one stage earlier.'
        )
        for key, value in before.items():
            if 'yakuman_certificate' not in key:
                assert language[key] == value
        write_json(file, language)

    write_json(KUBEJS / 'docs/yakuman-certificates.json', {
        'certificate_count': 17,
        'acquisition': 'One item from the first completion of each specific Mahjong advancement.',
        'generic_yakuman_summary_reward': False,
        'reward_delivery': 'Vanilla advancement loot rewards; no player tick scan or extra event listener.',
        'crafting_policy': 'Consumed one per early blade recipe, replacing its single stage material; all parent blades and other materials remain required.',
        'item_registration': {
            'source': 'kubejs/startup_scripts/yakuman_certificates.js',
            'style': '17 explicit registrations; no runtime JsonIO/catalog dependency.'
        },
        'catalog_source': 'kubejs/tools/build_yakuman_certificates.py',
        'shared_texture': 'kubejs:item/yakuman_certificate',
        'texture': {
            'size': [16, 16],
            'transparent': True,
            'generator': 'hand-drawn native pixel grid',
            'source': 'kubejs/tools/draw_yakuman_certificate.py',
            'resampled': False,
            'description': 'Gold-edged parchment scroll with a white Mahjong tile, green side and red seal.'
        },
        'certificates': manifest
    })
    print('Generated 17 certificate items, advancement overrides and reward loot tables.')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
