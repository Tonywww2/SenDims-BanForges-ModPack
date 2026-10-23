"""Material-led, hand-plotted 16px sprites for the three organic/magic routes.

The depicted object is the processed workpiece, never its processing machine.
All production pixels are drawn at native size. The enlarged sheet in __main__
is for review only and never supplies pixels to production textures.
"""
from pathlib import Path
from pixel import Sprite, targets


# Material palettes override the old branch-wide purple/green tint. Each uses
# a restrained dark edge and upper-left light; accent colors denote real inlays.
CERAMIC = dict(o="655e50", d="8d8571", s="b9b39b", m="ddd9bf", l="ede9d4", h="fffbe8", a="76834b", b="b8a16b")
WAX = dict(o="775120", d="a46c27", s="c99135", m="e6b648", l="f4cf6a", h="fff0ad", a="d4852b", b="9b753b")
ICE = dict(o="3d5364", d="55758c", s="789eb6", m="a6cbd9", l="d4e7e9", h="f4fcf5", a="83b9c2", b="7978a2")
STONE = dict(o="66625c", d="8f8b7f", s="aaa89a", m="cbc9ba", l="e8e5d6", h="fffbed", a="6ab2b4", b="ab8550")
TERRA = dict(o="354b38", d="4d6844", s="6c8c4c", m="8cae58", l="b4cd7b", h="e6edb8", a="d2b861", b="967638")
ELVEN = dict(o="5c515e", d="8e798b", s="baa0b6", m="dac5cf", l="efe1df", h="fff7e9", a="94bca0", b="c3a15c")
GEM = dict(o="4b496a", d="605888", s="8177ab", m="a398cd", l="ccc3e5", h="f4ecff", a="355b9e", b="537fbc")


def material(s, palette):
    s.palette = palette
    return s


def pore_sheet(s, active=False):
    """The same bowed, perforated membrane survives the two assembly stages."""
    material(s, CERAMIC)
    s.poly([(3,2),(11,2),(13,4),(12,11),(9,14),(2,12),(1,9)], "o")
    s.poly([(3,3),(10,3),(12,4),(11,10),(8,12),(2,11),(2,8)], "m")
    s.poly([(3,3),(10,3),(9,5),(3,6),(2,8)], "l")
    s.poly([(3,11),(8,12),(11,10),(10,12),(9,13),(3,12)], "s")
    s.line([(4,3),(9,3)], "h").line([(2,8),(2,10)], "l")
    # The Titan azotosome feed keeps its cream face and teal laminated edge.
    s.line([(2,10),(3,12),(8,13)], "668e7e")
    s.line([(3,11),(5,12)], "94b4a0")
    for p in [(5,6),(8,5),(10,7),(4,9),(7,9)]:
        s.dot(p, "d")
    if active:
        s.line([(4,5),(6,6),(6,9),(9,10)], "697849")
        s.line([(6,7),(9,6),(10,8)], "8fa665")
        for p in [(4,5),(6,9),(10,8)]: s.dot(p,"d3ad59")


def bio_coagulated(s):
    # Tofu and kelp become a soft fibrous additive sheet, not a cooking pot.
    material(s,CERAMIC)
    s.poly([(2,6),(7,2),(13,3),(14,7),(11,11),(4,13),(1,10)],"o")
    s.poly([(2,6),(7,3),(12,4),(12,7),(10,10),(4,11),(2,9)],"m")
    s.poly([(3,6),(7,4),(11,4),(7,7),(3,8)],"l")
    s.poly([(4,11),(10,10),(13,7),(12,10),(5,13)],"s")
    s.line([(4,6),(6,5),(7,6)],"6c7e4b").line([(7,9),(9,7),(10,7)],"80925c")
    s.dot((3,9),"a").dot((10,5),"h").dot((6,10),"b")


