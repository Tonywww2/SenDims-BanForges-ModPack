"""万象合金专用材料贴图的绘制入口（物品、方块、流体动画；流体桶用 Forge 动态模型，不画贴图）。

由 docs/tools/draw_omni_alloy_textures.py 与 docs/tools/implement_omni_alloy.py 调用；
也可用 build_all.py 单独输出到其他目录预览。每张贴图都在 i_*.py / blocks.py / fluids.py
中按 16×16 原生像素手绘或程序化绘制，不做缩放。
"""
from pathlib import Path
import json
import sys

_HERE = str(Path(__file__).resolve().parent)
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

# 万象合金改版前已经存在并在 tech_1 任务中使用的 9 个物品，保留原贴图，不在这里重绘。
PRESERVED = {
    "kubejs:astral_biomembrane", "kubejs:celestial_lattice_lens", "kubejs:iridescent_resonance_chamber",
    "kubejs:cryogenic_phase_housing", "kubejs:stargate_coupling_coil", "kubejs:hydrogen_logic_valve_bank",
    "kubejs:neutron_confinement_ring", "kubejs:omni_calibration_grating", "kubejs:omni_alloy_ingot",
}
# 流体动画每帧停留的游戏刻数：静止流体 16 帧 × 3 刻，流动流体 16 帧 × 2 刻。
FRAMETIME = {"fluid_still": 3, "fluid_flow": 2}


def _registry():
    from common import REG
    import i_bio, i_aether_mana, i_thermal_eng, i_pn_nu_pr, i_cards, blocks, fluids  # noqa: F401  注册全部绘制函数
    return REG


def assign_textures(catalog):
    """按固定命名把贴图路径写回目录。implement_omni_alloy.py 新建的目录只有占位贴图，需要在这里补齐。"""
    for group, folder in (("items", "item"), ("blocks", "block")):
        for ident, spec in catalog[group].items():
            ns, name = ident.split(":", 1)
            spec["texture"] = f"{ns}:{folder}/{name}"
    for ident, spec in catalog["fluids"].items():
        ns, name = ident.split(":", 1)
        spec["still_texture"] = f"{ns}:block/{name}_still"
        spec["flowing_texture"] = f"{ns}:block/{name}_flow"
        # 桶不单独绘制：模型用 forge:fluid_container，由桶底图与静止贴图合成。
        spec.pop("bucket_texture", None)


def bucket_model(ident):
    """与 PneumaticCraft 等模组相同的 Forge 动态桶模型。"""
    return {"parent": "forge:item/bucket", "loader": "forge:fluid_container", "fluid": ident}


def expected_textures(catalog):
    """目录中需要本工具绘制的贴图路径（不含命名空间），保留物品除外。"""
    names = set()
    for ident, spec in catalog["items"].items():
        if ident not in PRESERVED:
            names.add(spec["texture"].split(":", 1)[1])
    for spec in catalog["blocks"].values():
        names.add(spec["texture"].split(":", 1)[1])
    for spec in catalog["fluids"].values():
        for key in ("still_texture", "flowing_texture"):
            names.add(spec[key].split(":", 1)[1])
    return names


def draw_textures(catalog, textures_root):
    """把全部专用材料贴图写到 textures_root（对应 assets/kubejs/textures），返回写出的文件。"""
    assign_textures(catalog)
    reg = _registry()
    expected = expected_textures(catalog)
    missing, extra = sorted(expected - set(reg)), sorted(set(reg) - expected)
    if missing or extra:
        raise SystemExit(f"目录与绘制清单不一致：缺少 {missing}，多出 {extra}")
    textures_root = Path(textures_root)
    written = []
    for path, (_label, fn, kind) in sorted(reg.items()):
        obj = fn()
        image = obj if hasattr(obj, "save") else obj.img()
        dest = textures_root / f"{path}.png"
        dest.parent.mkdir(parents=True, exist_ok=True)
        image.save(dest)
        written.append(dest)
        if kind in FRAMETIME:
            meta = dest.with_name(dest.name + ".mcmeta")
            meta.write_text(json.dumps({"animation": {"frametime": FRAMETIME[kind], "interpolate": False}},
                                       indent=2) + "\n", encoding="utf-8")
            written.append(meta)
    return written


