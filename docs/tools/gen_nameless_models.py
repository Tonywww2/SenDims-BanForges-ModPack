"""Build progressively ornamented Nameless King OBJ models from Last Smith's odachi.

Run from the Minecraft instance root with: python docs/tools/gen_nameless_models.py
Decorate the world meshes, then build the inventory meshes from those same parts.
"""

from pathlib import Path
from zipfile import ZipFile
import math


ROOT = Path(__file__).resolve().parents[2]
SOURCE_JAR = ROOT / "mods/last_smith-1.1.10-1.20.1.jar"
SOURCE_OBJ = "assets/last_smith/model/named/odachi/model.obj"
OUTPUT = ROOT / "kubejs/assets/sdbf/model/nameless"
STAGES = ("faded", "lone", "thunder", "judgement", "king")

# UVs sample broad, opaque patches shared by all five recolored odachi atlases.
# OBJ uses bottom-left as the UV origin.
COLORS = {
    "gold": (0.77, 0.64),
    "pale": (0.48, 0.56),
    "dark": (0.50, 0.32),
    "edge": (0.86, 0.22),
}


def cross2(a, b, c):
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])


def triangulate_outline(outline):
    """Ear-clip a CCW polygon, including concave lightning/crown silhouettes."""
    remaining = list(range(len(outline)))
    triangles = []
    while len(remaining) > 3:
        for slot, b in enumerate(remaining):
            a, c = remaining[slot - 1], remaining[(slot + 1) % len(remaining)]
            if cross2(outline[a], outline[b], outline[c]) <= 1e-9:
                continue
            if any(all(cross2(outline[u], outline[v], outline[p]) >= -1e-9
                       for u, v in ((a, b), (b, c), (c, a)))
                   for p in remaining if p not in (a, b, c)):
                continue
            triangles.append((a, b, c))
            del remaining[slot]
            break
        else:
            raise ValueError(f"Cannot triangulate ornament outline: {outline}")
    if cross2(*(outline[i] for i in remaining)) <= 1e-9:
        raise ValueError(f"Degenerate ornament triangle: {outline}")
    triangles.append(tuple(remaining))
    return triangles


class Ornament:
    def __init__(self, vertex_count, uv_count):
        self.vertices = []
        self.uvs = list(COLORS.values())
        self.uv_ids = {
            name: uv_count + index + 1 for index, name in enumerate(COLORS)
        }
        self.faces = {"blade": [], "blade_damaged": [], "sheath": []}
        self.vertex_count = vertex_count

    def vertex(self, xyz):
        self.vertices.append(xyz)
        return self.vertex_count + len(self.vertices)

    def face(self, indices, color, groups):
        uv = self.uv_ids[color]
        # SlashBlade's Wavefront loader requires one face type per group.
        # The source blade groups use triangles, so split ornament quads too.
        for n in range(1, len(indices) - 1):
            triangle = (indices[0], indices[n], indices[n + 1])
            line = "f " + " ".join(f"{index}/{uv}" for index in triangle) + "\n"
            for group in groups:
                self.faces[group].append(line)

    def prism(self, outline, z_min, z_max, color, groups=("blade",)):
        """Extrude a silhouette with all closed-surface normals facing out."""
        area2 = sum(a[0] * b[1] - b[0] * a[1]
                    for a, b in zip(outline, outline[1:] + outline[:1]))
        if abs(area2) < 1e-9 or z_max <= z_min:
            raise ValueError("Ornament must have a nonzero area and thickness")
        if area2 < 0:
            outline = tuple(reversed(outline))
        caps = triangulate_outline(outline)
        lower = [self.vertex((x, y, z_min)) for x, y in outline]
        upper = [self.vertex((x, y, z_max)) for x, y in outline]
        for a, b, c in caps:
            self.face((upper[a], upper[b], upper[c]), color, groups)
            self.face((lower[a], lower[c], lower[b]), color, groups)
        for n in range(len(outline)):
            nxt = (n + 1) % len(outline)
            self.face((lower[n], lower[nxt], upper[nxt], upper[n]), color, groups)

    def collar(self, x, y, radius, width, color, groups):
        """A hollow, faceted metal band around the diagonal grip."""
        axis = (0.944, -0.330)
        normal = (0.330, 0.944)
        rings = []
        for advance, r in ((-width / 2, radius), (width / 2, radius),
                           (-width / 2, radius - 0.7),
                           (width / 2, radius - 0.7)):
            ring = []
            for step in range(12):
                theta = 2 * math.pi * step / 12
                ring.append(self.vertex((
                    x + axis[0] * advance + normal[0] * r * math.cos(theta),
                    y + axis[1] * advance + normal[1] * r * math.cos(theta),
                    r * math.sin(theta),
                )))
            rings.append(ring)
        for step in range(12):
            nxt = (step + 1) % 12
            # Outer wall faces away from the grip, inner wall toward it;
            # the two annular ends face opposite directions along the axis.
            for a, b, c, d in ((1, 0, 0, 1), (2, 3, 3, 2),
                               (0, 2, 2, 0), (3, 1, 1, 3)):
                self.face((rings[a][step], rings[b][step],
                           rings[c][nxt], rings[d][nxt]), color, groups)

    def diamond(self, x, y, length, height, z, color, groups=("blade",)):
        outline = ((x - length, y), (x, y + height),
                   (x + length, y), (x, y - height))
        self.prism(outline, -z, z, color, groups)

    def paired_relief(self, x, y, length, height, base_z, outer_z,
                      color, groups=("blade",)):
        """Place shallow matching reliefs on the two faces of the guard."""
        outline = ((x - length, y), (x, y + height),
                   (x + length, y), (x, y - height))
        self.prism(outline, base_z, outer_z, color, groups)
        self.prism(outline, -outer_z, -base_z, color, groups)