def bio_ground(s):
    # The ceramic membrane has been ground into angular pale particles.
    material(s,CERAMIC)
    s.poly([(1,11),(3,8),(5,8),(6,5),(9,4),(11,7),(13,8),(15,11),(12,13),(4,14)],"o")
    s.poly([(2,11),(5,9),(7,7),(10,6),(11,9),(13,9),(14,11),(11,12),(5,13)],"s")
    s.poly([(3,10),(5,9),(6,11),(4,12)],"l")
    s.poly([(6,8),(8,5),(10,6),(9,9)],"m")
    s.poly([(8,11),(10,9),(12,10),(11,12)],"m")
    s.dot((7,6),"h").dot((4,10),"h").dot((12,10),"l")
    s.rect((2,6,3,7),"m").dot((12,4),"s").dot((1,13),"s")


def bio_cut(s):
    material(s,CERAMIC)
    for x,y in [(1,5),(4,8),(7,11)]:
        s.poly([(x,y),(x+7,y-3),(x+8,y-1),(x+1,y+3),(x,y+2)],"o")
        s.poly([(x+1,y),(x+6,y-2),(x+7,y-1),(x+1,y+1)],"m")
        s.line([(x+1,y),(x+6,y-2)],"h")
        s.line([(x+2,y+1),(x+6,y-1)],"s")


def bio_cured(s):
    # The sliced fibers rejoin into a warm, dry, thin woven bio-composite mat.
    material(s,CERAMIC)
    s.poly([(2,5),(11,2),(14,5),(13,10),(4,14),(1,11)],"817046")
    s.poly([(3,5),(10,3),(13,5),(12,9),(4,12),(2,10)],"c5ad72")
    s.poly([(3,5),(10,3),(12,5),(4,8),(2,9)],"e4d09a")
    s.line([(4,7),(11,4)],"f6e4b5").line([(4,10),(12,7)],"ead9a0")
    s.line([(5,5),(8,10)],"ad925d").line([(8,4),(11,8)],"b59c65")
    s.line([(3,11),(6,12),(12,9)],"9c8554")


def bio_wax_lattice(s):
    material(s,WAX)
    s.poly([(3,2),(11,2),(14,5),(13,11),(9,14),(2,12),(1,6)],"o")
    s.poly([(3,3),(10,3),(13,5),(12,10),(9,13),(3,11),(2,6)],"m")
    s.line([(3,3),(10,3),(12,5)],"h")
    # Open hexagonal wells cut all the way through the thin wax sheet.
    for x,y in [(4,5),(9,6),(6,10)]:
        s.poly([(x,y-1),(x+2,y),(x+2,y+1),(x,y+2),(x-1,y+1),(x-1,y)],"d")
        s.poly([(x,y),(x+1,y),(x+1,y+1),(x,y+1)],None)
        s.dot((x-1,y),"l")
    s.line([(4,12),(9,13),(12,10)],"s")


def bio_wax_pellets(s):
    material(s,WAX)
    for x,y in [(3,7),(8,4),(9,10)]:
        s.poly([(x,y-2),(x+3,y-2),(x+5,y),(x+4,y+3),(x+1,y+4),(x-1,y+2)],"o")
        s.poly([(x,y-1),(x+3,y-1),(x+4,y),(x+3,y+2),(x+1,y+3),(x,y+2)],"m")
        s.line([(x,y),(x+1,y-1),(x+2,y-1)],"h")
        s.line([(x+1,y+3),(x+3,y+2)],"s")


def bio_honey_cartridge(s):
    # Honey filling seals the wax pellet into a nutrient blister, no fake vial.
    material(s,WAX)
    s.poly([(2,6),(5,2),(11,2),(14,6),(13,11),(10,14),(4,13),(1,10)],"o")
    s.poly([(3,6),(5,3),(10,3),(13,6),(12,10),(10,12),(4,12),(2,9)],"s")
    s.poly([(5,4),(10,4),(12,7),(10,11),(5,11),(3,8)],"a")
    s.poly([(5,4),(10,4),(11,6),(7,7),(4,7)],"m")
    s.line([(5,4),(9,4)],"h").line([(4,6),(4,8)],"l")
    s.line([(5,11),(9,11),(11,9)],"d").dot((8,9),"l")
    s.line([(3,11),(5,12),(10,12)],"l")


