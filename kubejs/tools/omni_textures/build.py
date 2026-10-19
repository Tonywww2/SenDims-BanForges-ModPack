"""Assemble explicitly drawn branch textures into the material catalog."""
from pathlib import Path
import sys

from .pixel import PRESERVED

# Drawing modules can also be run directly for an individual artist's preview.
_HERE = str(Path(__file__).resolve().parent)
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)


def draw_catalog(catalog, assets_root):
    from . import draw_organic, draw_industry, draw_nuclear_precision, draw_fluids

    assets_root = Path(assets_root)
    item_map, block_map = {}, {}
    for module in (draw_organic, draw_industry, draw_nuclear_precision):
        result = module.draw(catalog, assets_root)
        assert not item_map.keys() & result["items"].keys(), module.__name__
        assert not block_map.keys() & result["blocks"].keys(), module.__name__
        item_map.update(result["items"])
        block_map.update(result["blocks"])
    assert set(item_map) == set(catalog["items"]) - PRESERVED, "Missing item drawing"
    assert set(block_map) == set(catalog["blocks"]), "Missing block drawing"
    for ident in PRESERVED:
        if ident in catalog["items"]:
            ns, name = ident.split(":", 1)
            item_map[ident] = f"{ns}:item/{name}"
    fluid_map = draw_fluids.draw(catalog, assets_root)
    files = []
    for group, mapping in [("items", item_map), ("blocks", block_map)]:
        for ident, texture in mapping.items():
            catalog[group][ident]["texture"] = texture
            ns, path = texture.split(":", 1)
            files.append(assets_root / ns / "textures" / (path + ".png"))
    for ident, textures in fluid_map.items():
        spec = catalog["fluids"][ident]
        spec["still_texture"] = textures["still"]
        spec["flowing_texture"] = textures["flow"]
        spec["bucket_texture"] = textures["bucket"]
        for kind, texture in textures.items():
            ns, path = texture.split(":", 1)
            dest = assets_root / ns / "textures" / (path + ".png")
            files.append(dest)
            if kind != "bucket":
                files.append(dest.with_name(dest.name + ".mcmeta"))
    assert all(path.exists() for path in files), "A drawn PNG or animation metadata is absent"
    return sorted(set(files))


def preview(catalog, assets_root, output):
    """Enlarge native sprites for review only; production textures stay untouched."""
    from PIL import Image, ImageDraw, ImageFont

    font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 12)
    small = ImageFont.load_default()
    branch_order = ["bio", "aether", "mana", "thermal", "engineering", "pneumatic", "nuclear", "precision"]
    entries = []
    for branch in branch_order:
        for group in ("items", "blocks", "fluids"):
            for ident, spec in catalog[group].items():
                if spec["branch"] == branch:
                    entries.append((ident, spec, spec["bucket_texture"] if group == "fluids" else spec["texture"], group))
    cols, cell_w, cell_h = 16, 96, 100
    rows = (len(entries) + cols - 1) // cols
    image = Image.new("RGB", (cols * cell_w, rows * cell_h + 40), "#1c222d")
    pen = ImageDraw.Draw(image)
    pen.text((12, 9), "万象合金材料 · 原生像素贴图总览 / 16×16", font=font, fill="#e1e8f1")
    for i, (ident, spec, texture, group) in enumerate(entries):
        x, y = (i % cols) * cell_w, (i // cols) * cell_h + 36
        ns, rel = texture.split(":", 1)
        sprite = Image.open(Path(assets_root) / ns / "textures" / (rel + ".png")).convert("RGBA")
        sprite = sprite.resize((48, 48), Image.Resampling.NEAREST)
        # Subtle checkerboard makes transparency and silhouette defects visible.
        for cy in range(0, 48, 6):
            for cx in range(0, 48, 6):
                pen.rectangle((x + 24 + cx, y + cy, x + 29 + cx, y + cy + 5),
                              fill="#313b4b" if (cx + cy) % 12 else "#293241")
        image.paste(sprite, (x + 24, y), sprite)
        name = spec["name"].replace("构件", "").replace("前驱块", "前驱")
        pen.text((x + 3, y + 52), name[:7], font=font, fill="#e1e8ed")
        if len(name) > 7:
            pen.text((x + 3, y + 67), name[7:14], font=font, fill="#e1e8ed")
        code = ident.split(":", 1)[1].removeprefix("omni_")
        pen.text((x + 3, y + 84), code[:17], font=small, fill="#8eacbd")
    Path(output).parent.mkdir(parents=True, exist_ok=True)
    image.save(output)
