"""Read and emit the omni-alloy definitions embedded in the KubeJS scripts.

Recipe object literals use JSON-compatible syntax so offline tools can inspect
the exact objects passed to event.custom without running Minecraft.
"""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
STARTUP = ROOT / "kubejs/startup_scripts/omni_alloy.js"
SERVER = ROOT / "kubejs/server_scripts/recipes/s5_omni_alloy.js"
CATALOG_BEGIN = "// BEGIN OMNI ALLOY CATALOG"
CATALOG_END = "// END OMNI ALLOY CATALOG"


def read_catalog():
    text = STARTUP.read_text(encoding="utf-8-sig")
    body = text.split(CATALOG_BEGIN, 1)[1].split(CATALOG_END, 1)[0]
    body = body.split("global.sdbfOmniAlloy =", 1)[1].lstrip()
    return json.JSONDecoder().raw_decode(body)[0]


def write_catalog(catalog):
    text = STARTUP.read_text(encoding="utf-8-sig")
    literal = json.dumps(catalog, ensure_ascii=False, indent=4)
    block = f"{CATALOG_BEGIN}\nglobal.sdbfOmniAlloy = {literal};\n{CATALOG_END}"
    if CATALOG_BEGIN in text:
        before, rest = text.split(CATALOG_BEGIN, 1)
        _, after = rest.split(CATALOG_END, 1)
        text = before + block + after
    else:
        registry = text[text.index("StartupEvents.registry"):]
        text = "// priority: 50\n// Material registrations and route metadata are embedded here.\n" + block + "\n\n" + registry
    STARTUP.write_text(text, encoding="utf-8")


def read_recipes():
    text = SERVER.read_text(encoding="utf-8-sig")
    decoder = json.JSONDecoder()
    recipes = {}
    for match in re.finditer(r"\bevent\.custom\(\s*", text):
        recipe, length = decoder.raw_decode(text[match.end():])
        tail = text[match.end() + length:]
        identifier = re.match(r"\s*\)\s*\.id\(['\"]([^'\"]+)['\"]\)\s*;", tail)
        if not identifier:
            raise ValueError("Expected an explicit recipe ID after event.custom")
        recipe_id = identifier[1]
        if recipe_id in recipes:
            raise ValueError("Duplicate recipe ID: " + recipe_id)
        recipes[recipe_id] = recipe
    return recipes


def write_recipes(recipes, catalog, labels=None):
    original = SERVER.read_text(encoding="utf-8-sig")
    validation = original[original.index("let omniValidCarrier"):original.index("ServerEvents.recipes")].rstrip()
    lines = ["// priority: -50", "// All omni-alloy recipes are written directly in this script.",
             "// Native carriers keep their original item classes and state checks.", validation,
             "", "ServerEvents.recipes(event => {"]
    labels = labels or {}
    for recipe_id, recipe in recipes.items():
        step = recipe_id.rsplit("/", 1)[-1]
        comment = labels.get(step, step)
        lines.extend([f"    // {comment} ({step})", "    event.custom(" +
                      json.dumps(recipe, ensure_ascii=False, indent=4).replace("\n", "\n    ") +
                      f").id('{recipe_id}');", ""])
    lines.append("    // Native-carrier packaging: each recipe consumes its checked native item.")
    for entry in catalog["packaging"]:
        carrier, output, check, recipe_id = (json.dumps(entry[key], ensure_ascii=False)
                                            for key in ("carrier", "output", "check", "recipe"))
        lines.extend([
            "", f"    // {entry['step']}: {entry['note']}",
            f"    if (Item.of({carrier}).isEmpty() || Item.of({output}).isEmpty()) {{",
            f"        throw new Error('Missing omni carrier or output: {entry['step']}');", "    }",
            f"    event.shapeless({output}, [{carrier}, 'kubejs:omni_process_liner'])",
            "        .modifyResult((grid, result) => {", f"            let carrier = grid.find({carrier});",
            f"            return omniValidCarrier(carrier, {check}) ? result : Item.of('minecraft:air');",
            f"        }}).id({recipe_id});",
        ])
    lines.extend(["});", ""])
    SERVER.write_text("\n".join(lines), encoding="utf-8")