def bio_comb(s):
    material(s,WAX)
    s.poly([(3,3),(9,1),(13,3),(14,8),(11,12),(5,14),(1,11),(1,7)],"o")
    s.poly([(4,3),(9,2),(12,4),(13,8),(10,11),(5,13),(2,10),(2,7)],"m")
    for x,y in [(4,6),(9,5),(7,10)]:
        s.poly([(x,y-1),(x+2,y-1),(x+3,y+1),(x+1,y+3),(x-1,y+1)],"d")
        s.poly([(x,y),(x+1,y),(x+2,y+1),(x+1,y+2),(x,y+1)],"a")
        s.dot((x,y),"h")
    s.line([(2,9),(3,11),(5,12)],"9ca76a").dot((11,10),"bdc778")


def optical_plate(s, stage):
    """A recognisable ice-alloy slab is refined and then frost-stabilised."""
    material(s,ICE)
    s.poly([(3,3),(10,1),(13,4),(13,11),(6,14),(2,11),(1,6)],"o")
    s.poly([(3,4),(10,2),(12,4),(11,9),(6,12),(2,10),(2,6)],"m")
    s.poly([(3,4),(10,2),(11,4),(6,7),(2,8)],"l")
    s.poly([(6,8),(12,5),(12,10),(6,13)],"s")
    s.line([(3,4),(9,2)],"h").line([(3,9),(5,11)],"l")
    if stage==0:
        # A machined cryo-alloy carrier encloses the star-crystal rough.
        s.poly([(8,9),(12,6),(12,10),(6,13)],"8f8b7f")
        s.line([(7,11),(11,8)],"b9b6a5")
        s.poly([(4,5),(7,3),(8,5),(6,9),(3,9)],"7892a7")
        s.line([(5,5),(6,4),(6,7)],"bedfe5")
        s.dot((5,8),"af9bca")
        s.dot((1,12),"s").dot((13,13),"m")
    elif stage==1:
        s.line([(4,6),(8,4),(10,5)],"d7bf78")
        s.line([(4,7),(7,8),(10,6)],"ac8d56")
        s.dot((6,5),"fff0ae")
    else:
        s.line([(4,6),(7,5),(9,3)],"h").line([(7,5),(8,8),(10,9)],"l")
        s.line([(4,10),(7,9),(9,7),(11,7)],"h")
        s.dot((3,5),"f4fcf5").dot((10,10),"d4e7e9")


def lens(s, stage):
    material(s,ICE)
    # Bevelled near-circular optical blank; processing preserves its geometry.
    s.poly([(5,1),(10,1),(14,5),(14,10),(10,14),(5,14),(1,10),(1,5)],"o")
    s.poly([(5,2),(10,2),(13,5),(13,9),(9,13),(5,13),(2,10),(2,5)],"s")
    s.poly([(5,3),(9,3),(12,6),(11,9),(8,12),(5,11),(3,8),(3,5)],"m")
    s.poly([(5,3),(9,3),(10,4),(4,10),(3,8),(3,5)],"l")
    s.line([(5,3),(8,3)],"h").line([(3,5),(3,7)],"h")
    s.line([(7,11),(10,8)],"a").line([(8,13),(12,9)],"d")
    if stage>=1:
        # Golden amber bonding around the same blank, bio-crystal adhesion.
        s.line([(5,2),(9,2),(12,5)],"ceb06b").line([(3,10),(5,12),(9,12)],"ad894f")
        s.dot((11,4),"a6c790").dot((5,11),"cce0b5")
    if stage==2:
        s.poly([(7,6),(11,6),(11,9),(8,12),(5,11),(4,9)],"9d8bb8")
        s.line([(5,9),(8,6),(10,6)],"c8bddb")
        s.line([(8,11),(10,9)],"73658e")
    if stage==3:
        s.poly([(7,8),(11,4),(12,6),(8,11),(6,11)],"c4bbde")
        s.line([(5,10),(10,5)],"e5e0ee")
        for p in [(3,5),(6,2),(12,7),(10,12),(3,10)]:
            s.dot(p,"bd93cd")
        s.dot((6,2),"efd3ef").dot((3,5),"e2eab0")


