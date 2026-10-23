"""Native-resolution pixel drawing primitives; no source images or resampling.

Every production texture is drawn directly on a 16 x 16 RGBA canvas. Larger
nearest-neighbour images are used only for review sheets, never as game assets.
"""
from pathlib import Path
from PIL import Image, ImageDraw

PALETTES = {
    "bio": {"o":"26352e", "d":"405641", "s":"648251", "m":"91b86a", "l":"c6d99a", "h":"f0f4cf", "a":"e6b65a", "b":"a56c46"},
    "aether": {"o":"26354d", "d":"375775", "s":"568bac", "m":"8ccfe0", "l":"bfeaf0", "h":"f4fcff", "a":"bd9ce0", "b":"64709e"},
    "mana": {"o":"352840", "d":"583b68", "s":"85569a", "m":"bc83ca", "l":"e5b6e3", "h":"fff0f6", "a":"8bd8b5", "b":"bd9b59"},
    "thermal": {"o":"25343f", "d":"3e5966", "s":"608792", "m":"8fbcc3", "l":"c3e1df", "h":"f1faf3", "a":"e8a45e", "b":"ae644b"},
    "engineering": {"o":"332f35", "d":"5b4a42", "s":"926b43", "m":"c79553", "l":"ebc985", "h":"fff2c7", "a":"82c5c4", "b":"617783"},
    "pneumatic": {"o":"25334a", "d":"3c5270", "s":"607ea1", "m":"91b6d4", "l":"c5deeb", "h":"f0faff", "a":"70d2d0", "b":"cf9864"},
    "nuclear": {"o":"30352f", "d":"4d5942", "s":"7a8d54", "m":"abc16e", "l":"d5e5a1", "h":"f4f7d7", "a":"68c5c2", "b":"c89a61"},
    "precision": {"o":"302d43", "d":"504563", "s":"7d6a99", "m":"b59ec9", "l":"d8c9e4", "h":"fff2ff", "a":"86d4d8", "b":"d7b87b"},
}
METAL = {"iron":"a8b5bd", "iron_dark":"647681", "copper":"c88b55", "gold":"e9c26b", "glass":"c3ebef", "ink":"23303c"}
PRESERVED = {
    "kubejs:astral_biomembrane", "kubejs:celestial_lattice_lens",
    "kubejs:iridescent_resonance_chamber", "kubejs:cryogenic_phase_housing",
    "kubejs:stargate_coupling_coil", "kubejs:hydrogen_logic_valve_bank",
    "kubejs:neutron_confinement_ring", "kubejs:omni_calibration_grating",
    "kubejs:omni_alloy_ingot",
}


class Sprite:
    def __init__(self, branch, opaque=False):
        self.palette = PALETTES[branch]
        self.image = Image.new("RGBA", (16, 16), self.color("d") if opaque else (0, 0, 0, 0))
        self.pen = ImageDraw.Draw(self.image)

    def color(self, c):
        if c is None:
            return (0, 0, 0, 0)
        if isinstance(c, tuple):
            return c
        value = self.palette.get(c, METAL.get(c, c)).lstrip("#")
        return tuple(bytes.fromhex(value)) + (255,)

    def rect(self, xy, c):
        self.pen.rectangle(xy, fill=self.color(c))
        return self

    def poly(self, xy, c):
        self.pen.polygon(xy, fill=self.color(c))
        return self

    def line(self, xy, c, width=1):
        self.pen.line(xy, fill=self.color(c), width=width)
        return self

    def dot(self, xy, c):
        self.pen.point(xy, fill=self.color(c))
        return self

    def ellipse(self, xy, c):
        self.pen.ellipse(xy, fill=self.color(c))
        return self

    def ring(self, outer, inner, c="o", fill=None):
        self.ellipse(outer, c).ellipse(inner, fill)
        return self

    def stamp(self, rows, x=0, y=0, colors=None):
        colors = colors or {}
        for dy, row in enumerate(rows):
            for dx, char in enumerate(row):
                if char not in " .":
                    self.dot((x + dx, y + dy), colors.get(char, char))
        return self

    def save(self, assets_root, ident, group="item"):
        ns, name = ident.split(":", 1)
        path = Path(assets_root) / ns / "textures" / group / (name + ".png")
        path.parent.mkdir(parents=True, exist_ok=True)
        self.image.save(path, optimize=False)
        return f"{ns}:{group}/{name}"


def targets(catalog, branches, group="items"):
    return {ident: spec for ident, spec in catalog[group].items()
            if spec["branch"] in branches and ident not in PRESERVED}
