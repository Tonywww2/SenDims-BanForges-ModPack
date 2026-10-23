"""Collect recipe evidence for design work without loading or changing game data."""
from __future__ import annotations

import collections
import datetime
import io
import json
import re
import struct
import tomllib
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/kubejs/recipe-research"
PROBE = ROOT / "kubejs/probe/generated/globals.d.ts"
RESOURCE_RECIPE = re.compile(r"^(?P<pack>(?:.*/)?)data/(?P<namespace>[^/]+)/recipes/(?P<path>.+)\.json$")


def normalize(value):
    return value if ":" in value else "minecraft:" + value


def archives(jars):
    """Include Forge's declared JarJar dependencies, e.g. bundled Thermal Core."""
    def walk(archive, label):
        yield label, archive
        metadata = "META-INF/jarjar/metadata.json"
        if metadata not in archive.namelist():
            return
        for entry in json.loads(archive.read(metadata)).get("jars", []):
            path = entry["path"]
            with zipfile.ZipFile(io.BytesIO(archive.read(path))) as child:
                yield from walk(child, label + "!/" + path)
    for jar in jars:
        with zipfile.ZipFile(jar) as archive:
            yield from walk(archive, jar.name)


def class_constants(data):
    """Read Java constant-pool strings, without executing any mod code."""
    count = struct.unpack_from(">H", data, 8)[0]
    pool = {}; strings = []; pos = 10; index = 1
    while index < count:
        tag = data[pos]; pos += 1
        if tag == 1:
            length = struct.unpack_from(">H", data, pos)[0]; pos += 2
            pool[index] = data[pos:pos + length].decode("utf-8", errors="replace")
            pos += length
        elif tag == 8:
            strings.append(struct.unpack_from(">H", data, pos)[0]); pos += 2
        elif tag in (3, 4, 9, 10, 11, 12, 17, 18): pos += 4
        elif tag in (5, 6): pos += 8; index += 1
        elif tag in (7, 16, 19, 20): pos += 2
        elif tag == 15: pos += 3
        else: raise ValueError(f"Unknown constant pool tag {tag}")
        index += 1
    return [pool[i] for i in strings], list(pool.values())