def aether_infused(s):
    # The infused veridium carrier contributes a green metal contact foil.
    material(s,TERRA)
    s.poly([(2,7),(9,1),(13,3),(13,8),(6,14),(1,11)],"o")
    s.poly([(3,7),(9,2),(12,4),(11,8),(6,12),(2,10)],"m")
    s.poly([(3,7),(9,2),(11,3),(5,9),(2,10)],"l")
    s.line([(4,7),(9,3)],"h")
    s.line([(5,11),(10,6)],"4e826e").line([(7,11),(12,6)],"65b49a")
    s.line([(2,11),(5,13),(7,11)],"a")
    s.dot((10,5),"c9ead7").dot((11,7),"8ccec0")


def wall(s, stage):
    """A U-section resonator lining, from livingrock to terrasteel/elven metal."""
    material(s,STONE if stage<4 else TERRA if stage in (4,6,7,8) else ELVEN)
    s.poly([(2,2),(5,1),(6,3),(6,9),(9,9),(9,3),(10,1),(13,2),(14,11),(11,14),(4,14),(1,11)],"o")
    s.poly([(3,3),(4,2),(5,3),(5,10),(10,10),(10,3),(11,2),(12,3),(13,10),(10,13),(4,13),(2,10)],"m")
    s.line([(3,3),(3,9),(4,11),(10,11)],"l")
    s.line([(4,3),(4,7)],"h").line([(5,13),(10,13),(12,11)],"s")
    if stage==0:
        for p,c in [((3,5),"79b1a9"),((11,5),"bd8070"),((4,12),"bca160"),((10,12),"8c86af")]:s.dot(p,c)
    if stage==1:
        s.line([(4,8),(4,10),(6,12),(10,12)],"bf7990")
        s.dot((4,9),"e0a8b8").dot((8,12),"ddb868").dot((11,8),"c588ae")
    if stage>=2:
        s.line([(4,4),(4,8)],"72bfc7").line([(5,12),(9,12)],"6d9fae")
        s.dot((11,5),"b3e4e3")
    if stage>=3:
        s.line([(3,6),(4,5),(4,7),(3,8)],"487f8f")
        s.line([(10,7),(11,6),(11,8)],"598e9c")
        s.dot((7,11),"b0e4db")
    if stage>=4:
        s.line([(2,9),(3,11),(5,12),(10,12),(12,10)],"a")
        s.dot((3,3),"e9d792").dot((11,3),"d4c47d")
    if stage==5:
        s.line([(3,4),(4,6),(3,9)],"d8b1c5")
        s.line([(11,4),(12,8),(10,11)],"a3c8a4")
    if stage>=6:
        s.line([(5,12),(6,11),(7,12),(8,11),(9,12)],"e0d385")
        s.rect((2,7,3,8),"d6c06b").rect((11,7,12,8),"b49a4f")
    if stage>=7:
        s.rect((1,9,3,11),"o").rect((2,9,3,10),"s")
        s.rect((12,9,14,11),"o").rect((12,9,13,10),"a")
        s.line([(5,14),(10,14)],"b")
    if stage==8:
        s.poly([(7,5),(9,7),(8,10),(6,10),(5,7)],"5f4e7b")
        s.poly([(7,6),(8,7),(7,9),(6,7)],"c6a1dd")
        s.dot((7,6),"f1d9f7").dot((4,2),"b49fd5")


def mana_brew(s):
    # This one actually consumes a full Botania absorption brew carrier.
    material(s,ICE)
    s.rect((6,1,9,2),"87704c").rect((6,1,8,1),"c4a977")
    s.poly([(5,3),(10,3),(10,5),(13,8),(13,12),(10,14),(5,14),(2,11),(2,8),(5,5)],"o")
    s.poly([(6,3),(9,3),(9,6),(12,8),(12,11),(9,13),(5,13),(3,11),(3,8),(6,5)],"m")
    s.poly([(4,8),(11,8),(11,11),(9,12),(5,12),(4,10)],"d2af58")
    s.line([(4,8),(10,8)],"f2da83").line([(4,9),(4,10)],"fff1b1")
    s.line([(4,6),(3,8),(3,10)],"h").dot((8,10),"edce70")
    s.line([(6,4),(6,5)],"h")


