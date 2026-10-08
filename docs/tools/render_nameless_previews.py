"""Render textured 3D previews of the five Nameless King OBJ models.

Run from the Minecraft instance root with:
    python docs/tools/render_nameless_previews.py

This is a small CPU rasterizer so previews can be regenerated without Blender.
World previews show the blade and sheath. A separate sheet checks the three
inventory render states at their actual GUI framing.
"""

from pathlib import Path
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "kubejs/assets/sdbf/model/nameless"
OUTPUT = Path(__file__).resolve().parent / "preview"
STAGES = ("faded", "lone", "thunder", "judgement", "king")
TITLES = ("Faded", "Lone", "Thunder", "Judgement", "King")
ACCENTS = ((135, 142, 151), (162, 153, 129), (177, 150, 89),
           (203, 164, 78), (231, 189, 73))


def load_obj(path):
    vertices, uvs = [], []
    groups = {}
    group = None
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("v "):
            vertices.append(tuple(map(float, line.split()[1:4])))
        elif line.startswith("vt "):
            uvs.append(tuple(map(float, line.split()[1:3])))
        elif line.startswith("g "):
            group = line[2:].strip()
            groups.setdefault(group, [])
        elif line.startswith("f ") and group:
            corners = []
            for token in line.split()[1:]:
                parts = token.split("/")
                if len(parts) < 2 or not parts[1]:
                    raise ValueError(f"Missing texture coordinate in {path}: {line}")
                corners.append((int(parts[0]) - 1, int(parts[1]) - 1))
            for i in range(1, len(corners) - 1):
                groups[group].append((corners[0], corners[i], corners[i + 1]))
    return np.asarray(vertices, dtype=np.float32), np.asarray(uvs, dtype=np.float32), groups


def rotated(vertices, yaw, pitch):
    yaw, pitch = math.radians(yaw), math.radians(pitch)
    cy, sy = math.cos(yaw), math.sin(yaw)
    cp, sp = math.cos(pitch), math.sin(pitch)
    x, y, z = vertices.T
    xx = x * cy + z * sy
    zz = -x * sy + z * cy
    yy = y * cp - zz * sp
    return np.column_stack((xx, yy, y * sp + zz * cp))


