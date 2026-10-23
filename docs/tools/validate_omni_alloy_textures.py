"""Check actual PNGs, model references, animation frames and catalog coverage."""
from __future__ import annotations
import collections
import hashlib
import json
from pathlib import Path
from PIL import Image
from omni_alloy_sources import read_catalog

ROOT = Path(__file__).resolve().parents[2]
K = ROOT / "kubejs"


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def texture_path(resource):
    assert resource.startswith("kubejs:"), (resource, "placeholder texture remains")
    ns, name = resource.split(":", 1)
    return K / f"assets/{ns}/textures/{name}.png"


def main():
    reg = read_catalog()["registrations"]
    owned = set(read(ROOT / "docs/kubejs/recipe-research/omni-alloy-implementation.json")["generated_files"])
    fingerprints = collections.defaultdict(list)
    checked = set()

    def check(resource, kind):
        path = texture_path(resource)
        assert path.exists(), path
        assert path.relative_to(ROOT).as_posix() in owned, (path, "missing ownership manifest")
        image = Image.open(path)
        assert image.format == "PNG" and image.mode == "RGBA", (path, image.format, image.mode)
        w, h = image.size
        if kind in {"item", "block"}:
            assert (w, h) == (16, 16), (path, "not native 16 x 16")
            alpha = image.getchannel("A")
            assert set(alpha.tobytes()) <= {0, 255}, (path, "antialiasing/partial alpha")
            assert alpha.getbbox(), (path, "empty sprite")
            if kind == "item":
                assert alpha.getextrema() == (0, 255), (path, "item has no transparent silhouette")
            else:
                assert alpha.getextrema() == (255, 255), (path, "block face has transparency")
                assert all(image.getpixel((x, 0)) == image.getpixel((x, 15)) for x in range(16)), (path, "vertical tile seam")
                assert all(image.getpixel((0, y)) == image.getpixel((15, y)) for y in range(16)), (path, "horizontal tile seam")
            fingerprints[hashlib.sha256(image.tobytes()).hexdigest()].append(resource)
        else:
            assert w == (16 if kind == "still" else 32) and h == w * 4, (path, "invalid animation dimensions")
            metadata = path.with_name(path.name + ".mcmeta")
            assert read(metadata)["animation"] == {"frametime": 8, "interpolate": False}, metadata
            assert metadata.relative_to(ROOT).as_posix() in owned
            frames = [image.crop((0, i * w, w, (i + 1) * w)).tobytes() for i in range(4)]
            assert len(set(frames)) == 4, (path, "identical animation frames")
        checked.add(path)

    for kind in ("items", "blocks"):
        for ident, spec in reg[kind].items():
            ns, name = ident.split(":", 1)
            resource = spec["texture"]
            model = read(K / f"assets/{ns}/models/{'item' if kind == 'items' else 'block'}/{name}.json")
            slot = "layer0" if kind == "items" else "all"
            assert model["textures"][slot] == resource, (ident, "model/catalog mismatch")
            check(resource, "item" if kind == "items" else "block")
            if kind == "blocks":
                assert read(K / f"assets/{ns}/models/item/{name}.json")["parent"] == f"{ns}:block/{name}"
                assert read(K / f"assets/{ns}/blockstates/{name}.json")["variants"][""]["model"] == f"{ns}:block/{name}"
    for ident, spec in reg["fluids"].items():
        ns, name = ident.split(":", 1)
        check(spec["still_texture"], "still")
        check(spec["flowing_texture"], "flow")
        check(spec["bucket_texture"], "item")
        model = read(K / f"assets/{ns}/models/item/{name}_bucket.json")
        assert model["parent"] == "minecraft:item/generated"
        assert model["textures"]["layer0"] == spec["bucket_texture"]
    duplicates = [values for values in fingerprints.values() if len(values) > 1]
    assert not duplicates, ("identical material icons", duplicates)
    print(f"PASS: {len(reg['items'])} items, {len(reg['blocks'])} blocks, {len(reg['fluids'])} buckets; "
          f"{len(checked)} PNGs including 64 native-resolution fluid animations")
    print("PASS: unique pixel content, RGBA transparency, tile seams, complete model links, animation metadata, generator ownership")


if __name__ == "__main__":
    main()