def gem_workpiece(s, stage):
    # Lapis + amethyst become an engraved resonance inlay, not an invented book.
    material(s,GEM)
    s.poly([(4,2),(9,1),(13,4),(12,10),(7,14),(2,11),(1,6)],"o")
    s.poly([(4,3),(9,2),(12,4),(10,8),(6,11),(2,9),(2,6)],"m")
    s.poly([(4,3),(9,2),(10,4),(5,8),(2,7)],"l")
    s.poly([(7,9),(12,5),(11,10),(7,13),(3,11)],"a")
    s.line([(4,3),(8,2)],"h").line([(8,11),(10,9)],"b")
    if stage:
        s.line([(5,5),(8,4),(8,6),(5,8),(8,9),(9,7)],"edd89b")
        s.dot((5,5),"fff4c6").dot((6,11),"b6b7df")
    else:
        s.line([(4,5),(5,7),(4,10)],"s").dot((8,11),"d4b963")


def mana_dust_blank(s):
    material(s,GEM)
    s.poly([(2,5),(7,2),(12,4),(14,9),(10,13),(4,14),(1,10)],"o")
    s.poly([(3,5),(7,3),(11,5),(12,9),(9,12),(4,12),(2,9)],"s")
    s.poly([(3,5),(7,3),(10,5),(6,8),(2,9)],"m")
    s.poly([(7,5),(8,3),(10,5),(9,8),(7,9)],"l")
    for p in [(4,6),(4,10),(10,9),(8,11),(3,8)]:s.dot(p,"d4b694")
    s.dot((8,4),"h")


def mana_salvage(s):
    material(s,GEM)
    for pts,hi in [([(2,4),(6,2),(8,4),(6,8),(2,9),(1,7)],[(3,4),(5,3),(4,6)]),
                   ([(9,6),(13,5),(14,8),(12,12),(8,13),(7,10)],[(10,7),(12,6),(11,9)])]:
        s.poly(pts,"o")
        s.poly([(x+1 if x<7 else x,y) for x,y in pts[1:-1]],"m")
        s.line(hi,"l")
    for p,c in [((3,12),"s"),((5,11),"l"),((5,14),"m"),((13,14),"s"),((9,3),"b"),((1,11),"d")]:
        s.dot(p,c)
    s.dot((4,5),"h").dot((11,8),"h")


# Tileable material surfaces. The drawing occupies the face itself, without
# the one-pixel UI border or central framed pictograms of the previous version.
def tile(s,palette):
    material(s,palette)
    s.rect((0,0,15,15),"m")


def close_seams(s):
    # Edge pixels are explicitly plotted copies, no scaling/filtering involved.
    # Adjacent repeated blocks have exactly matching boundary colors.
    for y in range(15):s.dot((15,y),s.image.getpixel((0,y)))
    for x in range(16):s.dot((x,15),s.image.getpixel((x,0)))


def tofu_tile(s,stage):
    tile(s,CERAMIC)
    s.poly([(0,2),(5,1),(8,4),(6,8),(0,9)],"l")
    s.poly([(8,0),(14,1),(15,5),(11,7),(7,4)],"s")
    s.poly([(3,11),(8,8),(12,10),(13,15),(5,15)],"l")
    for x,y in [(2,4),(5,6),(10,3),(12,8),(4,12),(8,11),(13,13)]:
        s.dot((x,y),"s").dot((x+1,y),"m")
    s.line([(1,10),(3,9),(7,10)],"b")
    if not stage:
        # Star-slurry culture leaves faint cyan/purple fibers in the curd.
        s.line([(2,5),(4,6),(5,5)],"8fae9d")
        s.dot((9,10),"b7a6bd").dot((11,12),"9eb6a8")
    if stage:
        for x,y in [(2,2),(8,5),(4,10),(11,11)]:
            s.poly([(x,y),(x+3,y),(x+4,y+2),(x+2,y+4),(x,y+3)],"cda14c")
            s.line([(x+1,y+1),(x+3,y+1)],"efd17d")
            if stage==2:
                s.poly([(x+1,y+1),(x+2,y+1),(x+3,y+2),(x+2,y+3),(x+1,y+2)],"95682b")
                s.dot((x+1,y+1),"e5b852")
    close_seams(s)


