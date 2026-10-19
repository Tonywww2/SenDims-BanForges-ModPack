"""Stage only certificate content in a fresh, disposable Minecraft runtime."""
from pathlib import Path
import json
import shutil
import sys

PACK = Path(__file__).resolve().parents[3]
SOURCE = Path(r'C:/Users/Tony/Documents/EX/ForgeDev/SlashBlade-SenDims')
VERIFY = Path(r'C:/Users/Tony/.codex/visualizations/2026/09/30/01a0f0a1-7e51-7ad3-808a-6ddbe9d771a3/yakuman-model-design/certificate-verification')


def main():
    runtime = VERIFY / 'run'
    if runtime.exists():
        raise RuntimeError('Verification runtime already exists; use a clean directory')
    runtime.mkdir(parents=True)
    (VERIFY / 'session-created.json').write_text(json.dumps({'created_by': 'yakuman_certificate_tests', 'runtime': str(runtime)}), encoding='utf-8')
    # Pre-populate NuclearCraft's configuration to avoid competing first-run writes on Windows.
    shutil.copytree(SOURCE / 'run/config/NuclearCraft', runtime / 'config/NuclearCraft')
    for relative in ('startup_scripts/yakuman_certificates.js', 'client_scripts/yakuman_certificates.js',
                     'config/yakuman_certificates.json', 'assets/kubejs/lang/zh_cn.json', 'assets/kubejs/lang/en_us.json'):
        target = runtime / 'kubejs' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(PACK / 'kubejs' / relative, target)
    shutil.copytree(PACK / 'kubejs/data/riichi_mahjong_forge', runtime / 'kubejs/data/riichi_mahjong_forge')
    shutil.copytree(PACK / 'kubejs/data/kubejs/loot_tables/rewards/yakuman_certificates',
                    runtime / 'kubejs/data/kubejs/loot_tables/rewards/yakuman_certificates')
    artifact = VERIFY / 'maven/local/riichi/riichi-mahjong-forge/0.2.0'
    artifact.mkdir(parents=True, exist_ok=True)
    shutil.copy2(PACK / 'mods/riichi_mahjong_forge-0.2.0.jar', artifact / 'riichi-mahjong-forge-0.2.0.jar')
    (artifact / 'riichi-mahjong-forge-0.2.0.pom').write_text(
        '<project><modelVersion>4.0.0</modelVersion><groupId>local.riichi</groupId>'
        '<artifactId>riichi-mahjong-forge</artifactId><version>0.2.0</version></project>', encoding='utf-8')
    template = VERIFY / 'resources/data/yakuman_certificate_test/structures/certificate_test.nbt'
    template.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE / 'src/main/resources/data/slashblade_sendims/structures/holy_sword_test.nbt', template)
    print(runtime)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