def blade_center(x):
    # Follows the source odachi's gently curved cutting edge.
    points = ((-285, -21.0), (-260, -13.5), (-235, -8.0),
              (-207, -2.5), (-175, 2.0), (-140, 5.5),
              (-104, 6.7), (-66, 4.5), (-43, 1.5))
    for (xa, ya), (xb, yb) in zip(points, points[1:]):
        if xa <= x <= xb:
            return ya + (yb - ya) * (x - xa) / (xb - xa)
    return points[-1][1]


def decorate(level, vertex_count, uv_count):
    m = Ornament(vertex_count, uv_count)
    hilt = ("blade", "blade_damaged")

    # The core of the weapon: a raised fuller, layered guard and grip fittings.
    upper = [(-260, blade_center(-260) + 1.7),
             (-210, blade_center(-210) + 2.0),
             (-155, blade_center(-155) + 2.2),
             (-95, blade_center(-95) + 2.2),
             (-49, blade_center(-49) + 2.3)]
    lower = [(x, y - 1.1) for x, y in reversed(upper)]
    m.prism(upper + lower, -1.05, 1.05, "edge")
    m.paired_relief(-34, 0, 5.5, 9, 15.1, 16.5, "gold", hilt)
    for x, y in ((-22, -4), (4, -13), (28, -21), (42, -26)):
        m.collar(x, y, 5.3 if x < 40 else 6.2, 2.4, "gold", hilt)

    # The resting/carry render shows the sheath, covering most of the blade.
    sheath = ("sheath",)
    for x in (-275, -175, -110):
        y = blade_center(x)
        m.prism(((x - 1.2, y - 7.5), (x + 1.2, y - 7.5),
                 (x + 1.2, y + 7.5), (x - 1.2, y + 7.5)),
                -5.4, 5.4, "gold", sheath)
    for n in range(level):
        x = -133 - n * 22
        m.paired_relief(x, blade_center(x), 5.8, 3.5, 4.7, 5.6,
                        "pale" if level >= 4 else "gold", sheath)
    if level >= 3:
        for sign in (-1, 1):
            outline = ((-254, -11), (-232, -7), (-240, -9),
                       (-207, -1), (-222, -2), (-249, -8))
            z0, z1 = (5.1, 6.0) if sign > 0 else (-6.0, -5.1)
            m.prism(outline, z0, z1, "gold", sheath)

    if level >= 2:
        # Crown shaped quillons make the original broad tsuba legible in profile.
        for sign in (-1, 1):
            m.prism(((-37, sign * 5), (-30, sign * 13),
                     (-34, sign * 25), (-40, sign * 17)),
                    -3.0, 3.0, "gold", hilt)
            m.prism(((-35, sign * 9), (-32, sign * 17),
                     (-37, sign * 13)), -3.7, 3.7, "dark", hilt)
        for x in (-77, -122, -172, -221):
            m.diamond(x, blade_center(x) + 0.9, 3.5, 1.6, 1.45, "gold")
        for x in (-12, -4, 12, 20, 36):
            m.collar(x, -4 - 0.33 * (x + 22), 4.65, 0.8, "pale", hilt)

    if level >= 3:
        # Forked lightning teeth run along the blade's upper edge.
        for x in (-57, -82, -111, -144, -179, -216):
            y = blade_center(x) + 3.2
            reach = 5.4 if x > -150 else 4.0
            m.prism(((x - 7, y - 1.5), (x, y + reach),
                     (x + 2, y + 1.0), (x + 9, y - 1.3)),
                    -1.55, 1.55, "gold")
        m.prism(((-37, -7), (-47, -2), (-43, 1), (-35, 2)),
                -6.2, 6.2, "gold", hilt)

    if level >= 4:
        for sign in (-1, 1):
            m.prism(((-35, sign * 12), (-27, sign * 22),
                     (-31, sign * 31), (-39, sign * 21)),
                    -2.1, 2.1, "gold", hilt)
        for x in (-96, -144, -196, -241):
            m.diamond(x, blade_center(x) - 1.3, 5.1, 1.25, 1.8, "pale")
        m.paired_relief(-31, 0, 3.0, 4.7, 16.4, 18.0, "pale", hilt)

    if level >= 5:
        # Final crown: longer finial, double-edged central medallion, and rays.
        m.prism(((43, -27), (49, -30), (56, -33), (60, -32),
                 (55, -38), (47, -34)), -4.4, 4.4, "gold", hilt)
        m.diamond(49, -31, 4.0, 3.2, 6.0, "pale", hilt)
        for sign in (-1, 1):
            m.prism(((-40, sign * 5), (-44, sign * 14),
                     (-48, sign * 18), (-43, sign * 11)),
                    -5.4, 5.4, "gold", hilt)
        for x in (-68, -102, -139, -181, -225):
            m.diamond(x, blade_center(x) + 0.6, 1.8, 1.0, 2.2, "gold")

    return m