def render_group(vertices, uvs, faces, texture, size, yaw, pitch,
                 view=None, margin=24, cull_backfaces=True):
    width, height = size
    projected = rotated(vertices, yaw, pitch)
    used = np.fromiter((corner[0] for face in faces for corner in face),
                       dtype=np.int32)
    if view is None:
        sample = projected[used]
        xmin, ymin = sample[:, :2].min(axis=0)
        xmax, ymax = sample[:, :2].max(axis=0)
    else:
        xmin, xmax, ymin, ymax = view
    scale = min((width - 2 * margin) / max(xmax - xmin, 1),
                (height - 2 * margin) / max(ymax - ymin, 1))
    center_x, center_y = (xmin + xmax) / 2, (ymin + ymax) / 2
    screen = np.empty_like(projected)
    screen[:, 0] = (projected[:, 0] - center_x) * scale + width / 2
    screen[:, 1] = height / 2 - (projected[:, 1] - center_y) * scale
    screen[:, 2] = projected[:, 2]

    tex = np.asarray(texture.convert("RGBA"))
    th, tw = tex.shape[:2]
    pixels = np.zeros((height, width, 4), dtype=np.uint8)
    zbuffer = np.full((height, width), -np.inf, dtype=np.float32)
    light = np.array((0.25, 0.4, 0.88), dtype=np.float32)
    light /= np.linalg.norm(light)

    for face in faces:
        vi = [corner[0] for corner in face]
        ti = [corner[1] for corner in face]
        normal = np.cross(projected[vi[1]] - projected[vi[0]],
                          projected[vi[2]] - projected[vi[0]])
        # Camera looks down -Z. Match the game's backface culling so reversed
        # faces cannot silently look correct in generated previews.
        if cull_backfaces and normal[2] <= 1e-8:
            continue
        p = screen[vi]
        x0, x1, x2 = p[:, 0]
        y0, y1, y2 = p[:, 1]
        denominator = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(denominator) < 1e-6:
            continue
        left = max(0, math.floor(min(x0, x1, x2)))
        right = min(width - 1, math.ceil(max(x0, x1, x2)))
        top = max(0, math.floor(min(y0, y1, y2)))
        bottom = min(height - 1, math.ceil(max(y0, y1, y2)))
        if left > right or top > bottom:
            continue
        yy, xx = np.mgrid[top:bottom + 1, left:right + 1]
        w0 = ((y1 - y2) * (xx - x2) + (x2 - x1) * (yy - y2)) / denominator
        w1 = ((y2 - y0) * (xx - x2) + (x0 - x2) * (yy - y2)) / denominator
        w2 = 1 - w0 - w1
        inside = (w0 >= -1e-5) & (w1 >= -1e-5) & (w2 >= -1e-5)
        if not inside.any():
            continue
        depth = w0 * p[0, 2] + w1 * p[1, 2] + w2 * p[2, 2]
        current_z = zbuffer[top:bottom + 1, left:right + 1]
        inside &= depth > current_z + 1e-5
        if not inside.any():
            continue
        uv = uvs[ti]
        uu = np.clip(w0 * uv[0, 0] + w1 * uv[1, 0] + w2 * uv[2, 0], 0, 1)
        vv = np.clip(w0 * uv[0, 1] + w1 * uv[1, 1] + w2 * uv[2, 1], 0, 1)
        tx = np.minimum((uu * (tw - 1)).astype(np.int32), tw - 1)
        ty = np.minimum(((1 - vv) * (th - 1)).astype(np.int32), th - 1)
        sampled = tex[ty, tx]
        inside &= sampled[:, :, 3] > 16
        if not inside.any():
            continue

        length = np.linalg.norm(normal)
        brightness = 0.9 if length < 1e-8 else 0.60 + 0.40 * max(
            float(np.dot(normal / length, light)), 0)
        shaded = sampled.copy()
        shaded[:, :, :3] = np.clip(sampled[:, :, :3].astype(np.float32)
                                     * brightness, 0, 255).astype(np.uint8)
        pixels[top:bottom + 1, left:right + 1][inside] = shaded[inside]
        current_z[inside] = depth[inside]
    return Image.fromarray(pixels, "RGBA")


def font(size, bold=False):
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    path = Path("C:/Windows/Fonts") / name
    return ImageFont.truetype(str(path), size) if path.exists() else ImageFont.load_default()


def panel(canvas, box, label, accent):
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(box, radius=22, fill=(24, 29, 35),
                           outline=(70, 75, 80), width=2)
    x0, y0, x1, _ = box
    draw.line((x0 + 26, y0 + 28, x0 + 95, y0 + 28), fill=accent, width=3)
    draw.text((x0 + 110, y0 + 11), label, fill=(209, 211, 212),
              font=font(22))


def composite_model(canvas, rendered, xy, accent):
    shadow = Image.new("RGBA", rendered.size, accent + (0,))
    shadow.putalpha(rendered.getchannel("A").filter(ImageFilter.GaussianBlur(14))
                    .point(lambda value: round(value * 0.28)))
    canvas.alpha_composite(shadow, (xy[0] + 4, xy[1] + 8))
    canvas.alpha_composite(rendered, xy)