def scan():
    OUT.mkdir(parents=True, exist_ok=True)
    jars = sorted((ROOT / "mods").glob("*.jar"))
    mod_ids = {"minecraft", "forge"}
    jar_mod_ids = {}
    for jar_label, archive in archives(jars):
        ids = set()
        for name in ("META-INF/mods.toml", "META-INF/neoforge.mods.toml"):
            if name in archive.namelist():
                meta = tomllib.loads(archive.read(name).decode("utf-8-sig"))
                ids.update(mod["modId"] for mod in meta.get("mods", []))
        mod_ids.update(ids); jar_mod_ids[jar_label] = sorted(ids)

    text = PROBE.read_text(encoding="utf-8-sig")
    snapshots = {}
    for name in ("RecipeType", "RecipeSerializer"):
        match = re.search(r"^\s*type " + name + r" = (.+);$", text, re.M)
        snapshots[name] = sorted({normalize(x) for x in re.findall(r'"([^\"]+)"', match[1])})
    snapshot_namespaces = {x.split(":")[0] for values in snapshots.values() for x in values}

    def condition(value):
        if not isinstance(value, dict): return None
        kind = value.get("type")
        if kind in ("forge:mod_loaded", "neoforge:mod_loaded"):
            return value.get("modid") in mod_ids
        if kind in ("forge:true", "neoforge:true"): return True
        if kind in ("forge:false", "neoforge:false"): return False
        if kind in ("forge:not", "neoforge:not"):
            result = condition(value.get("value")); return None if result is None else not result
        if kind in ("forge:and", "forge:or", "neoforge:and", "neoforge:or"):
            values = [condition(x) for x in value.get("values", [])]
            if kind.endswith(":and"):
                return False if False in values else (None if None in values else True)
            return True if True in values else (None if None in values else False)
        return None

    records = {}; recipe_count = 0; class_registry_evidence = []; jei_category_classes = []

    def record(kind):
        kind = normalize(kind)
        return records.setdefault(kind, {"id": kind, "jar_recipe_count": 0,
            "conditions_definitely_false": 0, "conditions_unknown": 0,
            "sources": [], "examples": [], "kubejs_references": [],
            "probe_serializer": kind in snapshots["RecipeSerializer"],
            "probe_recipe_type": kind in snapshots["RecipeType"]})

    def recipe(data, label, recipe_id, conditions=()):
        nonlocal recipe_count
        if not isinstance(data, dict): return
        kind = data.get("type")
        if not isinstance(kind, str): return
        values = [condition(x) for x in (*conditions, *data.get("conditions", []))]
        item = record(kind); item["jar_recipe_count"] += 1; recipe_count += 1
        item["conditions_definitely_false"] += False in values
        item["conditions_unknown"] += None in values and False not in values
        if label not in item["sources"] and len(item["sources"]) < 8:
            item["sources"].append(label)
        item["examples"].append({"recipe_id": recipe_id, "source": label,
            "conditions": "false" if False in values else "unknown" if None in values else "true",
            "json": data})
        item["examples"].sort(key=lambda x: (
            {"true": 0, "unknown": 1, "false": 2}[x["conditions"]],
            x["recipe_id"].split(":")[0] != normalize(kind).split(":")[0],
            "/compat/" in x["source"], x["source"]))
        del item["examples"][3:]
        if kind == "forge:conditional":
            for alternative in data.get("recipes", []):
                recipe(alternative.get("recipe"), label, recipe_id,
                       (*conditions, *alternative.get("conditions", [])))

    for jar_label, archive in archives(jars):
        for name in archive.namelist():
            short = name.rsplit("/", 1)[-1]
            if name.endswith(".class") and "/jei/" in name.lower() and "Category" in short and "$" not in short:
                jei_category_classes.append(jar_label + "!/" + name)
            match = RESOURCE_RECIPE.match(name)
            if match:
                data = json.loads(archive.read(name).decode("utf-8-sig"))
                recipe(data, jar_label + "!/" + name, match["namespace"] + ":" + match["path"])
            elif name.endswith(".class") and any(word in name.rsplit("/", 1)[-1]
                    for word in ("RecipeTypes", "RecipeSerializers", "RecipeRegistration")):
                strings, symbols = class_constants(archive.read(name))
                if any("RecipeSerializer" in s or "RecipeType" in s for s in symbols):
                    class_registry_evidence.append({"source": jar_label + "!/" + name,
                        "constants": strings,
                        "note": "Registration-class constants require review; not automatically treated as IDs."})

    for values in snapshots.values():
        for kind in values: record(kind)
    # These serializer-less/runtime-type distinctions were checked in current bytecode.
    for kind, source, role in [
        ("pneumaticcraft:assembly_drill_laser", "pneumaticcraft/ModRecipeTypes.class", "recipe_type_only"),
        ("pneumaticcraft:one_probe_helmet_crafting", "pneumaticcraft/ModRecipeSerializers.class", "serializer"),
        ("pneumaticcraft:patchouli_book_crafting", "pneumaticcraft/ModRecipeSerializers.class", "serializer"),
    ]:
        record(kind)["current_code_registration"] = {"source": source, "role": role}

    for path in sorted((ROOT / "kubejs/data").glob("*/recipes/**/*.json")):
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        if isinstance(data, dict) and isinstance(data.get("type"), str):
            record(data["type"])["kubejs_references"].append(str(path.relative_to(ROOT)))
    known = set(records)
    for path in sorted((ROOT / "kubejs/server_scripts").rglob("*.js")):
        source = path.read_text(encoding="utf-8-sig")
        # References are evidence, not execution: commented/dynamic statements need review.
        for match in re.finditer(r"(?:['\"]type['\"]|\btype)\s*:\s*['\"]([a-z0-9_.-]+:[a-z0-9_./-]+)['\"]", source):
            if match[1] in known:
                record(match[1])["kubejs_references"].append(
                    f"{path.relative_to(ROOT).as_posix()}:{source.count(chr(10), 0, match.start()) + 1}")
        for match in re.finditer(r"\.recipes\.([a-z0-9_]+)\.([a-z0-9_]+)\s*\(", source):
            kind = match[1] + ":" + match[2]
            kind = {"slashblade:slashblade_shaped_recipe": "slashblade:shaped_blade"}.get(kind, kind)
            if kind in known:
                record(kind)["kubejs_references"].append(
                    f"{path.relative_to(ROOT).as_posix()}:{source.count(chr(10), 0, match.start()) + 1}")

    for item in records.values():
        ns = item["id"].split(":")[0]
        item["installed_namespace_evidence"] = ns in mod_ids or ns in snapshot_namespaces
        item["availability"] = ("installed_candidate" if item["installed_namespace_evidence"]
            else "compatibility_namespace_not_installed")
        item["kubejs_references"] = sorted(set(item["kubejs_references"]))
        if item["id"] == "apotheosis:fletching":
            config = (ROOT / "config/apotheosis/apotheosis.cfg").read_text(encoding="utf-8-sig")
            if 'B:"Enable Village Module"=false' in config:
                item["availability"] = "module_disabled_by_configuration"
                item["configuration_note"] = "Apotheosis Village Module is disabled; do not require fletching in the base route."
    result = {
        "scope": "Installed root mod jars and declared JarJar dependencies, local recipe JSON, KubeJS references and ProbeJS registry snapshot. Static evidence; dependency version selection, conditional recipes and removals are not a live RecipeManager dump.",
        "probe_snapshot_local_mtime": datetime.datetime.fromtimestamp(PROBE.stat().st_mtime).isoformat(),
        "jar_count": len(jars), "installed_mod_ids": sorted(mod_ids),
        "embedded_jar_count": len(jar_mod_ids) - len(jars),
        "jar_mod_ids": jar_mod_ids,
        "recipe_json_entries_including_conditional_children": recipe_count,
        "probe_recipe_types_normalized": snapshots["RecipeType"],
        "probe_serializers_normalized": snapshots["RecipeSerializer"],
        "records": sorted(records.values(), key=lambda x: x["id"]),
        "registration_class_evidence": class_registry_evidence,
        "jei_category_classes": sorted(jei_category_classes),
    }
    output = OUT / "recipe-types.json"
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Collected {len(jars)} jars, {recipe_count} recipe records, {len(records)} type/serializer identifiers")
    print(f"ProbeJS: {len(snapshots['RecipeType'])} normalized types; {len(snapshots['RecipeSerializer'])} normalized serializers")
    groups = collections.Counter(x["availability"] for x in records.values())
    print(dict(groups)); print(output.relative_to(ROOT))


if __name__ == "__main__":
    scan()
