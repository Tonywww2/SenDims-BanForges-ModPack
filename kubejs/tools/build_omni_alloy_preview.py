"""Build the offline HTML route atlas from the current design and recipe files."""

import base64
import io
import json
from collections import Counter
from datetime import date
from pathlib import Path
from zipfile import ZipFile, BadZipFile

from PIL import Image
from omni_alloy_sources import read_catalog, read_recipes


ROOT = Path(__file__).resolve().parents[2]
KUBE = ROOT / "kubejs"
DOCS = KUBE / "docs/recipe-research"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def build():
    route = read_json(DOCS / "omni-alloy-route.json")
    config = read_catalog()
    script_recipes = read_recipes()
    nodes = route["nodes"]
    ids = {n["id"] for n in nodes}
    assert len(ids) == len(nodes)
    complete = set()
    while len(complete) < len(nodes):
        ready = {n["id"] for n in nodes if n["id"] not in complete
                 and set(n.get("dependencies", [])) <= complete}
        assert ready, "Missing dependency or cyclic graph"
        complete |= ready

    # Load installed translations, then apply the pack's own overrides last.
    translations = {}
    launcher = ROOT.parents[2]
    vanilla_assets = launcher / "assets/indexes/5.json"
    if vanilla_assets.exists():
        entry = read_json(vanilla_assets).get("objects", {}).get("minecraft/lang/zh_cn.json")
        if entry:
            asset = launcher / "assets/objects" / entry["hash"][:2] / entry["hash"]
            if asset.exists():
                translations.update(read_json(asset))
    for jar in sorted((ROOT / "mods").glob("*.jar")):
        try:
            with ZipFile(jar) as archive:
                for name in archive.namelist():
                    if name.startswith("assets/") and name.endswith("/lang/zh_cn.json"):
                        try:
                            translations.update(json.loads(archive.read(name).decode("utf-8-sig")))
                        except (ValueError, UnicodeError):
                            pass
        except BadZipFile:
            pass
    for path in sorted((KUBE / "assets").glob("*/lang/zh_cn.json")):
        translations.update(read_json(path))

    names = {}
    icons = {}
    for category, registrations in config["registrations"].items():
        for item, entry in registrations.items():
            names[item] = entry["name"]
            texture = entry.get("texture") or entry.get("bucket_texture")
            icon_id = item if category != "fluids" else item + "_bucket"
            if category == "fluids":
                names[icon_id] = entry["name"] + "桶"
            if texture:
                namespace, local = texture.split(":", 1)
                path = KUBE / "assets" / namespace / "textures" / (local + ".png")
                if path.exists():
                    with Image.open(path) as source:
                        icon = source.convert("RGBA").crop((0, 0, source.width, source.width))
                        buffer = io.BytesIO()
                        icon.save(buffer, format="PNG")
                        icons[icon_id] = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
    for branch in route["branches"]:
        for ingredient in branch["stage5_inputs"]:
            names[ingredient["item"]] = ingredient["name"]
    names["thermal:latex_bucket"] = "胶乳桶"

    # Keep only names used by the bundled recipes; no external requests at runtime.
    def item_name(item):
        if item in names:
            return names[item]
        namespace, local = item.split(":", 1) if ":" in item else ("", item)
        for prefix in ("item", "block", "fluid"):
            translated = translations.get(f"{prefix}.{namespace}.{local}")
            if translated:
                names[item] = translated
                return translated
        names[item] = item
        return item

    def refs(value, multiplier=1):
        found = []
        if isinstance(value, list):
            # An ingredient array can represent alternatives; retain them as alternatives.
            for entry in value:
                found += refs(entry, multiplier)
        elif isinstance(value, dict):
            kind = next((k for k in ("item", "tag", "fluid", "block")
                         if isinstance(value.get(k), str)), None)
            if kind:
                identifier = value[kind]
                item_name(identifier)
                found.append({"id": identifier, "kind": kind,
                              "count": value.get("count", 1) * multiplier,
                              "amount": value.get("amount")})
            else:
                for key, entry in value.items():
                    if key not in ("type", "conditions", "nbt"):
                        found += refs(entry, multiplier)
        return found

    def input_refs(recipe):
        if "pattern" in recipe and "key" in recipe:
            counts = Counter("".join(recipe["pattern"]))
            return [r for key, value in recipe["key"].items()
                    for r in refs(value, counts[key])]
        excluded = {"type", "conditions", "output", "outputs", "result", "results",
                    "outputItem", "outputFluid", "outputItems", "outputFluids"}
        return [r for key, value in recipe.items() if key not in excluded
                for r in refs(value)]

    compact_nodes = []
    recipes_seen = set()
    for node in nodes:
        node_id = node["id"]
        workflow = config["workflows"].get(node_id, {})
        recipes = []
        recipe_ids = list(workflow.get("recipes", []))
        if workflow.get("preparation"):
            recipe_ids.insert(0, workflow["preparation"])
        direct = "sdbf:omni_alloy/" + node_id
        if direct in script_recipes and not recipe_ids:
            recipe_ids = ["sdbf:omni_alloy/" + node_id]
        for recipe_id in recipe_ids:
            if recipe_id in script_recipes:
                recipe = script_recipes[recipe_id]
                recipes.append({"id": recipe_id, "json": recipe, "inputs": input_refs(recipe)})
                recipes_seen.add(recipe_id)
        if workflow.get("mode") in ("original_supply", "native_carrier"):
            # The native carrier must really be produced before it can be packed.
            for evidence in node.get("evidence", [])[:1]:
                native_recipe = evidence.get("json")
                if native_recipe:
                    recipes.insert(0, {"id": evidence["recipe_id"], "json": native_recipe,
                                       "inputs": input_refs(native_recipe), "native": True})
        output = node["output_contract"]
        item = output["id"]
        name = item_name(item)
        if node.get("phase") == "stage5_entry" or name == item:
            name = output.get("label") or node["label"]
        detail = {key: node[key] for key in (
            "id", "branch", "label", "recipe_identifier", "phase", "medium", "segment",
            "dependencies", "consumed_inputs", "output_contract", "constraint", "per_ingot_demand"
        ) if key in node}
        detail.update(name=name, mode=workflow.get("mode", "assembly"), recipes=recipes)
        if workflow.get("carrier"):
            detail["carrier"] = workflow["carrier"]
            item_name(workflow["carrier"])
            detail["note"] = workflow.get("note", "")
        # A known schema issue is visible in the atlas rather than presented as a working step.
        for entry in recipes:
            recipe = entry["json"]
            if recipe.get("type") == "pneumaticcraft:refinery" and not 2 <= len(recipe.get("results", [])) <= 4:
                detail["issue"] = "当前配方仅配置 1 种输出；气动炼油配方需要 2–4 种输出，此节点待修正。"
        compact_nodes.append(detail)

    for ingredient in ["kubejs:basepoint_alloy", "kubejs:chaotic_truth", "elder_bosses:rune_fragment"]:
        item_name(ingredient)

    # Reuse native textures where their ordinary item/block texture exists.
    native_targets = {item for item in names if item not in icons and ":" in item}
    jars = sorted((ROOT / "mods").glob("*.jar"))
    jars += list((launcher / "libraries/com/mojang/minecraft/1.20.1").glob("*-client.jar"))
    for jar in jars:
        try:
            with ZipFile(jar) as archive:
                entries = set(archive.namelist())
                for item in list(native_targets):
                    namespace, local = item.split(":", 1)
                    candidates = [f"assets/{namespace}/textures/{kind}/{local}{suffix}.png"
                                  for kind, suffix in (("item", ""), ("block", ""),
                                                       ("block", "_top"), ("block", "_side"))]
                    texture = next((path for path in candidates if path in entries), None)
                    if texture:
                        with Image.open(io.BytesIO(archive.read(texture))) as source:
                            icon = source.convert("RGBA").crop((0, 0, source.width, source.width))
                            buffer = io.BytesIO()
                            icon.save(buffer, format="PNG")
                            icons[item] = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
                        native_targets.remove(item)
        except BadZipFile:
            pass
    payload = {
        "title": "万象锭 · 合成路线图", "built": str(date.today()),
        "revision": route["revision"], "coverage": route["coverage"],
        "branches": route["branches"], "nodes": compact_nodes,
        "entryTotals": route["stage5_entry_totals_per_ingot"],
        "supplies": route["recurring_supply_per_ingot"], "names": names, "icons": icons,
        "recipeFileCount": len(recipes_seen),
    }
    template = (KUBE / "tools/omni_alloy_preview.html").read_text(encoding="utf-8")
    serialized = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    output = DOCS / "omni-alloy-route-preview.html"
    output.write_text(template.replace("/*__ROUTE_DATA__*/", serialized), encoding="utf-8")
    print(f"Built {output}")
    print(f"{len(nodes)} nodes; {sum(len(n.get('dependencies', [])) for n in nodes)} edges; "
          f"{len(icons)} embedded textures; {len(recipes_seen)} inline script recipes; {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    build()
