"""Draw the entire omni-alloy material set directly at native pixel resolution.

Run this with a Python installation containing Pillow, from any directory.
Only material presentation resources and their ownership manifest are updated.
"""
from __future__ import annotations
import json
from pathlib import Path
from omni_textures.build import draw_catalog, preview
from omni_alloy_sources import read_catalog, write_catalog

ROOT = Path(__file__).resolve().parents[2]
K = ROOT / "kubejs"


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    data = read_catalog()
    reg = data["registrations"]
    files = draw_catalog(reg, K / "assets")
    for ident, spec in reg["items"].items():
        ns, name = ident.split(":", 1)
        path = K / f"assets/{ns}/models/item/{name}.json"
        write(path, {"parent": "minecraft:item/generated", "textures": {"layer0": spec["texture"]}})
        files.append(path)
    for ident, spec in reg["blocks"].items():
        ns, name = ident.split(":", 1)
        path = K / f"assets/{ns}/models/block/{name}.json"
        write(path, {"parent": "minecraft:block/cube_all", "textures": {"all": spec["texture"]}})
        files.append(path)
    for ident, spec in reg["fluids"].items():
        ns, name = ident.split(":", 1)
        path = K / f"assets/{ns}/models/item/{name}_bucket.json"
        write(path, {"parent": "minecraft:item/generated", "textures": {"layer0": spec["bucket_texture"]}})
        files.append(path)
    write_catalog(data)
    manifest = ROOT / "docs/kubejs/recipe-research/omni-alloy-implementation.json"
    info = json.loads(manifest.read_text(encoding="utf-8"))
    info["generated_files"] = sorted(set(info["generated_files"]) | {p.relative_to(ROOT).as_posix() for p in files})
    write(manifest, info)
    output = ROOT / "docs/archive/cache/omni_alloy/material-textures-preview.png"
    preview(reg, K / "assets", output)
    print(f"Drew {len(reg['items']) - 9} intermediate item sprites, {len(reg['blocks'])} block tiles, "
          f"{len(reg['fluids'])} buckets and {len(reg['fluids']) * 2} animated fluid textures; kept 9 final sprites.")
    print(f"Preview: {output}")


if __name__ == "__main__":
    main()