def holystone_tile(s,stage):
    # Chalk-grey holystone with amethyst flecks -> amber-treated pores.
    tile(s,STONE)
    s.poly([(0,3),(4,1),(7,3),(5,7),(1,8),(0,6)],"s")
    s.poly([(8,0),(14,2),(15,6),(10,5),(7,3)],"l")
    s.poly([(7,8),(12,7),(15,10),(12,14),(7,13),(5,10)],"s")
    s.line([(1,11),(4,10),(5,12),(3,14)],"l")
    s.dot((8,6),"d").dot((12,4),"h").dot((2,4),"d")
    for x,y in [(3,3),(10,9),(6,13)]:
        s.poly([(x,y),(x+2,y-1),(x+2,y+1),(x,y+2)],"b7a2c7" if not stage else "d6b957")
        s.dot((x,y),"dbd0e3" if not stage else "f5e59e")
    if stage:
        s.line([(3,7),(6,6),(8,7)],"bba06a")
    close_seams(s)


def crystal_tile(s,stage):
    tile(s,ICE)
    # Broad cleavage planes rather than a small gem icon in a square frame.
    s.poly([(0,4),(6,0),(11,0),(6,6),(0,10)],"l")
    s.poly([(8,5),(15,1),(15,8),(11,12),(6,13)],"s")
    s.poly([(0,12),(6,7),(9,9),(4,15),(0,15)],"a")
    s.line([(0,5),(6,1)],"h").line([(6,13),(12,7),(15,7)],"d")
    if stage==0:  # blue Swet gel fills pores before freezing
        s.poly([(2,7),(4,5),(7,6),(8,10),(5,13),(2,11)],"83a9c7")
        s.line([(3,7),(5,6)],"d6ebed").dot((5,10),"638aa9")
    elif stage==1:  # ice-stone cold front follows the grain
        s.line([(2,12),(5,9),(7,5),(11,2)],"h")
        s.line([(5,9),(2,7)],"l").line([(7,5),(7,2)],"h")
        s.dot((11,11),"l")
    elif stage==2:  # second, finer cold lattice from the accessory
        s.line([(1,9),(5,5),(9,1)],"h").line([(5,13),(9,9),(13,5)],"l")
        s.line([(2,4),(6,8),(10,12)],"l")
        s.line([(8,3),(12,7)],"h")
    else:  # ultracold biome stabilises a densely frosted crystal face
        s.poly([(0,2),(5,0),(8,0),(3,5),(0,7)],"h")
        s.poly([(7,7),(11,5),(13,7),(9,11),(5,12)],"l")
        s.line([(1,11),(4,9),(5,6)],"h").line([(9,13),(12,10),(14,10)],"h")
        s.dot((3,8),"l").dot((12,3),"h")
    close_seams(s)


def spore_tile(s,active):
    tile(s,STONE)
    s.poly([(0,3),(6,0),(9,3),(5,8),(0,7)],"l")
    s.poly([(7,7),(14,5),(15,9),(10,14),(5,13)],"s")
    s.line([(2,0),(3,5),(2,10),(4,15)],"988d99")
    s.line([(10,0),(9,5),(12,9),(11,15)],"aaa0ad")
    if active:
        s.line([(3,4),(6,6),(8,5),(11,7)],"766476")
        s.line([(6,6),(5,10),(7,12)],"806a83")
        s.line([(5,10),(2,12)],"a18aaa")
        for p in [(3,4),(8,5),(11,7),(7,12)]:s.dot(p,"b59ec1")
    else:
        s.rect((3,5,4,6),"bba3c9").rect((9,10,10,11),"a98ebd")
        s.dot((3,5),"dbcae3").dot((9,10),"c7b0d5")
    close_seams(s)