def draw_catalog(catalog, assets_root):
    """绘制并返回目录引用的全部贴图文件（含保留物品的原贴图与流体动画元数据）。"""
    assets_root = Path(assets_root)
    assert {ident.split(":", 1)[0] for group in catalog.values() for ident in group} == {"kubejs"}
    draw_textures(catalog, assets_root / "kubejs" / "textures")
    files = []

    def add(texture, animated=False):
        ns, rel = texture.split(":", 1)
        dest = assets_root / ns / "textures" / f"{rel}.png"
        files.append(dest)
        if animated:
            files.append(dest.with_name(dest.name + ".mcmeta"))

    for group in ("items", "blocks"):
        for spec in catalog[group].values():
            add(spec["texture"])
    for spec in catalog["fluids"].values():
        add(spec["still_texture"], True)
        add(spec["flowing_texture"], True)
    absent = [str(p) for p in files if not p.exists()]
    assert not absent, ("缺少贴图或动画元数据", absent)
    return sorted(set(files))


def preview(catalog, assets_root, output):
    """把原生贴图放大成总览图，仅供检查；不会改动游戏资源。"""
    from PIL import Image, ImageDraw, ImageFont

    font = None
    for candidate in ("C:/Windows/Fonts/msyh.ttc", "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"):
        try:
            font = ImageFont.truetype(candidate, 12)
            break
        except OSError:
            continue
    font = font or ImageFont.load_default()
    small = ImageFont.load_default()
    branch_order = ["bio", "aether", "mana", "thermal", "engineering", "pneumatic", "nuclear", "precision"]
    entries = []
    for branch in branch_order:
        for group in ("items", "blocks", "fluids"):
            for ident, spec in catalog[group].items():
                if spec["branch"] == branch:
                    entries.append((ident, spec, spec["still_texture"] if group == "fluids" else spec["texture"]))
    cols, cell_w, cell_h = 16, 96, 100
    rows = (len(entries) + cols - 1) // cols
    image = Image.new("RGB", (cols * cell_w, rows * cell_h + 40), "#1c222d")
    pen = ImageDraw.Draw(image)
    pen.text((12, 9), "万象合金专用材料 · 原生像素贴图总览 / 16×16（★ 为保留的原贴图）", font=font, fill="#e1e8f1")
    for i, (ident, spec, texture) in enumerate(entries):
        x, y = (i % cols) * cell_w, (i // cols) * cell_h + 36
        ns, rel = texture.split(":", 1)
        sprite = Image.open(Path(assets_root) / ns / "textures" / f"{rel}.png").convert("RGBA")
        sprite = sprite.crop((0, 0, sprite.width, sprite.width)).resize((48, 48), Image.Resampling.NEAREST)
        # 棋盘格底色便于看出透明区域与轮廓缺陷。
        for cy in range(0, 48, 6):
            for cx in range(0, 48, 6):
                pen.rectangle((x + 24 + cx, y + cy, x + 29 + cx, y + cy + 5),
                              fill="#313b4b" if (cx + cy) % 12 else "#293241")
        image.paste(sprite, (x + 24, y), sprite)
        name = ("★" if ident in PRESERVED else "") + spec["name"].replace("构件", "").replace("前驱块", "前驱")
        pen.text((x + 3, y + 52), name[:7], font=font, fill="#e1e8ed")
        if len(name) > 7:
            pen.text((x + 3, y + 67), name[7:14], font=font, fill="#e1e8ed")
        code = ident.split(":", 1)[1].removeprefix("omni_")
        pen.text((x + 3, y + 84), code[:17], font=small, fill="#8eacbd")
    Path(output).parent.mkdir(parents=True, exist_ok=True)
    image.save(output)
