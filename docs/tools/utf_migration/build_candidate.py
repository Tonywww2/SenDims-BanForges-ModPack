"""Build the versioned UTF preset without changing the live installation."""
import copy
import json
from workspace import CANDIDATE, ROOT, TERRAIN_DOWNLOADS, write_json


def build():
    original = json.loads((TERRAIN_DOWNLOADS / 'height-survey-original-server-preset.json').read_text())
    preset = copy.deepcopy(original)
    changes = {
        'world.properties.worldHeight': 320,
        'world.continent.continentScale': 4800,
        'world.continent.continentSizeVariance': 0.20,
        'world.continent.continentSkipping': 0.20,
        'terrain.general.terrainRegionSize': 1600,
        'terrain.general.globalHorizontalScale': 1.25,
        'terrain.mountains.horizontalScale': 1.15,
        'terrain.hills.horizontalScale': 1.10,
        'climate.biomeShape.biomeSize': 300,
        'climate.biomeShape.biomeWarpStrength': 60,
        'rivers.riverCount': 10,
        'rivers.mainRivers.bedWidth': 10,
        'rivers.mainRivers.bankWidth': 26,
        'rivers.branchRivers.bedWidth': 6,
        'rivers.branchRivers.bankWidth': 18,
        'rivers.gorgeDepth': 24,
        'rivers.lakes.chance': 0.24,
        'rivers.lakes.sizeMin': 100,
        'rivers.lakes.sizeMax': 200,
        'coasts.coastalIslands.frequency': 0.30,
        'coasts.peninsulas.frequency': 0.40,
        'coasts.peninsulas.size': 1.25,
        'coasts.skerries.density': 0.30,
        'coasts.islandArcs.frequency': 0.20,
        'landforms.atolls.frequency': 0.25,
        'oceans.shelves.width': 1.25,
        'caveFeatures.giantCaverns.frequency': 0.42,
        'caveFeatures.layerCaves.frequency': 0.50,
        'caveFeatures.undergroundRivers.frequency': 0.48,
        'caveFeatures.karstCaves.size': 1.15,
        'miscellaneous.customBiomeFeatures': False,
    }
    log = []
    for path, value in changes.items():
        current = preset
        parts = path.split('.')
        for part in parts[:-1]:
            current = current[part]
        log.append({'parameter': path, 'before': current[parts[-1]], 'after': value})
        current[parts[-1]] = value
    config = CANDIDATE / 'config/ultraterraforged'
    write_json(config / 'modpack-presets/SDBF_Continental.json', preset)
    write_json(config / 'server-preset.json', preset)
    write_json(config / 'modpack.json', {'defaultPreset': 'SDBF_Continental',
                                       'showBuiltinPresets': False,
                                       'useAsDefaultWorldType': False})
    write_json(ROOT / 'preset-changes-v1.json', log)
    print('CANDIDATE_PRESET', len(log), 'parameter changes')


if __name__ == '__main__':
    build()
