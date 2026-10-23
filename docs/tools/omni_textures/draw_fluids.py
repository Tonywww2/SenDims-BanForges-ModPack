"""Recipe-aware liquids, drawn by integer pixel paths on native canvases.

The medium follows the actual inputs: redstone suspensions are red, pyrolysis
products are tar and amber oil, and cryogenic carriers have pale cold ripples.
No machine icons or process stamps are drawn into liquid surfaces or buckets.
"""
from dataclasses import dataclass
from pathlib import Path
import json
from PIL import Image, ImageDraw
from pixel import Sprite


@dataclass(frozen=True)
class Fluid:
    dark: str
    mid: str
    light: str
    shine: str
    inclusion: str
    medium: str
    meaning: str


# Each choice is explicit, based on implement_omni_alloy.py and the route's
# component purpose. These are art descriptions, not new chemistry mechanics.
FLUIDS = {
    "omni_bio_feed": Fluid("30274c", "65517b", "998fae", "d2f2de", "b5bc91", "culture", "紫色星浆中悬浮米白膜纤维与青绿培养基"),
    "omni_bio_10_fluid": Fluid("72543a", "b88d4d", "d9b676", "f5e6b9", "806e48", "ferment", "谷物糖质发酵液，金黄沉淀和浅色泡沫"),
    "omni_bio_11_fluid": Fluid("477f83", "8dc1bb", "bde0ce", "eef5dd", "699d94", "clear", "去除固体杂质后的清亮蒸馏液"),
    "omni_thermal_14_fluid": Fluid("853e38", "d17a4d", "f0b76e", "fff1b9", "a7d8db", "metal", "铜与冰晶合金复合熔体，热亮流纹及少量青白金属光泽"),
    "omni_thermal_17_fluid": Fluid("25232b", "443331", "735442", "a77b52", "c69853", "tar", "沥青海带分离物热解后的黏稠焦油"),
    "omni_thermal_18_fluid": Fluid("795021", "b4843d", "dbb65e", "f4dda2", "94652b", "oil", "热解焦油精馏后的透亮琥珀组分"),
    "omni_thermal_20_brew": Fluid("487c90", "85bbc6", "b9e0db", "edf3df", "dfba6c", "brew", "烈焰粉与恶魂泪形成的相变抑制酿液，冷色液面夹金色活性滴"),
    "omni_engineering_03_fluid": Fluid("173f4c", "286e7b", "59a4ac", "b5e9de", "9a84c2", "slurry", "星浆导电基材压榨液，深青导电颗粒与紫色星浆残留"),
    "omni_engineering_20_fluid": Fluid("397396", "73aec8", "a6d6e1", "e6f6f2", "588aa8", "cryo", "蓝冰制得的低温载液，淡蓝冰冷折光"),
    "omni_engineering_19_fluid": Fluid("765027", "b78946", "d8b76d", "f1e0ac", "956533", "oil", "太空原油精炼后的金棕燃料"),
    "omni_engineering_26_fluid": Fluid("1c3430", "34534a", "5e8070", "a8c4a2", "847292", "heavy", "纯Naquadah形成的暗绿高密度悬浊重液"),
    "omni_pneumatic_05_fluid": Fluid("82703a", "c2b472", "dfd39e", "f8efca", "a08b4a", "oil", "原油气动精炼后的浅金色原料"),
    "omni_pneumatic_06_fluid": Fluid("65794c", "a1b17b", "cbd2a2", "eef0cc", "d4b96e", "gel", "加入史莱姆后热处理的黏稠聚合物"),
    "omni_pneumatic_07_fluid": Fluid("789a93", "b7cbc0", "d9e6d6", "f4f7e6", "a3b9aa", "emulsion", "聚合物与水混合后的乳白密封材料乳液"),
    "omni_nuclear_05_fluid": Fluid("72504a", "b78265", "d7b990", "f2e6be", "9cc9d1", "metal", "含硼冰晶合金的热亮金属熔体"),
    "omni_nuclear_07_fluid": Fluid("537879", "93b3ad", "c1d5c5", "e8edda", "92a58b", "slurry", "硼和石英提取的灰青矿质悬液"),
    "omni_nuclear_08_fluid": Fluid("577f8c", "94bac2", "c5dee0", "edf4ea", "78a1ae", "clear", "电解后较清澈的硼质载液"),
    "omni_nuclear_10_fluid": Fluid("6a8995", "a6c1c8", "cedfe2", "f0f5ed", "98aeb7", "brine", "盐酸与氢氧化钠反应后的无色盐质载液"),
    "omni_nuclear_12_fluid": Fluid("6c292f", "af4b49", "d77f72", "f0ba9c", "dfb1a0", "slurry", "红石石英原料富集液，朱红矿粒悬浮"),
    "omni_nuclear_13_fluid": Fluid("682e3b", "a65764", "cc9294", "eec8bc", "8b4554", "clear", "离心后均匀的深红矿质液"),
    "omni_nuclear_14_fluid": Fluid("7e5960", "b7898c", "d4b5ae", "f1dfc7", "e3d4bc", "leach", "补入石英后形成的浅红浸出浆液"),
    "omni_nuclear_19_fluid": Fluid("383f69", "666eaa", "a3a8d5", "e1eaf1", "71d3d2", "quantum", "稳定熔体亚原子液化后的蓝紫珠光介质"),
    "omni_nuclear_21_fluid": Fluid("276477", "439ca8", "91d3d0", "dff6e7", "aaa4d2", "activated", "中子辐照后的青色激发介质"),
    "omni_nuclear_17_fluid": Fluid("758e88", "b0c3b8", "d8e1cb", "f2f3dc", "91ab9f", "brine", "硼砂溶液洗涤后的淡色吸收液"),
    "omni_nuclear_18_fluid": Fluid("587c96", "9ebed1", "ccdfeb", "f1f7f4", "92aabf", "cryo", "超冷吸收介质，蓝白冷凝纹"),
    "omni_nuclear_24_fluid": Fluid("704b68", "b07f9e", "dbb7cd", "f8ece9", "a7d8de", "plasma", "氘与氦三聚变后的珠光粉紫反应介质"),
    "omni_nuclear_26_fluid": Fluid("577b82", "95b8b5", "c5d9cb", "edf3dc", "91b0a2", "steam", "高压蒸汽换热后的暖色冷凝载液"),
    "omni_nuclear_27_fluid": Fluid("6b8282", "aabdb5", "d3dfca", "f3f4dd", "9fae99", "boiling", "吸热沸腾的淡色工质，连续气泡"),
    "omni_nuclear_28_fluid": Fluid("5d7d8c", "9ab8c3", "c7dce1", "edf4ed", "9babb1", "steam", "大型涡轮膨胀后的蓝灰湿蒸汽介质"),
    "omni_nuclear_29_fluid": Fluid("768c96", "b1c5cb", "d5e5e4", "f6f8ef", "9caeb7", "condensate", "二级涡轮末端的低能冷凝介质"),
    "omni_nuclear_20_melt": Fluid("75604f", "ba9c71", "dfcca2", "f7efce", "adc6c4", "metal", "衰变后稳定同位素载体的金属熔体"),
    "omni_fusion_feed": Fluid("466c94", "7d9cc6", "b6c8e5", "edf0fa", "bba1dd", "quantum", "氘载液混入紫水晶形成的淡蓝紫进料"),
}