def make_preview(name, title, number, accent):
    model = ASSETS / f"nameless_{name}.obj"
    texture_path = ASSETS / f"nameless_{name}.png"
    vertices, uvs, groups = load_obj(model)
    texture = Image.open(texture_path)
    for required in ("blade", "sheath"):
        if not groups.get(required):
            raise ValueError(f"Missing {required} group in {model}")

    width, height = 1920, 1080
    gradient = np.empty((height, width, 4), dtype=np.uint8)
    rows = np.arange(height, dtype=np.float32)[:, None]
    gradient[:, :, 0] = 14 + rows * 0.006
    gradient[:, :, 1] = 18 + rows * 0.007
    gradient[:, :, 2] = 23 + rows * 0.008
    gradient[:, :, 3] = 255
    canvas = Image.fromarray(gradient, "RGBA")
    draw = ImageDraw.Draw(canvas)
    draw.text((60, 42), f"NAMELESS KING  /  {number:02d} OF 05",
              fill=accent, font=font(26, True))
    draw.text((60, 78), title.upper(), fill=(241, 238, 228),
              font=font(48, True))
    panel(canvas, (60, 160, 1860, 570), "UNSHEATHED BLADE  ·  textured 3D", accent)
    panel(canvas, (60, 610, 1190, 1020), "SHEATH", accent)
    panel(canvas, (1230, 610, 1860, 1020), "GUARD DETAIL  ·  angled view", accent)

    blade = render_group(vertices, uvs, groups["blade"], texture,
                         (1750, 340), yaw=9, pitch=13)
    sheath = render_group(vertices, uvs, groups["sheath"], texture,
                          (1080, 330), yaw=8, pitch=11)
    guard = render_group(vertices, uvs, groups["blade"], texture,
                         (580, 330), yaw=28, pitch=23,
                         view=(-58, 25, -33, 24), margin=8)
    composite_model(canvas, blade, (85, 205), accent)
    composite_model(canvas, sheath, (85, 675), accent)
    composite_model(canvas, guard, (1255, 675), accent)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    target = OUTPUT / f"nameless_{name}_3d.png"
    canvas.convert("RGB").save(target, optimize=True)
    print(f"{target.relative_to(ROOT)}: blade {len(groups['blade'])} triangles, "
          f"sheath {len(groups['sheath'])} triangles")
    return canvas


def make_inventory_sheet():
    sheet = Image.new("RGBA", (1000, 1500), (20, 25, 32, 255))
    draw = ImageDraw.Draw(sheet)
    for column, label in enumerate(("ITEM / JEI", "NO SHEATH", "BROKEN")):
        draw.text((240 + column * 250, 20), label, font=font(20), fill="white")
    for row, stage in enumerate(STAGES):
        vertices, uvs, groups = load_obj(ASSETS / f"nameless_{stage}.obj")
        texture = Image.open(ASSETS / f"nameless_{stage}.png")
        draw.text((20, row * 280 + 160), stage.upper(), font=font(20), fill="white")
        for column, group in enumerate(("item_blade", "item_bladens", "item_damaged")):
            xy = (210 + column * 250, 60 + row * 280)
            draw.rectangle((*xy, xy[0] + 230, xy[1] + 230), fill=(38, 43, 48, 255))
            rendered = render_group(vertices, uvs, groups[group], texture,
                                    (230, 230), 0, 0,
                                    view=(-62.5, 62.5, -62.5, 62.5), margin=0)
            sheet.alpha_composite(rendered, xy)
    target = OUTPUT / "nameless_inventory_contact_sheet.png"
    sheet.convert("RGB").save(target, optimize=True)
    print(f"{target.relative_to(ROOT)}")


def main():
    previews = [make_preview(name, title, index, accent)
                for index, (name, title, accent) in
                enumerate(zip(STAGES, TITLES, ACCENTS), 1)]
    sheet = Image.new("RGB", (1900, 1650), (14, 18, 23))
    for index, preview in enumerate(previews):
        thumb = preview.convert("RGB").resize((900, 506), Image.Resampling.LANCZOS)
        x = 35 + (index % 2) * 930
        y = 35 + (index // 2) * 540
        sheet.paste(thumb, (x, y))
    target = OUTPUT / "nameless_3d_contact_sheet.png"
    sheet.save(target, optimize=True)
    print(f"{target.relative_to(ROOT)}")
    make_inventory_sheet()


if __name__ == "__main__":
    main()