def gold_optic_tile(s,stage):
    tile(s,ICE)
    s.poly([(0,2),(7,0),(10,3),(5,8),(0,7)],"l")
    s.poly([(8,8),(15,3),(15,11),(10,15),(5,14)],"s")
    s.line([(0,12),(5,8),(10,9),(14,6)],"d")
    if stage>=1:
        s.line([(0,5),(4,7),(7,5),(10,5),(15,8)],"b99d50",2)
        s.line([(1,5),(4,6),(7,4),(10,4)],"e8cf7b")
        s.line([(7,7),(6,11),(8,15)],"cfb369")
    if stage>=2:
        s.line([(2,12),(5,10),(8,12),(12,11)],"8a988c")
        for x,y in [(2,12),(5,10),(8,12),(12,11)]:
            s.dot((x,y),"d7e79f").dot((x,y-1),"f3f4c7")
    if stage==3:
        # Horn treatment opens connected cleavage channels through the slab.
        s.line([(1,1),(3,4),(2,7),(5,10),(4,14)],"596d78")
        s.line([(9,0),(10,3),(9,7),(12,9),(13,14)],"657b85")
        s.line([(3,7),(8,6),(10,7)],"d4e7e9")
    close_seams(s)


def mana_stone_tile(s,stage):
    tile(s,STONE)
    if stage==0:
        # Livingwood framing and white mineral binder surround the S5 inlays.
        s.poly([(0,0),(4,0),(5,5),(3,10),(4,15),(0,15)],"846345")
        s.line([(1,0),(2,5),(1,10),(2,15)],"b18a59")
        s.poly([(10,0),(15,0),(15,15),(12,15),(11,10),(13,5)],"6c523e")
        s.line([(13,1),(14,5),(12,10),(13,14)],"a07a4f")
        s.line([(5,8),(8,5),(11,7)],"86b3b8")
        s.dot((6,7),"a8d3da").dot((8,6),"bca2cc").dot((10,7),"d7bb83")
    else:
        # White Daisy cleanses the wood/mineral bed into livingrock itself.
        s.poly([(0,2),(6,0),(9,3),(6,7),(0,8)],"l")
        s.poly([(8,7),(13,4),(15,8),(12,13),(8,15),(6,11)],"s")
        s.poly([(0,11),(4,9),(6,12),(4,15),(0,15)],"l")
        s.line([(1,4),(5,3),(6,4)],"h").line([(10,9),(12,8)],"m")
        if stage>=2:
            s.line([(1,10),(4,8),(6,9),(7,6),(10,4),(14,5)],"85988a")
            s.line([(3,9),(5,8),(7,8)],"b0be9a")
            s.dot((10,4),"d0c787")
        if stage>=3:
            s.line([(0,3),(4,5),(7,4),(10,7),(14,8)],"b0775e")
            s.line([(2,4),(4,4),(6,3)],"dba879")
            s.dot((11,7),"e7b985")
        if stage==4:
            s.line([(0,12),(4,10),(7,11),(10,9),(15,11)],"a69bb1",2)
            s.line([(0,11),(4,9),(7,10),(10,8),(15,10)],"d3c4d6")
            s.line([(5,0),(6,3),(5,6)],"aaa3bd")
    close_seams(s)