def rgba(value):
    return tuple(bytes.fromhex(value)) + (255,)


def draw_tile(pen, spec, x, y, phase, flowing):
    """Hand-plotted fluid structures wrap around a 16px repeating domain."""
    dark, mid, light, shine, inclusion = [rgba(getattr(spec, key))
                                        for key in ("dark", "mid", "light", "shine", "inclusion")]
    pen.rectangle((x, y, x + 15, y + 15), fill=mid)
    dx, dy = (0, phase * 4) if flowing else [(0, 0), (1, 0), (1, 1), (0, 1)][phase]

    def line(points, color, width=1):
        for a, b in zip(points, points[1:]):
            ax, ay = a; bx, by = b
            length = max(abs(bx - ax), abs(by - ay))
            for t in range(length + 1):
                px = ax + round((bx - ax) * t / max(length, 1))
                py = ay + round((by - ay) * t / max(length, 1))
                for extra in range(width):
                    sx, sy = (py, px) if flowing else (px, py)
                    pen.point((x + (sx + dx) % 16, y + (sy + dy + extra) % 16), fill=color)

    def spot(px, py, color):
        line([(px, py), (px, py)], color)

    def bubble(px, py, bright=light):
        line([(px, py + 1), (px + 1, py), (px + 2, py), (px + 3, py + 1)], bright)
        line([(px + 1, py + 3), (px + 2, py + 3), (px + 3, py + 2)], dark)

    # Broad bands establish material mass; distinct families add meaningful
    # contents instead of the previous floating machine glyphs.
    if spec.medium in {"metal", "plasma", "quantum", "activated"}:
        line([(-2, 4), (2, 4), (4, 2), (8, 2), (11, 4), (17, 4)], dark, 2)
        line([(-1, 11), (3, 11), (6, 8), (10, 8), (13, 10), (17, 10)], light, 2)
        line([(1, 10), (3, 10), (6, 7), (9, 7)], shine)
        line([(10, 2), (12, 3), (14, 3)], inclusion)
        line([(6, 14), (10, 14), (12, 13)], dark)
        if spec.medium in {"quantum", "activated", "plasma"}:
            spot(3, 6, shine); spot(12, 13, shine); spot(8, 4, inclusion)
            line([(13, 6), (14, 5), (14, 3)], light)
    elif spec.medium in {"tar", "oil", "heavy", "gel", "emulsion"}:
        line([(-1, 3), (3, 3), (5, 5), (10, 5), (12, 3), (17, 3)], dark, 2)
        line([(1, 10), (4, 8), (8, 8), (10, 10), (14, 10), (17, 8)], light, 2)
        line([(1, 9), (4, 7), (6, 7)], shine)
        line([(3, 14), (7, 14), (9, 13)], inclusion)
        if spec.medium == "tar":
            line([(8, 1), (11, 1), (12, 2)], light)
            spot(12, 12, dark); spot(13, 13, dark)
        elif spec.medium == "heavy":
            for px, py in [(2, 5), (6, 12), (10, 2), (14, 7)]:
                spot(px, py, inclusion); spot(px + 1, py, dark)
        elif spec.medium in {"gel", "emulsion"}:
            bubble(8, 10, inclusion)
            line([(1, 1), (3, 0), (5, 1)], light)
    elif spec.medium in {"culture", "ferment", "slurry", "leach"}:
        line([(-1, 4), (3, 4), (5, 6), (10, 6), (12, 4), (17, 4)], dark)
        line([(0, 11), (3, 9), (6, 9), (9, 12), (13, 12), (17, 10)], light)
        for px, py in [(2, 2), (7, 8), (12, 3), (4, 13)]:
            if spec.medium == "culture":
                line([(px, py), (px + 1, py - 1), (px + 3, py)], inclusion)
                spot(px + 1, py, dark)
            elif spec.medium == "ferment":
                bubble(px, py, shine)
            else:
                line([(px, py), (px + 1, py)], inclusion)
                spot(px, py - 1, shine)
        if spec.medium == "culture":
            spot(10, 10, shine); spot(14, 8, light)
    else:
        line([(-1, 3), (2, 3), (4, 4), (8, 4)], dark)
        line([(8, 2), (11, 2), (13, 1), (17, 1)], light)
        line([(1, 10), (5, 10), (7, 8), (11, 8)], light)
        line([(3, 9), (5, 9)], shine)
        line([(10, 14), (14, 14), (17, 12)], dark)
        if spec.medium == "cryo":
            line([(2, 14), (4, 12), (6, 12)], shine)
            line([(11, 6), (13, 4), (13, 2)], shine)
            spot(8, 13, inclusion)
        elif spec.medium in {"steam", "condensate"}:
            line([(2, 6), (4, 5), (7, 5)], shine)
            line([(9, 11), (11, 10), (14, 10)], light, 2)
        elif spec.medium == "boiling":
            bubble(2, 5, shine); bubble(10, 10, shine); spot(8, 2, shine)
        elif spec.medium == "brew":
            bubble(10, 10, inclusion); spot(4, 4, inclusion); spot(2, 13, shine)
        elif spec.medium == "brine":
            line([(11, 6), (12, 6)], inclusion); spot(7, 13, shine)