def inventory_meshes(lines):
    """Use the decorated world parts in SlashBlade's dedicated item groups."""
    vertices, groups = [], {}
    active = None
    for line in lines:
        if line.startswith("v "):
            vertices.append(tuple(map(float, line.split()[1:4])))
        elif line.startswith("g "):
            active = line[2:].strip()
            groups.setdefault(active, [])
        elif line.startswith("f "):
            groups[active].append(line)

    # GUI rendering scales raw model coordinates by 0.008, with no rotation.
    # Turn the sword tip toward the top right and fit it inside one item slot.
    roll, turn = math.radians(15), math.radians(-135)
    cr, sr, ct, st = math.cos(roll), math.sin(roll), math.cos(turn), math.sin(turn)
    projected = []
    for x, y, z in vertices:
        yy, zz = y * cr - z * sr, y * sr + z * cr
        projected.append((x * ct - yy * st, x * st + yy * ct, zz))
    intact = groups["blade"] + groups["sheath"]
    used = {int(token.split("/")[0]) - 1
            for line in intact for token in line.split()[1:]}
    bounds = [(min(projected[i][a] for i in used),
               max(projected[i][a] for i in used)) for a in (0, 1)]
    center = [(lo + hi) / 2 for lo, hi in bounds]
    scale = 118 / max(hi - lo for lo, hi in bounds)
    replacements, added = {}, []
    for target, parts in (("item_blade", ("blade", "sheath")),
                          ("item_bladens", ("blade",)),
                          ("item_damaged", ("blade_damaged",))):
        remap, faces = {}, []
        for part in parts:
            for line in groups[part]:
                corners = []
                for token in line.split()[1:]:
                    index, *suffix = token.split("/")
                    index = int(index)
                    if index not in remap:
                        x, y, z = projected[index - 1]
                        added.append(((x - center[0]) * scale,
                                      (y - center[1]) * scale, z * scale + 12))
                        remap[index] = len(vertices) + len(added)
                    # Original normals belong to the world orientation; let
                    # WavefrontObject compute normals for the rotated mesh.
                    corners.append(f"{remap[index]}/{suffix[0]}")
                faces.append("f " + " ".join(corners) + "\n")
        replacements[target] = faces

    first_group = next(i for i, line in enumerate(lines) if line.startswith("g "))
    output = lines[:first_group] + [f"v {x:.6f} {y:.6f} {z:.6f}\n"
                                   for x, y, z in added]
    active = None
    for line in lines[first_group:]:
        if line.startswith("g "):
            active = line[2:].strip()
            output.append(line)
            output.extend(replacements.get(active, ()))
        elif active not in replacements:
            output.append(line)
    return output


def build():
    with ZipFile(SOURCE_JAR) as jar:
        source = jar.read(SOURCE_OBJ).decode("utf-8")
    lines = source.splitlines(keepends=True)
    vertex_count = sum(line.startswith("v ") for line in lines)
    uv_count = sum(line.startswith("vt ") for line in lines)
    first_group = next(i for i, line in enumerate(lines) if line.startswith("g "))
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for level, name in enumerate(STAGES, 1):
        ornament = decorate(level, vertex_count, uv_count)
        header = [f"# Nameless King stage {level}; generated from Last Smith odachi\n"]
        header += [f"v {x:.6f} {y:.6f} {z:.6f}\n"
                   for x, y, z in ornament.vertices]
        header += [f"vt {u:.5f} {v:.5f}\n" for u, v in ornament.uvs]
        output = lines[:first_group] + header
        active = None
        for line in lines[first_group:]:
            if line.startswith("g "):
                if active in ornament.faces:
                    output.extend(ornament.faces[active])
                active = line[2:].strip()
            output.append(line)
        if active in ornament.faces:
            output.extend(ornament.faces[active])
        output = inventory_meshes(output)
        target = OUTPUT / f"nameless_{name}.obj"
        target.write_text("".join(output), encoding="utf-8", newline="\n")
        print(f"{target.relative_to(ROOT)}: {len(ornament.vertices)} new vertices")


if __name__ == "__main__":
    build()