ITEM_DRAWINGS = {
    "omni_bio_03":bio_coagulated,
    "omni_bio_assembly_1":lambda s:pore_sheet(s),
    "omni_bio_07":bio_ground,
    "omni_bio_08":bio_cut,
    "omni_bio_09":bio_cured,
    "omni_bio_assembly_2":lambda s:pore_sheet(s,True),
    "omni_bio_14":bio_wax_lattice,
    "omni_bio_15":bio_wax_pellets,
    "omni_bio_16":bio_honey_cartridge,
    "omni_bio_15_precursor":bio_comb,
    "omni_aether_feed":lambda s:optical_plate(s,0),
    "omni_aether_01":lambda s:optical_plate(s,1),
    "omni_aether_02":lambda s:optical_plate(s,2),
    "omni_aether_assembly_1":lambda s:lens(s,0),
    "omni_aether_10":lambda s:lens(s,1),
    "omni_aether_11":lambda s:lens(s,2),
    "omni_aether_08":aether_infused,
    "omni_aether_assembly_2":lambda s:lens(s,3),
    "omni_mana_assembly_1":lambda s:wall(s,0),
    "omni_mana_05":lambda s:wall(s,1),
    "omni_mana_06":lambda s:wall(s,2),
    "omni_mana_07":lambda s:wall(s,3),
    "omni_mana_08":lambda s:wall(s,4),
    "omni_mana_09":lambda s:wall(s,5),
    "omni_mana_assembly_2":lambda s:wall(s,6),
    "omni_mana_14":lambda s:wall(s,7),
    "omni_mana_15":lambda s:wall(s,8),
    "omni_mana_10":mana_brew,
    "omni_mana_11":lambda s:gem_workpiece(s,1),
    "omni_mana_12":mana_salvage,
    "omni_mana_11_precursor":lambda s:gem_workpiece(s,0),
    "omni_mana_12_precursor":mana_dust_blank,
}
BLOCK_DRAWINGS = {
    "omni_bio_01_block":lambda s:tofu_tile(s,0),
    "omni_bio_13_precursor":lambda s:tofu_tile(s,1),
    "omni_bio_13_block":lambda s:tofu_tile(s,2),
    "omni_aether_03_precursor":lambda s:holystone_tile(s,0),
    "omni_aether_03_block":lambda s:holystone_tile(s,1),
    "omni_aether_04_block":lambda s:crystal_tile(s,0),
    "omni_aether_05_block":lambda s:crystal_tile(s,1),
    "omni_aether_06_block":lambda s:crystal_tile(s,2),
    "omni_aether_07_block":lambda s:crystal_tile(s,3),
    "omni_aether_09_precursor":lambda s:spore_tile(s,False),
    "omni_aether_09_block":lambda s:spore_tile(s,True),
    "omni_aether_12_precursor":lambda s:gold_optic_tile(s,0),
    "omni_aether_12_block":lambda s:gold_optic_tile(s,1),
    "omni_aether_13_block":lambda s:gold_optic_tile(s,2),
    "omni_aether_14_block":lambda s:gold_optic_tile(s,3),
    "omni_mana_feed":lambda s:mana_stone_tile(s,0),
    "omni_mana_01_block":lambda s:mana_stone_tile(s,1),
    "omni_mana_02_block":lambda s:mana_stone_tile(s,2),
    "omni_mana_03_block":lambda s:mana_stone_tile(s,3),
    "omni_mana_04_block":lambda s:mana_stone_tile(s,4),
}


def draw(catalog,assets_root):
    result={"items":{},"blocks":{}}
    for group,drawings in [("items",ITEM_DRAWINGS),("blocks",BLOCK_DRAWINGS)]:
        wanted=targets(catalog,("bio","aether","mana"),group)
        assert {i.split(":",1)[1] for i in wanted}==set(drawings)
        for ident,spec in wanted.items():
            sprite=Sprite(spec["branch"],opaque=group=="blocks")
            drawings[ident.split(":",1)[1]](sprite)
            result[group][ident]=sprite.save(assets_root,ident,"block" if group=="blocks" else "item")
    return result


if __name__=="__main__":
    import json
    from PIL import Image,ImageDraw,ImageFont
    root=Path(__file__).resolve().parents[3]
    import sys
    sys.path.insert(0,str(root/"docs/tools"))
    from omni_alloy_sources import read_catalog
    catalog=read_catalog()["registrations"]
    cache=root/"docs/archive/cache/omni_alloy/redraw-organic"
    outputs=draw(catalog,cache/"assets")
    entries=[(g,i,r) for g in outputs for i,r in outputs[g].items()]
    cols,w,h=8,170,144
    sheet=Image.new("RGB",(cols*w,((len(entries)+cols-1)//cols)*h),"#272c32")
    pen=ImageDraw.Draw(sheet)
    font=ImageFont.truetype("C:/Windows/Fonts/msyh.ttc",12)
    for n,(group,ident,res) in enumerate(entries):
        ns,asset=res.split(":",1)
        im=Image.open(cache/"assets"/ns/"textures"/(asset+".png"))
        x,y=(n%cols)*w+37,(n//cols)*h+6
        enlarged=im.resize((96,96),Image.Resampling.NEAREST)
        sheet.paste(enlarged,(x,y),enlarged)
        pen.text((x-30,y+99),catalog[group][ident]["name"],font=font,fill="white")
        pen.text((x-30,y+117),ident.split(":",1)[1].replace("omni_",""),font=font,fill="#a5b3bd")
    sheet.save(cache/"preview.png")
    print({g:len(v) for g,v in outputs.items()},cache/"preview.png")