def bucket(branch, spec):
    """A recognisable steel bucket; its open mouth shows the actual contents."""
    s = Sprite(branch)
    # Folded steel sides, warm upper-left lighting and a dark lower/right edge.
    s.poly([(1, 4), (14, 4), (14, 8), (12, 13), (10, 14), (5, 14), (3, 12), (1, 7)], "30383c")
    s.poly([(2, 6), (13, 6), (12, 10), (10, 13), (5, 13), (4, 11)], "859399")
    s.poly([(2, 6), (4, 7), (5, 11), (6, 12), (5, 12), (3, 9)], "c4ccca")
    s.poly([(10, 7), (13, 6), (12, 10), (10, 13), (8, 13)], "586b75")
    s.line([(5, 13), (9, 13)], "b0bfc1")
    s.line([(6, 10), (7, 12)], "a3b4b7")
    # Wide ellipse with rim, so colour represents liquid rather than a label.
    s.poly([(3, 2), (11, 2), (14, 4), (14, 6), (11, 8), (4, 8), (1, 6), (1, 4)], "30383c")
    s.poly([(3, 3), (11, 3), (13, 4), (13, 6), (10, 7), (4, 7), (2, 6), (2, 4)], "c8d2cf")
    s.poly([(4, 3), (10, 3), (12, 4), (12, 6), (10, 6), (5, 7), (3, 6), (3, 4)], spec.dark)
    s.poly([(4, 4), (10, 4), (11, 5), (10, 6), (5, 6), (4, 5)], spec.mid)
    s.line([(4, 4), (7, 4)], spec.light).dot((4, 4), spec.shine)
    s.line([(6, 7), (10, 7), (12, 6)], "788e96")
    if spec.medium in {"culture", "slurry", "leach", "heavy"}:
        s.dot((6, 5), spec.inclusion).dot((9, 5), spec.inclusion).dot((8, 6), spec.dark)
    elif spec.medium in {"ferment", "boiling"}:
        s.dot((8, 4), spec.shine).dot((5, 5), spec.shine).dot((10, 5), spec.light)
    elif spec.medium in {"metal", "plasma"}:
        s.line([(6, 5), (8, 5), (9, 4)], spec.shine).dot((10, 6), spec.inclusion)
        s.dot((11, 8), spec.light)
    elif spec.medium in {"quantum", "activated"}:
        s.dot((7, 5), spec.shine).line([(9, 6), (10, 5)], spec.inclusion)
    elif spec.medium == "cryo":
        s.line([(8, 5), (10, 4)], spec.shine).dot((3, 7), "e4f1ec").dot((11, 8), "cadfe3")
    elif spec.medium in {"gel", "emulsion"}:
        s.line([(5, 5), (7, 5), (8, 6)], spec.light).dot((10, 5), spec.inclusion)
    elif spec.medium in {"steam", "condensate"}:
        s.line([(8, 4), (10, 4)], spec.shine).dot((6, 6), spec.light)
    elif spec.medium == "tar":
        s.line([(8, 5), (10, 5)], spec.light).dot((4, 6), spec.dark)
    elif spec.medium == "oil":
        s.line([(8, 5), (10, 5)], spec.shine)
    else:
        s.line([(7, 6), (9, 5)], spec.light).dot((10, 4), spec.inclusion)
    return s


def draw(catalog, assets_root):
    assert set(FLUIDS) == {i.split(":", 1)[1] for i in catalog["fluids"]}
    result = {}
    for ident, entry in catalog["fluids"].items():
        ns, name = ident.split(":", 1)
        spec = FLUIDS[name]
        textures = {}
        for kind, width in [("still", 16), ("flow", 32)]:
            image = Image.new("RGBA", (width, width * 4))
            pen = ImageDraw.Draw(image)
            for frame in range(4):
                for y in range(0, width, 16):
                    for x in range(0, width, 16):
                        draw_tile(pen, spec, x, frame * width + y, frame, kind == "flow")
            path = Path(assets_root) / ns / "textures" / "block" / (name + "_" + kind + ".png")
            path.parent.mkdir(parents=True, exist_ok=True)
            image.save(path)
            path.with_name(path.name + ".mcmeta").write_text(
                json.dumps({"animation": {"frametime": 8, "interpolate": False}}, indent=2) + "\n", encoding="utf-8")
            textures[kind] = f"{ns}:block/{name}_{kind}"
        textures["bucket"] = bucket(entry["branch"], spec).save(assets_root, ident + "_bucket")
        result[ident] = textures
    return result
